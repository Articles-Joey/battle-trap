"use client";

import { useAudioStore } from "@/hooks/useAudioStore";
import { useStore } from "@/hooks/useStore";
import { useEffect, useRef } from "react";

export default function AudioHandler() {

    const audioSettings = useAudioStore((state) => state?.audioSettings);

    const musicRef = useRef(null);
    const interactedRef = useRef(false);

    // Initialize audio once
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const music = new Audio(
            '/audio/mondamusic-retro-arcade-game-music-487316-compress.mp3'
        );
        music.loop = true;
        musicRef.current = music;

        const tryPlay = () => {
            if (!interactedRef.current && audioSettings?.enabled) {
                interactedRef.current = true;
                music.play().catch(e => console.error("Audio play failed:", e));
            }
        };

        const events = ['click', 'keydown', 'touchstart', 'pointerdown'];
        events.forEach((e) => document.addEventListener(e, tryPlay, { once: true }));

        return () => {
            events.forEach((e) => document.removeEventListener(e, tryPlay));
            music.pause();
        };
    }, []);

    // Handle volume and play/pause based on settings
    useEffect(() => {
        const music = musicRef.current;
        if (!music) return;

        music.volume = audioSettings?.enabled ? (audioSettings?.music_volume / 100) : 0;

        if (audioSettings?.enabled) {
            if (interactedRef.current || document.hasStorageAccess) { // Simple check for interaction
                music.play().catch(() => {
                    // Ignore error if it fails because of no interaction yet
                });
            }
        } else {
            music.pause();
        }
    }, [audioSettings]);

    return null;

}