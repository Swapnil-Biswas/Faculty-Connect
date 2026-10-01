"use client";

import { useEffect, useRef } from "react";

interface Point3D {
  x: number;
  y: number;
  z: number;
  char: string;
}

interface DotMatrixPatternProps {
  className?: string;
  style?: React.CSSProperties;
  color?: string; // primary sphere color (defaults to gold #FFD700)
  accentColor?: string; // secondary binary color (defaults to cyan #38BDF8)
}

export function DotMatrixPattern({
  className = "",
  style,
  color = "#FFD700",
  accentColor = "#38BDF8",
}: DotMatrixPatternProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    let width = container.clientWidth || 400;
    let height = container.clientHeight || 400;
    const gap = 20;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const baseRadius = 2.4;

    // Generate 3D points on a sphere (Fibonacci sphere distribution)
    const points: Point3D[] = [];
    const numPoints = 140;
    const codingChars = [
      "{", "}", "<", ">", "/", ";", "1", "0", "0", "1",
      "f", "c", "(", ")", "[", "]", "+", "=", "!", "&", "|", "λ"
    ];

    for (let i = 0; i < numPoints; i++) {
      const lat = Math.acos(1 - (2 * (i + 0.5)) / numPoints);
      const lon = Math.PI * (1 + Math.sqrt(5)) * i; // Golden angle
      points.push({
        x: Math.sin(lat) * Math.cos(lon),
        y: Math.sin(lat) * Math.sin(lon),
        z: Math.cos(lat),
        char: codingChars[i % codingChars.length],
      });
    }

    // Rotation angles
    let rx = 0.5;
    let ry = 0.5;
    let targetRx = 0.5;
    let targetRy = 0.5;
    let dragRx = 0.5;
    let dragRy = 0.5;
    let isDragging = false;

    const mouse = { x: -1000, y: -1000, active: false, startX: 0, startY: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (isDragging) {
        const dx = mx - mouse.startX;
        const dy = my - mouse.startY;
        targetRy = dragRy + dx * 0.005;
        targetRx = dragRx - dy * 0.005;
      } else {
        mouse.x = mx;
        mouse.y = my;
        mouse.active = true;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.startX = e.clientX - rect.left;
      mouse.startY = e.clientY - rect.top;
      dragRx = targetRx;
      dragRy = targetRy;
      isDragging = true;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleMouseLeave = () => {
      isDragging = false;
      mouse.active = false;
    };

    const handleResize = () => {
      if (!canvas || !container) return;
      width = container.clientWidth || 400;
      height = container.clientHeight || 400;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / gap);
      const rows = Math.ceil(height / gap);
      const sphereScale = Math.min(width, height) * 0.40;

      const focalX = width * 0.5;
      const focalY = height * 0.5;
      const maxDist = Math.sqrt(width * width + height * height) * 0.55;

      // Smooth rotation interpolation
      rx += (targetRx - rx) * 0.08;
      ry += (targetRy - ry) * 0.08;

      if (!isDragging) {
        targetRy += 0.003;
        targetRx += 0.0015;
      }

      interface GridCellState {
        char: string;
        z: number;
        opacity: number;
      }
      const gridMap: Record<string, GridCellState> = {};

      for (const p of points) {
        // Rotate around Y-axis
        const x1 = p.x * Math.cos(ry) - p.z * Math.sin(ry);
        const z1 = p.x * Math.sin(ry) + p.z * Math.cos(ry);

        // Rotate around X-axis
        const y2 = p.y * Math.cos(rx) - z1 * Math.sin(rx);
        const z2 = p.y * Math.sin(rx) + z1 * Math.cos(rx);

        // Project onto 2D screen coordinates
        const sx = width / 2 + x1 * sphereScale;
        const sy = height / 2 + y2 * sphereScale;

        const c = Math.round((sx - gap / 2) / gap);
        const r = Math.round((sy - gap / 2) / gap);

        if (c >= 0 && c < cols && r >= 0 && r < rows) {
          const key = `${c},${r}`;
          if (!gridMap[key] || z2 > gridMap[key].z) {
            const opacity = 0.25 + ((z2 + 1) / 2) * 0.75;
            gridMap[key] = {
              char: p.char,
              z: z2,
              opacity: opacity,
            };
          }
        }
      }

      const mouseRadius = 85;
      const maxDisplacement = 14;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * gap + gap / 2;
          const y = r * gap + gap / 2;

          const distToFocal = Math.sqrt((x - focalX) ** 2 + (y - focalY) ** 2);
          const normalizedDist = distToFocal / maxDist;
          let baseOpacity = Math.max(0, 1 - normalizedDist * 1.1);
          baseOpacity = baseOpacity * baseOpacity;

          if (baseOpacity < 0.01) continue;

          let px = x;
          let py = y;
          let distToMouse = 9999;
          let isNearMouse = false;

          if (mouse.active) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            distToMouse = Math.sqrt(dx * dx + dy * dy);

            if (distToMouse < mouseRadius && distToMouse > 0) {
              isNearMouse = true;
              const force = (mouseRadius - distToMouse) / mouseRadius;
              const push = force * maxDisplacement;
              px += (dx / distToMouse) * push;
              py += (dy / distToMouse) * push;
            }
          }

          const key = `${c},${r}`;
          const activeCell = gridMap[key];

          if (activeCell) {
            // Render 3D sphere projected character in luminous Gold
            const finalOpacity = baseOpacity * activeCell.opacity;
            const fontSize = Math.max(10, Math.round(11 + activeCell.z * 5));

            ctx.font = `${activeCell.z > 0.3 ? "700" : "500"} ${fontSize}px var(--font-mono, monospace)`;
            ctx.fillStyle = `rgba(255, 215, 0, ${finalOpacity})`;
            if (activeCell.z > 0.2) {
              ctx.shadowColor = "rgba(255, 215, 0, 0.4)";
              ctx.shadowBlur = 8;
            } else {
              ctx.shadowBlur = 0;
            }
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(activeCell.char, px, py);
            ctx.shadowBlur = 0;
          } else if (isNearMouse) {
            // Reveal binary noise in Cyber Cyan near mouse
            const hoverStrength = (mouseRadius - distToMouse) / mouseRadius;
            const finalOpacity = baseOpacity * hoverStrength * 0.85;
            const binChar = (c + r + Math.floor(Date.now() / 250)) % 2 === 0 ? "1" : "0";

            ctx.font = `600 10px var(--font-mono, monospace)`;
            ctx.fillStyle = `rgba(56, 189, 248, ${finalOpacity})`;
            ctx.shadowColor = "rgba(56, 189, 248, 0.5)";
            ctx.shadowBlur = 6;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(binChar, px, py);
            ctx.shadowBlur = 0;
          } else {
            // Background dot matrix field
            const finalOpacity = baseOpacity * 0.18;
            ctx.beginPath();
            ctx.arc(px, py, baseRadius * (0.35 + baseOpacity * 0.65), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
            ctx.fill();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, [color, accentColor]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 280,
        position: "relative",
        cursor: "grab",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", userSelect: "none" }}
        aria-hidden="true"
      />
    </div>
  );
}

export default DotMatrixPattern;
