import { useEffect, useRef, useMemo } from 'react';
import { useFrame,extend } from '@react-three/fiber';
import { Vector2, WebGLRenderTarget, ShaderMaterial, DepthTexture, Scene } from 'three';

class Layer extends Scene {
    constructor() {
        super();
        this.type = "Scene";
        this.isLayer = true;
    }
}

extend({ Layer });

//SkipRenderMaterial is a material that will cause the renderbufferDirect function to return early
//I use this material to skip rendering the objects that are not in the current render group
import { SkipRenderMaterial } from '../../shaders/SkipRenderMaterial';


const RenderGroup = ({children, opacity=1}) => {
    const groupRef = useRef();

    const renderTarget = useMemo(() => {
        const depthBuffer = new DepthTexture(1, 1)
        return new WebGLRenderTarget(1, 1, { depthBuffer: true, depthTexture: depthBuffer })
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
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D diffuseTexture;
            uniform sampler2D depthTexture;
            uniform float opacity;
            uniform vec2 resolution;

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
        depthWrite: false,
        depthTest: true,
        name: 'DepthMaterial'
    }))

    

    useFrame(({ gl, scene, camera, size }) => {

        const ratio = gl.getPixelRatio();
        renderTarget.setSize(size.width * ratio, size.height * ratio);
        DepthMaterial.current.uniforms.resolution.value.set(size.width * ratio, size.height * ratio);

        gl.setRenderTarget(renderTarget);

        // I set everything in the scene to a SkipRenderMaterial material
        // so that the renderbufferDirect function will return early
        /*
        scene.traverse(obj => {
            if(!obj.isScene) obj.overrideMaterial = SkipRenderMaterial;
        });
        */

        // I set the current group to null so that objects in this group will render normally
        groupRef.current.traverse(obj => {
            obj.overrideMaterial = null;
        });

        gl.render(scene, camera);
        gl.setRenderTarget(null);

        //setting the opacity and the texture of the DepthMaterial
        DepthMaterial.current.opacity = opacity;
        DepthMaterial.current.transparent = opacity !== 1;
        DepthMaterial.current.uniforms.diffuseTexture.value = renderTarget.texture;
        DepthMaterial.current.uniforms.depthTexture.value = renderTarget.depthTexture;
        DepthMaterial.current.uniforms.opacity.value = opacity;

        // I set ovverideMaterial to null in the scene so that objects in the scene will render normally
        //todo: maybe store the original overrideMaterials in a map and roll back to them
        /*
        scene.traverse(obj => {
             obj.overrideMaterial = null
        });*/

        // I set the current group to DepthMaterial so that objects in this group 
        //will render with the DepthMaterial
        groupRef.current.traverse(obj => {
            obj.overrideMaterial = DepthMaterial.current
            // I set the renderOrder to 100 so that the objects in this group will render after the other objects
            //as the shader needs the depth buffer to be already filled
            obj.renderOrder = 100
        });
    },1);

    return <><layer ref={groupRef}>{children}</layer></>;
};

export {
    RenderGroup
}