"use client";
import { useCallback, useRef } from "react";
import { useStore } from "@/hooks/useStore";
import usePlayerMoveLogic from "@/hooks/usePlayerMoveLogic";
import useRollDice from "@/hooks/useRollDice";

const DIRECTIONS = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
];

/**
 * Flood fill — returns the number of reachable free squares from (startX, startY).
 * Squares in occupiedSet are treated as impassable walls.
 * startX/startY must NOT be in occupiedSet.
 */
function countReachable(startX, startY, boardSize, occupiedSet) {
    const visited = new Set();
    const queue = [[startX, startY]];

    while (queue.length > 0) {
        const [cx, cy] = queue.shift();
        const key = `${cx},${cy}`;

        if (visited.has(key)) continue;
        if (cx < 0 || cy < 0 || cx >= boardSize || cy >= boardSize) continue;
        if (occupiedSet.has(key)) continue;

        visited.add(key);
        for (const { x: dx, y: dy } of DIRECTIONS) {
            queue.push([cx + dx, cy + dy]);
        }
    }

    return visited.size;
}

// Chance per turn that the bot hunts a player instead of playing for space.
const ATTACK_CHANCE = { Easy: 0.15, Medium: 0.35, Hard: 0.55 };

/**
 * Multi-source BFS territory split. Opponents expand first each round because
 * they move after the bot. Returns the number of squares each opponent owns
 * (same order as `opponents`) and how many the bot owns.
 */
function voronoi(boardSize, wallSet, botPos, opponents) {
    const owner = new Int8Array(boardSize * boardSize).fill(-1);
    const idx = (x, y) => y * boardSize + x;
    const botIndex = opponents.length;
    const counts = new Array(opponents.length + 1).fill(0);

    const sources = [...opponents, botPos];
    const frontiers = sources.map((s, i) => {
        owner[idx(s.x, s.y)] = i;
        return [[s.x, s.y]];
    });

    let active = true;
    while (active) {
        active = false;
        for (let i = 0; i < frontiers.length; i++) {
            const next = [];
            for (const [cx, cy] of frontiers[i]) {
                for (const { x: dx, y: dy } of DIRECTIONS) {
                    const x = cx + dx;
                    const y = cy + dy;
                    if (x < 0 || y < 0 || x >= boardSize || y >= boardSize)
                        continue;
                    if (wallSet.has(`${x},${y}`)) continue;
                    if (owner[idx(x, y)] !== -1) continue;
                    owner[idx(x, y)] = i;
                    counts[i]++;
                    next.push([x, y]);
                }
            }
            frontiers[i] = next;
            if (next.length > 0) active = true;
        }
    }

    return { bot: counts[botIndex], opponents: counts.slice(0, botIndex) };
}

function manhattan(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function pickMode(difficulty) {
    return Math.random() < (ATTACK_CHANCE[difficulty] ?? ATTACK_CHANCE.Medium)
        ? "attack"
        : "smart";
}

/**
 * Picks the best direction for the bot to move.
 *
 * Both modes first avoid dead ends: a move that leaves fewer reachable squares
 * than the moves still left on this roll is heavily penalised.
 *
 *   smart  - maximise own Voronoi territory, hug walls to use space efficiently.
 *   attack - chase the nearest opponent: shrink their territory and close the distance.
 */
function pickBestMove({
    botX,
    botY,
    boardSize,
    flatSpaces,
    players,
    botColor,
    mode,
    movesLeftAfter,
}) {
    const wallSet = new Set(
        flatSpaces.filter((s) => s.checked).map((s) => `${s.x},${s.y}`),
    );

    const opponents = players
        .filter(
            (p) =>
                p.battleTrap?.color !== botColor &&
                !p.battleTrap?.dead &&
                p.battleTrap?.x != null,
        )
        .map((p) => ({
            color: p.battleTrap.color,
            x: p.battleTrap.x,
            y: p.battleTrap.y,
        }));

    // Heads are impassable even if their square isn't flagged as checked.
    for (const o of opponents) wallSet.add(`${o.x},${o.y}`);
    wallSet.add(`${botX},${botY}`);

    let target = null;
    if (mode === "attack" && opponents.length > 0) {
        target = opponents.reduce((a, b) =>
            manhattan(a, { x: botX, y: botY }) <=
            manhattan(b, { x: botX, y: botY })
                ? a
                : b,
        );
    }
    const attacking = mode === "attack" && !!target;

    let bestMove = null;
    let bestScore = -Infinity;

    for (const dir of DIRECTIONS) {
        const nx = botX + dir.x;
        const ny = botY + dir.y;

        if (nx < 0 || ny < 0 || nx >= boardSize || ny >= boardSize) continue;
        if (wallSet.has(`${nx},${ny}`)) continue;

        // Squares the bot can still step on after this move (excludes the new square).
        const reachable = countReachable(nx, ny, boardSize, wallSet) - 1;
        const shortfall = Math.max(0, movesLeftAfter - reachable);

        // The new square becomes a wall for everyone.
        const wallsWithNew = new Set(wallSet);
        wallsWithNew.add(`${nx},${ny}`);
        const split = voronoi(
            boardSize,
            wallsWithNew,
            { x: nx, y: ny },
            opponents,
        );

        let score;
        if (attacking) {
            const targetIdx = opponents.indexOf(target);
            const targetTerritory = split.opponents[targetIdx];
            const othersTerritory =
                split.opponents.reduce((a, b) => a + b, 0) - targetTerritory;
            score =
                split.bot -
                targetTerritory * 1.5 -
                othersTerritory * 0.25 -
                manhattan({ x: nx, y: ny }, target);
        } else {
            const totalOpp = split.opponents.reduce((a, b) => a + b, 0);
            const blockedNeighbours = DIRECTIONS.filter(({ x: dx, y: dy }) => {
                const x = nx + dx;
                const y = ny + dy;
                return (
                    x < 0 ||
                    y < 0 ||
                    x >= boardSize ||
                    y >= boardSize ||
                    wallsWithNew.has(`${x},${y}`)
                );
            }).length;
            score = split.bot - totalOpp * 0.5 + blockedNeighbours * 0.75;
        }

        score -= shortfall * 1000;
        score += Math.random() * 0.5;

        if (score > bestScore) {
            bestScore = score;
            bestMove = dir;
        }
    }

    return bestMove;
}

/**
 * useBotTurnLogic — returns a stable `calculateBotTurnLogic` callback.
 *
 * Call this once per action step (roll OR one move).
 * The caller is responsible for spacing calls out over time.
 *
 * Flow:
 *   1. If currentRoll === false  → pick a mode (smart / attack) and roll dice.
 *   2. If currentMoveCount < currentRoll → make the best move for that mode.
 *   3. Otherwise → do nothing (next-turn logic in GameLogicManager handles the handoff).
 */
export default function useBotTurnLogic(server) {
    const rollDice = useRollDice(server);
    const handlePlayerMove = usePlayerMoveLogic(server);
    const turnPlan = useRef({ mode: null });

    const calculateBotTurnLogic = useCallback(() => {
        const {
            players,
            currentTurn,
            currentRoll,
            currentMoveCount,
            boardSize,
            localGameState,
        } = useStore.getState();

        const botPlayer = players[currentTurn];
        if (!botPlayer?.battleTrap?.bot) return;
        if (botPlayer.battleTrap?.dead) return;

        // Roll first if we haven't yet this turn; decide the turn's plan here.
        if (currentRoll === false) {
            turnPlan.current = {
                mode: pickMode(botPlayer.battleTrap.difficulty),
            };
            rollDice();
            return;
        }

        // All moves for this roll have been made.
        if (currentMoveCount >= currentRoll) return;

        // Plan is lost if the page reloaded mid-turn.
        if (!turnPlan.current.mode) {
            turnPlan.current = {
                mode: pickMode(botPlayer.battleTrap.difficulty),
            };
        }

        const { x: botX, y: botY, color: botColor } = botPlayer.battleTrap;
        const flatSpaces = localGameState?.spaces?.flat() || [];

        const move = pickBestMove({
            botX,
            botY,
            boardSize,
            flatSpaces,
            players,
            botColor,
            mode: turnPlan.current.mode,
            movesLeftAfter: currentRoll - currentMoveCount - 1,
        });
        if (move) {
            handlePlayerMove(move);
        }
    }, [rollDice, handlePlayerMove]);

    return calculateBotTurnLogic;
}
