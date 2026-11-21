import React, { useCallback, useEffect, useRef, useState } from 'react';
import { COPY, type Lang } from './content';
import { Header, MobileBottomBar } from './components/HeaderAndMobileBar';
import { CupIndicator, IntroLoader, TapPetalsLayer, type TapPetalItem } from './components/Ornaments';
import { HeroSection, StorySection } from './components/HeroAndStory';
import { MomentsSection, TableSection } from './components/TableAndMoments';
import { GameSection } from './components/GameSection';
import { FooterSection, ReviewsSection, VisitSection } from './components/ReviewsVisitFooter';

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return window.localStorage.getItem('elkhan_lang') === 'fr' ? 'fr' : 'ar';
    } catch {
      return 'ar';
    }
  });

  const [manualEvening, setManualEvening] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem('elkhan_evening_mode') === '1';
    } catch {
      return false;
    }
  });

  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return false;
      return window.sessionStorage.getItem('elkhan_intro_seen') !== '1';
    } catch {
      return false;
    }
  });

  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visitInView, setVisitInView] = useState(false);
  const [footerInView, setFooterInView] = useState(false);
  const [petals, setPetals] = useState<TapPetalItem[]>([]);
  const nextPetalIdRef = useRef(1);
  const visitSectionRef = useRef<HTMLElement | null>(null);
  const footerSectionRef = useRef<HTMLElement | null>(null);

  const dismissIntro = useCallback(() => {
    setShowIntro(false);
    try {
      window.sessionStorage.setItem('elkhan_intro_seen', '1');
    } catch {
      // Ignore storage failures
    }
  }, []);

  const toggleEvening = useCallback(() => {
    setManualEvening((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem('elkhan_evening_mode', next ? '1' : '0');
      } catch {
        // Ignore storage failures
      }
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      window.localStorage.setItem('elkhan_lang', lang);
    } catch {
      // Ignore storage failures
    }
  }, [lang]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(maxScroll > 0 ? Math.max(0, Math.min(1, y / maxScroll)) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Hide mobile sticky bottom bar while Visit section or Footer is in view
  useEffect(() => {
    const visitEl = visitSectionRef.current;
    const footerEl = footerSectionRef.current;
    if (!visitEl && !footerEl) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === visitEl) {
            setVisitInView(entry.isIntersecting);
          } else if (entry.target === footerEl) {
            setFooterInView(entry.isIntersecting);
          }
        }
      },
      { threshold: 0.1 }
    );
    if (visitEl) obs.observe(visitEl);
    if (footerEl) obs.observe(footerEl);
    return () => obs.disconnect();
  }, []);

  // Signature Moment #12: Tap petals on empty space (max 5 alive)
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('a, button, input, select, textarea, iframe, [role="button"]')) return;

    const id = nextPetalIdRef.current++;
    const newPetal: TapPetalItem = { id, x: e.clientX, y: e.clientY };
    setPetals((prev) => [...prev.slice(-4), newPetal]);
    window.setTimeout(() => {
      setPetals((prev) => prev.filter((p) => p.id !== id));
    }, 1150);
  };

  return (
    <div
      onClick={handleContainerClick}
      className="min-h-screen bg-[#541B28] text-white selection:bg-white/25 selection:text-white"
    >
      {/* Luminance alpha key filters preserving exact LOGO_eabd8839.jpg pixels over any surface */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="elkhan-logo-white" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.45 1.45 0.15 0 -0.35"
            />
          </filter>
          <filter id="elkhan-logo-burgundy" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.329  0 0 0 0 0.106  0 0 0 0 0.157  0.45 1.45 0.15 0 -0.35"
            />
          </filter>
        </defs>
      </svg>

      {showIntro && (
        <IntroLoader
          lang={lang}
          skipLabel={lang === 'ar' ? COPY.actions.skip.ar : COPY.actions.skip.fr}
          onDone={dismissIntro}
        />
      )}

      <TapPetalsLayer petals={petals} />

      <Header
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'ar' ? 'fr' : 'ar'))}
        scrolled={scrolled}
        scrollProgress={scrollProgress}
        isEvening={manualEvening}
      />

      <main>
        <HeroSection
          lang={lang}
          manualEvening={manualEvening}
          onToggleEvening={toggleEvening}
        />
        <StorySection lang={lang} />
        <TableSection lang={lang} />
        <MomentsSection lang={lang} />
        <GameSection lang={lang} />
        <ReviewsSection lang={lang} />
        <VisitSection lang={lang} sectionRef={visitSectionRef} />
      </main>

      <FooterSection lang={lang} footerRef={footerSectionRef} />

      <CupIndicator progress={scrollProgress} />

      <MobileBottomBar lang={lang} hidden={visitInView || footerInView} />
    </div>
  );
}
