import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useStore = create()(
  persist(
    (set, get) => ({

      theme: null, // 'Light' | 'Dark' | null
      setTheme: (theme) => set({ theme }),

      darkMode: null,
      setDarkMode: (darkMode) => set({ darkMode }),

      characters: [
        {
          name: 'Low Poly Chopper',
          model: 'low_poly_chopper.glb',
          description: "Default bike.",
          supportedCustomizations: ['primaryColor']
        },
        // {
        //     name: 'Dirt Bike',
        //     description: "Win one game to unlock."
        // },
        {
          name: 'Low Poly Scooter',
          model: 'low_poly_scooter.glb',
          description: "Win two games to unlock.",
          supportedCustomizations: ['primaryColor']
        },
        {
          name: 'Low Poly Tricycle',
          model: 'low_poly_tricycle.glb',
          description: "Win three games to unlock.",
          supportedCustomizations: ['primaryColor']
        },
        {
          name: 'Low Poly Unicycle',
          model: 'low_poly_unicycle.glb',
          description: "Win four games to unlock.",
          supportedCustomizations: ['primaryColor']
        },
        {
          name: 'Toilet Tricycle',
          model: 'toilet_tricycle.glb',
          description: "Win five games to unlock.",
          supportedCustomizations: ['primaryColor']
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
        }
      },
      setCharacter: (character) => set({ character }),

      updateCamera: null,
      setUpdateCamera: (updateCamera) => set({ updateCamera }),

      threeDimensional: true, // 'Light' | 'Dark' | null
      setThreeDimensional: (threeDimensional) => set({ threeDimensional }),

      // darkMode: true,
      // toggleDarkMode: () => set({ darkMode: !get().darkMode }),

      randomNickname: () => {
        const adjectives = [
          'Quantum', 'Neon', 'Binary', 'Pixel', 'Nano', 'Cyber', 'Glitch', 'Viral', 'Crypto', 'Turbo', 'Robo', 'Virtual', 'Cloud', 'Circuit', 'Data', 'AI', 'Meta', 'Hyper', 'Logic', 'Vector'
        ];
        const nouns = [
          'Bot', 'Byte', 'Core', 'Node', 'Script', 'Stack', 'Array', 'Cache', 'Kernel', 'Matrix', 'Packet', 'Pixel', 'Proxy', 'Pulse', 'Synth', 'Terminal', 'Wire', 'Drive', 'Chip', 'Loop'
        ];
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const nickname = `${adjective}${noun}${Math.floor(Math.random() * 1000)}`;
        set({ nickname });
      },
      nickname: '',
      setNickname: (nickname) => set({ nickname }),

      showMenu: false,
      setShowMenu: (value) => set({ showMenu: value }),
      toggleShowMenu: () => set({ showMenu: !get().showMenu }),

      showInfoModal: false,
      setShowInfoModal: (value) => set({ showInfoModal: value }),
      toggleInfoModal: () => set({ showInfoModal: !get().showInfoModal }),

      loginInfoModal: false,
      setLoginInfoModal: (value) => set({ loginInfoModal: value }),
      toggleLoginInfoModal: () => set({ loginInfoModal: !get().loginInfoModal }),

      showSettingsModal: false,
      setShowSettingsModal: (value) => set({ showSettingsModal: value }),
      toggleSettingsModal: () => set({ showSettingsModal: !get().showSettingsModal }),

      showCreditsModal: false,
      setShowCreditsModal: (value) => set({ showCreditsModal: value }),
      toggleCreditsModal: () => set({ showCreditsModal: !get().showCreditsModal }),

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
      setCurrentMoveCount: (currentMoveCount) => set({ currentMoveCount }),
      incCurrentMoveCount: () => set({ currentMoveCount: get().currentMoveCount + 1 }),

      defaultLocalGameState: {
        boardSize: 8,
        moveTime: 20,
        moveTimer: null,
        localPlayPlayerCount: 2,
        gameStarted: false,
        // currentTurn: 0,
        // Note - Spaces gets initialized more when game starts in useEffect
        spaces: []
      },
      resetGameState: () => set({ 
        localGameState: get().defaultLocalGameState,
        currentTurn: 0,
        currentRoll: false,
        currentMoveCount: 0,
      }),

      localGameState: false,
      setLocalGameState: (gameState) => set({ localGameState: gameState }),

      gameState: {

      },
      setGameState: (gameState) => set({ gameState }),

      addSpace: (data) => {

        const { space, player_color } = data

        console.log("Confirm addSpace event", data)

        const players = get().players;

        console.log("Current players", players)

        const newPlayers = players.map(player => {

          if (player_color == player?.battleTrap?.color) {

            let newPlayer = {
              ...player,
              battleTrap: {
                ...player.battleTrap,
                x: space.x,
                y: space.y
              }
            }

            console.log("Confirm Set", newPlayer)

            return newPlayer;

          } else {
            return player;
          }

        });

        set({ players: newPlayers });

        const { localGameState } = get();
        const newSpaces = [...localGameState?.spaces, space];
        set({ localGameState: { ...localGameState, spaces: newSpaces } });

      },

      setPlayerDead: (player_color) => {
        const players = get().players;
        const newPlayers = players.map(player => {
          if (player?.battleTrap?.color === player_color) {
            return { ...player, battleTrap: { ...player.battleTrap, dead: true } };
          }
          return player;
        });
        set({ players: newPlayers });
      },

      lobbyDetails: {
        players: [],
        games: [],
      },
      setLobbyDetails: (lobbyDetails) => set({ lobbyDetails }),

      showEditBikeModal: false,
      setShowEditBikeModal: (value) => set({ showEditBikeModal: value }),
      toggleEditBikeModal: () => set({ showEditBikeModal: !get().showEditBikeModal }),

    }),
    {
      name: 'battle-trap-store', // name of the item in the storage (must be unique)
      // storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
      version: 2,
      partialize: (state) => ({
        theme: state.theme,
        nickname: state.nickname,
        character: state.character,
        darkMode: state.darkMode,
        threeDimensional: state.threeDimensional,
        // defaultLocalGameState: state.defaultLocalGameState,
      }),
    },
  ),
)