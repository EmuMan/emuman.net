"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";

const ROTATION_SPEED = 0.0004; // radians per frame (matches Starfield)

export default function MilkyWay() {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageLoad = useCallback(() => {
    const el = containerRef.current;
    if (el) el.style.opacity = "0.5";
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let angle = 0;
    let animationId: number;

    function rotate() {
      angle += ROTATION_SPEED;
      el!.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
      animationId = requestAnimationFrame(rotate);
    }

    animationId = requestAnimationFrame(rotate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed top-[calc(50%+10vh)] left-1/2 -z-4 pointer-events-none opacity-0 transition-opacity duration-800 ease-in"
      style={{
        // ~141.5% of viewport diagonal ensures full coverage at any rotation angle
        width: "141.42vmax",
        height: "141.42vmax",
        mixBlendMode: "screen",
      }}
    >
      <Image
        src="/images/milkyway_bright.png"
        alt=""
        fill
        draggable={false}
        className="block object-cover select-none"
        onLoad={handleImageLoad}
      />
    </div>
  );
}
