import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';

const Layer = ({ children, visible = true, layernumber=0 }) => {
  /*
  const { camera } = useThree();
  visible && camera.layers.enable(layernumber);

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

  return visible ? <group layers={[layernumber]}>{children}</group> : null;
};

export { Layer };