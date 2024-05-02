import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei'

const Box = ({  ...props }) => {
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
      <meshStandardMaterial color={'orange'} />
    </mesh>
  );
};

const Light = () => <ambientLight intensity={Math.PI / 2} />

const Scene = ({children}) => {
  const [focusedBox, setFocusedBox] = useState(null); // Track which box is focused

  return (
    <Canvas>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <OrbitControls
        enableDamping
        enablePan
        enableRotate
        enableZoom
      />
        {children}
      {/* More Boxes as needed */}
    </Canvas>
  );
};

const Group = ({ children, position }) => {
  return (
    <group position={position}>
      {children}
    </group>
  );
};

export { Scene, Box, Light, Group };
