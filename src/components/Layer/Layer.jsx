import { useRef } from 'react';
import { useThree, createPortal, useFrame } from '@react-three/fiber';
import { Scene, AmbientLight } from 'three';
import { CustomBlending, SrcAlphaFactor, OneMinusSrcAlphaFactor, AddEquation } from 'three';

const Layer = ({ children }) => {

  const { scene, size, gl, camera } = useThree();

  const layerContainer = useRef(new Scene().add(new AmbientLight(0xffffff, 1)));

  useFrame(({gl}) => {
    console.log(gl)
    // Enable blending
    //gl.state.enable(gl.BLEND);
    // Set blending to custom
    //gl.state.setBlending(CustomBlending);
    // Set blend equation
    //gl.state.buffers.color.setBlendEquation(AddEquation);
    // Set source blend factor (half of the source's alpha)
    //gl.state.buffers.color.setBlendSrc(SrcAlphaFactor);
    // Modify destination blend factor to factor in the constant opacity
    //gl.state.buffers.color.setBlendDst(OneMinusSrcAlphaFactor);
    gl.render(layerContainer.current, camera);
  },1);


  return (
    <>
      {createPortal(children, layerContainer.current)}
    </>
  );
};

export { Layer };;