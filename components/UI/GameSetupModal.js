"use client";

import { useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, MenuItem, Stack, Switch, TextField, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useStore } from "@/hooks/useStore";
import { useSocketStore } from "@/hooks/useSocketStore";
import { makeLocalPlayers } from "@/util/localLobby";

export default function GameSetupModal({ show, setShow, preventClose = false }) {
    const socket = useSocketStore((state) => state.socket);
    const connected = useSocketStore((state) => state.connected);
    const room = useStore((state) => state.gameState);
    const roomPlayers = useStore((state) => state.players);
    const localGame = useStore((state) => state.localGameState);
    const multiplayer = show.type !== "single-player" && show.type !== "local-play";
    const [draft, setDraft] = useState(() => {
        const state = useStore.getState();
        const config = multiplayer ? state.gameState : state.localGameState || state.defaultLocalGameState;
        return {
            boardSize: multiplayer ? config.boardSize || 20 : state.boardSize,
            moveTime: config.moveTime ?? 20,
            players: multiplayer ? state.players.filter((p) => p.battleTrap.bot) : state.players,
        };
    });
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const humans = multiplayer ? roomPlayers.filter((p) => !p.battleTrap.bot) : [];
    const editable = multiplayer
        ? connected && room.leaderId === socket.id && room.status === "In Lobby"
        : localGame?.mode === show.type && !localGame.gameStarted && !localGame.gameOver;
    const botCount = draft.players.filter((p) => p.battleTrap.bot).length;
    const maximumBots = multiplayer ? Math.max(0, 4 - humans.length) : 3;
    const minimumBots = show.type === "single-player" ? 1 : 0;
    const valid = Number.isInteger(draft.boardSize) && draft.boardSize >= 4 && draft.boardSize <= 50
        && (draft.moveTime === false || (Number.isInteger(draft.moveTime) && draft.moveTime >= 3 && draft.moveTime <= 100))
        && botCount <= maximumBots;
    const close = () => { if (!preventClose && !saving) setShow(false); };
    const updatePlayer = (id, changes) => setDraft((value) => ({
        ...value, players: value.players.map((p) => p.id === id ? { ...p, battleTrap: { ...p.battleTrap, ...changes } } : p),
    }));
    const changeBotCount = (count) => setDraft((value) => ({
        ...value,
        players: multiplayer ? Array.from({ length: count }, (_, i) => value.players[i] || {
            id: `draft-bot-${i}`, battleTrap: { bot: true, nickname: `Bot ${i + 1}`, difficulty: "Medium" },
        }) : makeLocalPlayers(useStore.getState(), count, value.players),
    }));
    const save = () => {
        if (!editable || !valid || saving) return;
        if (multiplayer) {
            if (!socket.connected) return;
            setSaving(true);
            setError(null);
            socket.timeout(5000).emit("game:battle-trap:configure", {
                server: show.type,
                config: { boardSize: draft.boardSize, moveTime: draft.moveTime, bots: draft.players.map((p) => ({ nickname: p.battleTrap.nickname, difficulty: p.battleTrap.difficulty })) },
            }, (timeout, result) => {
                setSaving(false);
                if (timeout || !result?.ok) setError(timeout ? "The server did not respond. Please try again." : result?.error || "Unable to save configuration.");
                else setShow(false);
            });
            return;
        }
        useStore.getState().configureLocalLobby(show.type, draft);
        setShow(false);
    };

    return (
        <Dialog open={Boolean(show)} fullWidth maxWidth="sm" onClose={close} disableEscapeKeyDown={preventClose || saving}
            aria-labelledby="game-setup-title" slotProps={{ paper: { sx: { alignSelf: "flex-start", mt: 4 } } }}>
            <DialogTitle id="game-setup-title">
                Game Setup
                {!preventClose && <IconButton aria-label="Close game setup" onClick={close} disabled={saving} sx={{ position: "absolute", right: 8, top: 8 }}><CloseIcon /></IconButton>}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ pt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    {!editable && <Alert severity="info">{multiplayer ? "Only the connected room leader can edit setup while the room is in the lobby." : "Game Setup is available before the game starts."}</Alert>}
                    {botCount > maximumBots && <Alert severity="warning">Another player joined. Reduce the bot count to fit four players.</Alert>}
                    <Box component="fieldset" disabled={!editable || saving} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
                        <Stack spacing={3}>
                            <TextField label="Board size" type="number" value={draft.boardSize}
                                slotProps={{ htmlInput: { min: 4, max: 50 } }}
                                helperText="4–50 squares per side"
                                onChange={(event) => setDraft({ ...draft, boardSize: event.target.value === "" ? "" : Number(event.target.value) })} />
                            <Box>
                                <FormControlLabel label="Move timer" control={<Switch checked={draft.moveTime !== false} onChange={(_, checked) => setDraft({ ...draft, moveTime: checked ? 20 : false })} />} />
                                {draft.moveTime !== false && <TextField fullWidth label="Seconds per roll" type="number" value={draft.moveTime}
                                    slotProps={{ htmlInput: { min: 3, max: 100 } }}
                                    onChange={(event) => setDraft({ ...draft, moveTime: event.target.value === "" ? "" : Number(event.target.value) })} />}
                                <Typography variant="body2" sx={{ mt: 1 }}>The timer starts after rolling. Unused moves are forfeited when it expires.</Typography>
                            </Box>
                            <TextField select label="Bots" value={botCount} onChange={(event) => changeBotCount(Number(event.target.value))}>
                                {Array.from({ length: Math.max(maximumBots, botCount) - minimumBots + 1 }, (_, i) => i + minimumBots).map((count) => <MenuItem key={count} value={count} disabled={count > maximumBots}>{count}</MenuItem>)}
                            </TextField>
                            {multiplayer && <Box>
                                <Typography variant="subtitle2">Connected players</Typography>
                                {humans.map((p) => <Typography key={p.id}>{p.battleTrap.nickname}{p.id === room.leaderId ? " (Leader)" : ""}</Typography>)}
                            </Box>}
                            {draft.players.map((p) => <Stack key={p.id} spacing={1}>
                                <TextField label={p.battleTrap.bot ? "Bot nickname" : "Player nickname"} value={p.battleTrap.nickname} slotProps={{ htmlInput: { maxLength: 40 } }}
                                    onChange={(event) => updatePlayer(p.id, { nickname: event.target.value })} />
                                {p.battleTrap.bot && <TextField select label="Difficulty" value={p.battleTrap.difficulty}
                                    onChange={(event) => updatePlayer(p.id, { difficulty: event.target.value })}>
                                    {["Easy", "Medium", "Hard"].map((difficulty) => <MenuItem key={difficulty} value={difficulty}>{difficulty}</MenuItem>)}
                                </TextField>}
                            </Stack>)}
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions>
                {!preventClose && <Button onClick={close} disabled={saving}>Cancel</Button>}
                <Button variant="contained" onClick={save} disabled={!editable || !valid || saving}>
                    {saving ? "Saving…" : "Save Configuration"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
