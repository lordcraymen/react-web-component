import {DataTexture, RGBAFormat} from 'three';
import { vertexPassThrough } from "./default";

const transparentPixel = new Uint8Array([0, 0, 0, 0]);
const transparentTexture = new DataTexture(transparentPixel, 1, 1, RGBAFormat);

const BlendShader = {
    uniforms: {
        t1: { value: transparentTexture },
        t2: { value: transparentTexture },
        mixRatio: { value: 0.0 }
    },
    vertexShader: vertexPassThrough,
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