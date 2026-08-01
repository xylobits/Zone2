'use client';

import { useState } from 'react';
import { Reveal } from './Reveal';
import { useTilt } from '@/hooks/useTilt';

const TABS = [
  {
    scr: 'train',
    key: '01 / Train',
    title: 'Build the engine',
    desc: 'Heart-rate-guided plans that put the aerobic base first, then layer strength and intensity on top. Live zone tracking keeps you honest mid-session, and the plan rewrites itself weekly around what you actually did.',
    tags: ['Adaptive weekly plan', 'Live zone tracking', 'Guided workout player', 'Strength & mobility blocks'],
  },
  {
    scr: 'fuel',
    key: '02 / Fuel',
    title: 'Feed the work',
    desc: "Log a meal in a few taps and see it land where it matters: tomorrow's readiness score. Sleep, protein and hydration feed straight into whether the app tells you to push or hold back.",
    tags: ['Fast meal logging', 'Readiness score', 'Sleep & hydration', 'Mind Builder habits'],
  },
  {
    scr: 'connect',
    key: '03 / Connect',
    title: 'Find your people',
    desc: "Gym partners, run clubs and dates, matched on the things that decide whether you'll actually meet: shared gym, training level, distance and whether your weeks line up.",
    tags: ['Schedule match score', 'Filter by intent', 'Plan a session together', 'Verified profiles'],
  },
];

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0C0C0E" strokeWidth={2} strokeLinecap="round">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

export function MethodTabs() {
  const [active, setActive] = useState(0);
  const phoneRef = useTilt<HTMLDivElement>();

  return (
    <div className="show-grid">
      <Reveal as="div" className="tabs" id="tabs">
        {TABS.map((tab, i) => (
          <button
            key={tab.scr}
            className={`tab${i === active ? ' active' : ''}`}
            aria-expanded={i === active}
            onClick={() => setActive(i)}
          >
            <span className="tab-head">
              <span className="tab-key">{tab.key}</span>
            </span>
            <span className="tab-head" style={{ marginTop: 6 }}>
              <h3>{tab.title}</h3>
              <span className="arrow">
                <ArrowIcon />
              </span>
            </span>
            <span className="tab-body">
              <p>{tab.desc}</p>
              <ul>
                {tab.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </span>
          </button>
        ))}
      </Reveal>

      <Reveal as="div" className="phone-stage" delay={1}>
        <div className="phone" ref={phoneRef} aria-hidden="true">
          <div className="screen">
            {/* TRAIN */}
            <div className={`scr${active === 0 ? ' on' : ''}`}>
              <div className="s-row">
                <div>
                  <div className="s-hi">Today</div>
                  <div className="s-name">Train</div>
                </div>
                <div className="s-av" />
              </div>
              <div className="card">
                <small>Prescribed session</small>
                <h4 style={{ marginTop: 6 }}>Zone 2 · 45 min steady</h4>
                <div className="big" style={{ marginTop: 10 }}>
                  138<i> BPM TARGET</i>
                </div>
                <div className="bar" style={{ '--w': '72%' } as React.CSSProperties}>
                  <b />
                </div>
                <small style={{ marginTop: 8 }}>32 of 45 min in zone</small>
              </div>
              <div className="duo">
                <div className="card">
                  <small>Week load</small>
                  <div className="big">
                    4<i> / 6</i>
                  </div>
                </div>
                <div className="card">
                  <small>Base trend</small>
                  <div className="big">
                    +7<i> %</i>
                  </div>
                </div>
              </div>
              <div className="card">
                <small>Up next</small>
                <h4 style={{ marginTop: 6 }}>Thu · Lower strength</h4>
                <div className="pill-row">
                  <span>Squat</span>
                  <span>Hinge</span>
                  <span>Core</span>
                </div>
              </div>
              <div className="s-nav">
                <span>Home</span>
                <b>Train</b>
                <span>Health</span>
                <span>Connect</span>
                <span>You</span>
              </div>
            </div>

            {/* FUEL */}
            <div className={`scr${active === 1 ? ' on' : ''}`}>
              <div className="s-row">
                <div>
                  <div className="s-hi">Today</div>
                  <div className="s-name">Fuel</div>
                </div>
                <div className="s-av" />
              </div>
              <div className="card flex">
                <svg className="ring" viewBox="0 0 80 80">
                  <circle className="bg" cx="40" cy="40" r="33" />
                  <circle className="fg" cx="40" cy="40" r="33" />
                </svg>
                <div>
                  <h4>1,840 kcal</h4>
                  <small>of 2,420 target</small>
                  <div className="bar" style={{ '--w': '76%' } as React.CSSProperties}>
                    <b />
                  </div>
                </div>
              </div>
              <div className="duo">
                <div className="card">
                  <small>Protein</small>
                  <div className="big">
                    126<i> G</i>
                  </div>
                </div>
                <div className="card">
                  <small>Water</small>
                  <div className="big">
                    2.1<i> L</i>
                  </div>
                </div>
              </div>
              <div className="card">
                <small>Readiness tomorrow</small>
                <h4 style={{ marginTop: 6 }}>86 · Ready to train</h4>
                <small style={{ marginTop: 6 }}>Sleep 7h 40m · HRV steady</small>
                <div className="bar" style={{ '--w': '86%' } as React.CSSProperties}>
                  <b />
                </div>
              </div>
              <div className="s-nav">
                <span>Home</span>
                <span>Train</span>
                <b>Health</b>
                <span>Connect</span>
                <span>You</span>
              </div>
            </div>

            {/* CONNECT */}
            <div className={`scr${active === 2 ? ' on' : ''}`}>
              <div className="s-row">
                <div>
                  <div className="s-hi">2.1 km radius</div>
                  <div className="s-name">Connect</div>
                </div>
                <div className="s-av" />
              </div>
              <div className="pill-row" style={{ marginTop: 13 }}>
                <span>Gym partners</span>
                <span>Dating</span>
                <span>Run club</span>
              </div>
              <div className="card">
                <div className="mini-match" style={{ marginTop: 0 }}>
                  <div className="mini-photo" style={{ width: 52, height: 52 }} />
                  <div>
                    <h4>Maya, 27</h4>
                    <small>Iron Works · Level 4</small>
                  </div>
                  <div className="score">92</div>
                </div>
                <div className="pill-row">
                  <span>Morning runs</span>
                  <span>Zone 2 rides</span>
                  <span>Sat long run</span>
                </div>
                <div className="bar" style={{ '--w': '92%' } as React.CSSProperties}>
                  <b />
                </div>
                <small style={{ marginTop: 8 }}>92% schedule match this week</small>
              </div>
              <div className="card">
                <small>Train together</small>
                <h4 style={{ marginTop: 6 }}>Sat 07:30 · Riverside 10K</h4>
                <small style={{ marginTop: 6 }}>2 others from your gym going</small>
              </div>
              <div className="s-nav">
                <span>Home</span>
                <span>Train</span>
                <span>Health</span>
                <b>Connect</b>
                <span>You</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
