"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

/* ── Intro timeline (seconds since canvas mount) ─────────────────────
   Scattered particles assemble into the rooster-P logo silhouette,
   hold, then stream into the torus knot as the real mesh fades in.
   Plays once per load; skipped entirely under prefers-reduced-motion. */
const INTRO = {
  assembleStart: 0.15,
  assembleDur: 1.5,
  assembleStagger: 0.25,
  morphStart: 3.2,
  morphDur: 1.7,
  morphStagger: 0.5,
  orbFadeStart: 4.2,
  orbFadeDur: 1.0,
  particleFadeStart: 4.7,
  particleFadeDur: 1.1,
  end: 6.0,
};

const PARTICLE_COUNT = 6500;
const LOGO_CENTER_X = 1.5; // matches MainOrb position
const LOGO_HEIGHT = 4.4;

interface LogoCloud {
  positions: Float32Array; // [x,y,z] per opaque pixel, centered on origin
  colors: Float32Array; // [r,g,b] 0-1 per pixel, sampled from the logo
  count: number;
}

/** Sample the opaque pixels of the logo PNG into a colored point cloud. */
function sampleLogoPoints(url: string, grid = 140): Promise<LogoCloud> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = grid;
        canvas.height = grid;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no 2d context"));
        ctx.drawImage(img, 0, 0, grid, grid);
        const data = ctx.getImageData(0, 0, grid, grid).data;

        const pos: number[] = [];
        const col: number[] = [];
        for (let py = 0; py < grid; py++) {
          for (let px = 0; px < grid; px++) {
            const i = (py * grid + px) * 4;
            if (data[i + 3] > 100) {
              pos.push(
                ((px + 0.5) / grid - 0.5) * LOGO_HEIGHT,
                -(((py + 0.5) / grid - 0.5) * LOGO_HEIGHT),
                (Math.random() - 0.5) * 0.4
              );
              col.push(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);
            }
          }
        }
        if (pos.length === 0) return reject(new Error("logo image is empty"));
        resolve({
          positions: new Float32Array(pos),
          colors: new Float32Array(col),
          count: pos.length / 3,
        });
      } catch (e) {
        reject(e); // e.g. canvas tainted
      }
    };
    img.onerror = () => reject(new Error("logo failed to load"));
    img.src = url;
  });
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

const TARGET_COLOR = new THREE.Color("#00D4FF");

function MorphIntro({ logo }: { logo: LogoCloud }) {
  const geomRef = useRef<THREE.BufferGeometry>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const doneRef = useRef(false);
  const [done, setDone] = useState(false);

  const data = useMemo(() => {
    const n = PARTICLE_COUNT;
    const start = new Float32Array(n * 3); // scattered fly-in origins
    const logoPos = new Float32Array(n * 3); // rooster silhouette
    const torusPos = new Float32Array(n * 3); // torus knot surface
    const baseCol = new Float32Array(n * 3); // logo pixel colors
    const work = new Float32Array(n * 3); // mutated every frame
    const workCol = new Float32Array(n * 3);
    const seeds = new Float32Array(n);
    const swirl = new Float32Array(n * 3); // per-particle arc direction

    // Torus knot surface points — same params/position as MainOrb
    const torusGeom = new THREE.TorusKnotGeometry(1.8, 0.55, 200, 20, 2, 3);
    const tp = torusGeom.attributes.position;
    const torusCount = tp.count;

    for (let i = 0; i < n; i++) {
      // fly-in origin: shell around the scene
      const r = 8 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      start[i * 3] = LOGO_CENTER_X + r * Math.sin(phi) * Math.cos(theta);
      start[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      start[i * 3 + 2] = r * Math.cos(phi) - 2;

      // rooster target: random opaque pixel, jittered off the sampling grid
      // so rows of dots don't fuse into solid stripes
      const li = Math.floor(Math.random() * logo.count);
      logoPos[i * 3] = LOGO_CENTER_X + logo.positions[li * 3] + (Math.random() - 0.5) * 0.036;
      logoPos[i * 3 + 1] = logo.positions[li * 3 + 1] + (Math.random() - 0.5) * 0.036;
      logoPos[i * 3 + 2] = logo.positions[li * 3 + 2];
      baseCol[i * 3] = logo.colors[li * 3];
      baseCol[i * 3 + 1] = logo.colors[li * 3 + 1];
      baseCol[i * 3 + 2] = logo.colors[li * 3 + 2];

      // torus target: random surface vertex
      const ti = Math.floor(Math.random() * torusCount);
      torusPos[i * 3] = LOGO_CENTER_X + tp.getX(ti);
      torusPos[i * 3 + 1] = tp.getY(ti);
      torusPos[i * 3 + 2] = tp.getZ(ti);

      seeds[i] = Math.random();

      // random unit vector for the mid-morph swirl arc
      const st = Math.random() * Math.PI * 2;
      const sp = Math.acos(2 * Math.random() - 1);
      swirl[i * 3] = Math.sin(sp) * Math.cos(st);
      swirl[i * 3 + 1] = Math.sin(sp) * Math.sin(st);
      swirl[i * 3 + 2] = Math.cos(sp);

      work[i * 3] = start[i * 3];
      work[i * 3 + 1] = start[i * 3 + 1];
      work[i * 3 + 2] = start[i * 3 + 2];
      workCol[i * 3] = baseCol[i * 3];
      workCol[i * 3 + 1] = baseCol[i * 3 + 1];
      workCol[i * 3 + 2] = baseCol[i * 3 + 2];
    }
    torusGeom.dispose();
    return { start, logoPos, torusPos, baseCol, work, workCol, seeds, swirl };
  }, [logo]);

  useFrame((state) => {
    if (doneRef.current || !geomRef.current) return;
    const t = state.clock.elapsedTime;

    if (t > INTRO.end) {
      doneRef.current = true;
      setDone(true);
      return;
    }

    const { start, logoPos, torusPos, baseCol, work, workCol, seeds, swirl } = data;
    const n = PARTICLE_COUNT;

    for (let i = 0; i < n; i++) {
      const seed = seeds[i];
      const a = easeOutCubic(
        clamp01((t - INTRO.assembleStart - seed * INTRO.assembleStagger) / INTRO.assembleDur)
      );
      const m = easeInOutCubic(
        clamp01((t - INTRO.morphStart - seed * INTRO.morphStagger) / INTRO.morphDur)
      );

      const ix = i * 3;
      // start → rooster → torus
      let x = start[ix] + (logoPos[ix] - start[ix]) * a;
      let y = start[ix + 1] + (logoPos[ix + 1] - start[ix + 1]) * a;
      let z = start[ix + 2] + (logoPos[ix + 2] - start[ix + 2]) * a;
      x += (torusPos[ix] - x) * m;
      y += (torusPos[ix + 1] - y) * m;
      z += (torusPos[ix + 2] - z) * m;

      // arc outward mid-morph so the swarm flows instead of sliding
      const arc = Math.sin(m * Math.PI) * 0.7;
      x += swirl[ix] * arc;
      y += swirl[ix + 1] * arc;
      z += swirl[ix + 2] * arc;

      // gentle shimmer while the rooster holds
      if (a >= 1 && m <= 0) {
        y += Math.sin(t * 2.2 + i * 0.37) * 0.012;
      }

      work[ix] = x;
      work[ix + 1] = y;
      work[ix + 2] = z;

      // logo pixel color → torus cyan as each particle departs
      workCol[ix] = baseCol[ix] + (TARGET_COLOR.r - baseCol[ix]) * m;
      workCol[ix + 1] = baseCol[ix + 1] + (TARGET_COLOR.g - baseCol[ix + 1]) * m;
      workCol[ix + 2] = baseCol[ix + 2] + (TARGET_COLOR.b - baseCol[ix + 2]) * m;
    }

    geomRef.current.attributes.position.needsUpdate = true;
    geomRef.current.attributes.color.needsUpdate = true;

    if (matRef.current) {
      matRef.current.opacity =
        1 - clamp01((t - INTRO.particleFadeStart) / INTRO.particleFadeDur);
    }
  });

  if (done) return null;

  return (
    <points>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[data.work, 3]} />
        <bufferAttribute attach="attributes-color" args={[data.workCol, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={0.03}
        vertexColors
        transparent
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

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

function MainOrb({ intro }: { intro: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.12;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.18;
    if (matRef.current) {
      const o = intro
        ? clamp01((state.clock.elapsedTime - INTRO.orbFadeStart) / INTRO.orbFadeDur)
        : 1;
      matRef.current.opacity = o;
      // transparent:true on a self-intersecting knot sorts badly and looks
      // milky — only enable it during the fade itself
      matRef.current.transparent = o < 1;
      meshRef.current.visible = o > 0;
    }
  });
  return (
    <Float speed={1.2} floatIntensity={0.6} rotationIntensity={0}>
      <mesh ref={meshRef} position={[1.5, 0, 0]} visible={!intro}>
        <torusKnotGeometry args={[1.8, 0.55, 256, 24, 2, 3]} />
        <meshStandardMaterial
          ref={matRef}
          color="#00D4FF"
          emissive="#00D4FF"
          emissiveIntensity={1.2}
          metalness={0.2}
          roughness={0.25}
          transparent={intro}
          opacity={intro ? 0 : 1}
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
        emissiveIntensity={2.0}
        metalness={0.1}
        roughness={0.2}
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

/* Deep-background starfield. Emerges as the morph particles collapse into
   the knot — reads as the leftover particles settling into far space, then
   persists with a very slow drift. Static buffer + one rotation = cheap. */
const STAR_REST_OPACITY = 0.6;

function BackgroundStars({ intro, reducedMotion }: { intro: boolean; reducedMotion: boolean }) {
  const count = 1100;
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const tints = [
      [1, 1, 1],
      [1, 1, 1],
      [0.6, 0.85, 1], // faint cyan
      [1, 0.55, 0.8], // faint magenta
      [0.7, 0.55, 1], // faint purple
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 34;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 2] = -8 - Math.random() * 12; // well behind the knot
      const t = tints[Math.floor(Math.random() * tints.length)];
      const b = 0.5 + Math.random() * 0.5;
      col[i * 3] = t[0] * b;
      col[i * 3 + 1] = t[1] * b;
      col[i * 3 + 2] = t[2] * b;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    if (!ref.current || !matRef.current) return;
    const t = state.clock.elapsedTime;
    if (!reducedMotion) ref.current.rotation.y = t * 0.006;
    // Fade in over the morph's exit window, then hold.
    matRef.current.opacity = intro
      ? clamp01((t - INTRO.particleFadeStart) / (INTRO.end - INTRO.particleFadeStart)) *
        STAR_REST_OPACITY
      : STAR_REST_OPACITY;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={0.05}
        vertexColors
        transparent
        opacity={intro ? 0 : STAR_REST_OPACITY}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function HeroScene() {
  const [logo, setLogo] = useState<LogoCloud | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    if (reducedMotion) return;
    let alive = true;
    sampleLogoPoints("/logo-icon.png")
      .then((data) => alive && setLogo(data))
      .catch(() => alive && setLogoFailed(true));
    return () => {
      alive = false;
    };
  }, [reducedMotion]);

  // Intro plays unless the user prefers reduced motion or the logo
  // couldn't be sampled (then the orb just appears on schedule).
  const introActive = !reducedMotion && !logoFailed;

  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 5]} intensity={8} color="#00D4FF" />
      <pointLight position={[-3, -3, 5]} intensity={6} color="#FF006E" />
      <pointLight position={[0, 5, 3]} intensity={4} color="#7B2FFF" />
      <pointLight position={[1.5, 0, 3]} intensity={5} color="#00D4FF" />

      <MouseTracker>
        <MainOrb intro={introActive} />
        {introActive && logo && <MorphIntro logo={logo} />}
        <GlowRing radius={3.2} color="#00D4FF" speed={0.08} tilt={Math.PI / 2.5} />
        <GlowRing radius={3.8} color="#FF006E" speed={-0.06} tilt={Math.PI / 3} />
        <GlowRing radius={4.5} color="#7B2FFF" speed={0.04} tilt={Math.PI / 4} />
        <OrbitingSphere angle={0} radius={3.2} color="#FF006E" size={0.18} />
        <OrbitingSphere angle={2.1} radius={3.2} color="#7B2FFF" size={0.14} />
        <OrbitingSphere angle={4.2} radius={3.2} color="#00D4FF" size={0.2} />
        <OrbitingSphere angle={1} radius={4.5} color="#FF006E" size={0.1} />
        <OrbitingSphere angle={3.5} radius={4.5} color="#7B2FFF" size={0.12} />
      </MouseTracker>

      <BackgroundStars intro={introActive} reducedMotion={reducedMotion} />
      <FieldParticles />
      <Sparkles count={80} size={1.8} speed={0.25} color="#FF006E" opacity={0.5} scale={14} />
      <Sparkles count={60} size={1.2} speed={0.15} color="#7B2FFF" opacity={0.4} scale={12} />
    </Canvas>
  );
}
