import React, { createContext, useContext, useEffect, useRef, useMemo, useState } from 'react';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { Scene, Camera, AmbientLight, WebGLRenderTarget } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { useFrame, useThree } from '@react-three/fiber';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';


const CompositionShaderFactory = (layers = []) => {
    const shader = {
        uniforms: {
            'tDiffuse': { value: null },
          // Create a uniform for each render target in the group
          ...layers.reduce((uniforms, target, index) => {
            uniforms[`tDiffuse${index}`] = { value: null };
            uniforms[`tAlpha${index}`] = { value: 0.0 };
            return uniforms;
          }, {})
        },
        vertexShader: CopyShader.vertexShader,
        fragmentShader: `
          uniform sampler2D tDiffuse;
          ${layers.map((_, index) => `uniform sampler2D tDiffuse${index};`).join('\n')}
          ${layers.map((_, index) => `uniform float tAlpha${index};`).join('\n')}
          varying vec2 vUv;
          void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            ${layers.map((_, index) => `color = mix(color, texture2D(tDiffuse${index}, vUv), texture2D(tDiffuse${index}, vUv).a * tAlpha${index} );`).join('\n')}
            gl_FragColor = color;
          }
        `
      }
    return new ShaderPass(shader);
}

// Erstellen Sie den ComposerContext

type Layer = {scene:Scene,opacity:1};


const LayerContext = createContext<{ setLayers: React.Dispatch<React.SetStateAction<Set<Layer>>> }>({} as any);

// Erstellen Sie den Provider
const LayerProvider = ({ children }) => {
    const gl = useThree(state => state.gl);
    const size = useThree(state => state.size);
    const scene = useThree(state => state.scene);
    const camera = useThree(state => state.camera);

    const [layerStack, setLayers] = useState<Set<Layer>>(new Set())

    const Composer = useMemo(() => { 
        const Composer = new EffectComposer(gl); 
        Composer.setSize(size.width,size.height); 
        return Composer },
    [gl,size]);

    const shaderPass = useMemo(() => CompositionShaderFactory(Array.from(layerStack.values())),[layerStack])
    shaderPass.renderToScreen = true;

    const renderTarget = useMemo(() => new WebGLRenderTarget(size.width, size.height),[size])

    useEffect(() => {
        const firstPass = new RenderPass(scene,camera);
       firstPass.clearDepth = false;
       firstPass.renderToScreen = false;
        Composer.addPass(firstPass);
        Composer.addPass(shaderPass);
        return () => { 
            Composer.removePass(firstPass)
            Composer.removePass(shaderPass) }; 
    }, [layerStack,shaderPass,Composer,scene,camera]);

    useFrame(({gl, camera}) => {
        if(layerStack.size !== 0) {
            gl.setRenderTarget(renderTarget);
            let index = 0
            layerStack.forEach(layer => {
                gl.render(layer.scene, camera);
                shaderPass.uniforms[`tDiffuse${index}`].value = renderTarget.texture;
                shaderPass.uniforms[`tAlpha${index}`].value = layer.opacity || 1;
            });
            gl.setRenderTarget(null);
        }
        Composer.render();
    },1);

    return (
        <LayerContext.Provider value={{ setLayers }}>
            {children}
        </LayerContext.Provider>
    );
};

// Erstellen Sie den Hook
const useLayer = (opacity) => {
    const { setLayers } = useContext(LayerContext);
    const scene = useRef(new Scene().add(new AmbientLight(0xffffff, 3)));

    useEffect(() => {
        const layer = { scene: scene.current, opacity };
        setLayers(layers => new Set((layers.add(layer),layers)));
        return () => {
            setLayers(layers => new Set((layers.delete(layer),layers)))
        };
    }, [opacity, setLayers]);
    
    return scene.current;
};

export { LayerProvider, useLayer}