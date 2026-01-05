
import React, { useMemo } from 'react';
import { shaderMaterial } from '@react-three/drei';
import { extend, ThreeElements, useFrame } from '@react-three/fiber';
import { Texture, Color, Vector3 } from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

/**
 * Ancient Living Stone Material
 * Features high-intensity procedural cracks with high-frequency flickering embers.
 * Now exposes pulse speed and color transition range for fine-tuned "living" energy effects.
 */
const MultiFaceMaterial = shaderMaterial(
  {
    topMap: null as Texture | null,
    sideMap: null as Texture | null,
    bottomMap: null as Texture | null,
    uGlowColor: new Color('#880000'),          // Default Deep Red
    uGlowSecondaryColor: new Color('#ffaa00'), // Default Hot Amber
    uTime: 0,
    uLightPos: new Vector3(5, 10, 5),
    uPulseSpeed: 0.5,
    uPulseRange: 1.0,  // Controls the "width" of color transition (0.0 = only primary, 1.0 = full mix)
    uGlowIntensity: 1.0, // Overall brightness multiplier
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
  uniform vec3 uGlowColor;
  uniform vec3 uGlowSecondaryColor;
  uniform float uTime;
  uniform vec3 uLightPos;
  uniform float uPulseSpeed;
  uniform float uPulseRange;
  uniform float uGlowIntensity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vObjectNormal;
  varying vec3 vWorldPosition;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                   mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                   mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }

  float sampleCrack(vec3 p) {
    float localErosion = noise(p * 0.7 + 15.0);
    float strengthScale = mix(0.4, 1.3, localErosion);

    vec3 warp = vec3(
      noise(p * 3.5),
      noise(p * 3.5 + vec3(5.2)),
      noise(p * 3.5 + vec3(1.3))
    ) * 0.12;
    vec3 warpedPos = p + warp;

    float n1 = noise(warpedPos * 2.8);
    float fissures = pow(max(0.0, 1.0 - abs(n1 - 0.5) * 12.0), 3.0);
    
    float n2 = noise(warpedPos * 8.0 + n1 * 2.0);
    float microCracks = pow(max(0.0, 1.0 - abs(n2 - 0.5) * 18.0), 2.0);
    
    return max(fissures, microCracks * 0.35) * strengthScale;
  }

  void main() {
    vec3 blending = abs(vObjectNormal);
    blending /= (blending.x + blending.y + blending.z);
    
    vec4 xaxis = texture2D(sideMap, vWorldPosition.zy * 0.5);
    vec4 yaxis = texture2D(topMap, vWorldPosition.xz * 0.5);
    vec4 zaxis = texture2D(sideMap, vWorldPosition.xy * 0.5);
    
    vec4 texColor = xaxis * blending.x + yaxis * blending.y + zaxis * blending.z;

    float eps = 0.012;
    float cBase = sampleCrack(vWorldPosition);
    float cX = sampleCrack(vWorldPosition + vec3(eps, 0.0, 0.0));
    float cY = sampleCrack(vWorldPosition + vec3(0.0, eps, 0.0));
    float cZ = sampleCrack(vWorldPosition + vec3(0.0, 0.0, eps));
    
    vec3 crackNormal = normalize(vec3(cBase - cX, cBase - cY, cBase - cZ));
    float grainVal = hash(vWorldPosition);
    vec3 grainNormal = normalize(vNormal + (vec3(grainVal, hash(vWorldPosition+1.0), hash(vWorldPosition+2.0)) - 0.5) * 0.1);
    vec3 finalNormal = normalize(mix(grainNormal, crackNormal, clamp(cBase * 1.8, 0.0, 0.96)));

    // --- PULSATION SYSTEM ---
    float spatialOffset = noise(vWorldPosition * 0.2) * 6.0;
    float basePulse = sin(uTime * uPulseSpeed + spatialOffset) * 0.5 + 0.5;
    basePulse += sin(uTime * uPulseSpeed * 1.8 + spatialOffset) * 0.15;
    
    float flicker = (hash(vWorldPosition + uTime * 20.0) - 0.5) * 0.2 * basePulse;
    float finalPulse = clamp(basePulse + flicker, 0.0, 1.2);
    
    // Control the range of the color transition
    vec3 currentGlowColor = mix(uGlowColor, uGlowSecondaryColor, clamp(finalPulse * uPulseRange, 0.0, 1.0));
    
    float cracks = cBase;
    
    // Core Heat
    float coreGlowFactor = pow(cracks, 2.0);
    vec3 glow = currentGlowColor * coreGlowFactor * (0.8 + finalPulse * 6.0);
    
    // White-Hot Filament
    glow += vec3(1.0, 0.95, 0.8) * pow(cracks, 12.0) * (0.5 + finalPulse * 4.0);
    
    // Bloom
    float bloomFactor = pow(cracks, 0.7);
    glow += currentGlowColor * bloomFactor * 0.25 * finalPulse;
    
    // Apply final intensity multiplier
    glow *= uGlowIntensity;

    // --- WEATHERING & LIGHTING ---
    float mossMask = clamp(vObjectNormal.y * 1.4, 0.0, 1.0) * noise(vWorldPosition * 3.5);
    vec3 mossColor = vec3(0.06, 0.09, 0.04);
    vec3 finalAlbedo = mix(texColor.rgb, mossColor, mossMask * 0.45);

    float creviceAO = pow(clamp(1.0 - cracks, 0.0, 1.0), 6.5);
    finalAlbedo = mix(finalAlbedo * 0.01, finalAlbedo, creviceAO);

    vec3 lightDir = normalize(uLightPos - vWorldPosition);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    
    float diff = max(dot(finalNormal, lightDir), 0.12);
    vec3 halfDir = normalize(lightDir + viewDir);
    float specMask = pow(clamp(1.0 - cracks * 1.5, 0.0, 1.0), 3.5);
    float spec = pow(max(dot(finalNormal, halfDir), 0.0), 48.0) * 0.25 * specMask;
    
    vec3 lighting = (finalAlbedo * diff) + spec;
    vec3 finalColor = lighting + glow;

    float dist = length(vWorldPosition - cameraPosition);
    float fogFactor = clamp((dist - 2.5) / 25.0, 0.0, 1.0);
    finalColor = mix(finalColor, vec3(0.005, 0.002, 0.001), fogFactor);

    gl_FragColor = vec4(finalColor, 1.0);
  }
  `
);

extend({ MultiFaceMaterial });

interface WallMaterialProps {
  topMap: Texture;
  sideMap: Texture;
  bottomMap: Texture;
  glowColor?: string | Color;
  glowSecondaryColor?: string | Color;
  pulseSpeed?: number;
  pulseRange?: number;
  glowIntensity?: number;
}

const WallMaterial: React.FC<WallMaterialProps> = React.memo(({ 
  topMap, 
  sideMap, 
  bottomMap,
  glowColor = '#880000',
  glowSecondaryColor = '#ffaa00',
  pulseSpeed = 0.5,
  pulseRange = 1.0,
  glowIntensity = 1.0
}) => {
  const material = useMemo(() => new MultiFaceMaterial(), []);

  // Use useMemo for color instances to avoid re-calculating on every render if strings are passed
  const colorA = useMemo(() => new Color(glowColor), [glowColor]);
  const colorB = useMemo(() => new Color(glowSecondaryColor), [glowSecondaryColor]);

  useFrame((state) => {
    material.uTime = state.clock.getElapsedTime();
    material.uGlowColor.copy(colorA);
    material.uGlowSecondaryColor.copy(colorB);
    material.uPulseSpeed = pulseSpeed;
    material.uPulseRange = pulseRange;
    material.uGlowIntensity = glowIntensity;
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
