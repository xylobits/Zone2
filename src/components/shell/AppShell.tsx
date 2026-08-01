import '@/styles/app-shell.css';
import { Logo } from '@/components/marketing/Logo';
import { AppNav, type NavItem } from './AppNav';

export function AppShell({
  navItems,
  who,
  children,
}: {
  navItems: NavItem[];
  who: { name: string; detail: string };
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Logo size={26} />
        <AppNav items={navItems} />
        <div className="app-sidebar-foot">
          <div className="who">
            <b>{who.name}</b>
            {who.detail}
          </div>
          <form action="/auth/signout" method="post">
            <button className="btn btn-outline btn-sm" type="submit" style={{ width: '100%' }}>
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="app-main">{children}</main>
    </div>
  );
}
