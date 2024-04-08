import React, { createContext, useContext, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { useSpring } from '@react-spring/three';

const ViewPoint = ({ position, target }) => {
  const { camera, gl } = useThree(); // Access the Three.js camera and renderer from the context

  // Animate camera position
  const props = useSpring({
    to: { position: position, lookAt: target },
    from: { position: camera.position.toArray(), lookAt: [camera.rotation.x, camera.rotation.y, camera.rotation.z] },
    reset: true,
    onRest: () => {
      // This function is called when the animation is complete.
      // You could re-enable controls or perform other actions here.
    },
  });

  // Apply animated values to camera
  props.position.start((p) => camera.position.set(...p));
  props.lookAt.start((p) => camera.lookAt(...p));

  return null; // This component does not render anything itself
};

const ViewPointContext = createContext({});

const ViewPointProvider = ({ children }) => {
  const [target, setTarget] = useState([0, 0, 0]); // Initial target
  const [isAnimating, setIsAnimating] = useState(false);

  const { position } = useSpring({
    position: target,
    onRest: () => setIsAnimating(false),
    onStart: () => setIsAnimating(true),
    // Additional spring config here if needed
  });

  const updateTarget = (newTarget, callback) => {
    setIsAnimating(true);
    setTarget(newTarget);
    // Callback could be called on onRest but make sure it's managed properly
  };

  return (
    <ViewPointContext.Provider value={{ position, updateTarget, isAnimating }}>
      {children}
    </ViewPointContext.Provider>
  );
};

const useViewpoint = () => useContext(ViewPointContext);


export { ViewPointProvider,  ViewPoint, useViewpoint }