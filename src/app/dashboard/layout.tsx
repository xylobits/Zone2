import { requireUser } from '@/lib/auth/roles';
import { AppShell } from '@/components/shell/AppShell';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/profile', label: 'Profile' },
  { href: '/dashboard/workouts', label: 'Workouts' },
  { href: '/dashboard/matches', label: 'Matches' },
  { href: '/dashboard/sessions', label: 'Sessions' },
  { href: '/dashboard/verification', label: 'Verification' },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();

  const extraNav =
    profile.role === 'admin'
      ? [{ href: '/admin', label: 'Admin panel →' }]
      : profile.role === 'sub_admin'
        ? [{ href: '/sub-admin', label: 'Club panel →' }]
        : [];

  return (
    <AppShell
      navItems={[...NAV_ITEMS, ...extraNav]}
      who={{
        name: profile.display_name || 'Your account',
        detail: profile.verified_tier === 'verified' ? 'Verified member' : 'Unverified',
      }}
    >
      {children}
    </AppShell>
  );
}
