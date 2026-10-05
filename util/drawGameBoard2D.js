import {
    areTrailNeighbors,
    getAvailableMoves,
    getPreviousTrailSpace,
} from "./gameBoard.js";

export function getBoardLayout(width, height, boardSize) {
    const size = Math.max(0, Math.min(width, height) - 24);
    return {
        size,
        cellSize: size / boardSize,
        left: (width - size) / 2,
        top: (height - size) / 2,
    };
}

export function pointToBoardCell(px, py, layout, boardSize) {
    if (
        !layout.cellSize ||
        px < layout.left ||
        py < layout.top ||
        px >= layout.left + layout.size ||
        py >= layout.top + layout.size
    )
        return null;

    return {
        x: Math.floor((px - layout.left) / layout.cellSize),
        // Increasing game Y points up, just as in the 3D board and keyboard controls.
        y: boardSize - 1 - Math.floor((py - layout.top) / layout.cellSize),
    };
}

export function drawGameBoard2D(
    context,
    {
        width,
        height,
        boardSize,
        flatSpaces,
        players,
        activePlayer,
        currentRoll,
        currentMoveCount = 0,
        hoveredCell,
    },
) {
    context.clearRect(0, 0, width, height);
    const { size, cellSize, left, top } = getBoardLayout(
        width,
        height,
        boardSize,
    );
    if (!size || !boardSize) return;

    const center = ({ x, y }) => [
        left + (x + 0.5) * cellSize,
        top + (boardSize - y - 0.5) * cellSize,
    ];
    const spaceMap = new Map(flatSpaces.map((s) => [`${s.x},${s.y}`, s]));
    const available = getAvailableMoves(boardSize, flatSpaces, activePlayer);

    context.fillStyle = "#000000";
    context.fillRect(left, top, size, size);
    for (const space of flatSpaces) {
        if (!space.checked) continue;
        const [x, y] = center(space);
        context.fillStyle = "#333333";
        context.fillRect(
            x - cellSize / 2,
            y - cellSize / 2,
            cellSize,
            cellSize,
        );
    }
    for (const space of available) {
        const [x, y] = center(space);
        context.fillStyle = "#002200";
        context.fillRect(
            x - cellSize / 2,
            y - cellSize / 2,
            cellSize,
            cellSize,
        );
    }
    if (hoveredCell) {
        const [x, y] = center(hoveredCell);
        context.fillStyle = "#593000";
        context.fillRect(
            x - cellSize / 2,
            y - cellSize / 2,
            cellSize,
            cellSize,
        );
    }

    context.beginPath();
    context.strokeStyle = "#00b8c4";
    context.lineWidth = 0.7;
    for (let i = 0; i <= boardSize; i++) {
        context.moveTo(left + i * cellSize, top);
        context.lineTo(left + i * cellSize, top + size);
        context.moveTo(left, top + i * cellSize);
        context.lineTo(left + size, top + i * cellSize);
    }
    context.stroke();
    for (const space of available) {
        const [x, y] = center(space);
        context.strokeStyle = "#00ff00";
        context.lineWidth = 1.5;
        context.strokeRect(
            x - cellSize / 2 + 1,
            y - cellSize / 2 + 1,
            cellSize - 2,
            cellSize - 2,
        );
    }

    context.lineCap = "round";
    context.lineWidth = Math.max(2, cellSize * 0.16);
    for (const space of flatSpaces) {
        if (!space.checked) continue;
        const [x, y] = center(space);
        const color =
            space.checked.color ||
            players.find((p) => p.id === space.checked.socket_id)?.battleTrap
                ?.color ||
            "red";
        context.strokeStyle = color;
        context.fillStyle = color;
        // Each edge is drawn once; turns and starting points use the same rule as 3D.
        for (const neighbor of [
            spaceMap.get(`${space.x + 1},${space.y}`),
            spaceMap.get(`${space.x},${space.y + 1}`),
        ]) {
            if (!areTrailNeighbors(space, neighbor)) continue;
            const [nx, ny] = center(neighbor);
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(nx, ny);
            context.stroke();
        }
        context.beginPath();
        context.arc(x, y, Math.max(1.5, cellSize * 0.08), 0, Math.PI * 2);
        context.fill();
    }

    for (const space of available) {
        const [x, y] = center(space);
        context.save();
        context.translate(x, y);
        context.fillStyle = "#baffba";
        context.strokeStyle = "#baffba";
        if (currentRoll === false) {
            const diceSize = cellSize * 0.45;
            context.lineWidth = 1;
            context.strokeRect(
                -diceSize / 2,
                -diceSize / 2,
                diceSize,
                diceSize,
            );
            context.font = `bold ${Math.max(8, cellSize * 0.35)}px sans-serif`;
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText("?", 0, 0);
        } else {
            context.rotate(
                Math.atan2(space.x - activePlayer.x, space.y - activePlayer.y),
            );
            context.beginPath();
            context.moveTo(0, -cellSize * 0.25);
            context.lineTo(cellSize * 0.18, cellSize * 0.12);
            context.lineTo(-cellSize * 0.18, cellSize * 0.12);
            context.closePath();
            context.fill();
        }
        context.restore();
    }

    for (const { battleTrap: player } of players) {
        if (player?.x == null || player?.y == null) continue;
        const [x, y] = center(player);
        const previous = getPreviousTrailSpace(flatSpaces, player);
        const radius = cellSize * 0.3;
        context.save();
        context.translate(x, y);
        context.fillStyle = player.dead ? "#ff3333" : player.color || "red";
        context.globalAlpha = 0.35;
        context.fillRect(
            -cellSize / 2 + 1,
            -cellSize / 2 + 1,
            cellSize - 2,
            cellSize - 2,
        );
        context.globalAlpha = 1;
        context.strokeStyle =
            activePlayer?.color === player.color ? "#ffffff" : "#cccccc";
        context.lineWidth = activePlayer?.color === player.color ? 2 : 1;
        context.beginPath();
        context.arc(0, 0, radius, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        if (player.dead) {
            context.beginPath();
            context.moveTo(-radius / 2, -radius / 2);
            context.lineTo(radius / 2, radius / 2);
            context.moveTo(radius / 2, -radius / 2);
            context.lineTo(-radius / 2, radius / 2);
            context.stroke();
        } else {
            context.rotate(
                previous
                    ? Math.atan2(player.x - previous.x, player.y - previous.y)
                    : 0,
            );
            context.fillStyle = "#ffffff";
            context.beginPath();
            context.moveTo(0, -radius * 0.65);
            context.lineTo(radius * 0.45, radius * 0.4);
            context.lineTo(-radius * 0.45, radius * 0.4);
            context.closePath();
            context.fill();
        }
        context.restore();

        const fontSize = Math.max(9, Math.min(14, cellSize * 0.4));
        context.font = `bold ${fontSize}px sans-serif`;
        context.textBaseline = "middle";
        context.textAlign = "center";
        const label = player.nickname || player.color || "Player";
        const turnProgress =
            activePlayer?.color === player.color && !player.dead
                ? currentRoll === false
                    ? "Roll dice"
                    : `Moves: ${currentMoveCount} / ${currentRoll}`
                : null;
        const progressMaxWidth = Math.max(84, cellSize * 3);
        const nicknameWidth = Math.min(
            context.measureText(label).width,
            cellSize * 3,
        );
        const progressWidth = turnProgress
            ? Math.min(
                  context.measureText(turnProgress).width,
                  progressMaxWidth,
              )
            : 0;
        const labelWidth = Math.max(nicknameWidth, progressWidth) + 6;
        const labelX = Math.max(
            left + labelWidth / 2,
            Math.min(left + size - labelWidth / 2, x),
        );
        const progressOffset = turnProgress ? fontSize + 4 : 0;
        const aboveY = y - radius - fontSize;
        const labelY =
            aboveY - progressOffset - fontSize / 2 - 2 < top
                ? y + radius + fontSize + progressOffset
                : aboveY;
        context.fillStyle = "#000000";
        context.fillRect(
            labelX - labelWidth / 2,
            labelY - fontSize / 2 - 2 - progressOffset,
            labelWidth,
            fontSize + 4 + progressOffset,
        );
        if (turnProgress) {
            context.fillStyle = "#baffba";
            context.fillText(
                turnProgress,
                labelX,
                labelY - progressOffset,
                progressMaxWidth,
            );
        }
        context.fillStyle = "#ffffff";
        context.fillText(label, labelX, labelY, cellSize * 3);
        if (player.dead) {
            context.save();
            context.strokeStyle = "#ff3333";
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(labelX - nicknameWidth / 2, labelY);
            context.lineTo(labelX + nicknameWidth / 2, labelY);
            context.stroke();
            context.restore();
        }
    }
}
