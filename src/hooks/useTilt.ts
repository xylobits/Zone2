'use client';

import { useEffect, useRef } from 'react';

/** 3D pointer tilt for the source's phone mocks (disabled below 1000px, matching the original). */
export function useTilt<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const onMove = (e: PointerEvent) => {
      if (window.innerWidth < 1000) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `rotateY(${x * 11}deg) rotateX(${-y * 11}deg) translateZ(18px)`;
    };
    const onLeave = () => {
      el.style.transform = '';
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled]);

  return ref;
}
