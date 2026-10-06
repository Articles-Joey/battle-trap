export const BOARD_DIRECTIONS = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 },
];

export function isSameTrail(first, second) {
    if (!first?.checked || !second?.checked) return false;

    const a = first.checked;
    const b = second.checked;
    // Color also identifies trails in saved local games with the old shared ID.
    if (a.color != null && b.color != null) return a.color === b.color;
    return a.socket_id != null && a.socket_id === b.socket_id;
}

export function areTrailNeighbors(first, second) {
    if (!isSameTrail(first, second)) return false;
    if (Math.abs(first.x - second.x) + Math.abs(first.y - second.y) !== 1)
        return false;

    const a = first.checked;
    const b = second.checked;
    // Personal move numbers remain consecutive across other players' turns.
    if (Number.isInteger(a.playerMove) && Number.isInteger(b.playerMove))
        return Math.abs(a.playerMove - b.playerMove) === 1;

    return (
        Number.isInteger(a.move) &&
        Number.isInteger(b.move) &&
        Math.abs(a.move - b.move) === 1
    );
}

export function getAvailableMoves(boardSize, flatSpaces, player) {
    if (!player || player.dead || player.x == null || player.y == null)
        return [];

    const occupied = new Set(
        flatSpaces.filter((space) => space.checked).map((s) => `${s.x},${s.y}`),
    );
    return BOARD_DIRECTIONS.map(({ x, y }) => ({
        x: player.x + x,
        y: player.y + y,
    })).filter(
        ({ x, y }) =>
            x >= 0 &&
            y >= 0 &&
            x < boardSize &&
            y < boardSize &&
            !occupied.has(`${x},${y}`),
    );
}

export function getPreviousTrailSpace(flatSpaces, player) {
    const current = flatSpaces.find(
        (space) =>
            space.x === player?.x && space.y === player?.y && space.checked,
    );
    if (!current) return undefined;

    return flatSpaces.find((space) => {
        if (!areTrailNeighbors(current, space)) return false;
        const counter =
            Number.isInteger(current.checked.playerMove) &&
            Number.isInteger(space.checked.playerMove)
                ? "playerMove"
                : "move";
        return space.checked[counter] < current.checked[counter];
    });
}

export function createStartingSpaces(players) {
    return players.map(({ id, battleTrap }) => ({
        x: battleTrap.x,
        y: battleTrap.y,
        checked: {
            color: battleTrap.color,
            socket_id: id,
            move: 0,
            playerMove: 0,
        },
    }));
}

export function getStartingPosition(index, boardSize) {
    return [
        { x: 0, y: 0, color: "red" },
        { x: boardSize - 1, y: boardSize - 1, color: "blue" },
        { x: 0, y: boardSize - 1, color: "yellow" },
        { x: boardSize - 1, y: 0, color: "green" },
    ][index];
}

export function createLocalGame(
    state,
    players = state.players,
    boardSize = state.localGameState?.boardSize || state.boardSize,
) {
    const startingPlayers = players.map((player, index) => ({
        ...player,
        battleTrap: {
            ...player.battleTrap,
            ...getStartingPosition(index, boardSize),
            dead: false,
            playerMove: 0,
        },
    }));
    return {
        players: startingPlayers,
        boardSize,
        localGameState: {
            ...(state.localGameState || state.defaultLocalGameState),
            boardSize,
            gameStarted: startingPlayers.length > 0,
            gameOver: false,
            winnerId: null,
            move: 0,
            moveTimer: null,
            spaces: createStartingSpaces(startingPlayers),
        },
        currentTurn: 0,
        currentRoll: false,
        currentMoveCount: 0,
    };
}

export function getNextLivingTurn(players, currentTurn) {
    for (let offset = 1; offset <= players.length; offset++) {
        const index = (currentTurn + offset + players.length) % players.length;
        const player = players[index]?.battleTrap;
        if (player && !player.dead) return index;
    }
    return -1;
}

export function resolveLocalTurn(state, endTurn = false) {
    const gameState = state.localGameState;
    if (
        !gameState?.spaces?.length ||
        !state.players.length ||
        gameState.gameOver
    )
        return {};

    const boardSize = gameState.boardSize || state.boardSize;
    const flatSpaces = gameState.spaces.flat();
    let eliminated = false;
    const players = state.players.map((player) => {
        const bike = player.battleTrap;
        if (!bike || bike.dead || bike.x == null || bike.y == null)
            return player;
        if (getAvailableMoves(boardSize, flatSpaces, bike).length > 0)
            return player;
        eliminated = true;
        return { ...player, battleTrap: { ...bike, dead: true } };
    });
    const updates = eliminated ? { players } : {};
    const participants = players.filter(
        (player) =>
            player.battleTrap?.x != null && player.battleTrap?.y != null,
    );
    const living = participants.filter((player) => !player.battleTrap.dead);
    if (participants.length > 1 && living.length <= 1) {
        return {
            ...updates,
            currentTurn: -1,
            currentRoll: false,
            currentMoveCount: 0,
            localGameState: {
                ...gameState,
                gameStarted: false,
                gameOver: true,
                winnerId: living[0]?.id ?? null,
                moveTimer: null,
            },
        };
    }
    const activePlayer = players[state.currentTurn]?.battleTrap;
    const rollFinished =
        Number.isInteger(state.currentRoll) &&
        state.currentMoveCount >= state.currentRoll;

    if (endTurn || !activePlayer || activePlayer.dead || rollFinished) {
        const nextTurn = getNextLivingTurn(players, state.currentTurn);
        if (
            nextTurn !== state.currentTurn ||
            state.currentRoll !== false ||
            state.currentMoveCount !== 0 ||
            gameState.moveTimer !== null
        ) {
            return {
                ...updates,
                currentTurn: nextTurn,
                currentRoll: false,
                currentMoveCount: 0,
                localGameState: { ...gameState, moveTimer: null },
            };
        }
    }
    return updates;
}

export function recordLocalMove(state, space, playerColor) {
    const player = state.players.find(
        (p) => p.battleTrap?.color === playerColor,
    );
    if (!player || player.battleTrap.dead || state.localGameState?.gameOver)
        return {};

    const gameState = state.localGameState;
    const flatSpaces = gameState?.spaces?.flat() || [];
    const ownSpaces = flatSpaces.filter((s) =>
        isSameTrail(s, {
            checked: { color: playerColor, socket_id: player.id },
        }),
    );
    const move =
        Math.max(
            gameState?.move || 0,
            ...flatSpaces.map((s) => s.checked?.move || 0),
        ) + 1;
    const playerMove =
        Math.max(
            player.battleTrap.playerMove || 0,
            ownSpaces.length - 1,
            ...ownSpaces.map((s) => s.checked?.playerMove || 0),
        ) + 1;
    const newSpace = {
        ...space,
        checked: {
            ...space.checked,
            color: playerColor,
            socket_id: player.id,
            move,
            playerMove,
        },
    };

    const updates = {
        players: state.players.map((p) =>
            p.id === player.id
                ? {
                      ...p,
                      battleTrap: {
                          ...p.battleTrap,
                          x: space.x,
                          y: space.y,
                          playerMove,
                      },
                  }
                : p,
        ),
        localGameState: {
            ...gameState,
            move,
            spaces: [...flatSpaces, newSpace],
        },
        currentMoveCount: state.currentMoveCount + 1,
    };
    return { ...updates, ...resolveLocalTurn({ ...state, ...updates }) };
}
