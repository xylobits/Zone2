import { Logo } from '@/components/marketing/Logo';

const POINTS = [
  { k: '01', copy: 'Effort-verified profiles — no catfish, no filters, just proof.' },
  { k: '02', copy: 'Matched on schedule and training level, not just photos.' },
  { k: '03', copy: 'First meets are a public, daylight workout — safer and more honest than dinner.' },
];

export function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="auth-brand-aura" aria-hidden="true" />
        <Logo href="/" size={30} />
        <div className="auth-brand-copy">
          <p className="eyebrow">Train · Fuel · Connect</p>
          <h1>
            Built at the <em>pace</em> that lasts.
          </h1>
          <p>Verified consistency, computed compatibility, and a first date that&apos;s actually a workout.</p>
        </div>
        <ul className="auth-brand-points">
          {POINTS.map((p) => (
            <li key={p.k}>
              <span>{p.k}</span>
              {p.copy}
            </li>
          ))}
        </ul>
      </div>

      <div className="auth-panel">
        <Logo href="/" />
        <div className="auth-card">
          <h2>{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
        </div>
        <p className="auth-switch">{footer}</p>
      </div>
    </div>
  );
}
