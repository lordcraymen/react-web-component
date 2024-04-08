import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei'
import { Link } from '../Link';
import { ViewPointProvider } from '../ViewPoint/Viewpoint';

const Box = ({ isFocused, ...props }) => {
  const ref = useRef();
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  useFrame((state, delta) => (ref.current.rotation.x += delta));

  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : isFocused || hovered ? 1.25 : 1} // Adjust for focus
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={isFocused || hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
};


const Scene = () => {
  const [focusedBox, setFocusedBox] = useState(null); // Track which box is focused

  return (
    <ViewPointProvider>
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
        <Link
          href="#Box1"
          alt="Box number 1"
          onFocus={() => setFocusedBox(1)} // Focus on Box 1
        >
          <Box position={[-1.2, 0, 0]} isFocused={focusedBox === 1} />
        </Link>
        <Link
          href="#Box2"
          alt="Box number 2"
          onFocus={() => setFocusedBox(2)} // Focus on Box 2
        >
          <Box position={[1.2, 0, 0]} isFocused={focusedBox === 2} />
        </Link>
        {/* More Boxes as needed */}
      </Canvas>
    </ViewPointProvider>
  );
};

export { Scene };
