"use client"
import { useState, useEffect, useRef, useMemo } from 'react';

// import Link from 'next/link'
import Image from 'next/image';
import dynamic from 'next/dynamic'
import { useSearchParams, useRouter, usePathname, useParams } from 'next/navigation';

// import BasicLoading from '@/components/loading/BasicLoading';
// import Countdown from 'react-countdown';
// import { add } from 'date-fns';
// import { Accordion, Card, Dropdown, DropdownButton } from 'react-bootstrap';
import ArticlesButton from '@/components/UI/Button';
import useFullscreen from '@/hooks/useFullScreen';
// import { useHotkeys } from 'react-hotkeys-hook';
// import IsDev from '@/components/UI/IsDev';
import { useSocketStore } from '@/hooks/useSocketStore';
import { useStore } from '@/hooks/useStore';

import TwoDimensionalMap from '@/components/Game/TwoDimensionalMap';

// import usePlayerMoveLogic from '@/hooks/usePlayerMoveLogic';

import GameLogicManager from '@/components/Game/GameLogicManager';
import useRollDice from '@/hooks/useRollDice';
import SideMenu from '@/components/UI/SideMenu';
import classNames from 'classnames';
// import MenuBar from '@/components/UI/MenuBar';
// import AudioHandler from '@/components/Game/AudioHandler';

const ArticlesModal = dynamic(
    () => import('@/components/UI/ArticlesModal'),
    { ssr: false }
)

// const InviteModal = dynamic(
//     () => import('@/components/UI/InviteModal'),
//     { ssr: false }
// )

// const InfoModal = dynamic(
//     () => import('@/components/UI/InfoModal'),
//     { ssr: false }
// )

// const SettingsModal = dynamic(
//     () => import('@/components/UI/SettingsModal'),
//     { ssr: false }
// )

const GameCanvas = dynamic(() => import('@/components/Game/GameCanvas'), {
    ssr: false,
});

const GameSetupModal = dynamic(
    () => import('@/components/UI/GameSetupModal'),
    { ssr: false }
)

export default function BattleTrapGamePage(props) {

    const {
        socket,
    } = useSocketStore(state => ({
        socket: state.socket,
    }));

    const threeDimensional = useStore(state => state.threeDimensional);
    const setThreeDimensional = useStore(state => state.setThreeDimensional);

    const nickname = useStore(state => state.nickname);
    const character = useStore(state => state.character);

    const localGameState = useStore(state => state.localGameState);
    const addSpace = useStore(state => state.addSpace);

    const players = useStore(state => state.players);
    const setPlayers = useStore(state => state.setPlayers);

    const currentTurn = useStore(state => state.currentTurn);
    // const setCurrentTurn = useStore(state => state.setCurrentTurn);

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

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    const [showInfoModal, setShowInfoModal] = useState(false)
    const [showSettingsModal, setShowSettingsModal] = useState(false)

    const [showInviteModal, setShowInviteModal] = useState(false)

    const [showBotModal, setShowBotModal] = useState(false)
    const [botOptions, setBotOptions] = useState({
        difficulty: "Easy"
    })

    const gameState = useStore(state => state.gameState);
    const showMenu = useStore(state => state.showMenu);
    const sidebar = useStore(state => state.sidebar);

    // const dispatch = useDispatch()

    // const [currentRoll, setCurrentRoll] = useState(null)

    const [currentRollDiceOne, setCurrentRollDiceOne] = useState(null)
    const [currentRollDiceTwo, setCurrentRollDiceTwo] = useState(null)

    // const [currentTurnCountdown, setCurrentTurnCountdown] = useState(add(new Date(), { minutes: 1 }))

    const [showPlayers, setShowPlayers] = useState(true)

    const subscribeToNewPlayer = () => {
        socket.on('newPlayer', function (players) {

            console.log("newPlayer received");
            console.log(players)

            // document.getElementById('playerCount').innerHTML = totalPlayerCount;
            // totalPlayerCount >= 4 ? ($('#lobbyStatus').html('[Game In Progress]'), $('#lobbyStatus').css("color", "green")) : ($('#lobbyStatus').html('[Waiting on more players]'), $('#lobbyStatus').css("color", "red"));

            // var keyNames = Object.keys(players);

            // try {
            //     document.getElementById('lobby_1').innerHTML = players[keyNames[0]].nickname;
            //     document.getElementById('playerOneId').innerHTML = players[keyNames[0]].id;
            // }
            // catch (err) {
            //     console.log('Red Player is still needed to start the game')
            // }
            // try {
            //     document.getElementById('lobby_2').innerHTML = players[keyNames[1]].nickname;
            //     document.getElementById('playerTwoId').innerHTML = players[keyNames[1]].id;
            // }
            // catch (err) {
            //     console.log('Blue Player is still needed to start the game')
            // }
            // try {
            //     document.getElementById('lobby_3').innerHTML = players[keyNames[2]].nickname;
            //     document.getElementById('playerThreeId').innerHTML = players[keyNames[2]].id;
            // }
            // catch (err) {
            //     console.log('Green Player is still needed to start the game')
            // }
            // try {
            //     document.getElementById('lobby_4').innerHTML = players[keyNames[3]].nickname;
            //     document.getElementById('playerFourId').innerHTML = players[keyNames[3]].id;
            // }
            // catch (err) {
            //     console.log('Yellow Player is still needed to start the game')
            // }

            // if (displayBugs) {
            //     console.log('Display bug info')
            // } else {
            //     console.log('Don\'t display bug info')
            //     document.getElementById('debug-bug-info').classList.add('d-none')
            // }

        });
    }

    const rollDice = useRollDice(server);

    // function rollDice(min = 1, max = 10) {

    //     if (server == 'single-player' || server == 'local-play') {

    //         // setCurrentRoll(
    //         //     Math.floor(Math.random() * 10)
    //         // )

    //         const roll = Math.floor(Math.random() * (max - min + 1)) + min;
    //         setCurrentRoll(roll);

    //         const localGameState = useStore.getState().localGameState;
    //         const setLocalGameState = useStore.getState().setLocalGameState;

    //         setLocalGameState({
    //             ...localGameState,
    //             moveTimer: localGameState?.moveTime
    //         });

    //     }

    //     socket.emit('game:battle-trap:roll-dice', {
    //         server: server,
    //         settings: {}
    //     });

    //     return

    //     // TODO - Make this game work offline would be cool!

    //     var diceOne = Math.floor(Math.random() * 6) + 1
    //     var diceTwo = Math.floor(Math.random() * 6) + 1

    //     setCurrentRollDiceOne(diceOne)
    //     setCurrentRollDiceTwo(diceTwo)
    //     setCurrentRoll(diceOne + diceTwo)

    // }

    const currentPlayer = useMemo(() => {
        return players[currentTurn]?.battleTrap
    }, [players, currentTurn]);

    return (
        <div
            className={classNames(
                `${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`,
                {
                    'menu-open': showMenu,
                    'fullscreen': useFullscreen().isFullscreen,
                    'show-sidebar': sidebar,
                }
            )}
            id={`${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`}
        >

            <GameLogicManager />

            {/* {showInfoModal &&
                <InfoModal
                    show={showInfoModal}
                    setShow={setShowInfoModal}
                />
            } */}

            {/* {showSettingsModal &&
                <SettingsModal
                    show={showSettingsModal}
                    setShow={setShowSettingsModal}
                />
            } */}

            {/* {showInviteModal &&
                <InviteModal
                    show={showInviteModal}
                    setShow={setShowInviteModal}
                />
            } */}

            {players.length == 0 &&
                <GameSetupModal
                    show={{
                        type: server,
                    }}
                    preventClose={true}
                    setShow={() => {
                        console.error("No leaving on play page!")
                    }}
                />
            }

            {showBotModal &&
                <ArticlesModal
                    show={showBotModal}
                    setShow={setShowBotModal}
                    title="Add a Bot"
                    action={() => {

                        socket.emit(`game:battle-trap:add-bot`, {
                            server: server,
                            difficulty: botOptions?.difficulty,
                        });

                        setShowBotModal(false)

                    }}
                    actionText={'Add'}
                >

                    <div className="fw-bold">Difficulty</div>

                    <div className='d-flex'>

                        {["Easy", "Medium", "Hard"].map(item => {
                            return (
                                <ArticlesButton
                                    key={item}
                                    active={item == botOptions?.difficulty}
                                    onClick={() => {
                                        setBotOptions({
                                            difficulty: item
                                        })
                                    }}
                                >
                                    {item}
                                </ArticlesButton>
                            )
                        })}

                    </div>

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

            {/* <MenuBar /> */}

            <SideMenu />

            {/* Game Board */}
            <div className='game-content'>

                {threeDimensional &&
                    <div className='canvas-three-wrap'>
                        <GameCanvas
                            gameState={gameState}
                            server={server}
                            players={players}
                        />
                    </div>
                }

                {!threeDimensional &&
                    <div className='canvas-two-dimensional-wrap'>
                        <TwoDimensionalMap

                        />
                    </div>
                }

            </div>

        </div>
    )
}