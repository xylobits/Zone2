'use client';

import { useTilt } from '@/hooks/useTilt';

export function HeroPhone() {
  const ref = useTilt<HTMLDivElement>();

  return (
    <div className="phone-stage">
      <div className="phone" ref={ref} aria-hidden="true">
        <div className="screen">
          <div className="scr on">
            <div className="s-row">
              <div>
                <div className="s-hi">Tuesday · Week 6</div>
                <div className="s-name">
                  Tristen <span>·</span> zone2
                </div>
              </div>
              <div className="s-av" />
            </div>
            <div className="card flex">
              <svg className="ring" viewBox="0 0 80 80">
                <circle className="bg" cx="40" cy="40" r="33" />
                <circle className="fg" cx="40" cy="40" r="33" />
              </svg>
              <div>
                <h4>Zone 2 ride</h4>
                <small>45 min · 138 bpm average</small>
                <div className="bar" style={{ '--w': '72%' } as React.CSSProperties}>
                  <b />
                </div>
              </div>
            </div>
            <div className="duo">
              <div className="card">
                <small>Fuelled</small>
                <div className="big">
                  1,840<i> KCAL</i>
                </div>
              </div>
              <div className="card">
                <small>Recovery</small>
                <div className="big">
                  86<i> %</i>
                </div>
              </div>
            </div>
            <div className="card">
              <small>Connect · 3 nearby</small>
              <div className="mini-match">
                <div className="mini-photo" />
                <div>
                  <h4>Maya, 27</h4>
                  <small>Iron Works · Level 4</small>
                </div>
                <div className="score">92</div>
              </div>
            </div>
            <div className="s-nav">
              <b>Home</b>
              <span>Train</span>
              <span>Health</span>
              <span>Connect</span>
              <span>You</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
