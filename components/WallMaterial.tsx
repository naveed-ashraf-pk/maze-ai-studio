
import React, { useMemo } from 'react';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { Texture, Color } from 'three';
import { SCALES } from '../utils/constants.ts';

// Create a custom shader material that handles different textures for top, bottom, and sides
const MultiFaceMaterial = shaderMaterial(
  {
    topMap: null as Texture | null,
    sideMap: null as Texture | null,
    bottomMap: null as Texture | null,
    uColor: new Color(1, 1, 1),
    uTime: 0,
    uWallHeight: SCALES.WALL_HEIGHT,
    uFloorScale: SCALES.FLOOR_TILING,
    uSideScale: SCALES.WALL_SIDE_TILING
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
    
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
  `,
  `
  uniform sampler2D topMap;
  uniform sampler2D sideMap;
  uniform sampler2D bottomMap;
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uWallHeight;
  uniform float uFloorScale;
  uniform float uSideScale;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vObjectNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec4 texColor;
    bool isTop = vObjectNormal.y > 0.5;
    bool isBottom = vObjectNormal.y < -0.5;

    if (isTop) {
      texColor = texture2D(topMap, vUv);
    } else if (isBottom) {
      // Scale bottom face to match world-space floor
      texColor = texture2D(bottomMap, vUv * (1.0 / uFloorScale));
    } else {
      // Scale sides to maintain texture aspect ratio regardless of wall height
      vec2 sideUv = vec2(vUv.x * (1.0 / uSideScale), vUv.y * (uWallHeight / uSideScale));
      texColor = texture2D(sideMap, sideUv);
    }

    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.4));
    float diff = max(dot(vNormal, lightDir), 0.0);
    float ambient = 0.4;
    
    vec3 finalColor = texColor.rgb * (diff + ambient) * uColor;
    
    // Low-cost atmospheric detail/shimmer
    float pulse = sin(uTime * 0.4 + vWorldPosition.x * 0.2 + vWorldPosition.z * 0.2) * 0.008;
    finalColor += pulse;

    gl_FragColor = vec4(finalColor, 1.0);
  }
  `
);

// We extend the Three namespace to include our custom material
extend({ MultiFaceMaterial });

// FIX: Removed the global JSX namespace override that was causing all standard elements (div, mesh, etc.) 
// to appear as non-existent because it was replacing the entire IntrinsicElements interface.

interface WallMaterialProps {
  topMap: Texture;
  sideMap: Texture;
  bottomMap: Texture;
  uTime?: number;
}

const WallMaterial: React.FC<WallMaterialProps> = ({ topMap, sideMap, bottomMap, uTime = 0 }) => {
  // Use useMemo to ensure the material instance is stable across re-renders
  const material = useMemo(() => new MultiFaceMaterial(), []);

  // Use <primitive /> to inject the custom material into the Three.js scene graph.
  // This avoids the need for complex global JSX type declarations while remaining fully type-safe.
  return (
    <primitive 
      object={material}
      attach="material"
      topMap={topMap} 
      sideMap={sideMap} 
      bottomMap={bottomMap} 
      uTime={uTime}
    />
  );
};

export default WallMaterial;
