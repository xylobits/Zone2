'use client';

import { Reveal } from './Reveal';
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll';

export function Connect() {
  const { ref: cardRef, inView } = useRevealOnScroll<HTMLDivElement>();

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <section className="pad" id="connect">
      <div className="wrap connect-grid">
        <Reveal as="div">
          <p className="eyebrow">The Connect tab</p>
          <h2 style={{ marginTop: 22 }}>
            Other apps match faces. Zone2 matches{' '}
            <em style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--red)' }}>paces.</em>
          </h2>
          <div className="points">
            <div className="point">
              <span className="k">01</span>
              <div>
                <b>Schedule match score</b>
                <span>See how well two training weeks overlap before either of you says hello.</span>
              </div>
            </div>
            <div className="point">
              <span className="k">02</span>
              <div>
                <b>One feed, your intent</b>
                <span>The same screen serves gym partners, run clubs and dating — you choose with a filter.</span>
              </div>
            </div>
            <div className="point">
              <span className="k">03</span>
              <div>
                <b>It ends in a session</b>
                <span>Every match can become a planned workout, which is the follow-through dating apps never close.</span>
              </div>
            </div>
          </div>
        </Reveal>

        <div
          ref={cardRef}
          className={`match rv${inView ? ' in' : ''}`}
          data-d={1}
          id="matchCard"
          aria-hidden="true"
          onPointerMove={onMove}
        >
          <div className="m-top">
            <div className="m-photo" />
            <div>
              <b>Maya, 27</b>
              <small>2.1 KM · IRON WORKS · LEVEL 4</small>
            </div>
            <div className="m-score">
              <b>92</b>
              <span>match</span>
            </div>
          </div>
          <div className="m-tags">
            <span>Morning runner</span>
            <span>Zone 2 rides</span>
            <span>Push · pull · legs</span>
            <span>Sat long runs</span>
          </div>
          <div className="m-cta">
            <span className="a">Train together</span>
            <span className="b">Say hi</span>
          </div>
        </div>
      </div>
    </section>
  );
}
