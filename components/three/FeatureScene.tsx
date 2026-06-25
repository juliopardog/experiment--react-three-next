"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

type ShapeType = "cube" | "sphere" | "diamond";

interface ShapeProps {
  color: string;
  emissive: string;
  type: ShapeType;
}

function MouseResponder({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      state.mouse.x * 0.4,
      0.05
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -state.mouse.y * 0.25,
      0.05
    );
  });
  return <group ref={groupRef}>{children}</group>;
}

function Shape({ color, emissive, type }: ShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
    if (wireRef.current) {
      wireRef.current.rotation.y = -state.clock.elapsedTime * 0.15;
      wireRef.current.rotation.x = state.clock.elapsedTime * 0.1;
    }
  });

  const geo = () => {
    if (type === "cube") return <boxGeometry args={[1.6, 1.6, 1.6]} />;
    if (type === "sphere") return <icosahedronGeometry args={[1.2, 2]} />;
    return <octahedronGeometry args={[1.4, 0]} />;
  };

  const wireGeo = () => {
    if (type === "cube") return <boxGeometry args={[2.4, 2.4, 2.4]} />;
    if (type === "sphere") return <icosahedronGeometry args={[2, 1]} />;
    return <octahedronGeometry args={[2.2, 0]} />;
  };

  return (
    <Float speed={1.8} floatIntensity={0.6} rotationIntensity={0}>
      <mesh ref={meshRef}>
        {geo()}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.0}
          metalness={0.15}
          roughness={0.3}
        />
      </mesh>
      <mesh ref={wireRef}>
        {wireGeo()}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          wireframe
          transparent
          opacity={0.18}
        />
      </mesh>
    </Float>
  );
}

interface FeatureSceneProps {
  type: ShapeType;
  color: string;
  emissive: string;
}

export default function FeatureScene({ type, color, emissive }: FeatureSceneProps) {
  return (
    <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} dpr={[1, 2]} gl={{ alpha: true }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 4]} intensity={10} color={color} />
      <pointLight position={[-4, -4, 4]} intensity={5} color="#ffffff" />
      <pointLight position={[0, 0, 5]} intensity={8} color={color} />
      <MouseResponder>
        <Shape color={color} emissive={emissive} type={type} />
      </MouseResponder>
    </Canvas>
  );
}
