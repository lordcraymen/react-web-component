import { vertextPassThrough } from "../../shaders/default";

const AlphaShader = {

  name: 'Alphashader',

  uniforms: {
    'tPassColor': { value: null },
    'tPassDepth': { value: null },
    'tDiffuse': { value: null },
    'tDepth': { value: null },
    'opacity': { value: 1 }
  },

  vertexShader:vertextPassThrough,

  fragmentShader: `

  uniform float opacity;

  uniform sampler2D tPassColor;
  uniform sampler2D tPassDepth;
  uniform sampler2D tDiffuse;
  uniform sampler2D tDepth;

  varying vec2 vUv;

  void main() {
      vec4 originalTexel = texture2D(tDiffuse, vUv);
      vec4 originalDepth = texture2D(tDepth, vUv);

      vec4 passTexel = texture2D(tPassColor, vUv);
      vec4 passDepth = texture2D(tPassDepth, vUv);

      // Compare depth values to decide on blending
      float depthCheck = step(passDepth.r, originalDepth.r);

      // Calculate blended color based on depth check and opacity
      vec4 blendedTexel = mix(originalTexel, passTexel, passTexel.a * opacity * depthCheck);

      gl_FragColor = blendedTexel;
  }`

};

export { AlphaShader }
