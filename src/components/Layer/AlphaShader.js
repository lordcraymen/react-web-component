const AlphaShader = {
    uniforms: {
      tDiffuse: { value: null },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      varying vec2 vUv;
      void main() {
        vec4 color = texture2D(tDiffuse, vUv);
        vec4 overlayColor = vec4(color.rgb, 1);
        gl_FragColor = mix(color, overlayColor, overlayColor.a);
      }
    `,
    }

    export { AlphaShader }
