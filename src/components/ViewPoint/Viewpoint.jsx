import React, { createContext, useContext, useState } from 'react';
import { Euler, Vector3 } from 'three'
import { useThree } from '@react-three/fiber'
import { useSpring } from '@react-spring/three'

const ViewPointContext = createContext({ setDestination:(destination)=>{}, isMoving:false });

const ViewPointProvider = ({ children }) => {
  const { camera } = useThree()
  const [isMoving, setIsMoving] = useState(false)

  const [destination, setDestination] = useState({rotation: camera.rotation, position: camera.position})

  useSpring({
    from: { position: camera.position.toArray(), lookAt: [camera.rotation.x, camera.rotation.y, camera.rotation.z] },
    to: { position: destination.position, rotation: destination.rotation },
    onRest: () => setIsMoving(false),
    onStart: () => setIsMoving(true),
    onChange: ({ value }) => {
      camera.position.set(value.position[0], value.position[1], value.position[2])
      camera.rotation.set(value.lookAt[0], value.lookAt[1], value.lookAt[2])
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

const ViewPoint = ({ position = new Vector3, rotation = new Euler(), children }) => {
  const { setDestination } = useViewpoint();

  const setActive = () => {
    setDestination({position, rotation})
  };

  return typeof children === "function" ? children({setActive}) : children
};



export { ViewPointProvider,  ViewPoint, useViewpoint }