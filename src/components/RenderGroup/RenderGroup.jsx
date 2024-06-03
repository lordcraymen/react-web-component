import { useThree } from "@react-three/fiber"
import { useCallback, useMemo } from "react"
import { Mesh, Scene, MeshBasicMaterial, WebGLRenderTarget, RGBAFormat, ShaderMaterial } from "three"
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


const RenderGroup = ({children,opacity=1}) => {
    
    const size = useThree((state) => state.size)
    const tempTarget = useMemo(()=> { 
        const target = new WebGLRenderTarget( size.width, size.height, { format: RGBAFormat })
        target.depthBuffer = true;
        return target
    },[size])

    const onBeforeRenderProxy = useCallback((gl) => {
        console.log('onBeforeRenderProxy')
        gl.setRenderTarget(tempTarget);
    },[])

    const onBeforeRenderFinal = useCallback((scene) => {
        console.log('onBeforeRenderFinal')
        TransparentShaderMaterial.uniforms.tDiffuse.value = tempTarget.texture;
        TransparentShaderMaterial.uniforms.opacity.value = opacity;
        scene.overrideMaterial = new MeshBasicMaterial({color:0xff00ff});
    },[])

    const onAfterRender = useCallback((gl,scene) => {
        scene.overrideMaterial = null;
        gl.setRenderTarget(null);
    },[])

    

    return <>
            <mesh onBeforeRender={onBeforeRenderProxy} onAfterRender={onAfterRender}>{children}</mesh>
            <mesh onBeforeRender={onBeforeRenderFinal} onAfterRender={onAfterRender}>{children}</mesh>
        </>

}
export { RenderGroup }