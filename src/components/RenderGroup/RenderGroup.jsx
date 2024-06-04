import { useThree, useFrame } from "@react-three/fiber"
import { Depth } from "@react-three/postprocessing"
<<<<<<< .merge_file_KeEkCP
import { useEffect, useRef } from "react"
import { Mesh, Scene, MeshBasicMaterial, WebGLRenderTarget, RGBAFormat, ShaderMaterial, DepthTexture } from "three"
=======
import { useCallback, useMemo, useRef } from "react"
import { Mesh, Scene, MeshBasicMaterial, WebGLRenderer, WebGLRenderTarget, RGBAFormat, ShaderMaterial, DepthTexture } from "three"
>>>>>>> .merge_file_LSQRbk
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
    transparent: false,
    depthTest: true,
    depthWrite: true,
    depthFunc: 2
})


const RenderGroup = ({ children, opacity }) => {
  const groupRef = useRef();

<<<<<<< .merge_file_KeEkCP
  useEffect(() => {
    if (groupRef.current) {
        groupRef.current.visible = (opacity !== 0)
        if(!groupRef.current.visible) return
        const BasicMaterial = new MeshBasicMaterial({ color: 0xff0000, opacity, transparent: opacity !== 1 })
        groupRef.current.traverse(object => object.overrideMaterial = BasicMaterial);
    }
  }, [children, opacity]);
=======
    return <mesh 
                onBeforeRender={(_,scene)=> { scene.overrideMaterial = BasicMaterial;
                console.log("onBeforerender")}}
                onAfterRender={(_,scene)=> { scene.overrideMaterial = null; console.log("onAfterRender") }}
            >{children}</mesh>
>>>>>>> .merge_file_LSQRbk

  return <group ref={groupRef}>{children}</group>;
};
export { RenderGroup }