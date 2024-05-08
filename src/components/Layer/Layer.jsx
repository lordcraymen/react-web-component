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

  console.log(gl.capabilities);

  const renderTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight);

  const firstComposer = useRef(new EffectComposer(gl));
  firstComposer.current.setSize(size.width, size.height);
  const secondComposer = useRef(new EffectComposer(gl, renderTarget));
  secondComposer.current.setSize(size.width, size.height);

  const firstPass = useRef(new RenderPass(scene, camera));
  const secondPass = useRef(new RenderPass(layerContainer.current, camera));
  secondPass.current.clear = false;

  const alphaPass = useRef(new ShaderPass(AlphaShader));
  //secondComposer.current.addPass(alphaPass.current);

  const finalPass = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      tSecond: { value: null } // set to null initially
    },
    vertexShader: CopyShader.vertexShader,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform sampler2D tSecond;
      varying vec2 vUv;
      void main() {
        vec4 color1 = texture2D(tDiffuse, vUv);
        vec4 color2 = texture2D(tSecond, vUv);
        gl_FragColor = mix(color1, color2, color2.a);
      }
    `
  });
  finalPass.renderToScreen = true;
  firstComposer.current.addPass(firstPass.current);
  firstComposer.current.addPass(finalPass);

  useFrame(({ gl }) => {
    gl.autoClear = false;
    firstComposer.current.render();
    secondComposer.current.render();
    finalPass.material.uniforms.tSecond.value = secondComposer.current.readBuffer.texture; // assign the texture value here
    firstComposer.current.render();
  }, 1);

  return (
    <>
      {createPortal(children, layerContainer.current)}
    </>
  );
};

export { Layer }