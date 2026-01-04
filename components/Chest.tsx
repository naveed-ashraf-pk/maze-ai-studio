
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, DoubleSide, Color } from 'three';
import { getChestTexture, getGoldTexture } from '../assets/textures.ts';

const Chest: React.FC<{ showLights: boolean }> = ({ showLights }) => {
  const chestGroup = useRef<Group>(null);
  const lidGroup = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);

  const woodTex = useMemo(() => getChestTexture(), []);
  const goldTex = useMemo(() => getGoldTexture(), []);
  const goldEmissive = useMemo(() => new Color('#664400'), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Subtle premium "float" animation
    if (chestGroup.current) {
      chestGroup.current.position.y = Math.sin(t * 1.5) * 0.02;
    }
    
    // Elegant slow pulsing lid
    if (lidGroup.current) {
        // Hinge rotates from the back edge
        lidGroup.current.rotation.x = -0.05 + Math.sin(t * 1.2) * 0.06;
    }

    // High-quality gold pulse
    if (glowRef.current) {
        const pulse = Math.sin(t * 3);
        glowRef.current.scale.setScalar(1 + pulse * 0.15);
        if (glowRef.current.material) {
            (glowRef.current.material as any).opacity = 0.4 + pulse * 0.2;
        }
    }
  });

  return (
    <group ref={chestGroup} scale={1.2}>
      {/* --- PREMIUM CHEST BASE --- */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.8, 0.4, 0.5]} />
        <meshStandardMaterial 
            map={woodTex} 
            roughness={0.4} 
            metalness={0.1} 
        />
      </mesh>

      {/* --- PERFECTLY ALIGNED LID GROUP --- 
          Hinge is exactly at the back-top corner: Y=0.4 (top of base), Z=-0.25 (back of base)
      */}
      <group ref={lidGroup} position={[0, 0.4, -0.25]}>
        
        {/* Vaulted Top (Half Cylinder) 
            Width 0.8, Radius 0.25. 
            Theta from PI to 2PI ensures the top is convex when rotated.
        */}
        <mesh position={[0, 0, 0.25]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.8, 32, 1, false, Math.PI, Math.PI]} />
          <meshStandardMaterial map={woodTex} roughness={0.4} side={DoubleSide} />
        </mesh>
        
        {/* Lid End Caps (Half Circles) */}
        <mesh position={[0.4, 0, 0.25]} rotation={[0, Math.PI / 2, 0]}>
            <circleGeometry args={[0.25, 32, 0, Math.PI]} />
            <meshStandardMaterial map={woodTex} roughness={0.4} side={DoubleSide} />
        </mesh>
        <mesh position={[-0.4, 0, 0.25]} rotation={[0, -Math.PI / 2, 0]}>
            <circleGeometry args={[0.25, 32, 0, Math.PI]} />
            <meshStandardMaterial map={woodTex} roughness={0.4} side={DoubleSide} />
        </mesh>

        {/* --- GOLD PLATED STRAPS (LID) --- */}
        <group position={[0, 0, 0.25]}>
            {[0.24, -0.24].map((xOffset, idx) => (
                <mesh key={idx} position={[xOffset, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.265, 0.265, 0.1, 32, 1, false, Math.PI, Math.PI]} />
                    <meshStandardMaterial 
                        map={goldTex} 
                        color="#FFD700"
                        metalness={0.9} 
                        roughness={0.1} 
                        emissive={goldEmissive}
                        emissiveIntensity={0.4}
                    />
                </mesh>
            ))}
        </group>

        {/* Ornate Gold Lock Plate */}
        <mesh position={[0, -0.05, 0.5]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[0.2, 0.16, 0.04]} />
          <meshStandardMaterial 
            map={goldTex} 
            color="#FFD700"
            metalness={0.9} 
            roughness={0.1} 
            emissive={goldEmissive}
            emissiveIntensity={0.4}
          />
        </mesh>
        
        {/* Keyhole Detail */}
        <mesh position={[0, -0.07, 0.53]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.012, 0.02, 8]} />
          <meshBasicMaterial color="#000" />
        </mesh>
      </group>

      {/* --- GOLD PLATED STRAPS (BASE) --- */}
      <group position={[0, 0.2, 0]}>
        {[0.24, -0.24].map((xOffset, idx) => (
            <mesh key={idx} position={[xOffset, 0, 0]}>
                <boxGeometry args={[0.11, 0.42, 0.53]} />
                <meshStandardMaterial 
                    map={goldTex} 
                    color="#FFD700"
                    metalness={0.9} 
                    roughness={0.1} 
                    emissive={goldEmissive}
                    emissiveIntensity={0.4}
                />
            </mesh>
        ))}
      </group>

      {/* --- ORNATE GOLD FEET --- */}
      {[ [0.35, 0.22], [-0.35, 0.22], [0.35, -0.22], [-0.35, -0.22] ].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.02, pos[1]]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial 
            map={goldTex} 
            color="#FFD700"
            metalness={0.9} 
            roughness={0.1} 
            emissive={goldEmissive}
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}

      {/* --- RADIANT GOLDEN GLOW --- */}
      {showLights && (
        <group position={[0, 0.45, 0]}>
          <pointLight color="#FFD700" intensity={35} distance={8} decay={2} />
          <mesh ref={glowRef}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshBasicMaterial color="#FFFACD" transparent opacity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default Chest;
