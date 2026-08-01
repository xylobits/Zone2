'use client';

import { useEffect, useRef } from 'react';
import { HeroPhone } from './HeroPhone';
import { Instrument } from './Instrument';
import { Ticker } from './Ticker';
import { useMagnetic } from '@/hooks/useMagnetic';

export function Hero() {
  const auraRef = useRef<HTMLDivElement>(null);
  const startCtaRef = useMagnetic<HTMLAnchorElement>();
  const methodCtaRef = useMagnetic<HTMLAnchorElement>();

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      if (window.scrollY < 900 && auraRef.current) {
        auraRef.current.style.transform = `translate(-50%,0) translate(${nx * 70}px, ${ny * 46}px)`;
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <section className="hero">
      <div className="aura" ref={auraRef} aria-hidden="true" />
      <div className="wrap hero-grid">
        <div>
          <p className="eyebrow">Train · Fuel · Connect</p>
          <h1 className="head" style={{ marginTop: 22 }}>
            <span className="ln">
              <i>Built at the</i>
            </span>
            <span className="ln">
              <i>pace that</i>
            </span>
            <span className="ln">
              <i>
                <em>lasts.</em>
              </i>
            </span>
          </h1>
          <p className="lede">
            Zone2 is one app for the whole athlete. Heart-rate training that builds a real aerobic base, nutrition
            that keeps it fuelled, and people who move at your rhythm.
          </p>
          <div className="hero-ctas">
            <a ref={startCtaRef} className="btn btn-red magnet" href="#get">
              Start training free
            </a>
            <a ref={methodCtaRef} className="btn btn-line magnet" href="#method">
              See the method
            </a>
          </div>
          <p className="note">iOS 16+ · Android 11+ · Syncs with Apple Watch, Garmin &amp; Whoop</p>
        </div>

        <HeroPhone />

        <Instrument />
      </div>

      <Ticker />
    </section>
  );
}
