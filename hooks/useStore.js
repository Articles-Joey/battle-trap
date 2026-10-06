import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import typicalZustandStoreExcludes from "@articles-media/articles-dev-box/typicalZustandStoreExcludes";
import typicalZustandStoreStateSlice from "@articles-media/articles-dev-box/typicalZustandStoreStateSlice";

import randomNicknameConfig from "@/util/randomNicknameConfig";
import { createLocalLobby } from "@/util/localLobby";
import {
    createLocalGame,
    recordLocalMove,
    resolveLocalTurn,
} from "@/util/gameBoard";

export const useStore = create()(
    persist(
        (set, get) => ({
            ...typicalZustandStoreStateSlice(set, get, randomNicknameConfig),

            characters: [
                {
                    name: "Low Poly Chopper",
                    model: "low_poly_chopper.glb",
                    description: "Default bike.",
                    supportedCustomizations: ["primaryColor"],
                },
                // {
                //     name: 'Dirt Bike',
                //     description: "Win one game to unlock."
                // },
                {
                    name: "Low Poly Scooter",
                    model: "low_poly_scooter.glb",
                    description: "Win two games to unlock.",
                    supportedCustomizations: ["primaryColor"],
                },
                {
                    name: "Low Poly Tricycle",
                    model: "low_poly_tricycle.glb",
                    description: "Win three games to unlock.",
                    supportedCustomizations: ["primaryColor"],
                },
                {
                    name: "Low Poly Unicycle",
                    model: "low_poly_unicycle.glb",
                    description: "Win four games to unlock.",
                    supportedCustomizations: ["primaryColor"],
                },
                {
                    name: "Toilet Tricycle",
                    model: "toilet_tricycle.glb",
                    description: "Win five games to unlock.",
                    supportedCustomizations: ["primaryColor"],
                },
                // {
                //     name: 'Light Bike',
                //     description: "Win three games to unlock."
                // }
            ],
            character: {
                model: "low_poly_chopper.glb",
                customizations: {
                    primaryColor: "#000000",
                },
            },
            setCharacter: (character) => set({ character }),

            updateCamera: null,
            setUpdateCamera: (updateCamera) => set({ updateCamera }),

            threeDimensional: true, // 'Light' | 'Dark' | null
            setThreeDimensional: (threeDimensional) =>
                set({ threeDimensional }),

            players: [],
            setPlayers: (players) => set({ players }),

            boardSize: 20,
            setBoardSize: (boardSize) => set({ boardSize }),

            // Player index of who's turn it is
            currentTurn: 0,
            setCurrentTurn: (currentTurn) => set({ currentTurn }),

            // Dice roll value for the current turn
            // Note: false and 0 are different states, false means no roll yet, 0 means rolled a 0
            // Make sure to strict check (===) against false
            currentRoll: false,
            setCurrentRoll: (currentRoll) => set({ currentRoll }),

            // Total move count for the current turn
            currentMoveCount: 0,
            setCurrentMoveCount: (currentMoveCount) =>
                set({ currentMoveCount }),
            incCurrentMoveCount: () =>
                set({ currentMoveCount: get().currentMoveCount + 1 }),

            defaultLocalGameState: {
                boardSize: 8,
                moveTime: 20,
                moveTimer: null,
                localPlayPlayerCount: 2,
                gameStarted: false,
                gameOver: false,
                winnerId: null,
                move: 0,
                // currentTurn: 0,
                // Note - Spaces gets initialized more when game starts in useEffect
                spaces: [],
            },
            resetGameState: () =>
                set({
                    localGameState: get().defaultLocalGameState,
                    currentTurn: 0,
                    currentRoll: false,
                    currentMoveCount: 0,
                }),
            enterLocalLobby: (mode) => set((state) => createLocalLobby(state, mode)),
            configureLocalLobby: (mode, config) => set((state) =>
                state.localGameState?.gameStarted || state.localGameState?.gameOver
                    ? state : createLocalLobby(state, mode, config)),
            returnToLocalLobby: () => set((state) => createLocalLobby(
                state, state.localGameState.mode,
                { players: state.players, boardSize: state.localGameState.boardSize },
            )),
            startLocalGame: () => set((state) =>
                state.localGameState?.gameStarted || state.localGameState?.gameOver || state.players.length < 2
                    ? state : createLocalGame(state)),
            restartLocalGame: () => set((state) => createLocalGame(state)),
            leaveLocalGame: () => set((state) => createLocalGame(state, [])),

            localGameState: false,
            setLocalGameState: (gameState) =>
                set({ localGameState: gameState }),

            gameState: {},
            multiplayerError: null,
            setGameState: (gameState) => set({ gameState }),

            addSpace: (data) => {
                const { space, player_color } = data;
                set((state) => state.localGameState?.gameStarted
                    ? recordLocalMove(state, space, player_color) : state);
            },

            resolveLocalGame: () =>
                set((state) => {
                    if (!state.localGameState?.gameStarted) return state;
                    const updates = resolveLocalTurn(state);
                    return Object.keys(updates).length ? updates : state;
                }),
            endLocalTurn: () =>
                set((state) => {
                    if (!state.localGameState?.gameStarted) return state;
                    const updates = resolveLocalTurn(state, true);
                    return Object.keys(updates).length ? updates : state;
                }),

            setPlayerDead: (player_color) => {
                const players = get().players;
                const newPlayers = players.map((player) => {
                    if (player?.battleTrap?.color === player_color) {
                        return {
                            ...player,
                            battleTrap: { ...player.battleTrap, dead: true },
                        };
                    }
                    return player;
                });
                set((state) => ({
                    players: newPlayers,
                    ...resolveLocalTurn({ ...state, players: newPlayers }),
                }));
            },

            lobbyDetails: {
                players: [],
                games: [],
            },
            setLobbyDetails: (lobbyDetails) => set({ lobbyDetails }),

            showEditBikeModal: false,
            setShowEditBikeModal: (value) => set({ showEditBikeModal: value }),
            toggleEditBikeModal: () =>
                set({ showEditBikeModal: !get().showEditBikeModal }),
        }),
        {
            name: `${process.env.NEXT_PUBLIC_GAME_KEY}-storage`,
            version: 2,
            onRehydrateStorage: (state) => {
                return () => state.setHasHydrated(true);
            },
            partialize: (state) =>
                Object.fromEntries(
                    Object.entries(state).filter(
                        ([key]) =>
                            ![...typicalZustandStoreExcludes, "gameState", "multiplayerError"].includes(key),
                    ),
                ),
        },
    ),
);
