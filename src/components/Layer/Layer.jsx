import { useRef } from 'react';
import { useThree, createPortal, useFrame } from '@react-three/fiber';
import { Scene, AmbientLight } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';

const Layer = ({ children }) => {

  const { scene, size, gl, camera } = useThree();
  const layerContainer = useRef(new Scene().add(new AmbientLight(0xffffff, 1)));

  const baseComposer = useRef(new EffectComposer(gl))
  const composer = useRef(new EffectComposer(gl))
  const basePass = useRef(new RenderPass(scene, camera));
  const pass = useRef(new RenderPass(layerContainer.current, camera));

  //pass.current.clear = false;
  pass.current.clearDepth = true;
  baseComposer.current.addPass(basePass.current);
  composer.current.addPass(pass.current);

  const alphaShader = {
    uniforms: {
      tDiffuse: { value: null },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      varying vec2 vUv;
      void main() {
        vec4 color = texture2D(tDiffuse, vUv);
        gl_FragColor = vec4(color.rgb, 0.5);
      }
    `,
  };

  const alphaPass = new ShaderPass(alphaShader);
  composer.current.addPass(alphaPass);

  const outputPass = new ShaderPass(CopyShader);
  outputPass.renderToScreen = true;
  composer.current.addPass(outputPass);

  useFrame(({ gl }) => {
    baseComposer.current.render();
    composer.current.render();
  },1);


  return (
    <>
      {createPortal(children, layerContainer.current)}
    </>
  );
};

export { Layer };