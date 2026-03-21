"use client"
import { useCallback } from 'react';
import { useSocketStore } from '@/hooks/useSocketStore';
import { useStore } from '@/hooks/useStore';

export default function useRollDice(server) {

    const socket = useSocketStore(state => state.socket);
    const setCurrentRoll = useStore(state => state.setCurrentRoll);
    // const localGameState = useStore(state => state.localGameState);
    const setLocalGameState = useStore(state => state.setLocalGameState);

    return useCallback((min = 1, max = 10) => {

        const localGameState = useStore.getState().localGameState; // Get the latest localGameState

        if (server === 'single-player' || server === 'local-play') {
            const roll = Math.floor(Math.random() * (max - min + 1)) + min;
            setCurrentRoll(roll);

            setLocalGameState({
                ...localGameState,
                moveTimer: localGameState?.moveTime
            });
        }

        if (server !== 'single-player' && server !== 'local-play') {
            socket.emit('game:battle-trap:roll-dice', {
                server: server,
                settings: {}
            });
        }

    }, [socket, server, setCurrentRoll, localGameState, setLocalGameState]);
}