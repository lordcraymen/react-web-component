import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { useThree, useFrame } from '@react-three/fiber';

const Zoom = ({speed = 1}) => {
  const { camera, gl } = useThree();
  const velocity = useRef(0);

  const handleWheel = (event) => {
    const deltaMultipliers = { 1: 16, 2: 100 };
    velocity.current += event.deltaY * (deltaMultipliers[event.mode] || 1) * (speed / 200); // adjust sensitivity
  };

  useFrame(() => {
    if (velocity.current !== 0) {
      // move camera along its viewing direction
      const direction = camera.getWorldDirection(new Vector3()).multiplyScalar(velocity.current);
      camera.parent.worldToLocal(direction);
      camera.position.add(direction);

      // damping
      velocity.current *= 0.8;

      if (Math.abs(velocity.current) < 0.001) {
        velocity.current = 0;
      }
    }
  });

  useEffect(() => {
    gl.domElement.addEventListener('wheel', handleWheel);
    return () => {gl.domElement.removeEventListener('wheel', handleWheel)};
  }, [gl.domElement]);

  return null;
};

export {Zoom};