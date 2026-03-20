"use client"
import { useCallback } from 'react';
import { useSocketStore } from '@/hooks/useSocketStore';
import { useStore } from '@/hooks/useStore';

export default function usePlayerMoveLogic(server) {
    const socket = useSocketStore(state => state.socket);

    const localGameState      = useStore(state => state.localGameState);
    const addSpace            = useStore(state => state.addSpace);
    const players             = useStore(state => state.players);
    const currentTurn         = useStore(state => state.currentTurn);
    const currentRoll         = useStore(state => state.currentRoll);
    const incCurrentMoveCount = useStore(state => state.incCurrentMoveCount);

    return useCallback((newSpaceData) => {
        if (currentRoll === false) {
            alert("Roll dice before moving!");
            return;
        }

        incCurrentMoveCount();

        const currentPlayerColor = players[currentTurn]?.battleTrap?.color;
        const currentPlay = players?.find(p => p.battleTrap.color === currentPlayerColor)?.battleTrap;

        if (server === 'single-player' || server === 'local-play') {
            addSpace({
                space: {
                    x: currentPlay?.x + newSpaceData.x,
                    y: currentPlay?.y + newSpaceData.y,
                    checked: {
                        move: (localGameState?.spaces?.length || 0) + 1,
                        color: currentPlayerColor,
                        socket_id: 'socket_id_1',
                    }
                },
                player_color: currentPlayerColor
            });
        } else {
            socket.emit('game:battle-trap-move', {
                game_id: server,
                x: currentPlay?.x + newSpaceData.x,
                y: currentPlay?.y + newSpaceData.y
            });
        }
    }, [socket, localGameState, addSpace, players, currentTurn, currentRoll, incCurrentMoveCount, server]);
}
