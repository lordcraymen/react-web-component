import React, { createContext, useContext, useState } from 'react';
import { Euler, Vector3 } from 'three'
import { useThree } from '@react-three/fiber'
import { useSpring } from '@react-spring/three'

const ViewPointContext = createContext({ setDestination:(destination)=>{}, isMoving:false });

const ViewPointProvider = ({ children }) => {
  const { camera } = useThree()
  const [isMoving, setIsMoving] = useState(false)

  const [destination, setDestination] = useState({position: camera.position.toArray(), rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z]})

  useSpring({
    from: { position: camera.position.toArray(), rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z] },
    to: { position: destination.position, rotation: destination.rotation },
    onRest: () => setIsMoving(false),
    onStart: () => setIsMoving(true),
    onChange: ({ value }) => {
      camera.position.set(value.position[0], value.position[1], value.position[2])
      camera.rotation.set(value.rotation[0], value.rotation[1], value.rotation[2])
    },
    reset: true,
  });

  return (
    <ViewPointContext.Provider value={{ setDestination, isMoving }}>
      {children}
    </ViewPointContext.Provider>
  );
};

const useViewpoint = () => useContext(ViewPointContext)

const ViewPoint = ({ position = [0, 5, 10], rotation = [0, 5, 10], children }) => {
  const { setDestination } = useViewpoint();

  const setActive = () => {
    setDestination({position, rotation})
  };

  return typeof children === "function" ? children({setActive}) : children
};



export { ViewPointProvider,  ViewPoint, useViewpoint }