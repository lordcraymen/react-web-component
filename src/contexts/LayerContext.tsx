import React, { createContext, useContext, useEffect, useRef, useMemo, useState } from 'react';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { Scene, Camera, AmbientLight, WebGLRenderTarget, DepthTexture, Color } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { useFrame, useThree } from '@react-three/fiber';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';
import { useRenderTarget } from '../hooks/useRenderTarget';


const CompositionShaderFactory = (layers = []) => {
    const shader = {
        uniforms: {
            'tDiffuse': { value: null },
            'tDepth': { value: null },
            'opacity': { value: 1.0 },
            // Create a uniform for each render target in the group
            ...layers.reduce((uniforms, target, index) => {
                uniforms[`tDiffuse${index}`] = { value: null };
                uniforms[`tDepth${index}`] = { value: null };
                uniforms[`tAlpha${index}`] = { value: 0.0 };
                return uniforms;
            }, {})
        },
        vertexShader: CopyShader.vertexShader,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform sampler2D tDepth;
            uniform float opacity;
            ${layers.map((_, index) => `uniform sampler2D tDiffuse${index};`).join('\n')}
            ${layers.map((_, index) => `uniform sampler2D tDepth${index};`).join('\n')}
            ${layers.map((_, index) => `uniform float tAlpha${index};`).join('\n')}
            varying vec2 vUv;
            void main() {
                vec4 color = texture2D(tDiffuse, vUv);
                vec4 depth = texture2D(tDepth, vUv);
                
                vec4 layerColor;
                vec4 layerDepth;
                float depthCheck;
                ${layers.map((_, index) => {
                    return `
                        layerColor = texture2D(tDiffuse${index}, vUv);
                        layerDepth = texture2D(tDepth${index}, vUv);
                        depthCheck = step(layerDepth.r, depth.r);
                        color = mix(color, layerColor, layerColor.a * tAlpha${index} * depthCheck);
                        depth = texture2D(tDepth${index}, vUv);
                    `;
                }).join('\n')}
                
                 gl_FragColor = color;
            }
        `
    }
    return new ShaderPass(shader);
}

// Erstellen Sie den ComposerContext

type Layer = {
    scene:Scene,
    opacity:number,
    mode:"2D" | "3D",
    renderTarget:WebGLRenderTarget
};


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
        const basePass = new RenderPass(scene,camera);
        basePass.clearDepth = false;
        Composer.addPass(basePass);
        Composer.renderTarget1.depthBuffer = true
        Composer.renderTarget1.depthTexture = new DepthTexture(1,1)
        return Composer },
    [gl,size, scene, camera]);

    const shaderPass = useMemo(() => CompositionShaderFactory(Array.from(layerStack.values())),[layerStack])

    useEffect(() => {
        Composer.addPass(shaderPass);
        return () => { 
            Composer.removePass(shaderPass)
            shaderPass.dispose(); }; 
    }, [shaderPass,Composer]);

    useFrame(({gl, camera, size}) => {
        
        if(layerStack.size > 0) {
            let index = 0
            layerStack.forEach(layer => {
                layer.renderTarget.setSize(size.width, size.height);
                layer.renderTarget.depthBuffer = true;
                
                gl.setRenderTarget(layer.renderTarget);
                gl.render(layer.scene, camera);
                shaderPass.uniforms[`tDiffuse${index}`] && (shaderPass.uniforms[`tDiffuse${index}`].value = layer.renderTarget.texture); 
                shaderPass.uniforms[`tDepth${index}`] && (shaderPass.uniforms[`tDepth${index}`].value = layer.renderTarget.depthTexture);
                shaderPass.uniforms[`tAlpha${index}`] && (shaderPass.uniforms[`tAlpha${index}`].value = layer.opacity || 1);
                index++;
            });
            shaderPass.uniforms['tDepth'].value = Composer.renderTarget1.depthTexture;
            gl.setRenderTarget(null);
        }
        shaderPass.uniforms['tDepth'].value = Composer.renderTarget1.depthTexture;
        Composer.render();
    },1);

    return (
        <LayerContext.Provider value={{ setLayers }}>
            {children}
        </LayerContext.Provider>
    );
};

type LayerProps = {
    opacity:number,
    mode:"2D" | "3D"
}

// Erstellen Sie den Hook
const useLayer = ({opacity=1,mode="2D"}:LayerProps) => {
    const { setLayers } = useContext(LayerContext);
    const scene = useRef(new Scene().add(new AmbientLight(0xffffff, 3))).current;
    const renderTarget = useRenderTarget({mode})
    
    useEffect(() => {
        const layer = { opacity, mode, scene, renderTarget };
        setLayers(layers => new Set((layers.add(layer),layers)));
        return () => { setLayers(layers => new Set((layers.delete(layer),layers))) };
    }, [opacity, setLayers, renderTarget, scene]);
    
    return scene;
};

export { LayerProvider, useLayer}