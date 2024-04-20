import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei'
import { Link } from '../Link';
import { ViewPoint, ViewPointProvider } from '../ViewPoint/Viewpoint';

const Box = ({position = [0,0,0] ,scale = 1, rotation = 1 }) => {
  const ref = useRef(new THREE.Mesh());
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  return (
    <mesh
      ref={ref}
      position={new THREE.Vector3(position)} // Adjust for focus
      scale={new THREE.Vector3(scale)} // Adjust for focus
      rotation={new THREE.Vector3(rotation)} // Adjust for focus
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
      onPointerDown={(event) => click(true)}
      onPointerUP={(event) => click(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={clicked || hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
};


const Scene = ({children}) => {

  return (
      <Canvas>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={2}
          panSpeed={0.5}
          rotateSpeed={0.5}
        /> 
        {children} 
      </Canvas>
   
  );
};
/*
<ViewPointProvider>
        <ViewPoint position={[0, 5, 10]}>
          {({setActive}) => <Link
            href="#Box1"
            alt="Box number 1"
            onFocus={setActive}
            onClick={setActive}
          >{({focus}) => <Box position={[-1.2, 0, 0]} isFocused={focus} />}
          </Link>}
        </ViewPoint>
        <ViewPoint position={[0, 5, -10]}>
          {({setActive}) => <Link
            href="#Box1"
            alt="Box number 1"
            onFocus={setActive}
            onClick={setActive}
          >{({focus}) => <Box position={[1.2, 0, 0]} isFocused={focus} />}
          </Link>}
        </ViewPoint>
        </ViewPointProvider>
*/
export { Scene, Box };
