import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

let LayerCounter = 0;

const Layer = ({ children, visible = true, opacity=1 }) => {
  /*
  const { camera } = useThree();
  const layernumber = useRef(LayerCounter++).current;

  console.log("layer", layernumber, visible);
  useEffect(() => {
    if (visible) {
      console.log("enable layer", layernumber);
      camera.layers.enable(layernumber);
    } else {
      console.log("disable layer", layernumber);
      camera.layers.disable(layernumber);
    }
    return () => {
      camera.layers.disable(layernumber);
    };
  }, [camera, visible, layernumber]);
  */

  return visible ? {children} : null;
};

export { Layer };