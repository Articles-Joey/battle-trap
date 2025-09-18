import { degToRad } from "three/src/math/MathUtils";

// import { SciFiBuildingsPack } from "./SciFiBuildingsPackCorner";
import { SciFiBuildingsPack as SciFiBuildingsPackSquare } from "./SciFiBuildingsPackSquare";

export default function FillerBuildings(props) {

    const { boardSize } = props;

    return (
        <group>

            <SciFiBuildingsPackSquare
                position={[
                    0,
                    0,
                    boardSize * 1.90
                ]}
                // rotation={[0, degToRad(-30), 0]}
                colorOverlay='white'
            />

            <SciFiBuildingsPackSquare
                position={[
                    0,
                    0,
                    -boardSize * 1.90
                ]}
                // rotation={[0, degToRad(-30), 0]}
                colorOverlay='white'
            />

            <SciFiBuildingsPackSquare
                position={[
                    boardSize * 1.90,
                    0,
                    0
                ]}
                // rotation={[0, degToRad(-30), 0]}
                colorOverlay='white'
            />

            <SciFiBuildingsPackSquare
                position={[
                    -boardSize * 1.90,
                    0,
                    0
                ]}
                // rotation={[0, degToRad(-30), 0]}
                colorOverlay='white'
            />

        </group>
    )

}