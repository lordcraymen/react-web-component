import { useRef, useEffect, useCallback } from 'react';
import { Vector3 } from 'three';
import { invalidate, useThree } from '@react-three/fiber';


const useLoop = (callback) => {
  const active = useRef(false);
  const frameRef = useRef(-1);

  const loop = useCallback(() => {
    if (active.current && (active.current = callback())) {
      frameRef.current = requestAnimationFrame(loop);
    }
  }, [callback]);

  useEffect(() => () => { cancelAnimationFrame(frameRef.current) }, []);

  return useCallback(() => {
    if (!active.current) {
      active.current = true;
      loop();
    }
  }, [loop]);
};

export default useLoop;


const Zoom = ({speed = 1}) => {
  const { camera, gl } = useThree();
  const velocity = useRef(0);
  
  const update = useLoop(() => {
    if (velocity.current === 0) return false;
    velocity.current *= 0.9;
    const direction = camera.getWorldDirection(new Vector3()).multiplyScalar(velocity.current);
    camera.parent.worldToLocal(direction);
    camera.position.add(direction);
    invalidate();
    if (Math.abs(velocity.current) < 0.001) velocity.current = 0;
    return true;
  })

  const handleWheel = (event) => {
    velocity.current += event.deltaY * ({ 1: 16, 2: 100 }[event.deltaMode] || 1) * (speed / 200);
    update();
  };

  useEffect(() => {
    gl.domElement.addEventListener('wheel', handleWheel);
    return () => {
      gl.domElement.removeEventListener('wheel', handleWheel)
    };
  }, [gl.domElement]);

  return null;
};

export {Zoom};