import { useCallback, useEffect, useRef } from 'react';

const useLoopWhileTrue = (callback) => {
    const active = useRef(false);
    const frameRef = useRef(-1);
  
    const loop = useCallback(() => {
      if (active.current && (active.current = callback())) {
        frameRef.current = requestAnimationFrame(loop);
      }
    }, [callback]);
  
    useEffect(() => () => { cancelAnimationFrame(frameRef.current) }, []);
  
    return () => {
      if (!active.current) {
        active.current = true;
        loop();
      }
    }
  };
  
  export { useLoopWhileTrue }