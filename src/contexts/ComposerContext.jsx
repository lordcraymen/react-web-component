import React, { createContext, useContext, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';

// Erstellen Sie den ComposerContext
export const ComposerContext = createContext();

// Erstellen Sie den Provider
export const ComposerProvider = ({ children }) => {
    const layers = useRef(new Set());

    useFrame(({scene,camera,gl}) => {
        gl.render(scene, camera);
        targets.forEach((target) => { gl.render(target.scene, target.camera || camera); });
    },1);

    return (
        <ComposerContext.Provider value={{ layers: layers.current }}>
            {children}
        </ComposerContext.Provider>
    );
};

// Erstellen Sie den Hook
export const useComposer = (Objects, Camera) => {
    const { camera: defaultCamera } = useThree();
    const { layers } = useContext(ComposerContext);

    useEffect(() => {
        const layer = { scene: new Scene(Objects), camera: Camera }
        layers.add(layer);
        return () => { layers.delete(layer) }
    }, [Objects, Camera]);


    return { objects, camera };
};