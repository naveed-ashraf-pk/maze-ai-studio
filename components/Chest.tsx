
import React, { useMemo, useRef } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { Group, Mesh, DoubleSide, Color } from 'three';
import { getChestTexture, getGoldTexture } from '../assets/textures';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

const Chest: React.FC<{ showLights: boolean }> = ({ showLights }) => {
  const chestGroup = useRef<Group>(null);
  const lidGroup = useRef<Group>(null);
  const glowRef = useRef<Mesh>(null);

  const woodTex = useMemo(() => getChestTexture(), []);
  const crystalTex = useMemo(() => getGoldTexture(), []); // Using base for custom tint
  const spectralEmissive = useMemo(() => new Color('#00ccff'), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (chestGroup.current) {
      chestGroup.current.position.y = Math.sin(t * 1.0) * 0.05;
    }
    
    if (lidGroup.current) {
        lidGroup.current.rotation.x = -0.1 + Math.sin(t * 0.8) * 0.1;
    }

    if (glowRef.current) {
        const pulse = Math.sin(t * 2);
        glowRef.current.scale.setScalar(1 + pulse * 0.2);
        if (glowRef.current.material) {
            (glowRef.current.material as any).opacity = 0.3 + pulse * 0.2;
        }
    }
  });

  return (
    <group ref={chestGroup} scale={1.2}>
      {/* --- RELIQUARY BASE --- */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.8, 0.4, 0.5]} />
        <meshStandardMaterial 
            map={woodTex} 
            color="#1a2a3a"
            roughness={0.2} 
            metalness={0.5} 
        />
      </mesh>

      <group ref={lidGroup} position={[0, 0.4, -0.25]}>
        <mesh position={[0, 0, 0.25]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.8, 32, 1, false, Math.PI, Math.PI]} />
          <meshStandardMaterial map={woodTex} color="#1a2a3a" roughness={0.2} side={DoubleSide} />
        </mesh>
        
        {/* MANA CRYSTAL STRAPS */}
        <group position={[0, 0, 0.25]}>
            {[0.24, -0.24].map((xOffset, idx) => (
                <mesh key={idx} position={[xOffset, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.27, 0.27, 0.1, 32]} />
                    <meshStandardMaterial 
                        color="#00f2ff"
                        metalness={0.9} 
                        roughness={0.0} 
                        emissive={spectralEmissive}
                        emissiveIntensity={1.5}
                        transparent
                        opacity={0.8}
                    />
                </mesh>
            ))}
        </group>

        {/* Cursed Eye Lock */}
        <mesh position={[0, -0.05, 0.5]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[0.15, 0.15, 0.05]} />
          <meshStandardMaterial 
            color="#000"
            metalness={1.0} 
            roughness={0.0} 
          />
        </mesh>
        <mesh position={[0, -0.05, 0.53]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color="#00ffff" />
        </mesh>
      </group>

      {/* --- RADIANT SPECTRAL GLOW --- */}
      {showLights && (
        <group position={[0, 0.45, 0]}>
          <pointLight color="#00f2ff" intensity={40} distance={10} decay={2} />
          <mesh ref={glowRef}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshBasicMaterial color="#00f2ff" transparent opacity={0.4} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default Chest;
