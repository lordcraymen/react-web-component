import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Scene, AmbientLight } from 'three';
import { useFrame } from '@react-three/fiber';

// Erstellen Sie den ComposerContext

const layerStack = new Set()

const LayerContext = createContext({layers: layerStack});

// Erstellen Sie den Provider
const LayerProvider = ({ children }) => {

    useFrame(({scene,camera,gl}) => {
        gl.render(scene, camera);
        layerStack.forEach((target) => { gl.render(target.scene, target.camera || camera); });
    },1);

    return (
        <LayerContext.Provider value={{ layers: layerStack }}>
            {children}
        </LayerContext.Provider>
    );
};

// Erstellen Sie den Hook
const useLayer = (objects = [], camera) => {
    const { layers } = useContext(LayerContext);
    const scene = useRef(new Scene().add(new AmbientLight(0xffffff, 3)));

    useEffect(() => {
        if(!objects.length) return;
        const layer = { scene: scene.current, camera};
        objects.forEach((object) => layer.scene.add(object));
        layers.add(layer);
        return () => { layers.delete(layer) }
    }, [objects, camera]);
    
    return scene.current;
};

export { LayerProvider, useLayer}