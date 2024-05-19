import { useRef } from 'react';
import { useThree, invalidate } from '@react-three/fiber';
import { Group, Vector2, Quaternion, Euler } from 'three';

const Rotator = ({ children }) => {
  const rotator = useRef(new Group());
  const originalOrientation = useRef(rotator.current.quaternion.clone());
  const rotating = useRef(false);
  const pointerStart = useRef(new Vector2());
  const startQuaternion = useRef(new Quaternion());

  const onPointerDown = (event) => {
    pointerStart.current.set(event.clientX, event.clientY);
    startQuaternion.current.copy(rotator.current.quaternion);
    
    window.addEventListener('pointermove', handlePointerMove);
    const releasePointerUp = window.addEventListener('pointerup', () => { 
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup',releasePointerUp) }, { once: true });
  };

  const handlePointerMove = (event) => {
      const pointerDelta = new Vector2(
        event.clientX - pointerStart.current.x,
        event.clientY - pointerStart.current.y
      );

      const rotationX = pointerDelta.y * 0.01;  // Adjust sensitivity as needed
      const rotationY = pointerDelta.x * 0.01;

      const targetQuaternion = new Quaternion()
        .setFromEuler(new Euler(rotationX, rotationY, 0, 'XYZ'))
        .multiply(startQuaternion.current);

      rotator.current.quaternion.slerp(targetQuaternion, 0.1);
      invalidate();
  };

  return (
    <group ref={rotator} {...{ onPointerDown }}>
      {children}
    </group>
  );
};

export { Rotator };
