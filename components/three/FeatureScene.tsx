"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

type ShapeType = "cube" | "sphere" | "octahedron";

interface ShapeProps {
  color: string;
  emissive: string;
  type: ShapeType;
}

function Shape({ color, emissive, type }: ShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.4;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.6;
  });

  const geometry = () => {
    if (type === "cube") return <boxGeometry args={[1.2, 1.2, 1.2]} />;
    if (type === "sphere") return <icosahedronGeometry args={[0.9, 1]} />;
    return <octahedronGeometry args={[1]} />;
  };

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        {geometry()}
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.15}
          wireframe={type === "sphere"}
        />
      </mesh>
      {type !== "sphere" && (
        <mesh>
          {type === "cube" ? (
            <boxGeometry args={[1.22, 1.22, 1.22]} />
          ) : (
            <octahedronGeometry args={[1.02]} />
          )}
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={0.2}
            wireframe
            transparent
            opacity={0.25}
          />
        </mesh>
      )}
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
    <Canvas camera={{ position: [0, 0, 3.5], fov: 40 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 3]} intensity={2} color={color} />
      <pointLight position={[-3, -3, 3]} intensity={1} color="#ffffff" />
      <Shape color={color} emissive={emissive} type={type} />
    </Canvas>
  );
}
