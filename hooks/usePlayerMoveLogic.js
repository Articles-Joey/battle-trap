"use client"
import { useCallback } from 'react';
import { useSocketStore } from '@/hooks/useSocketStore';
import { useStore } from '@/hooks/useStore';

export default function usePlayerMoveLogic(server) {

    const socket = useSocketStore(state => state.socket);

    const boardSize = useStore(state => state.boardSize);

    // const localGameState      = useStore(state => state.localGameState);
    const addSpace = useStore(state => state.addSpace);
    const players = useStore(state => state.players);
    const currentTurn = useStore(state => state.currentTurn);
    const currentRoll = useStore(state => state.currentRoll);
    const incCurrentMoveCount = useStore(state => state.incCurrentMoveCount);

    return useCallback((newSpaceData) => {
        if (currentRoll === false) {
            alert("Roll dice before moving!");
            return;
        }

        const currentPlayerColor = players[currentTurn]?.battleTrap?.color;
        const currentPlay = players?.find(p => p.battleTrap.color === currentPlayerColor)?.battleTrap;

        if (Math.abs(newSpaceData.x) + Math.abs(newSpaceData.y) !== 1) {
            alert("Too far away! You can only move one space at a time.");
            return;
        }

        const localGameState = useStore.getState().localGameState;
        const flatSpaces = localGameState?.spaces?.flat() || [];
        const targetX = currentPlay?.x + newSpaceData.x;
        const targetY = currentPlay?.y + newSpaceData.y;

        if (targetX < 0 || targetX >= boardSize || targetY < 0 || targetY >= boardSize) {
            alert("You can't move off the map!");
            return;
        }

        const targetOccupied = flatSpaces.some(s => s.x == targetX && s.y == targetY && s.checked);
        if (targetOccupied) {
            alert("A wall is there! That space is already occupied.");
            return;
        }

        incCurrentMoveCount();

        if (server === 'single-player' || server === 'local-play') {
            addSpace({
                space: {
                    x: currentPlay?.x + newSpaceData.x,
                    y: currentPlay?.y + newSpaceData.y,
                    checked: {
                        move: (localGameState?.spaces?.length || 0) + 1,
                        color: currentPlayerColor,
                        socket_id: 'socket_id_1',
                        playerMove: localGameState?.spaces?.filter(space => space.checked?.color === currentPlayerColor).length
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
    }, [socket, addSpace, players, currentTurn, currentRoll, incCurrentMoveCount, server]);
}
