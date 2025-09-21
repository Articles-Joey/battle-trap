import { useEffect, useContext, useRef, useState, useMemo } from 'react';

import { Line, Plane } from '@react-three/drei';
import { DoubleSide, Vector3 } from 'three';
import { useSocketStore } from '@/hooks/useSocketStore';
import { useStore } from '@/hooks/useStore';
import { useSearchParams } from 'next/navigation';

const SquareWithLines = (props) => {

    const { color } = props
    const squareSize = 2;

    return (
        <group {...props}  >
            {/* Draw lines */}
            <Line
                position={[0, 0.01, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                points={[
                    new Vector3(-squareSize / 2, squareSize / 2, 0),
                    new Vector3(squareSize / 2, squareSize / 2, 0),
                    new Vector3(squareSize / 2, -squareSize / 2, 0),
                    new Vector3(-squareSize / 2, -squareSize / 2, 0),
                    new Vector3(-squareSize / 2, squareSize / 2, 0),
                ]}
                color={color || 'cyan'}
                lineWidth={0.5}
            />

            {/* See-through inside */}
            {/* <Plane args={[squareSize, squareSize]} position={[0, 0, -0.1]} receiveShadow>
                <meshBasicMaterial color="transparent" opacity={0.5} side={DoubleSide} />
            </Plane> */}
        </group>
    );
};

const Wall = (props) => {

    const { flatSpaces, clickableData, checked, color } = props;

    const wallHeight = 1;

    return (
        <group {...props} dispose={null}>

            {/* Center */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.2, wallHeight, 0.2]} />
                <meshStandardMaterial
                    color={color}
                    transparent={true}
                    opacity={0.5}
                />
            </mesh>

            {/* Forward and Back */}
            <group>
                {flatSpaces.find(obj => {

                    return (
                        obj.x == (clickableData.x - 1)
                        &&
                        obj.y == clickableData.y
                        &&
                        (
                            (obj.checked.move - 1) == checked.checked.move
                            ||
                            (obj.checked.move + 1) == checked.checked.move
                        )
                    )

                })?.checked?.socket_id == checked.checked.socket_id &&
                    <mesh position={[0, 0, -0.5]}>
                        <boxGeometry args={[0.2, wallHeight, 1]} />
                        <meshStandardMaterial
                            color={color}
                            transparent={true}
                            opacity={0.5}
                        />
                    </mesh>
                }

                {flatSpaces.find(obj => {

                    return (
                        obj.x == (clickableData.x + 1)
                        &&
                        obj.y == clickableData.y
                        &&
                        (
                            (obj.checked.move - 1) == checked.checked.move
                            ||
                            (obj.checked.move + 1) == checked.checked.move
                        )
                    )

                })?.checked?.socket_id == checked.checked.socket_id &&
                    <mesh position={[0, 0, 0.5]}>
                        <boxGeometry args={[0.2, wallHeight, 1]} />
                        <meshStandardMaterial
                            color={color}
                            transparent={true}
                            opacity={0.5}
                        />
                    </mesh>
                }
            </group>

            {/* Left and Right */}
            <group>
                {flatSpaces.find(obj => {

                    return (
                        obj.y == (clickableData.y - 1)
                        &&
                        obj.x == clickableData.x
                        &&
                        (
                            (obj.checked.move - 1) == checked.checked.move
                            ||
                            (obj.checked.move + 1) == checked.checked.move
                        )
                    )

                })?.checked?.socket_id == checked.checked.socket_id &&
                    <mesh position={[-0.5, 0, 0]}>
                        <boxGeometry args={[1, wallHeight, 0.2]} />
                        <meshStandardMaterial
                            color={color}
                            transparent={true}
                            opacity={0.5}
                        />
                    </mesh>
                }

                {flatSpaces.find(obj => {

                    return (
                        obj.y == (clickableData.y + 1)
                        &&
                        obj.x == clickableData.x
                        &&
                        (
                            (obj.checked.move - 1) == checked.checked.move
                            ||
                            (obj.checked.move + 1) == checked.checked.move
                        )
                    )

                })?.checked?.socket_id == checked.checked.socket_id &&
                    <mesh position={[0.5, 0, 0]}>
                        <boxGeometry args={[1, wallHeight, 0.2]} />
                        <meshStandardMaterial
                            color={color}
                            transparent={true}
                            opacity={0.5}
                        />
                    </mesh>
                }
            </group>

        </group>
    );
};

const MysterySquareWithLines = (props) => {
    const squareSize = 1;

    return (
        <group {...props}  >
            {/* Draw lines */}
            <Line
                position={[0, 0.27, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                points={[
                    new Vector3(-squareSize / 2, squareSize / 2, 0),
                    new Vector3(squareSize / 2, squareSize / 2, 0),
                    new Vector3(squareSize / 2, -squareSize / 2, 0),
                    new Vector3(-squareSize / 2, -squareSize / 2, 0),
                    new Vector3(-squareSize / 2, squareSize / 2, 0),
                ]}
                color="yellow"
                lineWidth={0.5}
            />

            {/* See-through inside */}
            {/* <Plane args={[squareSize, squareSize]} position={[0, 0, -0.1]} receiveShadow>
                <meshBasicMaterial color="transparent" opacity={0.5} side={DoubleSide} />
            </Plane> */}
        </group>
    );
};

function Box(props) {

    const searchParams = useSearchParams()
    const searchParamsObject = Object.fromEntries(searchParams.entries());

    const currentTurn = useStore(state => state.currentTurn);

    const {
        socket
    } = useSocketStore(state => ({
        socket: state.socket,
    }));

    const { checked, players, flatSpaces, clickable, clickableData, move, server, hasMystery, usedMysteryLookup, box_index, } = props

    // This reference gives us direct access to the THREE.Mesh object
    const ref = useRef()

    const borderRef = useRef()

    // Hold state for hovered and clicked events
    const [hovered, hover] = useState(false)
    const [clicked, click] = useState(false)

    const [calculatedColor, setCalculatedColor] = useState('#000')

    const colorLookup = useMemo(() => {

        // let color = players.find(player_obj => player_obj.id == checked?.checked?.socket_id)?.battleTrap?.color

        // Just store the color on in the space object instead of looking up player each time
        let color = checked?.checked?.color

        return color

    }, [checked, players])

    useEffect(() => {

        if (hovered) {
            setCalculatedColor('orange')
            return
        }

        if (checked) {
            setCalculatedColor(colorLookup)
            setCalculatedColor('#333333')
            return
        }

        setCalculatedColor('#000000')

    }, [checked, hovered])

    const localGameState = useStore(state => state.localGameState);
    const setLocalGameState = useStore(state => state.setLocalGameState);
    const addSpace = useStore(state => state.addSpace);

    // Subscribe this component to the render-loop, rotate the mesh every frame
    // useFrame((state, delta) => (ref.current.rotation.x += 0.01))

    // useFrame((state, delta) => (ref.current))

    // useEffect(() => {

    //     if (hovered && clickable) {
    //         setHoveredList(prev => [
    //             ...prev,
    //             box_index
    //         ])
    //     } else {
    //         setHoveredList(prev => [
    //             ...prev.filter(item => item !== box_index)
    //         ])
    //     }

    // }, [hovered])

    // Return the view, these are regular ThreeJS elements expressed in JSX
    return (
        <group>

            <SquareWithLines
                {...props}
            />

            {checked &&
                <group position={[0, 0.2, 0]}>
                    <Wall
                        {...props}
                        color={colorLookup || 'red'}
                    // position={[0, 1.5, 0]}
                    />
                </group>
            }

            {/* {(hasMystery && !usedMysteryLookup) &&
                <>
                    <MysterySquareWithLines {...props} />
                    <Star {...props} />
                </>
            } */}

            {/* Black border */}
            {/* <mesh ref={borderRef} {...props} >
                <boxGeometry args={[2.02, 0.55, 2.02]} />
                <meshBasicMaterial
                    color="#000000"
                    wireframe
                />
            </mesh> */}

            {/* Main box */}
            <mesh
                {...props}
                ref={ref}
                onClick={(event) => {

                    console.log(`Clicked here`)
                    console.log(clickableData)

                    let currentPlayer = players[currentTurn]
                    console.log("this is current player", currentPlayer)

                    // Check if currentPlayer can make this move


                    if (searchParamsObject.server == "single-player") {

                        let newSpace = {
                            x: clickableData.x,
                            y: clickableData.y,
                            checked: {
                                color: currentPlayer?.battleTrap?.color,
                                move: (localGameState?.spaces?.length || 0) + 1,
                                socket_id: 'socket_id_1',
                            }
                        }

                        console.log("single-player", newSpace)

                        // addSpace(newSpace)
                        addSpace({
                            space: newSpace,
                            player_color: currentPlayer?.battleTrap?.color
                        })

                    }

                    if (searchParamsObject.server == "local-play") {
                        console.log("local-play")
                    }

                    socket.emit('game:battle-trap-move', {
                        game_id: server,
                        x: clickableData.x,
                        y: clickableData.y
                    });

                    return

                    if (clickable) {
                        console.log("TODO - Move player based on box space from player", clickableData)
                        console.log(`Player wants to move ${clickableData.j - (clickableData.x + 1)} spaces`)
                        move(clickableData.j - (clickableData.x + 1))
                    }

                    click(!clicked);
                    hover(true);
                }}
                onPointerOver={() => hover(true)}
                onPointerOut={() => hover(false)}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                {/* <boxGeometry args={[2, 0.5, 2]} /> */}
                <planeGeometry args={[2, 2]} />
                <meshStandardMaterial
                    color={calculatedColor}
                />
            </mesh>

        </group>
    )
}

function GameGrid(props) {

    const { gameState, player, move, boardSize, server, players } = props
    const { spaces } = gameState

    let starRows = []

    for (var i = 0; i < boardSize; i++) {

        let starCol = []

        for (var j = 0; j < boardSize; j++) {

            // j is the column
            // i is the row

            let edgeTile
            // let edgeTile = (j == 1 || j == 15)

            let hasMysteryLookup
            // let hasMysteryLookup = (
            //     mystery_spots?.find((player) => (player.row === i + 1 && player.x === j - 1))
            // );

            let usedMysteryLookup
            // let usedMysteryLookup = gameState?.used_mystery_spots?.find((spot_player) => (spot_player?.race_game?.row == (i + 1)))

            let clickable = false
            // if (
            //     player?.battleTrap?.row == (i + 1)
            //     &&
            //     (
            //         player?.battleTrap?.x === j - 2
            //         ||
            //         player?.battleTrap?.x === j - 3
            //         ||
            //         player?.battleTrap?.x === j - 4
            //         ||
            //         player?.battleTrap?.x === j - 5
            //     )
            //     &&
            //     !player?.battleTrap?.pickedSpace
            // ) {
            //     clickable = true
            // }

            // The 4 spaces in front of user should have a different color to indicate selection

            // onHover and onClick for box to move instead of having to go to bottom and for touch devices 

            starCol[j] = (
                <Box
                    key={j}
                    server={server}
                    players={players}
                    box_index={j}
                    // color={
                    //     (edgeTile) ? 'rgb(160, 120, 73)' : (clickable ? 'rgb(19, 197, 197)' : ((hasMysteryLookup && !usedMysteryLookup) ? 'rgb(255, 193, 7)' : ''))
                    // }
                    clickable={clickable}
                    clickableData={{
                        x: i,
                        y: j
                    }}
                    position={[j * 2, 0, i * 2]}
                    move={move}
                    player={player}
                    checked={
                        spaces?.flat()?.find(space_obj => (space_obj.x == i && space_obj.y == j && space_obj.checked))
                    }
                    user_color={
                        spaces?.flat()?.find(space_obj => (space_obj.x == i && space_obj.y == j && space_obj.checked))?.checked?.socket_id
                    }
                    flatSpaces={spaces?.flat()}
                // hasMystery={hasMysteryLookup}
                // usedMysteryLookup={usedMysteryLookup}
                // setHoveredList={setHoveredList}
                // hoveredList={hoveredList}
                />
            )

        }

        starRows[i] = starCol

    }

    return starRows

}

export default GameGrid