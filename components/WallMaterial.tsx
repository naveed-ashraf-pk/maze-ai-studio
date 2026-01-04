
import React, { useMemo } from 'react';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { Texture, Color } from 'three';

const MultiFaceMaterial = shaderMaterial(
  {
    topMap: null as Texture | null,
    sideMap: null as Texture | null,
    bottomMap: null as Texture | null,
    uColor: new Color(1, 1, 1),
    uTime: 0
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
      texColor = texture2D(bottomMap, vUv);
    } else {
      // For sides of a 1x1x1 cube, standard UVs work perfectly
      texColor = texture2D(sideMap, vUv);
    }

    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.4));
    float diff = max(dot(vNormal, lightDir), 0.0);
    float ambient = 0.5;
    
    vec3 finalColor = texColor.rgb * (diff + ambient) * uColor;
    
    // Low-cost atmospheric detail
    float pulse = sin(uTime * 0.4 + vWorldPosition.x * 0.2 + vWorldPosition.z * 0.2) * 0.005;
    finalColor += pulse;

    gl_FragColor = vec4(finalColor, 1.0);
  }
  `
);

extend({ MultiFaceMaterial });

interface WallMaterialProps {
  topMap: Texture;
  sideMap: Texture;
  bottomMap: Texture;
  uTime?: number;
}

const WallMaterial: React.FC<WallMaterialProps> = ({ topMap, sideMap, bottomMap, uTime = 0 }) => {
  const material = useMemo(() => new MultiFaceMaterial(), []);

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
