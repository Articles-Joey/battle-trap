import { resetBoard, resolveGame } from './gameEngine.js';

export const ROOM_PREFIX = 'game:battle-trap-room-';
export const LANDING_ROOM = 'game:battle-trap-landing';
export const roomName = (id) => `${ROOM_PREFIX}${id}`;
export const validRoomId = (id) => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(id);

export function createRoom(serverId) {
    const game = {
        server_id: serverId, leaderId: null, players: [], boardSize: 20,
        moveTime: 20, revision: 0, nextBotId: 1,
    };
    resetBoard(game);
    return game;
}

const nickname = (value, fallback) => typeof value === 'string' && value.trim()
    ? value.trim().slice(0, 40) : fallback;
const MODELS = new Set(['low_poly_chopper.glb', 'low_poly_scooter.glb', 'low_poly_tricycle.glb', 'low_poly_unicycle.glb', 'toilet_tricycle.glb']);
export function humanPlayer(socket, settings) {
    const model = settings?.character?.model;
    const color = settings?.character?.customizations?.primaryColor;
    return {
        id: socket.id,
        battleTrap: {
            nickname: nickname(settings?.nickname, 'Player'), bot: false,
            character: {
                model: MODELS.has(model) ? model : 'low_poly_chopper.glb',
                customizations: { primaryColor: typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color) ? color : '#000000' },
            },
        },
    };
}

export function configureRoom(game, config) {
    if (!config || typeof config !== 'object') return 'Invalid configuration.';
    if (!Number.isInteger(config.boardSize) || config.boardSize < 4 || config.boardSize > 50) return 'Board size must be between 4 and 50.';
    if (config.moveTime !== false && (!Number.isInteger(config.moveTime) || config.moveTime < 3 || config.moveTime > 100)) return 'Move timer must be off or between 3 and 100 seconds.';
    const humans = game.players.filter((p) => !p.battleTrap.bot);
    if (!Array.isArray(config.bots) || humans.length + config.bots.length > 4) return 'The room holds up to four players, including bots.';
    if (config.bots.some((bot) => !bot || !['Easy', 'Medium', 'Hard'].includes(bot.difficulty))) return 'Choose a valid bot difficulty.';
    const bots = config.bots.map((bot, i) => ({
        id: `bot-${game.server_id}-${game.nextBotId++}`,
        battleTrap: {
            bot: true, difficulty: bot.difficulty, nickname: nickname(bot.nickname, `Bot ${i + 1}`),
            character: { model: 'low_poly_chopper.glb' },
        },
    }));
    Object.assign(game, { boardSize: config.boardSize, moveTime: config.moveTime, players: [...humans, ...bots] });
    resetBoard(game);
    return null;
}

export function removePlayer(game, socketId) {
    const player = game.players.find((p) => p.id === socketId);
    if (!player) return;
    if (game.status === 'In Lobby') {
        game.players = game.players.filter((p) => p.id !== socketId);
        resetBoard(game);
    } else {
        // Keep trails and stable turn indices after somebody leaves a match.
        player.battleTrap = { ...player.battleTrap, dead: true, disconnected: true };
        resolveGame(game);
    }
    if (game.leaderId === socketId) {
        game.leaderId = game.players.find((p) => !p.battleTrap.bot && !p.battleTrap.disconnected)?.id ?? null;
    }
}

export function publicGame(game) {
    const { deadline, nextBotAt, botMode, nextBotId, ...state } = game;
    return state;
}
