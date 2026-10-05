"use client";
import { useCallback } from "react";
import { useSocketStore } from "@/hooks/useSocketStore";
import { useStore } from "@/hooks/useStore";

export default function useRollDice(server) {
    const socket = useSocketStore((state) => state.socket);

    return useCallback(
        (min = 1, max = 10) => {
            if (server === "single-player" || server === "local-play") {
                const previousTurn = useStore.getState().currentTurn;
                useStore.getState().resolveLocalGame();
                const state = useStore.getState();
                const player = state.players[state.currentTurn]?.battleTrap;
                if (
                    !player ||
                    player.dead ||
                    state.localGameState?.gameOver ||
                    state.currentTurn !== previousTurn ||
                    state.currentRoll !== false
                )
                    return;
                const localGameState = state.localGameState;
                const roll = Math.floor(Math.random() * (max - min + 1)) + min;
                useStore.setState({
                    currentRoll: roll,
                    currentMoveCount: 0,
                    localGameState: {
                        ...localGameState,
                        moveTimer: localGameState?.moveTime,
                    },
                });
            }

            if (server !== "single-player" && server !== "local-play") {
                const player = useStore
                    .getState()
                    .players.find((p) => p.id === socket?.id)?.battleTrap;
                if (!player || player.dead) return;
                socket.emit("game:battle-trap:roll-dice", {
                    server: server,
                    settings: {},
                });
            }
        },
        [socket, server],
    );
}
