"use client";
import Box from "@mui/material/Box";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import InfoIcon from "@mui/icons-material/Info";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GroupIcon from "@mui/icons-material/Group";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import DangerousIcon from "@mui/icons-material/Dangerous";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CodeIcon from "@mui/icons-material/Code";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";
import Looks4Icon from "@mui/icons-material/Looks4";
import Looks5Icon from "@mui/icons-material/Looks5";
import Looks6Icon from "@mui/icons-material/Looks6";
import { useState, useEffect, useRef, useMemo } from "react";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
    useSearchParams,
    useRouter,
    usePathname,
    useParams,
} from "next/navigation";

// import BasicLoading from '@/components/loading/BasicLoading';
// import Countdown from 'react-countdown';
import { add } from "date-fns";
import ArticlesButton from "@/components/UI/Button";
import useFullscreen from "@/hooks/useFullScreen";
// import { useHotkeys } from 'react-hotkeys-hook';
import IsDev from "@/components/UI/IsDev";
import { useSocketStore } from "@/hooks/useSocketStore";
import { useStore } from "@/hooks/useStore";

import TwoDimensionalMap from "@/components/Game/TwoDimensionalMap";

// import usePlayerMoveLogic from '@/hooks/usePlayerMoveLogic';

import GameLogicManager from "@/components/Game/GameLogicManager";

import GameMenuPrimaryButtonGroup from "@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup";

import useRollDice from "@/hooks/useRollDice";
import useCurrentPlayer from "@/hooks/useCurrentPlayer";
import usePlayerMoveLogic from "@/hooks/usePlayerMoveLogic";

const diceIcons = {
    1: LooksOneIcon,
    2: LooksTwoIcon,
    3: Looks3Icon,
    4: Looks4Icon,
    5: Looks5Icon,
    6: Looks6Icon,
};

function DiceIcon({ value, sx }) {
    const Icon = diceIcons[value];
    return Icon ? (
        <Icon
            titleAccess={`Dice roll: ${value}`}
            sx={{
                fontSize: "3em",
                mr: "0.2rem",
                verticalAlign: "middle",
                ...sx,
            }}
        />
    ) : null;
}

export default function SideMenu() {
    const socket = useSocketStore((state) => state.socket);

    // const theme = useStore(state => state.theme);
    // const setTheme = useStore(state => state.setTheme);
    // const darkMode = useStore(state => state.darkMode);
    // const setDarkMode = useStore(state => state.setDarkMode);

    const showMenu = useStore((state) => state.showMenu);
    // const toggleShowMenu = useStore(state => state.toggleShowMenu);

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    const threeDimensional = useStore((state) => state.threeDimensional);
    const setThreeDimensional = useStore((state) => state.setThreeDimensional);

    const nickname = useStore((state) => state.nickname);
    const character = useStore((state) => state.character);

    const localGameState = useStore((state) => state.localGameState);
    const gameState = useStore((state) => state.gameState);
    const setLocalGameState = useStore((state) => state.setLocalGameState);
    const addSpace = useStore((state) => state.addSpace);

    const setShowInfoModal = useStore((state) => state.setShowInfoModal);
    const setShowSettingsModal = useStore(
        (state) => state.setShowSettingsModal,
    );
    const setShowInviteModal = useStore((state) => state.setShowInviteModal);

    const setGameState = useStore((state) => state.setGameState);

    const players = useStore((state) => state.players);
    const setPlayers = useStore((state) => state.setPlayers);

    const currentTurn = useStore((state) => state.currentTurn);
    const setCurrentTurn = useStore((state) => state.setCurrentTurn);

    const currentRoll = useStore((state) => state.currentRoll);
    const setCurrentRoll = useStore((state) => state.setCurrentRoll);

    const currentMoveCount = useStore((state) => state.currentMoveCount);
    const setCurrentMoveCount = useStore((state) => state.setCurrentMoveCount);
    const incCurrentMoveCount = useStore((state) => state.incCurrentMoveCount);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const searchParamsObject = Object.fromEntries(searchParams.entries());
    // const params = useParams()
    const server = searchParamsObject?.server;
    const local = server === "single-player" || server === "local-play";

    const handlePlayerMove = usePlayerMoveLogic(server);

    const currentPlayer = useCurrentPlayer();
    const winner = players.find(
        (player) => player.id === localGameState?.winnerId,
    );

    const rollDice = useRollDice(server);

    const [showPlayers, setShowPlayers] = useState(true);

    return (
        <Box
            sx={{
                zIndex: { xs: 10, lg: 1 },
                p: "1rem",
                overflowY: "auto",
                borderRight: { xs: 0, lg: "1px solid #000" },
                bgcolor: {
                    xs: "rgba(0, 0, 0, 0.75)",
                    lg: "rgba(0, 0, 0, 0.25)",
                },
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                position: { xs: "fixed", lg: "relative" },
                width: { xs: "100%", lg: 300 },
                maxWidth: 300,
                height: {
                    xs: "calc(100vh - 50px)",
                    lg: "calc(100vh - var(--top-position))",
                },
                top: { xs: "var(--top-position)", lg: "auto" },
                left: { xs: 0, lg: "auto" },
                transform: {
                    xs: showMenu ? "translateX(0)" : "translateX(-100%)",
                    lg: "none",
                },
                transition: "transform 200ms",
                flexBasis: { lg: 300 },
                flexShrink: 0,
                flexGrow: { lg: 1 },
                fontSize: { lg: "0.8rem" },
                ...(isFullscreen && {
                    position: "absolute",
                    zIndex: 2,
                    top: "50%",
                    left: "1rem",
                    transform: "translateY(-50%)",
                    height: "auto",
                    maxHeight: "100vh",
                    bgcolor: "rgba(0, 0, 0, 0.75)",
                }),
            }}
            className={`menu-card ${showMenu && "show"}`}
        >
            {server == "single-player" && (
                <div className="d-none card card-articles card-sm mb-2">
                    <div className="card-body p-2">
                        {/* <div className='mb-2'>
                                Single Player - {`Red's`} Turn
                            </div> */}

                        <div>
                            {/* {players.map((player_obj, i) => <div
                                    key={`${player_obj}-${i}`}
                                    className="player open p-1"
                                >

                                    <div className='d-flex align-items-center mb-1'>
                                        <PersonIcon fontSize="inherit" sx={{ width: 30, mr: "0.2rem" }} />
                                        <h5 className='mb-0'>{player_obj?.battleTrap?.nickname || '?'}</h5>
                                    </div>

                                    <ArticlesButton
                                        small
                                        active={i == currentTurn}
                                        variant='warning'
                                        onClick={() => {
                                            setCurrentTurn(i)
                                        }}
                                    >
                                        Turn
                                    </ArticlesButton>

                                </div>)} */}

                            {/* <div>Red (You)</div>
                                <div>Blue (Bot)</div>
                                <div>Green (Bot)</div>
                                <div>Yellow (Bot)</div> */}
                            {/* 
                                <div>{gameState?.status == 'In Lobby' && 'In Lobby - Waiting for players'}</div>
                                <div>{gameState?.status == 'In Progress' && 'In Progress - Your Turn'}</div> */}
                        </div>
                    </div>
                </div>
            )}

            {server == "local-play" && (
                <div className="d-none card card-articles card-sm mb-2">
                    <div className="card-body p-2">
                        <div>Local Play</div>

                        <div>
                            {gameState?.status == "In Lobby" &&
                                "In Lobby - Waiting for players"}
                            {gameState?.status == "In Progress" &&
                                "In Progress - Your Turn"}
                        </div>
                    </div>
                </div>
            )}

            {server !== "single-player" && server !== "local-play" && (
                <div className="card card-articles card-sm mb-2">
                    <div className="card-body p-2">
                        <div>Room: {server}</div>
                        <div>
                            {gameState?.status == "In Lobby" &&
                                "In Lobby - Waiting for players"}
                            {gameState?.status == "In Progress" &&
                                "In Progress - Your Turn"}
                        </div>
                    </div>
                </div>
            )}

            <div className="d-flex mb-2">
                {server !== "single-player" && server !== "local-play" && (
                    <ArticlesButton
                        className="flex-grow-1"
                        disabled={
                            gameState?.status !== "In Lobby" ||
                            (players?.length || 0) < 2
                        }
                        small
                        onClick={() => {
                            socket.emit("game:battle-trap:start-game", {
                                server: server,
                                settings: {},
                            });
                        }}
                    >
                        <PlayArrowIcon
                            fontSize="inherit"
                            sx={{ mr: "0.2rem" }}
                        />
                        <span>Start Game</span>

                        <span className="badge bg-dark ms-2">
                            {`2+ Players`}
                        </span>
                    </ArticlesButton>
                )}

                <IsDev>
                    <ArticlesButton
                        className="w-100"
                        variant="warning"
                        small
                        onClick={() => {
                            socket.emit("game:battle-trap:start-game", {
                                server: server,
                                settings: {},
                            });
                        }}
                    >
                        <PlayArrowIcon fontSize="inherit" />
                    </ArticlesButton>
                </IsDev>
            </div>

            <Box
                sx={{
                    display: "flex",
                    // flexDirection: 'column',
                    flexWrap: "wrap",
                    mb: 2,
                }}
            >
                <GameMenuPrimaryButtonGroup
                    useStore={useStore}
                    type="GameMenu"
                    useRouter={useRouter}
                />
            </Box>

            <div className="mb-3 d-flex">
                <ArticlesButton
                    className="w-100"
                    small
                    onClick={() => {
                        // setShowInfoModal({
                        //     game: 'Battle Trap'
                        // })
                        setThreeDimensional(!threeDimensional);
                    }}
                >
                    <InfoIcon
                        fontSize="inherit"
                        sx={{ mr: "0.2rem" }}
                    />
                    <span>{threeDimensional ? "3D Mode" : "2D Mode"}</span>
                </ArticlesButton>
            </div>

            {/* {localGameState?.gameStarted ? '1' : '0'} */}

            {/* Tile Moves */}
            <div className="card card-articles card-sm mb-2">
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                    className="card-header flex-header"
                >
                    <div>Tile Moves</div>
                    <span className="badge bg-dark">
                        <span>0 Left</span>
                    </span>
                </Box>

                <div className="card-body text-center">
                    <Box
                        sx={{
                            fontSize: "1.75rem",
                            fontWeight: 500,
                            lineHeight: 1.2,
                        }}
                        className="h3 mb-0"
                    >
                        {
                            gameState?.status == "In Lobby" ? (
                                <span>Awaiting game start</span>
                            ) : (
                                <span>{localGameState?.moveTimer}</span>
                            )
                            // <Countdown
                            //     date={gameState?.moveTimer}
                            // />
                        }
                    </Box>
                </div>
            </div>

            {/* Dice Roll */}
            <div className="card card-articles card-sm mb-2">
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                    className="card-header flex-header"
                >
                    <div className="d-flex justify-content-center align-items-center">
                        <span>Dice Roll</span>
                    </div>

                    <div>
                        <span className="badge bg-dark">
                            <span>Moves: </span>

                            <span>{gameState?.turn?.spaces}</span>
                            <span>{currentMoveCount}</span>

                            <span>/</span>

                            <span>
                                {currentRoll === false ? "?" : currentRoll}
                            </span>
                        </span>
                        {/* <span className='badge bg-dark ms-2'>
                                <span>{currentRoll || 0} Left</span>
                            </span> */}
                    </div>
                </Box>

                <div className="card-body text-center">
                    {local && localGameState?.gameOver
                        ? winner
                            ? `${winner.battleTrap.nickname || winner.battleTrap.color || "Player"} wins!`
                            : "Game over: no winner"
                        : local && (!currentPlayer || currentPlayer.dead)
                          ? "No players left to move"
                          : currentRoll === false
                            ? `${currentPlayer?.nickname} Please Roll`
                            : currentRoll}

                    {gameState?.status == "In Lobby" && !gameState?.turn && (
                        <>
                            <DiceIcon value={4} />
                            <DiceIcon
                                value={2}
                                sx={{ mr: 0 }}
                            />
                        </>
                    )}

                    <DiceIcon value={gameState?.turn?.dice_one} />
                    <DiceIcon
                        value={gameState?.turn?.dice_two}
                        sx={{ mr: 0 }}
                    />
                </div>

                <div className="card-footer d-flex justify-content-center align-items-center">
                    {/* <ArticlesButton
                            className="flex-grow-1"
                            onClick={() => {
                                rollDice()
                            }}
                        >
                            <PlayArrowIcon fontSize="inherit" sx={{ mr: "0.2rem" }} />
                            <span>Auto</span>
                            <span className="badge bg-dark ms-1">Off</span>
                        </ArticlesButton> */}

                    <ArticlesButton
                        small
                        className="flex-grow-1"
                        disabled={
                            currentRoll !== false ||
                            (local &&
                                (!currentPlayer ||
                                    currentPlayer.dead ||
                                    currentPlayer.bot))
                        }
                        onClick={() => {
                            rollDice();
                        }}
                    >
                        <PlayArrowIcon
                            fontSize="inherit"
                            sx={{ mr: "0.2rem" }}
                        />
                        <span>Roll Dice</span>
                    </ArticlesButton>
                </div>
            </div>

            {/* Players */}
            <div className="card card-articles card-sm mb-2 mt-auto">
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                    className="card-header flex-header"
                >
                    <ArticlesButton
                        small
                        className="py-1"
                        aria-label={
                            showPlayers ? "Hide players" : "Show players"
                        }
                        aria-expanded={showPlayers}
                        active={showPlayers}
                        onClick={() => {
                            setShowPlayers((prev) => !prev);
                        }}
                    >
                        <VisibilityIcon fontSize="inherit" />
                    </ArticlesButton>

                    {/* <span>Players</span> */}

                    <span className="badge bg-dark">
                        <span className="me-2">
                            <GroupIcon
                                fontSize="inherit"
                                sx={{ mr: "0.2rem", verticalAlign: "middle" }}
                            />
                            {
                                players?.filter(
                                    (player) => !player.battleTrap?.bot,
                                )?.length
                            }
                        </span>

                        <span>
                            <SmartToyIcon
                                fontSize="inherit"
                                sx={{ mr: "0.2rem", verticalAlign: "middle" }}
                            />
                            {
                                players?.filter(
                                    (player) => player.battleTrap?.bot,
                                )?.length
                            }
                        </span>
                    </span>
                </Box>

                {showPlayers && (
                    <>
                        <div className="card-body p-2">
                            <div className="players mb-0">
                                {players.map((player_obj, i) => (
                                    <Box
                                        sx={{
                                            border: "1px solid rgba(0, 0, 0, 0.3)",
                                            p: "0.5rem 1rem",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            "&:not(:last-child)": {
                                                mb: "0.5rem",
                                            },
                                            "&.active-turn": {
                                                borderLeft: "6px solid #000",
                                            },
                                            "&.open": {
                                                cursor: "pointer",
                                                "&:hover": { bgcolor: "gray" },
                                            },
                                        }}
                                        key={`${player_obj}-${i}`}
                                        className="player open p-1"
                                        onClick={() => {}}
                                    >
                                        <div className="d-flex align-items-center ">
                                            {player_obj?.battleTrap?.dead ? (
                                                <DangerousIcon
                                                    titleAccess="Eliminated player"
                                                    fontSize="inherit"
                                                    sx={{
                                                        color: "#ff3333",
                                                        width: 30,
                                                        mr: "0.2rem",
                                                    }}
                                                />
                                            ) : player_obj?.battleTrap?.bot ? (
                                                <SmartToyIcon
                                                    titleAccess="Bot"
                                                    fontSize="inherit"
                                                    sx={{
                                                        width: 30,
                                                        mr: "0.2rem",
                                                    }}
                                                />
                                            ) : (
                                                <PersonIcon
                                                    titleAccess="Player"
                                                    fontSize="inherit"
                                                    sx={{
                                                        width: 30,
                                                        mr: "0.2rem",
                                                    }}
                                                />
                                            )}

                                            <Box
                                                component="h5"
                                                className="mb-0"
                                                sx={{
                                                    textDecorationLine:
                                                        player_obj.battleTrap
                                                            ?.dead
                                                            ? "line-through"
                                                            : "none",
                                                    textDecorationColor:
                                                        "#ff3333",
                                                    textDecorationThickness:
                                                        "2px",
                                                }}
                                            >
                                                {player_obj?.battleTrap
                                                    ?.nickname || "?"}
                                            </Box>
                                        </div>

                                        {process.env.NODE_ENV ==
                                            "development" && (
                                            <ArticlesButton
                                                small
                                                active={i == currentTurn}
                                                variant="warning"
                                                disabled={
                                                    player_obj.battleTrap
                                                        ?.dead ||
                                                    (local &&
                                                        localGameState?.gameOver)
                                                }
                                                onClick={() => {
                                                    setCurrentTurn(i);
                                                }}
                                            >
                                                <CodeIcon
                                                    fontSize="inherit"
                                                    sx={{ mr: "0.25rem" }}
                                                />
                                                Turn
                                            </ArticlesButton>
                                        )}
                                    </Box>
                                ))}

                                {/* {players.length < 4 && */}
                                <div className="d-flex justify-content-center flex-wrap">
                                    {/* <ArticlesButton
                                        small
                                        className="w-50"
                                        onClick={() => {
                                            setShowBotModal(true)
                                            // alert("TODO")
                                            // setShowInviteModal({
                                            //     type: 'Game',
                                            //     game_name: 'Battle Trap',
                                            //     server_id: server
                                            // })
                                        }}
                                    >
                                        <SmartToyIcon fontSize="inherit" sx={{ mr: "0.2rem", verticalAlign: "middle" }} />
                                        <span className='mb-0'>Add Bot</span>
                                    </ArticlesButton> */}

                                    {server !== "single-player" &&
                                        server !== "local-play" && (
                                            <ArticlesButton
                                                small
                                                className="w-50"
                                                onClick={() => {
                                                    setShowInviteModal({
                                                        type: "Game",
                                                        game_name:
                                                            "Battle Trap",
                                                        server_id: server,
                                                    });
                                                }}
                                            >
                                                <PersonAddIcon
                                                    fontSize="inherit"
                                                    sx={{ mr: "0.2rem" }}
                                                />
                                                <span className="mb-0">
                                                    Invite Players
                                                </span>
                                            </ArticlesButton>
                                        )}

                                    <ArticlesButton
                                        small
                                        className="w-50"
                                        onClick={() => {
                                            console.log("Log Players", players);
                                        }}
                                    >
                                        <GroupIcon
                                            fontSize="inherit"
                                            sx={{
                                                mr: "0.2rem",
                                                verticalAlign: "middle",
                                            }}
                                        />
                                        <span className="mb-0">
                                            Log Players
                                        </span>
                                    </ArticlesButton>
                                    <ArticlesButton
                                        small
                                        className="w-50"
                                        onClick={() => {
                                            console.log(
                                                "Log Board",
                                                localGameState?.spaces,
                                            );
                                        }}
                                    >
                                        <GroupIcon
                                            fontSize="inherit"
                                            sx={{
                                                mr: "0.2rem",
                                                verticalAlign: "middle",
                                            }}
                                        />
                                        <span className="mb-0">Log Board</span>
                                    </ArticlesButton>

                                    <div className="w-50">{/* Spacer */}</div>
                                </div>
                                {/* } */}
                            </div>
                        </div>

                        {/* <div className="card-footer flex-header">

                        </div> */}
                    </>
                )}
            </div>

            {/* TODO - Add 2D -  */}
            {/* <Accordion defaultActiveKey={0} className='mt-auto'>

                    <Accordion.Item eventKey={1} className="card card-articles card-sm mb-1 mt-auto">

                        <Accordion.Button as={Card.Header} variant="link">
                            <div className="d-flex justify-content-between">
                                <div>2D Map</div>
                            </div>
                        </Accordion.Button>

                        <Accordion.Collapse eventKey={1}>
                            <Card.Body className="p-0" style={{ fontSize: '0.9rem' }}>
                                <TwoDimensionalMap />
                            </Card.Body>
                        </Accordion.Collapse>

                    </Accordion.Item>

                </Accordion> */}
        </Box>
    );
}
