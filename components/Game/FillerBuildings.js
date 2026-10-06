import BoardSafeBuildings from "./BoardSafeBuildings";
import { SciFiBuildingsPack as SciFiBuildingsPackSquare } from "./SciFiBuildingsPackSquare";

const SIDES = [[0, 1], [0, -1], [1, 0], [-1, 0]];

export default function FillerBuildings({ boardSize }) {
    return (
        <group>
            {SIDES.map(([x, z]) => (
                <BoardSafeBuildings
                    key={`${x},${z}`}
                    boardSize={boardSize}
                    direction={[x, z]}
                >
                    <SciFiBuildingsPackSquare
                        position={[x * boardSize * 1.9, 0, z * boardSize * 1.9]}
                        colorOverlay="white"
                    />
                </BoardSafeBuildings>
            ))}
        </group>
    );
}
