import { createLocalGame } from "./gameBoard";

export function makeLocalPlayers(state, botCount, previous = []) {
    return Array.from({ length: 4 }, (_, i) => {
        const bot = i >= 4 - botCount;
        const id = bot ? `bot-${i - (4 - botCount)}` : `player-${i}`;
        return previous.find((player) => player.id === id) || {
            id,
            battleTrap: {
                bot,
                nickname: bot ? `Bot ${i - (4 - botCount) + 1}`
                    : i === 0 ? state.nickname || "Player 1" : `Player ${i + 1}`,
                difficulty: "Medium",
                character: bot ? { model: "low_poly_chopper.glb" }
                    : { model: "low_poly_chopper.glb", ...state.character },
            },
        };
    });
}

export function createLocalLobby(state, mode, {
    players = makeLocalPlayers(state, mode === "single-player" ? 3 : 2),
    boardSize = state.boardSize,
    moveTime = state.localGameState?.moveTime ?? state.defaultLocalGameState.moveTime,
} = {}) {
    const updates = createLocalGame(state, players, boardSize);
    return {
        ...updates,
        currentTurn: -1,
        localGameState: { ...updates.localGameState, mode, moveTime, gameStarted: false },
    };
}
