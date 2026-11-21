import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BRAND_DATA, COPY, PHOTOS, type Lang } from '../content';
import { getAlgiersOpenStatus, getAlgiersTimeOfDay, trackClick } from '../utils/khanLogic';
import { ArchedPhoto, CarpetDivider, RosetteMark, SectionTitle } from './Ornaments';

interface HeroSectionProps {
  lang: Lang;
  manualEvening: boolean;
  onToggleEvening: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  lang,
  manualEvening,
  onToggleEvening,
}) => {
  const { status, tod } = useMemo(() => {
    const now = new Date();
    return {
      status: getAlgiersOpenStatus(now),
      tod: getAlgiersTimeOfDay(now),
    };
  }, []);

  const isEveningEffective = tod.period === 'evening' || manualEvening;

  // Signature Moment #2: Mobile gyroscope parallax (<= 6px), iOS permission on first tap only
  const [gyroOffset, setGyroOffset] = useState({ x: 0, y: 0 });
  const gyroRequestedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      const nx = Math.max(-1, Math.min(1, e.gamma / 30));
      const ny = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      setGyroOffset({
        x: +(nx * 6).toFixed(2),
        y: +(ny * 6).toFixed(2),
      });
    };

    const devOrient = window.DeviceOrientationEvent as
      | (typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> })
      | undefined;

    if (devOrient && typeof devOrient.requestPermission !== 'function') {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }

    const requestOnFirstTap = () => {
      if (gyroRequestedRef.current) return;
      gyroRequestedRef.current = true;
      devOrient?.requestPermission?.().then((state) => {
        if (state === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, { passive: true });
        }
      }).catch(() => {});
    };

    window.addEventListener('touchstart', requestOnFirstTap, { once: true, passive: true });
    return () => {
      window.removeEventListener('touchstart', requestOnFirstTap);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Signature Moment #9: Scroll-velocity reactive Marquee reversing cleanly on scroll-up
  const marqueeTrackRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const track = marqueeTrackRef.current;
    if (!track) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let offset = 0;
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let dir = lang === 'ar' ? 1 : -1;
    let lastTime = performance.now();
    let raf = 0;

    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastScrollY;
      lastScrollY = y;
      if (Math.abs(dy) > 0.5) {
        const scrollingDown = dy > 0;
        const baseDir = lang === 'ar' ? 1 : -1;
        dir = scrollingDown ? baseDir : -baseDir;
        scrollVelocity = Math.min(14, Math.abs(dy) * 0.28);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const tick = (now: number) => {
      const dt = Math.min(48, now - lastTime);
      lastTime = now;

      const halfWidth = track.scrollWidth / 2 || 800;
      const baseSpeed = 0.045; // px per ms
      const boost = scrollVelocity * 0.032;
      offset += dir * (baseSpeed + boost) * dt;
      scrollVelocity *= 0.92;

      if (offset > 0) offset -= halfWidth;
      if (offset < -halfWidth) offset += halfWidth;

      track.style.transform = `translate3d(${offset.toFixed(2)}px, 0, 0)`;
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.cancelAnimationFrame(raf);
    };
  }, [lang]);

  // Subtle time-of-day background & overlay modulation (never invents facts)
  const heroBgClass = isEveningEffective
    ? 'bg-gradient-to-b from-[#3A111B] via-[#3A111B] to-[#541B28]'
    : tod.period === 'morning'
    ? 'bg-gradient-to-b from-[#6A2535] via-[#541B28] to-[#541B28]'
    : 'bg-[#541B28]';

  const mobileOverlayGradient = isEveningEffective
    ? 'linear-gradient(180deg, rgba(58,17,27,0.42) 0%, rgba(58,17,27,0.74) 40%, rgba(58,17,27,0.96) 72%, #3A111B 100%)'
    : tod.period === 'morning'
    ? 'linear-gradient(180deg, rgba(106,37,53,0.22) 0%, rgba(84,27,40,0.64) 40%, rgba(84,27,40,0.95) 70%, #541B28 100%)'
    : 'linear-gradient(180deg, rgba(84,27,40,0.26) 0%, rgba(84,27,40,0.68) 40%, rgba(84,27,40,0.95) 70%, #541B28 100%)';

  return (
    <section
      id="hero"
      data-time-period={isEveningEffective ? 'evening' : tod.period}
      data-evening-mode={manualEvening ? 'manual' : 'auto'}
      className={`relative ${heroBgClass} text-white overflow-hidden pt-16 lg:pt-0 transition-colors duration-700`}
    >
      {/* Ornament 1: Huge faint (6-8% opacity) rosette watermark turning slowly (90s) on reading side */}
      <div
        className="pointer-events-none absolute -start-28 lg:start-[-6%] top-1/2 -translate-y-1/2 opacity-[0.07] z-[1]"
        aria-hidden="true"
      >
        <RosetteMark className="w-[460px] h-[460px] lg:w-[560px] lg:h-[560px] text-white animate-rosette-slow" />
      </div>

      {/* Mobile full-bleed / Desktop 12-col split */}
      <div className="relative min-h-[calc(100svh-4rem)] lg:min-h-[92vh] lg:grid lg:grid-cols-12 lg:items-stretch">
        {/* Mobile full-bleed image / Desktop second-half photo */}
        <div className="absolute inset-0 lg:static lg:col-span-6 lg:order-2 overflow-hidden bg-[#3A111B]">
          <div
            className="relative w-full h-full will-change-transform"
            style={{
              transform: `translate3d(${gyroOffset.x}px, ${gyroOffset.y}px, 0)`,
            }}
          >
            {/* Day hero photo 848307458 */}
            <img
              src={PHOTOS.hero.src}
              srcSet={PHOTOS.hero.srcSet}
              sizes="(max-width: 1023px) 100vw, 50vw"
              width={PHOTOS.hero.width}
              height={PHOTOS.hero.height}
              alt={lang === 'ar' ? PHOTOS.hero.altAr : PHOTOS.hero.altFr}
              loading="eager"
              fetchPriority="high"
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover object-[50%_26%] animate-hero-zoom transition-opacity duration-1000 ${
                isEveningEffective ? 'opacity-20' : 'opacity-100'
              }`}
            />

            {/* Evening crossfade to storyA 683583953 (wall lamps in warm evening light) */}
            <img
              src={PHOTOS.storyA.src}
              srcSet={PHOTOS.storyA.srcSet}
              sizes="(max-width: 1023px) 100vw, 50vw"
              width={PHOTOS.storyA.width}
              height={PHOTOS.storyA.height}
              alt=""
              aria-hidden="true"
              loading="eager"
              referrerPolicy="no-referrer"
              className={`absolute inset-0 w-full h-full object-cover object-center animate-hero-zoom transition-opacity duration-1000 ${
                isEveningEffective ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />

            {/* Faint SVG steam (12% opacity) rising gently above the matcha cup */}
            {!isEveningEffective && (
              <svg
                viewBox="0 0 60 80"
                className="pointer-events-none absolute left-[49%] top-[34%] lg:top-[35%] w-12 h-16 -translate-x-1/2 -translate-y-1/2 text-white"
                aria-hidden="true"
              >
                <path
                  d="M22 72 C16 56, 28 42, 21 24 C18 14, 24 8, 22 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  className="animate-steam-1 opacity-15"
                />
                <path
                  d="M36 74 C42 58, 31 44, 37 26 C40 16, 35 10, 38 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  className="animate-steam-2 opacity-12"
                />
              </svg>
            )}

            {/* Soft flickering candle glow + tap button to toggle persisted Evening Mode */}
            <button
              type="button"
              data-testid="candle-evening-toggle"
              aria-pressed={manualEvening}
              aria-label={
                manualEvening
                  ? lang === 'ar'
                    ? COPY.hero.candleDisableEveningAr
                    : COPY.hero.candleDisableEveningFr
                  : lang === 'ar'
                  ? COPY.hero.candleEnableEveningAr
                  : COPY.hero.candleEnableEveningFr
              }
              onClick={() => {
                onToggleEvening();
                trackClick('evening_mode', manualEvening ? 'off' : 'on');
              }}
              className="group absolute left-[25%] top-[18%] lg:left-[31.5%] lg:top-[14%] w-11 h-11 -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer flex items-center justify-center rounded-full focus-visible:outline-white"
            >
              <span
                aria-hidden="true"
                className={`block rounded-full animate-candle-glow pointer-events-none ${
                  isEveningEffective ? 'w-24 h-24' : 'w-14 h-14'
                }`}
                style={{
                  background: isEveningEffective
                    ? 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(106,37,53,0.38) 45%, transparent 72%)'
                    : 'radial-gradient(circle, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.08) 48%, transparent 72%)',
                }}
              />
            </button>
          </div>

          {/* Mobile burgundy gradient modulated cleanly */}
          <div
            className="absolute inset-0 lg:hidden pointer-events-none"
            style={{ background: mobileOverlayGradient }}
          />
        </div>

        {/* Reading-side text block */}
        <div className="relative z-10 pointer-events-none lg:pointer-events-auto lg:col-span-6 lg:order-1 flex flex-col justify-end lg:justify-center px-5 sm:px-10 lg:px-14 pb-20 pt-56 sm:pt-64 lg:py-28 max-w-2xl lg:ms-auto">
          <div className="pointer-events-auto">
            <p
              data-testid="hero-time-greeting"
              className={`text-sm text-white/85 mb-1.5 ${
                lang === 'ar' ? 'font-ar-body' : 'font-lat-body'
              }`}
            >
              {lang === 'ar' ? tod.greetingAr : tod.greetingFr}
            </p>
            <p className="font-lat-label text-[11px] sm:text-xs text-white/80">
              {BRAND_DATA.eyebrow}
            </p>

            <h1 className="mt-4 font-ar-display text-[clamp(2.35rem,6vw,4.25rem)] text-white leading-[1.16] text-balance">
              {COPY.hero.headlineAr}
            </h1>
            <p className="mt-2 font-lat-display text-[clamp(0.95rem,1.9vw,1.35rem)] text-white/90">
              {COPY.hero.headlineFrCaps}
            </p>

            {/* Two plain-text info lines (NO boxes/cards) */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/85">
              <bdi dir="ltr">{COPY.hero.googleSummary}</bdi>
              <span className="inline-flex items-center gap-2" data-testid="hero-live-status">
                <span
                  className={`w-2 h-2 rounded-full ${
                    status.isOpen ? 'bg-white animate-pulse' : 'bg-white/40'
                  }`}
                  aria-hidden="true"
                />
                <span>{lang === 'ar' ? status.statusTextAr : status.statusTextFr}</span>
              </span>
            </div>

            {/* Primary + Secondary CTAs with Signature Moment #11 (sweep + rotating rosette on press) */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={BRAND_DATA.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('directions', 'hero')}
                className="btn-sweep btn-sweep-dark inline-flex items-center justify-center gap-2 px-7 py-3 bg-white text-[#541B28] hover:text-white font-semibold text-sm transition-colors"
              >
                <RosetteMark tone="dark" className="w-3.5 h-3.5 btn-rosette" />
                <span>{lang === 'ar' ? COPY.actions.directions.ar : COPY.actions.directions.fr}</span>
              </a>

              <a
                href={BRAND_DATA.phoneHref}
                onClick={() => trackClick('call', 'hero')}
                className="btn-sweep btn-sweep-dark inline-flex items-center justify-center gap-2 px-7 py-3 border border-white text-white font-medium text-sm transition-colors"
              >
                <RosetteMark className="w-3.5 h-3.5 btn-rosette" />
                <span>{lang === 'ar' ? COPY.actions.call.ar : COPY.actions.call.fr}</span>
              </a>
            </div>

            {/* Thin scroll cue line */}
            <div className="mt-10 hidden sm:flex items-center gap-3 text-white/60" aria-hidden="true">
              <span className="w-px h-8 bg-white/40 block" />
            </div>
          </div>
        </div>
      </div>

      <CarpetDivider />

      {/* Signature Moment #9: Marquee Band reacting to scroll velocity and reversing on scroll-up */}
      <div
        className="w-full overflow-hidden py-4 bg-[#3A111B] border-y border-white/18"
        aria-hidden="true"
        data-testid="scroll-marquee-band"
      >
        <div
          ref={marqueeTrackRef}
          className="flex w-max items-center whitespace-nowrap will-change-transform"
        >
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="inline-flex items-center gap-6 px-4 text-white/85">
              <span className="font-ar-display text-base sm:text-lg">{COPY.hero.marqueeText}</span>
              <RosetteMark className="w-4 h-4 text-white/75" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

interface StorySectionProps {
  lang: Lang;
}

export const StorySection: React.FC<StorySectionProps> = ({ lang }) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [scrubProgress, setScrubProgress] = useState(0);
  const [parallaxY, setParallaxY] = useState(0);

  // Continuous scroll progress for word-by-word scrub (#7) and <=8% photo B parallax
  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = Math.max(1, window.innerHeight + rect.height);
      const raw = (window.innerHeight - rect.top) / total;
      const clamped = Math.max(0, Math.min(1, raw));
      setParallaxY((clamped - 0.5) * -44);

      // Words begin illuminating near section entry and finish smoothly by mid-scroll
      const wordProgress = Math.max(0, Math.min(1, (raw - 0.12) / 0.42));
      setScrubProgress(wordProgress);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const lines = lang === 'ar' ? COPY.story.linesAr : COPY.story.linesFr;
  const keywords = lang === 'ar' ? COPY.story.keywordsAr : COPY.story.keywordsFr;

  const tokenizedLines = useMemo(() => lines.map((l) => l.split(' ')), [lines]);
  const totalWords = useMemo(
    () =>
      tokenizedLines.reduce((acc, words) => acc + words.length, 0) + keywords.length,
    [tokenizedLines, keywords]
  );

  // Reduced motion: show all words cleanly at full opacity
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const effectiveScrub = reduced ? 1 : scrubProgress;
  let runningWordIndex = 0;

  return (
    <section
      id="story"
      ref={sectionRef}
      className="scroll-mt-16 py-24 lg:py-40 px-5 sm:px-8 bg-[#541B28] text-white"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Text Side (first on mobile, reading side on desktop) */}
          <div className="lg:col-span-6 space-y-8">
            <SectionTitle titleAr={COPY.story.titleAr} titleFrCaps={COPY.story.titleFrCaps} />

            {/* Signature Moment #7: Words scrub smoothly 25% -> 100% opacity word-by-word (never per letter) */}
            <div className="space-y-6 pt-2" data-testid="story-scrub-text">
              {tokenizedLines.map((words, lineIdx) => (
                <p
                  key={lineIdx}
                  className={`text-lg sm:text-xl lg:text-2xl ${
                    lang === 'ar' ? 'font-ar-body' : 'font-lat-body'
                  }`}
                >
                  {words.map((word, wIdx) => {
                    const threshold = runningWordIndex / Math.max(1, totalWords - 1);
                    runningWordIndex += 1;
                    const delta = effectiveScrub - threshold * 0.88;
                    const opacity = Math.max(0.25, Math.min(1, 0.25 + delta * 6.5));
                    return (
                      <React.Fragment key={wIdx}>
                        <span
                          className="text-white transition-opacity duration-150"
                          style={{ opacity: +opacity.toFixed(2) }}
                        >
                          {word}
                        </span>
                        {wIdx < words.length - 1 ? ' ' : ''}
                      </React.Fragment>
                    );
                  })}
                </p>
              ))}

              {/* Four keywords set in the display font */}
              <div className="pt-2 flex flex-wrap items-baseline gap-x-5 gap-y-2">
                {keywords.map((kw, idx) => {
                  const threshold = runningWordIndex / Math.max(1, totalWords - 1);
                  runningWordIndex += 1;
                  const delta = effectiveScrub - threshold * 0.88;
                  const opacity = Math.max(0.25, Math.min(1, 0.25 + delta * 6.5));
                  return (
                    <span
                      key={kw}
                      className={`${
                        lang === 'ar'
                          ? 'font-ar-display text-2xl sm:text-3xl'
                          : 'font-lat-display text-lg sm:text-xl'
                      } text-white transition-opacity duration-150`}
                      style={{ opacity: +opacity.toFixed(2) }}
                    >
                      {kw}
                      {idx < keywords.length - 1 ? (lang === 'ar' ? '،' : ',') : '.'}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Photos Side: Sticky A (pointed-arch top) + Overlapping B (pointed-arch top, smaller) */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <div className="relative pb-20 sm:pb-24">
              <div className="w-full lg:w-[86%] aspect-[3/4]">
                <ArchedPhoto
                  photo={PHOTOS.storyA}
                  lang={lang}
                  sizes="(max-width: 1023px) 100vw, 40vw"
                />
              </div>

              {/* Photo B: smaller, offset, overlapping A, with thin offset white hairline frame behind */}
              <div
                className="relative w-[58%] sm:w-[52%] aspect-[3/4] -mt-28 sm:-mt-36 ms-auto z-10"
                style={{ transform: `translate3d(0, ${parallaxY}px, 0)` }}
              >
                {/* Thin offset white hairline frame behind */}
                <div
                  className="pointed-arch-top absolute inset-0 translate-x-2.5 translate-y-2.5 border border-white/25 pointer-events-none"
                  aria-hidden="true"
                />
                <ArchedPhoto
                  photo={PHOTOS.storyB}
                  lang={lang}
                  sizes="(max-width: 1023px) 55vw, 24vw"
                  className="relative z-10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
