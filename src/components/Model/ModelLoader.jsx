import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { USDZLoader } from 'three/examples/jsm/loaders/USDZLoader';

const ModelLoader = ({ src, position, rotation, scale, children }) => {
  const extension = src.split('.').pop();
  let Loader;
  
  switch (extension) {
    case 'glb':
    case 'gltf':
      Loader = GLTFLoader;
      break;
    case 'usdz':
      Loader = USDZLoader;
      break;
    default:
      return null;
  }
  
  const model = useLoader(Loader, src);

  console.log(model)
  
  return <primitive object={model.children[0].clone()} {...{position,rotation,scale}}>{children}</primitive>;
};

export default ModelLoader