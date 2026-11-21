import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { COPY, OPTIONAL_MENU, PHOTOS, VIDEOS, type Lang, type VideoReelItem } from '../content';
import { getVideoObjectFit } from '../utils/khanLogic';
import { CarpetDivider, SectionTitle } from './Ornaments';

/* ============================================================================
   3. «على الطـاولـة» / À TABLE (food rail, no menu)
   ============================================================================ */
interface TableSectionProps {
  lang: Lang;
}

export const TableSection: React.FC<TableSectionProps> = ({ lang }) => {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(0);
  const scrollStartLeft = useRef(0);

  const total = PHOTOS.foodRail.length;

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const onScroll = () => {
      const children = Array.from(rail.children) as HTMLElement[];
      if (children.length === 0) return;
      const railRect = rail.getBoundingClientRect();
      const railCenter = railRect.left + railRect.width / 2;

      let closestIdx = 0;
      let minDistance = Infinity;
      children.forEach((child, idx) => {
        const rect = child.getBoundingClientRect();
        const childCenter = rect.left + rect.width / 2;
        const dist = Math.abs(childCenter - railCenter);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = idx;
        }
      });
      setActiveIndex(closestIdx);
    };

    rail.addEventListener('scroll', onScroll, { passive: true });
    return () => rail.removeEventListener('scroll', onScroll);
  }, []);

  const stepRail = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const stepSize = rail.clientWidth * 0.72;
    const visualDir = lang === 'ar' ? -direction : direction;
    rail.scrollBy({ left: visualDir * stepSize, behavior: 'smooth' });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const rail = railRef.current;
    if (!rail) return;
    setDragging(true);
    dragStartX.current = e.pageX;
    scrollStartLeft.current = rail.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !railRef.current) return;
    e.preventDefault();
    const walk = (e.pageX - dragStartX.current) * 1.15;
    railRef.current.scrollLeft = scrollStartLeft.current - walk;
  };

  const stopDrag = () => setDragging(false);

  const progressPct = ((activeIndex + 1) / total) * 100;

  return (
    <section
      id="table"
      className="scroll-mt-16 py-24 lg:py-40 bg-[#541B28] text-white"
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <SectionTitle titleAr={COPY.table.titleAr} titleFrCaps={COPY.table.titleFrCaps} />
            <p className="mt-4 text-base sm:text-lg text-white/80">
              {lang === 'ar' ? COPY.table.subAr : COPY.table.subFr}
            </p>
          </div>

          {/* Desktop Outlined Circular Arrow Buttons (mirrored in RTL) */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => stepRail(-1)}
              aria-label={lang === 'ar' ? COPY.table.prevAr : COPY.table.prevFr}
              className="w-11 h-11 rounded-full border border-white/40 hover:border-white hover:bg-[#6A2535] flex items-center justify-center transition-colors cursor-pointer"
            >
              {lang === 'ar' ? (
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              ) : (
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => stepRail(1)}
              aria-label={lang === 'ar' ? COPY.table.nextAr : COPY.table.nextFr}
              className="w-11 h-11 rounded-full border border-white/40 hover:border-white hover:bg-[#6A2535] flex items-center justify-center transition-colors cursor-pointer"
            >
              {lang === 'ar' ? (
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              ) : (
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll-Snap Rail of 5 Plain 4:5 Rectangles — NO text over photos */}
      <div
        ref={railRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        className={`mt-10 sm:mt-12 flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar px-5 sm:px-8 lg:max-w-[1200px] lg:mx-auto select-none ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {PHOTOS.foodRail.map((photo, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div
              key={photo.src}
              className={`shrink-0 w-[82vw] sm:w-[46vw] lg:w-[calc((100%-48px)/3)] snap-center lg:snap-start transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isActive ? 'scale-100 opacity-100' : 'scale-[0.94] opacity-70 lg:scale-100 lg:opacity-100'
              }`}
            >
              <div className="aspect-[4/5] overflow-hidden bg-[#3A111B]">
                <img
                  src={photo.src}
                  srcSet={photo.srcSet}
                  sizes="(max-width: 639px) 82vw, (max-width: 1023px) 46vw, 380px"
                  width={photo.width}
                  height={photo.height}
                  alt={lang === 'ar' ? photo.altAr : photo.altFr}
                  loading="lazy"
                  draggable={false}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.04] active:scale-[1.03]"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Large Thin Index Numeral (vertical slide swap) + Progress Line */}
      <div className="mt-6 px-5 sm:px-8 max-w-[1200px] mx-auto flex items-center gap-4 lg:hidden">
        <div className="overflow-hidden h-9 flex items-center">
          <span
            key={activeIndex}
            data-testid="table-mobile-index"
            className="font-lat-label text-2xl font-light text-white tabular-nums animate-numeral-swap inline-block"
          >
            {String(activeIndex + 1).padStart(2, '0')}
          </span>
        </div>

        <div className="flex-1 h-px bg-white/18 overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <span className="font-lat-label text-xs text-white/60 tabular-nums">
          {String(total).padStart(2, '0')}
        </span>
      </div>

      {/* Optional Menu Slot — renders nothing while OPTIONAL_MENU is empty */}
      {OPTIONAL_MENU.length > 0 && (
        <div className="mt-16 max-w-[1200px] mx-auto px-5 sm:px-8 border-t border-white/18 pt-10 space-y-4">
          {OPTIONAL_MENU.map((item, idx) => (
            <div key={idx} className="flex items-baseline gap-3 text-base text-white">
              <span className="font-medium">{lang === 'ar' ? item.nameAr : item.nameFr}</span>
              <span className="flex-1 border-b border-dotted border-white/25" aria-hidden="true" />
              {item.price && <span className="tabular-nums text-white/90">{item.price}</span>}
            </div>
          ))}
        </div>
      )}

      <div className="mt-20 lg:mt-28">
        <CarpetDivider />
      </div>
    </section>
  );
};

/* ============================================================================
   4. «لحظـات» / MOMENTS (plain, reliable, unmasked vertical videos)
   ============================================================================ */
interface ReelCardProps {
  reel: VideoReelItem;
  lang: Lang;
  isMuted: boolean;
  onToggleMute: () => void;
  offsetDownDesktop?: boolean;
}

const ReelPlayer: React.FC<ReelCardProps> = ({
  reel,
  lang,
  isMuted,
  onToggleMute,
  offsetDownDesktop = false,
}) => {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [naturalAspect, setNaturalAspect] = useState<string>(
    `${reel.width} / ${reel.height}`
  );
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');

  const isLowDataOrReduced = (() => {
    if (typeof window === 'undefined') return false;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    return Boolean(reduced || nav.connection?.saveData);
  })();

  // Sync JS muted property reliably (handles React muted attribute bug)
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = isMuted;
  }, [isMuted]);

  // Play only when >=50% visible; pause cleanly when scrolled out of view
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const vid = videoRef.current;
        if (!entry || !vid) return;
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;

        if (visible) {
          if (isLowDataOrReduced) {
            setAutoplayBlocked(true);
            return;
          }
          vid.muted = isMuted;
          vid
            .play()
            .then(() => setAutoplayBlocked(false))
            .catch(() => setAutoplayBlocked(true));
        } else if (!vid.paused) {
          vid.pause();
        }
      },
      { threshold: [0, 0.5] }
    );

    obs.observe(frame);
    return () => obs.disconnect();
  }, [isMuted, isLowDataOrReduced]);

  const handleLoadedMetadata = () => {
    const vid = videoRef.current;
    const box = frameRef.current;
    if (!vid || !box) return;
    const vw = vid.videoWidth || reel.width;
    const vh = vid.videoHeight || reel.height;
    setNaturalAspect(`${vw} / ${vh}`);
    // Defer measurement after aspect update settles cleanly
    window.requestAnimationFrame(() => {
      if (!frameRef.current) return;
      setFitMode(
        getVideoObjectFit(
          vw,
          vh,
          frameRef.current.clientWidth,
          frameRef.current.clientHeight
        )
      );
    });
  };

  const togglePlayPause = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.muted = isMuted;
      vid
        .play()
        .then(() => setAutoplayBlocked(false))
        .catch(() => setAutoplayBlocked(true));
    } else {
      vid.pause();
    }
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRef.current as
      | (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
      | null;
    if (!vid) return;
    if (vid.requestFullscreen) {
      vid.requestFullscreen().catch(() => {});
    } else if (typeof vid.webkitEnterFullscreen === 'function') {
      vid.webkitEnterFullscreen();
    }
  };

  return (
    <div
      className={`relative w-full max-w-[420px] lg:max-w-[380px] mx-auto lg:mx-0 ${
        offsetDownDesktop ? 'lg:mt-20' : ''
      }`}
    >
      {/* Thin white hairline frame offset behind (not a card) */}
      <div
        className="absolute inset-0 translate-x-2.5 translate-y-2.5 border border-white/25 pointer-events-none"
        aria-hidden="true"
      />

      {/* Plain, unmasked vertical video frame */}
      <div
        ref={frameRef}
        data-testid={`reel-frame-${reel.id}`}
        onClick={togglePlayPause}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            togglePlayPause();
          }
        }}
        aria-label={
          isPlaying
            ? lang === 'ar'
              ? COPY.moments.pauseAr
              : COPY.moments.pauseFr
            : lang === 'ar'
            ? COPY.moments.playAr
            : COPY.moments.playFr
        }
        style={{ aspectRatio: naturalAspect }}
        className="relative z-10 w-full bg-[#3A111B] overflow-hidden cursor-pointer select-none"
      >
        <video
          ref={videoRef}
          src={reel.src}
          poster={reel.poster}
          muted={isMuted}
          loop
          autoPlay={!isLowDataOrReduced}
          playsInline
          preload="metadata"
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          }}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={() => {
            const vid = videoRef.current;
            if (vid && vid.duration > 0) {
              setProgress((vid.currentTime / vid.duration) * 100);
            }
          }}
          aria-label={lang === 'ar' ? reel.labelAr : reel.labelFr}
          className={`w-full h-full pointer-events-none ${
            fitMode === 'cover' ? 'object-cover' : 'object-contain'
          }`}
        />

        {/* Clear Play fallback button when paused or autoplay blocked (iOS Low Power / Data Saver) */}
        {(autoplayBlocked || !isPlaying) && (
          <button
            type="button"
            data-testid={`reel-play-btn-${reel.id}`}
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            aria-label={lang === 'ar' ? COPY.moments.playAr : COPY.moments.playFr}
            className="absolute inset-0 m-auto z-20 w-14 h-14 rounded-full bg-[#3A111B]/80 border border-white text-white flex items-center justify-center cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Play className="w-6 h-6 ms-0.5" aria-hidden="true" />
            )}
          </button>
        )}

        {/* Bottom-corner 44px sound + fullscreen buttons */}
        <div
          className="absolute bottom-3 end-3 z-20 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            data-testid={`reel-sound-btn-${reel.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            aria-label={
              isMuted
                ? lang === 'ar'
                  ? COPY.moments.unmuteAr
                  : COPY.moments.unmuteFr
                : lang === 'ar'
                ? COPY.moments.muteAr
                : COPY.moments.muteFr
            }
            className="w-11 h-11 rounded-full bg-[#3A111B]/85 border border-white/45 text-white flex items-center justify-center hover:bg-[#6A2535] transition-colors cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Volume2 className="w-4 h-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            data-testid={`reel-fullscreen-btn-${reel.id}`}
            onClick={handleFullscreen}
            aria-label={lang === 'ar' ? COPY.moments.fullscreenAr : COPY.moments.fullscreenFr}
            className="w-11 h-11 rounded-full bg-[#3A111B]/85 border border-white/45 text-white flex items-center justify-center hover:bg-[#6A2535] transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Thin progress line along bottom edge */}
        <div
          className="absolute bottom-0 inset-x-0 h-[2px] bg-white/20 z-20 pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="h-full bg-white transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

interface MomentsSectionProps {
  lang: Lang;
}

export const MomentsSection: React.FC<MomentsSectionProps> = ({ lang }) => {
  // Unmuting one reel automatically mutes the other
  const [unmutedReelId, setUnmutedReelId] = useState<'a' | 'b' | null>(null);

  const toggleSound = (id: 'a' | 'b') => {
    setUnmutedReelId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="moments"
      className="scroll-mt-16 py-24 lg:py-40 px-5 sm:px-8 bg-[#3A111B] text-white"
    >
      <div className="max-w-[1200px] mx-auto">
        <SectionTitle titleAr={COPY.moments.titleAr} titleFrCaps={COPY.moments.titleFrCaps} />

        {/* Mobile: stacked centered <=420px · Desktop: side-by-side ~380px each, 2nd offset down 80px */}
        <div className="mt-12 lg:mt-16 flex flex-col lg:flex-row lg:items-start lg:justify-center gap-12 lg:gap-16">
          {VIDEOS.map((reel, idx) => (
            <ReelPlayer
              key={reel.id}
              reel={reel}
              lang={lang}
              isMuted={unmutedReelId !== reel.id}
              onToggleMute={() => toggleSound(reel.id)}
              offsetDownDesktop={idx === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
