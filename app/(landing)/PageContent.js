"use client"
import { useState, useEffect, useContext, useRef, Suspense } from 'react';

import Link from 'next/link'
import Image from 'next/image';
import dynamic from 'next/dynamic'

// import ROUTES from '@/components/constants/routes';

// import { useSelector, useDispatch } from 'react-redux';
// import { toggleCustomTheme, setCustomThemeModal } from '@/redux/actions/siteActions';

// import SingleInput from '@/components/Articles/SingleInput';
import { useLocalStorageNew } from '@/hooks/useLocalStorageNew';

import ArticlesButton from '@/components/UI/Button';
import useFullscreen from '@/hooks/useFullScreen';
import IsDev from '@/components/UI/IsDev';
import { useSocketStore } from '@/hooks/useSocketStore';
import { Box, Paper, Tooltip } from '@mui/material';
import { useStore } from '@/hooks/useStore';
import GameInfoModal from '@/components/UI/InfoModal';
// import ArticlesSignInButton from '@/components/ArticlesSignInButton';

// const Ad = dynamic(() => import('@/components/ArticlesAd'), {
//     ssr: false,
// });

const ArticlesModal = dynamic(() => import('@/components/UI/ArticlesModal'), {
    ssr: false,
});

// const InfoModal = dynamic(
//     () => import('@/components/Games/InfoModal'),
//     { ssr: false }
// )

const SettingsModal = dynamic(
    () => import('@/components/UI/SettingsModal'),
    { ssr: false }
)

const GameSetupModal = dynamic(
    () => import('@/components/UI/GameSetupModal'),
    { ssr: false }
)

const Viewer = dynamic(() => import('@/components/Game/Viewer'), {
    ssr: false,
});

const RenderModel = dynamic(() => import('@/components/Game/RenderModel'), {
    ssr: false,
});

import GameScoreboard from '@articles-media/articles-dev-box/GameScoreboard';
import Ad from '@articles-media/articles-dev-box/Ad';

import useUserDetails from '@articles-media/articles-dev-box/useUserDetails';
import useUserToken from '@articles-media/articles-dev-box/useUserToken';
import { PieMenu } from '@articles-media/articles-gamepad-helper';

const ReturnToLauncherButton = dynamic(() =>
    import('@articles-media/articles-dev-box/ReturnToLauncherButton'),
    { ssr: false }
);

const game_name = "Battle Trap";

export default function BattleTrapLobbyPage(props) {

    const socket = useSocketStore((state) => state.socket)
    const connectSocket = useSocketStore((state) => state.connectSocket)
    const disconnectSocket = useSocketStore((state) => state.disconnectSocket)
    const connected = useSocketStore((state) => state.connected)
    const setConnected = useSocketStore((state) => state.setConnected)

    // const userReduxState = useSelector((state) => state.auth.user_details)
    // const userReduxState = false

    const darkMode = useStore((state) => state.darkMode);
    const nickname = useStore((state) => state.nickname)
    const setNickname = useStore((state) => state.setNickname)
    const randomNickname = useStore((state) => state.randomNickname)
    // const [nickname, setNickname] = useLocalStorageNew("game:nickname", userReduxState.display_name)

    // const [character, setCharacter] = useLocalStorageNew("game:battle-trap:character", {})
    const characters = useStore((state) => state.characters)
    const character = useStore((state) => state.character)
    const setCharacter = useStore((state) => state.setCharacter)

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    const canvasGameRef = useRef(null);
    const canvasScoreboardRef = useRef(null);

    // const dispatch = useDispatch()

    const [viewerRefreshKey, setViewerRefreshKey] = useState(0)

    // const [showInfoModal, setShowInfoModal] = useState(false)
    // const [showSettingsModal, setShowSettingsModal] = useState(false)

    // const showInfoModal = useStore((state) => state.showInfoModal)
    const setShowInfoModal = useStore((state) => state.setShowInfoModal)

    // const showSettingsModal = useStore((state) => state.showSettingsModal)
    const setShowSettingsModal = useStore((state) => state.setShowSettingsModal)

    // const showCreditsModal = useStore((state) => state.showCreditsModal)
    const setShowCreditsModal = useStore((state) => state.setShowCreditsModal)

    const [showGameSetupModal, setShowGameSetupModal] = useState(false)

    // const [lobbyDetails, setLobbyDetails] = useState({
    //     players: [],
    //     games: [],
    // })
    const lobbyDetails = useStore((state) => state.lobbyDetails)

    const [autoRotate, setAutoRotate] = useState(true)

    const [showEditBikeModal, setShowEditBikeModal] = useState(false)

    // useEffect(() => {

    // }, []);

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
            socket.emit('leave-room', 'game:battle-trap-landing')
        };

    }, [socket])

    useEffect(() => {

        if (socket.connected) {
            socket.emit('join-room', 'game:battle-trap-landing');
        }

        // return function cleanup() {
        //     socket.emit('leave-room', 'game:battle-trap-landing')
        // };

    }, [socket.connected]);

    const {
        data: userToken,
        error: userTokenError,
        isLoading: userTokenLoading,
        mutate: userTokenMutate
    } = useUserToken(
        "3014"
    );

    const {
        data: userDetails,
        error: userDetailsError,
        isLoading: userDetailsLoading,
        mutate: userDetailsMutate
    } = useUserDetails({
        token: userToken
    });

    return (
        <div className="battle-trap-lobby-page">

            <Suspense>
                <PieMenu
                    options={[
                        {
                            label: 'Settings',
                            icon: 'fad fa-cog',
                            callback: () => {
                                setShowSettingsModal(prev => !prev)
                            }
                        },
                        {
                            label: 'Go Back',
                            icon: 'fad fa-arrow-left',
                            callback: () => {
                                window.history.back()
                            }
                        },
                        {
                            label: 'Credits',
                            icon: 'fad fa-info-circle',
                            callback: () => {
                                setShowCreditsModal(true)
                            }
                        },
                        {
                            label: 'Game Launcher',
                            icon: 'fad fa-gamepad',
                            callback: () => {
                                window.location.href = 'https://games.articles.media';
                            }
                        },
                        {
                            label: `${darkMode ? "Light" : "Dark"} Mode`,
                            icon: 'fad fa-palette',
                            callback: () => {
                                toggleDarkMode()
                            }
                        }
                    ]}
                    onFinish={(event) => {
                        console.log("Event", event)
                        if (event.callback) {
                            event.callback()
                        }
                    }}
                />
            </Suspense>

            {/* {showInfoModal &&
                <GameInfoModal
                    show={showInfoModal}
                    setShow={setShowInfoModal}
                />
            } */}

            {showGameSetupModal &&
                <GameSetupModal
                    show={showGameSetupModal}
                    setShow={setShowGameSetupModal}
                />
            }

            {/* {showSettingsModal &&
                <SettingsModal
                    show={showSettingsModal}
                    setShow={setShowSettingsModal}
                />
            } */}

            {showEditBikeModal &&
                <ArticlesModal
                    show={showEditBikeModal}
                    setShow={setShowEditBikeModal}
                    title="Customize Bike"
                // scrollable
                >

                    <div>
                        <div className='ratio ratio-16x9'>
                            <div className='w-100 h-100'>
                                <Viewer
                                    autoRotate={autoRotate}
                                >

                                    <RenderModel character={character} />

                                </Viewer>
                            </div>
                        </div>
                    </div>

                    <hr />

                    <div className="fw-bold">Bike Types</div>

                    <div className=''>
                        {characters.map(bike_obj => {
                            return (
                                <div key={bike_obj.name} className='d-flex align-items-start mb-2'>

                                    <div
                                        className="ratio ratio-16x9 bg-black me-2 flex-shrink-0"
                                        style={{ width: '100px' }}
                                    >
                                        <div className='d-flex justify-content-center align-items-center'>
                                            <ArticlesButton
                                                small
                                                active={character.model == bike_obj.model}
                                                onClick={() => {
                                                    setCharacter({
                                                        ...character,
                                                        model: bike_obj.model
                                                    })
                                                }}
                                            >
                                                Select
                                            </ArticlesButton>
                                        </div>
                                    </div>

                                    <div>
                                        <div className='fw-bold mb-0'>{bike_obj.name}</div>
                                        {/* <div className='small'>{bike_obj.description}</div> */}
                                    </div>

                                </div>
                            )
                        })}
                    </div>

                    {/* <hr />

                    <div className='d-flex justify-content-center text-center'>

                        <a href='https://articles.media' target="_blank" rel="noreferrer" className='w-100'>
                            <Image
                                priority
                                width={60}
                                height={60}
                                src={`${process.env.NEXT_PUBLIC_CDN}profile_photos/starter/articles.jpg`}
                                alt="Articles Media Logo"
                                className='mb-2'
                            />
                            <div>
                                Visit Articles Media
                            </div>
                        </a>

                    </div> */}

                </ArticlesModal>
            }

            <div className="background">
                <Image
                    src={`${process.env.NEXT_PUBLIC_CDN}games/Battle Trap/background.jpg`}
                    // placeholder={'blur'}
                    alt=""
                    fill
                    style={{ objectFit: 'cover' }}
                />
            </div>

            <div
                className="container py-3 py-lg-5"
                data-theme="Dark"
            >

                <div className="mb-3 mb-lg-5 mx-auto" style={{ "maxWidth": "800px" }}>

                    <h1 className="mb-1 text-center">Battle Trap</h1>

                    <div className='text-center mb-3'>
                        <span className="">Select a server to join.</span>
                        <span className='px-2'>|</span>
                        <span className="fw-bold ">
                            {lobbyDetails.players.length || 0} player{lobbyDetails.players.length > 1 && 's'} waiting in the lobby.
                        </span>
                    </div>

                    <div className='d-flex justify-content-center align-items-center my-3 mb-4'>

                        {/* <Link href={ROUTES.GAMES} className='mx-1'>
                            <ArticlesButton
                                className={``}
                                small
                                onClick={() => {

                                }}
                            >
                                <i className="fad fa-sign-out fa-rotate-180"></i>
                                Leave Game
                            </ArticlesButton>
                        </Link> */}

                        <ArticlesButton
                            small
                            className="mx-0"
                            onClick={() => {
                                setShowInfoModal(true)
                            }}
                        >
                            <i className="fad fa-info-circle"></i>
                            Controls & Info
                        </ArticlesButton>

                        <ArticlesButton
                            small
                            className="mx-0"
                            onClick={() => {
                                setShowSettingsModal(true)
                            }}
                        >
                            <i className="fad fa-cog"></i>
                            Settings
                        </ArticlesButton>

                        <ArticlesButton
                            small
                            className="mx-0"
                            onClick={() => {
                                setShowCreditsModal(true)
                            }}
                        >
                            <i className="fad fa-cog"></i>
                            Credits
                        </ArticlesButton>

                        {/* <ArticlesButton
                            className="mx-1"
                            small
                        >
                            Private Game
                        </ArticlesButton> */}

                        <ArticlesButton
                            className="mx-0"
                            small
                            onClick={() => {
                                if (connected) {
                                    disconnectSocket()
                                } else {
                                    connectSocket(
                                        // 'http://localhost:3000'
                                    );
                                }
                            }}
                        >
                            <i className="fad fa-plug"></i>
                            {connected ? "Disconnect" : "Connect"}
                        </ArticlesButton>

                        <IsDev inline>
                            <ArticlesButton
                                variant="warning"
                                className="mx-1"
                                small
                            >
                                Reset Server
                            </ArticlesButton>
                        </IsDev>

                    </div>

                    <div className='d-lg-flex'>

                        <div className='model-preview'>

                            <div className='floating-controls'>

                                <Tooltip
                                    title="Rotation"
                                    placement="bottom"
                                >
                                    <ArticlesButton
                                        active={autoRotate}
                                        onClick={() => {
                                            setAutoRotate(prev => !prev)
                                        }}
                                        className=""
                                    >
                                        <i className="fad fa-sync me-0"></i>
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
                                            setViewerRefreshKey(prev => prev + 1)
                                        }}
                                        className=""
                                    >
                                        <i className="fad fa-undo me-0"></i>
                                    </ArticlesButton>
                                </Tooltip>

                                <Tooltip
                                    title="Edit"
                                    placement="bottom"
                                >
                                    <ArticlesButton
                                        onClick={() => {
                                            // requestFullscreen('users-bike-viewer')
                                            setShowEditBikeModal(true)
                                        }}
                                        className=""
                                    >
                                        <i className="fad fa-pen me-0"></i>
                                    </ArticlesButton>
                                </Tooltip>

                                <div style={{ width: '42px', height: '42px', backgroundColor: 'red', display: 'none' }}>

                                </div>

                            </div>

                            <Paper
                                id='users-bike-viewer'
                                className="mb-3"
                                style={{ "width": "100%", margin: '0rem', border: '1px solid #fff' }}
                                sx={{ mr: 2 }}
                            >

                                {!showEditBikeModal &&
                                    <Viewer
                                        key={viewerRefreshKey}
                                        autoRotate={autoRotate}
                                    >

                                        {/* <Bear /> */}
                                        {/* <LowPolyChopper scale={0.1} position={[0, -10, 0]} /> */}
                                        {/* {renderModel(character)} */}
                                        <RenderModel character={character} />

                                    </Viewer>
                                }

                            </Paper>

                        </div>

                        <Paper
                            className="mb-3 mx-auto text-center"
                            style={{ "width": "100%", margin: '0rem', border: '1px solid #fff', padding: '1rem 0rem' }}
                        >

                            <div className="card-header d-flex flex-column justify-content-center h-100">

                                <label htmlFor="nickname">Nickname</label>

                                <div className='d-flex justify-content-center'>

                                    <div className="form-group articles mb-0">

                                        {/* <SingleInput
                                            center
                                            value={nickname}
                                            setValue={setNickname}
                                        /> */}
                                        <input
                                            autoComplete='off'
                                            // id={item_key}
                                            type="text"
                                            className='text-center'
                                            // autoFocus={autoFocus && true}
                                            // onBlur={onBlur}
                                            // placeholder={placeholder}
                                            value={nickname}
                                            // onKeyDown={onKeyDown}
                                            onChange={(e) => {
                                                setNickname(e.target.value)
                                            }}
                                        // className={`form-control ${className} ${small ? 'form-control-sm' : ''} ${center ? 'text-center' : ''}`}
                                        // disabled={disabled}
                                        />
                                    </div>

                                    <ArticlesButton
                                        small
                                        onClick={() => {
                                            randomNickname()
                                        }}
                                    >
                                        <i className="fas fa-random"></i>
                                    </ArticlesButton>

                                </div>

                                <div style={{ fontSize: '0.8rem' }}>Visible to all players</div>

                                {/* <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        mt: 2,
                                        // maxWidth: '200px',
                                    }}
                                >
                                    <ArticlesSignInButton
                                        style="Articles"
                                    />
                                </Box> */}

                            </div>

                        </Paper>

                    </div>

                    {/* <div className="text-center">
                        <div>Test</div>
                        <div className='small mb-1'>123</div>
                    </div> */}

                    <div className='servers mb-4'>

                        <Paper className="server flex-row flex-header border border-white p-2">

                            <div>
                                <div className='d-flex justify-content-between align-items-center w-100 mb-1'>
                                    <div className="mb-0" style={{ fontSize: '0.9rem' }}>
                                        <b>Single Player</b>
                                    </div>
                                </div>

                                <div className='d-flex'>
                                    <div className='d-flex justify-content-start'>

                                    </div>
                                    <div className='mb-0 ms-0' style={{ fontSize: '0.8rem' }}>
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
                                        type: 'single-player'
                                    })
                                }}
                            // disabled={!connected}
                            >
                                Join
                            </ArticlesButton>

                        </Paper>

                        <Paper className="server flex-row flex-header border border-white p-2">

                            <div>
                                <div className='d-flex justify-content-between align-items-center w-100 mb-1'>
                                    <div className="mb-0" style={{ fontSize: '0.9rem' }}>
                                        <b>Local Play</b>
                                    </div>
                                </div>

                                <div className='d-flex'>
                                    <div className='d-flex justify-content-start'>

                                    </div>
                                    <div className='mb-0 ms-0' style={{ fontSize: '0.8rem' }}>
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
                                        type: 'local-play'
                                    })
                                }}
                            // disabled={!connected}
                            >
                                Join
                            </ArticlesButton>
                            {/* </Link> */}

                        </Paper>

                    </div>

                    <div className="text-center">
                        <div>Classic Play Servers</div>
                        <div className='small mb-1'>Turn based gameplay.</div>
                    </div>

                    <div className='servers mb-3'>
                        {[1, 2, 3, 4].map(id => {

                            let game_lookup = lobbyDetails?.games?.find(game => parseInt(game.server_id) == id)

                            return (
                                <Paper key={id} className="server flex-row flex-header border border-white p-2">

                                    <div>

                                        <div className='d-flex justify-content-between align-items-center w-100'>
                                            <div className="mb-0" style={{ fontSize: '0.9rem' }}><b>Server {id}</b></div>
                                        </div>

                                        <div className="mb-0" style={{ fontSize: '0.9rem' }}><b>Status: {game_lookup?.status || "Empty"}</b></div>

                                        <div className='d-flex'>
                                            <div className='d-flex justify-content-start'>
                                                {[1, 2, 3, 4].map(player_count => {

                                                    let playerLookup = false
                                                    if (game_lookup?.players?.length >= player_count) playerLookup = true

                                                    return (
                                                        <div
                                                            key={player_count}
                                                            className="icon"
                                                            style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                ...(playerLookup ? {
                                                                    backgroundColor: 'cyan',
                                                                } : {
                                                                    backgroundColor: 'gray',
                                                                }),
                                                                border: '1px solid black'
                                                            }}>

                                                        </div>
                                                    )

                                                })}
                                            </div>
                                            <div className='mb-0 ms-1'>{game_lookup?.players?.length || 0}/4 Players</div>
                                        </div>
                                    </div>

                                    <Link
                                        className={``}
                                        href={{
                                            pathname: `/play`,
                                            query: { server: id }
                                        }}
                                        style={{
                                            pointerEvents: (!connected) ? "none" : "auto",
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
                            )

                        })}
                    </div>

                    {/* TODO */}
                    <IsDev>
                        <>
                            <div className="text-center">
                                <div>Live Play Servers</div>
                                <div className='small mb-1'>Real time and consistent movement.</div>
                            </div>

                            <div className='servers mb-3'>
                                {[5, 6, 7, 8].map(id => {

                                    let game_lookup = lobbyDetails?.games?.find(game => parseInt(game.server_id) == id)

                                    return (
                                        <div key={id} className="server card rounded-0 flex-row flex-header border border-white p-2">

                                            <div>
                                                <div className='d-flex justify-content-between align-items-center w-100 mb-2'>
                                                    <div className="mb-0" style={{ fontSize: '0.9rem' }}><b>Server {id}</b></div>
                                                </div>

                                                <div className='d-flex'>
                                                    <div className='d-flex justify-content-start'>
                                                        {[1, 2, 3, 4].map(player_count => {

                                                            let playerLookup = false
                                                            if (game_lookup?.players?.length >= player_count) playerLookup = true

                                                            return (
                                                                <div
                                                                    key={player_count}
                                                                    className="icon"
                                                                    style={{
                                                                        width: '20px',
                                                                        height: '20px',
                                                                        ...(playerLookup ? {
                                                                            backgroundColor: 'cyan',
                                                                        } : {
                                                                            backgroundColor: 'gray',
                                                                        }),
                                                                        border: '1px solid black'
                                                                    }}>

                                                                </div>
                                                            )

                                                        })}
                                                    </div>
                                                    <div className='mb-0 ms-1'>{game_lookup?.players?.length || 0}/4 Players</div>
                                                </div>
                                            </div>

                                            <Link
                                                className={``}
                                                href={{
                                                    pathname: '' + `/${id}`
                                                }}
                                            >
                                                <ArticlesButton
                                                    className="px-5"
                                                    small
                                                >
                                                    Join
                                                </ArticlesButton>
                                            </Link>

                                        </div>
                                    )

                                })}
                            </div>

                            <div className="text-center">
                                <div>Express Play Servers</div>
                                <div className='small mb-1'>2 seconds per space.</div>
                            </div>

                            <div className='servers mb-3'>
                                {[9, 10, 11, 12].map(id => {

                                    let game_lookup = lobbyDetails?.games?.find(game => parseInt(game.server_id) == id)

                                    return (
                                        <div key={id} className="server card rounded-0 flex-row flex-header border border-white p-2">

                                            <div>
                                                <div className='d-flex justify-content-between align-items-center w-100 mb-2'>
                                                    <div className="mb-0" style={{ fontSize: '0.9rem' }}><b>Server {id}</b></div>
                                                </div>

                                                <div className='d-flex'>
                                                    <div className='d-flex justify-content-start'>
                                                        {[1, 2, 3, 4].map(player_count => {

                                                            let playerLookup = false
                                                            if (game_lookup?.players?.length >= player_count) playerLookup = true

                                                            return (
                                                                <div
                                                                    key={player_count}
                                                                    className="icon"
                                                                    style={{
                                                                        width: '20px',
                                                                        height: '20px',
                                                                        ...(playerLookup ? {
                                                                            backgroundColor: 'cyan',
                                                                        } : {
                                                                            backgroundColor: 'gray',
                                                                        }),
                                                                        border: '1px solid black'
                                                                    }}>

                                                                </div>
                                                            )

                                                        })}
                                                    </div>
                                                    <div className='mb-0 ms-1'>{game_lookup?.players?.length || 0}/4 Players</div>
                                                </div>
                                            </div>

                                            <Link
                                                className={``}
                                                href={{
                                                    pathname: `/${id}`
                                                }}
                                            >
                                                <ArticlesButton
                                                    className="px-5"
                                                    small
                                                >
                                                    Join
                                                </ArticlesButton>
                                            </Link>

                                        </div>
                                    )

                                })}
                            </div>
                        </>
                    </IsDev>

                </div>

                <div className='d-flex justify-content-center align-items-center'>
                    <div style={{ width: '300px' }}><ReturnToLauncherButton /></div>
                </div>

            </div>

            <GameScoreboard
                game="Catching Game"
                style="Default"
                darkMode={darkMode ? true : false}
            />

            <Ad
                style="Default"
                section={"Games"}
                section_id={game_name}
                darkMode={darkMode ? true : false}
                user_ad_token={userToken}
                userDetails={userDetails}
                userDetailsLoading={userDetailsLoading}
            />

        </div>
    )
}