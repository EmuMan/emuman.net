"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";

interface RotatingImageProps {
  src: string;
  /** Rotation speed in radians per second */
  rotationSpeed?: number;
  opacity?: number;
  top?: string;
  left?: string;
  zIndex?: number;
  blendMode?: React.CSSProperties["mixBlendMode"];
}

export default function RotatingImage({
  src,
  rotationSpeed = 0.024,
  opacity = 1.0,
  top = "calc(50% + 10vh)",
  left = "50%",
  zIndex = -4,
  blendMode = "screen",
}: RotatingImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageLoad = useCallback(() => {
    const el = containerRef.current;
    if (el) el.style.opacity = String(opacity);
  }, [opacity]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let angle = 0;
    let lastTime: number | null = null;
    let animationId: number;

    function rotate(time: number) {
      if (lastTime !== null) {
        const dt = (time - lastTime) / 1000;
        angle += rotationSpeed * dt;
        el!.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
      }
      lastTime = time;
      animationId = requestAnimationFrame(rotate);
    }

    animationId = requestAnimationFrame(rotate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [rotationSpeed]);

  return (
    <div
      ref={containerRef}
      className="fixed pointer-events-none opacity-0 transition-opacity duration-800 ease-in"
      style={{
        top,
        left,
        zIndex,
        width: "141.42vmax",
        height: "141.42vmax",
        mixBlendMode: blendMode,
      }}
    >
      <Image
        src={src}
        alt=""
        fill
        unoptimized
        draggable={false}
        className="block object-cover select-none"
        onLoad={handleImageLoad}
      />
    </div>
  );
}
