const AlphaShader = {

  name: 'CopyShader',

  uniforms: {
    'tPass': { value: null },
    'tDiffuse': { value: null },
    'opacity': { value: 1 }
  },

  vertexShader: /* glsl */`

    varying vec2 vUv;

    void main() {

      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }`,

  fragmentShader: /* glsl */`

  uniform float opacity;

  uniform sampler2D tPass;

  uniform sampler2D tDiffuse;

  varying vec2 vUv;

  void main() {

    vec4 originalTexel = texture2D( tDiffuse, vUv );
    vec4 passTexel = texture2D( tPass, vUv );

    vec4 blendedTexel = mix(originalTexel, passTexel, passTexel.a * opacity);

    gl_FragColor = blendedTexel;
  }`

};

export { AlphaShader }
