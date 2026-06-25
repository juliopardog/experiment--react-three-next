"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles, Environment, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function MouseTracker({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      state.mouse.x * 0.25,
      0.04
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -state.mouse.y * 0.15,
      0.04
    );
  });

  return <group ref={groupRef}>{children}</group>;
}

function MainOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.12;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.18;
  });
  return (
    <Float speed={1.2} floatIntensity={0.6} rotationIntensity={0}>
      <mesh ref={meshRef} position={[1.5, 0, 0]}>
        <torusKnotGeometry args={[1.8, 0.55, 256, 24, 2, 3]} />
        <meshStandardMaterial
          color="#00D4FF"
          emissive="#003366"
          emissiveIntensity={0.8}
          metalness={1}
          roughness={0.05}
          envMapIntensity={2}
        />
      </mesh>
    </Float>
  );
}

function OrbitingSphere({ angle, radius, color, size }: { angle: number; radius: number; color: string; size: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.4 + angle;
    ref.current.position.x = Math.cos(t) * radius + 1.5;
    ref.current.position.y = Math.sin(t) * radius * 0.6;
    ref.current.position.z = Math.sin(t) * radius * 0.4;
    ref.current.rotation.x = state.clock.elapsedTime * 0.5;
    ref.current.rotation.y = state.clock.elapsedTime * 0.7;
  });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[size, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
}

function GlowRing({ radius, color, speed, tilt }: { radius: number; color: string; speed: number; tilt: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * speed;
    ref.current.rotation.x = tilt + Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
  });
  return (
    <mesh ref={ref} position={[1.5, 0, 0]}>
      <torusGeometry args={[radius, 0.012, 16, 300]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
    </mesh>
  );
}

function FieldParticles() {
  const count = 600;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.01;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.018} color="#00D4FF" transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <Environment preset="city" />
      <ambientLight intensity={0.1} />
      <pointLight position={[5, 5, 5]} intensity={4} color="#00D4FF" />
      <pointLight position={[-5, -3, 3]} intensity={3} color="#FF006E" />
      <pointLight position={[0, 8, -2]} intensity={2} color="#7B2FFF" />

      <MouseTracker>
        <MainOrb />
        <GlowRing radius={3.2} color="#00D4FF" speed={0.08} tilt={Math.PI / 2.5} />
        <GlowRing radius={3.8} color="#FF006E" speed={-0.06} tilt={Math.PI / 3} />
        <GlowRing radius={4.5} color="#7B2FFF" speed={0.04} tilt={Math.PI / 4} />
        <OrbitingSphere angle={0} radius={3.2} color="#FF006E" size={0.18} />
        <OrbitingSphere angle={2.1} radius={3.2} color="#7B2FFF" size={0.14} />
        <OrbitingSphere angle={4.2} radius={3.2} color="#00D4FF" size={0.2} />
        <OrbitingSphere angle={1} radius={4.5} color="#FF006E" size={0.1} />
        <OrbitingSphere angle={3.5} radius={4.5} color="#7B2FFF" size={0.12} />
      </MouseTracker>

      <FieldParticles />
      <Sparkles count={80} size={1.8} speed={0.25} color="#FF006E" opacity={0.5} scale={14} />
      <Sparkles count={60} size={1.2} speed={0.15} color="#7B2FFF" opacity={0.4} scale={12} />
    </Canvas>
  );
}
