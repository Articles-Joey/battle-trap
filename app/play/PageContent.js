"use client"
import { useState, useEffect, useContext, useRef } from 'react';

import Link from 'next/link'
import Image from 'next/image';
import dynamic from 'next/dynamic'
import { useSearchParams, useRouter, usePathname, useParams } from 'next/navigation';

// import Modal from 'react-bootstrap/Modal';

// import ROUTES from '@/components/constants/routes';

// import { useSelector, useDispatch } from 'react-redux';
// import { toggleCustomTheme, setCustomThemeModal } from '@/redux/actions/siteActions';

// import BasicLoading from '@/components/loading/BasicLoading';
import Countdown from 'react-countdown';
import { add } from 'date-fns';
import { Accordion, Card } from 'react-bootstrap';
import ArticlesButton from '@/components/UI/Button';
import useFullscreen from '@/hooks/useFullScreen';
import { useHotkeys } from 'react-hotkeys-hook';
// import { useLocalStorageNew } from 'util/useLocalStorageNew';
import IsDev from '@/components/UI/IsDev';
// import games from '@/components/constants/games';
import { useSocketStore } from '@/hooks/useSocketStore';
import { useStore } from '@/hooks/useStore';
import { X } from '@mui/icons-material';

const diceNumbersToWords = {
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
};

const ArticlesModal = dynamic(
    () => import('@/components/UI/ArticlesModal'),
    { ssr: false }
)

const InviteModal = dynamic(
    () => import('@/components/UI/InviteModal'),
    { ssr: false }
)

const InfoModal = dynamic(
    () => import('@/components/UI/InfoModal'),
    { ssr: false }
)

const SettingsModal = dynamic(
    () => import('@/components/UI/SettingsModal'),
    { ssr: false }
)

const GameCanvas = dynamic(() => import('@/components/Game/GameCanvas'), {
    ssr: false,
});

export default function BattleTrapGamePage(props) {

    const {
        socket,
    } = useSocketStore(state => ({
        socket: state.socket,
    }));

    const localGameState = useStore(state => state.localGameState);
    const addSpace = useStore(state => state.addSpace);

    const players = useStore(state => state.players);
    const setPlayers = useStore(state => state.setPlayers);

    const currentTurn = useStore(state => state.currentTurn);
    const setCurrentTurn = useStore(state => state.setCurrentTurn);

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

    const canvasGameRef = useRef(null);
    const staticGameCanvasRef = useRef(null);
    const canvasScoreboardRef = useRef(null);

    // const [players, setPlayers] = useState([]);

    // const [players, setPlayers] = useState([
    //     {
    //         id: '123',
    //         battleTrap: {
    //             nickname: "Player 1",
    //             color: "red",
    //             x: 0,
    //             y: 0,
    //             character: {
    //                 model: "low_poly_chopper.glb"
    //             }
    //         }
    //     },
    //     {
    //         id: '124',
    //         battleTrap: {
    //             nickname: "Player 2",
    //             color: "blue",
    //             x: 5,
    //             y: 5,
    //             character: {
    //                 model: "low_poly_chopper.glb"
    //             }
    //         }
    //     }
    // ]);

    const [gameState, setGameState] = useState(false)

    // const dispatch = useDispatch()

    const [currentRoll, setCurrentRoll] = useState(null)

    const [currentRollDiceOne, setCurrentRollDiceOne] = useState(null)
    const [currentRollDiceTwo, setCurrentRollDiceTwo] = useState(null)

    const [currentTurnCountdown, setCurrentTurnCountdown] = useState(add(new Date(), { minutes: 1 }))

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

    function rollDice() {

        socket.emit('game:battle-trap:roll-dice', {
            server: server,
            settings: {}
        });

        return

        // TODO - Make this game work offline would be cool!

        var diceOne = Math.floor(Math.random() * 6) + 1
        var diceTwo = Math.floor(Math.random() * 6) + 1

        setCurrentRollDiceOne(diceOne)
        setCurrentRollDiceTwo(diceTwo)
        setCurrentRoll(diceOne + diceTwo)

    }

    var canvas;
    var context;

    var static_canvas;
    var static_context;

    function battleTrapGameTickLogic(msg) {
        console.log(`Just received battleTrapGameTickLogic`, msg);
    }

    useEffect(() => {

        canvas = document.getElementById('player-canvas');
        context = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 600;

        static_canvas = document.getElementById('static-canvas');
        static_context = static_canvas.getContext('2d');
        static_canvas.width = 600;
        static_canvas.height = 600;

        drawBoard()

        // socket.emit('join-room', 'game:battle-trap');
        socket.on('battle-trap-players', battleTrapGameTickLogic);

        return () => {
            socket.off('battle-trap-players')
            // clearInterval(movementEmit);
            socket.emit('leave-room', 'game:battle-trap');
        }

    }, []);

    useEffect(() => {

        // setShowInfoModal(localStorage.getItem('game:four-frogs:rulesAnControls') === 'true' ? true : false)

        // if (userReduxState._id) {
        //     console.log("Is user")
        // }

        socket.on(`game:battle-trap-room-${server}`, function (data) {
            console.log('game:battle-trap-landing-details', data)
            // setLobbyDetails(msg)
            setPlayers(data?.players || [])
            setGameState(data?.game_state)
        });

        if (
            server == 'single-player'
            ||
            server == 'local-play'
        ) {
            console.log("Set players because local")
            setPlayers([
                {
                    id: '123',
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
                    id: '124',
                    battleTrap: {
                        nickname: "Player 2",
                        color: "blue",
                        x: 5,
                        y: 5,
                        character: {
                            model: "low_poly_chopper.glb"
                        }
                    }
                }
            ])
        }

        return () => {
            socket.off(`game:battle-trap-room-${server}`);
        };

    }, [server])

    // const [character, setCharacter] = useLocalStorageNew("game:battle-trap:character", {})

    useEffect(() => {

        if (socket.connected) {
            socket.emit('join-room', `game:battle-trap-room-${server}`, {
                client_version: '1',
                game_id: server,
                character: JSON.parse(localStorage.getItem('game:battle-trap:character')),
                nickname: JSON.parse(localStorage.getItem('game:nickname'))
            });
        }

        return function cleanup() {
            socket.emit('leave-room', `game:battle-trap-room-${server}`, {
                client_version: '1',
                game_id: server
            })
        };

    }, [server]);

    function drawBoard() {

        // Box width
        var bw = 600;
        // Box height
        var bh = 600;
        // Padding
        var p = 0;

        var context = static_context

        for (var x = 0; x <= bw; x += 30) {
            context.moveTo(0.5 + x + p, p);
            context.lineTo(0.5 + x + p, bh + p);
        }

        for (var x = 0; x <= bh; x += 30) {
            context.moveTo(p, 0.5 + x + p);
            context.lineTo(bw + p, 0.5 + x + p);
        }

        // context.strokeStyle = "black";
        context.strokeStyle = "#f000ff";
        context.stroke();

        context.fillStyle = '#38FF12';
        context.fillRect(7.5, 7.5, (15 * 7), 15);

        context.fillStyle = '#FDFF00';
        context.fillRect(7.5, (7.5 * 5), (15 * 14), (15));

        context.fillStyle = '#001eff';
        // context.rotate(180 * Math.PI / 180);
        context.fillRect((bw - 21), (bh - (21 * 15.3)), (15), (15 * 21));

        // context.rotate(0);

        context.fillStyle = '#FF8001';
        context.fillRect((7.5), (bh - 21), (15 * 28), (15));

    }

    function handlePlayerMoveLogic(newSpaceData) {

        // Logic instead of every hotkey

        // If multi-player and no game state, do nothing
        let currentPlay = players?.find(player_obj => player_obj.id == socket.id)?.battleTrap

        // Local Play override
        let currentPlayerColor = players[currentTurn]?.battleTrap?.color
        console.log("Current Player Color", currentPlayerColor)
        currentPlay = players?.find(player_obj => player_obj.battleTrap.color == currentPlayerColor)?.battleTrap

        console.log("Forward with the current player", currentPlay)

        if (
            server == 'single-player'
            ||
            server == 'local-play'
        ) {

            let newSpace = {
                x: currentPlay?.x + newSpaceData.x,
                y: currentPlay?.y + newSpaceData.y,
                checked: {
                    move: (localGameState?.spaces?.length || 0) + 1,
                    color: currentPlayerColor,
                    socket_id: 'socket_id_1',
                }
            }

            console.log("single-player Forward event", newSpace)

            addSpace({
                space: newSpace,
                player_color: currentPlayerColor
            })

            return

        } else {

            // console.log("currentPlay")

            // TODO - Confirm working because got redone with local play

            socket.emit('game:battle-trap-move', {
                game_id: server,
                x: currentPlay?.x + newSpaceData.x,
                y: currentPlay?.y + newSpaceData.y
            });

        }

    }

    useHotkeys('w', () => {

        console.log("Back?")
        handlePlayerMoveLogic({
            x: 0,
            y: 1
        })
        return

        // If multi-player and no game state, do nothing
        let currentPlay = players?.find(player_obj => player_obj.id == socket.id)?.battleTrap

        // Local Play override
        currentPlay = players?.find(player_obj => player_obj.battleTrap.color == 'red')?.battleTrap

        console.log("Forward with the current player", currentPlay)

        if (
            server == 'single-player'
            ||
            server == 'local-play'
        ) {

            let newSpace = {
                x: currentPlay?.x,
                y: currentPlay?.y + 1,
                checked: {
                    move: (localGameState?.spaces?.length || 0) + 1,
                    socket_id: 'socket_id_1',
                }
            }

            console.log("single-player Forward event", newSpace)

            addSpace({
                space: newSpace,
                player_color: 'red'
            })

            return

        } else {

            // console.log("currentPlay")

            socket.emit('game:battle-trap-move', {
                game_id: server,
                x: currentPlay?.x,
                y: currentPlay?.y + 1
            });

        }

    }, [localGameState, players]);

    useHotkeys('s', () => {

        console.log("Back?")
        handlePlayerMoveLogic({
            x: 0,
            y: -1
        })
        return

        let currentPlay = players?.find(player_obj => player_obj.id == socket.id)?.battleTrap

        if (!currentPlay) return

        socket.emit('game:battle-trap-move', {
            game_id: server,
            x: players.find(player_obj => player_obj.id == socket.id).battleTrap?.x,
            y: players.find(player_obj => player_obj.id == socket.id).battleTrap?.y - 1
        });
    });

    useHotkeys('a', () => {

        console.log("Left?")
        handlePlayerMoveLogic({
            x: -1,
            y: 0
        })
        return

        let currentPlay = players?.find(player_obj => player_obj.id == socket.id)?.battleTrap

        if (!currentPlay) return

        socket.emit('game:battle-trap-move', {
            game_id: server,
            x: players.find(player_obj => player_obj.id == socket.id).battleTrap?.x - 1,
            y: players.find(player_obj => player_obj.id == socket.id).battleTrap?.y
        });
    });

    useHotkeys('d', () => {

        console.log("Right?")
        handlePlayerMoveLogic({
            x: 1,
            y: 0
        })
        return

        let currentPlay = players?.find(player_obj => player_obj.id == socket.id)?.battleTrap

        if (!currentPlay) return

        socket.emit('game:battle-trap-move', {
            game_id: server,
            x: players.find(player_obj => player_obj.id == socket.id).battleTrap?.x + 1,
            y: players.find(player_obj => player_obj.id == socket.id).battleTrap?.y
        });
    });

    useEffect(() => {

        if (socket) {

            return

            // Box width
            var bw = 600;
            // Box height
            var bh = 600;
            // Padding
            var p = 0;

            var movement = {
                up: false,
                down: false,
                left: false,
                right: false,
                tongue: false
            }

            document.addEventListener('keydown', function (event) {
                switch (event.keyCode) {
                    case 65: // A
                        movement.left = true;
                        break;
                    case 87: // W
                        movement.up = true;
                        break;
                    case 68: // D
                        movement.right = true;
                        break;
                    case 83: // S
                        movement.down = true;
                        break;
                    case 37: // ArrowLeft
                        movement.rotateLeft = true;
                        break;
                    case 39: // ArrowRight
                        movement.rotateRight = true;
                        break;
                    case 38: // ArrowUp
                        movement.score = true;
                        break;
                    case 32: // Tongue
                        movement.tongue = true;
                        break;
                }
            });

            document.addEventListener('keyup', function (event) {
                switch (event.keyCode) {
                    case 65: // A
                        movement.left = false;
                        break;
                    case 87: // W
                        movement.up = false;
                        break;
                    case 68: // D
                        movement.right = false;
                        break;
                    case 83: // S
                        movement.down = false;
                        break;
                    case 37: // ArrowLeft
                        movement.rotateLeft = false;
                        break;
                    case 39: // ArrowRight
                        movement.rotateRight = false;
                        break;
                    case 32: // Tongue
                        movement.tongue = false;
                        break;
                }
            });

            console.log("socket has changed")

            socket.emit('new player', { nickname: "Joey" });

            socket.on('state', function (players, bugs, insectTrack, powerups, timer, powerups_schedule) {

                for (var id in players) {
                    var player = players[id];

                    var playerSize = 20;
                    var draw = 'square';

                    // switch (player.powerup) {
                    //     case 'Tough Guy':
                    //         var playerSize = 60;
                    //         context.font = "10px Arial";
                    //         context.fillStyle = "#000";
                    //         context.textAlign = "center";
                    //         context.fillText('Tough Guy', player.x + playerSize / 2, player.y + 70);
                    //         break;
                    //     case 'Muddy Water':
                    //         context.font = "10px Arial";
                    //         context.fillStyle = "#000";
                    //         context.textAlign = "center";
                    //         context.fillText('Muddy Water', player.x + playerSize / 2, player.y + 55);
                    //         player.color = "#964"
                    //         break;
                    //     case 'Stinky Frog':
                    //         context.font = "10px Arial";
                    //         context.fillStyle = "#000";
                    //         context.textAlign = "center";
                    //         context.fillText('Stinky Frog', player.x + playerSize / 2, player.y + 55);

                    //         player.color = "#bbb"

                    //         var img = document.getElementById("stink");
                    //         context.drawImage(img, player.x, player.y - playerSize, 40, 40);
                    //         break;
                    //     case 4:
                    //         var draw = 'circle';
                    //         context.font = "10px Arial";
                    //         context.fillStyle = "#000";
                    //         context.textAlign = "center";
                    //         context.fillText('Sphere', player.x + playerSize / 2, player.y + 55);
                    //         break;
                    // }

                    // Visual Perk Over rides
                    // if (player.powerup === 0 ) {
                    //   var playerSize = 60;
                    //   context.font = "10px Arial";
                    //   context.fillStyle = "#000";
                    //   context.fillText('Tough Guy', player.x, player.y + 90);
                    // }

                    // if (player.powerup === 1) {
                    //   console.log('Player detected with Muddy Water')
                    //   context.font = "10px Arial";
                    //   context.fillStyle = "#000";
                    //   context.fillText('Muddy Water', player.x, player.y + 50);
                    // }

                    // if (player.powerup === 4) {
                    //   var draw = 'circle';
                    //   context.font = "10px Arial";
                    //   context.fillStyle = "#000";
                    //   context.fillText('Sphere', player.x, player.y + 50);
                    // }

                    // Circle (Original)
                    context.beginPath();
                    context.fillStyle = player.color;

                    if (draw === 'square') {
                        context.fillRect(player.x, player.y, playerSize, playerSize);
                    } else if (draw === 'circle') {
                        context.save();
                        // Move to the center of the canvas
                        context.translate(playerSize / 2, playerSize / 2);
                        context.arc(player.x, player.y, 25, 0, 2 * Math.PI);
                        context.fill();
                        context.restore();
                    }

                    // Left Eye
                    // context.beginPath();
                    // context.fillStyle = "#000";
                    // context.fillRect(player.x + 2.5, player.y + 2.5, 10, 10);
                    // context.fill();

                    // Right Eye
                    // context.beginPath();
                    // context.fillStyle = "#000";
                    // context.fillRect(player.x + playerSize - 12.5, player.y + 2.5, 10, 10);
                    // context.fill();

                    // Mouth
                    // context.beginPath();
                    // context.fillStyle = "#000";
                    // context.fillRect(player.x + 5, player.y + 20, playerSize - 10, playerSize / 4);
                    // context.fill();

                    // Tongue
                    // context.beginPath();
                    // context.fillStyle = "#FFC0CB";

                    // if (player.tongue == false) {
                    //     context.fillRect(player.x + 10, player.y + (playerSize / 4 + 15), playerSize - 20, playerSize / 6);
                    // } else {
                    //     context.fillRect(player.x + 10, player.y + (playerSize / 4 + 15), playerSize - 20, playerSize / 2);
                    // }

                    // context.fill();

                    // context.font = "10px Arial";
                    // context.fillStyle = "#000";
                    // context.textAlign = "center";
                    // var playerNickname = player.nickname;
                    // context.fillText(player.nickname, player.x + (playerSize / 2), player.y - 5);

                }
            })

            subscribeToNewPlayer();

            const movementEmit = setInterval(function () {
                socket.emit('movement', movement);
                // movement.score = false;
            }, (
                // 1000 / 60
                1000
            ));

            return () => clearInterval(movementEmit);

        }

    }, [socket]);

    return (
        <div className={`battle-trap-game-page ${isFullscreen && 'fullscreen'}`} id={'battle-trap-game-page'}>

            {showInfoModal &&
                <InfoModal
                    show={showInfoModal}
                    setShow={setShowInfoModal}
                />
            }

            {showSettingsModal &&
                <SettingsModal
                    show={showSettingsModal}
                    setShow={setShowSettingsModal}
                />
            }

            {showInviteModal &&
                <InviteModal
                    show={showInviteModal}
                    setShow={setShowInviteModal}
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

            <div className='menu-card'>

                {server == "single-player" &&
                    <div className="card card-articles card-sm mb-2">

                        <div className="card-body p-2">

                            <div className='mb-2'>
                                Single Player - {`Red's`} Turn
                            </div>

                            <div>

                                {players.map((player_obj, i) => <div
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
                                        onClick={() => {
                                            setCurrentTurn(i)
                                        }}
                                    >
                                        Turn
                                    </ArticlesButton>

                                </div>)}

                                <div>Red (You)</div>
                                <div>Blue (Bot)</div>
                                <div>Green (Bot)</div>
                                <div>Yellow (Bot)</div>

                                <div>{gameState?.status == 'In Lobby' && 'In Lobby - Waiting for players'}</div>
                                <div>{gameState?.status == 'In Progress' && 'In Progress - Your Turn'}</div>

                            </div>

                        </div>

                    </div>
                }

                {server == "local-play" &&
                    <div className="card card-articles card-sm mb-2">

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

                    <ArticlesButton
                        className="flex-grow-1"
                        disabled={
                            gameState.status !== "In Lobby"
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

                    </ArticlesButton>

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

                <div className='mb-2'>
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

                {/* Players */}
                <div className="card card-articles card-sm mb-2">

                    <div className="card-header flex-header">

                        <ArticlesButton
                            small
                            className="py-0"
                            active={showPlayers}
                            onClick={() => {
                                setShowPlayers(prev => !prev)
                            }}
                        >
                            <i className="fad fa-eye me-0"></i>
                        </ArticlesButton>

                        <span>Players</span>

                        <span className='badge bg-dark'>
                            <span>{players.length || 0}/4</span>
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
                                    <i className="fad fa-user text-center" style={{ width: '30px' }}></i>
                                    <h5 className='mb-0'>{player_obj?.battleTrap?.nickname || '?'}</h5>
                                </div>)}

                                {players.length < 4 &&
                                    <div className='d-flex justify-content-center flex-wrap'>

                                        <ArticlesButton
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
                                        </ArticlesButton>

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

                                    </div>
                                }

                            </div>
                        </div>

                        <div className="card-footer flex-header">

                        </div>
                    </>}

                </div>

                {/* Tile Moves */}
                <div className="card card-articles card-sm mb-2 mt-auto">

                    <div className="card-header flex-header">
                        <div>Tile Moves</div>
                        <span className='badge bg-dark'>
                            <span>8 Left</span>
                        </span>
                    </div>

                    <div className="card-body text-center">
                        <div className='h3 mb-0'>

                            {gameState.status == 'In Lobby' ?
                                <span>Awaiting game start</span>
                                :
                                <Countdown
                                    date={currentTurnCountdown}
                                />
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
                            </span>
                            <span className='badge bg-dark ms-2'>
                                <span>{currentRoll || 0} Left</span>
                            </span>
                        </div>

                    </div>

                    <div className="card-body text-center">

                        {(gameState.status == 'In Lobby' && !gameState?.turn) &&
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
                            onClick={() => {
                                rollDice()
                            }}
                        >
                            <i className="fad fa-play"></i>
                            <span>Roll</span>
                        </ArticlesButton>

                    </div>

                </div>

                <Accordion defaultActiveKey={0} className='mt-auto'>

                    <Accordion.Item eventKey={1} className="card card-articles card-sm mb-1 mt-auto">

                        <Accordion.Button as={Card.Header} variant="link">
                            <div className="d-flex justify-content-between">
                                <div>2D Map</div>
                            </div>
                        </Accordion.Button>

                        <Accordion.Collapse eventKey={1}>
                            <Card.Body className="p-0" style={{ fontSize: '0.9rem' }}>
                                <div className='ratio ratio-1x1 canvas-container bg-black'>
                                    <canvas
                                        id='static-canvas'
                                        className='static'
                                        width={600}
                                        height={600}
                                        ref={staticGameCanvasRef}
                                    />
                                    <canvas
                                        id='player-canvas'
                                        // className='players'
                                        width={600}
                                        height={600}
                                        ref={canvasGameRef}
                                    />
                                </div>
                            </Card.Body>
                        </Accordion.Collapse>

                    </Accordion.Item>

                </Accordion>

            </div>

            {/* Game Board */}
            <div className='game-content'>

                <div className='canvas-three-wrap'>
                    <GameCanvas
                        gameState={gameState}
                        server={server}
                        players={players}
                    />
                </div>

            </div>

        </div>
    )
}