"use client"
import { useState, useEffect, useRef, useMemo } from 'react';

import Link from 'next/link'
import Image from 'next/image';
import dynamic from 'next/dynamic'
import { useSearchParams, useRouter, usePathname, useParams } from 'next/navigation';

// import BasicLoading from '@/components/loading/BasicLoading';
// import Countdown from 'react-countdown';
import { add } from 'date-fns';
import { Accordion, Card, Dropdown, DropdownButton } from 'react-bootstrap';
import ArticlesButton from '@/components/UI/Button';
import useFullscreen from '@/hooks/useFullScreen';
// import { useHotkeys } from 'react-hotkeys-hook';
import IsDev from '@/components/UI/IsDev';
import { useSocketStore } from '@/hooks/useSocketStore';
import { useStore } from '@/hooks/useStore';

import TwoDimensionalMap from '@/components/Game/TwoDimensionalMap';

// import usePlayerMoveLogic from '@/hooks/usePlayerMoveLogic';

import GameLogicManager from '@/components/Game/GameLogicManager';
import useRollDice from '@/hooks/useRollDice';
import useCurrentPlayer from '@/hooks/useCurrentPlayer';
import usePlayerMoveLogic from '@/hooks/usePlayerMoveLogic';

const diceNumbersToWords = {
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
};

export default function SideMenu() {

    const {
        socket,
    } = useSocketStore(state => ({
        socket: state.socket,
    }));

    const theme = useStore(state => state.theme);
    const setTheme = useStore(state => state.setTheme);

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    const threeDimensional = useStore(state => state.threeDimensional);
    const setThreeDimensional = useStore(state => state.setThreeDimensional);

    const nickname = useStore(state => state.nickname);
    const character = useStore(state => state.character);

    const localGameState = useStore(state => state.localGameState);
    const gameState = useStore(state => state.gameState);
    const setLocalGameState = useStore(state => state.setLocalGameState);
    const addSpace = useStore(state => state.addSpace);

    const setShowInfoModal = useStore(state => state.setShowInfoModal);

    const setGameState = useStore(state => state.setGameState);

    const players = useStore(state => state.players);
    const setPlayers = useStore(state => state.setPlayers);

    const currentTurn = useStore(state => state.currentTurn);
    const setCurrentTurn = useStore(state => state.setCurrentTurn);

    const currentRoll = useStore(state => state.currentRoll);
    const setCurrentRoll = useStore(state => state.setCurrentRoll);

    const currentMoveCount = useStore(state => state.currentMoveCount);
    const setCurrentMoveCount = useStore(state => state.setCurrentMoveCount)
    const incCurrentMoveCount = useStore(state => state.incCurrentMoveCount);

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const searchParamsObject = Object.fromEntries(searchParams.entries());
    // const params = useParams()
    const server = searchParamsObject?.server

    const handlePlayerMove = usePlayerMoveLogic(server);

    const currentPlayer = useCurrentPlayer()

    const rollDice = useRollDice(server);

    const [showPlayers, setShowPlayers] = useState(true)

    return (
        <div className='menu-card'>

            {server == "single-player" &&
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
                                        <i className="fad fa-user text-center" style={{ width: '30px' }}></i>
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
            }

            {server == "local-play" &&
                <div className="d-none card card-articles card-sm mb-2">

                    <div className="card-body p-2">

                        <div>
                            Local Play
                        </div>

                        <div>
                            {gameState?.status == 'In Lobby' && 'In Lobby - Waiting for players'}
                            {gameState?.status == 'In Progress' && 'In Progress - Your Turn'}
                        </div>

                    </div>

                </div>
            }

            {(server !== "single-player" && server !== "local-play") &&
                <div className="card card-articles card-sm mb-2">

                    <div className="card-body p-2">

                        <div>Room: {server}</div>
                        <div>
                            {gameState?.status == 'In Lobby' && 'In Lobby - Waiting for players'}
                            {gameState?.status == 'In Progress' && 'In Progress - Your Turn'}
                        </div>

                    </div>

                </div>
            }

            <div className='d-flex mb-2'>

                {
                    (
                        server !== "single-player"
                        &&
                        server !== "local-play"
                    )
                    &&
                    <ArticlesButton
                        className="flex-grow-1"
                        disabled={
                            gameState?.status !== "In Lobby"
                            ||
                            (players?.length || 0) < 2
                        }
                        small
                        onClick={() => {

                            socket.emit('game:battle-trap:start-game', {
                                server: server,
                                settings: {}
                            });

                        }}
                    >

                        <i className="fad fa-play"></i>
                        <span>Start Game</span>

                        <span className="badge bg-dark ms-2">
                            {`2+ Players`}
                        </span>

                    </ArticlesButton>}

                <IsDev>
                    <ArticlesButton
                        className="w-100"
                        variant="warning"
                        small
                        onClick={() => {

                            socket.emit('game:battle-trap:start-game', {
                                server: server,
                                settings: {}
                            });

                        }}
                    >
                        <i className="fad fa-play me-0"></i>
                    </ArticlesButton>
                </IsDev>

            </div>

            <div className='d-flex'>

                <Link href={'/'} className='w-50'>
                    <ArticlesButton
                        small
                        className="w-100"
                    >
                        <i className="fad fa-sign-out fa-rotate-180"></i>
                        <span>Leave <span className='d-none d-lg-inline-block'>Game</span></span>
                    </ArticlesButton>
                </Link>

                <ArticlesButton
                    small
                    className="w-50"
                    active={isFullscreen}
                    onClick={() => {
                        if (isFullscreen) {
                            exitFullscreen()
                        } else {
                            requestFullscreen('battle-trap-game-page')
                        }
                    }}
                >
                    {isFullscreen && <span>Exit </span>}
                    {!isFullscreen && <span><i className='fad fa-expand'></i></span>}
                    <span>Fullscreen</span>
                </ArticlesButton>

            </div>

            <div className=''>
                <ArticlesButton
                    className="w-50"
                    small
                    onClick={() => {
                        setShowInfoModal({
                            game: 'Battle Trap'
                        })
                    }}
                >
                    <i className="fad fa-info-circle"></i>
                    <span>Info</span>
                </ArticlesButton>
                <ArticlesButton
                    className="w-50"
                    small
                    onClick={() => {
                        setShowSettingsModal({
                            game: 'Battle Trap'
                        })
                    }}
                >
                    <i className="fad fa-cog"></i>
                    <span>Settings</span>
                </ArticlesButton>
            </div>

            <div className='mb-3 d-flex'>

                <div className='w-50'>
                    <DropdownButton
                        variant="articles w-100"
                        size='sm'
                        id="dropdown-basic-button"
                        className="dropdown-articles"
                        title={
                            <span>
                                <i className="fad fa-eyedropper"></i>
                                <span>Theme: {theme == "Dark" ? 'Dark' : 'Light'}</span>
                                {/* <span>{darkMode ? 'On' : 'Off'}</span> */}
                            </span>
                        }
                    >

                        <div style={{ maxHeight: '600px', overflowY: 'auto', width: '200px' }}>

                            {[
                                true, false
                            ]
                                .map(location =>
                                    <Dropdown.Item
                                        key={location}
                                        onClick={() => {
                                            // setDarkMode(location)
                                            setTheme(theme == "Dark" ? "Light" : "Dark")
                                        }}
                                        className="d-flex justify-content-between"
                                    >
                                        {location ? 'Dark' : 'Light'}
                                    </Dropdown.Item>
                                )}

                        </div>

                    </DropdownButton>
                </div>

                <ArticlesButton
                    className="w-50"
                    small
                    onClick={() => {
                        // setShowInfoModal({
                        //     game: 'Battle Trap'
                        // })
                        setThreeDimensional(!threeDimensional)
                    }}
                >
                    <i className="fad fa-info-circle"></i>
                    <span>{threeDimensional ? '3D Mode' : '2D Mode'}</span>
                </ArticlesButton>

            </div>

            {/* {localGameState?.gameStarted ? '1' : '0'} */}

            {/* Tile Moves */}
            <div className="card card-articles card-sm mb-2">

                <div className="card-header flex-header">
                    <div>Tile Moves</div>
                    <span className='badge bg-dark'>
                        <span>0 Left</span>
                    </span>
                </div>

                <div className="card-body text-center">
                    <div className='h3 mb-0'>

                        {gameState?.status == 'In Lobby' ?
                            <span>Awaiting game start</span>
                            :
                            <span>
                                {localGameState?.moveTimer}
                            </span>
                            // <Countdown
                            //     date={gameState?.moveTimer}
                            // />
                        }


                    </div>
                </div>

            </div>

            {/* Dice Roll */}
            <div className="card card-articles card-sm mb-2">

                <div className="card-header flex-header">

                    <div className='d-flex justify-content-center align-items-center'>
                        <span>Dice Roll</span>
                    </div>

                    <div>
                        <span className='badge bg-dark'>
                            <span>Moves: </span>

                            <span>{gameState?.turn?.spaces}</span>
                            <span>{currentMoveCount}</span>

                            <span>/</span>

                            <span>{currentRoll === false ? '?' : currentRoll}</span>

                        </span>
                        {/* <span className='badge bg-dark ms-2'>
                                <span>{currentRoll || 0} Left</span>
                            </span> */}
                    </div>

                </div>

                <div className="card-body text-center">

                    {currentRoll === false ? `${currentPlayer?.nickname} Please Roll` : currentRoll}

                    {(gameState?.status == 'In Lobby' && !gameState?.turn) &&
                        <>
                            <i className={`fal fa-dice-four fa-3x`}></i>
                            <i className={`fal fa-dice-two fa-3x me-0`}></i>
                        </>
                    }

                    <i className={`fal fa-dice-${diceNumbersToWords[gameState?.turn?.dice_one]} fa-3x`}></i>
                    <i className={`fal fa-dice-${diceNumbersToWords[gameState?.turn?.dice_two]} fa-3x me-0`}></i>

                </div>

                <div className="card-footer d-flex justify-content-center align-items-center">

                    {/* <ArticlesButton
                            className="flex-grow-1"
                            onClick={() => {
                                rollDice()
                            }}
                        >
                            <i className="fad fa-play"></i>
                            <span>Auto</span>
                            <span className="badge bg-dark ms-1">Off</span>
                        </ArticlesButton> */}

                    <ArticlesButton
                        small
                        className="flex-grow-1"
                        disabled={currentRoll}
                        onClick={() => {
                            rollDice()
                        }}
                    >
                        <i className="fad fa-play"></i>
                        <span>Roll Dice</span>
                    </ArticlesButton>

                </div>

            </div>

            {/* Players */}
            <div className="card card-articles card-sm mb-2 mt-auto">

                <div className="card-header flex-header">

                    <ArticlesButton
                        small
                        className="py-1"
                        active={showPlayers}
                        onClick={() => {
                            setShowPlayers(prev => !prev)
                        }}
                    >
                        <i className="fad fa-eye me-0"></i>
                    </ArticlesButton>

                    {/* <span>Players</span> */}

                    <span className='badge bg-dark'>

                        <span className='me-2'>
                            <i className="fad fa-users"></i>
                            {players?.filter(player => !player.battleTrap?.bot)?.length}
                        </span>

                        <span>
                            <i className="fad fa-robot"></i>
                            {players?.filter(player => player.battleTrap?.bot)?.length}
                        </span>

                    </span>

                </div>

                {showPlayers && <>
                    <div className="card-body p-2">
                        <div className="players mb-0">

                            {players.map((player_obj, i) => <div
                                key={`${player_obj}-${i}`}
                                className="player open p-1"
                                onClick={() => {

                                }}
                            >

                                <div className='d-flex align-items-center '>

                                    {player_obj?.battleTrap?.dead ?
                                        <i className="fad fa-skull text-center" style={{ width: '30px' }}></i>
                                        :
                                        player_obj?.battleTrap?.bot ?
                                            <i className="fad fa-robot text-center" style={{ width: '30px' }}></i>
                                            :
                                            <i className="fad fa-user text-center" style={{ width: '30px' }}></i>

                                    }


                                    <h5 className='mb-0'>{player_obj?.battleTrap?.nickname || '?'}</h5>

                                </div>

                                {process.env.NODE_ENV == 'development' &&
                                    <ArticlesButton
                                        small
                                        active={i == currentTurn}
                                        variant='warning'
                                        onClick={() => {
                                            setCurrentTurn(i)
                                        }}
                                    >
                                        <i className="fad fa-code me-1"></i>
                                        Turn
                                    </ArticlesButton>
                                }

                            </div>)}

                            {/* {players.length < 4 && */}
                            <div className='d-flex justify-content-center flex-wrap'>

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
                                        <i className="fad fa-robot"></i>
                                        <span className='mb-0'>Add Bot</span>
                                    </ArticlesButton> */}

                                {
                                    (server !== 'single-player' && server !== 'local-play')
                                    &&
                                    <ArticlesButton
                                        small
                                        className="w-50"
                                        onClick={() => {
                                            setShowInviteModal({
                                                type: 'Game',
                                                game_name: 'Battle Trap',
                                                server_id: server
                                            })
                                        }}
                                    >
                                        <i className="fad fa-user-plus"></i>
                                        <span className='mb-0'>Invite Players</span>
                                    </ArticlesButton>
                                }

                                <ArticlesButton
                                    small
                                    className="w-50"
                                    onClick={() => {
                                        console.log("Log Players", players)
                                    }}
                                >
                                    <i className="fad fa-users"></i>
                                    <span className='mb-0'>Log Players</span>
                                </ArticlesButton>
                                <ArticlesButton
                                    small
                                    className="w-50"
                                    onClick={() => {
                                        console.log("Log Board", localGameState?.spaces)
                                    }}
                                >
                                    <i className="fad fa-users"></i>
                                    <span className='mb-0'>Log Board</span>
                                </ArticlesButton>

                                <div
                                    className='w-50'
                                >
                                    {/* Spacer */}
                                </div>

                            </div>
                            {/* } */}

                        </div>
                    </div>

                    {/* <div className="card-footer flex-header">

                        </div> */}

                </>}

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

        </div>
    )

}