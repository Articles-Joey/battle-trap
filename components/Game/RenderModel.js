import { LowPolyChopper, LowPolyScooter, LowPolyTricycle, ToiletTricycle, Unicycle } from './Bikes';

function RenderModel({character}) {
    return (
        <>
            {/* {character.model == "low_poly_chopper.glb" &&
                <LowPolyChopper scale={0.1} position={[0, -10, 0]} />
            }

            {character.model == "low_poly_scooter.glb" &&
                <LowPolyScooter scale={25} position={[-3, -8, -10]} />
            }

            {character.model == "low_poly_tricycle.glb" &&
                <LowPolyTricycle scale={0.75} position={[0, -3, -30]} />
            }

            {character.model == "low_poly_unicycle.glb" &&
                <Unicycle scale={25} position={[0, 0.5, -20]} rotation={[0, Math.PI, 0]} />
            }

            {character.model == "toilet_tricycle.glb" &&
                <ToiletTricycle scale={8} position={[0, -2, -50]} rotation={[0, Math.PI / 2, 0]} />
            } */}
        </>
    )
}

export default RenderModel