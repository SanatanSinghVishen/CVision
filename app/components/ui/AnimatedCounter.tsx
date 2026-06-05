import { useEffect, useState } from "react";
import { animate } from "framer-motion";

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
}

export function AnimatedCounter({ from, to, duration = 0.8, className, suffix = "" }: AnimatedCounterProps) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    const controls = animate(from, to, {
      duration: duration,
      ease: "easeOut",
      onUpdate(value) {
        setCount(Math.round(value));
      },
    });
    return () => controls.stop();
  }, [from, to, duration]);

  return <span className={className}>{count}{suffix}</span>;
}
