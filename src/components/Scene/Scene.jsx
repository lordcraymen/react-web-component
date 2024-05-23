import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree, invalidate} from '@react-three/fiber';
import { OrbitControls,PerspectiveCamera, Torus} from '@react-three/drei'
import { BackSide, Vector3 } from 'three';
import { InteractionEventContextProvider } from '../../contexts/InteractionEventContext';
import { Rotator } from '../Rotator/Rotator';
import { Zoom } from '../Zoom';
import { Pan } from '../Pan';

const Box = ({ focus, ...props }) => {
  const ref = useRef();
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  return (
    <mesh
      {...props}
      ref={ref}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={!clicked ? 'orange' : 'yellow'} />{
        props.children
      }
    </mesh>
  );
};

const Light = () => <ambientLight intensity={Math.PI / 2} />


const InvisibleMaterial = () => <meshBasicMaterial {...{
    color: 0x000000,
    opacity: 0,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: BackSide
  }} />

const GlobalBackground = ({children}) => {
  return <mesh><sphereGeometry args={[10000, 1, 1]} renderOrder={-1}/><InvisibleMaterial />{children}</mesh>;
}

const Camera = () => {
  const camera = useThree(state => state.camera);
  const groupRef = useRef();

  useEffect(() => {
    if (groupRef.current) {
      const originalParent = camera.parent;
      groupRef.current.add(camera);
      return () => { originalParent?.add(camera) }
    }
  }, [camera]);
  return <group ref={groupRef} />
};

const Scene = ({ children }) => {
  return (
    <Canvas frameloop="demand">
    <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} /> 
      <Pan>
      <Rotator>
          <GlobalBackground>
              <Camera />
              <Zoom speed={1}/>
          </GlobalBackground>
      </Rotator>
      </Pan>
      {children}
    </Canvas>
  );
};

const Group = ({ children, position, scale, rotation }) =>
  <group {...{ children, position, scale, rotation }} />



export { Scene, Box, Light, Group };
