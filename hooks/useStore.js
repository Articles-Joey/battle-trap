import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useStore = create()(
  persist(
    (set, get) => ({

      theme: null, // 'Light' | 'Dark' | null
      setTheme: (theme) => set({ theme }),

      // darkMode: true,
      // toggleDarkMode: () => set({ darkMode: !get().darkMode }),

      players: [],
      setPlayers: (players) => set({ players }),

      boardSize: 8,
      setBoardSize: (boardSize) => set({ boardSize }),

      currentTurn: 0,
      setCurrentTurn: (currentTurn) => set({ currentTurn }),

      defaultLocalGameState: {
        boardSize: 8,
        localPlayPlayerCount: 2,
        gameStarted: false,
        // currentTurn: 0,
        spaces: [
          {
            x: 0,
            y: 0,
            checked: {
              move: 1,
              socket_id: 'socket_id_1',
            }
          },
          {
            x: 2,
            y: 2,
            checked: {
              move: 1,
              socket_id: 'socket_id_1',
            }
          },
          {
            x: 3,
            y: 2,
            checked: {
              move: 2,
              socket_id: 'socket_id_1',
            }
          },
          {
            x: 4,
            y: 2,
            checked: {
              move: 3,
              socket_id: 'socket_id_1',
            }
          }
        ]
      },

      localGameState: false,
      setLocalGameState: (gameState) => set({ localGameState: gameState }),

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

      }

    }),
    {
      name: 'battle-trap-store', // name of the item in the storage (must be unique)
      // storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({
        theme: state.theme,
        // defaultLocalGameState: state.defaultLocalGameState,
      }),
    },
  ),
)