"use client";

import { useEffect, useRef } from "react";

interface DotMatrixCanvasProps {
  text: string;
  fontSize?: number;
  dotRadius?: number;
  dotGap?: number;
  color?: string;
  animate?: boolean;
  animDelay?: number;
  style?: React.CSSProperties;
  className?: string;
}

// 5x7 Dot Matrix Font Dictionary
const FONT_5X7: Record<string, number[]> = {
  A: [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  B: [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  C: [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  D: [0x1e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1e],
  E: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  F: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  G: [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0e],
  H: [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  I: [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  J: [0x1f, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0c],
  K: [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  L: [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  M: [0x11, 0x1b, 0x15, 0x11, 0x11, 0x11, 0x11],
  N: [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
  O: [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  P: [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  Q: [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  R: [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  S: [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e],
  T: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  U: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  V: [0x11, 0x11, 0x11, 0x11, 0x0a, 0x0a, 0x04],
  W: [0x11, 0x11, 0x11, 0x15, 0x15, 0x1b, 0x11],
  X: [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  Y: [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
  Z: [0x1f, 0x02, 0x04, 0x04, 0x08, 0x10, 0x1f],
  "0": [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  "1": [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  "2": [0x0e, 0x11, 0x01, 0x06, 0x08, 0x10, 0x1f],
  "3": [0x1e, 0x01, 0x01, 0x0e, 0x01, 0x01, 0x1e],
  "4": [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  "5": [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  "6": [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  "7": [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  "8": [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  "9": [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  "-": [0x00, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x00],
  "+": [0x00, 0x04, 0x04, 0x1f, 0x04, 0x04, 0x00],
  ":": [0x00, 0x0c, 0x0c, 0x00, 0x0c, 0x0c, 0x00],
  ".": [0x00, 0x00, 0x00, 0x00, 0x00, 0x0c, 0x0c],
  "/": [0x01, 0x02, 0x04, 0x08, 0x10, 0x00, 0x00],
  "&": [0x0c, 0x12, 0x14, 0x08, 0x15, 0x12, 0x0d],
  " ": [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
};

export function DotMatrixCanvas({
  text,
  fontSize = 44,
  dotRadius,
  dotGap,
  color = "#FFD700",
  animate = false,
  animDelay = 0,
  style,
  className = "",
}: DotMatrixCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    // Prominent, highly legible dot sizing
    const gap = dotGap || Math.max(6, Math.round(fontSize / 6.5));
    const radius = dotRadius || Math.max(1.8, gap * 0.32);

    const charWidth = 5;
    const charHeight = 7;
    const charSpacing = 0.8;

    const upperText = text.toUpperCase();
    const len = upperText.length;

    interface InteractiveDot {
      ox: number;
      oy: number;
      x: number;
      y: number;
      col: number;
    }
    const dots: InteractiveDot[] = [];
    const padDots = 1.0;
    let currentCol = padDots;

    for (let charIdx = 0; charIdx < len; charIdx++) {
      const char = upperText[charIdx];
      const charMatrix = FONT_5X7[char] || FONT_5X7[" "];

      let minCol = 4;
      let maxCol = 0;
      let hasDots = false;

      for (let r = 0; r < charHeight; r++) {
        const rowVal = charMatrix[r];
        for (let c = 0; c < charWidth; c++) {
          if ((rowVal & (1 << (4 - c))) !== 0) {
            if (c < minCol) minCol = c;
            if (c > maxCol) maxCol = c;
            hasDots = true;
          }
        }
      }

      const actualMinCol = hasDots ? minCol : 0;
      const actualMaxCol = hasDots ? maxCol : 2;
      const activeWidth = actualMaxCol - actualMinCol + 1;

      if (hasDots) {
        for (let r = 0; r < charHeight; r++) {
          const rowVal = charMatrix[r];
          for (let c = actualMinCol; c <= actualMaxCol; c++) {
            if ((rowVal & (1 << (4 - c))) !== 0) {
              const dx = (currentCol + (c - actualMinCol) + 0.5) * gap;
              const dy = (padDots + r + 0.5) * gap;
              dots.push({
                ox: dx,
                oy: dy,
                x: dx,
                y: dy,
                col: currentCol + (c - actualMinCol),
              });
            }
          }
        }
      }

      currentCol += activeWidth + charSpacing;
    }

    const totalCols = currentCol - charSpacing + padDots;
    const w = Math.ceil(totalCols * gap);
    const h = Math.ceil((charHeight + padDots * 2) * gap);

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    if (dots.length === 0) return;

    const mouse = { x: -1000, y: -1000, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) * (w / rect.width);
      mouse.y = (e.clientY - rect.top) * (h / rect.height);
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const hoverRadius = 55;
    const maxDisplacement = 18;
    const easeSpeed = 0.14;

    const startTime = performance.now() + animDelay;
    let animId: number;

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      const elapsed = Math.max(0, now - startTime);

      for (const d of dots) {
        let targetX = d.ox;
        let targetY = d.oy;

        if (mouse.active) {
          const dx = d.ox - mouse.x;
          const dy = d.oy - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < hoverRadius && dist > 0) {
            const force = (hoverRadius - dist) / hoverRadius;
            const push = force * maxDisplacement;
            targetX = d.ox + (dx / dist) * push;
            targetY = d.oy + (dy / dist) * push;
          }
        }

        d.x += (targetX - d.x) * easeSpeed;
        d.y += (targetY - d.y) * easeSpeed;

        const dotDelay = d.col * 8;
        const opacity = animate
          ? elapsed < dotDelay
            ? 0
            : Math.min(1, (elapsed - dotDelay) / 200)
          : 1;

        if (opacity <= 0.01) continue;

        ctx.beginPath();
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);

        // Luminous glowing dot matrix aesthetic
        if (color === "#FFD700" || color.includes("255, 215, 0")) {
          ctx.fillStyle = `rgba(255, 215, 0, ${opacity * 0.95})`;
          ctx.shadowColor = "rgba(255, 215, 0, 0.4)";
          ctx.shadowBlur = 5;
        } else if (color === "#38BDF8" || color.includes("56, 189, 248")) {
          ctx.fillStyle = `rgba(56, 189, 248, ${opacity * 0.95})`;
          ctx.shadowColor = "rgba(56, 189, 248, 0.4)";
          ctx.shadowBlur = 5;
        } else {
          ctx.fillStyle = color;
          ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [text, fontSize, dotRadius, dotGap, color, animate, animDelay]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: "block",
        cursor: "crosshair",
        maxWidth: "100%",
        ...style,
      }}
      aria-label={text}
      role="img"
    />
  );
}

export default DotMatrixCanvas;
