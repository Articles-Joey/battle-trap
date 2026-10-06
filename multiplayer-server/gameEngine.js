import { createLocalGame, getAvailableMoves, recordLocalMove, resolveLocalTurn } from './gameBoard.js';
import { pickBestMove, pickMode } from './botLogic.js';

export function resetBoard(game) {
    const state = createLocalGame({ localGameState: game, players: game.players }, game.players, game.boardSize);
    Object.assign(game, state.localGameState, {
        players: state.players, currentTurn: 0, currentRoll: false, currentMoveCount: 0,
        gameStarted: false, status: 'In Lobby', deadline: null, nextBotAt: null,
        botMode: null,
    });
}

function applyUpdates(game, updates, now = Date.now()) {
    if (updates.localGameState) Object.assign(game, updates.localGameState);
    for (const key of ['players', 'currentTurn', 'currentRoll', 'currentMoveCount']) {
        if (key in updates) game[key] = updates[key];
    }
    if (game.currentRoll === false) {
        game.deadline = null;
        game.botMode = null;
    }
    if (game.gameOver) game.status = 'Finished';
    game.nextBotAt = now + (game.currentRoll === false ? 600 : 800);
}

const engineState = (game) => ({ ...game, localGameState: game });

export function resolveGame(game, endTurn = false, now = Date.now()) {
    if (game.status !== 'In Progress') return false;
    const updates = resolveLocalTurn(engineState(game), endTurn);
    if (!Object.keys(updates).length) return false;
    applyUpdates(game, updates, now);
    return true;
}

export function startGame(game) {
    resetBoard(game);
    game.gameStarted = true;
    game.status = 'In Progress';
    game.nextBotAt = Date.now() + 600;
}

export function rollDice(game, playerId, now = Date.now()) {
    if (game.status !== 'In Progress' || game.gameOver || game.currentRoll !== false) return false;
    const player = game.players[game.currentTurn];
    if (player?.id !== playerId || player.battleTrap.dead) return false;
    game.currentRoll = Math.floor(Math.random() * 10) + 1;
    game.currentMoveCount = 0;
    game.moveTimer = game.moveTime === false ? null : game.moveTime;
    game.deadline = game.moveTime === false ? null : now + game.moveTime * 1000;
    game.botMode = player.battleTrap.bot ? pickMode(player.battleTrap.difficulty) : null;
    game.nextBotAt = now + 800;
    return true;
}

export function movePlayer(game, playerId, x, y, now = Date.now()) {
    if (game.status !== 'In Progress' || game.gameOver || game.currentRoll === false || game.currentMoveCount >= game.currentRoll) return false;
    const player = game.players[game.currentTurn];
    if (player?.id !== playerId || player.battleTrap.dead) return false;
    if (!Number.isInteger(x) || !Number.isInteger(y)) return false;
    if (!getAvailableMoves(game.boardSize, game.spaces.flat(), player.battleTrap).some((s) => s.x === x && s.y === y)) return false;
    applyUpdates(game, recordLocalMove(engineState(game), { x, y }, player.battleTrap.color), now);
    return true;
}

export function tickGame(game, now = Date.now()) {
    if (game.status !== 'In Progress') return false;
    let changed = resolveGame(game, false, now);
    if (game.status !== 'In Progress') return changed;
    if (game.deadline !== null) {
        if (now >= game.deadline) return resolveGame(game, true, now) || changed;
        const remaining = Math.ceil((game.deadline - now) / 1000);
        if (remaining !== game.moveTimer) { game.moveTimer = remaining; changed = true; }
    }
    const player = game.players[game.currentTurn];
    if (!player?.battleTrap.bot || now < game.nextBotAt) return changed;
    if (game.currentRoll === false) return rollDice(game, player.id, now) || changed;
    const bot = player.battleTrap;
    const direction = pickBestMove({
        botX: bot.x, botY: bot.y, botColor: bot.color,
        boardSize: game.boardSize, flatSpaces: game.spaces.flat(), players: game.players,
        mode: game.botMode, movesLeftAfter: game.currentRoll - game.currentMoveCount - 1,
    });
    if (direction) return movePlayer(game, player.id, bot.x + direction.x, bot.y + direction.y, now) || changed;
    return resolveGame(game, false, now) || changed;
}
