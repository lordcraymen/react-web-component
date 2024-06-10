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
import { Color, Vector2, WebGLRenderTarget, OrthographicCamera, Scene, Mesh, PlaneGeometry, MeshBasicMaterial, ShaderMaterial, DepthTexture,UnsignedShortType, RGBAFormat } from 'three';
import { CopyShader } from "three/examples/jsm/shaders/CopyShader"
import { NullShader } from './NullShader';

const RenderGroup = ({children,opacity}) => {
  const groupRef = useRef();

  const { gl, size, scene } = useThree();

  /*
  const renderTarget = useMemo(() => { 
        const dt = new DepthTexture(size.width, size.height)
        dt.type = UnsignedShortType
        const rt = new WebGLRenderTarget(size.width, size.height, {
            format: RGBAFormat,
            depthTexture: dt,
            depthBuffer: true
        }) 
        return rt
    }, [size])
    */

    const renderTarget = useFBO(size.width, size.height, { format: RGBAFormat, depthBuffer: true, depthTexture: new DepthTexture(size.width, size.height,UnsignedShortType), stencilBuffer: false})


  const DepthMaterial = useRef(new ShaderMaterial({
        uniforms: {
            diffuseTexture: { value: null },
            depthTexture: { value: null },
            opacity: { value: 1.0 },
            resolution: { value: new Vector2() }
        },
        vertexShader: CopyShader.vertexShader,
        fragmentShader: `
            uniform sampler2D diffuseTexture;
    uniform sampler2D depthTexture;
    uniform float opacity;
    uniform vec2 resolution;
    varying vec2 vUv;

    void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        //float currentDepth = gl_FragCoord.z / gl_FragCoord.w;
        //float depthFromTexture = texture2D(depthTexture, uv).r;
        //float visibility = step(currentDepth, depthFromTexture);
        //vec3 color = vec3(uv.x,uv.y, 0.5);  // Konvertieren Sie die normalisierten UV-Koordinaten in eine RGB-Farbe
        gl_FragColor = texture2D(diffuseTexture, vUv);
    }
        `,
        transparent: true,
        depthWrite: true,
        name: 'DepthMaterial'
    }))


  const mesh = useRef(new Mesh(new PlaneGeometry(2, 2), DepthMaterial.current));

  mesh.current.position.x = -2;
  mesh.current.position.x = 2;

  DepthMaterial.current.opacity = opacity;
  DepthMaterial.current.transparent = opacity !== 1;
  DepthMaterial.current.uniforms.diffuseTexture.value = renderTarget.texture;
  DepthMaterial.current.uniforms.depthTexture.value = renderTarget.depthTexture;
  
  const SimpleRedMaterial = new MeshBasicMaterial({color: 0xff0000});

  console.log(renderTarget.width, renderTarget.height);

  useEffect(() => {
    scene.add(mesh.current);
    return () => { scene.remove(mesh.current) };
  }, [scene]);

  useFrame(({gl,scene,camera}) => {
    DepthMaterial.current.uniforms.resolution.value.set(renderTarget.width, renderTarget.height);
    mesh.current.visible = false;
    gl.setRenderTarget(renderTarget);
    scene.overrideMaterial = NullShader;
    groupRef.current.traverse(obj => obj.overrideMaterial = obj.material );
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    groupRef.current.traverse(obj => obj.overrideMaterial = DepthMaterial.current);
    scene.overrideMaterial = null;
    mesh.current.visible = true;
  });

  return <group ref={groupRef}>{children}</group>;
};

export { RenderGroup }