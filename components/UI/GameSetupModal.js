import { useEffect, useState } from "react";

import { Modal, Form } from "react-bootstrap"

import ArticlesButton from "@/components/UI/Button";
import Link from "next/link";
import { useStore } from "@/hooks/useStore";

export default function GameSetupModal({
    show,
    setShow,
}) {

    const nickname = useStore((state) => state.nickname)
    const setNickname = useStore((state) => state.setNickname)

    const [showModal, setShowModal] = useState(true)

    const [lightboxData, setLightboxData] = useState(null)

    const [tab, setTab] = useState('Controls')

    const [tempPlayers, setTempPlayers] = useState([])

    const [botData, setBotData] = useState([])

    const players = useStore(state => state.players);
    const setPlayers = useStore(state => state.setPlayers);

    const boardSize = useStore(state => state.boardSize);
    const setBoardSize = useStore(state => state.setBoardSize);

    const localGameState = useStore(state => state.localGameState);
    const setLocalGameState = useStore(state => state.setLocalGameState);

    useEffect(() => {

        if (show.type == 'single-player') {
            setPlayersFromBotCount(3)
            // setBotData([
            //     ...[...Array(3).keys()].map(i => (
            //         {
            //             difficulty: "Medium"
            //         }
            //     ))
            // ])
        }

        if (show.type == 'local-play') {

            setPlayersFromBotCount(2)

            // setBotData([
            //     ...[...Array(3).keys()].map(i => (
            //         {
            //             difficulty: "Medium"
            //         }
            //     ))
            // ])

            // setPlayers([

            //     ...[
            //         ...Array(1)
            //     ].map((item, new_i) => ({
            //         id: `bot-${new_i}`,
            //         battleTrap: {
            //             nickname: nickname || `Player ${new_i + 1}`,
            //             color: "red",
            //             x: 0,
            //             y: 0,
            //             character: {
            //                 model: "low_poly_chopper.glb"
            //             }
            //         }
            //     })),

            // ])


        }

    }, [show])

    function determineLocationFromPlayerNumberAndBoardSize(playerNumber) {

        // return { x: 0, y: 0 };

        switch (playerNumber) {
            case 0:
                return {
                    x: 0,
                    y: 0,
                    color: 'red',
                };
            case 2:
                return {
                    x: boardSize - 1,
                    y: boardSize - 1,
                    color: 'blue',
                };
            case 3:
                return {
                    x: 0,
                    y: boardSize - 1,
                    color: 'yellow',
                };
            case 4:
                return {
                    x: boardSize - 1,
                    y: 0,
                    color: 'green',
                };
        }

        // const row = Math.floor(playerNumber / boardSize);
        // const col = playerNumber % boardSize;
        // return { x: col, y: row };
    }

    function setPlayersFromBotCount(bot_count) {

        setTempPlayers([

            ...[
                ...Array(4 - bot_count)
            ].map((item, new_i) => ({
                id: `player-${new_i}`,
                battleTrap: {
                    nickname: new_i == 0 ? (nickname || `Player ${new_i + 1}`) : `Player ${new_i + 1}`,
                    color: "red",
                    ...determineLocationFromPlayerNumberAndBoardSize(new_i),
                    // y: determineLocationFromPlayerNumberAndBoardSize(new_i),
                    character: {
                        model: "low_poly_chopper.glb"
                    }
                }
            })),

            ...[
                ...Array(bot_count)
            ].map((item, new_i) => ({
                id: `bot-${new_i}`,
                battleTrap: {
                    bot: true,
                    difficulty: "Medium",
                    nickname: `Bot ${new_i + 1}`,
                    color: "red",
                    ...determineLocationFromPlayerNumberAndBoardSize(1 + new_i + 4 - bot_count),
                    // x: 0,
                    // y: 0,
                    character: {
                        model: "low_poly_chopper.glb"
                    }
                }
            })),

        ])

    }

    return (
        <>
            {/* {lightboxData && (
                <Lightbox
                    mainSrc={lightboxData?.location}
                    onCloseRequest={() => setLightboxData(null)}
                    reactModalStyle={{
                        overlay: {
                            zIndex: '2000'
                        }
                    }}
                />
            )} */}

            <Modal
                className="articles-modal"
                size='md'
                show={showModal}
                // To much jumping with little content for now
                // centered
                scrollable
                onExited={() => {
                    setShow(false)
                }}
                onHide={() => {
                    setShowModal(false)
                }}
            >

                <Modal.Header closeButton>
                    <Modal.Title>Game Setup</Modal.Title>
                </Modal.Header>

                <Modal.Body className="flex-column p-0">

                    {show.type == 'single-player' &&
                        <div className='d-none p-3 border-bottom'>

                            <div className='mb-3'>
                                Adjust bot difficulty as needed.
                            </div>

                            <div className=''>
                                {botData.map((item, i) =>
                                    <div
                                        key={`bot-data-option-${i}`}
                                        // active={i == botData}
                                        onClick={() => {
                                            // setBotData(
                                            //     [...Array(parseInt(item)).keys()].map(i => (
                                            //         {
                                            //             difficulty: "Easy"
                                            //         }
                                            //     ))
                                            // )
                                        }}
                                    >

                                        <div>Bot {i + 1}: {item.difficulty}</div>

                                        <div className='p-2'>
                                            {[
                                                'Easy',
                                                'Medium',
                                                'Hard',
                                            ].map((difficulty_item, difficulty_i) =>
                                                <ArticlesButton
                                                    key={`bot-difficulty-option-${difficulty_item}`}
                                                    active={difficulty_item == botData[i].difficulty}
                                                    onClick={() => {

                                                        let newData = botData.map((bot, index) => {
                                                            if (index == i) {
                                                                return {
                                                                    ...bot,
                                                                    difficulty: difficulty_item
                                                                }
                                                            }
                                                            return bot
                                                        })

                                                        setBotData(newData)

                                                    }}
                                                >
                                                    {difficulty_item}
                                                </ArticlesButton>
                                            )}
                                        </div>

                                    </div>
                                )}
                            </div>

                        </div>
                    }

                    {(show.type == 'single-player' || show.type == 'local-play') &&
                        <div className='p-3 border-bottom'>

                            <div className=''>
                                How big of a board do you want to play on?
                            </div>

                            <div className='mb-3 d-flex align-items-center'>

                                <ArticlesButton
                                    onClick={() => {

                                        setBoardSize(boardSize - 1)

                                    }}
                                >
                                    <i className='fad fa-minus'></i>
                                </ArticlesButton>

                                <input type="number" min="1" max="100" value={boardSize} onChange={(e) => setBoardSize(e.target.value)} className="" />

                                <ArticlesButton
                                    onClick={() => {
                                        setBoardSize(boardSize + 1)
                                    }}
                                >
                                    <i className='fad fa-plus'></i>
                                </ArticlesButton>

                            </div>

                            {show.type !== 'single-player' &&
                                <div>
                                    <div className=''>
                                        How many bots do you want to play against?
                                    </div>

                                    <div className='mb-3'>
                                        {[
                                            '0',
                                            '1',
                                            '2',
                                            '3'
                                        ].map((item, i) =>
                                            <ArticlesButton
                                                key={`bot-amount-option-${i}`}
                                                active={
                                                    i
                                                    ==
                                                    tempPlayers.filter(player => player.battleTrap?.bot).length
                                                }
                                                onClick={() => {

                                                    // let newData = [...Array(parseInt(item)).keys()].map(i => (
                                                    //     {
                                                    //         difficulty: "Easy"
                                                    //     }
                                                    // ))

                                                    setPlayersFromBotCount(i)

                                                    // setPlayers([

                                                    //     // ...[
                                                    //     //     ...Array(4 - botData.length)
                                                    //     // ].map((item, i) => ({

                                                    //     // })),

                                                    //     // {
                                                    //     //     id: '1',
                                                    //     //     battleTrap: {
                                                    //     //         nickname: nickname || "Player 1",
                                                    //     //         color: "red",
                                                    //     //         x: 0,
                                                    //     //         y: 0,
                                                    //     //         character: {
                                                    //     //             model: "low_poly_chopper.glb"
                                                    //     //         }
                                                    //     //     }
                                                    //     // },



                                                    //     // {
                                                    //     //     id: '2',
                                                    //     //     battleTrap: {
                                                    //     //         nickname: "Player 2",
                                                    //     //         color: "blue",
                                                    //     //         x: boardSize - 1,
                                                    //     //         y: boardSize - 1,
                                                    //     //         character: {
                                                    //     //             model: "low_poly_chopper.glb"
                                                    //     //         }
                                                    //     //     }
                                                    //     // },
                                                    //     // {
                                                    //     //     id: '3',
                                                    //     //     battleTrap: {
                                                    //     //         nickname: "Player 3",
                                                    //     //         color: "yellow",
                                                    //     //         x: 0,
                                                    //     //         y: boardSize - 1,
                                                    //     //         character: {
                                                    //     //             model: "low_poly_chopper.glb"
                                                    //     //         }
                                                    //     //     }
                                                    //     // },
                                                    //     // {
                                                    //     //     id: '4',
                                                    //     //     battleTrap: {
                                                    //     //         nickname: "Player 4",
                                                    //     //         color: "green",
                                                    //     //         x: boardSize - 1,
                                                    //     //         y: 0,
                                                    //     //         character: {
                                                    //     //             model: "low_poly_chopper.glb"
                                                    //     //         }
                                                    //     //     }
                                                    //     // }

                                                    // ])

                                                    // console.log(
                                                    //     newData
                                                    // )

                                                    // setBotData(newData)
                                                }}
                                            >
                                                {item}
                                            </ArticlesButton>
                                        )}
                                    </div>
                                </div>
                            }

                            {/* <div className='d-none p-2 border-bottom mb-3'>
                                {botData.map((item, i) =>
                                    <div
                                        key={`bot-data-option-${i}`}
                                        // active={i == botData}
                                        onClick={() => {
                                            // setBotData(
                                            //     [...Array(parseInt(item)).keys()].map(i => (
                                            //         {
                                            //             difficulty: "Easy"
                                            //         }
                                            //     ))
                                            // )
                                        }}
                                    >

                                        <div>Bot {i + 1}: {item.difficulty}</div>

                                        <div className='p-2'>
                                            {[
                                                'Easy',
                                                'Medium',
                                                'Hard',
                                            ].map((difficulty_item, difficulty_i) =>
                                                <ArticlesButton
                                                    key={`bot-difficulty-option-${difficulty_item}`}
                                                    active={difficulty_item == botData[i].difficulty}
                                                    onClick={() => {

                                                        let newData = botData.map((bot, index) => {
                                                            if (index == i) {
                                                                return {
                                                                    ...bot,
                                                                    difficulty: difficulty_item
                                                                }
                                                            }
                                                            return bot
                                                        })

                                                        setBotData(newData)

                                                    }}
                                                >
                                                    {difficulty_item}
                                                </ArticlesButton>
                                            )}
                                        </div>

                                    </div>
                                )}
                            </div> */}

                            <div className=''>
                                Player Data
                            </div>

                            <div className='p-3'>
                                {[
                                    // ...Array(4 - botData.length)
                                    ...tempPlayers
                                ].map((item, i) =>
                                    <div
                                        key={`player-info-${i}`}
                                        className="mb-2"
                                        // active={i == botData.length}
                                        onClick={() => {

                                            // let newData = [...Array(parseInt(item)).keys()].map(i => (
                                            //     {
                                            //         difficulty: "Easy"
                                            //     }
                                            // ))

                                            // console.log(
                                            //     newData
                                            // )

                                            // setBotData(newData)
                                        }}
                                    >

                                        <div>Enter nickname for {item?.battleTrap?.bot ? 'bot' : 'player'}</div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Nickname"
                                            value={item?.battleTrap?.nickname}
                                            onChange={(e) => {
                                                // e.preventDefault();
                                                setTempPlayers(tempPlayers.map((player, index) => {
                                                    if (index == i) {
                                                        return {
                                                            ...player,
                                                            battleTrap: {
                                                                ...player.battleTrap,
                                                                nickname: e.target.value
                                                            }
                                                        }
                                                    }
                                                    return player
                                                }))
                                            }}
                                        />

                                        {item?.battleTrap?.bot &&
                                            <div className='p-2'>
                                                {[
                                                    'Easy',
                                                    'Medium',
                                                    'Hard',
                                                ].map((difficulty_item, difficulty_i) =>
                                                    <ArticlesButton
                                                        key={`bot-difficulty-option-${difficulty_item}`}
                                                        active={difficulty_item == item?.battleTrap?.difficulty}
                                                        onClick={() => {

                                                            setTempPlayers(
                                                                // players
                                                                tempPlayers.map((player, index) => {
                                                                    if (index == i) {
                                                                        return {
                                                                            ...player,
                                                                            battleTrap: {
                                                                                ...player.battleTrap,
                                                                                difficulty: difficulty_item
                                                                            }
                                                                        }
                                                                    }
                                                                    return player
                                                                })
                                                            )

                                                        }}
                                                    >
                                                        {difficulty_item}
                                                    </ArticlesButton>
                                                )}
                                            </div>
                                        }

                                    </div>
                                )}
                            </div>

                        </div>
                    }

                </Modal.Body>

                <Modal.Footer className="justify-content-between">

                    {/* <div></div> */}


                    <div>

                        <ArticlesButton
                            variant="outline-dark"
                            onClick={() => {
                                setShow(false)
                            }}
                        >
                            Close
                        </ArticlesButton>

                        <ArticlesButton
                            variant="outline-danger ms-3"
                            onClick={() => {
                                // setShow(false)
                                setTempPlayers([])
                                setPlayers([])
                                setBotData([])
                            }}
                        >
                            Reset
                        </ArticlesButton>

                    </div>


                    <Link
                        className={``}
                        href={{
                            pathname: `/play`,
                            query: { server: show.type }
                        }}
                    >
                        <ArticlesButton
                            variant="success" onClick={() => {

                                setPlayers(tempPlayers)

                                setLocalGameState({
                                    ...localGameState,
                                    spaces: [
                                        {
                                            x: 0,
                                            y: 0,
                                            checked: {
                                                color: 'red',
                                                move: 1,
                                                socket_id: 'socket_id_1',
                                            }
                                        },
                                        {
                                            x: boardSize - 1,
                                            y: boardSize - 1,
                                            checked: {
                                                color: 'blue',
                                                move: 1,
                                                socket_id: 'socket_id_1',
                                            }
                                        },
                                        {
                                            x: 0,
                                            y: boardSize - 1,
                                            checked: {
                                                color: 'yellow',
                                                move: 1,
                                                socket_id: 'socket_id_1',
                                            }
                                        },
                                        {
                                            x: boardSize - 1,
                                            y: 0,
                                            checked: {
                                                color: 'green',
                                                move: 1,
                                                socket_id: 'socket_id_1',
                                            }
                                        },
                                    ]
                                })

                            }}>
                            Start
                        </ArticlesButton>
                    </Link>

                </Modal.Footer>

            </Modal>
        </>
    )

}