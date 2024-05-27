import React, { createContext, useContext, useEffect, useRef, useMemo } from 'react';
import { Scene, AmbientLight } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { useFrame, useThree } from '@react-three/fiber';

// Erstellen Sie den ComposerContext

const layerStack = new Set()

const LayerContext = createContext({layers: layerStack});

// Erstellen Sie den Provider
const LayerProvider = ({ children }) => {
    const gl = useThree(state => state.gl);
    const size = useThree(state => state.size);
    const scene = useThree(state => state.scene);
    const camera = useThree(state => state.camera);

    const Composer = useMemo(() => { 
        const Composer = new EffectComposer(gl); 
        Composer.setSize(size.width,size.height); 
        return Composer },
    [gl,size]);

    useEffect(() => {
        const firstPass = new RenderPass(scene,camera);
        firstPass.clearDepth = false;
        firstPass.renderToScreen = false;
        Composer.addPass(firstPass);
        layerStack.forEach(layer => {
            const pass = new RenderPass(layer.scene,layer.camera || camera);
            pass.clear = false;
            Composer.addPass(pass)}
        ); 
    }, [Composer,scene,camera]);

    useFrame(() => {
        Composer.render();
    },1);

    return (
        <LayerContext.Provider value={{ layers: layerStack }}>
            {children}
        </LayerContext.Provider>
    );
};

// Erstellen Sie den Hook
const useLayer = (camera) => {
    const { layers } = useContext(LayerContext);
    const scene = useRef(new Scene().add(new AmbientLight(0xffffff, 3)));

    useEffect(() => {
        const layer = { scene: scene.current, camera};
        layers.add(layer);
        return () => { layers.delete(layer) }
    }, [camera]);
    
    return scene.current;
};

export { LayerProvider, useLayer}