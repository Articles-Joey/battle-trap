import { Canvas } from "@react-three/fiber"
import { Sky, useDetectGPU, useTexture, OrbitControls, Text, Billboard } from "@react-three/drei";

import GameGrid from "./GameGrid";

import GroundPlane from "./Ground";
import { LowPolyChopper } from "./Bikes";
import { DoubleSide, Vector3 } from "three";
import { memo, useEffect, useMemo } from "react";

import RenderModel from "./RenderModel";
import { useSocketStore } from "@/hooks/useSocketStore";
import { SkyBox } from "./SkyBox";
import { useStore } from "@/hooks/useStore";
// import { SciFiBuildingsPack } from "./SciFiBuildingsPackCorner";
// import { SciFiBuildingsPack as SciFiBuildingsPackSquare } from "./SciFiBuildingsPackSquare";
// import { degToRad } from "three/src/math/MathUtils";
import CornerBuildings from "./CornerBuildings";
import FillerBuildings from "./FillerBuildings";
// const RenderModel = dynamic(() => import('@/components/Games/Battle Trap/RenderModel'), {
//     ssr: false,
// });

const boardSize = 20;

const FlatArrow = (props) => {

    return (
        <group
            {...props}
        >

            {/* Shaft */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 1.5]}>
                <planeGeometry attach="geometry" args={[0.4, 1]} />
                <meshStandardMaterial attach="material" color={'red'} transparent={true} opacity={0.5} />
            </mesh>

            {/* Head */}
            {/* <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 2]}>
                <planeGeometry attach="geometry" args={[1, 0.5]} />
                <meshStandardMaterial attach="material" color={'purple'} />
            </mesh> */}

            {/* Left Blockout */}
            <mesh rotation={[-Math.PI / 2, 0, -Math.PI / 4]} position={[-0.212, 0.1, 2]}>
                <planeGeometry attach="geometry" args={[1, 0.4]} />
                <meshStandardMaterial attach="material" color={'red'} />
            </mesh>

            {/* Right Blockout */}
            <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[0.212, 0.1, 2]}>
                <planeGeometry attach="geometry" args={[1, 0.4]} />
                <meshStandardMaterial attach="material" color={'red'} />
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

function GameCanvas(props) {

    // const searchParams = useSearchParams()
    // const searchParamsObject = Object.fromEntries(searchParams.entries());
    // const server = searchParamsObject?.server

    const {
        socket,
    } = useSocketStore(state => ({
        socket: state.socket,
    }));

    const localGameState = useStore(state => state.localGameState);
    const defaultLocalGameState = useStore(state => state.defaultLocalGameState);
    const setLocalGameState = useStore(state => state.setLocalGameState);
    const addSpace = useStore(state => state.addSpace);

    useEffect(() => {

        console.log("localGameState", localGameState, defaultLocalGameState)

        if (!localGameState) {
            console.log("Set state to default")
            setLocalGameState(
                defaultLocalGameState
            )
        }

    }, [])

    // const GPUTier = useDetectGPU()

    const {
        handleCameraChange,
        gameState: multiplayerGameState,
        players,
        move,
        cameraInfo,
        server
    } = props;

    let gameState
    if (
        server == 'single-player'
        ||
        server == 'local-play'
    ) {
        gameState = localGameState
    } else {
        gameState = multiplayerGameState
    }

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

            <SkyBox
                position={[0, 0, 0]}
                scale={500}
            />

            <CornerBuildings
                boardSize={boardSize}
            />

            <FillerBuildings
                boardSize={boardSize}
            />

            <GroundPlane
                args={[(boardSize * 5.4), (boardSize * 5.4)]}
                position={[
                    0,
                    -0.1,
                    0]}
            />

            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[
                    -((boardSize) / 2) * 2,
                    1,
                    ((boardSize) / 2) * 2
                ]}
            >
                <planeGeometry attach="geometry" args={[5, 5]} />
                <meshStandardMaterial attach="material" color={'red'} transparent={true} opacity={0.5} />
            </mesh>

            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[
                    ((boardSize)),
                    1,
                    -((boardSize))
                ]}
            >
                <planeGeometry attach="geometry" args={[5, 5]} />
                <meshStandardMaterial attach="material" color={'blue'} transparent={true} opacity={0.5} />
            </mesh>

            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[
                    ((boardSize)),
                    1,
                    ((boardSize))
                ]}
            >
                <planeGeometry attach="geometry" args={[5, 5]} />
                <meshStandardMaterial attach="material" color={'green'} transparent={true} opacity={0.5} />
            </mesh>



            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[
                    -((boardSize) / 2) * 2,
                    1,
                    -((boardSize) / 2 * 2)
                ]}
            >
                <planeGeometry attach="geometry" args={[5, 5]} />
                <meshStandardMaterial attach="material" color={'yellow'} transparent={true} opacity={0.5} />
            </mesh>

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
            <spotLight intensity={30000} position={[-50, 100, 50]} angle={5} penumbra={1} />

            {/* <pointLight position={[-10, -10, -10]} /> */}

            <group position={[-(boardSize), 0, (boardSize - 2)]}>

                {[
                    ...players
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
                ]?.map(player_obj => {

                    let rotation;

                    let axis;

                    console.log(gameState?.spaces?.flat())

                    let lastMove = (gameState.move - 2)

                    console.log("Last move number", lastMove)

                    let lookup = gameState?.spaces?.flat().find(space_obj => (
                        space_obj.checked.move == lastMove
                        &&
                        space_obj.checked.socket_id == player_obj.id
                    ))

                    console.log("Last move lookup", lookup)

                    // if (
                    //     !player_obj?.battleTrap?.x
                    //     &&
                    //     !player_obj?.battleTrap?.y
                    //     &&
                    //     !player_obj?.battleTrap?.x == 0
                    //     &&
                    //     !player_obj?.battleTrap?.y == 0
                    // ) {
                    //     return
                    // }

                    if (
                        lookup?.x == player_obj.battleTrap?.x
                        &&
                        lookup?.y < player_obj.battleTrap?.y
                    ) {
                        console.log('1')
                        rotation = [0, 0, 0]
                        axis = 'y'
                    }

                    if (
                        lookup?.x == player_obj.battleTrap?.x
                        &&
                        lookup?.y > player_obj.battleTrap?.y
                    ) {
                        console.log('2')
                        rotation = [0, -Math.PI, 0]
                        axis = 'y'
                    }

                    if (
                        lookup?.x < player_obj.battleTrap?.x
                        &&
                        lookup?.y == player_obj.battleTrap?.y
                    ) {
                        console.log('3')
                        rotation = [0, -Math.PI / 2, 0]
                        axis = 'x'
                    }

                    if (
                        lookup?.x > player_obj.battleTrap?.x
                        &&
                        lookup?.y == player_obj.battleTrap?.y
                    ) {
                        console.log('4')
                        rotation = [0, Math.PI / 2, 0]
                        axis = 'x'
                    }

                    console.log(rotation)

                    return (
                        <group key={player_obj.id} position={[(player_obj.battleTrap.x * 2), 0, -(player_obj.battleTrap.y * 2)]}>

                            <Billboard

                            >
                                <Text
                                    position={[0, 2, 0]}
                                    color="pink"
                                    anchorX="center"
                                    anchorY="middle"
                                    scale={1}
                                >
                                    {player_obj.battleTrap.nickname}
                                    {/* {player_obj.battleTrap.x} */}
                                </Text>
                            </Billboard>

                            {/* <LowPolyChopper
                                position={[0, 0, 0]}
                                scale={0.002}
                                rotation={rotation}
                            /> */}

                            {player_obj?.battleTrap?.character?.model &&
                                <group
                                    scale={0.03}
                                    rotation={rotation}
                                    position={[0, 0.2, 0]}
                                >
                                    <RenderModel character={player_obj?.battleTrap?.character} />
                                </group>
                            }

                            {/* Movement arrows - Only show for self */}
                            {
                                // player_obj.id == socket.id 
                                true
                                &&
                                <group>

                                    {/* Left */}
                                    {
                                        gameState?.spaces?.flat().find(space_obj => (
                                            space_obj.x == (player_obj.battleTrap.x - 1)
                                            &&
                                            space_obj.y == (player_obj.battleTrap.y)
                                            &&
                                            !space_obj.checked
                                        )
                                        )
                                        &&
                                        <FlatArrow rotation={[0, -Math.PI / 2, 0]} color="blue" size={10} />
                                    }

                                    {/* Right */}
                                    {
                                        gameState?.spaces?.flat().find(space_obj => (
                                            space_obj.x == (player_obj.battleTrap.x + 1)
                                            &&
                                            space_obj.y == (player_obj.battleTrap.y)
                                            &&
                                            !space_obj.checked
                                        )
                                        )
                                        &&
                                        <FlatArrow rotation={[0, Math.PI / 2, 0]} color="blue" size={10} />
                                    }

                                    {/* Back */}
                                    {
                                        gameState?.spaces?.flat().find(space_obj => (
                                            space_obj.x == (player_obj.battleTrap.x)
                                            &&
                                            space_obj.y == (player_obj.battleTrap.y - 1)
                                            // &&
                                            // !space_obj.checked
                                        )
                                        )
                                        &&
                                        <FlatArrow rotation={[0, 0, 0]} color="blue" size={10} />
                                    }

                                    {/* Forward */}
                                    {
                                        gameState?.spaces?.find(space_obj => (
                                            space_obj.x == player_obj.battleTrap.x
                                            &&
                                            space_obj.y == (player_obj.battleTrap.y + 1)
                                            // &&
                                            // !space_obj.checked
                                        ))
                                        // ||
                                        // true
                                        &&
                                        <FlatArrow rotation={[0, -Math.PI, 0]} color="blue" size={10} />
                                    }

                                </group>
                            }

                            <mesh
                                position={[0, 0, 0]}
                                rotation={
                                    axis == 'x' ? [0, -Math.PI / 2, 0] : [0, 0, 0]
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

                            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} >
                                <planeGeometry args={[2, 2]} />
                                <meshStandardMaterial
                                    color={player_obj.battleTrap?.dead ? 'red' : player_obj.battleTrap?.color}
                                    transparent={true}
                                    opacity={1}
                                />
                            </mesh>

                        </group>
                    )
                })}

            </group>

            <group
                position={[-(boardSize), 0, (boardSize - 2)]}
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
    )
}

export default memo(GameCanvas)