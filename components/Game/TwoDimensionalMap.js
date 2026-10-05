"use client";

import Box from "@mui/material/Box";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { useSocketStore } from "@/hooks/useSocketStore";
import usePlayerMoveLogic from "@/hooks/usePlayerMoveLogic";
import { getAvailableMoves } from "@/util/gameBoard";
import {
    drawGameBoard2D,
    getBoardLayout,
    pointToBoardCell,
} from "@/util/drawGameBoard2D";

export default function TwoDimensionalMap({
    server,
    gameState: multiplayerGameState,
    players: providedPlayers,
}) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const [viewport, setViewport] = useState({
        width: 0,
        height: 0,
        pixelRatio: 1,
    });
    const [hoveredCell, setHoveredCell] = useState(null);
    const localGameState = useStore((state) => state.localGameState);
    const storedGameState = useStore((state) => state.gameState);
    const storedPlayers = useStore((state) => state.players);
    const storedBoardSize = useStore((state) => state.boardSize);
    const currentTurn = useStore((state) => state.currentTurn);
    const currentRoll = useStore((state) => state.currentRoll);
    const currentMoveCount = useStore((state) => state.currentMoveCount);
    const socket = useSocketStore((state) => state.socket);
    const handlePlayerMove = usePlayerMoveLogic(server);
    const local = server === "single-player" || server === "local-play";
    const gameState = local
        ? localGameState
        : multiplayerGameState || storedGameState;
    const players = providedPlayers || storedPlayers;
    const boardSize = gameState?.boardSize || storedBoardSize;
    const flatSpaces = useMemo(
        () => gameState?.spaces?.flat() || [],
        [gameState?.spaces],
    );
    const activePlayer = (
        local ? players[currentTurn] : players.find((p) => p.id === socket?.id)
    )?.battleTrap;
    const available = getAvailableMoves(boardSize, flatSpaces, activePlayer);
    const canInteract = activePlayer && !activePlayer.bot && !activePlayer.dead;
    const highlightedCell =
        canInteract &&
        available.some(
            (space) => space.x === hoveredCell?.x && space.y === hoveredCell?.y,
        )
            ? hoveredCell
            : null;

    useEffect(() => {
        const container = containerRef.current;
        const measure = () => {
            const { width, height } = container.getBoundingClientRect();
            setViewport({
                width,
                height,
                pixelRatio: window.devicePixelRatio || 1,
            });
        };
        const observer = new ResizeObserver(measure);
        observer.observe(container);
        window.addEventListener("resize", measure);
        measure();
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;
        canvas.width = Math.round(viewport.width * viewport.pixelRatio);
        canvas.height = Math.round(viewport.height * viewport.pixelRatio);
        context.setTransform(
            viewport.pixelRatio,
            0,
            0,
            viewport.pixelRatio,
            0,
            0,
        );
        drawGameBoard2D(context, {
            ...viewport,
            boardSize,
            flatSpaces,
            players,
            activePlayer,
            currentRoll,
            currentMoveCount,
            hoveredCell: highlightedCell,
        });
    }, [
        viewport,
        boardSize,
        flatSpaces,
        players,
        activePlayer,
        currentRoll,
        currentMoveCount,
        highlightedCell,
    ]);

    const getEventCell = (event) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return pointToBoardCell(
            ((event.clientX - rect.left) * viewport.width) / rect.width,
            ((event.clientY - rect.top) * viewport.height) / rect.height,
            getBoardLayout(viewport.width, viewport.height, boardSize),
            boardSize,
        );
    };

    return (
        <Box
            ref={containerRef}
            sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                minHeight: 0,
                bgcolor: "#080e14",
            }}
        >
            <canvas
                ref={canvasRef}
                aria-label="Battle Trap 2D board. Click or tap an adjacent green square to move. Use the arrow keys or WASD to move and Space to roll."
                style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    touchAction: "manipulation",
                    cursor: highlightedCell ? "pointer" : "default",
                }}
                onPointerMove={(event) => {
                    const cell = getEventCell(event);
                    const next =
                        canInteract &&
                        available.some(
                            (s) => s.x === cell?.x && s.y === cell?.y,
                        )
                            ? cell
                            : null;
                    setHoveredCell((previous) =>
                        previous?.x === next?.x && previous?.y === next?.y
                            ? previous
                            : next,
                    );
                }}
                onPointerLeave={() => setHoveredCell(null)}
                onClick={(event) => {
                    const cell = getEventCell(event);
                    if (
                        !canInteract ||
                        !available.some(
                            (s) => s.x === cell?.x && s.y === cell?.y,
                        )
                    )
                        return;
                    handlePlayerMove({
                        x: cell.x - activePlayer.x,
                        y: cell.y - activePlayer.y,
                    });
                    setHoveredCell(null);
                }}
            >
                Battle Trap board. Use the arrow keys or WASD to move and Space
                to roll.
            </canvas>
        </Box>
    );
}
