import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei'
import { Link } from '../Link';
import { ViewPoint, ViewPointProvider } from '../ViewPoint/Viewpoint';

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
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={isFocused || hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
};


const Scene = () => {

  return (
      <Canvas>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.5}
          panSpeed={0.5}
          rotateSpeed={0.5}
        />
        <ViewPointProvider>
        <ViewPoint position={[0, 5, 10]} target={[0, 0, 0]}>
          {({setActive}) => <Link
            href="#Box1"
            alt="Box number 1"
            onFocus={setActive}
            onClick={setActive}
          >{({focus}) => <Box position={[-1.2, 0, 0]} isFocused={focus} />}
          </Link>}
        </ViewPoint>
        </ViewPointProvider>
      </Canvas>
   
  );
};

export { Scene };
