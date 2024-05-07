import { useRef } from 'react';
import { useThree, createPortal, useFrame } from '@react-three/fiber';
import { Scene, AmbientLight } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { AlphaShader } from './AlphaShader';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';

const Layer = ({ children }) => {

  const { scene, size, gl, camera } = useThree();
  const layerContainer = useRef(new Scene().add(new AmbientLight(0xffffff, 1)));

  const composer = useRef(new EffectComposer(gl))
  
  const basePass = useRef(new RenderPass(scene, camera));
  const pass = useRef(new RenderPass(layerContainer.current, camera));

  const outputPass = new ShaderPass(CopyShader);
  const alphaPass = new ShaderPass(AlphaShader);
  
  composer.current.addPass(basePass.current);
  
  composer.current.addPass(pass.current);
  pass.current.clearDepth = true;
  pass.current.clearColor = true;
  pass.current.clearAlpha = true;
  pass.current.clear = false;
  composer.current.addPass(alphaPass);

  
  //outputPass.renderToScreen = true;
  //composer.current.addPass(outputPass);

  useFrame(({ gl }) => {
    composer.current.render();
  },1);


  return (
    <>
      {createPortal(children, layerContainer.current)}
    </>
  );
};

export { Layer };