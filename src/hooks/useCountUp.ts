'use client';

import { useEffect, useRef, useState } from 'react';

/** Cubic ease-out count from 0 to `target` the first time the element is in view. */
export function useCountUp<T extends HTMLElement>(target: number, reduced: boolean) {
  const ref = useRef<T | null>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          if (reduced) {
            setValue(target);
            return;
          }
          let start: number | null = null;
          const run = (ts: number) => {
            if (start === null) start = ts;
            const p = Math.min((ts - start) / 1100, 1);
            setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(run);
          };
          requestAnimationFrame(run);
        });
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, reduced]);

  return { ref, value };
}
