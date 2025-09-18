import { degToRad } from "three/src/math/MathUtils";
import { SciFiBuildingsPack } from "./SciFiBuildingsPackCorner";

export default function CornerBuildings(props) {

    const { boardSize } = props;

    return (
        <group>

            <group
                position={[
                    -((boardSize) / 2) * 2 - 8,
                    0,
                    ((boardSize) / 2) * 2 + 8
                ]}
                rotation={[0, degToRad(-30), 0]}
            >
                <SciFiBuildingsPack
                    colorOverlay='red'
                />
            </group>

            <group
                position={[
                    ((boardSize) / 2) * 2 + 6,
                    0,
                    ((boardSize) / 2) * 2 + 8
                ]}
                rotation={[0, degToRad(-30 + 80), 0]}
            >
                <SciFiBuildingsPack
                    colorOverlay='green'
                />
            </group>

            <group
                position={[
                    -((boardSize) / 2) * 2 - 8,
                    0,
                    -((boardSize) / 2) * 2 - 8
                ]}
                rotation={[0, degToRad(-30 - 90), 0]}
            >
                <SciFiBuildingsPack
                    colorOverlay='yellow'
                />
            </group>

            <group
                position={[
                    ((boardSize)) + 5,
                    0,
                    -((boardSize)) - 5
                ]}
                rotation={[0, degToRad(-30 + 160), 0]}
            >
                <SciFiBuildingsPack
                    colorOverlay='blue'
                />
            </group>

        </group>
    )

}