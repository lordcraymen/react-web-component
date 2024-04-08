import React, { createContext, useContext, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { useSpring } from '@react-spring/three';

const ViewPointContext = createContext({ updateViewPoint:(position,target)=>{}, isAnimating:false });

const ViewPointProvider = ({ children }) => {
  const { camera } = useThree();
  const [isAnimating, setIsAnimating] = useState(false);

  // You may need to adjust the initial value to match your camera's initial position
  const [target, setTarget] = useState(camera.position.toArray());
  const [lookAt, setLookAt] = useState([0, 0, 0]); // Default lookAt target

  useSpring({
    to: { position: target, lookAt: lookAt },
    from: { position: camera.position.toArray(), lookAt: [camera.rotation.x, camera.rotation.y, camera.rotation.z] },
    onRest: () => setIsAnimating(false),
    onStart: () => setIsAnimating(true),
    onChange: ({ value }) => {
      camera.position.set(...value.position);
      camera.lookAt(...value.lookAt);
    },
    reset: true,
  });

  const updateViewPoint = (newTarget, newLookAt, callback) => {
    setIsAnimating(true);
    setTarget(newTarget);
    setLookAt(newLookAt);
  };

  return (
    <ViewPointContext.Provider value={{ updateViewPoint, isAnimating }}>
      {children}
    </ViewPointContext.Provider>
  );
};

const useViewpoint = () => useContext(ViewPointContext);

const ViewPoint = ({ position, target, children }) => {
  const { updateViewPoint } = useViewpoint();

  const setActive = () => {
    updateViewPoint(position, target);
  };

  return typeof children === "function" ? children({setActive}) : children
};



export { ViewPointProvider,  ViewPoint, useViewpoint }