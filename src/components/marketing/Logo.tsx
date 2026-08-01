export function Logo({ size = 32, fontSize }: { size?: number; fontSize?: number }) {
  return (
    <a className="logo" href="#top" aria-label="Zone2 home" style={fontSize ? { fontSize } : undefined}>
      <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
        <g transform="translate(60,60)">
          <path
            d="M 29.6 -35.2 A 46 46 0 1 0 29.6 35.2"
            fill="none"
            stroke="#E8443A"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M -19.3 22.9 A 30 30 0 1 0 -19.3 -22.9"
            fill="none"
            stroke="#EDE8E1"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <polyline
            points="-40,0 -22,0 -13,-19 -2,21 8,-11 17,0 40,0"
            fill="none"
            stroke="#E8443A"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
      zone<span className="two">2</span>
    </a>
  );
}
