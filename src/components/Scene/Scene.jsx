import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei'

const Box = ({ focus, ...props }) => {
  const ref = useRef();
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  useFrame((state, delta) => (ref.current.rotation.x += delta));

  return (
    <mesh
      {...props}
      ref={ref}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={!focus ? 'orange' : 'yellow'} />{
        props.children
      }
    </mesh>
  );
};

const HookedOrbitControls = () => {
  const { gl } = useThree();
  useEffect(() => {
    const target = gl.domElement.parentElement.parentElement;
    const originalAddListener = target.addEventListener;
    const originalRemoveListener = target.removeEventListener;

    target.addEventListener = (type, handler) => {
      if (type === 'pointerdown') {
        return originalAddListener.call(target, 'pointerdown', (e) => { e.preventDefault(); handler(e) });
      } 
      return originalAddListener.call(target, type, handler);
    };

    target.removeEventListener = (type, handler) => {
      return originalRemoveListener.call(target, type, handler);
    };

    return () => { 
      target.addEventListener = originalAddListener;
      target.removeEventListener = originalRemoveListener;
    }
  }, [gl.domElement])

  return null
}

const Light = () => <ambientLight intensity={Math.PI / 2} />

const Scene = ({ children }) => {
  return (
    <Canvas>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <HookedOrbitControls />
      {/*
      <OrbitControls
        enableDamping
        enablePan
        enableRotate
        enableZoom
      /> */}
      {children}
    </Canvas>
  );
};

const Group = ({ children, position, scale, rotation }) =>
  <group {...{ children, position, scale, rotation }} />

export { Scene, Box, Light, Group };
