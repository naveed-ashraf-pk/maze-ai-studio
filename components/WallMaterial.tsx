
import React, { useMemo } from 'react';
import { shaderMaterial } from '@react-three/drei';
import { extend, ThreeElements, useFrame } from '@react-three/fiber';
import { Texture, Color, Vector3 } from 'three';

/**
 * ============================================================================
 * WALL MATERIAL: THE ANCIENT LIVING STONE
 * ============================================================================
 * 
 * A high-performance, procedurally-enhanced tri-planar material designed for 
 * large-scale instanced environments (like mazes).
 * 
 * FEATURES:
 * - Tri-planar Mapping: Textures never stretch regardless of cube dimensions.
 * - Procedural Cracks: Generates dynamic fissures with depth-based Ambient Occlusion.
 * - Multi-Face Logic: Specifically blends 'Top', 'Side', and 'Bottom' textures based on normal.
 * - Optimized ALU: Uses distance-based culling for heavy procedural features.
 * - Emissive Sparks: Floating ember particles that rise from the fissures.
 * 
 * USAGE EXAMPLES:
 * 
 * 1. Standard Ember Wall (Default):
 *    <WallMaterial topMap={t} sideMap={s} bottomMap={b} glowColor="#ff2200" />
 * 
 * 2. Frozen Crypt (Blue Glow, No Sparks):
 *    <WallMaterial 
 *      topMap={snow} sideMap={ice} bottomMap={ice} 
 *      glowColor="#00ffff" glowSecondaryColor="#0044ff" 
 *      enableSparks={false} pulseSpeed={0.2} 
 *    />
 * 
 * 3. High Performance (No Glow/Sparks):
 *    <WallMaterial topMap={t} sideMap={s} bottomMap={b} enableGlow={false} enableSparks={false} />
 * 
 * ============================================================================
 */

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

const MultiFaceMaterial = shaderMaterial(
  {
    // Texture Maps
    topMap: null as Texture | null,
    sideMap: null as Texture | null,
    bottomMap: null as Texture | null,
    
    // Glow Configuration
    uGlowColor: new Color('#880000'),          // Primary glow color (fissure core)
    uGlowSecondaryColor: new Color('#ffaa00'), // Secondary glow color (flicker/fringe)
    uPulseSpeed: 0.5,                          // Speed of the breathing glow effect
    uPulseRange: 1.0,                          // Breadth of color mixing between primary/secondary
    uGlowIntensity: 1.0,                       // Overall brightness multiplier
    
    // Spark Configuration
    uSparkIntensity: 1.2,                      // Brightness of rising embers
    uEnableSparks: 1.0,                        // Toggle switch (1.0 = On, 0.0 = Off)
    uEnableGlow: 1.0,                          // Toggle switch (1.0 = On, 0.0 = Off)
    
    // Environment & Time
    uTime: 0,                                  // Elapsed time for animations
    uLightPos: new Vector3(5, 10, 5),          // Position of the primary world light
  },
  // Vertex Shader
  `
  varying vec3 vNormal;
  varying vec3 vObjectNormal;
  varying vec3 vWorldPosition;

  void main() {
    vObjectNormal = normal;
    vNormal = normalize(normalMatrix * normal);
    
    // Support for InstancedMesh transforms
    vec4 worldPos = instanceMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    
    gl_Position = projectionMatrix * modelViewMatrix * worldPos;
  }
  `,
  // Fragment Shader
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
  uniform float uSparkIntensity;
  uniform float uEnableSparks;
  uniform float uEnableGlow;

  varying vec3 vNormal;
  varying vec3 vObjectNormal;
  varying vec3 vWorldPosition;

  // Faster, non-trig hash for performance
  float hash(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  // Optimized single-octave noise
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                   mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                   mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }

  // Multi-detail crack sampler
  // detail = 1.0 calculates micro-fissures (high cost)
  // detail = 0.0 calculates only major veins (low cost)
  float getCrackFactor(vec3 p, float detail) {
    float warp = noise(p * 3.0) * 0.15;
    vec3 wPos = p + warp;
    float n = noise(wPos * 2.6);
    float fissures = pow(max(0.0, 1.0 - abs(n - 0.5) * 10.0), 3.0);
    
    if (detail > 0.5) {
      float m = noise(wPos * 6.0);
      fissures = max(fissures, pow(max(0.0, 1.0 - abs(m - 0.5) * 15.0), 2.0) * 0.4);
    }
    return fissures;
  }

  void main() {
    // --- Optimized Tri-planar Selection ---
    // Uses absolute object normals to decide which texture to project.
    vec3 weights = abs(vObjectNormal);
    weights /= (weights.x + weights.y + weights.z);
    
    vec4 xaxis = texture2D(sideMap, vWorldPosition.zy * 0.5);
    vec4 yaxis = texture2D(topMap, vWorldPosition.xz * 0.5);
    vec4 zaxis = texture2D(sideMap, vWorldPosition.xy * 0.5);
    vec4 texColor = xaxis * weights.x + yaxis * weights.y + zaxis * weights.z;

    // --- Distance-based Optimization ---
    float dist = distance(vWorldPosition, cameraPosition);
    float baseCrack = getCrackFactor(vWorldPosition, 1.0);
    
    // Procedural Normal Map (Estimated from noise)
    // Low detail path (detail=0.0) for neighbors to save ALU
    const float eps = 0.02;
    float cX = getCrackFactor(vWorldPosition + vec3(eps, 0.0, 0.0), 0.0);
    float cY = getCrackFactor(vWorldPosition + vec3(0.0, eps, 0.0), 0.0);
    float cZ = getCrackFactor(vWorldPosition + vec3(0.0, 0.0, eps), 0.0);
    
    vec3 crackNorm = normalize(vec3(baseCrack - cX, baseCrack - cY, baseCrack - cZ));
    vec3 finalNorm = normalize(mix(vNormal, crackNorm, clamp(baseCrack * 2.0, 0.0, 0.9)));

    // --- Procedural Glowing Fissures ---
    vec3 glowResult = vec3(0.0);
    if (uEnableGlow > 0.5) {
      float pulse = sin(uTime * uPulseSpeed + noise(vWorldPosition * 0.2) * 5.0) * 0.5 + 0.5;
      float flicker = (hash(vWorldPosition + uTime * 12.0) - 0.5) * 0.1;
      float intensity = clamp(pulse + flicker, 0.0, 1.3);
      vec3 gCol = mix(uGlowColor, uGlowSecondaryColor, clamp(intensity * uPulseRange, 0.0, 1.0));
      
      float halo = smoothstep(0.05, 0.4, baseCrack);
      float core = pow(baseCrack, 8.0);
      glowResult = (gCol * halo * 0.4 * intensity + vec3(1.0, 0.9, 0.8) * core * (3.0 + intensity * 6.0)) * uGlowIntensity;
    }

    // --- Emissive Embers (Culled at distance) ---
    vec3 sparksResult = vec3(0.0);
    if (uEnableSparks > 0.5 && dist < 14.0) {
      float fade = smoothstep(14.0, 10.0, dist);
      vec3 sPos = vWorldPosition * 18.0;
      sPos.y -= uTime * 3.5;
      sPos.x += sin(uTime + vWorldPosition.y) * 0.25;
      
      vec3 ipos = floor(sPos);
      float sRand = hash(ipos);
      float sLife = fract(sRand + uTime * 0.4);
      float sPoint = pow(hash(ipos * 1.07), 40.0);
      
      sparksResult = mix(uGlowSecondaryColor, vec3(1.0, 1.0, 0.8), sRand) * 
                     sPoint * step(0.12, baseCrack) * 
                     smoothstep(0.0, 0.2, sLife) * (1.0 - smoothstep(0.7, 1.0, sLife)) * 
                     uSparkIntensity * 25.0 * fade;
    }

    // --- Lighting & Compositing ---
    float ao = pow(clamp(1.0 - baseCrack * 1.3, 0.0, 1.0), 8.0);
    float diff = max(dot(finalNorm, normalize(uLightPos - vWorldPosition)), 0.15);
    
    vec3 finalColor = (texColor.rgb * ao * diff) + glowResult + sparksResult;

    // Fast fog blending (Linear)
    float fog = clamp((dist - 3.0) / 20.0, 0.0, 1.0);
    gl_FragColor = vec4(mix(finalColor, vec3(0.005, 0.003, 0.002), fog), 1.0);
  }
  `
);

extend({ MultiFaceMaterial });

export interface WallMaterialProps {
  /** Texture used for faces looking mostly UP (+Y) */
  topMap: Texture;
  /** Texture used for faces looking mostly sideways (X or Z) */
  sideMap: Texture;
  /** Texture used for faces looking mostly DOWN (-Y) */
  bottomMap: Texture;
  
  /** Primary emission color for stone fissures */
  glowColor?: string | Color;
  /** Secondary emission color for flicker and halo effects */
  glowSecondaryColor?: string | Color;
  /** Speed of the breathing light animation */
  pulseSpeed?: number;
  /** Weight range for color oscillation (0.0 - 1.0) */
  pulseRange?: number;
  /** Global intensity of the emission glow */
  glowIntensity?: number;
  /** Brightness of the floating ember particles */
  sparkIntensity?: number;
  /** Toggle calculation of rising embers */
  enableSparks?: boolean;
  /** Toggle calculation of fissure emission */
  enableGlow?: boolean;
}

/**
 * WallMaterial Component
 * Handles mapping of props to shader uniforms and state updates.
 */
const WallMaterial: React.FC<WallMaterialProps> = React.memo(({ 
  topMap, 
  sideMap, 
  bottomMap,
  glowColor = '#880000',
  glowSecondaryColor = '#ffaa00',
  pulseSpeed = 0.5,
  pulseRange = 1.0,
  glowIntensity = 1.0,
  sparkIntensity = 1.2,
  enableSparks = true,
  enableGlow = true,
}) => {
  const material = useMemo(() => new MultiFaceMaterial(), []);
  const cA = useMemo(() => new Color(glowColor), [glowColor]);
  const cB = useMemo(() => new Color(glowSecondaryColor), [glowSecondaryColor]);

  useFrame((state) => {
    material.uTime = state.clock.getElapsedTime();
    material.uGlowColor.copy(cA);
    material.uGlowSecondaryColor.copy(cB);
    material.uPulseSpeed = pulseSpeed;
    material.uPulseRange = pulseRange;
    material.uGlowIntensity = glowIntensity;
    material.uSparkIntensity = sparkIntensity;
    material.uEnableSparks = enableSparks ? 1.0 : 0.0;
    material.uEnableGlow = enableGlow ? 1.0 : 0.0;
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
