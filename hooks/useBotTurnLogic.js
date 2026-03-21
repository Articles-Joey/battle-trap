"use client"
import { useCallback } from 'react';
import { useStore } from '@/hooks/useStore';
import usePlayerMoveLogic from '@/hooks/usePlayerMoveLogic';
import useRollDice from '@/hooks/useRollDice';

const DIRECTIONS = [
    { x: 1,  y: 0  },
    { x: -1, y: 0  },
    { x: 0,  y: 1  },
    { x: 0,  y: -1 },
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

/**
 * Picks the best direction for the bot to move.
 *
 * Strategy (Voronoi / space-maximising):
 *   score = botTerritory - (opponentTotalTerritory * 0.5)
 *
 * Moving to a square that seals off more of an opponent's space scores higher.
 * Moving to a square that gives the bot more room also scores higher.
 */
function pickBestMove(botX, botY, boardSize, flatSpaces, players, botColor) {
    const wallSet = new Set(
        flatSpaces.filter(s => s.checked).map(s => `${s.x},${s.y}`)
    );

    let bestMove = null;
    let bestScore = -Infinity;

    for (const dir of DIRECTIONS) {
        const nx = botX + dir.x;
        const ny = botY + dir.y;

        if (nx < 0 || ny < 0 || nx >= boardSize || ny >= boardSize) continue;
        if (wallSet.has(`${nx},${ny}`)) continue;

        // After moving, (nx, ny) becomes a wall for everyone.
        // For the bot's own territory flood-fill we measure from (nx, ny) without
        // that wall (the bot is standing there), so use the base wallSet.
        const botTerritory = countReachable(nx, ny, boardSize, wallSet);

        // For opponents, the new wall at (nx, ny) does block them.
        const wallsWithNew = new Set(wallSet);
        wallsWithNew.add(`${nx},${ny}`);

        let opponentTerritory = 0;
        for (const p of players) {
            if (p.battleTrap?.color === botColor) continue;
            if (p.battleTrap?.dead) continue;
            if (p.battleTrap?.x == null) continue;
            opponentTerritory += countReachable(
                p.battleTrap.x,
                p.battleTrap.y,
                boardSize,
                wallsWithNew
            );
        }

        const score = botTerritory - opponentTerritory * 0.5;

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
 *   1. If currentRoll === false  → roll dice.
 *   2. If currentMoveCount < currentRoll → make the best move.
 *   3. Otherwise → do nothing (next-turn logic in GameLogicManager handles the handoff).
 */
export default function useBotTurnLogic(server) {
    const rollDice = useRollDice(server);
    const handlePlayerMove = usePlayerMoveLogic(server);

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

        // Roll first if we haven't yet this turn.
        if (currentRoll === false) {
            rollDice();
            return;
        }

        // All moves for this roll have been made.
        if (currentMoveCount >= currentRoll) return;

        const { x: botX, y: botY, color: botColor } = botPlayer.battleTrap;
        const flatSpaces = localGameState?.spaces?.flat() || [];

        const move = pickBestMove(botX, botY, boardSize, flatSpaces, players, botColor);
        if (move) {
            handlePlayerMove(move);
        }
    }, [rollDice, handlePlayerMove]);

    return calculateBotTurnLogic;
}
