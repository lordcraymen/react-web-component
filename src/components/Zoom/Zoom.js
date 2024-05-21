import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { useThree, useFrame, invalidate } from '@react-three/fiber';

const Zoom = () => {
  const { camera, gl } = useThree();
  const velocity = useRef(0);

  const handleWheel = (event) => {
    velocity.current += event.deltaY * 0.005; // adjust sensitivity
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