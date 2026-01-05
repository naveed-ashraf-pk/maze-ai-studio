
import React, { useMemo } from 'react';
import { shaderMaterial } from '@react-three/drei';
import { extend, ThreeElements, useFrame } from '@react-three/fiber';
import { Texture, Color, Vector3 } from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

const MultiFaceMaterial = shaderMaterial(
  {
    topMap: null as Texture | null,
    sideMap: null as Texture | null,
    bottomMap: null as Texture | null,
    uColor: new Color('#00f2ff'),
    uTime: 0,
    uLightPos: new Vector3(0, 10, 0)
  },
  `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vObjectNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vObjectNormal = normal;
    vNormal = normalize(normalMatrix * normal);
    
    vec4 worldPos = instanceMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    
    gl_Position = projectionMatrix * modelViewMatrix * worldPos;
  }
  `,
  `
  uniform sampler2D topMap;
  uniform sampler2D sideMap;
  uniform sampler2D bottomMap;
  uniform vec3 uColor;
  uniform float uTime;
  uniform vec3 uLightPos;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vObjectNormal;
  varying vec3 vWorldPosition;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  void main() {
    vec4 texColor;
    
    // Smooth tri-planar style blending
    if (abs(vObjectNormal.y) > 0.5) {
      texColor = texture2D(topMap, vWorldPosition.xz * 0.5);
    } else if (abs(vObjectNormal.x) > 0.5) {
      texColor = texture2D(sideMap, vWorldPosition.zy * 0.5);
    } else {
      texColor = texture2D(sideMap, vWorldPosition.xy * 0.5);
    }

    // Dynamic Lighting
    vec3 lightDir = normalize(uLightPos - vWorldPosition);
    float diff = max(dot(vNormal, lightDir), 0.1);
    
    // Spectral Veins
    float noise = hash(floor(vWorldPosition * 2.0));
    float pulse = sin(uTime * 2.0 + noise * 10.0) * 0.5 + 0.5;
    float vein = pow(pulse, 8.0) * 0.4;
    
    // Edge Highlight logic
    float edge = 1.0 - max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)) * 2.0;
    edge = pow(edge, 5.0);
    
    vec3 spectralColor = mix(texColor.rgb, uColor, vein + edge * 0.3);
    
    // Fog factor
    float dist = length(vWorldPosition - cameraPosition);
    float fog = clamp(dist / 30.0, 0.0, 1.0);
    
    vec3 finalColor = spectralColor * diff;
    finalColor = mix(finalColor, vec3(0.005, 0.01, 0.02), fog);

    gl_FragColor = vec4(finalColor, 1.0);
  }
  `
);

extend({ MultiFaceMaterial });

interface WallMaterialProps {
  topMap: Texture;
  sideMap: Texture;
  bottomMap: Texture;
}

const WallMaterial: React.FC<WallMaterialProps> = React.memo(({ topMap, sideMap, bottomMap }) => {
  const material = useMemo(() => new MultiFaceMaterial(), []);

  useFrame((state) => {
    material.uTime = state.clock.getElapsedTime();
  });

  return (
    <primitive 
      object={material}
      attach="material"
      topMap={topMap} 
      sideMap={sideMap} 
      bottomMap={bottomMap} 
    />
  );
});

export default WallMaterial;
