import { useEffect, useState, useContext } from 'react'

const HostContext = createContext();

const useHostContext = (property) => {
  const HostState = useContext(HostContext)
  const [value, setValue] = useState(HostState.getState(property));

  useEffect(() => {
    return property && HostState.subscribe(property, setValue);
  }, [property]);

  return value;
};




export { HostContext, useHostContext }
