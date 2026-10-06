'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const WORDS = ['WELCOME', 'ITZFIZZ'];
const STATS = [
  { n: 58, label: 'Increase in pick up point use' },
  { n: 23, label: 'Decreased in customer phone calls' },
  { n: 27, label: 'Increase in pick up point use' },
  { n: 40, label: 'Decreased in customer phone calls' },
];

export default function Hero() {
  const root = useRef(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    let measure = () => {};

    const ctx = gsap.context(() => {
      const letters = gsap.utils.toArray('.letter');
      const stats = gsap.utils.toArray('.stat');
      const jet = root.current.querySelector('.jet');
      const letterHidden = { opacity: 0, y: 24 };
      const statHidden = { opacity: 0, y: 30 };
      const counters = stats.map(() => ({ v: 0 }));

      gsap.set(stats, statHidden);

      // Intro on load: jet fades in, scroll hint fades in
      gsap.from(jet, { opacity: 0, duration: 1.2, ease: 'power2.out' });
      gsap.fromTo('.hint', { opacity: 0 }, { opacity: 1, delay: 0.6, duration: 1 });

      // Cached positions, measured on load and on every refresh (not on scroll)
      let letterCenters = [];
      let statCenters = [];
      let jetLeft = 0;
      let jetW = 0;
      const letterShown = [];
      const statShown = [];

      const reveal = () => {
        const nose = jetLeft + gsap.getProperty(jet, 'x') + jetW * 0.97;

        letters.forEach((l, i) => {
          const should = nose > letterCenters[i];
          if (should !== !!letterShown[i]) {
            letterShown[i] = should;
            gsap.to(l, should
              ? { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', overwrite: 'auto' }
              : { ...letterHidden, duration: 0.3, overwrite: 'auto' });
          }
        });

        stats.forEach((s, i) => {
          const should = nose > statCenters[i];
          if (should === !!statShown[i]) return;
          statShown[i] = should;
          const el = s.querySelector('b');
          gsap.killTweensOf(counters[i]);
          if (should) {
            gsap.to(s, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
            gsap.to(counters[i], {
              v: +el.dataset.n, duration: 1.2, ease: 'power2.out',
              onUpdate: () => { el.textContent = Math.round(counters[i].v) + '%'; },
            });
          } else {
            gsap.to(s, { ...statHidden, duration: 0.3, overwrite: 'auto' });
            counters[i].v = 0;
            el.textContent = '0%';
          }
        });
      };

      measure = () => {
        jetW = jet.offsetWidth;
        jetLeft = jet.getBoundingClientRect().left - gsap.getProperty(jet, 'x');
        const center = (el) => {
          const r = el.getBoundingClientRect();
          return r.left + r.width / 2;
        };
        letterCenters = letters.map(center);
        statCenters = stats.map(center);
        reveal();
      };
      ScrollTrigger.addEventListener('refresh', measure);

      // Scroll-driven: jet starts just before the first letters and flies across
      gsap.timeline({
        scrollTrigger: {
          trigger: root.current, start: 'top top', end: '+=2600',
          scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: reveal,
        },
      })
        .fromTo(jet,
          {
            x: () => {
              const firstLeft = Math.min(...letters.map((l) => l.getBoundingClientRect().left));
              const base = jet.getBoundingClientRect().left - gsap.getProperty(jet, 'x');
              return firstLeft - base - jet.offsetWidth * 0.97 - 8;
            },
          },
          { x: () => window.innerWidth, ease: 'none', duration: 1 }, 0)
        .to(jet, { y: -14, ease: 'sine.inOut', yoyo: true, repeat: 1, duration: 0.5 }, 0)
        .to('.hint', { opacity: 0, duration: 0.05 }, 0)
        .to({}, { duration: 0.15 });

      measure();
    }, root);

    return () => {
      ScrollTrigger.removeEventListener('refresh', measure);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} className="relative flex h-svh flex-col items-center justify-center overflow-hidden px-[5vw]">
      <div className="relative w-full">
        <h1 aria-label="Welcome ItzFizz" className="flex flex-wrap justify-center gap-x-[0.9em] text-[clamp(1.6rem,6.5vw,5.5rem)] font-extrabold leading-[1.1]">
          {WORDS.map((w) => (
            <span key={w} className="flex" aria-hidden="true">
              {[...w].map((c, i) => (
                <span key={i} className="letter mx-[0.22em] inline-block opacity-0 will-change-transform">{c}</span>
              ))}
            </span>
          ))}
        </h1>

        <div className="pointer-events-none absolute inset-0 flex items-center" aria-hidden="true">
          <div className="jet w-[clamp(260px,36vw,560px)] will-change-transform">
            <Jet />
          </div>
        </div>
      </div>

      <div className="mt-[clamp(1.5rem,5vh,3.5rem)] flex flex-wrap justify-center gap-[clamp(1.5rem,6vw,5rem)]">
        {STATS.map((s, i) => (
          <div key={i} className="stat text-center opacity-0 will-change-transform">
            <b data-n={s.n} className="block text-[clamp(2rem,5vw,3.8rem)] font-extrabold text-accent">0%</b>
            <span className="mx-auto mt-1 block max-w-[14ch] text-xs tracking-wide text-muted">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="hint absolute bottom-[3vh] text-[0.7rem] tracking-[0.3em] text-muted">SCROLL</div>
    </section>
  );
}

// Top-view jet pointing right, with a trail behind it
function Jet() {
  return (
    <svg viewBox="0 0 360 200" fill="none" overflow="visible" className="block h-auto w-full">
      <defs>
        <linearGradient id="trail" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" style={{ stopColor: 'var(--accent)', stopOpacity: 0 }} />
          <stop offset="1" style={{ stopColor: 'var(--accent)', stopOpacity: 0.85 }} />
        </linearGradient>
      </defs>
      <rect x="-320" y="97" width="380" height="6" rx="3" fill="url(#trail)" />
      <path d="M240 94L150 20h-32l52 74zM240 106l-90 74h-32l52-74z" fill="var(--fg)" />
      <path d="M110 94L70 56H52l26 38zM110 106l-40 38H52l26-38z" fill="var(--fg)" />
      <path d="M350 100C320 92 260 90 120 92l-60 4v8l60 4c140 2 200 0 230-8z" fill="var(--fg)" />
      <ellipse cx="285" cy="100" rx="28" ry="6" fill="var(--accent)" />
    </svg>
  );
}