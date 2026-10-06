"use client";
import { useCallback } from "react";
import { useSocketStore } from "@/hooks/useSocketStore";
import { useStore } from "@/hooks/useStore";
import { sendGameAction } from "@/util/sendGameAction";

export default function usePlayerMoveLogic(server) {
    const socket = useSocketStore((state) => state.socket);

    return useCallback(
        (newSpaceData) => {
            // Read at input time so rapid clicks and bot moves use the latest position.
            const local = server === "single-player" || server === "local-play";
            if (local) {
                const previousTurn = useStore.getState().currentTurn;
                useStore.getState().resolveLocalGame();
                if (useStore.getState().currentTurn !== previousTurn) return;
            }
            const state = useStore.getState();
            const gameState = local ? state.localGameState : state.gameState;
            if (gameState?.gameOver) return;
            if (local && !gameState?.gameStarted) return;
            if (!local && (!socket.connected || gameState?.status !== "In Progress" || state.players[state.currentTurn]?.id !== socket.id)) return;
            const currentPlayer = local
                ? state.players[state.currentTurn]
                : state.players.find((p) => p.id === socket?.id);
            const currentPlay = currentPlayer?.battleTrap;
            if (!currentPlay || currentPlay.dead) return;

            if (state.currentRoll === false) {
                alert("Roll dice before moving!");
                return;
            }
            if (state.currentMoveCount >= state.currentRoll) return;

            if (
                !Number.isInteger(newSpaceData.x) ||
                !Number.isInteger(newSpaceData.y) ||
                Math.abs(newSpaceData.x) + Math.abs(newSpaceData.y) !== 1
            ) {
                alert("Too far away! You can only move one space at a time.");
                return;
            }

            const boardSize = gameState?.boardSize || state.boardSize;
            const flatSpaces = gameState?.spaces?.flat() || [];
            const targetX = currentPlay.x + newSpaceData.x;
            const targetY = currentPlay.y + newSpaceData.y;

            if (
                targetX < 0 ||
                targetX >= boardSize ||
                targetY < 0 ||
                targetY >= boardSize
            ) {
                alert("You can't move off the map!");
                return;
            }

            if (
                flatSpaces.some(
                    (s) => s.x === targetX && s.y === targetY && s.checked,
                )
            ) {
                alert("A wall is there! That space is already occupied.");
                return;
            }

            if (local) {
                state.addSpace({
                    space: { x: targetX, y: targetY },
                    player_color: currentPlay.color,
                });
            } else {
                sendGameAction(socket, "game:battle-trap-move", {
                    game_id: server,
                    x: targetX,
                    y: targetY,
                });
            }
        },
        [socket, server],
    );
}
