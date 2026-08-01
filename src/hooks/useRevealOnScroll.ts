'use client';

import { useEffect, useRef, useState } from 'react';

/** Adds the `.in` class the first time the element scrolls into view (mirrors the source's global `.rv` IntersectionObserver). */
export function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -40px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, inView };
}
