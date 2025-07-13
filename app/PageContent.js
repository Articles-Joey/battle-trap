"use client"
import { useState, useEffect, useContext, useRef } from 'react';

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
import { useSocketStore } from '@/components/useSocketStore';
import { Paper } from '@mui/material';

const Ad = dynamic(() => import('@/components/ArticlesAd'), {
    ssr: false,
});

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

const Viewer = dynamic(() => import('@/components/Game/Viewer'), {
    ssr: false,
});

const RenderModel = dynamic(() => import('@/components/Game/RenderModel'), {
    ssr: false,
});

export default function BattleTrapLobbyPage(props) {

    const {
        socket
    } = useSocketStore(state => ({
        socket: state.socket
    }));

    // const userReduxState = useSelector((state) => state.auth.user_details)
    const userReduxState = false

    const [nickname, setNickname] = useLocalStorageNew("game:nickname", userReduxState.display_name)

    const [character, setCharacter] = useLocalStorageNew("game:battle-trap:character", {})

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    const canvasGameRef = useRef(null);
    const canvasScoreboardRef = useRef(null);

    // const dispatch = useDispatch()

    const [showInfoModal, setShowInfoModal] = useState(false)
    const [showSettingsModal, setShowSettingsModal] = useState(false)

    const [lobbyDetails, setLobbyDetails] = useState({
        players: [],
        games: [],
    })

    const [autoRotate, setAutoRotate] = useState(true)

    const [showEditBikeModal, setShowEditBikeModal] = useState(false)

    useEffect(() => {

    }, []);

    useEffect(() => {

        // setShowInfoModal(localStorage.getItem('game:four-frogs:rulesAnControls') === 'true' ? true : false)

        // if (userReduxState._id) {
        //     console.log("Is user")
        // }

        socket.on('game:battle-trap-landing-details', function (msg) {
            console.log('game:battle-trap-landing-details', msg)

            if (JSON.stringify(msg) !== JSON.stringify(lobbyDetails)) {
                setLobbyDetails(msg)
            }
        });

        return () => {
            socket.off('game:battle-trap-landing-details');
            socket.emit('leave-room', 'game:battle-trap-landing')
        };

    }, [])

    useEffect(() => {

        if (socket.connected) {
            socket.emit('join-room', 'game:battle-trap-landing');
        }

        // return function cleanup() {
        //     socket.emit('leave-room', 'game:battle-trap-landing')
        // };

    }, [socket.connected]);

    return (
        <div className="battle-trap-lobby-page">

            {/* {showInfoModal &&
                <InfoModal
                    show={showInfoModal}
                    setShow={setShowInfoModal}
                />
            } */}

            {showSettingsModal &&
                <SettingsModal
                    show={showSettingsModal}
                    setShow={setShowSettingsModal}
                />
            }

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
                        {[
                            {
                                name: 'Low Poly Chopper',
                                model: 'low_poly_chopper.glb',
                                description: "Default bike."
                            },
                            // {
                            //     name: 'Dirt Bike',
                            //     description: "Win one game to unlock."
                            // },
                            {
                                name: 'Low Poly Scooter',
                                model: 'low_poly_scooter.glb',
                                description: "Win two games to unlock."
                            },
                            {
                                name: 'Low Poly Tricycle',
                                model: 'low_poly_tricycle.glb',
                                description: "Win three games to unlock."
                            },
                            {
                                name: 'Low Poly Unicycle',
                                model: 'low_poly_unicycle.glb',
                                description: "Win four games to unlock."
                            },
                            {
                                name: 'Toilet Tricycle',
                                model: 'toilet_tricycle.glb',
                                description: "Win five games to unlock."
                            },
                            // {
                            //     name: 'Light Bike',
                            //     description: "Win three games to unlock."
                            // }
                        ].map(bike_obj => {
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
                                                    setCharacter(prev => ({
                                                        ...prev,
                                                        model: bike_obj.model
                                                    }))
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

            <div className="container py-3 py-lg-5" data-theme="Dark">

                <div className="text-center mb-3 mb-lg-5 mx-auto" style={{ "maxWidth": "800px" }}>

                    <h1 className="mb-1">Battle Trap</h1>

                    <div className='text-center mb-3'>
                        <span className="">Select a server to join.</span>
                        <span className='px-2'>|</span>
                        <span className="fw-bold ">
                            {lobbyDetails.players.length || 0} player{lobbyDetails.players.length > 1 && 's'} waiting in the lobby.
                        </span>
                    </div>

                    <div className='d-lg-flex'>

                        <div className='d-flex align-items-start'>

                            <div className='d-flex flex-column'>

                                <ArticlesButton
                                    active={autoRotate}
                                    onClick={() => {
                                        setAutoRotate(prev => !prev)
                                    }}
                                    className="mb-1"
                                >
                                    <i className="fad fa-sync me-0"></i>
                                </ArticlesButton>

                                <ArticlesButton
                                    onClick={() => {
                                        // requestFullscreen('users-bike-viewer')
                                        setShowEditBikeModal(true)
                                    }}
                                    className="mb-2"
                                >
                                    <i className="fad fa-pen me-0"></i>
                                </ArticlesButton>

                                <div style={{ width: '42px', height: '42px', backgroundColor: 'red' }}>

                                </div>

                            </div>

                            <Paper
                                id='users-bike-viewer'
                                className="mb-3"
                                style={{ "width": "20rem" }}
                                sx={{ mr: 2 }}
                            >

                                {!showEditBikeModal &&
                                    <Viewer
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
                            className="mb-3"
                            style={{ "width": "20rem" }}
                        >

                            <div className="card-header d-flex flex-column justify-content-center h-100">

                                <label htmlFor="nickname">Nickname</label>
                                
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

                                <div style={{ fontSize: '0.8rem' }}>Visible to all players</div>

                            </div>

                        </Paper>

                    </div>


                    <div className='my-3 mb-4'>

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
                            className="mx-1"
                            onClick={() => {
                                setShowInfoModal({
                                    game: 'Battle Trap'
                                })
                            }}
                        >
                            Controls & Info
                        </ArticlesButton>

                        <ArticlesButton
                            small
                            className="mx-1"
                            onClick={() => {
                                setShowSettingsModal({
                                    game: 'Battle Trap'
                                })
                            }}
                        >
                            Settings
                        </ArticlesButton>

                        <ArticlesButton
                            className="mx-1"
                            small
                        >
                            Private Game
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

                    <div className="text-center">
                        <div>Classic Play Servers</div>
                        <div className='small mb-1'>20 seconds to complete your turn.</div>
                    </div>
                    <div className='servers mb-3'>
                        {[1, 2, 3, 4].map(id => {

                            let game_lookup = lobbyDetails?.games?.find(game => parseInt(game.server_id) == id)

                            return (
                                <Paper key={id} className="server flex-row flex-header border border-white p-2">

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
                                            pathname: `/play`,
                                            query: {server: id}
                                        }}
                                    >
                                        <ArticlesButton
                                            className="px-5"
                                            small
                                        >
                                            Join
                                        </ArticlesButton>
                                    </Link>

                                </Paper>
                            )

                        })}
                    </div>

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

            </div>

            <div className="ad-wrap">
                {/* TODO - Ad Script */}
                <Ad section={"Games"} section_id={'Four Frogs'} />
            </div>

        </div>
    )
}