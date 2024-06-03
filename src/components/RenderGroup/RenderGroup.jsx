import { useThree, useFrame } from "@react-three/fiber"
import { Depth } from "@react-three/postprocessing"
import { useCallback, useMemo, useRef } from "react"
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
    transparent: false,
    depthTest: true,
    depthWrite: true,
    depthFunc: 2
})

const BasicMaterial = new MeshBasicMaterial({
    color: 0xff0000
})


const RenderGroup = ({children,opacity=1}) => {

    const size = useThree(({ size }) => size)
    const rendertarget = useMemo(() => new WebGLRenderTarget(size.width, size.height, {   
        format: RGBAFormat,
        depthBuffer: true,
        depthTexture: new DepthTexture(size.width, size.height)
    }), [size])

    
    useFrame(({ gl, scene, camera }) => {
        //gl.autoClear = false
        //gl.clear()
        scene.overrideMaterial = BasicMaterial
        gl.setRenderTarget(rendertarget)
        gl.render(scene, camera)
        gl.setRenderTarget(null)
        gl.render(scene, camera)
        scene.overrideMaterial = null
        console.log("rendered")
    })

    return <mesh 
                onBeforeRender={()=> console.log("onBeforerender")}
                onAfterRender={()=> console.log("onAfterRender")}
            >{children}</mesh>

}
export { RenderGroup }