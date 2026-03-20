import { useEffect } from "react";
import { useStore } from "@/hooks/useStore";

export default function TimerManager() {

    const localGameState = useStore(state => state.localGameState);
    const setLocalGameState = useStore(state => state.setLocalGameState);

    const setCurrentMoveCount = useStore(state => state.setCurrentMoveCount);
    const currentMoveCount = useStore(state => state.currentMoveCount);
    const currentRoll = useStore(state => state.currentRoll);
    const setCurrentRoll = useStore(state => state.setCurrentRoll);

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

                    // Not setting next turn here, just setting moves to be moveCount and letting logic elsewhere determine next

                    // Note index - next turn logic
                    // Search this to find logic

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

    return (
        <></>
    )

}