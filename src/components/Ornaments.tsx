import React, { useEffect, useRef, useState } from 'react';
import type { Lang, ResponsivePhoto } from '../content';

export const LOGO_SRC = '/assets/aistudio/LOGO_eabd8839.jpg';

function buildPetalWedgeClip(litPetals: number): string | undefined {
  if (litPetals >= 8) return undefined;
  if (litPetals <= 0) return 'polygon(50% 50%, 50% 50%, 50% 50%)';
  const points: string[] = ['50% 50%'];
  const startDeg = -22.5;
  for (let i = 0; i <= litPetals; i++) {
    const rad = ((startDeg + i * 45) * Math.PI) / 180;
    const x = +(50 + 76 * Math.sin(rad)).toFixed(1);
    const y = +(50 - 76 * Math.cos(rad)).toFixed(1);
    points.push(`${x}% ${y}%`);
  }
  return `polygon(${points.join(', ')})`;
}

/**
 * Ornament 1: Exact uploaded logo (/assets/aistudio/LOGO_eabd8839.jpg) kept unchanged.
 * Uses seamless CSS luminance keying so only the white rosette appears cleanly over any surface,
 * and supports 8-sector petal fill progression for scroll progress & intro reveal.
 */
export const RosetteMark: React.FC<{
  className?: string;
  blooming?: boolean;
  progress?: number;
  strokeProgress?: number;
  tone?: 'light' | 'dark';
}> = ({
  className = 'w-8 h-8',
  blooming = false,
  progress,
  strokeProgress,
  tone = 'light',
}) => {
  const isProgressive = typeof progress === 'number';
  const litPetals = isProgressive ? Math.max(0, Math.min(8, Math.round(progress * 8))) : 8;
  const clipPoly = isProgressive ? buildPetalWedgeClip(litPetals) : undefined;
  const imgClass = tone === 'dark' ? 'logo-img-on-white' : 'logo-img-light';

  if (isProgressive) {
    const revealClip =
      typeof strokeProgress === 'number'
        ? `circle(${Math.round(Math.max(12, strokeProgress * 75))}% at 50% 50%)`
        : undefined;

    return (
      <span
        className={`relative inline-block shrink-0 overflow-hidden select-none ${className} ${
          blooming ? 'animate-rosette-bloom' : ''
        }`}
        aria-hidden="true"
        style={revealClip ? { clipPath: revealClip } : undefined}
      >
        <img
          src={LOGO_SRC}
          alt=""
          draggable={false}
          className={`w-full h-full object-cover scale-[1.32] opacity-25 ${imgClass}`}
        />
        <img
          src={LOGO_SRC}
          alt=""
          draggable={false}
          className={`absolute inset-0 w-full h-full object-cover scale-[1.32] ${imgClass}`}
          style={{ clipPath: clipPoly }}
        />
      </span>
    );
  }

  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden select-none ${className} ${
        blooming ? 'animate-rosette-bloom' : ''
      }`}
      aria-hidden="true"
    >
      <img
        src={LOGO_SRC}
        alt=""
        draggable={false}
        className={`w-full h-full object-cover scale-[1.32] ${imgClass}`}
      />
    </span>
  );
};

/**
 * Signature Moment #1: Exact logo intro loader -> radial + petal-by-petal bloom ->
 * shrinks and flies toward the header logo position. <=1.4s, once per session, skippable.
 */
export const IntroLoader: React.FC<{
  lang: Lang;
  skipLabel: string;
  onDone: () => void;
}> = ({ lang, skipLabel, onDone }) => {
  const [strokeProg, setStrokeProg] = useState(0);
  const [fillProg, setFillProg] = useState(0);
  const [flyingToHeader, setFlyingToHeader] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const s = Math.min(1, elapsed / 420);
      setStrokeProg(s);
      const f = elapsed < 360 ? 0 : Math.min(1, (elapsed - 360) / 560);
      setFillProg(f);

      if (elapsed < 980) {
        raf = window.requestAnimationFrame(tick);
      }
    };
    raf = window.requestAnimationFrame(tick);

    const flyTimer = window.setTimeout(() => setFlyingToHeader(true), 960);
    const doneTimer = window.setTimeout(() => onDone(), 1360);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        onDone();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(flyTimer);
      window.clearTimeout(doneTimer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onDone]);

  const flyTransform = flyingToHeader
    ? lang === 'ar'
      ? 'translate3d(38vw, -43vh, 0) scale(0.32)'
      : 'translate3d(-38vw, -43vh, 0) scale(0.32)'
    : 'translate3d(0, 0, 0) scale(1)';

  return (
    <div
      role="status"
      aria-label={lang === 'ar' ? 'الخان — جارٍ التحميل' : 'ElKhan — Chargement'}
      data-testid="intro-loader"
      onClick={onDone}
      className={`fixed inset-0 z-50 bg-[#3A111B] text-white flex flex-col items-center justify-center transition-opacity duration-350 ease-out ${
        flyingToHeader ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div
        className="flex flex-col items-center gap-5 pointer-events-none transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: flyTransform }}
      >
        <RosetteMark
          className="w-28 h-28 sm:w-32 sm:h-32"
          strokeProgress={strokeProg}
          progress={fillProg}
        />
        <Wordmark size="md" />
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDone();
        }}
        data-testid="intro-skip-btn"
        className="mt-10 px-5 min-h-[44px] text-xs font-lat-label text-white/75 hover:text-white underline underline-offset-4 cursor-pointer"
      >
        {skipLabel}
      </button>
    </div>
  );
};

/**
 * Wordmark "الخَّان" + small "ELKHAN" beneath, mimicking the printed menu header.
 * <!-- OFFICIAL_WORDMARK_SVG_SLOT: Replace this lockup with official SVG wordmark when supplied -->
 */
export const Wordmark: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'sm' }) => {
  const arSize = size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-xl';
  const latSize = size === 'lg' ? 'text-xs' : 'text-[9px]';

  return (
    <span className="inline-flex flex-col items-center leading-none text-white select-none">
      <span className={`font-ar-display ${arSize} leading-[1.05]`}>الخَّان</span>
      <span className={`font-lat-label ${latSize} mt-0.5 text-white/90`}>ELKHAN</span>
    </span>
  );
};

/**
 * Bilingual Section Title Lockup (FONT_STYLE.PNG ground truth):
 * Arabic geometric display line on top (with tatweel) + French ALL-CAPS line tight beneath.
 * Always stays bilingual in both AR and FR modes.
 */
export const SectionTitle: React.FC<{
  titleAr: string;
  titleFrCaps: string;
  align?: 'start' | 'center';
}> = ({ titleAr, titleFrCaps, align = 'start' }) => (
  <header className={align === 'center' ? 'text-center' : 'text-start'}>
    <h2 className="font-ar-display text-[clamp(2.25rem,5vw,3.75rem)] text-white leading-[1.15]">
      {titleAr}
    </h2>
    <p className="font-lat-display text-[clamp(0.85rem,1.6vw,1.15rem)] text-white/90 mt-1">
      {titleFrCaps}
    </p>
  </header>
);

/**
 * Ornament 2 + Signature Moment #8: Carpet-border divider that draws itself
 * from the reading side on scroll enter, then stays visible.
 */
export const CarpetDivider: React.FC<{ withRosette?: boolean }> = ({ withRosette = true }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setDrawn(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="w-full py-3 flex items-center gap-4 px-5 sm:px-10 opacity-35"
      aria-hidden="true"
    >
      <div
        className={`flex-1 overflow-hidden origin-end transition-transform duration-900 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          drawn ? 'scale-x-100' : 'scale-x-0'
        }`}
      >
        <svg viewBox="0 0 600 18" preserveAspectRatio="none" className="w-full h-[18px] block text-white">
          <line x1="0" y1="2" x2="600" y2="2" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="16" x2="600" y2="16" stroke="currentColor" strokeWidth="1" />
          {Array.from({ length: 30 }).map((_, i) => {
            const cx = 10 + i * 20;
            return (
              <path
                key={i}
                d={`M ${cx} 5 C ${cx + 3} 8, ${cx + 3} 10, ${cx} 13 C ${cx - 3} 10, ${cx - 3} 8, ${cx} 5 Z`}
                fill="currentColor"
              />
            );
          })}
        </svg>
      </div>

      {withRosette && (
        <RosetteMark
          className={`w-5 h-5 text-white shrink-0 transition-transform duration-700 ${
            drawn ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}
        />
      )}

      <div
        className={`flex-1 overflow-hidden origin-start transition-transform duration-900 delay-150 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          drawn ? 'scale-x-100' : 'scale-x-0'
        }`}
      >
        <svg viewBox="0 0 600 18" preserveAspectRatio="none" className="w-full h-[18px] block text-white">
          <line x1="0" y1="2" x2="600" y2="2" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="16" x2="600" y2="16" stroke="currentColor" strokeWidth="1" />
          {Array.from({ length: 30 }).map((_, i) => {
            const cx = 10 + i * 20;
            return (
              <path
                key={i}
                d={`M ${cx} 5 C ${cx + 3} 8, ${cx + 3} 10, ${cx} 13 C ${cx - 3} 10, ${cx - 3} 8, ${cx} 5 Z`}
                fill="currentColor"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

/**
 * Ornament 3 + Signature Moment #6: Pointed-arch top edge photo (ONLY on Story A, Story B, Footer calligraphy).
 * Reveals bottom->top with clip-path + 1.08->1 inner image zoom on enter.
 */
export const ArchedPhoto: React.FC<{
  photo: ResponsivePhoto;
  lang: Lang;
  sizes: string;
  className?: string;
}> = ({ photo, lang, sizes, className = '' }) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.14 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`pointed-arch-top w-full h-full overflow-hidden bg-[#3A111B] ${className}`}
    >
      <div
        className="w-full h-full transition-[clip-path,opacity] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          clipPath: revealed ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)',
          opacity: revealed ? 1 : 0.35,
        }}
      >
        <img
          src={photo.src}
          srcSet={photo.srcSet}
          sizes={sizes}
          width={photo.width}
          height={photo.height}
          alt={lang === 'ar' ? photo.altAr : photo.altFr}
          loading="lazy"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            revealed ? 'scale-100' : 'scale-[1.08]'
          }`}
        />
      </div>
    </div>
  );
};

/**
 * Signature Moment #5 (desktop only): Minimal thin white coffee-cup outline in corner
 * filling progressively with --burgundy-soft as page scrolls.
 */
export const CupIndicator: React.FC<{ progress: number }> = ({ progress }) => {
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));
  const fillTop = 100 - pct;

  return (
    <div
      className="hidden lg:flex fixed bottom-6 end-6 z-20 pointer-events-none opacity-75"
      aria-hidden="true"
      data-testid="desktop-cup-indicator"
    >
      <svg viewBox="0 0 40 42" className="w-8 h-9 overflow-visible">
        <defs>
          <clipPath id="elkhan-cup-bowl">
            <path d="M 8 10 L 30 10 L 27 29 C 26 33 23 35 19 35 C 15 35 12 33 11 29 Z" />
          </clipPath>
        </defs>
        {/* Fill level inside the cup bowl */}
        <g clipPath="url(#elkhan-cup-bowl)">
          <rect
            x="6"
            y="10"
            width="26"
            height="26"
            fill="#6A2535"
            style={{ clipPath: `inset(${fillTop}% 0 0 0)` }}
          />
        </g>
        {/* Thin white cup + handle + saucer outline */}
        <path
          d="M 8 10 L 30 10 L 27 29 C 26 33 23 35 19 35 C 15 35 12 33 11 29 Z"
          fill="none"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.25"
        />
        <path
          d="M 29.5 13 C 34.5 13 35.5 20.5 29 22"
          fill="none"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <line
          x1="7"
          y1="38"
          x2="31"
          y2="38"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

/**
 * Signature Moment #12: Tap petals — max 5 fading white petals dropped on empty space taps.
 */
export interface TapPetalItem {
  id: number;
  x: number;
  y: number;
}

export const TapPetalsLayer: React.FC<{ petals: TapPetalItem[] }> = ({ petals }) => {
  if (petals.length === 0) return null;

  return (
    <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden" aria-hidden="true">
      {petals.map((p) => (
        <svg
          key={p.id}
          viewBox="0 0 20 28"
          className="fixed w-3.5 h-5 text-white/80 animate-petal-drop"
          style={{ left: `${p.x}px`, top: `${p.y}px` }}
        >
          <path
            d="M 10 26 C 17 18 17 9 10 2 C 3 9 3 18 10 26 Z"
            fill="currentColor"
          />
        </svg>
      ))}
    </div>
  );
};
