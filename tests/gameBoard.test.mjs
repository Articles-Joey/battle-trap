import assert from "node:assert/strict";
import test from "node:test";
import {
    areTrailNeighbors,
    createStartingSpaces,
    getAvailableMoves,
    getPreviousTrailSpace,
    recordLocalMove,
    getNextLivingTurn,
    resolveLocalTurn,
    createLocalGame,
} from "../util/gameBoard.js";
import {
    drawGameBoard2D,
    getBoardLayout,
    pointToBoardCell,
} from "../util/drawGameBoard2D.js";

function newGame() {
    const players = [
        { id: "player-0", battleTrap: { color: "red", x: 0, y: 0 } },
        { id: "bot-0", battleTrap: { color: "blue", x: 9, y: 9, bot: true } },
        { id: "bot-1", battleTrap: { color: "yellow", x: 0, y: 9, bot: true } },
        { id: "bot-2", battleTrap: { color: "green", x: 9, y: 0, bot: true } },
    ];
    return {
        players,
        currentTurn: 0,
        currentRoll: false,
        currentMoveCount: 0,
        localGameState: {
            boardSize: 10,
            move: 0,
            moveTimer: null,
            spaces: createStartingSpaces(players),
        },
    };
}

function move(state, color, x, y) {
    return { ...state, ...recordLocalMove(state, { x, y }, color) };
}

test("every player and bot connects to its starting point with independent counters", () => {
    let state = newGame();
    const starts = state.localGameState.spaces;
    const moves = [
        ["red", 1, 0],
        ["blue", 8, 9],
        ["yellow", 1, 9],
        ["green", 8, 0],
    ];
    for (const [index, [color, x, y]] of moves.entries()) {
        state = move(state, color, x, y);
        const space = state.localGameState.spaces.at(-1);
        assert.equal(space.checked.socket_id, state.players[index].id);
        assert.equal(space.checked.move, index + 1);
        assert.equal(space.checked.playerMove, 1);
        assert.equal(state.players[index].battleTrap.playerMove, 1);
        assert.ok(areTrailNeighbors(starts[index], space));
    }
    assert.equal(state.localGameState.move, 4);
    assert.equal(state.currentMoveCount, 4);
    assert.equal(starts.length, 4, "previous state remains unchanged");
});

test("trails and headings continue when other players move between turns", () => {
    let state = move(newGame(), "red", 1, 0);
    const first = state.localGameState.spaces.at(-1);
    state = move(state, "blue", 8, 9);
    state = move(state, "yellow", 1, 9);
    state = move(state, "green", 8, 0);
    state = { ...state, currentMoveCount: 0 };
    state = move(state, "red", 1, 1);
    const second = state.localGameState.spaces.at(-1);
    assert.equal(second.checked.move, 5);
    assert.equal(second.checked.playerMove, 2);
    assert.equal(state.currentMoveCount, 1);
    assert.ok(areTrailNeighbors(first, second));
    assert.equal(
        getPreviousTrailSpace(
            state.localGameState.spaces,
            state.players[0].battleTrap,
        ),
        first,
    );
});

test("touching trails never create shortcuts or connect different players", () => {
    const space = {
        x: 0,
        y: 0,
        checked: { color: "red", socket_id: "shared", move: 1, playerMove: 1 },
    };
    assert.equal(
        areTrailNeighbors(space, {
            x: 1,
            y: 0,
            checked: {
                color: "blue",
                socket_id: "shared",
                move: 2,
                playerMove: 2,
            },
        }),
        false,
    );
    assert.equal(
        areTrailNeighbors(space, {
            x: 1,
            y: 0,
            checked: {
                color: "red",
                socket_id: "shared",
                move: 2,
                playerMove: 4,
            },
        }),
        false,
    );
    assert.equal(
        areTrailNeighbors(space, {
            x: 1,
            y: 1,
            checked: {
                color: "red",
                socket_id: "shared",
                move: 2,
                playerMove: 2,
            },
        }),
        false,
    );
    assert.equal(
        areTrailNeighbors(space, { x: 1, y: 0, checked: false }),
        false,
    );
});

test("old local saves with mismatched IDs retain their bot starting connections", () => {
    const state = newGame();
    state.localGameState.spaces[1].checked.socket_id = "socket_id_2";
    const next = move(state, "blue", 8, 9);
    assert.ok(
        areTrailNeighbors(
            next.localGameState.spaces[1],
            next.localGameState.spaces.at(-1),
        ),
    );
});

test("multiplayer trails without personal counters use the game move and player ID", () => {
    const first = { x: 2, y: 3, checked: { socket_id: "remote", move: 20 } };
    const second = { x: 2, y: 4, checked: { socket_id: "remote", move: 21 } };
    assert.ok(areTrailNeighbors(first, second));
    assert.equal(
        areTrailNeighbors(first, {
            ...second,
            checked: { socket_id: "other", move: 21 },
        }),
        false,
    );
});

test("available moves exclude walls, board edges, and eliminated players", () => {
    const state = newGame();
    const player = state.players[0].battleTrap;
    assert.deepEqual(
        getAvailableMoves(10, state.localGameState.spaces, player),
        [
            { x: 1, y: 0 },
            { x: 0, y: 1 },
        ],
    );
    const moved = move(state, "red", 1, 0);
    assert.deepEqual(
        getAvailableMoves(
            10,
            moved.localGameState.spaces,
            moved.players[0].battleTrap,
        ),
        [
            { x: 2, y: 0 },
            { x: 1, y: 1 },
        ],
    );
    assert.deepEqual(getAvailableMoves(10, [], { ...player, dead: true }), []);
    assert.deepEqual(getAvailableMoves(10, [], undefined), []);
});

test("2D hit testing matches game coordinates at different sizes and aspect ratios", () => {
    for (const [width, height, boardSize] of [
        [600, 600, 20],
        [1000, 400, 10],
        [320, 700, 50],
    ]) {
        const layout = getBoardLayout(width, height, boardSize);
        for (const [x, y] of [
            [0, 0],
            [0, boardSize - 1],
            [boardSize - 1, 0],
            [boardSize - 1, boardSize - 1],
            [3, 4],
        ]) {
            const px = layout.left + (x + 0.5) * layout.cellSize;
            const py = layout.top + (boardSize - y - 0.5) * layout.cellSize;
            assert.deepEqual(pointToBoardCell(px, py, layout, boardSize), {
                x,
                y,
            });
        }
        assert.equal(
            pointToBoardCell(layout.left - 1, layout.top, layout, boardSize),
            null,
        );
        assert.equal(
            pointToBoardCell(
                layout.left + layout.size,
                layout.top,
                layout,
                boardSize,
            ),
            null,
        );
        assert.equal(
            pointToBoardCell(
                layout.left,
                layout.top + layout.size,
                layout,
                boardSize,
            ),
            null,
        );
    }
});

function recordingContext() {
    const context = {
        strokes: [],
        path: [],
        beginPath() {
            this.path = [];
        },
        moveTo(...args) {
            this.path.push(["moveTo", ...args]);
        },
        lineTo(...args) {
            this.path.push(["lineTo", ...args]);
        },
        arc(...args) {
            this.path.push(["arc", ...args]);
        },
        stroke() {
            this.strokes.push({
                color: this.strokeStyle,
                path: [...this.path],
            });
        },
        measureText(text) {
            return { width: text.length * 7 };
        },
    };
    for (const method of [
        "clearRect",
        "fillRect",
        "strokeRect",
        "fill",
        "save",
        "restore",
        "translate",
        "rotate",
        "closePath",
        "fillText",
    ])
        context[method] = () => {};
    return context;
}

test("2D renders one correctly colored segment from each player and bot starting point", () => {
    let state = newGame();
    for (const [color, x, y] of [
        ["red", 1, 0],
        ["blue", 8, 9],
        ["yellow", 1, 9],
        ["green", 8, 0],
    ])
        state = move(state, color, x, y);
    const context = recordingContext();
    drawGameBoard2D(context, {
        width: 524,
        height: 524,
        boardSize: 10,
        flatSpaces: state.localGameState.spaces,
        players: state.players,
        activePlayer: state.players[0].battleTrap,
        currentRoll: 3,
        hoveredCell: null,
    });
    const segments = context.strokes.filter(
        (s) =>
            s.path.length === 2 &&
            s.path[0][0] === "moveTo" &&
            s.path[1][0] === "lineTo",
    );
    assert.equal(segments.length, 4);
    assert.deepEqual(
        new Set(segments.map((s) => s.color)),
        new Set(["red", "blue", "yellow", "green"]),
    );
    assert.deepEqual(segments.find((s) => s.color === "red").path, [
        ["moveTo", 37, 487],
        ["lineTo", 87, 487],
    ]);
});

function trapCornerPlayer(state, index) {
    const player = state.players[index].battleTrap;
    const blockers = [
        { x: player.x === 0 ? 1 : player.x - 1, y: player.y },
        { x: player.x, y: player.y === 0 ? 1 : player.y - 1 },
    ].map((space) => ({
        ...space,
        checked: { color: "gray", socket_id: "wall" },
    }));
    return {
        ...state,
        localGameState: {
            ...state.localGameState,
            spaces: [...state.localGameState.spaces, ...blockers],
        },
    };
}

test("trapped humans and bots are skipped without first rolling dice", () => {
    for (const currentTurn of [0, 1]) {
        const state = trapCornerPlayer(
            { ...newGame(), currentTurn },
            currentTurn,
        );
        const resolved = { ...state, ...resolveLocalTurn(state) };
        assert.equal(resolved.players[currentTurn].battleTrap.dead, true);
        assert.equal(resolved.currentTurn, currentTurn + 1);
        assert.equal(resolved.currentRoll, false);
        assert.equal(resolved.currentMoveCount, 0);
    }
});

test("trapping an active player midway through a roll immediately clears the turn", () => {
    const state = trapCornerPlayer(
        { ...newGame(), currentRoll: 8, currentMoveCount: 2 },
        0,
    );
    state.localGameState.moveTimer = 12;
    const resolved = { ...state, ...resolveLocalTurn(state) };
    assert.equal(resolved.players[0].battleTrap.dead, true);
    assert.equal(resolved.currentTurn, 1);
    assert.equal(resolved.currentRoll, false);
    assert.equal(resolved.currentMoveCount, 0);
    assert.equal(resolved.localGameState.moveTimer, null);
    assert.deepEqual(
        resolveLocalTurn(resolved),
        {},
        "the reconciliation effect does not skip a second player",
    );
});

test("a move into a dead end records its trail and eliminates the mover in one update", () => {
    const state = newGame();
    state.currentRoll = 5;
    state.localGameState.spaces.push(
        { x: 2, y: 0, checked: { color: "gray" } },
        { x: 1, y: 1, checked: { color: "gray" } },
    );
    const resolved = move(state, "red", 1, 0);
    const lastSpace = resolved.localGameState.spaces.at(-1);
    assert.equal(resolved.players[0].battleTrap.dead, true);
    assert.equal(resolved.currentTurn, 1);
    assert.equal(resolved.currentRoll, false);
    assert.equal(resolved.currentMoveCount, 0);
    assert.equal(resolved.localGameState.move, 1);
    assert.equal(lastSpace.checked.playerMove, 1);
    assert.ok(areTrailNeighbors(resolved.localGameState.spaces[0], lastSpace));
    assert.equal(state.players[0].battleTrap.dead, undefined);
});

test("eliminating a player outside their turn preserves the active player's remaining moves", () => {
    const state = trapCornerPlayer(
        { ...newGame(), currentRoll: 7, currentMoveCount: 2 },
        1,
    );
    state.localGameState.moveTimer = 12;
    const resolved = { ...state, ...resolveLocalTurn(state) };
    assert.equal(resolved.players[1].battleTrap.dead, true);
    assert.equal(resolved.currentTurn, 0);
    assert.equal(resolved.currentRoll, 7);
    assert.equal(resolved.currentMoveCount, 2);
    assert.equal(resolved.localGameState.moveTimer, 12);
});

test("finished rolls and timer expiry skip every eliminated slot and wrap correctly", () => {
    const state = newGame();
    state.players[1].battleTrap.dead = true;
    state.players[2].battleTrap.dead = true;
    state.currentRoll = 1;
    const resolved = move(state, "red", 1, 0);
    assert.equal(resolved.currentTurn, 3);
    assert.equal(resolved.currentRoll, false);
    assert.equal(resolved.currentMoveCount, 0);
    const expired = { ...resolved, currentRoll: 6, currentMoveCount: 2 };
    assert.equal(resolveLocalTurn(expired, true).currentTurn, 0);
    assert.equal(getNextLivingTurn(resolved.players, 3), 0);
});

test("trapped detection handles nested boards with four or fewer recorded squares", () => {
    const state = trapCornerPlayer(newGame(), 0);
    state.players = state.players.slice(0, 2);
    state.localGameState.spaces = [
        state.localGameState.spaces.filter(
            (space) =>
                space.checked.color !== "yellow" &&
                space.checked.color !== "green",
        ),
    ];
    assert.equal(state.localGameState.spaces.flat().length, 4);
    const resolved = resolveLocalTurn(state);
    assert.equal(resolved.players[0].battleTrap.dead, true);
    assert.equal(resolved.currentTurn, -1);
    assert.equal(resolved.localGameState.gameOver, true);
    assert.equal(resolved.localGameState.winnerId, state.players[1].id);
});

test("when nobody can move there is no active turn or pending roll, and reconciliation stays stable", () => {
    const state = newGame();
    for (const player of state.players) {
        player.battleTrap.x = player.battleTrap.x ? 1 : 0;
        player.battleTrap.y = player.battleTrap.y ? 1 : 0;
    }
    state.localGameState.boardSize = 2;
    state.localGameState.spaces = createStartingSpaces(state.players);
    state.currentRoll = 8;
    state.currentMoveCount = 3;
    const resolved = { ...state, ...resolveLocalTurn(state) };
    assert.ok(resolved.players.every((player) => player.battleTrap.dead));
    assert.equal(resolved.currentTurn, -1);
    assert.equal(resolved.currentRoll, false);
    assert.equal(resolved.currentMoveCount, 0);
    assert.equal(resolved.localGameState.gameOver, true);
    assert.equal(resolved.localGameState.winnerId, null);
    assert.deepEqual(resolveLocalTurn(resolved), {});
    assert.deepEqual(recordLocalMove(resolved, { x: 0, y: 1 }, "red"), {});
    assert.equal(getNextLivingTurn([], 0), -1);
});

test("2D nameplates draw a red strike only for eliminated players", () => {
    const state = newGame();
    state.players[0].battleTrap.nickname = "Pilot";
    state.players[1].battleTrap.nickname = "Bot Ada";
    state.players[1].battleTrap.dead = true;
    const context = recordingContext();
    drawGameBoard2D(context, {
        width: 524,
        height: 524,
        boardSize: 10,
        flatSpaces: state.localGameState.spaces,
        players: state.players,
        activePlayer: state.players[0].battleTrap,
        currentRoll: false,
    });
    const strikes = context.strokes.filter(
        (stroke) => stroke.color === "#ff3333" && stroke.path.length === 2,
    );
    assert.equal(strikes.length, 1);
    assert.deepEqual(strikes[0].path, [
        ["moveTo", 460, 66],
        ["lineTo", 509, 66],
    ]);
});

test("the last surviving human or bot wins immediately and cannot keep moving", () => {
    for (const winnerIndex of [0, 1]) {
        const state = newGame();
        state.currentTurn = winnerIndex;
        state.currentRoll = 8;
        state.currentMoveCount = 2;
        state.localGameState.gameStarted = true;
        state.localGameState.moveTimer = 12;
        state.players.forEach((player, index) => {
            player.battleTrap.dead = index !== winnerIndex;
        });
        const finished = { ...state, ...resolveLocalTurn(state) };
        assert.equal(
            finished.localGameState.winnerId,
            state.players[winnerIndex].id,
        );
        assert.equal(finished.localGameState.gameOver, true);
        assert.equal(finished.localGameState.gameStarted, false);
        assert.equal(finished.localGameState.moveTimer, null);
        assert.equal(finished.currentTurn, -1);
        assert.equal(finished.currentRoll, false);
        assert.equal(finished.currentMoveCount, 0);
        assert.equal(finished.players[winnerIndex].battleTrap.dead, false);
        assert.deepEqual(resolveLocalTurn(finished), {});
        assert.deepEqual(
            recordLocalMove(
                finished,
                { x: 1, y: 0 },
                state.players[winnerIndex].battleTrap.color,
            ),
            {},
        );
    }
});

test("a move that traps the last opponent records the winner and final trail atomically", () => {
    const state = newGame();
    state.currentRoll = 8;
    state.players[0].battleTrap.x = 7;
    state.players[0].battleTrap.y = 9;
    state.players[2].battleTrap.dead = true;
    state.players[3].battleTrap.dead = true;
    state.localGameState.spaces = [
        ...createStartingSpaces(state.players),
        { x: 9, y: 8, checked: { color: "gray" } },
    ];
    const finished = move(state, "red", 8, 9);
    assert.equal(finished.players[1].battleTrap.dead, true);
    assert.equal(finished.players[0].battleTrap.dead, undefined);
    assert.equal(finished.localGameState.winnerId, "player-0");
    assert.equal(finished.localGameState.gameOver, true);
    assert.equal(finished.localGameState.move, 1);
    assert.deepEqual(finished.localGameState.spaces.at(-1), {
        x: 8,
        y: 9,
        checked: {
            color: "red",
            socket_id: "player-0",
            move: 1,
            playerMove: 1,
        },
    });
    assert.equal(finished.currentTurn, -1);
});

test("multiple living players and a one-player setup do not prematurely end a game", () => {
    const state = newGame();
    assert.deepEqual(resolveLocalTurn(state), {});
    const alone = { ...state, players: state.players.slice(0, 1) };
    alone.localGameState = {
        ...state.localGameState,
        spaces: createStartingSpaces(alone.players),
    };
    assert.deepEqual(resolveLocalTurn(alone), {});
    assert.deepEqual(
        resolveLocalTurn({
            ...state,
            localGameState: { ...state.localGameState, spaces: [] },
        }),
        {},
    );
});

test("restart revives all players at their corners and preserves roster, settings, and view mode", () => {
    const state = newGame();
    state.boardSize = 20;
    state.threeDimensional = false;
    state.currentTurn = -1;
    state.localGameState = {
        ...state.localGameState,
        boardSize: 18,
        moveTime: false,
        gameOver: true,
        winnerId: "bot-0",
        move: 72,
        moveTimer: 4,
    };
    state.players.forEach((player, index) => {
        player.battleTrap = {
            ...player.battleTrap,
            nickname: `Name ${index}`,
            dead: index !== 1,
            playerMove: 15,
            x: 4,
            y: 4,
            difficulty: "Hard",
            character: {
                model: "bike.glb",
                customizations: { primaryColor: "purple" },
            },
        };
    });
    const restarted = { ...state, ...createLocalGame(state) };
    assert.equal(restarted.boardSize, 18);
    assert.equal(restarted.threeDimensional, false);
    assert.equal(restarted.localGameState.moveTime, false);
    assert.equal(restarted.localGameState.gameStarted, true);
    assert.equal(restarted.localGameState.gameOver, false);
    assert.equal(restarted.localGameState.winnerId, null);
    assert.equal(restarted.localGameState.move, 0);
    assert.equal(restarted.localGameState.moveTimer, null);
    assert.equal(restarted.currentTurn, 0);
    assert.equal(restarted.currentRoll, false);
    assert.equal(restarted.currentMoveCount, 0);
    assert.deepEqual(
        restarted.players.map((p) => [p.battleTrap.x, p.battleTrap.y]),
        [
            [0, 0],
            [17, 17],
            [0, 17],
            [17, 0],
        ],
    );
    assert.equal(restarted.localGameState.spaces.length, 4);
    for (const [index, player] of restarted.players.entries()) {
        assert.equal(player.id, state.players[index].id);
        assert.equal(player.battleTrap.nickname, `Name ${index}`);
        assert.equal(
            player.battleTrap.bot,
            state.players[index].battleTrap.bot,
        );
        assert.equal(player.battleTrap.difficulty, "Hard");
        assert.deepEqual(
            player.battleTrap.character,
            state.players[index].battleTrap.character,
        );
        assert.equal(player.battleTrap.dead, false);
        assert.equal(player.battleTrap.playerMove, 0);
        assert.equal(
            restarted.localGameState.spaces[index].checked.socket_id,
            player.id,
        );
    }
    assert.deepEqual(resolveLocalTurn(restarted), {});
    assert.equal(
        state.localGameState.gameOver,
        true,
        "restart preserves the original snapshot",
    );
});

test("leaving for the main menu clears the finished round while retaining game settings", () => {
    const state = newGame();
    state.localGameState = {
        ...state.localGameState,
        moveTime: 30,
        gameOver: true,
        winnerId: "player-0",
    };
    const cleared = { ...state, ...createLocalGame(state, []) };
    assert.deepEqual(cleared.players, []);
    assert.deepEqual(cleared.localGameState.spaces, []);
    assert.equal(cleared.localGameState.gameStarted, false);
    assert.equal(cleared.localGameState.gameOver, false);
    assert.equal(cleared.localGameState.winnerId, null);
    assert.equal(cleared.localGameState.moveTime, 30);
    assert.deepEqual(resolveLocalTurn(cleared), {});
});
