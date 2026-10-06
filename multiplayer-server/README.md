# Battle Trap socket handler

These files replace the handler in `articles-express/socketHandlers/games/Battle Trap`.
The entry point remains `index.js`, with the existing `(io, socket, app)` signature.
No changes outside that server folder are needed. Deploy all seven JavaScript files together,
then restart the socket server and deploy the matching client.

- `index.js`: Socket.IO registration, membership and authorization.
- `roomState.js`: lobby configuration, public player data and leadership.
- `runtime.js`: independent rooms, snapshots, landing updates and timer lifecycle.
- `logActivity.js`: a console summary every 10 seconds while humans are in the
  landing lobby or game rooms, including lobby socket IDs, room status and rosters.
- `gameEngine.js`: authoritative rolls, validated moves, timers and paced bot turns.
- `gameBoard.js`: identical copy of the client's `util/gameBoard.js`.
- `botLogic.js`: identical copy of the client's `util/botLogic.js`.

The pure game rules and strategy are copied because these are separate deployable
projects. Keep both copies in sync when changing rules. Server imports stay within
Battle Trap except the existing `#root/util/emitRoomsList.js` integration.

The first socket to join is leader. Only the leader can edit configuration, start,
or reopen a finished match. Leadership passes to the next connected human on leave.
Rooms default to a 20×20 board, a 20-second timer after rolling, and no bots.
Humans and bots share four slots. Dice use the same 1–10 roll as local play.
New players cannot join a running/finished match; the leader can reopen it after
the result. Disconnecting forfeits the player's match slot and preserves their
trail. Reconnecting rejoins a lobby if available; it does not reclaim a live match.
Rooms with no connected humans are removed, including rooms with bots remaining.

Room state is in memory in the current Node process, matching the previous host
architecture. A multi-process deployment would need a shared authoritative room
owner/state layer; a Socket.IO adapter alone does not share these game objects.

## Manual checks (not executed by Codex)

1. Join a room in two browsers. The first gets Game Setup; the second waits.
2. Confirm there is no automatic setup modal and the board defaults to 20.
3. Change board size/timer and add bots with different names/difficulties. Save
   and check both browsers receive the same board and roster.
4. Start as leader. Only the current human can roll/move. Rolls, trails, move
   counts and timer expiry must agree across browsers. Bots should roll and move
   on the server even if a browser tab is backgrounded.
5. Attempt occupied, diagonal, off-board, extra and out-of-turn moves. The server
   rejects them without changing position or consuming a move.
6. Open a second room and check it progresses independently. Close one room and
   confirm the other keeps running.
7. Leave as leader in a lobby and during a match. Check leadership transfer,
   elimination/turn handoff, results and Return to Lobby.
8. Try a fifth player and joining a started room. Check the displayed error.
9. Reconnect in a lobby. Check there are no duplicate players or event handlers.
10. Play single-player and local-play, including timer-off, bots and restarting.

No scripts, builds, lint commands or tests were run for this change.
