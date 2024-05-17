import { useRef, useMemo } from 'react';
import { Group } from 'three';
import { useThree, useFrame } from '@react-three/fiber';

const Rotator =({children}) => {
    const meshRef = useRef(new Group());
    const { pointer } = useThree();

    useFrame(() => {
        const rotationX = pointer.y * Math.PI; // Rotate based on Y position of mouse
        const rotationY = pointer.x * Math.PI; // Rotate based on X position of mouse
        meshRef.current.rotation.set(rotationX, rotationY, 0);
    });

    return (
        <group ref={meshRef}>
            {children}
        </group>
    );
}

export { Rotator };