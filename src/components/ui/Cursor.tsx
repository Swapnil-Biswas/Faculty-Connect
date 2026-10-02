"use client";

import { useEffect, useState } from "react";

// Blinking caret used in hero/subhead for that Apple-terminal feel
export default function Cursor() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setOn((v) => !v), 530);
    return () => clearInterval(id);
  }, []);
  return (
    <span
      className="terminal-cursor"
      style={{ opacity: on ? 1 : 0 }}
      aria-hidden="true"
    />
  );
}
