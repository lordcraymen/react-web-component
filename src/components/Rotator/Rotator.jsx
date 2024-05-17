import { useRef, useMemo } from 'react';
import { Group } from 'three';
import { useThree, useFrame } from '@react-three/fiber';

const Rotator =({children}) => {
    const meshRef = useRef(new Group());

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime();
        const t = (Math.sin(time) + 1) / 2;  // Normalized time value between 0 and 1
        const x = t * 2 - 1;  // Maps t to a range between -1 and 1
        const y = Math.pow(t, 3) * 2 - 1;  // Cubic interpolation for y
        const z = Math.sin(t * Math.PI) * 2 - 1;  // Sine interpolation for z

        meshRef.current.position.set(x, y, z);
    });

    return (
        <group ref={meshRef}>
            {children}
        </group>
    );
}

export { Rotator };