import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei'
import { Link } from '../Link';
import { ViewPoint, ViewPointProvider } from '../ViewPoint/Viewpoint';
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const Box = ({position = [0,0,0] ,scale = 1, rotation = 1 }) => {
  const ref = useRef(new THREE.Mesh());
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  return (
    <mesh
      ref={ref}
      {...{position,rotation,scale}}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
      onPointerDown={(event) => click(true)}
      onPointerUp={(event) => click(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={clicked || hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
};

const Model = ({ src, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], children }) => {
  const gltf = useLoader(GLTFLoader, src)
  return <primitive object={gltf.nodes.mesh_0.clone()} {...{position,rotation,scale}}/>
};

const Light = ({ type, position = [0, 0, 0], intensity = 1, angle = 0.15, penumbra = 1, decay = 0 }) => {
  let light;
  switch (type) {
    case 'ambient':
      light = <ambientLight intensity={intensity} />;
      break;
    case 'spot':
      light = <spotLight position={position} angle={angle} penumbra={penumbra} decay={decay} intensity={intensity} />;
      break;
    case 'point':
      light = <pointLight position={position} decay={decay} intensity={intensity} />;
      break;
    default:
      light = null;
  }
  return light;
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
export { Scene, Box, Model, Light };
