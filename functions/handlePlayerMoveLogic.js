"use client"
// import { useState, useEffect, useRef, useMemo } from 'react';

// import Link from 'next/link'
// import Image from 'next/image';
// import dynamic from 'next/dynamic'
// import { useSearchParams, useRouter, usePathname, useParams } from 'next/navigation';

// import BasicLoading from '@/components/loading/BasicLoading';
// import Countdown from 'react-countdown';
// import { add } from 'date-fns';
// import { Accordion, Card, Dropdown, DropdownButton } from 'react-bootstrap';
// import ArticlesButton from '@/components/UI/Button';
// import useFullscreen from '@/hooks/useFullScreen';
// import { useHotkeys } from 'react-hotkeys-hook';
// import IsDev from '@/components/UI/IsDev';
import { useSocketStore } from '@/hooks/useSocketStore';
import { useStore } from '@/hooks/useStore';
// import TwoDimensionalMap from '@/components/Game/TwoDimensionalMap';

export default function handlePlayerMoveLogic(newSpaceData) {

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

    const currentRoll = useStore(state => state.currentRoll);
    const setCurrentRoll = useStore(state => state.setCurrentRoll);

    const currentMoveCount = useStore(state => state.currentMoveCount);
    const setCurrentMoveCount = useStore(state => state.setCurrentMoveCount)
    const incCurrentMoveCount = useStore(state => state.incCurrentMoveCount);

    console.log("currentRoll", currentRoll)

    if (currentRoll === false) {
        alert("Roll dice before moving!")
        return
    }

    incCurrentMoveCount()

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