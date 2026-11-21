import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { BRAND_DATA, COPY, type Lang } from '../content';
import { trackClick } from '../utils/khanLogic';
import { RosetteMark, Wordmark } from './Ornaments';

interface HeaderProps {
  lang: Lang;
  onToggleLang: () => void;
  scrolled: boolean;
  scrollProgress: number;
  isEvening: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  scrolled,
  scrollProgress,
  isEvening,
}) => {
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [origin, setOrigin] = useState<{ x: string; y: string }>({
    x: lang === 'ar' ? '36px' : 'calc(100% - 36px)',
    y: '32px',
  });

  const openMobileMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOrigin({
      x: `${Math.round(rect.left + rect.width / 2)}px`,
      y: `${Math.round(rect.top + rect.height / 2)}px`,
    });
    setMenuMounted(true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setMenuExpanded(true);
      });
    });
  };

  const closeMobileMenu = () => {
    setMenuExpanded(false);
    window.setTimeout(() => {
      setMenuMounted(false);
    }, 520);
  };

  useEffect(() => {
    if (!menuMounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuMounted]);

  const scrollToSection = (id: string) => {
    closeMobileMenu();
    window.setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const solidHeaderBg = isEvening
    ? 'bg-[#3A111B] border-b border-white/18'
    : 'bg-[#541B28] border-b border-white/18';

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-colors duration-500 ${
          scrolled
            ? solidHeaderBg
            : 'bg-gradient-to-b from-[#3A111B]/85 via-[#3A111B]/45 to-transparent'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand: Rosette (8-petal scroll indicator) + Wordmark */}
          <a
            href="#hero"
            data-testid="header-rosette-progress"
            data-scroll-progress={Math.round(scrollProgress * 100)}
            className="flex items-center gap-2.5 text-white shrink-0"
            aria-label={lang === 'ar' ? 'الخان — الرئيسية' : 'ElKhan — Accueil'}
          >
            <RosetteMark className="w-9 h-9 text-white" progress={scrollProgress} />
            <Wordmark size="sm" />
          </a>

          {/* Desktop Navigation Links */}
          <nav
            aria-label={lang === 'ar' ? 'التنقل الرئيسي' : 'Navigation principale'}
            className="hidden lg:flex items-center gap-7 text-sm text-white/85"
          >
            {COPY.nav.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.id);
                }}
                className="flex items-center hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                {lang === 'ar' ? item.ar : item.fr}
              </a>
            ))}
          </nav>

          {/* End Zone: Desktop Quick Actions + AR|FR Toggle + Mobile Menu Trigger */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            <div className="hidden lg:flex items-center gap-4 text-xs text-white/85 border-e border-white/18 pe-5">
              <a
                href={BRAND_DATA.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('directions', 'header')}
                className="flex items-center hover:text-white whitespace-nowrap"
              >
                {lang === 'ar' ? COPY.actions.directions.ar : COPY.actions.directions.fr}
              </a>
              <a
                href={BRAND_DATA.phoneHref}
                onClick={() => trackClick('call', 'header')}
                className="flex items-center hover:text-white whitespace-nowrap"
              >
                {lang === 'ar' ? COPY.actions.call.ar : COPY.actions.call.fr}
              </a>
              <a
                href={BRAND_DATA.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('instagram', 'header')}
                className="flex items-center hover:text-white whitespace-nowrap"
              >
                {lang === 'ar' ? COPY.actions.instagram.ar : COPY.actions.instagram.fr}
              </a>
            </div>

            {/* AR | FR Toggle */}
            <button
              type="button"
              onClick={onToggleLang}
              data-testid="lang-toggle"
              aria-label={lang === 'ar' ? 'Passer en français' : 'التبديل إلى العربية'}
              className="flex items-center justify-center gap-1.5 px-2 h-11 text-xs font-lat-display tracking-wider text-white cursor-pointer whitespace-nowrap"
            >
              <span className={lang === 'ar' ? 'underline underline-offset-4' : 'opacity-60'}>
                AR
              </span>
              <span className="opacity-30" aria-hidden="true">|</span>
              <span className={lang === 'fr' ? 'underline underline-offset-4' : 'opacity-60'}>
                FR
              </span>
            </button>

            {/* Minimal Mobile Menu Button */}
            <button
              type="button"
              onClick={openMobileMenu}
              data-testid="mobile-menu-trigger"
              aria-expanded={menuExpanded}
              aria-controls="mobile-nav-overlay"
              aria-label={lang === 'ar' ? COPY.actions.menuOpen.ar : COPY.actions.menuOpen.fr}
              className="lg:hidden flex items-center justify-center w-11 h-11 text-white cursor-pointer"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Signature Moment #10: Full-Screen Burgundy Mobile Menu expanding via circular clip-path */}
      {menuMounted && (
        <div
          id="mobile-nav-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={lang === 'ar' ? 'قائمة الموقع' : 'Menu du site'}
          data-testid="mobile-menu-dialog"
          className="fixed inset-0 z-50 bg-[#541B28] text-white flex flex-col justify-between p-6 overflow-y-auto transition-[clip-path,opacity] duration-600 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            clipPath: menuExpanded
              ? `circle(150vmax at ${origin.x} ${origin.y})`
              : `circle(0px at ${origin.x} ${origin.y})`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <RosetteMark className="w-9 h-9 text-white" />
              <Wordmark size="sm" />
            </div>

            <button
              type="button"
              onClick={closeMobileMenu}
              data-testid="mobile-menu-close"
              aria-label={lang === 'ar' ? COPY.actions.menuClose.ar : COPY.actions.menuClose.fr}
              className="flex items-center justify-center w-11 h-11 text-white cursor-pointer"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          <nav className="my-auto py-8 flex flex-col gap-5">
            {COPY.nav.map((item, idx) => {
              const arWords = item.ar.split(' ');
              const frWords = item.fr.split(' ');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="text-start py-1 border-b border-white/18 pb-4 cursor-pointer flex flex-col items-start"
                >
                  <span className="block font-ar-display text-3xl text-white">
                    {arWords.map((word, wi) => (
                      <span
                        key={wi}
                        className={`inline-block me-2 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          menuExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                        }`}
                        style={{ transitionDelay: `${140 + idx * 70 + wi * 55}ms` }}
                      >
                        {word}
                      </span>
                    ))}
                  </span>
                  <span
                    dir="ltr"
                    className="inline-flex flex-wrap gap-x-1.5 font-lat-label text-xs text-white/75 mt-1"
                  >
                    {frWords.map((word, wi) => (
                      <span
                        key={wi}
                        className={`inline-block transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          menuExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                        }`}
                        style={{ transitionDelay: `${180 + idx * 70 + wi * 45}ms` }}
                      >
                        {word}
                      </span>
                    ))}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/18 text-sm">
            <a
              href={BRAND_DATA.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick('directions', 'mobile_menu')}
              className="underline underline-offset-4"
            >
              {lang === 'ar' ? COPY.actions.directions.ar : COPY.actions.directions.fr}
            </a>
            <a
              href={BRAND_DATA.phoneHref}
              onClick={() => trackClick('call', 'mobile_menu')}
              className="underline underline-offset-4"
            >
              <bdi dir="ltr">{BRAND_DATA.phoneDisplay}</bdi>
            </a>
          </div>
        </div>
      )}
    </>
  );
};

interface MobileBottomBarProps {
  lang: Lang;
  hidden: boolean;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ lang, hidden }) => {
  return (
    <nav
      aria-label={lang === 'ar' ? 'إجراءات سريعة' : 'Actions rapides'}
      data-testid="mobile-bottom-bar"
      className={`lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#3A111B]/95 backdrop-blur-sm border-t border-white/18 transition-transform duration-500 ${
        hidden ? 'translate-y-full pointer-events-none' : 'translate-y-0'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-3 h-12 divide-x divide-white/18 rtl:divide-x-reverse text-xs font-medium text-white">
        <a
          href={BRAND_DATA.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick('directions', 'mobile_bar')}
          className="flex items-center justify-center hover:bg-[#6A2535] transition-colors whitespace-nowrap"
        >
          {lang === 'ar' ? COPY.actions.directions.ar : COPY.actions.directions.fr}
        </a>

        <a
          href={BRAND_DATA.phoneHref}
          onClick={() => trackClick('call', 'mobile_bar')}
          className="flex items-center justify-center hover:bg-[#6A2535] transition-colors whitespace-nowrap"
        >
          {lang === 'ar' ? COPY.actions.call.ar : COPY.actions.call.fr}
        </a>

        <a
          href={BRAND_DATA.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick('instagram', 'mobile_bar')}
          className="flex items-center justify-center hover:bg-[#6A2535] transition-colors whitespace-nowrap"
        >
          {lang === 'ar' ? COPY.actions.instagram.ar : COPY.actions.instagram.fr}
        </a>
      </div>
    </nav>
  );
};
