import { Canvas } from "@react-three/fiber";
import {
    Sky,
    useTexture,
    OrbitControls,
    Text,
    Billboard,
    Line,
} from "@react-three/drei";

import GameGrid from "./GameGrid";

import GroundPlane from "./Ground";
import { memo, useState } from "react";

import RenderModel from "./RenderModel";
import { useSocketStore } from "@/hooks/useSocketStore";
import { SkyBox } from "./SkyBox";
import { useStore } from "@/hooks/useStore";
// import { SciFiBuildingsPack } from "./SciFiBuildingsPackCorner";
// import { SciFiBuildingsPack as SciFiBuildingsPackSquare } from "./SciFiBuildingsPackSquare";
// import { degToRad } from "three/src/math/MathUtils";
import CornerBuildings from "./CornerBuildings";
import FillerBuildings from "./FillerBuildings";
import { SkyBoxCitySkyLine } from "./SkyBoxCitySkyLine";
import { getAvailableMoves, getPreviousTrailSpace } from "@/util/gameBoard";
// const RenderModel = dynamic(() => import('@/components/Games/Battle Trap/RenderModel'), {
//     ssr: false,
// });

// const boardSize = 20;

const FlatArrow = (props) => {
    return (
        <group {...props}>
            {/* Shaft */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.1, 1.5]}
            >
                <planeGeometry
                    attach="geometry"
                    args={[0.4, 1]}
                />
                <meshStandardMaterial
                    attach="material"
                    color={"red"}
                    transparent={true}
                    opacity={0.5}
                />
            </mesh>

            {/* Head */}
            {/* <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 2]}>
                <planeGeometry attach="geometry" args={[1, 0.5]} />
                <meshStandardMaterial attach="material" color={'purple'} />
            </mesh> */}

            {/* Left Blockout */}
            <mesh
                rotation={[-Math.PI / 2, 0, -Math.PI / 4]}
                position={[-0.212, 0.1, 2]}
            >
                <planeGeometry
                    attach="geometry"
                    args={[1, 0.4]}
                />
                <meshStandardMaterial
                    attach="material"
                    color={"red"}
                />
            </mesh>

            {/* Right Blockout */}
            <mesh
                rotation={[-Math.PI / 2, 0, Math.PI / 4]}
                position={[0.212, 0.1, 2]}
            >
                <planeGeometry
                    attach="geometry"
                    args={[1, 0.4]}
                />
                <meshStandardMaterial
                    attach="material"
                    color={"red"}
                />
            </mesh>

            {/* <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 1.5]}>

                <bufferGeometry attach="geometry">
                    <bufferAttribute
                        attachObject={["attributes", "position"]}
                        args={[f32array, 3]}
                    />
                </bufferGeometry>

                <meshBasicMaterial
                    attach="material"
                    color="#5243aa"
                    // wireframe={false}
                    side={DoubleSide}
                />

            </mesh> */}
        </group>
    );
};

function MovementArrows({ player_obj, flatSpaces, boardSize }) {
    const currentRoll = useStore((state) => state.currentRoll);
    const d12Texture = useTexture("/img/d12.svg");
    const player = player_obj.battleTrap;

    return (
        <group>
            {getAvailableMoves(boardSize, flatSpaces, player).map((space) => {
                const dx = space.x - player.x;
                const dy = space.y - player.y;
                return currentRoll === false ? (
                    <mesh
                        key={`${space.x},${space.y}`}
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[dx * 2, 0.15, -dy * 2]}
                    >
                        <planeGeometry args={[1.5, 1.5]} />
                        <meshBasicMaterial
                            map={d12Texture}
                            transparent
                        />
                    </mesh>
                ) : (
                    <FlatArrow
                        key={`${space.x},${space.y}`}
                        rotation={[0, Math.atan2(dx, -dy), 0]}
                    />
                );
            })}
        </group>
    );
}

function PlayerNameplate({ nickname, dead, turnProgress }) {
    const [width, setWidth] = useState(0);
    return (
        <Billboard position={[0, 2, 0]}>
            {turnProgress && !dead && (
                <Text
                    position={[0, 0.9, 0]}
                    fontSize={0.45}
                    color="#baffba"
                    anchorX="center"
                    anchorY="middle"
                >
                    {turnProgress}
                </Text>
            )}
            <Text
                color="pink"
                anchorX="center"
                anchorY="middle"
                onSync={(text) => {
                    const bounds = text.textRenderInfo?.blockBounds;
                    if (bounds) setWidth(bounds[2] - bounds[0]);
                }}
            >
                {nickname}
            </Text>
            {dead && width > 0 && (
                <Line
                    points={[
                        [-width / 2, 0, 0.02],
                        [width / 2, 0, 0.02],
                    ]}
                    color="#ff3333"
                    lineWidth={2.5}
                    depthTest={false}
                    toneMapped={false}
                />
            )}
        </Billboard>
    );
}

function getPlayerRotation(lookup, player_obj, server) {
    let rotation = [0, 0, 0];
    let axis = "y";

    if (!lookup || !player_obj?.battleTrap) return { rotation, axis };

    if (
        lookup.x == player_obj.battleTrap.x &&
        lookup.y < player_obj.battleTrap.y
    ) {
        rotation = [0, 0, 0];
        axis = "y";
    } else if (
        lookup.x == player_obj.battleTrap.x &&
        lookup.y > player_obj.battleTrap.y
    ) {
        rotation = [0, -Math.PI, 0];
        axis = "y";
    } else if (
        lookup.x < player_obj.battleTrap.x &&
        lookup.y == player_obj.battleTrap.y
    ) {
        rotation = [0, -Math.PI / 2, 0];
        axis = "x";
    } else if (
        lookup.x > player_obj.battleTrap.x &&
        lookup.y == player_obj.battleTrap.y
    ) {
        rotation = [0, Math.PI / 2, 0];
        axis = "x";
    }

    return { rotation, axis };
}

function GameCanvas(props) {
    // const searchParams = useSearchParams()
    // const searchParamsObject = Object.fromEntries(searchParams.entries());
    // const server = searchParamsObject?.server

    const { socket } = useSocketStore((state) => ({
        socket: state.socket,
    }));

    const storedBoardSize = useStore((state) => state.boardSize);
    const localGameState = useStore((state) => state.localGameState);
    const currentTurn = useStore((state) => state.currentTurn);
    const currentRoll = useStore((state) => state.currentRoll);
    const currentMoveCount = useStore((state) => state.currentMoveCount);

    // const defaultLocalGameState = useStore(state => state.defaultLocalGameState);
    // const setLocalGameState = useStore(state => state.setLocalGameState);
    // const resetGameState = useStore(state => state.resetGameState);
    // const theme = useStore(state => state.theme);
    const darkMode = useStore((state) => state.darkMode);
    // const addSpace = useStore(state => state.addSpace);

    // const GPUTier = useDetectGPU()

    const {
        handleCameraChange,
        gameState: multiplayerGameState,
        players,
        move,
        cameraInfo,
        server,
    } = props;

    let gameState;
    if (server == "single-player" || server == "local-play") {
        gameState = localGameState;
    } else {
        gameState = multiplayerGameState;
    }

    const flatSpaces = gameState?.spaces?.flat() || [];
    const boardSize = gameState?.boardSize || storedBoardSize;
    const currentPlayer = (
        server === "single-player" || server === "local-play"
            ? players[currentTurn]
            : players.find((p) => p.id === socket?.id)
    )?.battleTrap;

    return (
        <Canvas camera={{ position: [-10, 40, 40], fov: 50 }}>
            <OrbitControls
            // autoRotate={gameState.status == 'In Lobby'}
            />

            <Sky
                // distance={450000}
                sunPosition={[0, -10, 0]}
                // inclination={0}
                // azimuth={0.25}
                // {...props}
            />

            {darkMode && (
                <SkyBox
                    position={[0, 0, 0]}
                    scale={500}
                />
            )}

            {!darkMode && (
                <SkyBoxCitySkyLine
                    position={[0, -30, 0]}
                    // scale={500}
                />
            )}

            <CornerBuildings boardSize={boardSize} />

            <FillerBuildings boardSize={boardSize} />

            <GroundPlane
                args={[boardSize * 5.4, boardSize * 5.4]}
                position={[0, -0.1, 0]}
            />

            {/* <AreaHighlights 
                boardSize={boardSize}
            /> */}

            {/* <GroundPlane
                args={[(boardSize * 2), (boardSize * 2)]}
                position={[-(boardSize / 2), -0.1, -(boardSize / 2)]}
            />

            <GroundPlane
                args={[(boardSize * 2), (boardSize * 2)]}
                position={[(boardSize / 2), -0.1, -(boardSize / 2)]}
            />

            <GroundPlane
                args={[(boardSize * 2), (boardSize * 2)]}
                position={[-(boardSize / 2), -0.1, (boardSize / 2)]}
            /> */}

            <ambientLight intensity={5} />
            <spotLight
                intensity={30000}
                position={[-50, 100, 50]}
                angle={5}
                penumbra={1}
            />

            {/* <pointLight position={[-10, -10, -10]} /> */}

            <group position={[-boardSize, 0, boardSize - 2]}>
                {[
                    ...players,
                    // {
                    //     id: '123',
                    //     battleTrap: {
                    //         nickname: "Player 1",
                    //         color: "red",
                    //         x: 0,
                    //         y: 0,
                    //         character: {
                    //             model: "low_poly_chopper.glb"
                    //         }
                    //     }
                    // },
                    // {
                    //     id: '124',
                    //     battleTrap: {
                    //         nickname: "Player 2",
                    //         color: "blue",
                    //         x: 5,
                    //         y: 5,
                    //         character: {
                    //             model: "low_poly_chopper.glb"
                    //         }
                    //     }
                    // }
                ]?.map((player_obj) => {
                    // let rotation;

                    // let axis;

                    // console.log(gameState?.spaces?.flat())

                    const lookup = getPreviousTrailSpace(
                        flatSpaces,
                        player_obj.battleTrap,
                    );

                    const { rotation, axis } = getPlayerRotation(
                        lookup,
                        player_obj,
                        server,
                    );

                    return (
                        <group
                            key={player_obj.id}
                            position={[
                                player_obj.battleTrap.x * 2,
                                0,
                                -(player_obj.battleTrap.y * 2),
                            ]}
                        >
                            <PlayerNameplate
                                nickname={player_obj.battleTrap.nickname}
                                dead={player_obj.battleTrap.dead}
                                turnProgress={
                                    currentPlayer === player_obj.battleTrap
                                        ? currentRoll === false
                                            ? "Roll dice"
                                            : `Moves: ${currentMoveCount} / ${currentRoll}`
                                        : null
                                }
                            />

                            {/* <LowPolyChopper
                                position={[0, 0, 0]}
                                scale={0.002}
                                rotation={rotation}
                            /> */}

                            {player_obj?.battleTrap?.character?.model && (
                                <group
                                    scale={0.03}
                                    rotation={rotation}
                                    position={[0, 0.2, 0]}
                                >
                                    <RenderModel
                                        character={
                                            player_obj?.battleTrap?.character
                                        }
                                    />
                                </group>
                            )}

                            {/* Movement arrows - show available moves */}
                            {currentPlayer?.color ==
                                player_obj?.battleTrap?.color && (
                                <MovementArrows
                                    player_obj={player_obj}
                                    flatSpaces={flatSpaces}
                                    boardSize={boardSize}
                                />
                            )}

                            <mesh
                                position={[0, 0, 0]}
                                rotation={
                                    axis == "x"
                                        ? [0, -Math.PI / 2, 0]
                                        : [0, 0, 0]
                                }
                            >
                                <boxGeometry args={[0.2, 0.5, 2]} />
                                <meshStandardMaterial
                                    color={player_obj.battleTrap?.color}
                                    transparent={true}
                                    opacity={0.5}
                                />
                            </mesh>

                            {/* {axis == 'x' && <mesh
                                position={[0, 2, 0]}
                                rotation={[0, -Math.PI / 2, 0]}
                            >
                                <boxGeometry args={[0.2, 0.5, 2]} />
                                <meshStandardMaterial
                                    color={player_obj.battleTrap?.color}
                                    transparent={true}
                                    opacity={0.5}
                                />
                            </mesh>} */}

                            <mesh
                                position={[0, 0.05, 0]}
                                rotation={[-Math.PI / 2, 0, 0]}
                            >
                                <planeGeometry args={[2, 2]} />
                                <meshStandardMaterial
                                    color={
                                        player_obj.battleTrap?.dead
                                            ? "red"
                                            : player_obj.battleTrap?.color
                                    }
                                    transparent={true}
                                    opacity={1}
                                />
                            </mesh>
                        </group>
                    );
                })}
            </group>

            <group
                position={[-boardSize, 0, boardSize - 2]}
                rotation={[0, Math.PI / 2, 0]}
            >
                <GameGrid
                    server={server}
                    boardSize={boardSize}
                    // player={players.find(player => player.id == socket.id)}

                    gameState={gameState}
                    // gameState={localGameState}

                    players={players}
                    // move={move}
                />
            </group>

            {/* <PlayersGrid
                players={players}
                gameState={gameState}
            /> */}
        </Canvas>
    );
}

export default memo(GameCanvas);

function AreaHighlights({ boardSize }) {
    return (
        <>
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[-(boardSize / 2) * 2, 1, (boardSize / 2) * 2]}
            >
                <planeGeometry
                    attach="geometry"
                    args={[5, 5]}
                />
                <meshStandardMaterial
                    attach="material"
                    color={"red"}
                    transparent={true}
                    opacity={0.5}
                />
            </mesh>

            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[boardSize, 1, -boardSize]}
            >
                <planeGeometry
                    attach="geometry"
                    args={[5, 5]}
                />
                <meshStandardMaterial
                    attach="material"
                    color={"blue"}
                    transparent={true}
                    opacity={0.5}
                />
            </mesh>

            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[boardSize, 1, boardSize]}
            >
                <planeGeometry
                    attach="geometry"
                    args={[5, 5]}
                />
                <meshStandardMaterial
                    attach="material"
                    color={"green"}
                    transparent={true}
                    opacity={0.5}
                />
            </mesh>

            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[-(boardSize / 2) * 2, 1, -((boardSize / 2) * 2)]}
            >
                <planeGeometry
                    attach="geometry"
                    args={[5, 5]}
                />
                <meshStandardMaterial
                    attach="material"
                    color={"yellow"}
                    transparent={true}
                    opacity={0.5}
                />
            </mesh>
        </>
    );
}
