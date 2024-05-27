import { useRef, useEffect } from 'react';
import { Scene, AmbientLight, DepthTexture } from 'three';
import { useThree, useFrame, createPortal } from '@react-three/fiber';
import { EffectComposer,  } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { AlphaShader } from './AlphaShader'; // Replace with your actual import
import { useLayer } from '../../contexts/LayerContext';

/*

let counter = 0;

const Layer = ({ children, opacity = 1 }) => {
  const { scene, size, gl, camera } = useThree();
  const layerContainer = useRef(new Scene().add(new AmbientLight(0xffffff, 3)));

  const firstDepthTexture = useRef(new DepthTexture(size.width, size.height));
  const secondDepthTexture = useRef(new DepthTexture(size.width, size.height));

  const firstComposer = useRef(new EffectComposer(gl));
  firstComposer.current.setSize(size.width, size.height);

  const secondComposer = useRef(new EffectComposer(gl));
  secondComposer.current.setSize(size.width, size.height);

  const firstPass = useRef(new RenderPass(scene, camera));
  const secondPass = useRef(new RenderPass(layerContainer.current, camera));
  secondComposer.current.readBuffer.depthTexture = secondDepthTexture.current;
  secondComposer.current.renderToScreen = false;

  firstComposer.current.readBuffer.depthTexture = firstDepthTexture.current;
  firstPass.current.clearDepth = false;

  const finalPass = useRef(new ShaderPass(AlphaShader))
  finalPass.current.renderToScreen = true;

  const _opacity = parseFloat(String(opacity))
  gl.autoClear = true;

  finalPass.current.material.uniforms.opacity.value = _opacity;

  useFrame(({camera}) => { 
    secondComposer.current.render();
    firstComposer.current.render();
  },counter++);

  useEffect(() => {
    firstPass.current.camera = camera;
      secondPass.current.camera = camera;
  }, [camera]);


  useEffect(() => {
    secondComposer.current.addPass(secondPass.current);
    firstComposer.current.addPass(firstPass.current);
    firstComposer.current.addPass(finalPass.current);

    finalPass.current.material.uniforms.tPassColor.value = secondComposer.current.readBuffer.texture;
    finalPass.current.material.uniforms.tPassDepth.value = secondComposer.current.readBuffer.depthTexture;
    
    finalPass.current.material.uniforms.tDepth.value = firstComposer.current.readBuffer.depthTexture;
    return () => {
      secondComposer.current.removePass(secondPass.current);
      firstComposer.current.removePass(firstPass.current);
      firstComposer.current.removePass(finalPass.current);
      firstComposer.current.dispose();
      secondComposer.current.dispose();
      firstDepthTexture.current.dispose();
      secondDepthTexture.current.dispose();
    };
}, []);


  return (
    <>
      {createPortal(children, layerContainer.current)}
    </>
  );
};

*/

const Layer = ({ children, opacity = 1 }) => {

  const layer = useLayer()
  return createPortal(children, layer)
}


export { Layer }