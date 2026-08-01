import { requireSubAdmin } from '@/lib/auth/roles';
import { AppShell } from '@/components/shell/AppShell';

const NAV_ITEMS = [
  { href: '/sub-admin', label: 'Overview' },
  { href: '/sub-admin/roster', label: 'Roster' },
  { href: '/sub-admin/events', label: 'Events' },
  { href: '/dashboard', label: 'My dashboard →' },
];

export default async function SubAdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireSubAdmin();

  return (
    <AppShell
      navItems={NAV_ITEMS}
      who={{ name: profile.display_name || 'Club manager', detail: 'Club sub-admin' }}
    >
      {children}
    </AppShell>
  );
}
