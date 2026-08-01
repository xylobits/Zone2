'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  href: string;
  label: string;
}

export function AppNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="app-nav">
      {items.map((item) => {
        const active = item.href === pathname || (item.href !== '/dashboard' && item.href !== '/admin' && item.href !== '/sub-admin' && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} className={active ? 'active' : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
