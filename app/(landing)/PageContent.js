"use client";
import { useState, useEffect, useContext, useRef, Suspense } from "react";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

// import ROUTES from '@/components/constants/routes';

// import { useSelector, useDispatch } from 'react-redux';
// import { toggleCustomTheme, setCustomThemeModal } from '@/redux/actions/siteActions';

// import SingleInput from '@/components/Articles/SingleInput';
// import { useLocalStorageNew } from '@/hooks/useLocalStorageNew';

import ArticlesButton from "@/components/UI/Button";
import useFullscreen from "@/hooks/useFullScreen";
import IsDev from "@/components/UI/IsDev";
import { useSocketStore } from "@/hooks/useSocketStore";
import { Box, Paper, Tooltip } from "@mui/material";
import { useStore } from "@/hooks/useStore";
import NicknameInput from "@articles-media/articles-dev-box/NicknameInput";

import RefreshIcon from "@mui/icons-material/Refresh";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import CameraswitchIcon from "@mui/icons-material/Cameraswitch";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoIcon from "@mui/icons-material/Info";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import PowerIcon from "@mui/icons-material/Power";

const SessionButton = dynamic(
    () => import("@articles-media/articles-dev-box/SessionButton"),
    { ssr: false },
);
import GameMenuPrimaryButtonGroup from "@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup";

const GameSetupModal = dynamic(() => import("@/components/UI/GameSetupModal"), {
    ssr: false,
});

const Viewer = dynamic(() => import("@/components/Game/Viewer"), {
    ssr: false,
});

const RenderModel = dynamic(() => import("@/components/Game/RenderModel"), {
    ssr: false,
});

// import CustomizeBikeModal from '@/components/UI/CustomizeBikeModal';
const CustomizeBikeModal = dynamic(
    () => import("@/components/UI/CustomizeBikeModal"),
    {
        ssr: false,
    },
);

import GameScoreboard from "@articles-media/articles-dev-box/GameScoreboard";
import Ad from "@articles-media/articles-dev-box/Ad";

import useUserDetails from "@articles-media/articles-dev-box/useUserDetails";
import useUserToken from "@articles-media/articles-dev-box/useUserToken";
import { PieMenu } from "@articles-media/articles-gamepad-helper";
import { usePathname } from "next/navigation";

const ReturnToLauncherButton = dynamic(
    () => import("@articles-media/articles-dev-box/ReturnToLauncherButton"),
    { ssr: false },
);

const game_name = process.env.NEXT_PUBLIC_GAME_NAME;

export default function BattleTrapLobbyPage(props) {
    const pathname = usePathname();

    // const defaultLocalGameState = useStore(state => state.defaultLocalGameState);
    // const setLocalGameState = useStore(state => state.setLocalGameState);

    const socket = useSocketStore((state) => state.socket);
    const connectSocket = useSocketStore((state) => state.connectSocket);
    const disconnectSocket = useSocketStore((state) => state.disconnectSocket);
    const connected = useSocketStore((state) => state.connected);
    const setConnected = useSocketStore((state) => state.setConnected);

    // const userReduxState = useSelector((state) => state.auth.user_details)
    // const userReduxState = false

    const darkMode = useStore((state) => state.darkMode);
    const toggleDarkMode = useStore((state) => state.toggleDarkMode);
    const nickname = useStore((state) => state.nickname);
    const setNickname = useStore((state) => state.setNickname);
    const randomNickname = useStore((state) => state.randomNickname);
    // const [nickname, setNickname] = useLocalStorageNew("game:nickname", userReduxState.display_name)

    // const [character, setCharacter] = useLocalStorageNew("game:battle-trap:character", {})
    // const characters = useStore((state) => state.characters)
    const character = useStore((state) => state.character);
    // const setCharacter = useStore((state) => state.setCharacter)

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    const canvasGameRef = useRef(null);
    const canvasScoreboardRef = useRef(null);

    // const dispatch = useDispatch()

    const [viewerRefreshKey, setViewerRefreshKey] = useState(0);

    // const [showInfoModal, setShowInfoModal] = useState(false)
    // const [showSettingsModal, setShowSettingsModal] = useState(false)

    // const showInfoModal = useStore((state) => state.showInfoModal)
    const setShowInfoModal = useStore((state) => state.setShowInfoModal);

    // const showSettingsModal = useStore((state) => state.showSettingsModal)
    const setShowSettingsModal = useStore(
        (state) => state.setShowSettingsModal,
    );

    const resetGameState = useStore((state) => state.resetGameState);

    // const showCreditsModal = useStore((state) => state.showCreditsModal)
    const setShowCreditsModal = useStore((state) => state.setShowCreditsModal);

    const [showGameSetupModal, setShowGameSetupModal] = useState(false);

    // const [lobbyDetails, setLobbyDetails] = useState({
    //     players: [],
    //     games: [],
    // })
    const lobbyDetails = useStore((state) => state.lobbyDetails);

    const [autoRotate, setAutoRotate] = useState(true);

    // const [showEditBikeModal, setShowEditBikeModal] = useState(false)
    const showEditBikeModal = useStore((state) => state.showEditBikeModal);
    const setShowEditBikeModal = useStore(
        (state) => state.setShowEditBikeModal,
    );

    // useEffect(() => {

    // }, []);

    useEffect(() => {
        if (pathname == "/") {
            resetGameState();
        }
    }, [pathname]);

    useEffect(() => {
        // setShowInfoModal(localStorage.getItem('game:four-frogs:rulesAnControls') === 'true' ? true : false)

        // if (userReduxState._id) {
        //     console.log("Is user")
        // }

        // socket.on('game:battle-trap-landing-details', function (msg) {
        //     console.log('game:battle-trap-landing-details', msg)

        //     if (JSON.stringify(msg) !== JSON.stringify(lobbyDetails)) {
        //         setLobbyDetails(msg)
        //     }
        // });

        return () => {
            // socket.off('game:battle-trap-landing-details');
            socket.emit("leave-room", "game:battle-trap-landing");
        };
    }, [socket]);

    useEffect(() => {
        if (socket.connected) {
            socket.emit("join-room", "game:battle-trap-landing");
        }

        // return function cleanup() {
        //     socket.emit('leave-room', 'game:battle-trap-landing')
        // };
    }, [socket.connected]);

    const {
        data: userToken,
        error: userTokenError,
        isLoading: userTokenLoading,
        mutate: userTokenMutate,
    } = useUserToken("3014");

    const {
        data: userDetails,
        error: userDetailsError,
        isLoading: userDetailsLoading,
        mutate: userDetailsMutate,
    } = useUserDetails({
        token: userToken,
    });

    return (
        <Box
            sx={{
                "& .scoreboard": {
                    position: { xs: "relative", lg: "absolute" },
                    zIndex: 1,
                    "@media (max-width: 991.98px)": {
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        maxWidth: "100%",
                        "& .card": { maxWidth: 300, width: "100%" },
                    },
                },
            }}
            className="battle-trap-lobby-page"
        >
            <Suspense>
                <PieMenu
                    options={[
                        {
                            label: (
                                <Box
                                    component="span"
                                    sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.2rem",
                                    }}
                                >
                                    <SettingsIcon fontSize="inherit" />
                                    Settings
                                </Box>
                            ),
                            callback: () => {
                                setShowSettingsModal((prev) => !prev);
                            },
                        },
                        {
                            label: (
                                <Box
                                    component="span"
                                    sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.2rem",
                                    }}
                                >
                                    <ArrowBackIcon fontSize="inherit" />
                                    Go Back
                                </Box>
                            ),
                            callback: () => {
                                window.history.back();
                            },
                        },
                        {
                            label: (
                                <Box
                                    component="span"
                                    sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.2rem",
                                    }}
                                >
                                    <InfoIcon fontSize="inherit" />
                                    Credits
                                </Box>
                            ),
                            callback: () => {
                                setShowCreditsModal(true);
                            },
                        },
                        {
                            label: (
                                <Box
                                    component="span"
                                    sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.2rem",
                                    }}
                                >
                                    <SportsEsportsIcon fontSize="inherit" />
                                    Game Launcher
                                </Box>
                            ),
                            callback: () => {
                                window.location.href =
                                    "https://games.articles.media";
                            },
                        },
                        {
                            label: (
                                <Box
                                    component="span"
                                    sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.2rem",
                                    }}
                                >
                                    <ColorLensIcon fontSize="inherit" />
                                    {darkMode ? "Light" : "Dark"} Mode
                                </Box>
                            ),
                            callback: () => {
                                toggleDarkMode();
                            },
                        },
                    ]}
                    onFinish={(event) => {
                        console.log("Event", event);
                        if (event.callback) {
                            event.callback();
                        }
                    }}
                />
            </Suspense>

            {showGameSetupModal && (
                <GameSetupModal
                    show={showGameSetupModal}
                    setShow={setShowGameSetupModal}
                />
            )}

            {showEditBikeModal && <CustomizeBikeModal />}

            <Box
                sx={{
                    position: "fixed",
                    inset: 0,
                    height: "100%",
                    width: "100%",
                    zIndex: 0,
                    overflow: "hidden",
                    "& img": {
                        filter: "blur(5px) brightness(0.5)",
                        transform: "scale(1.05)",
                    },
                }}
                className="background"
            >
                <Image
                    src={`${process.env.NEXT_PUBLIC_CDN}games/Battle Trap/background.jpg`}
                    // placeholder={'blur'}
                    alt=""
                    fill
                    style={{ objectFit: "cover" }}
                />
            </Box>

            <Box
                sx={{
                    position: "relative",
                    zIndex: 1,
                    color: "#fff",
                    maxWidth: {
                        sm: 540,
                        md: 720,
                        lg: 960,
                        xl: 1140,
                        xxl: 1320,
                    },
                }}
                className="container py-3 py-lg-5"
                data-theme="Dark"
            >
                <div
                    className="mb-3 mb-lg-5 mx-auto"
                    style={{ maxWidth: "800px" }}
                >
                    <h1 className="mb-1 text-center">
                        {process.env.NEXT_PUBLIC_GAME_NAME}
                    </h1>

                    <div className="text-center mb-3">
                        <span className="">Select a server to join.</span>
                        <span className="px-2">|</span>
                        <span className="fw-bold ">
                            {lobbyDetails.players.length || 0} player
                            {lobbyDetails.players.length > 1 && "s"} waiting in
                            the lobby.
                        </span>
                    </div>

                    <div
                        className="d-flex flex-wrap justify-content-center align-items-center mx-auto mb-3"
                        style={{
                            width: "300px",
                        }}
                    >
                        <GameMenuPrimaryButtonGroup
                            useStore={useStore}
                            type="Landing"
                        />
                    </div>

                    <div className="d-flex justify-content-center align-items-center my-3">
                        <div>
                            <IsDev inline>
                                <ArticlesButton
                                    className="mx-0"
                                    small
                                    onClick={() => {
                                        if (connected) {
                                            disconnectSocket();
                                        } else {
                                            connectSocket(
                                                // 'http://localhost:3000'
                                            );
                                        }
                                    }}
                                >
                                    <PowerIcon
                                        fontSize="inherit"
                                        sx={{ mr: "0.2rem" }}
                                    />
                                    {connected ? "Disconnect" : "Connect"}
                                </ArticlesButton>
                                <ArticlesButton
                                    variant="warning"
                                    className="mx-1"
                                    small
                                >
                                    Reset Server
                                </ArticlesButton>
                            </IsDev>
                        </div>
                    </div>

                    <div className="d-lg-flex">
                        <Box
                            sx={{
                                position: "relative",
                                width: { xs: "100%", lg: "50%" },
                                flexShrink: 0,
                            }}
                            className="model-preview"
                        >
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    zIndex: 1,
                                    display: "flex",
                                }}
                                className="floating-controls"
                            >
                                <Tooltip
                                    title="Rotation"
                                    placement="bottom"
                                >
                                    <ArticlesButton
                                        active={autoRotate}
                                        onClick={() => {
                                            setAutoRotate((prev) => !prev);
                                        }}
                                        className=""
                                    >
                                        <CameraswitchIcon fontSize="small" />
                                    </ArticlesButton>
                                </Tooltip>

                                <Tooltip
                                    title="Refresh"
                                    placement="bottom"
                                >
                                    <ArticlesButton
                                        // active={autoRotate}
                                        onClick={() => {
                                            // setAutoRotate(prev => !prev)
                                            setViewerRefreshKey(
                                                (prev) => prev + 1,
                                            );
                                        }}
                                        className=""
                                    >
                                        <RefreshIcon fontSize="small" />
                                    </ArticlesButton>
                                </Tooltip>

                                <Tooltip
                                    title="Edit"
                                    placement="bottom"
                                >
                                    <ArticlesButton
                                        onClick={() => {
                                            // requestFullscreen('users-bike-viewer')
                                            setShowEditBikeModal(true);
                                        }}
                                        className=""
                                    >
                                        <ColorLensIcon fontSize="small" />
                                        Customize
                                    </ArticlesButton>
                                </Tooltip>

                                <div
                                    style={{
                                        width: "42px",
                                        height: "42px",
                                        backgroundColor: "red",
                                        display: "none",
                                    }}
                                ></div>
                            </Box>

                            <Paper
                                id="users-bike-viewer"
                                className="mb-3"
                                style={{
                                    width: "100%",
                                    margin: "0rem",
                                    border: "1px solid #fff",
                                }}
                                sx={[
                                    { mr: 2 },
                                    {
                                        bgcolor: "#000",
                                        minHeight: 168,
                                        position: "relative",
                                        "& > *": {
                                            position: "absolute !important",
                                            height: "100%",
                                        },
                                    },
                                ]}
                            >
                                {!showEditBikeModal && (
                                    <Viewer
                                        key={viewerRefreshKey}
                                        autoRotate={autoRotate}
                                    >
                                        {/* <Bear /> */}
                                        {/* <LowPolyChopper scale={0.1} position={[0, -10, 0]} /> */}
                                        {/* {renderModel(character)} */}
                                        <RenderModel character={character} />
                                    </Viewer>
                                )}
                            </Paper>
                        </Box>

                        <Paper
                            className="mb-3 mx-auto text-center"
                            style={{
                                width: "100%",
                                margin: "0rem",
                                border: "1px solid #fff",
                                padding: "1rem 0rem",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <div
                                // className="card-header d-flex justify-content-center h-100 align-items-center mx-auto"
                                style={{
                                    width: "250px",
                                }}
                            >
                                <NicknameInput useStore={useStore} />
                            </div>
                        </Paper>
                    </div>

                    {/* <div className="text-center">
                        <div>Test</div>
                        <div className='small mb-1'>123</div>
                    </div> */}

                    <Box
                        sx={{
                            display: { xs: "flex", lg: "grid" },
                            flexDirection: "column",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: { xs: 0, lg: "5px" },
                        }}
                        className="servers mb-4"
                    >
                        <Paper
                            sx={[
                                {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                },
                                { border: "1px solid #fff" },
                            ]}
                            className="server flex-row flex-header border border-white p-2"
                        >
                            <div>
                                <div className="d-flex justify-content-between align-items-center w-100 mb-1">
                                    <div
                                        className="mb-0"
                                        style={{ fontSize: "0.9rem" }}
                                    >
                                        <b>Single Player</b>
                                    </div>
                                </div>

                                <div className="d-flex">
                                    <div className="d-flex justify-content-start"></div>
                                    <div
                                        className="mb-0 ms-0"
                                        style={{ fontSize: "0.8rem" }}
                                    >
                                        Play against bots
                                    </div>
                                </div>
                            </div>

                            {/* <Link
                                className={``}
                                href={{
                                    pathname: `/play`,
                                    query: { server: 'single-player' }
                                }}
                            >
                                <ArticlesButton
                                    className="px-5"
                                    small
                                // disabled={!connected}
                                >
                                    Join
                                </ArticlesButton>
                            </Link> */}

                            <ArticlesButton
                                className="px-5"
                                small
                                onClick={() => {
                                    setShowGameSetupModal({
                                        type: "single-player",
                                    });
                                }}
                                // disabled={!connected}
                            >
                                Join
                            </ArticlesButton>
                        </Paper>

                        <Paper
                            sx={[
                                {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                },
                                { border: "1px solid #fff" },
                            ]}
                            className="server flex-row flex-header border border-white p-2"
                        >
                            <div>
                                <div className="d-flex justify-content-between align-items-center w-100 mb-1">
                                    <div
                                        className="mb-0"
                                        style={{ fontSize: "0.9rem" }}
                                    >
                                        <b>Local Play</b>
                                    </div>
                                </div>

                                <div className="d-flex">
                                    <div className="d-flex justify-content-start"></div>
                                    <div
                                        className="mb-0 ms-0"
                                        style={{ fontSize: "0.8rem" }}
                                    >
                                        Play with friends on same device
                                    </div>
                                </div>
                            </div>

                            {/* <Link
                                className={``}
                                href={{
                                    pathname: `/play`,
                                    query: { server: 'local-play' }
                                }}
                            > */}
                            <ArticlesButton
                                className="px-5"
                                small
                                onClick={() => {
                                    setShowGameSetupModal({
                                        type: "local-play",
                                    });
                                }}
                                // disabled={!connected}
                            >
                                Join
                            </ArticlesButton>
                            {/* </Link> */}
                        </Paper>
                    </Box>

                    <div className="text-center">
                        <div>Classic Play Servers</div>
                        <div className="small mb-1">Turn based gameplay.</div>
                    </div>

                    <Box
                        sx={{
                            display: { xs: "flex", lg: "grid" },
                            flexDirection: "column",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: { xs: 0, lg: "5px" },
                        }}
                        className="servers mb-3"
                    >
                        {[1, 2, 3, 4].map((id) => {
                            let game_lookup = lobbyDetails?.games?.find(
                                (game) => parseInt(game.server_id) == id,
                            );

                            return (
                                <Paper
                                    sx={[
                                        {
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        },
                                        { border: "1px solid #fff" },
                                    ]}
                                    key={id}
                                    className="server flex-row flex-header border border-white p-2"
                                >
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center w-100">
                                            <div
                                                className="mb-0"
                                                style={{ fontSize: "0.9rem" }}
                                            >
                                                <b>Server {id}</b>
                                            </div>
                                        </div>

                                        <div
                                            className="mb-0"
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            <b>
                                                Status:{" "}
                                                {game_lookup?.status || "Empty"}
                                            </b>
                                        </div>

                                        <div className="d-flex">
                                            <div className="d-flex justify-content-start">
                                                {[1, 2, 3, 4].map(
                                                    (player_count) => {
                                                        let playerLookup = false;
                                                        if (
                                                            game_lookup?.players
                                                                ?.length >=
                                                            player_count
                                                        )
                                                            playerLookup = true;

                                                        return (
                                                            <div
                                                                key={
                                                                    player_count
                                                                }
                                                                className="icon"
                                                                style={{
                                                                    width: "20px",
                                                                    height: "20px",
                                                                    ...(playerLookup
                                                                        ? {
                                                                              backgroundColor:
                                                                                  "cyan",
                                                                          }
                                                                        : {
                                                                              backgroundColor:
                                                                                  "gray",
                                                                          }),
                                                                    border: "1px solid black",
                                                                }}
                                                            ></div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                            <div className="mb-0 ms-1">
                                                {game_lookup?.players?.length ||
                                                    0}
                                                /4 Players
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        className={``}
                                        href={{
                                            pathname: `/play`,
                                            query: { server: id },
                                        }}
                                        style={{
                                            pointerEvents: !connected
                                                ? "none"
                                                : "auto",
                                        }}
                                    >
                                        <ArticlesButton
                                            className="px-5"
                                            small
                                            disabled={!connected}
                                        >
                                            Join {!connected && "(Offline)"}
                                        </ArticlesButton>
                                    </Link>
                                </Paper>
                            );
                        })}
                    </Box>

                    {/* TODO */}
                    <IsDev>
                        <>
                            <div className="text-center">
                                <div>Live Play Servers</div>
                                <div className="small mb-1">
                                    Real time and consistent movement.
                                </div>
                            </div>

                            <Box
                                sx={{
                                    display: { xs: "flex", lg: "grid" },
                                    flexDirection: "column",
                                    gridTemplateColumns:
                                        "repeat(2, minmax(0, 1fr))",
                                    gap: { xs: 0, lg: "5px" },
                                }}
                                className="servers mb-3"
                            >
                                {[5, 6, 7, 8].map((id) => {
                                    let game_lookup = lobbyDetails?.games?.find(
                                        (game) =>
                                            parseInt(game.server_id) == id,
                                    );

                                    return (
                                        <Box
                                            sx={[
                                                {
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                },
                                                { border: "1px solid #fff" },
                                            ]}
                                            key={id}
                                            className="server card rounded-0 flex-row flex-header border border-white p-2"
                                        >
                                            <div>
                                                <div className="d-flex justify-content-between align-items-center w-100 mb-2">
                                                    <div
                                                        className="mb-0"
                                                        style={{
                                                            fontSize: "0.9rem",
                                                        }}
                                                    >
                                                        <b>Server {id}</b>
                                                    </div>
                                                </div>

                                                <div className="d-flex">
                                                    <div className="d-flex justify-content-start">
                                                        {[1, 2, 3, 4].map(
                                                            (player_count) => {
                                                                let playerLookup = false;
                                                                if (
                                                                    game_lookup
                                                                        ?.players
                                                                        ?.length >=
                                                                    player_count
                                                                )
                                                                    playerLookup = true;

                                                                return (
                                                                    <div
                                                                        key={
                                                                            player_count
                                                                        }
                                                                        className="icon"
                                                                        style={{
                                                                            width: "20px",
                                                                            height: "20px",
                                                                            ...(playerLookup
                                                                                ? {
                                                                                      backgroundColor:
                                                                                          "cyan",
                                                                                  }
                                                                                : {
                                                                                      backgroundColor:
                                                                                          "gray",
                                                                                  }),
                                                                            border: "1px solid black",
                                                                        }}
                                                                    ></div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                    <div className="mb-0 ms-1">
                                                        {game_lookup?.players
                                                            ?.length || 0}
                                                        /4 Players
                                                    </div>
                                                </div>
                                            </div>

                                            <Link
                                                className={``}
                                                href={{
                                                    pathname: "" + `/${id}`,
                                                }}
                                            >
                                                <ArticlesButton
                                                    className="px-5"
                                                    small
                                                >
                                                    Join
                                                </ArticlesButton>
                                            </Link>
                                        </Box>
                                    );
                                })}
                            </Box>

                            <div className="text-center">
                                <div>Express Play Servers</div>
                                <div className="small mb-1">
                                    2 seconds per space.
                                </div>
                            </div>

                            <Box
                                sx={{
                                    display: { xs: "flex", lg: "grid" },
                                    flexDirection: "column",
                                    gridTemplateColumns:
                                        "repeat(2, minmax(0, 1fr))",
                                    gap: { xs: 0, lg: "5px" },
                                }}
                                className="servers mb-3"
                            >
                                {[9, 10, 11, 12].map((id) => {
                                    let game_lookup = lobbyDetails?.games?.find(
                                        (game) =>
                                            parseInt(game.server_id) == id,
                                    );

                                    return (
                                        <Box
                                            sx={[
                                                {
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                },
                                                { border: "1px solid #fff" },
                                            ]}
                                            key={id}
                                            className="server card rounded-0 flex-row flex-header border border-white p-2"
                                        >
                                            <div>
                                                <div className="d-flex justify-content-between align-items-center w-100 mb-2">
                                                    <div
                                                        className="mb-0"
                                                        style={{
                                                            fontSize: "0.9rem",
                                                        }}
                                                    >
                                                        <b>Server {id}</b>
                                                    </div>
                                                </div>

                                                <div className="d-flex">
                                                    <div className="d-flex justify-content-start">
                                                        {[1, 2, 3, 4].map(
                                                            (player_count) => {
                                                                let playerLookup = false;
                                                                if (
                                                                    game_lookup
                                                                        ?.players
                                                                        ?.length >=
                                                                    player_count
                                                                )
                                                                    playerLookup = true;

                                                                return (
                                                                    <div
                                                                        key={
                                                                            player_count
                                                                        }
                                                                        className="icon"
                                                                        style={{
                                                                            width: "20px",
                                                                            height: "20px",
                                                                            ...(playerLookup
                                                                                ? {
                                                                                      backgroundColor:
                                                                                          "cyan",
                                                                                  }
                                                                                : {
                                                                                      backgroundColor:
                                                                                          "gray",
                                                                                  }),
                                                                            border: "1px solid black",
                                                                        }}
                                                                    ></div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                    <div className="mb-0 ms-1">
                                                        {game_lookup?.players
                                                            ?.length || 0}
                                                        /4 Players
                                                    </div>
                                                </div>
                                            </div>

                                            <Link
                                                className={``}
                                                href={{
                                                    pathname: `/${id}`,
                                                }}
                                            >
                                                <ArticlesButton
                                                    className="px-5"
                                                    small
                                                >
                                                    Join
                                                </ArticlesButton>
                                            </Link>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </>
                    </IsDev>
                </div>

                <div className="d-flex justify-content-center align-items-center">
                    <div style={{ width: "300px" }}>
                        <SessionButton
                            port={process.env.NEXT_PUBLIC_GAME_PORT}
                            friendsButton={true}
                        />
                        <ReturnToLauncherButton />
                    </div>
                </div>
            </Box>

            <GameScoreboard
                game={process.env.NEXT_PUBLIC_GAME_NAME}
                style="Default"
                darkMode={darkMode ? true : false}
            />

            <Ad
                sx={{
                    position: "fixed",
                    right: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: { xs: "none", lg: "block" },
                    zIndex: 1,
                }}
                style="Default"
                section={"Games"}
                section_id={process.env.NEXT_PUBLIC_GAME_NAME}
                darkMode={darkMode ? true : false}
                user_ad_token={userToken}
                userDetails={userDetails}
                userDetailsLoading={userDetailsLoading}
            />
        </Box>
    );
}
