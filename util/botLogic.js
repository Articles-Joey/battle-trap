// Pure strategy shared by local play and the socket server. Keep the server copy
// in Battle Trap/botLogic.js identical when deploying either project.
const DIRECTIONS = [
    { x: 1, y: 0 }, { x: -1, y: 0 },
    { x: 0, y: 1 }, { x: 0, y: -1 },
];
const ATTACK_CHANCE = { Easy: 0.15, Medium: 0.35, Hard: 0.55 };

export function pickMode(difficulty) {
    return Math.random() < (ATTACK_CHANCE[difficulty] ?? ATTACK_CHANCE.Medium)
        ? "attack" : "smart";
}

function countReachable(startX, startY, boardSize, occupiedSet) {
    const visited = new Set();
    const queue = [[startX, startY]];
    for (let cursor = 0; cursor < queue.length; cursor++) {
        const [cx, cy] = queue[cursor];
        const key = `${cx},${cy}`;
        if (visited.has(key) || occupiedSet.has(key)) continue;
        if (cx < 0 || cy < 0 || cx >= boardSize || cy >= boardSize) continue;
        visited.add(key);
        for (const { x, y } of DIRECTIONS) queue.push([cx + x, cy + y]);
    }
    return visited.size;
}

function voronoi(boardSize, wallSet, botPos, opponents) {
    const owner = new Int8Array(boardSize * boardSize).fill(-1);
    const idx = (x, y) => y * boardSize + x;
    const botIndex = opponents.length;
    const counts = new Array(opponents.length + 1).fill(0);
    const frontiers = [...opponents, botPos].map((s, i) => {
        owner[idx(s.x, s.y)] = i;
        return [[s.x, s.y]];
    });
    let active = true;
    while (active) {
        active = false;
        for (let i = 0; i < frontiers.length; i++) {
            const next = [];
            for (const [cx, cy] of frontiers[i]) {
                for (const { x: dx, y: dy } of DIRECTIONS) {
                    const x = cx + dx, y = cy + dy;
                    if (x < 0 || y < 0 || x >= boardSize || y >= boardSize) continue;
                    if (wallSet.has(`${x},${y}`) || owner[idx(x, y)] !== -1) continue;
                    owner[idx(x, y)] = i;
                    counts[i]++;
                    next.push([x, y]);
                }
            }
            frontiers[i] = next;
            if (next.length) active = true;
        }
    }
    return { bot: counts[botIndex], opponents: counts.slice(0, botIndex) };
}

const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export function pickBestMove({
    botX, botY, boardSize, flatSpaces, players, botColor, mode, movesLeftAfter,
}) {
    const wallSet = new Set(flatSpaces.filter((s) => s.checked).map((s) => `${s.x},${s.y}`));
    const opponents = players.filter((p) =>
        p.battleTrap?.color !== botColor && !p.battleTrap?.dead && p.battleTrap?.x != null,
    ).map((p) => ({ color: p.battleTrap.color, x: p.battleTrap.x, y: p.battleTrap.y }));
    for (const o of opponents) wallSet.add(`${o.x},${o.y}`);
    wallSet.add(`${botX},${botY}`);
    const target = mode === "attack" && opponents.length
        ? opponents.reduce((a, b) => manhattan(a, { x: botX, y: botY }) <= manhattan(b, { x: botX, y: botY }) ? a : b)
        : null;
    let bestMove = null, bestScore = -Infinity;
    for (const dir of DIRECTIONS) {
        const nx = botX + dir.x, ny = botY + dir.y;
        if (nx < 0 || ny < 0 || nx >= boardSize || ny >= boardSize || wallSet.has(`${nx},${ny}`)) continue;
        const reachable = countReachable(nx, ny, boardSize, wallSet) - 1;
        const shortfall = Math.max(0, movesLeftAfter - reachable);
        const wallsWithNew = new Set(wallSet);
        wallsWithNew.add(`${nx},${ny}`);
        const split = voronoi(boardSize, wallsWithNew, { x: nx, y: ny }, opponents);
        let score;
        if (target) {
            const targetTerritory = split.opponents[opponents.indexOf(target)];
            const othersTerritory = split.opponents.reduce((a, b) => a + b, 0) - targetTerritory;
            score = split.bot - targetTerritory * 1.5 - othersTerritory * 0.25 - manhattan({ x: nx, y: ny }, target);
        } else {
            const totalOpp = split.opponents.reduce((a, b) => a + b, 0);
            const blockedNeighbours = DIRECTIONS.filter(({ x: dx, y: dy }) => {
                const x = nx + dx, y = ny + dy;
                return x < 0 || y < 0 || x >= boardSize || y >= boardSize || wallsWithNew.has(`${x},${y}`);
            }).length;
            score = split.bot - totalOpp * 0.5 + blockedNeighbours * 0.75;
        }
        score -= shortfall * 1000;
        score += Math.random() * 0.5;
        if (score > bestScore) { bestScore = score; bestMove = dir; }
    }
    return bestMove;
}
