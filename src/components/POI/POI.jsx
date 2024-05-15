import { useRef, useEffect } from 'react';
import { Vector3, Quaternion } from 'three';
import { useFrame } from '@react-three/fiber';

const createQuaternions = (startPosition, endPosition) => {
  const startQuaternion = new Quaternion().setFromUnitVectors(
    startPosition.clone().normalize(),
    new Vector3(0, 0, 1)
  );
  
  const endQuaternion = new Quaternion().setFromUnitVectors(
    endPosition.clone().normalize(),
    new Vector3(0, 0, 1)
  );

  return { startQuaternion, endQuaternion };
};

const POI = ({ position = [0, 0, 0], active = false }) => {
  const targetP = new Vector3(...position);
  const cameraPositionRef = useRef(new Vector3());
  const timerRef = useRef(0);
  const quaternionsRef = useRef(null);

  useEffect(() => {
    // Initialize camera position and quaternions
    const cameraStartPosition = cameraPositionRef.current.clone();
    quaternionsRef.current = createQuaternions(cameraStartPosition, targetP);
  }, [position]);

  useFrame(({ camera }) => {
    if (active && quaternionsRef.current) {
      const { startQuaternion, endQuaternion } = quaternionsRef.current;
      const t = timerRef.current += 0.001;

      if (t < 1) {
        const interpolatedQuaternion = new Quaternion().slerpQuaternions(
          startQuaternion,
          endQuaternion,
          t
        );
        
        const direction = new Vector3(0, 0, -1).applyQuaternion(interpolatedQuaternion);
        camera.position.copy(direction.multiplyScalar(camera.position.length()));
        camera.lookAt(0, 0, 0);
      }
    }
  });

  return null;
};

export { POI }
