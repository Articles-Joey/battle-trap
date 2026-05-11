"use client"
import { useEffect } from "react";
import { useStore } from "@/hooks/useStore";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import usePlayerMoveLogic from "@/hooks/usePlayerMoveLogic";
import { useSocketStore } from "@/hooks/useSocketStore";
import { useHotkeys } from "react-hotkeys-hook";
import useCurrentPlayer from "@/hooks/useCurrentPlayer";
import useRollDice from "@/hooks/useRollDice";
import useBotTurnLogic from "@/hooks/useBotTurnLogic";

export default function GameLogicManager() {

    const {
        socket,
    } = useSocketStore(state => ({
        socket: state.socket,
    }));

    // const theme = useStore(state => state.theme);
    // const setTheme = useStore(state => state.setTheme);

    // const threeDimensional = useStore(state => state.threeDimensional);
    // const setThreeDimensional = useStore(state => state.setThreeDimensional);

    const nickname = useStore(state => state.nickname);
    const character = useStore(state => state.character);

    const localGameState = useStore(state => state.localGameState);
    const setLocalGameState = useStore(state => state.setLocalGameState);
    const addSpace = useStore(state => state.addSpace);

    const resetGameState = useStore(state => state.resetGameState);

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
    const setPlayerDead = useStore(state => state.setPlayerDead);

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const searchParamsObject = Object.fromEntries(searchParams.entries());
    // const params = useParams()
    const server = searchParamsObject?.server

    const handlePlayerMove = usePlayerMoveLogic(server);

    const currentPlayer = useCurrentPlayer()

    const rollDice = useRollDice(server);
    const calculateBotTurnLogic = useBotTurnLogic(server);

    useEffect(() => {

        console.log("localGameState", localGameState)

        if (!localGameState) {
            console.log("Set state to default")
            resetGameState()
        }

    }, [localGameState])

    // Bot turn logic
    useEffect(() => {

        if (!currentPlayer?.bot || currentPlayer?.dead) return;

        console.log("Bot turn logic triggered")

        // Delay roll slightly longer so the player can see the turn change.
        // Delay each subsequent move so it feels natural.
        const delay = currentRoll === false ? 600 : 800;

        const timeout = setTimeout(() => {
            calculateBotTurnLogic();
        }, delay);

        return () => clearTimeout(timeout);

    }, [currentTurn, currentRoll, currentMoveCount, calculateBotTurnLogic]);

    // Note - Timer logic
    useEffect(() => {

        let interval;

        if (
            // localGameState?.gameStarted 
            // && 
            localGameState?.moveTime !== false
            &&
            currentRoll !== false
        ) {

            // Initialize timer if null
            if (localGameState?.moveTimer === null) {
                setLocalGameState({
                    ...localGameState,
                    moveTimer: 0
                });
            }

            interval = setInterval(() => {

                const currentState = useStore.getState().localGameState;
                const newTimer = (currentState.moveTimer || 0) - 1;

                if (newTimer <= 0) {

                    console.log("Timer reset! Forcing turn over changing to", currentState?.moveTime);

                    // Search "Next turn logic" for more details, next turn logic is handled there based on currentMoveCount and currentRoll

                    setCurrentMoveCount(0)

                    setCurrentRoll(false)

                    setLocalGameState({
                        ...currentState,
                        moveTimer: currentState?.moveTime
                    });

                } else {
                    setLocalGameState({
                        ...currentState,
                        moveTimer: newTimer
                    });
                }

            }, 1000);

        }

        return () => clearInterval(interval);

    }, [
        // localGameState?.gameStarted, 
        localGameState?.moveTime,
        currentRoll,
    ]);

    // Note - Trapped player detection
    useEffect(() => {

        if (!localGameState?.spaces || localGameState?.spaces?.length <= 4) return;

        const flatSpaces = localGameState.spaces;
        const boardSize = localGameState?.boardSize ?? 20;
        const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 },
        ];

        players.forEach(player => {
            if (player?.battleTrap?.dead) return;
            const { x, y, color } = player.battleTrap;
            if (x == null || y == null) return;

            const trapped = directions.every(({ dx, dy }) => {
                const nx = x + dx;
                const ny = y + dy;
                if (nx < 0 || ny < 0 || nx >= boardSize || ny >= boardSize) return true;
                return flatSpaces.some(s => s.x == nx && s.y == ny && s.checked);
            });

            if (trapped) {
                console.log(`Player ${color} is trapped and eliminated!`);
                setPlayerDead(color);
            }
        });

    }, [localGameState?.spaces]);

    // Note - Next turn logic
    useEffect(() => {

        console.log("currentMoveCount changed", currentMoveCount, currentRoll)

        if (
            currentRoll == currentMoveCount
            &&
            currentMoveCount !== false
            &&
            currentRoll !== false
        ) {
            console.log("player is done with turn", currentMoveCount)
            // Player is done with their turn

            const totalPlayers = players?.length || 4;
            let nextTurn = currentTurn;
            for (let i = 1; i <= totalPlayers; i++) {
                const candidate = (currentTurn + i) % totalPlayers;
                if (!players[candidate]?.battleTrap?.dead) {
                    nextTurn = candidate;
                    break;
                }
            }

            console.log("Next player's turn", nextTurn)
            setCurrentTurn(nextTurn)

            setCurrentRoll(false)
            setCurrentMoveCount(0)
        }

    }, [currentMoveCount, currentRoll, players]);

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
            // setPlayers([
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
            // ])
        }

        return () => {
            socket.off(`game:battle-trap-room-${server}`);
        };

    }, [server])

    // const [character, setCharacter] = useLocalStorageNew("game:battle-trap:character", {})

    useEffect(() => {

        if (
            !server
            ||
            server == 'single-player'
            ||
            server == 'local-play'
        ) return

        if (socket.connected) {
            socket.emit('join-room', `game:battle-trap-room-${server}`, {
                client_version: '1',
                game_id: server,
                character: character,
                nickname: nickname,
                // nickname: JSON.parse(localStorage.getItem('game:nickname'))
            });
        }

        return function cleanup() {
            socket.emit('leave-room', `game:battle-trap-room-${server}`, {
                client_version: '1',
                game_id: server
            })
        };

    }, [server]);

    useHotkeys(['w', 'ArrowUp'], () => {

        console.log("Back?")
        handlePlayerMove({
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

    }, [localGameState, players, currentRoll, currentTurn]);

    useHotkeys(['s', 'ArrowDown'], () => {

        console.log("Back?")
        handlePlayerMove({
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
    }, [localGameState, players, currentRoll, currentTurn]);

    useHotkeys(['a', 'ArrowLeft'], () => {

        console.log("Left?")
        handlePlayerMove({
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
    }, [localGameState, players, currentRoll, currentTurn]);

    useHotkeys(['d', 'ArrowRight'], () => {

        console.log("Right?")
        handlePlayerMove({
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
    }, [localGameState, players, currentRoll, currentTurn]);

    useHotkeys(['space'], () => {

        if (server == 'single-player' || server == 'local-play') {
            console.log("Roll!")
            rollDice()
        }

        if (server !== 'single-player' && server !== 'local-play') {
            console.log("Emit roll dice!")
            socket.emit('game:battle-trap:roll-dice', {
                server: server,
                settings: {}
            });
        }

    }, [server]);

    return (
        <></>
    )

}