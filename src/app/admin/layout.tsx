import { requireAdmin } from '@/lib/auth/roles';
import { AppShell } from '@/components/shell/AppShell';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/verification', label: 'Verification' },
  { href: '/admin/clubs', label: 'Clubs' },
  { href: '/admin/metrics', label: 'Metrics' },
  { href: '/dashboard', label: 'My dashboard →' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();

  return (
    <AppShell navItems={NAV_ITEMS} who={{ name: profile.display_name || 'Admin', detail: 'Zone2 staff' }}>
      {children}
    </AppShell>
  );
}
