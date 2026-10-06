import emitRoomsList from '#root/util/emitRoomsList.js';
import { movePlayer, resetBoard, resolveGame, rollDice, startGame } from './gameEngine.js';
import { configureRoom, createRoom, humanPlayer, LANDING_ROOM, removePlayer, ROOM_PREFIX, roomName, validRoomId } from './roomState.js';
import { getRuntime } from './runtime.js';

export default function battleTrap(io, socket, app) {
    const runtime = getRuntime(io, app);
    const fail = (message, ack) => {
        if (typeof ack === 'function') ack({ ok: false, error: message });
        else socket.emit('game:battle-trap:error', { message });
    };
    const success = (ack) => { if (typeof ack === 'function') ack({ ok: true }); };
    const getGame = (data) => {
        const id = String(data?.server ?? data?.game_id ?? '');
        if (socket.data.battleTrap?.game_id !== id) return null;
        const game = runtime.find(id);
        return game?.players.some((p) => p.id === socket.id && !p.battleTrap.disconnected) ? game : null;
    };
    const publish = (game) => { runtime.publish(game); runtime.publishLanding(); };
    const leaveGame = () => {
        const id = socket.data.battleTrap?.game_id;
        if (!id) return;
        const game = runtime.find(id);
        delete socket.data.battleTrap;
        socket.leave(roomName(id));
        if (game) {
            removePlayer(game, socket.id);
            if (!game.players.some((p) => !p.battleTrap.bot && !p.battleTrap.disconnected)) {
                runtime.state.games.splice(runtime.state.games.indexOf(game), 1);
            } else runtime.publish(game);
        }
        runtime.publishLanding();
        emitRoomsList(io);
    };

    socket.on('join-room', async (room, settings = {}, ack) => {
        if (typeof room !== 'string') return;
        if (room === LANDING_ROOM) {
            await socket.join(room);
            if (!socket.connected) return;
            runtime.landingSockets.add(socket.id);
            runtime.wake();
            runtime.publishLanding();
            return;
        }
        if (!room.startsWith(ROOM_PREFIX)) return;
        const id = room.slice(ROOM_PREFIX.length);
        if (!validRoomId(id) || (settings?.game_id != null && String(settings.game_id) !== id)) return fail('Invalid room.', ack);
        if (socket.data.battleTrap?.game_id === id) {
            const existing = runtime.find(id);
            if (existing) runtime.publish(existing);
            return success(ack);
        }
        let game = runtime.find(id);
        if (game && (game.status !== 'In Lobby' || game.players.length >= 4)) {
            // Another application-level join listener may also have joined this room.
            socket.leave(room);
            return fail(game.status !== 'In Lobby' ? 'This game has already started.' : 'This room is full.', ack);
        }
        leaveGame();
        if (!game) {
            game = createRoom(id);
            runtime.state.games.push(game);
        }
        // Reserve the slot and leader synchronously before joining the adapter.
        game.players.push(humanPlayer(socket, settings));
        game.leaderId ??= socket.id;
        socket.data.battleTrap = { game_id: id };
        resetBoard(game);
        try {
            await socket.join(room);
            if (!socket.connected || socket.data.battleTrap?.game_id !== id || runtime.find(id) !== game) {
                if (socket.data.battleTrap?.game_id !== id) socket.leave(room);
                return;
            }
            runtime.wake();
            publish(game);
            emitRoomsList(io);
            success(ack);
        } catch {
            if (socket.data.battleTrap?.game_id === id) leaveGame();
            fail('Unable to join the room. Please try again.', ack);
        }
    });

    socket.on('game:battle-trap:configure', (data, ack) => {
        const game = getGame(data);
        if (!game || game.leaderId !== socket.id || game.status !== 'In Lobby') return fail('Only the room leader can edit setup before the game starts.', ack);
        const error = configureRoom(game, data.config);
        if (error) return fail(error, ack);
        publish(game);
        success(ack);
    });

    socket.on('game:battle-trap:start-game', (data, ack) => {
        const game = getGame(data);
        if (!game || game.leaderId !== socket.id || game.status !== 'In Lobby') return fail('Only the room leader can start a lobby game.', ack);
        if (game.players.length < 2) return fail('Add a bot or wait for another player before starting.', ack);
        startGame(game);
        publish(game);
        success(ack);
    });

    socket.on('game:battle-trap:restart', (data, ack) => {
        const game = getGame(data);
        if (!game || game.leaderId !== socket.id || !game.gameOver) return fail('Only the room leader can reopen a finished game.', ack);
        game.players = game.players.filter((p) => !p.battleTrap.disconnected);
        resetBoard(game);
        publish(game);
        success(ack);
    });

    const action = (data, ack, perform) => {
        const game = getGame(data);
        if (!game || game.status !== 'In Progress') return fail('Join an active game first.', ack);
        // A delayed packet must never consume the next player's turn.
        if (game.deadline !== null && Date.now() >= game.deadline) {
            resolveGame(game, true);
            publish(game);
            return fail('Your turn has expired.', ack);
        }
        if (!perform(game)) return fail('That action is not allowed on this turn.', ack);
        publish(game);
        success(ack);
    };
    socket.on('game:battle-trap:roll-dice', (data, ack) => action(data, ack, (game) => rollDice(game, socket.id)));
    socket.on('game:battle-trap-move', (data, ack) => action(data, ack, (game) => movePlayer(game, socket.id, data?.x, data?.y)));

    socket.on('leave-room', (room) => {
        if (room === LANDING_ROOM) {
            runtime.landingSockets.delete(socket.id);
            socket.leave(room);
        }
        if (room === roomName(socket.data.battleTrap?.game_id)) leaveGame();
    });
    socket.on('disconnecting', () => {
        runtime.landingSockets.delete(socket.id);
        leaveGame();
    });
}
