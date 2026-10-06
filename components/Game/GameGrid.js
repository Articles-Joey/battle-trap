import { useMemo, useState } from "react";
import { Line } from "@react-three/drei";
import { useSocketStore } from "@/hooks/useSocketStore";
import { useStore } from "@/hooks/useStore";
import usePlayerMoveLogic from "@/hooks/usePlayerMoveLogic";
import { areTrailNeighbors, getAvailableMoves } from "@/util/gameBoard";

const SQUARE_POINTS = [
    [-1, 1, 0],
    [1, 1, 0],
    [1, -1, 0],
    [-1, -1, 0],
    [-1, 1, 0],
];

const WALL_CONNECTIONS = [
    { x: -1, y: 0, position: [0, 0, -0.5], size: [0.2, 1, 1] },
    { x: 1, y: 0, position: [0, 0, 0.5], size: [0.2, 1, 1] },
    { x: 0, y: -1, position: [-0.5, 0, 0], size: [1, 1, 0.2] },
    { x: 0, y: 1, position: [0.5, 0, 0], size: [1, 1, 0.2] },
];

function Wall({ space, spaceMap, color }) {
    return (
        <group position={[0, 0.2, 0]}>
            <mesh>
                <boxGeometry args={[0.2, 1, 0.2]} />
                <meshStandardMaterial
                    color={color}
                    transparent
                    opacity={0.5}
                />
            </mesh>
            {WALL_CONNECTIONS.map(({ x, y, position, size }) =>
                areTrailNeighbors(
                    space,
                    spaceMap.get(`${space.x + x},${space.y + y}`),
                ) ? (
                    <mesh
                        key={`${x},${y}`}
                        position={position}
                    >
                        <boxGeometry args={size} />
                        <meshStandardMaterial
                            color={color}
                            transparent
                            opacity={0.5}
                        />
                    </mesh>
                ) : null,
            )}
        </group>
    );
}

function BoardCell({ x, y, space, spaceMap, clickable, onMove, color }) {
    const [hovered, setHovered] = useState(false);
    const fill =
        hovered && clickable
            ? "orange"
            : space
              ? "#333333"
              : clickable
                ? "#002200"
                : "#000000";

    return (
        <group position={[y * 2, 0, x * 2]}>
            <Line
                position={[0, 0.01, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                points={SQUARE_POINTS}
                color={clickable ? "lime" : "cyan"}
                lineWidth={0.5}
            />
            {space && (
                <Wall
                    space={space}
                    spaceMap={spaceMap}
                    color={space.checked.color || color || "red"}
                />
            )}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                onClick={(event) => {
                    event.stopPropagation();
                    if (clickable) onMove({ x, y });
                }}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <planeGeometry args={[2, 2]} />
                <meshStandardMaterial color={fill} />
            </mesh>
        </group>
    );
}

export default function GameGrid({
    gameState,
    boardSize,
    server,
    players = [],
}) {
    const currentTurn = useStore((state) => state.currentTurn);
    const socket = useSocketStore((state) => state.socket);
    const handlePlayerMove = usePlayerMoveLogic(server);
    const local = server === "single-player" || server === "local-play";
    const activePlayer = (
        local ? players[currentTurn] : gameState?.status === "In Progress" && players[currentTurn]?.id === socket?.id
            ? players[currentTurn] : null
    )?.battleTrap;
    const flatSpaces = useMemo(
        () => gameState?.spaces?.flat() || [],
        [gameState?.spaces],
    );
    const spaceMap = useMemo(
        () =>
            new Map(
                flatSpaces
                    .filter((s) => s.checked)
                    .map((s) => [`${s.x},${s.y}`, s]),
            ),
        [flatSpaces],
    );
    const available = getAvailableMoves(boardSize, flatSpaces, activePlayer);
    const cells = [];

    for (let x = 0; x < boardSize; x++) {
        for (let y = 0; y < boardSize; y++) {
            const space = spaceMap.get(`${x},${y}`);
            cells.push(
                <BoardCell
                    key={`${x},${y}`}
                    x={x}
                    y={y}
                    space={space}
                    spaceMap={spaceMap}
                    color={
                        players.find((p) => p.id === space?.checked.socket_id)
                            ?.battleTrap?.color
                    }
                    clickable={available.some((s) => s.x === x && s.y === y)}
                    onMove={(target) => {
                        if (
                            !activePlayer ||
                            activePlayer.bot ||
                            activePlayer.dead
                        )
                            return;
                        handlePlayerMove({
                            x: target.x - activePlayer.x,
                            y: target.y - activePlayer.y,
                        });
                    }}
                />,
            );
        }
    }

    return cells;
}
