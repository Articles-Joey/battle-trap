export function logActivity(games, landingSockets) {
    const occupiedGames = games.filter((game) => game.players.some(
        (player) => !player.battleTrap.bot && !player.battleTrap.disconnected,
    ));
    if (!landingSockets.size && !occupiedGames.length) return;

    console.log(`[Battle Trap] Landing lobby: ${landingSockets.size} users | Occupied game rooms: ${occupiedGames.length}`);
    if (landingSockets.size) {
        console.log('[Battle Trap] Lobby players:', [...landingSockets]);
    }
    for (const game of occupiedGames) {
        const players = game.players.filter((player) => !player.battleTrap.disconnected);
        const humans = players.filter((player) => !player.battleTrap.bot).length;
        const bots = players.length - humans;
        console.log(
            `[Battle Trap] Room ${game.server_id} | ${game.status} | ${humans} users, ${bots} bots | Board: ${game.boardSize}x${game.boardSize}`,
            players.map((player) => {
                const bike = player.battleTrap;
                return `${JSON.stringify(bike.nickname)} (${bike.bot ? 'bot' : player.id})${bike.dead ? ' [eliminated]' : ''}`;
            }),
        );
    }
}
