import { ColorDepthEffect } from "postprocessing";
import { wrapEffect } from "@react-three/postprocessing";
const PassThrough = wrapEffect(ColorDepthEffect);
export {
  PassThrough
};