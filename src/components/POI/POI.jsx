import { useMemo } from 'react';
import { Vector3, Spherical } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const POI = ({ position = [0,0,0], target = [0,0,0], active = false }) => {
  const { camera } = useThree();

  // Memoize the initial position and target
  const initialPosition = useMemo(() => new Vector3(...position), [position]);
  const targetPosition = useMemo(() => new Vector3(...target), [target]);

  // Convert initial position and new position to spherical coordinates
  const initialSpherical = useMemo(() => new Spherical().setFromVector3(initialPosition.clone().sub(targetPosition)), [initialPosition, target]);
  const targetSpherical = useMemo(() => new Spherical().setFromVector3(new Vector3(...position).sub(targetPosition)), [position, target]);

  useFrame(() => {
    if (active) {
      camera.position.lerp(initialPosition,0.05)
      //console.log(camera)
      /*
      const t = 0.01; // Interpolation factor

      // Linearly interpolate spherical coordinates
      initialSpherical.theta += (targetSpherical.theta - initialSpherical.theta) * t;
      initialSpherical.phi += (targetSpherical.phi - initialSpherical.phi) * t;
      initialSpherical.radius += (targetSpherical.radius - initialSpherical.radius) * t;

      // Convert back to Cartesian coordinates and set camera position
      const interpolatedPosition = new Vector3().setFromSpherical(initialSpherical).add(targetPosition);
      camera.position.copy(interpolatedPosition);

      // Ensure the camera looks at the target
      camera.lookAt(targetPosition);
      */
    }
  });

  return null;
};

export { POI };

