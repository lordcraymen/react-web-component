import { useRef, useState, useEffect } from 'react';
import { useThree, invalidate } from '@react-three/fiber';
import { Group, Vector2, Quaternion, Euler } from 'three';

const Rotator = ({ children }) => {
  const rotator = useRef(new Group());
  const originalOrientation = useRef(rotator.current.quaternion.clone());

  const domElement = useThree((state) => state.gl.domElement);

  const [cursorStyle, setCursorStyle] = useState('auto')

  useEffect(() => {
      if(domElement) { domElement.style.cursor = cursorStyle }
  }, [domElement, cursorStyle])
  
  const pointerStart = useRef(new Vector2());
  const startQuaternion = useRef(new Quaternion());

  const onPointerDown = (event) => {
    setCursorStyle('grabbing')
    event.stopPropagation();
    pointerStart.current.set(event.clientX, event.clientY);
    startQuaternion.current.copy(rotator.current.quaternion);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', () => { setCursorStyle('auto'); window.removeEventListener('pointermove', handlePointerMove, { once: true })})
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

  const onPointerOver = () => { setCursorStyle('grab')}

  return (
    <group ref={rotator} {...{ onPointerDown, onPointerOver }}>
      {children}
    </group>
  );
};

export { Rotator };
