import { useRef, useEffect } from 'react';
import { Scene, AmbientLight, Color } from 'three';
import { useThree, useFrame, createPortal } from '@react-three/fiber';
import { EffectComposer,  } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { AlphaShader } from './AlphaShader'; // Replace with your actual import

const Layer = ({ children, opacity = 1 }) => {
  const { scene, size, gl, camera } = useThree();
  const layerContainer = useRef(new Scene().add(new AmbientLight(0xffffff, 1)));

  const firstComposer = useRef(new EffectComposer(gl));
  firstComposer.current.setSize(size.width, size.height);

  const secondComposer = useRef(new EffectComposer(gl));
  secondComposer.current.setSize(size.width, size.height);

  const firstPass = useRef(new RenderPass(scene, camera));
  const secondPass = useRef(new RenderPass(layerContainer.current, camera));
  //secondPass.current.clearDepth = true;
  secondComposer.current.addPass(secondPass.current);
  secondComposer.current.renderToScreen = false;

  firstComposer.current.addPass(firstPass.current);

  const finalPass = useRef(new ShaderPass(AlphaShader))
  finalPass.current.renderToScreen = true;
  
  firstComposer.current.addPass(finalPass.current);

  const _opacity = parseFloat(String(opacity))

  useFrame(({ gl }) => {
    gl.autoClear = false;
    secondComposer.current.render();
    finalPass.current.material.uniforms.tPass.value = secondComposer.current.readBuffer.texture;
    finalPass.current.material.uniforms.opacity.value = _opacity;
    firstComposer.current.render();
  }, 1);

  return (
    <>
      {createPortal(children, layerContainer.current)}
    </>
  );
};

export { Layer }