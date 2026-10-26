import * as THREE from 'three';

// Blend in premultiplied alpha so transparent fur does not flash or darken.
// Both samples come from the same continuous-video atlas; no extra GPU texture.
export function atlasBlend(material) {
  const uniforms={atlasNextOffset:{value:new THREE.Vector2()},atlasMix:{value:0}};
  material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,uniforms);
    shader.fragmentShader='uniform vec2 atlasNextOffset;\nuniform float atlasMix;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
      #ifdef USE_MAP
        vec4 firstFrame=texture2D(map,vMapUv);
        vec4 nextFrame=texture2D(map,vMapUv+atlasNextOffset);
        float frameAlpha=mix(firstFrame.a,nextFrame.a,atlasMix);
        vec3 frameColor=mix(firstFrame.rgb*firstFrame.a,nextFrame.rgb*nextFrame.a,atlasMix);
        diffuseColor*=vec4(frameColor/max(frameAlpha,0.00001),frameAlpha);
      #endif
    `);
  };
  material.customProgramCacheKey=()=> 'premultiplied-atlas-blend-v1';
  material.needsUpdate=true;
  return {
    reset(){uniforms.atlasMix.value=0;},
    set(current,next,amount){uniforms.atlasNextOffset.value.copy(next.offset).sub(current.offset);uniforms.atlasMix.value=amount;}
  };
}
