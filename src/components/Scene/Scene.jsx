import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useThree} from '@react-three/fiber';
import { BackSide, Object3D, MeshBasicMaterial } from 'three';
import { Rotator } from '../Rotator/Rotator';
import { Zoom } from '../Zoom';
import { Pan } from '../Pan';
import { prefersreducedMotion } from '../../helpers/checkReducedMotion';
import { LayerProvider } from '../../contexts/LayerContext';
import { RenderGroup } from "../RenderGroup"
import { color } from 'three/examples/jsm/nodes/shadernode/ShaderNode';

/*
// Save the original renderObject function
const originalRenderObject = WebGLRenderer.prototype.renderObject;

// Override the renderObject function
WebGLRenderer.prototype.renderObject = function(object, scene, camera, geometry, material, group) {
    const overrideMaterial = scene.overrideMaterial;

    // Use overrideMaterial if it is set
    if (overrideMaterial !== null) {
        material = overrideMaterial;
    }

    // Call the original renderObject function with the potentially overridden material
    originalRenderObject.call(this, object, scene, camera, geometry, material, group);
    console.log("rendered ", object)
};
*/

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



Object3D.prototype.overrideMaterial = null;

const LogThree = () => {
  const { gl } = useThree();
  console.log(gl);
  return null;
}

const BasicMaterial = new MeshBasicMaterial({color: 0xff0000});


const Scene = ({ children }) => {
  return (
    <Canvas onCreated={({ gl }) => {
      const originalRenderBufferDirect = gl.renderBufferDirect;

      gl.renderBufferDirect = function (camera, fog, geometry, material, object, group) {
        console.log(object.overrideMaterial)
        originalRenderBufferDirect.call(this, camera, fog, geometry, object.overrideMaterial || material, object, group);
      };
    }} frameloop="demand" >
      <LogThree />
      <LayerProvider>
        <ambientLight intensity={Math.PI / 2} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
          <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} /> 
          <Rotator>
              <GlobalBackground>
                  <Camera />
                  <Zoom speed={1}/>
              </GlobalBackground>
          </Rotator>
          {children}
      </LayerProvider>
    </Canvas>
  );
};

const Group = ({ children, position, scale, rotation }) =>
  <group {...{ children, position, scale, rotation }} />

export { Scene, Box, Light, Group };
