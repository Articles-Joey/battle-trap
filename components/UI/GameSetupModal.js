"use client";

import { useEffect, useState } from "react";

import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import ArticlesButton from "@/components/UI/Button";
import Link from "next/link";
import { useStore } from "@/hooks/useStore";
import { usePathname } from "next/navigation";

export default function GameSetupModal({ show, setShow, preventClose }) {
    const pathname = usePathname();

    const nickname = useStore((state) => state.nickname);
    const setNickname = useStore((state) => state.setNickname);
    const character = useStore((state) => state.character);

    const [showModal, setShowModal] = useState(true);

    const [lightboxData, setLightboxData] = useState(null);

    const [tab, setTab] = useState("Controls");

    const [tempPlayers, setTempPlayers] = useState([]);

    const [botData, setBotData] = useState([]);

    const players = useStore((state) => state.players);
    const setPlayers = useStore((state) => state.setPlayers);

    const boardSize = useStore((state) => state.boardSize);
    const setBoardSize = useStore((state) => state.setBoardSize);

    const localGameState = useStore((state) => state.localGameState);
    const setLocalGameState = useStore((state) => state.setLocalGameState);

    useEffect(() => {
        if (show.type == "single-player") {
            setPlayersFromBotCount(3);
            // setBotData([
            //     ...[...Array(3).keys()].map(i => (
            //         {
            //             difficulty: "Medium"
            //         }
            //     ))
            // ])
        }

        if (show.type == "local-play") {
            setPlayersFromBotCount(2);

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
    }, [show]);

    function determineStartLocationFromPlayerNumberAndBoardSize(playerNumber) {
        // return { x: 0, y: 0 };

        switch (playerNumber) {
            case 0:
                return {
                    x: 0,
                    y: 0,
                    color: "red",
                };
            case 2:
                return {
                    x: boardSize - 1,
                    y: boardSize - 1,
                    color: "blue",
                };
            case 3:
                return {
                    x: 0,
                    y: boardSize - 1,
                    color: "yellow",
                };
            case 4:
                return {
                    x: boardSize - 1,
                    y: 0,
                    color: "green",
                };
        }

        // const row = Math.floor(playerNumber / boardSize);
        // const col = playerNumber % boardSize;
        // return { x: col, y: row };
    }

    function setPlayersFromBotCount(bot_count) {
        setTempPlayers([
            ...[...Array(4 - bot_count)].map((item, new_i) => ({
                id: `player-${new_i}`,
                battleTrap: {
                    nickname:
                        new_i == 0
                            ? nickname || `Player ${new_i + 1}`
                            : `Player ${new_i + 1}`,
                    color: "red",
                    ...determineStartLocationFromPlayerNumberAndBoardSize(
                        new_i,
                    ),
                    // y: determineStartLocationFromPlayerNumberAndBoardSize(new_i),
                    character: {
                        model: "low_poly_chopper.glb",
                        ...character,
                    },
                },
            })),

            ...[...Array(bot_count)].map((item, new_i) => ({
                id: `bot-${new_i}`,
                battleTrap: {
                    bot: true,
                    difficulty: "Medium",
                    nickname: `Bot ${new_i + 1}`,
                    color: "red",
                    ...determineStartLocationFromPlayerNumberAndBoardSize(
                        1 + new_i + 4 - bot_count,
                    ),
                    // x: 0,
                    // y: 0,
                    character: {
                        model: "low_poly_chopper.glb",
                    },
                },
            })),
        ]);
    }

    useEffect(() => {
        if (localGameState.moveTime < 3 && localGameState.moveTime !== false) {
            alert("Move timer can not be less than 3!");
            setLocalGameState({
                ...localGameState,
                moveTime: 20,
            });
        }
    }, [localGameState]);

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

            <Dialog
                className="articles-modal"
                maxWidth="sm"
                fullWidth
                open={Boolean(show) && showModal}
                aria-labelledby="game-setup-title"
                disableEscapeKeyDown={preventClose}
                slotProps={{
                    paper: { sx: { alignSelf: "flex-start", mt: 4 } },
                }}
                // To much jumping with little content for now
                // centered
                scroll="paper"
                onTransitionExited={() => {
                    if (preventClose) {
                        return;
                    }

                    setShow(false);
                }}
                onClose={() => {
                    if (preventClose) {
                        return;
                    }

                    setShowModal(false);
                }}
            >
                <DialogTitle
                    id="game-setup-title"
                    sx={{ pr: 7 }}
                >
                    Game Setup
                    {pathname !== "/play" && !preventClose && (
                        <IconButton
                            aria-label="Close game setup"
                            onClick={() => setShowModal(false)}
                            sx={{ position: "absolute", right: 8, top: 8 }}
                        >
                            <CloseIcon />
                        </IconButton>
                    )}
                </DialogTitle>

                <DialogContent
                    sx={{ p: 0, display: "flex", flexDirection: "column" }}
                >
                    {show.type == "single-player" && (
                        <div className="d-none p-3 border-bottom">
                            <div className="mb-3">
                                Adjust bot difficulty as needed.
                            </div>

                            <div className="">
                                {botData.map((item, i) => (
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
                                        <div>
                                            Bot {i + 1}: {item.difficulty}
                                        </div>

                                        <div className="p-2">
                                            {["Easy", "Medium", "Hard"].map(
                                                (
                                                    difficulty_item,
                                                    difficulty_i,
                                                ) => (
                                                    <ArticlesButton
                                                        key={`bot-difficulty-option-${difficulty_item}`}
                                                        active={
                                                            difficulty_item ==
                                                            botData[i]
                                                                .difficulty
                                                        }
                                                        onClick={() => {
                                                            let newData =
                                                                botData.map(
                                                                    (
                                                                        bot,
                                                                        index,
                                                                    ) => {
                                                                        if (
                                                                            index ==
                                                                            i
                                                                        ) {
                                                                            return {
                                                                                ...bot,
                                                                                difficulty:
                                                                                    difficulty_item,
                                                                            };
                                                                        }
                                                                        return bot;
                                                                    },
                                                                );

                                                            setBotData(newData);
                                                        }}
                                                    >
                                                        {difficulty_item}
                                                    </ArticlesButton>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(show.type == "single-player" ||
                        show.type == "local-play") && (
                        <div className="p-3 border-bottom">
                            <div className="">
                                How big of a board do you want to play on?
                            </div>

                            <Box
                                sx={{
                                    fontSize: "0.875em",
                                    color: "error.main",
                                    mb: "0.25rem",
                                }}
                            >
                                Experimental
                            </Box>

                            <div
                                className="mb-3 d-flex align-items-center"
                                style={
                                    {
                                        // pointerEvents: "none"
                                    }
                                }
                            >
                                <ArticlesButton
                                    aria-label="Decrease board size"
                                    onClick={() => {
                                        setBoardSize(boardSize - 1);
                                    }}
                                    disabled={boardSize <= 10}
                                >
                                    <RemoveIcon
                                        fontSize="inherit"
                                        sx={{ mr: "0.2rem" }}
                                    />
                                </ArticlesButton>

                                <TextField
                                    size="small"
                                    type="number"
                                    slotProps={{
                                        htmlInput: {
                                            min: 10,
                                            max: 50,
                                            step: 1,
                                            "aria-label": "Board size",
                                        },
                                    }}
                                    value={boardSize}
                                    onChange={(e) =>
                                        setBoardSize(
                                            Math.min(
                                                50,
                                                Math.max(
                                                    10,
                                                    Number(e.target.value) ||
                                                        10,
                                                ),
                                            ),
                                        )
                                    }
                                    className=""
                                />

                                <ArticlesButton
                                    aria-label="Increase board size"
                                    onClick={() => {
                                        setBoardSize(boardSize + 1);
                                    }}
                                    disabled={boardSize >= 50}
                                >
                                    <AddIcon
                                        fontSize="inherit"
                                        sx={{ mr: "0.2rem" }}
                                    />
                                </ArticlesButton>
                            </div>

                            {/* Move Timer */}
                            <div>
                                <div className="small mb-1">
                                    Would you like to add a move timer? Any
                                    remaining moves will be forfitted when time
                                    runs out.
                                </div>

                                <div className="mb-3 d-flex align-items-center">
                                    <ArticlesButton
                                        active={
                                            localGameState?.moveTime == false
                                        }
                                        onClick={() => {
                                            setLocalGameState({
                                                ...localGameState,
                                                moveTime: false,
                                            });
                                        }}
                                    >
                                        <span>Off</span>
                                    </ArticlesButton>
                                    <ArticlesButton
                                        className="me-3"
                                        active={
                                            localGameState?.moveTime !== false
                                        }
                                        onClick={() => {
                                            setLocalGameState({
                                                ...localGameState,
                                                moveTime: 20,
                                            });
                                        }}
                                    >
                                        <span>On</span>
                                    </ArticlesButton>

                                    {localGameState?.moveTime !== false && (
                                        <>
                                            <ArticlesButton
                                                aria-label="Decrease move timer"
                                                onClick={() => {
                                                    setLocalGameState({
                                                        ...localGameState,
                                                        moveTime:
                                                            (localGameState?.moveTime ||
                                                                0) - 5,
                                                    });
                                                }}
                                            >
                                                <RemoveIcon
                                                    fontSize="inherit"
                                                    sx={{ mr: "0.2rem" }}
                                                />
                                            </ArticlesButton>

                                            <TextField
                                                size="small"
                                                type="number"
                                                slotProps={{
                                                    htmlInput: {
                                                        min: 3,
                                                        max: 100,
                                                        "aria-label":
                                                            "Move timer in seconds",
                                                    },
                                                }}
                                                value={
                                                    localGameState?.moveTime ||
                                                    0
                                                }
                                                onChange={(e) =>
                                                    setLocalGameState({
                                                        ...localGameState,
                                                        moveTime: parseInt(
                                                            e.target.value,
                                                            10,
                                                        ),
                                                    })
                                                }
                                                className=""
                                            />

                                            <ArticlesButton
                                                aria-label="Increase move timer"
                                                onClick={() => {
                                                    setLocalGameState({
                                                        ...localGameState,
                                                        moveTime:
                                                            (localGameState?.moveTime ||
                                                                0) + 5,
                                                    });
                                                }}
                                            >
                                                <AddIcon
                                                    fontSize="inherit"
                                                    sx={{ mr: "0.2rem" }}
                                                />
                                            </ArticlesButton>
                                        </>
                                    )}
                                </div>
                            </div>

                            {
                                // show.type !== 'single-player'
                                true && (
                                    <div>
                                        <div className="small mb-1">
                                            How many bots do you want to play
                                            against?
                                        </div>

                                        <div className="mb-3">
                                            {["0", "1", "2", "3"].map(
                                                (item, i) => (
                                                    <ArticlesButton
                                                        key={`bot-amount-option-${i}`}
                                                        className={`${show.type == "single-player" && i == 0 && "d-none"}`}
                                                        active={
                                                            i ==
                                                            tempPlayers.filter(
                                                                (player) =>
                                                                    player
                                                                        .battleTrap
                                                                        ?.bot,
                                                            ).length
                                                        }
                                                        onClick={() => {
                                                            // let newData = [...Array(parseInt(item)).keys()].map(i => (
                                                            //     {
                                                            //         difficulty: "Easy"
                                                            //     }
                                                            // ))

                                                            setPlayersFromBotCount(
                                                                i,
                                                            );

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
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )
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

                            <div className="small mb-1">Player Data</div>

                            <div className="border px-3 pt-2">
                                {[
                                    // ...Array(4 - botData.length)
                                    ...tempPlayers,
                                ].map((item, i) => (
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
                                        <div>
                                            Enter nickname for{" "}
                                            {item?.battleTrap?.bot
                                                ? "bot"
                                                : "player"}
                                        </div>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            type="text"
                                            slotProps={{
                                                htmlInput: {
                                                    "aria-label": `Nickname for ${item?.battleTrap?.bot ? "bot" : "player"} ${i + 1}`,
                                                },
                                            }}
                                            placeholder="Nickname"
                                            value={item?.battleTrap?.nickname}
                                            onChange={(e) => {
                                                // e.preventDefault();
                                                setTempPlayers(
                                                    tempPlayers.map(
                                                        (player, index) => {
                                                            if (index == i) {
                                                                return {
                                                                    ...player,
                                                                    battleTrap:
                                                                        {
                                                                            ...player.battleTrap,
                                                                            nickname:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                };
                                                            }
                                                            return player;
                                                        },
                                                    ),
                                                );
                                            }}
                                        />

                                        {item?.battleTrap?.bot && (
                                            <div className="p-2">
                                                {["Easy", "Medium", "Hard"].map(
                                                    (
                                                        difficulty_item,
                                                        difficulty_i,
                                                    ) => (
                                                        <ArticlesButton
                                                            key={`bot-difficulty-option-${difficulty_item}`}
                                                            active={
                                                                difficulty_item ==
                                                                item?.battleTrap
                                                                    ?.difficulty
                                                            }
                                                            onClick={() => {
                                                                setTempPlayers(
                                                                    // players
                                                                    tempPlayers.map(
                                                                        (
                                                                            player,
                                                                            index,
                                                                        ) => {
                                                                            if (
                                                                                index ==
                                                                                i
                                                                            ) {
                                                                                return {
                                                                                    ...player,
                                                                                    battleTrap:
                                                                                        {
                                                                                            ...player.battleTrap,
                                                                                            difficulty:
                                                                                                difficulty_item,
                                                                                        },
                                                                                };
                                                                            }
                                                                            return player;
                                                                        },
                                                                    ),
                                                                );
                                                            }}
                                                        >
                                                            {difficulty_item}
                                                        </ArticlesButton>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </DialogContent>

                <DialogActions sx={{ justifyContent: "space-between" }}>
                    {/* <div></div> */}

                    <div>
                        {pathname !== "/play" && (
                            <ArticlesButton
                                variant="outline-dark"
                                onClick={() => {
                                    setShowModal(false);
                                }}
                            >
                                Close
                            </ArticlesButton>
                        )}

                        <ArticlesButton
                            variant="outline-danger"
                            sx={{ ml: "1rem" }}
                            onClick={() => {
                                // setShow(false)
                                setTempPlayers([]);
                                setPlayers([]);
                                setBotData([]);
                            }}
                        >
                            Reset
                        </ArticlesButton>
                    </div>

                    <Link
                        className={``}
                        href={{
                            pathname: `/play`,
                            query: { server: show.type },
                        }}
                    >
                        <ArticlesButton
                            variant="success"
                            onClick={() => {
                                setPlayers(tempPlayers);

                                setLocalGameState({
                                    ...localGameState,
                                    boardSize: boardSize,
                                    spaces: [
                                        {
                                            x: 0,
                                            y: 0,
                                            checked: {
                                                color: "red",
                                                move: 1,
                                                socket_id: "socket_id_1",
                                                playerMove: 0,
                                            },
                                        },
                                        {
                                            x: boardSize - 1,
                                            y: boardSize - 1,
                                            checked: {
                                                color: "blue",
                                                move: 1,
                                                socket_id: "socket_id_2",
                                                playerMove: 0,
                                            },
                                        },
                                        {
                                            x: 0,
                                            y: boardSize - 1,
                                            checked: {
                                                color: "yellow",
                                                move: 1,
                                                socket_id: "socket_id_3",
                                                playerMove: 0,
                                            },
                                        },
                                        {
                                            x: boardSize - 1,
                                            y: 0,
                                            checked: {
                                                color: "green",
                                                move: 1,
                                                socket_id: "socket_id_4",
                                                playerMove: 0,
                                            },
                                        },
                                    ],
                                });
                            }}
                        >
                            Start
                        </ArticlesButton>
                    </Link>
                </DialogActions>
            </Dialog>
        </>
    );
}
