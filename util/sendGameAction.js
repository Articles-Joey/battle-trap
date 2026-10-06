import { useStore } from "@/hooks/useStore";

const pending = new WeakSet();

// Wait for the authoritative snapshot/ack before allowing another input.
export function sendGameAction(socket, event, data) {
    if (!socket?.connected || pending.has(socket)) return;
    pending.add(socket);
    socket.timeout(5000).emit(event, data, (error, result) => {
        pending.delete(socket);
        if (String(useStore.getState().gameState?.server_id) !== String(data.server ?? data.game_id)) return;
        useStore.setState({
            multiplayerError: error ? "The server did not respond. Please try again."
                : result?.ok ? null : result?.error || "That action could not be completed.",
        });
    });
}
