"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

function TorusKnot() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.25;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1.2, 0.35, 200, 20, 2, 3]} />
        <meshStandardMaterial
          color="#00D4FF"
          emissive="#0044AA"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </Float>
  );
}

function Particles() {
  const count = 300;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.04;
    pointsRef.current.rotation.x = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#00D4FF"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

function Ring() {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    ringRef.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
  });
  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[2.5, 0.015, 16, 200]} />
      <meshStandardMaterial color="#FF006E" emissive="#FF006E" emissiveIntensity={1} />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={0.2} />
      <pointLight position={[4, 4, 4]} intensity={2} color="#00D4FF" />
      <pointLight position={[-4, -4, 4]} intensity={1.5} color="#FF006E" />
      <pointLight position={[0, 0, 6]} intensity={0.5} color="#7B2FFF" />
      <TorusKnot />
      <Particles />
      <Ring />
      <Sparkles count={60} size={1.5} speed={0.3} color="#FF006E" opacity={0.4} scale={8} />
      <Sparkles count={40} size={1} speed={0.2} color="#7B2FFF" opacity={0.3} scale={6} />
    </Canvas>
  );
}
