export function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <div>
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i}>
            train <i>●</i> fuel <i>●</i> connect <i>●</i>
          </span>
        ))}
      </div>
    </div>
  );
}
