import { useRef, useEffect } from 'react';
import { Scene, AmbientLight, WebGLRenderTarget, LinearFilter, RGBAFormat, FloatType, Texture } from 'three';
import { useThree, useFrame, createPortal } from '@react-three/fiber';
import { EffectComposer,  } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';
import { AlphaShader } from './AlphaShader'; // Replace with your actual import

const Layer = ({ children }) => {
  const { scene, size, gl, camera } = useThree();
  const layerContainer = useRef(new Scene().add(new AmbientLight(0xffffff, 1)));

  const renderTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight);

  const firstComposer = useRef(new EffectComposer(gl));
  firstComposer.current.setSize(size.width, size.height);

  const firstPass = useRef(new RenderPass(scene, camera));
  const secondPass = useRef(new RenderPass(layerContainer.current, camera));
  secondPass.current.clear = false;
  secondPass.current.clearDepth = true;
  secondPass.current.renderToScreen = false;

  const finalPass = useRef(new ShaderPass(AlphaShader))
  finalPass.current.renderToScreen = true;
  
  firstComposer.current.addPass(firstPass.current);
  firstComposer.current.addPass(secondPass.current);
  firstComposer.current.addPass(finalPass.current);


  useFrame(({ gl }) => {
    gl.autoClear = false;
    finalPass.current.material.uniforms.tDiffuse.value = secondPass.current.readBuffer; // assign the texture value here
    firstComposer.current.render();
  }, 1);

  return (
    <>
      {createPortal(children, layerContainer.current)}
    </>
  );
};

export { Layer }