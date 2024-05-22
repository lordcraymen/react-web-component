import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { invalidate, useThree } from '@react-three/fiber';

const Zoom = ({speed = 1}) => {
  const { camera, gl } = useThree();
  const velocity = useRef(0);
  let animationFrame = -1

  const handleWheel = (event) => {
    velocity.current += event.deltaY * ({ 1: 16, 2: 100 }[event.deltaMode] || 1) * (speed / 200);
    if(animationFrame === -1) animate();
  };

  const animate = () => {
    console.log('animate');
    if (velocity.current === 0) { animationFrame = -1; return cancelAnimationFrame(animationFrame); }

    velocity.current *= 0.8;

    if (Math.abs(velocity.current) < 0.001) {
      velocity.current = 0;
    } 

    const direction = camera.getWorldDirection(new Vector3()).multiplyScalar(velocity.current);
    camera.parent.worldToLocal(direction);
    camera.position.add(direction);
    
    invalidate();
    animationFrame = requestAnimationFrame(animate);
  }

  useEffect(() => {
    gl.domElement.addEventListener('wheel', handleWheel);
    return () => {
      cancelAnimationFrame(animationFrame);
      gl.domElement.removeEventListener('wheel', handleWheel)
    };
  }, [gl.domElement]);

  return null;
};

export {Zoom};