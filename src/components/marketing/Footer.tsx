import { Logo } from './Logo';

export function Footer() {
  return (
    <footer>
      <div className="wrap foot">
        <Logo size={24} fontSize={18} />
        <nav>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Support</a>
          <a href="#">Instagram</a>
        </nav>
        <span>© 2026 Zone2</span>
      </div>
    </footer>
  );
}
