'use client';

import { Reveal } from './Reveal';
import { useCountUp } from '@/hooks/useCountUp';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const STATS = [
  { to: 45, suffix: ' min', label: 'median Zone 2 session logged' },
  { to: 3, suffix: '×', label: 'weekly sessions to move your base' },
  { to: 92, suffix: '%', label: 'of first meetups start as a planned session' },
  { to: 12, suffix: ' wk', label: 'to a measurable aerobic shift' },
];

function Stat({ to, suffix, label, delay }: { to: number; suffix: string; label: string; delay?: 1 | 2 | 3 }) {
  const reduced = usePrefersReducedMotion();
  const { ref, value } = useCountUp<HTMLSpanElement>(to, reduced);
  return (
    <Reveal as="div" className="stat" delay={delay}>
      <b>
        <span className="count" ref={ref}>
          {value}
        </span>
        <i>{suffix}</i>
      </b>
      <p>{label}</p>
    </Reveal>
  );
}

export function Stats() {
  return (
    <section className="light pad" id="numbers">
      <div className="wrap">
        <Reveal as="div" className="head-row" style={{ marginBottom: 24 }}>
          <h2>
            The numbers
            <br />
            behind the base.
          </h2>
          <p>Aggregate figures from Zone2 members over the last twelve weeks.</p>
        </Reveal>
        <div className="stats">
          {STATS.map((s, i) => (
            <Stat key={s.label} to={s.to} suffix={s.suffix} label={s.label} delay={(i > 0 ? i : undefined) as 1 | 2 | 3 | undefined} />
          ))}
        </div>
      </div>
    </section>
  );
}
