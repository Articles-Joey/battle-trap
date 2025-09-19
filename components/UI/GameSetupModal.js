import { useEffect, useState } from "react";

import { Modal, Form } from "react-bootstrap"

import ArticlesButton from "@/components/UI/Button";
import Link from "next/link";
import { useStore } from "@/hooks/useStore";

export default function GameSetupModal({
    show,
    setShow,
}) {

    const [showModal, setShowModal] = useState(true)

    const [lightboxData, setLightboxData] = useState(null)

    const [tab, setTab] = useState('Controls')

    const [botData, setBotData] = useState([])

    const players = useStore(state => state.players);
    const setPlayers = useStore(state => state.setPlayers);
    const boardSize = useStore(state => state.boardSize);

    useEffect(() => {

        if (show.type == 'single-player') {
            setBotData([
                ...[...Array(3).keys()].map(i => (
                    {
                        difficulty: "Medium"
                    }
                ))
            ])
        }

        if (show.type == 'local-play') {
            // setBotData([
            //     ...[...Array(3).keys()].map(i => (
            //         {
            //             difficulty: "Medium"
            //         }
            //     ))
            // ])
        }

    }, [show])

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
                        <div className='p-3 border-bottom'>

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

                    {show.type == 'local-play' &&
                        <div className='p-3 border-bottom'>

                            <div className=''>
                                How many bots do you want to play against?
                            </div>

                            <div className=''>
                                {[
                                    '0',
                                    '1',
                                    '2',
                                    '3'
                                ].map((item, i) =>
                                    <ArticlesButton
                                        key={`bot-amount-option-${i}`}
                                        active={i == botData.length}
                                        onClick={() => {

                                            let newData = [...Array(parseInt(item)).keys()].map(i => (
                                                {
                                                    difficulty: "Easy"
                                                }
                                            ))

                                            // console.log(
                                            //     newData
                                            // )

                                            setBotData(newData)
                                        }}
                                    >
                                        {item}
                                    </ArticlesButton>
                                )}
                            </div>

                            <div className='p-2 border-bottom mb-3'>
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

                            <div className=''>
                                Player Data
                            </div>

                            <div className='p-3'>
                                {[
                                    ...Array(4 - botData.length)
                                ].map((item, i) =>
                                    <div
                                        key={`player-info-${i}`}
                                        className="mb-2"
                                        // active={i == botData.length}
                                        onClick={() => {

                                            let newData = [...Array(parseInt(item)).keys()].map(i => (
                                                {
                                                    difficulty: "Easy"
                                                }
                                            ))

                                            // console.log(
                                            //     newData
                                            // )

                                            setBotData(newData)
                                        }}
                                    >
                                        <div>Enter nickname for player</div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Nickname"
                                            onChange={(e) => {
                                                e.preventDefault();
                                            }}
                                        />
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
                                setShow(false)
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
                                setPlayers([

                                    // ...[
                                    //     ...Array(4 - botData.length)
                                    // ].map((item, i) => ({

                                    // })),

                                    // ...[
                                    //     ...Array(botData.length)
                                    // ].map((item, i) => ({

                                    // })),

                                    {
                                        id: '1',
                                        battleTrap: {
                                            nickname: "Player 1",
                                            color: "red",
                                            x: 0,
                                            y: 0,
                                            character: {
                                                model: "low_poly_chopper.glb"
                                            }
                                        }
                                    },
                                    {
                                        id: '2',
                                        battleTrap: {
                                            nickname: "Player 2",
                                            color: "blue",
                                            x: boardSize - 1,
                                            y: boardSize - 1,
                                            character: {
                                                model: "low_poly_chopper.glb"
                                            }
                                        }
                                    },
                                    {
                                        id: '3',
                                        battleTrap: {
                                            nickname: "Player 3",
                                            color: "yellow",
                                            x: 0,
                                            y: boardSize - 1,
                                            character: {
                                                model: "low_poly_chopper.glb"
                                            }
                                        }
                                    },
                                    {
                                        id: '4',
                                        battleTrap: {
                                            nickname: "Player 4",
                                            color: "green",
                                            x: boardSize - 1,
                                            y: 0,
                                            character: {
                                                model: "low_poly_chopper.glb"
                                            }
                                        }
                                    }

                                ])
                            }}>
                            Start
                        </ArticlesButton>
                    </Link>

                </Modal.Footer>

            </Modal>
        </>
    )

}