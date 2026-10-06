"use client";

import { useId } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HomeIcon from "@mui/icons-material/Home";
import ReplayIcon from "@mui/icons-material/Replay";
import { useStore } from "@/hooks/useStore";
import { useSocketStore } from "@/hooks/useSocketStore";
import { sendGameAction } from "@/util/sendGameAction";

export default function GameResultDialog({ server, onMainMenu }) {
    const titleId = useId();
    const descriptionId = useId();
    const local = server === "single-player" || server === "local-play";
    const gameState = useStore((state) => local ? state.localGameState : state.gameState);
    const socket = useSocketStore((state) => state.socket);
    const connected = useSocketStore((state) => state.connected);
    const players = useStore((state) => state.players);
    const returnToLocalLobby = useStore((state) => state.returnToLocalLobby);
    const winner = players.find((player) => player.id === gameState?.winnerId);
    const winnerName =
        winner?.battleTrap?.nickname || winner?.battleTrap?.color || "Player";

    return (
        <Dialog
            open={Boolean(gameState?.gameOver)}
            maxWidth="xs"
            fullWidth
            disableEscapeKeyDown
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            container={() =>
                document.getElementById(
                    `${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`,
                )
            }
        >
            <DialogTitle
                id={titleId}
                sx={{ textAlign: "center", overflowWrap: "anywhere" }}
            >
                {winner ? `${winnerName} wins!` : "Game over"}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ textAlign: "center", py: 2 }}>
                    {winner && (
                        <EmojiEventsIcon
                            sx={{ fontSize: 80, color: "#ffd54f", mb: 1 }}
                        />
                    )}
                    <Typography id={descriptionId}>
                        {winner
                            ? "Last player standing."
                            : "Everyone was trapped. No winner this round."}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions
                sx={{
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    px: 3,
                    pb: 3,
                    gap: 1,
                }}
            >
                <Button
                    variant="outlined"
                    startIcon={<HomeIcon />}
                    onClick={onMainMenu}
                >
                    Main Menu
                </Button>
                <Button
                    variant="contained"
                    startIcon={<ReplayIcon />}
                    disabled={!local && (!connected || gameState?.leaderId !== socket.id)}
                    onClick={() => local ? returnToLocalLobby() : sendGameAction(socket, "game:battle-trap:restart", { server })}
                >
                    Return to Lobby
                </Button>
            </DialogActions>
        </Dialog>
    );
}
