import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { BRAND_DATA, COPY, PHOTOS, REVIEWS, type Lang } from '../content';
import {
  type DayKey,
  get24hClockGeometry,
  getAlgiersDateParts,
  getAlgiersOpenStatus,
  getDayHoursInfo,
  getInviteShareMessage,
  getWhatsAppInviteUrl,
  trackClick,
} from '../utils/khanLogic';
import { ArchedPhoto, CarpetDivider, RosetteMark, SectionTitle, Wordmark } from './Ornaments';
import { renderElKhanPostcard, shareOrDownloadCanvas } from '../utils/postcardCanvas';

/* ============================================================================
   5. «آراء الضيـوف» / LES AVIS
   ============================================================================ */
interface ReviewsSectionProps {
  lang: Lang;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ lang }) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [turningSlide, setTurningSlide] = useState(false);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [ratingDisplay, setRatingDisplay] = useState(0);
  const [starsProgress, setStarsProgress] = useState(0);
  const [counts, setCounts] = useState<number[]>(() =>
    BRAND_DATA.themesMentioned.map(() => 0)
  );
  const hasEnteredRef = useRef(false);

  // Animate 4,7 + 5 stars (last 70%) + Live Words counts (23, 17, 9, 7) on enter
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const targets = BRAND_DATA.themesMentioned.map((t) => t.count);

    const runAnimations = () => {
      if (hasEnteredRef.current) return;
      hasEnteredRef.current = true;
      const reduced =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        setRatingDisplay(4.7);
        setStarsProgress(1);
        setCounts(targets);
        return;
      }
      const start = performance.now();
      const duration = 900;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setRatingDisplay(+(4.7 * eased).toFixed(1));
        setStarsProgress(eased);
        setCounts(targets.map((val) => Math.round(val * eased)));
        if (t < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          runAnimations();
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const onScroll = () => {
      const children = Array.from(rail.children) as HTMLElement[];
      const railRect = rail.getBoundingClientRect();
      const center = railRect.left + railRect.width / 2;
      let best = 0;
      let bestDist = Infinity;
      children.forEach((child, idx) => {
        const rect = child.getBoundingClientRect();
        const dist = Math.abs(rect.left + rect.width / 2 - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = idx;
        }
      });
      setActiveSlide(best);
    };
    rail.addEventListener('scroll', onScroll, { passive: true });
    return () => rail.removeEventListener('scroll', onScroll);
  }, []);

  const jumpToReview = (index: number) => {
    const rail = railRef.current;
    if (!rail) return;
    setTurningSlide(true);
    window.setTimeout(() => setTurningSlide(false), 360);
    const child = rail.children[index] as HTMLElement | undefined;
    if (child) {
      child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    setActiveSlide(index);
  };

  const renderUnderlinedQuote = (quote: string, keywords: string[]) => {
    if (keywords.length === 0) return quote;
    const escaped = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts = quote.split(regex);
    return parts.map((part, idx) => {
      const matched = keywords.some((k) => k.toLowerCase() === part.toLowerCase());
      if (!matched) return <React.Fragment key={idx}>{part}</React.Fragment>;
      return (
        <span key={idx} className="underline decoration-white decoration-1 underline-offset-4 text-white">
          {part}
        </span>
      );
    });
  };

  const formattedRating = ratingDisplay.toFixed(1).replace('.', ',');

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className="scroll-mt-16 py-24 lg:py-40 px-5 sm:px-8 bg-[#3A111B] text-white border-t border-white/18"
    >
      <div className="max-w-[1200px] mx-auto">
        <SectionTitle titleAr={COPY.reviews.titleAr} titleFrCaps={COPY.reviews.titleFrCaps} />

        <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Start Column: Big 4,7 (counts from 0) + 5 white stars filling one by one (last 70%) */}
          <div className="lg:col-span-4 space-y-3">
            <p
              data-testid="reviews-rating-number"
              className="font-lat-display text-6xl sm:text-7xl text-white tabular-nums leading-none"
            >
              {formattedRating}
            </p>
            <div className="flex items-center gap-1.5 pt-2" aria-label="4.7 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => {
                const targetFill = i < 4 ? 1 : 0.7;
                // Sequential reveal: star 0 fills during 0..0.2 of starsProgress, star 4 during 0.8..1.0
                const segStart = i * 0.16;
                const localProgress = Math.max(0, Math.min(1, (starsProgress - segStart) / 0.36));
                const fillPct = targetFill * localProgress * 100;
                const clipId = `elkhan-star-${i}`;

                return (
                  <svg
                    key={i}
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    aria-hidden="true"
                    data-testid={`rating-star-${i}`}
                  >
                    <defs>
                      <clipPath id={clipId}>
                        <rect x="0" y="0" width={`${(24 * fillPct) / 100}`} height="24" />
                      </clipPath>
                    </defs>
                    <polygon
                      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                      fill="none"
                      stroke="rgba(255,255,255,0.45)"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                      fill="#FFFFFF"
                      clipPath={`url(#${clipId})`}
                    />
                  </svg>
                );
              })}
            </div>
            <p className="text-sm text-white/80">
              <bdi dir="ltr">{COPY.reviews.countLabel}</bdi>
            </p>
          </div>

          {/* Quotes Column: Horizontal Scroll-Snap Swipe with Page-Turn feel, Dots & Keyboard Support */}
          <div className="lg:col-span-8">
            <div
              ref={railRef}
              tabIndex={0}
              role="region"
              aria-label={lang === 'ar' ? 'آراء الضيوف' : 'Avis des visiteurs'}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') {
                  const next =
                    lang === 'ar'
                      ? (activeSlide - 1 + REVIEWS.length) % REVIEWS.length
                      : (activeSlide + 1) % REVIEWS.length;
                  jumpToReview(next);
                } else if (e.key === 'ArrowLeft') {
                  const next =
                    lang === 'ar'
                      ? (activeSlide + 1) % REVIEWS.length
                      : (activeSlide - 1 + REVIEWS.length) % REVIEWS.length;
                  jumpToReview(next);
                }
              }}
              className={`flex overflow-x-auto snap-x snap-mandatory no-scrollbar focus:outline-none transition-[opacity,filter] duration-300 ${
                turningSlide ? 'opacity-80 blur-[1.5px]' : 'opacity-100 blur-0'
              }`}
            >
              {REVIEWS.map((review) => (
                <article
                  key={review.id}
                  className="shrink-0 w-full snap-center pb-4"
                >
                  <blockquote
                    dir="ltr"
                    lang={review.lang}
                    className="font-lat-body text-xl sm:text-2xl lg:text-3xl leading-relaxed text-white/90 text-left"
                  >
                    « {renderUnderlinedQuote(review.quote, review.underlineWords)} »
                  </blockquote>

                  <div dir="ltr" className="mt-6 flex items-center gap-3 text-left">
                    <span className="font-lat-label text-xs text-white">
                      {review.author}
                    </span>
                    <span className="text-white/35" aria-hidden="true">·</span>
                    <span className="text-xs text-white/60">Google</span>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Dots */}
            <div className="mt-6 flex items-center gap-3">
              {REVIEWS.map((r, idx) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => jumpToReview(idx)}
                  aria-label={`${r.author} (${idx + 1}/${REVIEWS.length})`}
                  aria-current={activeSlide === idx ? 'true' : undefined}
                  className="flex items-center justify-center w-11 h-11 cursor-pointer"
                >
                  <span
                    className={`block h-1.5 transition-all duration-300 ${
                      activeSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/35'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LIVE WORDS: count-up + tappable themes + 4-bar equalizer next to musique/موسيقى */}
        <div className="mt-14 pt-8 border-t border-white/18 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm sm:text-base text-white/80">
            <span className="text-white/60 me-1">
              {lang === 'ar' ? COPY.reviews.themesHeaderAr : COPY.reviews.themesHeaderFr}:
            </span>
            {BRAND_DATA.themesMentioned.map((t, i) => {
              const isHighlighted = activeTheme === t.key;
              return (
                <React.Fragment key={t.key}>
                  <button
                    type="button"
                    data-testid={`theme-btn-${t.key}`}
                    aria-pressed={isHighlighted}
                    onClick={() => {
                      setActiveTheme(t.key);
                      if (t.reviewIndex !== null) {
                        jumpToReview(t.reviewIndex);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 min-h-[44px] px-1 transition-colors cursor-pointer ${
                      isHighlighted
                        ? 'text-white font-semibold underline decoration-white decoration-1 underline-offset-4'
                        : 'text-white/90 font-medium hover:text-white'
                    }`}
                  >
                    {t.key === 'music' && (
                      <span
                        className="inline-flex items-end gap-[2px] h-3 me-0.5"
                        aria-hidden="true"
                        data-testid="music-equalizer"
                      >
                        <span className="w-[2px] h-full bg-white animate-eq-1" />
                        <span className="w-[2px] h-full bg-white animate-eq-2" />
                        <span className="w-[2px] h-full bg-white animate-eq-3" />
                        <span className="w-[2px] h-full bg-white animate-eq-4" />
                      </span>
                    )}
                    <span>{lang === 'ar' ? t.ar : t.fr}</span>
                    <span
                      className={`tabular-nums font-lat-body ${
                        isHighlighted ? 'text-white font-bold' : 'text-white/85'
                      }`}
                    >
                      {counts[i]}
                    </span>
                  </button>
                  {i < BRAND_DATA.themesMentioned.length - 1 && (
                    <span className="text-white/35" aria-hidden="true">·</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <a
            href={BRAND_DATA.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick('directions', 'reviews')}
            className="inline-flex items-center text-sm text-white underline underline-offset-4 hover:text-white/80 whitespace-nowrap"
          >
            {lang === 'ar' ? COPY.reviews.allReviewsAr : COPY.reviews.allReviewsFr}
          </a>
        </div>
      </div>

      <div className="mt-20 lg:mt-28">
        <CarpetDivider />
      </div>
    </section>
  );
};

/* ============================================================================
   6. «زورونـا» / NOUS TROUVER (visit)
   ============================================================================ */
interface VisitSectionProps {
  lang: Lang;
  sectionRef: React.RefObject<HTMLElement | null>;
}

export const VisitSection: React.FC<VisitSectionProps> = ({ lang, sectionRef }) => {
  const { status, parts, dial } = useMemo(() => {
    const now = new Date();
    const s = getAlgiersOpenStatus(now);
    const p = getAlgiersDateParts(now);
    const d = get24hClockGeometry(s.todayKey, p.hour, p.minute);
    return { status: s, parts: p, dial: d };
  }, []);

  const [selectedDay, setSelectedDay] = useState<DayKey>(status.todayKey);
  const [dialEntered, setDialEntered] = useState(false);

  // Trigger Hours Dial arc draw + hand sweep from 00:00 on enter
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setDialEntered(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [sectionRef]);

  const selectedDayInfo = useMemo(
    () => getDayHoursInfo(selectedDay, new Date()),
    [selectedDay]
  );

  // Compute rotation needed relative to 12 o'clock (-90deg) so CSS transforms smoothly 0 -> target
  const sweepAngleDeg = dial.handAngleDeg + 90;
  const waUrl = getWhatsAppInviteUrl(lang, BRAND_DATA.mapsUrl);

  const handleInviteClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackClick('invite', 'visit');
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      e.preventDefault();
      navigator
        .share({
          title: 'الخان | ElKhan',
          text: getInviteShareMessage(lang, BRAND_DATA.mapsUrl),
        })
        .catch(() => {});
    }
  };

  return (
    <section
      id="visit"
      ref={sectionRef}
      className="scroll-mt-16 relative py-24 lg:py-40 px-5 sm:px-8 bg-[#541B28] text-white overflow-hidden"
    >
      {/* Ornament 1: Huge faint (6-8% opacity) rosette watermark turning slowly (90s) */}
      <div
        className="pointer-events-none absolute -end-28 top-1/2 -translate-y-1/2 opacity-[0.07]"
        aria-hidden="true"
      >
        <RosetteMark className="w-[460px] h-[460px] lg:w-[540px] lg:h-[540px] text-white animate-rosette-slow" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto">
        <SectionTitle titleAr={COPY.visit.titleAr} titleFrCaps={COPY.visit.titleFrCaps} />

        <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Info Column */}
          <div className="lg:col-span-6 space-y-8">
            {/* Address in Large Type */}
            <p className="font-lat-body text-2xl sm:text-3xl font-medium text-white leading-snug" dir="ltr">
              {BRAND_DATA.address}
            </p>

            {/* Live Open/Closed Status */}
            <div className="inline-flex items-center gap-2.5 text-sm sm:text-base text-white">
              <span
                className={`w-2 h-2 rounded-full ${
                  status.isOpen ? 'bg-white animate-pulse' : 'bg-white/40'
                }`}
                aria-hidden="true"
              />
              <span>{lang === 'ar' ? status.statusTextAr : status.statusTextFr}</span>
            </div>

            {/* Circular 24h SVG Hours Dial + Day Selector «متى نلتقي؟ / On se retrouve quand ?» */}
            <div className="space-y-6 border-y border-white/18 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div
                  className="relative w-40 h-40 sm:w-44 sm:h-44 shrink-0"
                  role="img"
                  data-testid="hours-dial-svg"
                  aria-label={`${lang === 'ar' ? COPY.visit.dialLabelAr : COPY.visit.dialLabelFr} (${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')})`}
                >
                  <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                    {/* White hairline 24h ring */}
                    <circle
                      cx="100"
                      cy="100"
                      r="82"
                      fill="none"
                      stroke="rgba(255,255,255,0.22)"
                      strokeWidth="1"
                    />

                    {/* 24 subtle hour ticks */}
                    {Array.from({ length: 24 }).map((_, h) => {
                      const deg = (h / 24) * 360 - 90;
                      const rad = (deg * Math.PI) / 180;
                      const isCardinal = h % 6 === 0;
                      const r1 = isCardinal ? 74 : 78;
                      const r2 = 82;
                      return (
                        <line
                          key={h}
                          x1={100 + r1 * Math.cos(rad)}
                          y1={100 + r1 * Math.sin(rad)}
                          x2={100 + r2 * Math.cos(rad)}
                          y2={100 + r2 * Math.sin(rad)}
                          stroke={isCardinal ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.18)'}
                          strokeWidth={isCardinal ? '1.2' : '0.8'}
                        />
                      );
                    })}

                    <text x="100" y="12" textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="9" className="font-lat-label">
                      00
                    </text>
                    <text x="191" y="103" textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="9" className="font-lat-label">
                      06
                    </text>
                    <text x="100" y="195" textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="9" className="font-lat-label">
                      12
                    </text>
                    <text x="9" y="103" textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="9" className="font-lat-label">
                      18
                    </text>

                    {/* White arc for today's open hours drawing smoothly on enter */}
                    <path
                      d={dial.arcPath}
                      pathLength={100}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="100"
                      strokeDashoffset={dialEntered ? 0 : 100}
                      className="transition-[stroke-dashoffset] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    />

                    {/* Thin hand sweeping from 00:00 (top) to current Africa/Algiers time in 1s */}
                    <g
                      style={{
                        transformOrigin: '100px 100px',
                        transform: `rotate(${dialEntered ? sweepAngleDeg : 0}deg)`,
                      }}
                      className="transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    >
                      <line
                        x1="100"
                        y1="100"
                        x2="100"
                        y2="34"
                        stroke="#FFFFFF"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                      />
                      <circle cx="100" cy="34" r="2.5" fill="#FFFFFF" />
                    </g>
                  </svg>

                  {/* Small SVG rosette at center */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <RosetteMark className="w-7 h-7 text-white" />
                  </div>
                </div>

                {/* Day Selector «متى نلتقي؟ / On se retrouve quand ?» */}
                <div className="flex-1 space-y-3" data-testid="visit-day-selector">
                  <p className="text-xs text-white/65">
                    {lang === 'ar' ? COPY.visit.daySelectorAr : COPY.visit.daySelectorFr}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {COPY.visit.daysOfWeek.map((d) => {
                      const active = selectedDay === d.key;
                      return (
                        <button
                          key={d.key}
                          type="button"
                          data-testid={`day-btn-${d.key}`}
                          aria-pressed={active}
                          onClick={() => setSelectedDay(d.key)}
                          className={`min-h-[44px] px-1.5 text-sm transition-colors cursor-pointer whitespace-nowrap ${
                            active
                              ? 'text-white font-semibold underline underline-offset-4 decoration-1'
                              : 'text-white/60 hover:text-white'
                          }`}
                        >
                          {lang === 'ar' ? d.ar : d.fr}
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-xs sm:text-sm space-y-1 pt-1">
                    <p
                      data-testid="selected-day-hours"
                      className="text-white font-medium tabular-nums font-lat-body"
                      dir="ltr"
                    >
                      {selectedDayInfo.timeRange}
                    </p>
                    {selectedDayInfo.liveStatus && (
                      <p
                        data-testid="selected-day-live-status"
                        className="text-white/80 text-xs"
                      >
                        {lang === 'ar'
                          ? selectedDayInfo.liveStatus.statusTextAr
                          : selectedDayInfo.liveStatus.statusTextFr}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Accessible two typographic hour lines kept beneath */}
              <div className="space-y-2.5 pt-2">
                {BRAND_DATA.hoursSummary.map((row) => {
                  const isToday = row.days.includes(status.todayKey);
                  return (
                    <div
                      key={row.key}
                      className={`flex items-baseline justify-between text-base sm:text-lg ${
                        isToday ? 'text-white font-semibold' : 'text-white/65'
                      }`}
                    >
                      <span>{lang === 'ar' ? row.labelAr : row.labelFr}</span>
                      <span className="tabular-nums font-lat-body" dir="ltr">
                        {row.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Average Spend Line */}
            <p className="text-sm text-white/75">
              {lang === 'ar' ? BRAND_DATA.averageSpendAr : BRAND_DATA.averageSpendFr}
            </p>

            {/* Primary CTA Buttons with reading-direction fill sweep + rotating rosette on press */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
              <a
                href={BRAND_DATA.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('directions', 'visit')}
                className="btn-sweep btn-sweep-dark inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-[#541B28] hover:text-white font-semibold text-sm transition-colors"
              >
                <RosetteMark tone="dark" className="w-3.5 h-3.5 btn-rosette" />
                <span>{lang === 'ar' ? COPY.actions.directions.ar : COPY.actions.directions.fr}</span>
              </a>

              <a
                href={BRAND_DATA.phoneHref}
                onClick={() => trackClick('call', 'visit')}
                className="btn-sweep btn-sweep-dark inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white text-white font-medium text-sm transition-colors"
              >
                <RosetteMark className="w-3.5 h-3.5 btn-rosette" />
                <span className="tabular-nums">
                  {lang === 'ar' ? COPY.actions.call.ar : COPY.actions.call.fr} ·{' '}
                  <bdi dir="ltr">{BRAND_DATA.phoneDisplay}</bdi>
                </span>
              </a>

              <a
                href={BRAND_DATA.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('instagram', 'visit')}
                className="btn-sweep btn-sweep-dark inline-flex items-center justify-center px-7 py-3.5 border border-white/45 text-white hover:border-white font-medium text-sm transition-colors"
              >
                <bdi dir="ltr">{BRAND_DATA.instagramHandle}</bdi>
              </a>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleInviteClick}
                data-testid="invite-friend-btn"
                className="btn-sweep btn-sweep-dark inline-flex items-center justify-center px-7 py-3.5 border border-white/45 text-white hover:border-white font-medium text-sm transition-colors"
              >
                {lang === 'ar' ? COPY.actions.invite.ar : COPY.actions.invite.fr}
              </a>
            </div>
          </div>

          {/* Visual & Map Column: Small interior photo (<=480px wide) + Tinted Map Embed */}
          <div className="lg:col-span-6 space-y-8">
            <div className="max-w-[320px] sm:max-w-[380px] aspect-[9/14] bg-[#3A111B] overflow-hidden">
              <img
                src={PHOTOS.visitInterior.src}
                srcSet={PHOTOS.visitInterior.srcSet}
                sizes="(max-width: 639px) 320px, 380px"
                width={PHOTOS.visitInterior.width}
                height={PHOTOS.visitInterior.height}
                alt={lang === 'ar' ? PHOTOS.visitInterior.altAr : PHOTOS.visitInterior.altFr}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full h-72 sm:h-80 bg-[#3A111B] border border-white/18 overflow-hidden relative">
              <iframe
                title="ElKhan Coffee Shop — El Biar, Alger"
                src={BRAND_DATA.mapsEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full border-0 filter grayscale-[0.45] sepia-[0.35] hue-rotate-[312deg] contrast-[1.08]"
              />
              <noscript>
                <a
                  href={BRAND_DATA.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-white p-4 block"
                >
                  {lang === 'ar' ? COPY.visit.fallbackMapAr : COPY.visit.fallbackMapFr}
                </a>
              </noscript>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ============================================================================
   7. FOOTER (including Postcard Composer #13 + Secret Table #14)
   ============================================================================ */
interface FooterSectionProps {
  lang: Lang;
  footerRef: React.RefObject<HTMLElement | null>;
}

const POSTCARD_CHOICES = [
  PHOTOS.hero,
  PHOTOS.storyA,
  PHOTOS.storyB,
  PHOTOS.foodRail[0],
  PHOTOS.footerCalligraphy,
];

export const FooterSection: React.FC<FooterSectionProps> = ({ lang, footerRef }) => {
  const [blooming, setBlooming] = useState(false);
  const [secretTapCount, setSecretTapCount] = useState(0);
  const [secretOpen, setSecretOpen] = useState(false);

  // Signature Moment #13: Postcard creator state
  const [postcardOpen, setPostcardOpen] = useState(false);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [renderingCard, setRenderingCard] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleRosetteTap = () => {
    setBlooming(false);
    window.requestAnimationFrame(() => {
      setBlooming(true);
    });
  };

  // Signature Moment #14: Center dot tapped 5 times reveals Secret Table message
  const handleCenterDotTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = secretTapCount + 1;
    if (next >= 5) {
      setSecretTapCount(0);
      setSecretOpen((prev) => !prev);
    } else {
      setSecretTapCount(next);
    }
  };

  const renderPostcardCanvas = useCallback(async (photoSrc: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setRenderingCard(true);
    try {
      await renderElKhanPostcard(canvas, {
        photoSrc,
        titleText: COPY.postcard.signatureLabel,
        subtitleText: 'COFFEE & BRUNCH · ALGER',
      });
    } catch {
      // Canvas image draw gracefully ignored if blocked
    } finally {
      setRenderingCard(false);
    }
  }, []);

  useEffect(() => {
    if (postcardOpen) {
      renderPostcardCanvas(POSTCARD_CHOICES[selectedPhotoIdx].src);
    }
  }, [postcardOpen, selectedPhotoIdx, renderPostcardCanvas]);

  const handleDownloadPostcard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    trackClick('postcard', 'download');
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'elkhan-souvenir.png';
    a.click();
  };

  const handleSharePostcard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    trackClick('postcard', 'share');
    await shareOrDownloadCanvas(
      canvas,
      'elkhan-souvenir.png',
      'الخان | ElKhan',
      COPY.postcard.signatureLabel
    );
  };

  return (
    <footer ref={footerRef} className="bg-[#3A111B] text-white pb-16 lg:pb-12">
      <CarpetDivider />

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-14 pb-8 flex flex-col items-center text-center">
        {/* Ornament 3 (3rd and final arched photo): Calligraphy photo 722407742 (~280px) */}
        <div className="w-[240px] sm:w-[280px] aspect-[3/4]">
          <ArchedPhoto
            photo={PHOTOS.footerCalligraphy}
            lang={lang}
            sizes="280px"
          />
        </div>

        {/* Footer Rosette (blooms on tap) + Signature Moment #14 (center dot tapped 5x) */}
        <div className="relative mt-10 inline-flex items-center justify-center">
          <button
            type="button"
            onClick={handleRosetteTap}
            data-testid="footer-rosette-btn"
            aria-label={lang === 'ar' ? 'وردة الخان' : 'Rosace ElKhan'}
            className="p-2 text-white cursor-pointer"
          >
            <RosetteMark className="w-14 h-14 text-white" blooming={blooming} />
          </button>

          {/* Subtle center-dot tap target overlapping center circle */}
          <button
            type="button"
            onClick={handleCenterDotTap}
            data-testid="footer-center-dot-btn"
            aria-label={lang === 'ar' ? 'نقطة الوردة المركزية' : 'Centre de la rosace'}
            className="absolute w-11 h-11 rounded-full cursor-pointer bg-transparent"
          />
        </div>

        {/* Signature Moment #14: Secret Table reveal */}
        {secretOpen && (
          <p
            data-testid="secret-table-message"
            className={`mt-4 max-w-md text-sm text-white/90 border-y border-white/25 py-3 px-4 transition-opacity duration-500 ${
              lang === 'ar' ? 'font-ar-body' : 'font-lat-body'
            }`}
          >
            {lang === 'ar' ? COPY.footer.secretMessageAr : COPY.footer.secretMessageFr}
          </p>
        )}

        <div className="mt-4">
          <Wordmark size="md" />
        </div>

        <p className="mt-8 font-ar-display text-2xl sm:text-3xl text-white">
          {COPY.footer.farewellAr}
        </p>
        <p className="mt-1 font-lat-label text-xs text-white/80">
          {COPY.footer.farewellFr}
        </p>

        {/* Signature Moment #13: Postcard toggle + canvas souvenir composer (zero cards) */}
        <div className="mt-10 w-full flex flex-col items-center">
          <button
            type="button"
            data-testid="postcard-toggle-btn"
            onClick={() => setPostcardOpen((prev) => !prev)}
            className="btn-sweep btn-sweep-light inline-flex items-center justify-center px-6 py-3 border border-white/35 text-sm text-white hover:border-white transition-colors cursor-pointer"
          >
            {lang === 'ar' ? COPY.postcard.ctaAr : COPY.postcard.ctaFr}
          </button>

          {postcardOpen && (
            <div
              data-testid="postcard-composer"
              className="mt-8 w-full max-w-xl border-t border-white/18 pt-8 space-y-6"
            >
              <p className="text-xs text-white/70">
                {lang === 'ar' ? COPY.postcard.chooseAr : COPY.postcard.chooseFr}
              </p>

              {/* Thumbnails strip (plain clean rectangles) */}
              <div className="flex items-center justify-center gap-3 overflow-x-auto no-scrollbar py-1">
                {POSTCARD_CHOICES.map((choice, idx) => (
                  <button
                    key={choice.src}
                    type="button"
                    data-testid={`postcard-photo-${idx}`}
                    aria-label={lang === 'ar' ? choice.altAr : choice.altFr}
                    aria-pressed={selectedPhotoIdx === idx}
                    onClick={() => setSelectedPhotoIdx(idx)}
                    className={`shrink-0 w-16 h-20 overflow-hidden cursor-pointer border transition-opacity ${
                      selectedPhotoIdx === idx
                        ? 'border-white opacity-100'
                        : 'border-white/25 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <img
                      src={choice.src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Composed canvas preview */}
              <div className="mx-auto w-[240px] sm:w-[270px] aspect-[3/4] border border-white/20 bg-[#3A111B]">
                <canvas
                  ref={canvasRef}
                  data-testid="postcard-canvas"
                  className="w-full h-full block"
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  data-testid="postcard-download-btn"
                  disabled={renderingCard}
                  onClick={handleDownloadPostcard}
                  className="btn-sweep btn-sweep-dark inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#541B28] hover:text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>{lang === 'ar' ? COPY.postcard.downloadAr : COPY.postcard.downloadFr}</span>
                </button>

                <button
                  type="button"
                  data-testid="postcard-share-btn"
                  disabled={renderingCard}
                  onClick={handleSharePostcard}
                  className="btn-sweep btn-sweep-light inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/45 text-white hover:border-white text-sm transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" aria-hidden="true" />
                  <span>{lang === 'ar' ? COPY.postcard.shareAr : COPY.postcard.shareFr}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 pt-8 border-t border-white/18 w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/65">
          <span dir="ltr">{BRAND_DATA.address}</span>
          <div className="flex items-center gap-6">
            <a
              href={BRAND_DATA.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick('instagram', 'footer')}
              className="flex items-center hover:text-white"
              dir="ltr"
            >
              {BRAND_DATA.instagramHandle}
            </a>
            <bdi dir="ltr">{COPY.footer.copyright}</bdi>
          </div>
        </div>
      </div>
    </footer>
  );
};
