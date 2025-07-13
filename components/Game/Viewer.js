import { useRef } from 'react'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'

export default function Viewer({ autoRotate, scale, children }) {

    const ref = useRef()

    // useLayoutEffect(() => {
    //     scene.traverse((obj) => {
    //         if (obj.isMesh) {
    //             obj.castShadow = obj.receiveShadow = shadows
    //             obj.material.envMapIntensity = 0.8
    //         }
    //     })
    // }, [scene, shadows])

    return (
        <Canvas camera={{ position: [-100, 30, 10], fov: 50 }}>

            <hemisphereLight intensity={1} />

            <spotLight intensity={200000} position={[-100, 30, 10]} angle={1} penumbra={1} />

            <spotLight intensity={200000} position={[50, 200, 200]} angle={0.4} penumbra={1} />

            <group position={[0, -10, 0]}>

                <group position={[0, 0.25, 0]} >
                    {children}
                </group>

                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 50]}>
                    <planeGeometry attach="geometry" args={[20, 200]} />
                    <meshStandardMaterial attach="material" color={'purple'} />
                </mesh>

                <ContactShadows blur={10} far={20} />

            </group>

            <OrbitControls autoRotate={autoRotate} enablePan={false} />

        </Canvas>
    )
}