import { tickGame } from './gameEngine.js';
import { LANDING_ROOM, publicGame, roomName } from './roomState.js';
import { logActivity } from './logActivity.js';

const runtimes = new WeakMap();

export function getRuntime(io, app) {
    if (runtimes.has(app)) return runtimes.get(app);
    const state = { games: [] };
    app.set('battleTrapGlobalState', state);
    let interval = null;
    let lastLandingAt = 0;
    let lastActivityLogAt = 0;
    const landingSockets = new Set();
    const runtime = {
        state, landingSockets,
        find: (id) => state.games.find((game) => game.server_id === String(id)),
        publish(game) {
            game.revision++;
            io.to(roomName(game.server_id)).emit(roomName(game.server_id), {
                players: game.players, game_state: publicGame(game),
            });
        },
        publishLanding() {
            io.to(LANDING_ROOM).emit('game:battle-trap-landing-details', {
                players: [...landingSockets].map((id) => ({ id })),
                games: state.games.map((game) => ({
                    server_id: game.server_id, status: game.status, boardSize: game.boardSize,
                    players: game.players.filter((p) => !p.battleTrap.disconnected).map((p) => ({ id: p.id, battleTrap: { bot: p.battleTrap.bot } })),
                })),
            });
        },
        wake() {
            if (interval) return;
            lastActivityLogAt = Date.now();
            interval = setInterval(() => {
                const now = Date.now();
                for (const game of state.games) {
                    if (tickGame(game, now)) runtime.publish(game);
                }
                if (landingSockets.size && now - lastLandingAt >= 1000) {
                    runtime.publishLanding();
                    lastLandingAt = now;
                }
                if (now - lastActivityLogAt >= 10000) {
                    logActivity(state.games, landingSockets);
                    lastActivityLogAt = now;
                }
                if (!state.games.length && !landingSockets.size) {
                    clearInterval(interval);
                    interval = null;
                }
            }, 100);
            interval.unref?.();
        },
    };
    runtimes.set(app, runtime);
    return runtime;
}
