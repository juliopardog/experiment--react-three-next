# React Three Next — Architecture & Best Practices

Skill for building immersive 3D sites with Next.js App Router + React Three Fiber (R3F). Based on the pmndrs/react-three-next template and production patterns.

## Trigger
Use this skill whenever working on 3D scenes, Canvas components, Three.js objects, React Three Fiber hooks, or any file in `components/three/`.

---

## Core Architecture

### Canvas Placement
The Canvas must be a **background layer** — `position: absolute; inset: 0` — not a column or box inside a layout. HTML text/UI goes on top with `position: relative; z-index: 10`.

```tsx
<section className="relative min-h-screen">
  <div className="absolute inset-0">   {/* 3D fills everything */}
    <ThreeScene />
  </div>
  <div className="relative z-10">      {/* HTML floats on top */}
    <h1>Your content here</h1>
  </div>
</section>
```

### SSR Safety
All R3F components MUST be dynamically imported with `ssr: false` in Next.js App Router:

```tsx
const Scene = dynamic(() => import('./three/Scene'), { ssr: false })
```

Never import Canvas directly in a server component.

### Client Boundary
Every file that uses `Canvas`, `useFrame`, `useThree`, or any R3F hook needs `"use client"` at the top.

---

## The tunnel-rat Pattern (pmndrs pattern)
For rendering HTML that needs to live inside the R3F tree (e.g. HUD, labels), use `tunnel-rat`:

```tsx
// helpers/global.ts
import tunnel from 'tunnel-rat'
export const r3f = tunnel()

// In your layout — the tunnel out point
<r3f.Out />

// Inside a Canvas scene — the tunnel in point
<r3f.In>
  <Html>Overlay content rendered in DOM but positioned in 3D</Html>
</r3f.In>
```

---

## Materials — Choosing the Right One

| Goal | Material | Key props |
|---|---|---|
| Glowing neon without env map | `meshStandardMaterial` | `emissive={color}`, `emissiveIntensity={1-2}`, `metalness={0.1-0.2}` |
| Metallic/reflective | `meshStandardMaterial` | Requires `<Environment>` or strong point lights |
| Cartoon/flat | `meshLambertMaterial` | Cheap, no specular |
| Shiny/phong | `meshPhongMaterial` | `shininess`, no env map needed |
| Wireframe overlay | `meshStandardMaterial` | `wireframe={true}`, `transparent`, `opacity={0.15-0.25}` |

**Never use `metalness: 1` without an Environment preset** — it renders black because metallic materials only show color from reflections.

---

## Mouse Tracking (Parallax)
R3F's `state.mouse` is pre-normalized to [-1, 1]. Use `THREE.MathUtils.lerp` for smooth following:

```tsx
function MouseTracker({ children }) {
  const ref = useRef()
  useFrame((state) => {
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, state.mouse.x * 0.3, 0.04)
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -state.mouse.y * 0.2, 0.04)
  })
  return <group ref={ref}>{children}</group>
}
```

---

## Performance Rules
- Set `dpr={[1, 2]}` on Canvas — never uncapped, mobile GPUs will die
- Use `useMemo` for all geometry that doesn't change (particle positions, etc.)
- Prefer `useRef` over `useState` inside `useFrame` — state triggers re-renders, refs don't
- Use `<Float>` from drei for bobbing/floating — it's optimized
- Particles: `<points>` + `<bufferGeometry>` + `<bufferAttribute>` — never individual meshes

---

## Lighting Without Environment
When `<Environment>` preset is unavailable (network blocked, offline), use multiple colored point lights:

```tsx
<ambientLight intensity={0.3} />
<pointLight position={[3, 3, 5]} intensity={8} color="#00D4FF" />
<pointLight position={[-3, -3, 5]} intensity={6} color="#FF006E" />
<pointLight position={[0, 5, 3]} intensity={4} color="#7B2FFF" />
```

Colored point lights close to the object (z: 3-5) simulate the fill that env maps provide.

---

## Useful Drei Components
- `<Float>` — gentle bobbing/floating motion
- `<Sparkles>` — animated particle sparks
- `<Html>` — render DOM elements positioned in 3D space
- `<ScrollControls>` — scroll-driven camera/scene animation
- `<useScroll>` — read scroll offset inside Canvas
- `<MeshDistortMaterial>` — animated blob/organic shape distortion
- `<Text>` — 3D text without font loading headaches

---

## Scroll-Driven Animation Pattern
For scroll-reactive 3D scenes:

```tsx
import { ScrollControls, useScroll } from '@react-three/drei'

// Wrap Canvas children:
<ScrollControls pages={4} damping={0.1}>
  <Scene />
</ScrollControls>

// Inside Scene:
function Scene() {
  const scroll = useScroll()
  useFrame(() => {
    const offset = scroll.offset // 0 to 1
    mesh.current.position.z = offset * -10
  })
}
```

---

## Project File Structure
```
components/
  three/          ← All R3F/Canvas components (all "use client")
    HeroScene.tsx
    FeatureScene.tsx
  Hero.tsx        ← dynamic import of three/, text overlay
  Features.tsx    ← dynamic import of three/, layout
app/
  page.tsx        ← Server component, imports section components
  layout.tsx      ← Font, metadata
  globals.css     ← Tailwind v4, CSS variables, utility classes
```
