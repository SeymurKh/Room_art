"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uProgress;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  void main() {
    vec2 uv = vUv;

    float n = noise(uv * 4.0);
    float dissolve = 1.0 - smoothstep(uProgress - 0.3, uProgress + 0.3, n);

    vec4 color = texture2D(uTexture, uv);
    color.a *= 1.0 - dissolve;
    color.rgb *= mix(0.1, 1.0, 1.0 - dissolve);

    if (color.a < 0.01) discard;
    gl_FragColor = color;
  }
`;

function SlideshowPlane({
  texture,
  progressRef,
}: {
  texture: THREE.Texture;
  progressRef: React.MutableRefObject<number>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const imgData = texture.source.data as { width?: number; height?: number } | undefined;
  const imgW = imgData?.width ?? 4;
  const imgH = imgData?.height ?? 5;
  const imgAspect = imgW / imgH;
  const viewportAspect = viewport.width / viewport.height;

  let scaleX: number;
  let scaleY: number;
  if (imgAspect > viewportAspect) {
    scaleY = viewport.height;
    scaleX = viewport.height * imgAspect;
  } else {
    scaleX = viewport.width;
    scaleY = viewport.width / imgAspect;
  }

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value += delta;
    materialRef.current.uniforms.uProgress.value = progressRef.current;
  });

  return (
    <mesh ref={meshRef} scale={[scaleX, scaleY, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTexture: { value: texture },
          uTime: { value: 0 },
          uProgress: { value: 0 },
        }}
        transparent
      />
    </mesh>
  );
}

function SlideshowScene({
  textures,
  activeIndex,
}: {
  textures: THREE.Texture[];
  activeIndex: number;
}) {
  // Two stable refs — never recreated between renders
  const progressOutRef = useRef(0); // 0→1: old slide dissolves away
  const progressInRef = useRef(1);  // 1→0: new slide appears

  useFrame((_, delta) => {
    const speed = 1.2;
    const currentOut = progressOutRef.current;
    const currentIn = progressInRef.current;

    if (Math.abs(currentOut - 1.0) > 0.001) {
      progressOutRef.current += (1.0 - currentOut) * speed * delta;
    }
    if (Math.abs(currentIn - 0.0) > 0.001) {
      progressInRef.current += (0.0 - currentIn) * speed * delta;
    }
  });

  // Reset both on slide change
  const prevActiveRef = useRef(activeIndex);
  useEffect(() => {
    if (prevActiveRef.current !== activeIndex) {
      progressOutRef.current = 0;
      progressInRef.current = 1;
      prevActiveRef.current = activeIndex;
    }
  }, [activeIndex]);

  if (textures.length === 0) return null;

  const prevIndex = (activeIndex - 1 + textures.length) % textures.length;

  return (
    <>
      <SlideshowPlane
        key={`out-${activeIndex}`}
        texture={textures[prevIndex]}
        progressRef={progressOutRef}
      />
      <SlideshowPlane
        key={`in-${activeIndex}`}
        texture={textures[activeIndex]}
        progressRef={progressInRef}
      />
      {/* Dark overlay */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.5} />
      </mesh>
    </>
  );
}

export function HeroSlideshowShader({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [images.length]);

  const [textures, setTextures] = useState<THREE.Texture[]>([]);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let cancelled = false;

    Promise.all(
      images.map(
        (src) =>
          new Promise<THREE.Texture>((resolve) => {
            loader.load(src, (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace;
              resolve(tex);
            });
          })
      )
    ).then((texs) => {
      if (!cancelled) setTextures(texs);
    });

    return () => {
      cancelled = true;
    };
  }, [images]);

  if (textures.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#0c0c0b]">
        <span className="text-xs uppercase tracking-[0.16em] text-white/30">
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <Canvas
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 0, 1], fov: 45 }}
        style={{ background: "#0c0c0b" }}
      >
        <SlideshowScene textures={textures} activeIndex={activeIndex} />
      </Canvas>
    </div>
  );
}