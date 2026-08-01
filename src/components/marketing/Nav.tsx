'use client';

import { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { useMagnetic } from '@/hooks/useMagnetic';

const LINKS = [
  { href: '#method', label: 'Method' },
  { href: '#connect', label: 'Connect' },
  { href: '#numbers', label: 'Numbers' },
  { href: '#get', label: 'Download' },
];

export function Nav() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const ctaRef = useMagnetic<HTMLAnchorElement>();

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav${stuck ? ' stuck' : ''}`} id="nav">
      <div className="wrap nav-in">
        <Logo />
        <nav className={`nav-links${open ? ' open' : ''}`} id="links" aria-label="Main">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>
        <a ref={ctaRef} className="btn btn-red magnet" href="#get">
          Get the app
        </a>
        <button
          className={`burger${open ? ' on' : ''}`}
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="links"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
        </button>
      </div>
    </header>
  );
}
