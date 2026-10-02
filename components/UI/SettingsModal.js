"use client";

import { useState } from "react";
import {
    Box,
    Divider,
    FormControlLabel,
    Slider,
    Switch,
    Typography,
} from "@mui/material";
import ArticlesButton from "@/components/UI/Button";
import ArticlesModal from "@/components/UI/ArticlesModal";

export default function BattleTrapSettingsModal({ show, setShow }) {
    const [tab, setTab] = useState("Controls");

    return (
        <ArticlesModal
            show={show}
            setShow={setShow}
            title="Game Settings"
            size="sm"
            centered={false}
            contentSx={{ p: 0 }}
            footerOverride={(closeModal) => (
                <Box sx={{ display: "flex", gap: "1rem" }}>
                    <ArticlesButton
                        variant="outline-dark"
                        onClick={() => closeModal(false)}
                    >
                        Close
                    </ArticlesButton>
                    <ArticlesButton
                        variant="outline-danger"
                        onClick={() => closeModal(false)}
                    >
                        Reset
                    </ArticlesButton>
                </Box>
            )}
        >
            <Box sx={{ p: "0.5rem" }}>
                {["Controls", "Audio", "Chat"].map((item) => (
                    <ArticlesButton
                        key={item}
                        active={tab === item}
                        onClick={() => setTab(item)}
                    >
                        {item}
                    </ArticlesButton>
                ))}
            </Box>
            <Divider />
            <Box sx={{ p: "0.5rem" }}>
                {tab === "Controls" && (
                    <>
                        {[
                            { action: "Move Up", defaultKeyboardKey: "W" },
                            { action: "Move Down", defaultKeyboardKey: "S" },
                            { action: "Move Left", defaultKeyboardKey: "A" },
                            { action: "Move Right", defaultKeyboardKey: "D" },
                        ].map(({ action, defaultKeyboardKey }) => (
                            <Box
                                key={action}
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    borderBottom: 1,
                                    borderColor: "divider",
                                    pb: "0.25rem",
                                    mb: "0.25rem",
                                }}
                            >
                                <Box>{action}</Box>
                                <Box>
                                    <Box
                                        component="span"
                                        sx={{
                                            display: "inline-block",
                                            bgcolor: "#000",
                                            color: "#fff",
                                            mr: "0.25rem",
                                            px: "0.65em",
                                            py: "0.35em",
                                            borderRadius: "0.375rem",
                                            fontSize: "0.75em",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {defaultKeyboardKey}
                                    </Box>
                                    <ArticlesButton small>
                                        Change Key
                                    </ArticlesButton>
                                </Box>
                            </Box>
                        ))}
                        <Box sx={{ p: "0.5rem" }}>
                            * You can also click or tap the tile you want to
                            move to.
                        </Box>
                    </>
                )}
                {tab === "Audio" && (
                    <>
                        <Typography id="game-volume-label">
                            Game Volume
                        </Typography>
                        <Slider
                            aria-labelledby="game-volume-label"
                            defaultValue={50}
                        />
                        <Typography id="music-volume-label">
                            Music Volume
                        </Typography>
                        <Slider
                            aria-labelledby="music-volume-label"
                            defaultValue={50}
                        />
                    </>
                )}
                {tab === "Chat" && (
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <FormControlLabel
                            control={<Switch />}
                            label="Game chat panel"
                        />
                        <FormControlLabel
                            control={<Switch />}
                            label="Censor chat"
                        />
                        <FormControlLabel
                            control={<Switch />}
                            label="Game chat speech bubbles"
                        />
                    </Box>
                )}
            </Box>
        </ArticlesModal>
    );
}
