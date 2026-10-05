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

export default function GameResultDialog({ server, onMainMenu }) {
    const titleId = useId();
    const descriptionId = useId();
    const gameState = useStore((state) => state.localGameState);
    const players = useStore((state) => state.players);
    const restartLocalGame = useStore((state) => state.restartLocalGame);
    const local = server === "single-player" || server === "local-play";
    const winner = players.find((player) => player.id === gameState?.winnerId);
    const winnerName =
        winner?.battleTrap?.nickname || winner?.battleTrap?.color || "Player";

    return (
        <Dialog
            open={local && Boolean(gameState?.gameOver)}
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
                    onClick={restartLocalGame}
                >
                    Restart
                </Button>
            </DialogActions>
        </Dialog>
    );
}
