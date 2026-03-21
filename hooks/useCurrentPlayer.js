
import { useStore } from "@/hooks/useStore";
import { useMemo } from "react";

export default function useCurrentPlayer() {
    const players = useStore(state => state.players);
    const currentTurn = useStore(state => state.currentTurn);
    return useMemo(() => {
        return players[currentTurn]?.battleTrap;
    }, [players, currentTurn]);
}