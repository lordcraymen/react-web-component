import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useThree, useLoader} from '@react-three/fiber';
import { BackSide, Object3D, MeshBasicMaterial } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Stats } from '@react-three/drei';
import { Rotator } from '../Rotator/Rotator';
import { Zoom } from '../Zoom';
import { Pan } from '../Pan';
import { prefersreducedMotion } from '../../helpers/checkReducedMotion';
import { LayerProvider } from '../../contexts/LayerContext';
import { RenderGroup } from "../RenderGroup"
import { color } from 'three/examples/jsm/nodes/shadernode/ShaderNode';

import { TextureLoader } from 'three';

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

function Model({src,position,rotation,scale}) {
  const gltf = useLoader(GLTFLoader, src);
  return <primitive object={gltf.scene.clone()} {...{position,rotation,scale}}/>;
}

Object3D.prototype.overrideMaterial = null;

const LogThree = () => {
  const { gl, scene } = useThree();

    // Laden Sie das Hintergrundbild und setzen Sie es als Hintergrund der Szene
    /*
    new TextureLoader().load('/src/assets/background.jpg', texture => {
      scene.background = texture;
    }); */

  //console.log(gl);
  return null;
}

const BasicMaterial = new MeshBasicMaterial({color: 0xff0000});


const Scene = ({ children }) => {
  return (
    <Canvas onCreated={({ gl }) => {
      
      const originalRenderBufferDirect = gl.renderBufferDirect
      const originalRender = gl.render

      gl.render = function (scene, camera) {
        /*
        scene.traverse(object => {
          if (object.parent) {
            object.overrideMaterial = object.parent.overrideMaterial;
          }
        });*/
        originalRender.call(this, scene, camera);
      }

      gl.renderBufferDirect = function (camera, fog, geometry, material, object, group) {
        originalRenderBufferDirect.call(this, camera, fog, geometry, object.overrideMaterial || material, object, group);
      };
      
    }} frameloop="demand">
      <Stats />
      <RenderGroup opacity={0.2}>
      <Model src="src/assets/example.glb" scale="10"/></RenderGroup>
      <Model src="src/assets/example.glb" scale="5" position={[1,0,0]}/>
      <LogThree />
      <LayerProvider>
        <ambientLight intensity={Math.PI / 2} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
          <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} /> 
          <Rotator>
              <GlobalBackground>
                  <Camera />
                  <Zoom speed={0.1}/>
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
