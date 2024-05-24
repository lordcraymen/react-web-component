import { vertextPassThrough } from "./default";

const BlendShader = {
    uniforms: {
        t1: { value: null },
        t2: { value: null },
        mixRatio: { value: 0.0 }
    },
    vertexShader: vertextPassThrough,
    fragmentShader: `
        uniform sampler2D t1;
        uniform sampler2D t2;
        uniform float mixRatio;
        varying vec2 vUv;

        void main() {
            vec4 tex1 = texture2D(t1, vUv);
            vec4 tex2 = texture2D(t2, vUv);
            gl_FragColor = mix(tex1, tex2, mixRatio);
        }
    `
}

export { BlendShader }
