import { useThree, useFrame } from "@react-three/fiber"
import { Depth } from "@react-three/postprocessing"
import { useEffect, useRef, useMemo } from "react"
import { UnsignedShortType, Mesh, Scene, MeshBasicMaterial, WebGLRenderTarget, RGBAFormat, ShaderMaterial, DepthTexture, EqualDepth, LessEqualDepth, GreaterEqualDepth } from "three"
import { CopyShader } from "three/examples/jsm/shaders/CopyShader"





const RenderGroup = ({ children, opacity }) => {

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
                float depthFromTexture = readDepth(gl_FragCoord.xy / vec2(textureSize(depthTexture, 0)));
                float visibility = step(currentDepth, depthFromTexture);
                if (visibility < 0.5) discard;
                gl_FragColor = vec4(1.0, 1.0, 1.0, opacity); // Use the opacity passed to the shader
            }
        `,
        transparent: true,
        depthWrite: true,
    }))

    const scene = useThree(state => state.scene)

    const isolatedScene = useMemo(() => { const sc = scene.clone(); sc.attach(children); return sc }, [scene,children])

    const renderTarget = useMemo(() => { 
        const dt = new DepthTexture(1, 1)
        dt.type = UnsignedShortType
        const rt = new WebGLRenderTarget(1, 1, {
            format: RGBAFormat,
            depthTexture: dt,
            depthBuffer: true
        }) 
        return rt
    }, [])

    useEffect(() => {
        DepthMaterial.current.opacity = opacity
        DepthMaterial.current.transparent = opacity !== 1
    }, [opacity])

    useFrame(({ gl, camera }) => {
        gl.autoClear = false
        gl.setRenderTarget(renderTarget)
        gl.clear()
        gl.render(isolatedScene, camera)
        gl.autoClear = true
        DepthMaterial.current.uniforms.diffuseTexture.value = renderTarget.texture
        DepthMaterial.current.uniforms.depthTexture.value = renderTarget.depthTexture
    })

    return <>
        <MaterialOverride material={DepthMaterial.current}>{children}</MaterialOverride>
    </>
}


const MaterialOverride = ({ children, material }) => {
  const groupRef = useRef();

  useEffect(() => {
    if (groupRef.current) {
        groupRef.current.traverse(object => { object.overrideMaterial = material
            if(object.material) {
                object.material.transparent = material.transparent
                object.material.depthFunc = material.depthFunc
            } });
    }
  }, [children, material]);

  return <group ref={groupRef}>{children}</group>;
};
export { RenderGroup }