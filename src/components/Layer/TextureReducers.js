import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';

// Function to reduce the Set to the screen
function renderSetToScreen(renderTargets) {
    // Split the render targets into groups of 16
    const groups = Array.from(renderTargets).reduce((groups, target, index) => {
      const groupIndex = Math.floor(index / 16);
      if (!groups[groupIndex]) {
        groups[groupIndex] = [];
      }
      groups[groupIndex].push(target);
      return groups;
    }, []);
  
    // Render each group
    groups.forEach((group, index) => {
      // Create a new shader pass for this group
      const pass = new ShaderPass({
        uniforms: {
          tDiffuse: { value: null },
          // Create a uniform for each render target in the group
          ...group.reduce((uniforms, target, index) => {
            uniforms[`t${index}`] = { value: target.texture };
            return uniforms;
          }, {})
        },
        vertexShader: CopyShader.vertexShader,
        fragmentShader: `
          uniform sampler2D tDiffuse;
          ${group.map((_, index) => `uniform sampler2D t${index};`).join('\n')}
          varying vec2 vUv;
          void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            ${group.map((_, index) => `color = mix(color, texture2D(t${index}, vUv), texture2D(t${index}, vUv).a);`).join('\n')}
            gl_FragColor = color;
          }
        `
      });
      pass.renderToScreen = (index === groups.length - 1); // Only render the last pass to screen
  
      // Add the pass to the composer
      composer.addPass(pass);
    });
  
    // Render the composer
    composer.render();
  }