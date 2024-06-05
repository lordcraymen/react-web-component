import { useThree, useFrame } from "@react-three/fiber"
import { Depth } from "@react-three/postprocessing"
import { useEffect, useRef } from "react"
import { Mesh, Scene, MeshBasicMaterial, WebGLRenderTarget, RGBAFormat, ShaderMaterial, DepthTexture, EqualDepth, LessEqualDepth, GreaterEqualDepth } from "three"
import { CopyShader } from "three/examples/jsm/shaders/CopyShader"


const DepthMaterial = new ShaderMaterial({
    uniforms: {
    },
    vertexShader: CopyShader.vertexShader,
    fragmentShader: `void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, 0); }`,
    transparent: true,
    depthWrite: true,
    opacity: 0
})


const RenderGroup = ({ children, opacity }) => {
    const TransparencyMaterial = useRef(new MeshBasicMaterial({ color: 0xff0000, opacity, transparent: opacity !== 1, depthFunc: LessEqualDepth}))

    useEffect(() => {
        TransparencyMaterial.current.opacity = opacity
        TransparencyMaterial.current.transparent = opacity !== 1
    }, [opacity])

    return <>
        <MaterialOverride material={DepthMaterial}>{children}</MaterialOverride>
        <MaterialOverride material={TransparencyMaterial.current}>{children}</MaterialOverride>
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