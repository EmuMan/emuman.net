"use client";

import { useEffect, useRef } from "react";
import BloomFilter from "./BloomFilter";

const FIELD_RADIUS = 1500;
const ROTATION_SPEED = 0.0004;

const starColors = [
  // Blue-white (hot O/B type)
  "#cde0ff",
  "#d8e8ff",
  "#e4efff",
  "#f2f6ff",
  // White (A type)
  "#ffffff",
  "#f8faff",
  // Yellow-white (F type)
  "#fffaf0",
  "#fff4dc",
  // Yellow (G type)
  "#fff3c8",
  "#ffefb8",
  // Orange (K type)
  "#ffddb0",
  "#ffd4a0",
  // Red (M type)
  "#ffccb0",
  "#ffc4a8",
  "#ffbda0",
  // Rare blue giants
  "#b8d8ff",
  "#a8ccff",
];

const accentColors = ["#ffe0ff", "#ddc8ff", "#c8ddff", "#ffe8c8"];

interface Star {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

function randomStarColor(): string {
  const r = Math.random();
  if (r < 0.03)
    return accentColors[Math.floor(Math.random() * accentColors.length)];
  if (r < 0.12) return starColors[Math.floor(Math.random() * 4)];
  if (r < 0.25) return starColors[4 + Math.floor(Math.random() * 2)];
  if (r < 0.4) return starColors[6 + Math.floor(Math.random() * 2)];
  if (r < 0.55) return starColors[8 + Math.floor(Math.random() * 2)];
  if (r < 0.7) return starColors[10 + Math.floor(Math.random() * 2)];
  return starColors[12 + Math.floor(Math.random() * 3)];
}

function starDistribution(): { x: number; y: number } {
  const t = Math.random();
  let r: number;
  if (t < 0.6) {
    r = Math.pow(Math.random(), 0.5) * FIELD_RADIUS * 0.6;
  } else {
    r = FIELD_RADIUS * (0.4 + Math.random() * 0.6);
  }
  const angle = Math.random() * Math.PI * 2;
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
}

function buildStars(count: number): Star[] {
  return Array.from({ length: count }, () => {
    const pos = starDistribution();
    const distFraction = Math.hypot(pos.x, pos.y) / FIELD_RADIUS;
    const brightness = 1 - distFraction * 0.6;
    const isBright = Math.random() < 0.03;
    return {
      x: pos.x,
      y: pos.y,
      radius: isBright ? Math.random() * 1.8 + 1.0 : Math.random() * 0.9 + 0.2,
      color: randomStarColor(),
      alpha: brightness * (0.5 + Math.random() * 0.5),
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
    };
  });
}

function groupStars(stars: Star[]): Map<string, Star[]> {
  const groups = new Map<string, Star[]>();
  for (const star of stars) {
    const group = groups.get(star.color);
    if (group) {
      group.push(star);
    } else {
      groups.set(star.color, [star]);
    }
  }
  return groups;
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let angle = 0;
    let t = 0;
    let animationId: number;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Firefox SVG filter workaround: initialize with a small render first
    let stars = buildStars(100);
    let starGroupMap = groupStars(stars);

    function draw() {
      t++;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const cx = canvas!.width / 2;
      const cy = canvas!.height / 2 + window.innerHeight * 0.1;

      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.rotate(angle);

      for (const [color, group] of starGroupMap) {
        ctx!.fillStyle = color;
        ctx!.shadowColor = color;

        for (const star of group) {
          const twinkle =
            0.85 + 0.15 * Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
          const r = star.radius * twinkle;
          const alpha = star.alpha * twinkle;

          ctx!.globalAlpha = alpha;
          ctx!.shadowBlur = r > 1.2 ? r * 4 : 0;
          ctx!.beginPath();
          ctx!.arc(star.x, star.y, r, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      ctx!.restore();
      ctx!.globalAlpha = 1;
      ctx!.shadowBlur = 0;

      angle += ROTATION_SPEED;
      animationId = requestAnimationFrame(draw);
    }

    draw();

    // After initial small render, rebuild with full star count and fade in
    const timeout = setTimeout(() => {
      stars = buildStars(10000);
      starGroupMap = groupStars(stars);
      canvas!.style.opacity = "1";
    }, 200);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(timeout);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <BloomFilter />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-5 w-full h-full opacity-0 transition-opacity duration-800 ease-in"
        style={{ filter: "url(#bloom)" }}
      />
    </>
  );
}
