import React, { createContext, useContext } from 'react';
import { useThree } from '@react-three/fiber';

const InteractionEventContext = createContext({});

const InteractionEventContextProvider = ({ children }) => {
  const { gl } = useThree();
  return (
    <InteractionEventContext.Provider value={gl}>
      {children}
    </InteractionEventContext.Provider>
  );
};

const useInteractionEventContext = () => useContext(InteractionEventContext);

export { InteractionEventContextProvider, useInteractionEventContext };
