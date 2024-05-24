const vertextPassThrough = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`
const fragementPassThrough = `uniform sampler2D tDiffuse; varying vec2 vUv; void main() { vec4 texel = texture2D( tDiffuse, vUv ); gl_FragColor = texel; }`
export { vertextPassThrough, fragementPassThrough }