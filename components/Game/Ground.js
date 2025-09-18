const GroundPlane = (props) => {

    return (
        <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={props.position}>
                <planeGeometry attach="geometry" args={props.args} />
                <meshStandardMaterial attach="material" color={'black'} transparent={true} opacity={0.75} />
            </mesh>
        </>
    );
};

export default GroundPlane