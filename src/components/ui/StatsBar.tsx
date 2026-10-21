"use client";

import { useEffect, useRef, useState } from "react";

interface StatProps {
  end: number;
  suffix?: string;
  label: string;
  index: number;
}

function AnimatedStat({ end, suffix = "+", label, index }: StatProps) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let frame: number;
    const duration = 1400;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [visible, end]);

  return (
    <div
      ref={ref}
      className="py-10 sm:py-14 px-6 sm:px-8 flex flex-col items-center justify-center text-center relative group"
    >
      {/* Decorative corner geometric shape */}
      <div className="absolute top-4 right-4">
        {index % 3 === 0 ? (
          <div className="w-3.5 h-3.5 rounded-full bg-[#D02020] border-2 border-[#121212]" />
        ) : index % 3 === 1 ? (
          <div className="w-3.5 h-3.5 bg-[#1040C0] border-2 border-[#121212]" />
        ) : (
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[#121212]" />
        )}
      </div>

      <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#121212] tracking-tighter leading-none mb-3">
        {count}
        <span className="text-[#D02020]">{suffix}</span>
      </div>
      <div className="text-xs sm:text-sm font-black tracking-widest uppercase text-[#121212] leading-tight">
        {label}
      </div>
    </div>
  );
}

interface StatsBarProps {
  stats?: { end: number; suffix?: string; label: string }[];
}

const defaultStats = [
  { end: 120, suffix: "+", label: "Faculty Members" },
  { end: 1450, suffix: "+", label: "Tasks Completed" },
  { end: 380, suffix: "+", label: "Research Papers" },
  { end: 98, suffix: "%", label: "Compliance Index" },
];

export default function StatsBar({ stats = defaultStats }: StatsBarProps) {
  return (
    <section
      id="stats"
      className="bg-[#F0C020] border-b-4 border-[#121212] text-[#121212]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y-4 sm:divide-y-0 sm:divide-x-4 divide-[#121212]">
          {stats.map((stat, idx) => (
            <AnimatedStat
              key={stat.label}
              index={idx}
              end={stat.end}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export { StatsBar };
