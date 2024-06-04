import { useThree, useFrame } from "@react-three/fiber"
import { Depth } from "@react-three/postprocessing"
import { useEffect, useRef } from "react"
import { Mesh, Scene, MeshBasicMaterial, WebGLRenderTarget, RGBAFormat, ShaderMaterial, DepthTexture } from "three"
import { CopyShader } from "three/examples/jsm/shaders/CopyShader"


const DepthMaterial = new ShaderMaterial({
    uniforms: {
    },
    vertexShader: CopyShader.vertexShader,
    fragmentShader: ` void main() {}`,
    transparent: false,
    depthTest: false,
    depthWrite: false,
})

const TransparentShaderMaterial = new ShaderMaterial({
    uniforms: {
        tDiffuse: { value: null },
        opacity: { value: 1 }
    },
    vertexShader: CopyShader.vertexShader,
    fragmentShader: `
    uniform float opacity;
    uniform sampler2D tDiffuse;
    void main() {
        //vec4 texel = texture2D(tDiffuse, gl_FragCoord.xy / resolution.xy);
        //gl_FragColor = vec4(texel.rgb, texel.a * opacity);
    }
    `,
    transparent: true,
    depthTest: true,
    depthWrite: true,
    depthFunc: 1
})


const RenderGroup = ({ children, opacity }) => {
  const groupRef = useRef();

  useEffect(() => {
    if (groupRef.current) {
        groupRef.current.visible = (opacity !== 0)
        if(!groupRef.current.visible) return
        const BasicMaterial = new MeshBasicMaterial({ color: 0xff0000, opacity, transparent: opacity !== 1, depthFunc: 2})
        groupRef.current.traverse(object => { object.overrideMaterial = BasicMaterial;
            if(object.material) {
                object.material.transparent = BasicMaterial.transparent;
                object.material.opacity = 1;
                object.material.depthFunc = 1
            } });
    }
  }, [children, opacity]);

  return <group ref={groupRef}>{children}</group>;
};
export { RenderGroup }