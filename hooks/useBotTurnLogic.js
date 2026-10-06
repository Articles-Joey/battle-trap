"use client";
import { useCallback, useRef } from "react";
import { useStore } from "@/hooks/useStore";
import usePlayerMoveLogic from "@/hooks/usePlayerMoveLogic";
import useRollDice from "@/hooks/useRollDice";
import { pickBestMove, pickMode } from "@/util/botLogic";

export default function useBotTurnLogic(server) {
    const rollDice = useRollDice(server);
    const handlePlayerMove = usePlayerMoveLogic(server);
    const turnPlan = useRef({ mode: null });

    return useCallback(() => {
        if (server !== "single-player" && server !== "local-play") return;
        const previousTurn = useStore.getState().currentTurn;
        useStore.getState().resolveLocalGame();
        const state = useStore.getState();
        if (state.currentTurn !== previousTurn) return;
        const { players, currentTurn, currentRoll, currentMoveCount, boardSize, localGameState } = state;
        const bot = players[currentTurn]?.battleTrap;
        if (!localGameState?.gameStarted || localGameState?.gameOver || !bot?.bot || bot.dead) return;
        if (currentRoll === false) {
            turnPlan.current = { mode: pickMode(bot.difficulty) };
            rollDice();
            return;
        }
        if (currentMoveCount >= currentRoll) return;
        if (!turnPlan.current.mode) turnPlan.current = { mode: pickMode(bot.difficulty) };
        const move = pickBestMove({
            botX: bot.x, botY: bot.y, botColor: bot.color,
            boardSize, players, flatSpaces: localGameState?.spaces?.flat() || [],
            mode: turnPlan.current.mode,
            movesLeftAfter: currentRoll - currentMoveCount - 1,
        });
        if (move) handlePlayerMove(move);
    }, [server, rollDice, handlePlayerMove]);
}
