"use client";

import { useRef, useState, ReactNode, CSSProperties } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  href?: string;
  strength?: number;
}

export default function MagneticButton({
  children,
  className = "",
  style,
  onClick,
  href,
  strength = 0.25,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);
  const [transform, setTransform] = useState("");

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTransform(`translate(${x * strength}px, ${y * strength}px)`);
  };

  const handleLeave = () => setTransform("translate(0px, 0px)");

  const combinedStyle: CSSProperties = {
    ...style,
    transform,
    transition: transform
      ? "transform 200ms cubic-bezier(0.16, 1, 0.3, 1)"
      : "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)",
  };

  if (href) {
    return (
      <a
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ref union over anchor/button
        ref={ref as any}
        href={href}
        className={className}
        style={combinedStyle}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ref union over anchor/button
      ref={ref as any}
      className={className}
      style={combinedStyle}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </button>
  );
}
export { MagneticButton };
