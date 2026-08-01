'use client';

import { useEffect, useRef } from 'react';
import { Reveal } from './Reveal';
import { useMagnetic } from '@/hooks/useMagnetic';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export function Cta() {
  const reduced = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iosRef = useMagnetic<HTMLAnchorElement>();
  const androidRef = useMagnetic<HTMLAnchorElement>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let PW = 0;
    let PH = 0;
    let off = 0;
    let raf = 0;

    function size() {
      const r = canvas!.getBoundingClientRect();
      const d = Math.min(window.devicePixelRatio || 1, 2);
      PW = Math.round(r.width);
      PH = Math.round(r.height);
      canvas!.width = PW * d;
      canvas!.height = PH * d;
      ctx!.setTransform(d, 0, 0, d, 0, 0);
    }

    function frame() {
      off = (off + 0.6) % 320;
      ctx!.clearRect(0, 0, PW, PH);
      ctx!.strokeStyle = '#E8443A';
      ctx!.lineWidth = 1.6;
      ctx!.lineJoin = 'round';
      ctx!.lineCap = 'round';
      ctx!.beginPath();
      for (let x = -320 + off; x < PW + 320; x += 320) {
        const m = PH * 0.6;
        ctx!.moveTo(x, m);
        ctx!.lineTo(x + 120, m);
        ctx!.lineTo(x + 140, m - 34);
        ctx!.lineTo(x + 165, m + 40);
        ctx!.lineTo(x + 186, m - 14);
        ctx!.lineTo(x + 205, m);
        ctx!.lineTo(x + 320, m);
      }
      ctx!.stroke();
      raf = requestAnimationFrame(frame);
    }

    size();
    const onResize = () => size();
    window.addEventListener('resize', onResize, { passive: true });
    if (!reduced) raf = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <section className="cta" id="get">
      <canvas id="pulse" ref={canvasRef} aria-hidden="true" />
      <div className="wrap">
        <Reveal as="h2">
          Start in Zone 2.
          <br />
          Go <em>everywhere</em> from there.
        </Reveal>
        <Reveal as="p" className="tag" delay={1}>
          train · fuel · connect
        </Reveal>
        <Reveal as="div" className="hero-ctas" delay={2}>
          <a ref={iosRef} className="btn btn-red magnet" href="#">
            Download for iOS
          </a>
          <a ref={androidRef} className="btn btn-line magnet" href="#">
            Download for Android
          </a>
        </Reveal>
      </div>
    </section>
  );
}
