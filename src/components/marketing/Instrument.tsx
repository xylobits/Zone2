'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const ZONES = [
  {
    bpm: 118,
    name: 'Zone 1 · Recovery',
    copy: "<b>Zone 1 clears the debt.</b> Easy, restorative movement at 50–60% of max — the effort that lets yesterday's hard session actually turn into fitness.",
  },
  {
    bpm: 138,
    name: 'Zone 2 · Aerobic base',
    copy: "<b>Zone 2 is where the engine is built.</b> Conversational effort, 60–70% of max. It grows the mitochondria and capillaries every harder session depends on — and it's the zone most people skip.",
  },
  {
    bpm: 155,
    name: 'Zone 3 · Tempo',
    copy: '<b>Zone 3 is comfortably hard.</b> 70–80% of max, the "grey zone" — useful in small doses, costly when it quietly replaces your easy days.',
  },
  {
    bpm: 168,
    name: 'Zone 4 · Threshold',
    copy: '<b>Zone 4 raises the ceiling.</b> 80–90% of max, right at the edge of what you can hold. Sharpens race pace, but only sits on top of a real base.',
  },
  {
    bpm: 182,
    name: 'Zone 5 · VO₂ max',
    copy: '<b>Zone 5 is the top end.</b> 90–100% of max, minutes at a time. Highest return per second, highest cost — Zone2 rations it for you.',
  },
];

export function Instrument() {
  const reduced = usePrefersReducedMotion();
  const [zoneIndex, setZoneIndex] = useState(1);
  const bpmRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef(ZONES[1].bpm);
  const shownRef = useRef(ZONES[1].bpm);

  useEffect(() => {
    targetRef.current = ZONES[zoneIndex].bpm;
  }, [zoneIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let W = 0;
    let H = 0;
    let buf: number[] = [];
    let phase = 0;
    let raf = 0;

    function size() {
      const r = canvas!.getBoundingClientRect();
      const d = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      canvas!.width = W * d;
      canvas!.height = H * d;
      ctx!.setTransform(d, 0, 0, d, 0, 0);
      if (buf.length !== W) buf = new Array(W).fill(0);
    }

    function wave(p: number) {
      if (p < 0.09) return 0.13 * Math.sin((p / 0.09) * Math.PI);
      if (p < 0.15) return 0;
      if (p < 0.185) return -0.16;
      if (p < 0.225) return 1;
      if (p < 0.27) return -0.34;
      if (p < 0.44) return 0;
      if (p < 0.62) return 0.2 * Math.sin(((p - 0.44) / 0.18) * Math.PI);
      return 0;
    }

    size();
    const onResize = () => size();
    window.addEventListener('resize', onResize, { passive: true });

    let last = performance.now();
    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      shownRef.current += (targetRef.current - shownRef.current) * Math.min(dt * 3.2, 1);
      if (bpmRef.current) bpmRef.current.textContent = String(Math.round(shownRef.current));
      const beatsPerSec = shownRef.current / 60;
      const step = 2.4;
      for (let i = 0; i < step; i++) {
        phase = (phase + beatsPerSec * (dt / step) * 1.9) % 1;
        buf.push(wave(phase));
        buf.shift();
      }
      ctx!.clearRect(0, 0, W, H);
      ctx!.strokeStyle = 'rgba(237,232,225,.055)';
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(0, H / 2);
      ctx!.lineTo(W, H / 2);
      ctx!.stroke();
      const g = ctx!.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, 'rgba(232,68,58,0)');
      g.addColorStop(0.14, 'rgba(232,68,58,.55)');
      g.addColorStop(0.75, '#FF5A4E');
      g.addColorStop(1, '#FF5A4E');
      ctx!.strokeStyle = g;
      ctx!.lineWidth = 2.2;
      ctx!.lineJoin = 'round';
      ctx!.lineCap = 'round';
      ctx!.shadowColor = 'rgba(232,68,58,.55)';
      ctx!.shadowBlur = 12;
      ctx!.beginPath();
      for (let x = 0; x < W; x++) {
        const y = H / 2 - buf[x] * (H * 0.36);
        if (x === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.stroke();
      ctx!.shadowBlur = 0;
      const hy = H / 2 - buf[W - 1] * (H * 0.36);
      ctx!.fillStyle = '#FF5A4E';
      ctx!.beginPath();
      ctx!.arc(W - 1, hy, 3.2, 0, 6.284);
      ctx!.fill();
      raf = requestAnimationFrame(frame);
    }

    if (!reduced) {
      raf = requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = '#E8443A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      if (bpmRef.current) bpmRef.current.textContent = String(targetRef.current);
    }

    return () => {
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const zone = ZONES[zoneIndex];
  const heat = zoneIndex / 4;

  return (
    <div className="instrument">
      <div className="inst-top">
        <span className="inst-title">Live effort · drag to explore</span>
        <div className="readout">
          <span className="bpm" ref={bpmRef} style={{ color: zoneIndex >= 3 ? '#FF5A4E' : '#EDE8E1' }}>
            {zone.bpm}
          </span>
          <span className="bpm-unit">BPM</span>
          <span
            className="zone-tag"
            style={{
              borderColor: `rgba(232,68,58,${0.35 + heat * 0.45})`,
              background: `rgba(232,68,58,${0.08 + heat * 0.16})`,
            }}
          >
            {zone.name}
          </span>
        </div>
      </div>
      <canvas id="ecg" ref={canvasRef} aria-hidden="true" />
      <div className="inst-bottom">
        <div className="slider-row">
          <label className="sr" htmlFor="zone">
            Heart rate zone
          </label>
          <input
            type="range"
            id="zone"
            min={1}
            max={5}
            step={1}
            value={zoneIndex + 1}
            aria-describedby="zdesc"
            onChange={(e) => setZoneIndex(Number(e.target.value) - 1)}
          />
        </div>
        <div className="ticks">
          {ZONES.map((z, i) => (
            <span key={z.name} className={i === zoneIndex ? 'on' : undefined}>
              Z{i + 1}
            </span>
          ))}
        </div>
        <p className="inst-desc" id="zdesc" aria-live="polite" dangerouslySetInnerHTML={{ __html: zone.copy }} />
      </div>
    </div>
  );
}
