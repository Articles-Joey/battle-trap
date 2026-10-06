import { degToRad } from "three/src/math/MathUtils";
import { SciFiBuildingsPack } from "./SciFiBuildingsPackCorner";
import BoardSafeBuildings from "./BoardSafeBuildings";

const CORNERS = [
    { x: -1, z: 1, offsetX: 8, offsetZ: 8, angle: -30, color: "red" },
    { x: 1, z: 1, offsetX: 6, offsetZ: 8, angle: 50, color: "green" },
    { x: -1, z: -1, offsetX: 8, offsetZ: 8, angle: -120, color: "yellow" },
    { x: 1, z: -1, offsetX: 5, offsetZ: 5, angle: 130, color: "blue" },
];

export default function CornerBuildings({ boardSize }) {
    return (
        <group>
            {CORNERS.map(({ x, z, offsetX, offsetZ, angle, color }) => (
                <BoardSafeBuildings
                    key={color}
                    boardSize={boardSize}
                    direction={[x, z]}
                >
                    <group
                        position={[x * (boardSize + offsetX), 0, z * (boardSize + offsetZ)]}
                        rotation={[0, degToRad(angle), 0]}
                    >
                        <SciFiBuildingsPack colorOverlay={color} />
                    </group>
                </BoardSafeBuildings>
            ))}
        </group>
    );
}
