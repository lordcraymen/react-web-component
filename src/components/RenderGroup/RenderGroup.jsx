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

import { useEffect, useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useFBO } from '@react-three/drei';
import { Color, Vector2, WebGLRenderTarget, OrthographicCamera, Scene, Mesh, PlaneGeometry, MeshBasicMaterial, ShaderMaterial, DepthTexture,UnsignedShortType,FloatType, RGBAFormat } from 'three';
import { CopyShader } from "three/examples/jsm/shaders/CopyShader"
import { NullShader } from './NullShader';
import { SkipRenderMaterial } from '../../shaders/SkipRenderMaterial';


const zChannel = `
        uniform sampler2D diffuseTexture;
        uniform sampler2D depthTexture;
        uniform float opacity;
        uniform vec2 resolution;
        varying vec2 vUv;
        varying vec2 vHighPrecisionZW;

        void main() {
            vec2 uv = gl_FragCoord.xy / resolution;
            float currentDepth = (vHighPrecisionZW[0] + 0.1) / vHighPrecisionZW[1];
            float depthFromTexture = texture2D(depthTexture, uv).r;
            float difference = currentDepth - depthFromTexture;

    vec3 color;
    if (difference > 0.0) {
        // Positive difference, output red
        color = vec3(1.0, 0.0, 0.0);
    } else if (difference < 0.0) {
        // Negative difference, output green
        color = vec3(0.0, 1.0, 0.0);
    } else {
        // No difference, output black
        color = vec3(0.0, 0.0, 0.0);
    }

    gl_FragColor = vec4(color, 1.0);
}
        `

const RenderGroup = ({children,opacity}) => {
  const groupRef = useRef();

  const { gl, size, scene } = useThree();

  const depthTexture = useMemo(() => new DepthTexture(size.width, size.height), [size]);
  depthTexture.type = FloatType

  const renderTarget = useFBO(size.width, size.height, { format: RGBAFormat, depthBuffer: true, depthTexture:depthTexture, stencilBuffer: false})


  const DepthMaterial = useRef(new ShaderMaterial({
        uniforms: {
            diffuseTexture: { value: null },
            depthTexture: { value: null },
            opacity: { value: 1.0 },
            resolution: { value: new Vector2() }
        },
        vertexShader: `
        varying vec2 vUv;
        varying vec2 vHighPrecisionZW;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vHighPrecisionZW = gl_Position.zw;
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        texture2D diffuseTexture;
        texture2D depthTexture;
        uniform float opacity;
        uniform vec2 resolution;


        void main() {
            gl_FragColor = texture2D(diffuseTexture, vUv)
        }
    `,
        transparent: true,
        depthWrite: true,
        depthTest: false,
        opacity:1,
        name: 'DepthMaterial'
    }))


  const mesh = useRef(new Mesh(new PlaneGeometry(2, 2), DepthMaterial.current));

  mesh.current.position.x = -2;
  mesh.current.position.x = 2;

  DepthMaterial.current.opacity = opacity;
  DepthMaterial.current.transparent = opacity !== 1;
  DepthMaterial.current.uniforms.diffuseTexture.value = renderTarget.texture;
  DepthMaterial.current.uniforms.depthTexture.value = renderTarget.depthTexture;
  DepthMaterial.current.uniforms.opacity.value = opacity;
  
  const SimpleRedMaterial = new MeshBasicMaterial({color: 0xff0000});

  console.log(renderTarget.width, renderTarget.height);

  useEffect(() => {
    scene.add(mesh.current);
    return () => { scene.remove(mesh.current) };
  }, [scene]);

  useFrame(({gl,scene,camera}) => {
    DepthMaterial.current.uniforms.resolution.value.set(renderTarget.width, renderTarget.height);
    
    gl.setRenderTarget(renderTarget);

    const prevSceneOverrideMaterial = scene.overrideMaterial;
    scene.overrideMaterial = SkipRenderMaterial;

    groupRef.current.traverse(obj => { obj.overrideMaterial = null; });
    
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    scene.overrideMaterial = prevSceneOverrideMaterial;

    groupRef.current.traverse(obj => obj.overrideMaterial = DepthMaterial.current);
    
  });

  return <group ref={groupRef}>{children}</group>;
};

export { RenderGroup }