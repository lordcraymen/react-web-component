import { Suspense, lazy } from 'react';
import { ModelLoader }  from './ModelLoader';

const Model = ({ src, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], children }) => {
  return (
      <ModelLoader src={src} position={position} rotation={rotation} scale={scale}>
        {children}
      </ModelLoader>
  );
};

export { Model }