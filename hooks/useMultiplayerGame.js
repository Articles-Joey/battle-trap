"use client";
import { useEffect } from "react";
import { useStore } from "@/hooks/useStore";
import { useSocketStore } from "@/hooks/useSocketStore";

export default function useMultiplayerGame(server) {
    const socket = useSocketStore((state) => state.socket);
    const local = server === "single-player" || server === "local-play";

    useEffect(() => {
        if (local || !server) return;
        const room = `game:battle-trap-room-${server}`;
        let active = true;
        const clear = () => useStore.setState({
            players: [], gameState: {}, boardSize: 20,
            currentTurn: -1, currentRoll: false, currentMoveCount: 0,
        });
        const receive = (data) => {
            const game = data?.game_state;
            if (!active || String(game?.server_id) !== server) return;
            useStore.setState({
                players: data.players || [], gameState: game, boardSize: game.boardSize,
                currentTurn: game.currentTurn, currentRoll: game.currentRoll,
                currentMoveCount: game.currentMoveCount, multiplayerError: null,
            });
        };
        const join = () => {
            clear();
            useStore.setState({ multiplayerError: null });
            const { nickname, character } = useStore.getState();
            socket.timeout(10000).emit("join-room", room, {
                client_version: "2", game_id: server, nickname, character,
            }, (error, result) => {
                if (!active) return;
                if (error || !result?.ok) useStore.setState({
                    multiplayerError: error ? "Could not join the room. Reconnect to try again." : result?.error || "Could not join the room.",
                });
            });
        };
        const disconnect = () => {
            clear();
            useStore.setState({ multiplayerError: "Disconnected. Waiting to reconnect…" });
        };
        const reportError = (data) => useStore.setState({ multiplayerError: data?.message || "Room action failed." });
        clear();
        socket.on(room, receive);
        socket.on("connect", join);
        socket.on("disconnect", disconnect);
        socket.on("game:battle-trap:error", reportError);
        if (socket.connected) join();
        return () => {
            active = false;
            socket.off(room, receive);
            socket.off("connect", join);
            socket.off("disconnect", disconnect);
            socket.off("game:battle-trap:error", reportError);
            if (socket.connected) socket.emit("leave-room", room, { game_id: server });
            // Do not clear shared players here: navigation may have just started a local game.
        };
    }, [local, server, socket]);
}
