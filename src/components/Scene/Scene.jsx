import React, { useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei'

const Box = ({focus, ...props }) => {
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
      <meshStandardMaterial color={!focus ? 'orange':'yellow'} />{
        props.children
      }
    </mesh>
  );
};

const HookedOrbitControls = (props) => {
  const test = useThree();
  const oldEventHandler = test.gl.domElement.parentElement.parentElement.addEventListener;
  console.log(test.gl.domElement.parentElement.parentElement.addEventListener = (type,handler) => {
    if (type === 'pointerdown') {
      return oldEventHandler('pointerdown',(e) => { e.preventDefault(); handler(e) });
    } return oldEventHandler(type,handler);
  });
  return <OrbitControls
  enableDamping
  enablePan
  enableRotate
  enableZoom
/>
}

const Light = () => <ambientLight intensity={Math.PI / 2} />

const Scene = ({children}) => {
  const [focusedBox, setFocusedBox] = useState(null); // Track which box is focused

  return (
    <Canvas>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <HookedOrbitControls />
      
      <Group position={[2,0,0]}>
        {children}
        </Group>
    </Canvas>
  );
};

const Group = ({ children, position, scale, rotation }) => 
    <group {...{children,position,scale,rotation}} />

export { Scene, Box, Light, Group };
