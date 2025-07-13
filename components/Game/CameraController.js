import { useEffect } from 'react';

import { useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { useHotkeys } from 'react-hotkeys-hook';
import { throttle } from 'lodash';

const CameraController = ({
    onCameraChange
}) => {

    const { camera, gl } = useThree();

    useEffect(() => {

        const controls = new OrbitControls(camera, gl.domElement);

        controls.minDistance = 3;
        controls.maxDistance = 40;

        // Subscribe to the OrbitControls change event
        controls.addEventListener('change', handleControlsChange);

        return () => {
            controls.dispose();
        };

    }, [camera, gl]);

    useEffect(() => {

        // const controls = new OrbitControls(camera, gl.domElement);

        // camera.position.set(20, 15, 14);
        // controls.target.set(20, 0, 0);

    }, []);

    const handleMovement = (direction) => {
        switch (direction) {
            case 'forward':
                camera.position.z -= 0.1;
                break;
            case 'backward':
                camera.position.z += 0.1;
                break;
            case 'left':
                camera.position.x -= 0.1;
                break;
            case 'right':
                camera.position.x += 0.1;
                break;
            case 'up':
                camera.position.y += 0.1;
                break;
            case 'down':
                camera.position.y -= 0.1;
                break;
            default:
                break;
        }

        onCameraChange({
            position: camera.position.clone(),
            rotation: camera.rotation.clone(),
        });
    };

    const handleControlsChange = () => {
        // Called when the OrbitControls change, e.g., when dragging the scene
        // Notify the parent component about the camera change
        onCameraChange({
            position: camera.position.clone(),
            rotation: camera.rotation.clone(),
        });
    };

    const throttledMoveForward = throttle(() => {
        handleMovement('forward');
    }, 16);

    const throttledMoveBackward = throttle(() => {
        handleMovement('backward');
    }, 16);

    const throttledMoveLeft = throttle(() => {
        handleMovement('left');
    }, 16);

    const throttledMoveRight = throttle(() => {
        handleMovement('right');
    }, 16);

    const throttledMoveUp = throttle(() => {
        handleMovement('up');
    }, 16);

    const throttledMoveDown = throttle(() => {
        handleMovement('down');
    }, 16);

    useHotkeys('w', throttledMoveForward, { enableOnTags: ['INPUT', 'TEXTAREA'] });
    useHotkeys('s', throttledMoveBackward, { enableOnTags: ['INPUT', 'TEXTAREA'] });
    useHotkeys('a', throttledMoveLeft, { enableOnTags: ['INPUT', 'TEXTAREA'] });
    useHotkeys('d', throttledMoveRight, { enableOnTags: ['INPUT', 'TEXTAREA'] });
    useHotkeys(' ', throttledMoveUp, { enableOnTags: ['INPUT', 'TEXTAREA'] });
    useHotkeys('ctrl', throttledMoveDown, { enableOnTags: ['INPUT', 'TEXTAREA'] });

    return null;
};

export default CameraController;