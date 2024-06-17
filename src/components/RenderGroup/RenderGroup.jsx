/*
import { useThree, useFrame, Canvas, createPortal} from "@react-three/fiber"
import { useEffect, useRef, useMemo, useState } from "react"
import { UnsignedShortType, WebGLRenderer, WebGLRenderTarget, RGBAFormat, ShaderMaterial, DepthTexture, Texture, Vector2 } from "three"
import { CopyShader } from "three/examples/jsm/shaders/CopyShader"


const RenderTargetComponent = ({ renderTarget }) => {
  const [container, setContainer] = useState(null);

  useEffect(() => {
    // Öffnen Sie ein neues Fenster und speichern Sie das Dokument des Fensters
    const popupWindow = window.open("", "_blank");
    setContainer(popupWindow.document.body);

    // Schließen Sie das Fenster, wenn die Komponente unmountet wird
    return () => popupWindow.close();
  }, []);

  // Rendern Sie das Portal nur, wenn der Container definiert ist
  return container
    ? createPortal(
        <Canvas>
          <mesh>
            <planeBufferGeometry args={[2, 2]} />
            <meshBasicMaterial map={renderTarget.texture} />
          </mesh>
        </Canvas>,
        container
      )
    : null;
};



const RenderGroup = ({ children, opacity }) => {

    const secondRenderer = useRef(new WebGLRenderer());

    const groupRef = useRef()

    const DepthMaterial = useRef(new ShaderMaterial({
        uniforms: {
            diffuseTexture: { value: null },
            depthTexture: { value: null },
            opacity: { value: 1.0 }
        },
        vertexShader: CopyShader.vertexShader,
        fragmentShader: `
            uniform sampler2D diffuseTexture;
            uniform sampler2D depthTexture;
            uniform float opacity;
            varying vec2 vUv;
        
            void main() {
                float currentDepth = gl_FragCoord.z / gl_FragCoord.w;
                float depthFromTexture = texture2D(depthTexture, vUv).r;
                float visibility = step(currentDepth, depthFromTexture);
                //if (visibility < 0.5) discard;
                //gl_FragColor = texture2D(diffuseTexture, vUv);

                //gl_FragColor = texture2D(depthTexture, vUv);
                gl_FragColor = vec4(depthFromTexture, depthFromTexture, depthFromTexture, opacity); // Use the opacity passed to the shader
            }
        `,
        transparent: true,
        depthWrite: true,
        name: 'DepthMaterial'
    }))

    const size = useThree(({ size }) => size)

    const renderTarget = useMemo(() => { 
        const dt = new DepthTexture(size.width, size.height)
        dt.type = UnsignedShortType
        const rt = new WebGLRenderTarget(size.width, size.height, {
            format: RGBAFormat,
            depthTexture: dt,
            depthBuffer: true
        }) 

        secondRenderer.current.setRenderTarget(rt)
        return rt
    }, [size])

    useFrame(({ gl, scene, camera }) => {
    DepthMaterial.current.opacity = opacity;
    DepthMaterial.current.transparent = opacity !== 1;


    const prevOverrideMaterial = groupRef.current.overrideMaterial;
    groupRef.current.overrideMaterial = null;
    secondRenderer.current.render(scene, camera);
    groupRef.current.overrideMaterial = prevOverrideMaterial;

    DepthMaterial.current.uniforms.diffuseTexture.value = renderTarget.texture;
    DepthMaterial.current.uniforms.depthTexture.value = renderTarget.depthTexture;
});

    return <>
    <group ref={groupRef} overrideMaterial={DepthMaterial.current}>{children}</group>
    <mesh>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial map={renderTarget.texture} />
    </mesh>
    </>

}

*/

import {
    useEffect,
    useRef,
    useMemo
} from 'react';
import {
    useThree,
    useFrame
} from '@react-three/fiber';
import {
    useFBO
} from '@react-three/drei';
import {
    Color,
    Vector2,
    WebGLRenderTarget,
    OrthographicCamera,
    Scene,
    Mesh,
    PlaneGeometry,
    MeshBasicMaterial,
    ShaderMaterial,
    DepthTexture,
    UnsignedShortType,
    FloatType,
    RGBAFormat,
    NearestFilter,
    GreaterEqualDepth,
    NotEqualDepth
} from 'three';
import {
    CopyShader
} from "three/examples/jsm/shaders/CopyShader"
import {
    NullShader
} from './NullShader';
import {
    SkipRenderMaterial
} from '../../shaders/SkipRenderMaterial';


let renderOffset = 100;

const RenderGroup = ({
    children,
    opacity,
    zindex = 0
}) => {
    const groupRef = useRef();

    const renderTarget = useMemo(() => {
        const depthBuffer = new DepthTexture(1,1)
        return new WebGLRenderTarget(1,1, { depthBuffer: true, depthTexture: depthBuffer, name: 'DepthRenderTarget' })
    }, [])

    useEffect(() => () => { renderTarget.dispose() }, [renderTarget])

    const DepthMaterial = useRef(new ShaderMaterial({
        uniforms: {
            diffuseTexture: {
                value: null
            },
            depthTexture: {
                value: null
            },
            opacity: {
                value: 1.0
            },
            resolution: {
                value: new Vector2()
            }
        },
        vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
        fragmentShader: `
        uniform sampler2D diffuseTexture;
        uniform sampler2D depthTexture;
        uniform float opacity;
        uniform vec2 resolution;
        varying vec2 vUv;

        void main() {
            

            float depth = texture2D(depthTexture, gl_FragCoord.xy / resolution).r / gl_FragCoord.w;
            float currentDepth = (gl_FragCoord.z / gl_FragCoord.w) - 0.001;
            if (currentDepth > depth) {
            discard;
            }
            vec4 texel = texture2D(diffuseTexture, gl_FragCoord.xy / resolution);
            gl_FragColor = vec4(texel.rgb,texel.a * opacity);

        }
    `,
        depthWrite: true,
        depthTest: true,
        name: 'DepthMaterial'
    }))

    DepthMaterial.current.opacity = opacity;
    DepthMaterial.current.transparent = opacity !== 1;
    DepthMaterial.current.uniforms.diffuseTexture.value = renderTarget.texture;
    DepthMaterial.current.uniforms.depthTexture.value = renderTarget.depthTexture;
    DepthMaterial.current.uniforms.opacity.value = opacity;

    useFrame(({
        gl,
        scene,
        camera,
        size
    }) => {
        
        const ratio = gl.getPixelRatio();
        renderTarget.setSize(size.width * ratio, size.height * ratio);
        DepthMaterial.current.uniforms.resolution.value.set(size.width * ratio, size.height * ratio);

        gl.setRenderTarget(renderTarget);

        const prevSceneOverrideMaterial = scene.overrideMaterial;

        scene.traverse(obj => {
            if (!obj.isScene) obj.overrideMaterial = SkipRenderMaterial;
        });

        groupRef.current.traverse(obj => {
            obj.overrideMaterial = null;
        });

        gl.render(scene, camera);
        gl.setRenderTarget(null);

        scene.overrideMaterial = prevSceneOverrideMaterial;

        scene.traverse(obj => {
            if (!obj.isScene) obj.overrideMaterial = null
        });

        groupRef.current.traverse(obj => { 
            obj.overrideMaterial = DepthMaterial.current
            obj.renderOrder = zindex 
        });
});

    return <><group ref = {groupRef} >{children}</group></>;
};

export {
    RenderGroup
}