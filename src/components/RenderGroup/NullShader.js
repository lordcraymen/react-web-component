import { ShaderMaterial } from "three";

const NullShader = new ShaderMaterial({
  name: 'NullShader',
  uniforms: {},
  vertexShader: `
  uniform vec4 uPosition;
  void main() { gl_Position = uPosition; }`,
  fragmentShader: `void main() { gl_FragColor = vec4(0.0);}`
});

export { NullShader }
