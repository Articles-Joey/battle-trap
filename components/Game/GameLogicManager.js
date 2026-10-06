"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { useStore } from "@/hooks/useStore";
import useMultiplayerGame from "@/hooks/useMultiplayerGame";
import usePlayerMoveLogic from "@/hooks/usePlayerMoveLogic";
import useCurrentPlayer from "@/hooks/useCurrentPlayer";
import useRollDice from "@/hooks/useRollDice";
import useBotTurnLogic from "@/hooks/useBotTurnLogic";

export default function GameLogicManager() {
    const server = useSearchParams().get("server");
    const local = server === "single-player" || server === "local-play";
    useMultiplayerGame(server);
    const localGameState = useStore((state) => state.localGameState);
    const players = useStore((state) => state.players);
    const currentTurn = useStore((state) => state.currentTurn);
    const currentRoll = useStore((state) => state.currentRoll);
    const currentMoveCount = useStore((state) => state.currentMoveCount);
    const enterLocalLobby = useStore((state) => state.enterLocalLobby);
    const resolveLocalGame = useStore((state) => state.resolveLocalGame);
    const currentPlayer = useCurrentPlayer();
    const hasCurrentPlayer = Boolean(currentPlayer);
    const handlePlayerMove = usePlayerMoveLogic(server);
    const rollDice = useRollDice(server);
    const calculateBotTurnLogic = useBotTurnLogic(server);

    useEffect(() => {
        if (local) enterLocalLobby(server);
    }, [local, server, enterLocalLobby]);

    // Also reconcile restored games and turn changes made outside the move action.
    useEffect(() => {
        if (local) resolveLocalGame();
    }, [
        local,
        players,
        localGameState?.spaces,
        localGameState?.boardSize,
        localGameState?.gameOver,
        localGameState?.gameStarted,
        currentTurn,
        currentRoll,
        currentMoveCount,
        resolveLocalGame,
    ]);

    useEffect(() => {
        if (
            !local ||
            !localGameState?.gameStarted ||
            localGameState?.gameOver ||
            !currentPlayer?.bot ||
            currentPlayer.dead
        )
            return;
        const timeout = setTimeout(
            () => {
                // Ignore callbacks left over from an eliminated player's turn.
                if (useStore.getState().currentTurn === currentTurn)
                    calculateBotTurnLogic();
            },
            currentRoll === false ? 600 : 800,
        );
        return () => clearTimeout(timeout);
    }, [
        local,
        currentPlayer?.bot,
        currentPlayer?.dead,
        localGameState?.gameStarted,
        localGameState?.gameOver,
        currentTurn,
        currentRoll,
        currentMoveCount,
        calculateBotTurnLogic,
    ]);

    useEffect(() => {
        if (
            !local ||
            !localGameState?.gameStarted ||
            localGameState?.gameOver ||
            !hasCurrentPlayer ||
            currentPlayer?.dead ||
            localGameState?.moveTime === false ||
            currentRoll === false
        )
            return;

        const interval = setInterval(() => {
            const state = useStore.getState();
            if (
                state.currentTurn !== currentTurn ||
                !state.localGameState?.gameStarted ||
                state.currentRoll === false ||
                state.localGameState?.gameOver ||
                state.players[state.currentTurn]?.battleTrap?.dead
            )
                return;
            const gameState = state.localGameState;
            const timer = (gameState.moveTimer ?? gameState.moveTime) - 1;
            if (timer <= 0) {
                state.endLocalTurn();
            } else {
                state.setLocalGameState({ ...gameState, moveTimer: timer });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [
        local,
        hasCurrentPlayer,
        localGameState?.gameStarted,
        localGameState?.gameOver,
        currentPlayer?.dead,
        localGameState?.moveTime,
        currentTurn,
        currentRoll,
    ]);

    useHotkeys(["w", "ArrowUp"], () => handlePlayerMove({ x: 0, y: 1 }), [
        handlePlayerMove,
    ]);
    useHotkeys(["s", "ArrowDown"], () => handlePlayerMove({ x: 0, y: -1 }), [
        handlePlayerMove,
    ]);
    useHotkeys(["a", "ArrowLeft"], () => handlePlayerMove({ x: -1, y: 0 }), [
        handlePlayerMove,
    ]);
    useHotkeys(["d", "ArrowRight"], () => handlePlayerMove({ x: 1, y: 0 }), [
        handlePlayerMove,
    ]);
    useHotkeys(["space"], () => rollDice(), [rollDice]);

    return null;
}
