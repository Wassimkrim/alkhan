import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  COPY,
  GAME_PHOTOS,
  GAME_REWARD,
  type GameTilePhoto,
  type Lang,
} from '../content';
import {
  type BestGameScore,
  fisherYatesShuffle,
  formatGameSeconds,
  isBetterGameScore,
  trackClick,
} from '../utils/khanLogic';
import { renderElKhanPostcard, shareOrDownloadCanvas } from '../utils/postcardCanvas';
import { CarpetDivider, RosetteMark, SectionTitle } from './Ornaments';

interface DeckTile {
  uid: string;
  pairId: string;
  photo: GameTilePhoto;
}

const BEST_SCORE_STORAGE_KEY = 'elkhan_game_best';

function buildDeck(): DeckTile[] {
  const doubled: DeckTile[] = [];
  GAME_PHOTOS.forEach((photo) => {
    doubled.push({ uid: `${photo.pairId}-1`, pairId: photo.pairId, photo });
    doubled.push({ uid: `${photo.pairId}-2`, pairId: photo.pairId, photo });
  });
  return fisherYatesShuffle(doubled);
}

function readBestScore(): BestGameScore | null {
  try {
    const raw = window.localStorage.getItem(BEST_SCORE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BestGameScore>;
    if (typeof parsed.moves === 'number' && typeof parsed.seconds === 'number') {
      return { moves: parsed.moves, seconds: parsed.seconds };
    }
    return null;
  } catch {
    return null;
  }
}

interface GameSectionProps {
  lang: Lang;
}

export const GameSection: React.FC<GameSectionProps> = ({ lang }) => {
  const [deck, setDeck] = useState<DeckTile[]>(() => buildDeck());
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [recentMatchPair, setRecentMatchPair] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [bestScore, setBestScore] = useState<BestGameScore | null>(() => readBestScore());
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const [sharing, setSharing] = useState(false);

  const mismatchTimerRef = useRef<number | null>(null);
  const bloomTimerRef = useRef<number | null>(null);
  const shareCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!started || won) return;
    const id = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [started, won]);

  useEffect(() => {
    return () => {
      if (mismatchTimerRef.current !== null) window.clearTimeout(mismatchTimerRef.current);
      if (bloomTimerRef.current !== null) window.clearTimeout(bloomTimerRef.current);
    };
  }, []);

  const resetGame = useCallback(() => {
    if (mismatchTimerRef.current !== null) window.clearTimeout(mismatchTimerRef.current);
    if (bloomTimerRef.current !== null) window.clearTimeout(bloomTimerRef.current);
    setDeck(buildDeck());
    setFlippedIndices([]);
    setMatchedPairIds([]);
    setRecentMatchPair(null);
    setLocked(false);
    setMoves(0);
    setSeconds(0);
    setStarted(false);
    setWon(false);
    setLiveAnnouncement('');
  }, []);

  const handleTileSelect = (index: number) => {
    if (locked || won) return;
    const tile = deck[index];
    if (!tile) return;
    if (matchedPairIds.includes(tile.pairId) || flippedIndices.includes(index)) return;

    if (!started) setStarted(true);

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length < 2) return;

    const nextMoves = moves + 1;
    setMoves(nextMoves);
    const firstTile = deck[nextFlipped[0]];
    const secondTile = tile;

    if (firstTile.pairId === secondTile.pairId) {
      const nextMatched = [...matchedPairIds, secondTile.pairId];
      setMatchedPairIds(nextMatched);
      setFlippedIndices([]);
      setRecentMatchPair(secondTile.pairId);
      if (bloomTimerRef.current !== null) window.clearTimeout(bloomTimerRef.current);
      bloomTimerRef.current = window.setTimeout(() => setRecentMatchPair(null), 950);

      if (nextMatched.length === GAME_PHOTOS.length) {
        setWon(true);
        trackClick('game_win', `${nextMoves}m-${seconds}s`);
        setLiveAnnouncement(lang === 'ar' ? COPY.game.winLiveAr : COPY.game.winLiveFr);
        const candidate: BestGameScore = { moves: nextMoves, seconds };
        if (isBetterGameScore(candidate, bestScore)) {
          setBestScore(candidate);
          try {
            window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, JSON.stringify(candidate));
          } catch {
            // Ignore storage errors
          }
        }
      } else {
        setLiveAnnouncement(lang === 'ar' ? COPY.game.matchLiveAr : COPY.game.matchLiveFr);
      }
    } else {
      setLocked(true);
      setLiveAnnouncement(lang === 'ar' ? COPY.game.mismatchLiveAr : COPY.game.mismatchLiveFr);
      mismatchTimerRef.current = window.setTimeout(() => {
        setFlippedIndices([]);
        setLocked(false);
      }, 700);
    }
  };

  const handleShareScore = async () => {
    const canvas = shareCanvasRef.current;
    if (!canvas) return;
    setSharing(true);
    try {
      trackClick('game_share', `${moves}m-${seconds}s`);
      const formattedTime = formatGameSeconds(seconds);
      const scoreLine =
        lang === 'ar'
          ? `${COPY.game.movesAr}: ${moves}  ·  ${COPY.game.timeAr}: ${formattedTime}`
          : `${COPY.game.movesFr} : ${moves}  ·  ${COPY.game.timeFr} : ${formattedTime}`;
      const winningPhoto = GAME_PHOTOS[GAME_PHOTOS.length - 1]?.src ?? GAME_PHOTOS[0].src;

      await renderElKhanPostcard(canvas, {
        photoSrc: winningPhoto,
        titleText: COPY.game.shareSignature,
        subtitleText: 'COFFEE & BRUNCH · ALGER',
        scoreLine,
      });

      await shareOrDownloadCanvas(
        canvas,
        'elkhan-game-score.png',
        'الخان | ElKhan',
        `${COPY.game.shareSignature} — ${scoreLine}`
      );
    } finally {
      setSharing(false);
    }
  };

  const formattedTime = formatGameSeconds(seconds);
  const formattedBest = bestScore
    ? lang === 'ar'
      ? `${bestScore.moves} حركات · ${formatGameSeconds(bestScore.seconds)}`
      : `${bestScore.moves} coups · ${formatGameSeconds(bestScore.seconds)}`
    : null;

  return (
    <section
      id="game"
      className="scroll-mt-16 relative py-24 lg:py-40 px-5 sm:px-8 bg-[#3A111B] text-white border-t border-white/18 overflow-hidden"
    >
      {/* Faint rotating logo rosette watermark directly on --burgundy-deep */}
      <div
        className="pointer-events-none absolute -start-28 lg:start-[-5%] top-1/2 -translate-y-1/2 opacity-[0.07]"
        aria-hidden="true"
      >
        <RosetteMark className="w-[460px] h-[460px] lg:w-[540px] lg:h-[540px] animate-rosette-slow" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <SectionTitle titleAr={COPY.game.titleAr} titleFrCaps={COPY.game.titleFrCaps} />
            <p className="mt-4 text-base sm:text-lg text-white/80">
              {lang === 'ar' ? COPY.game.subAr : COPY.game.subFr}
            </p>
          </div>

          {/* Plain typographic counters: moves, time, optional best score */}
          <div
            className="flex flex-wrap items-baseline gap-x-8 gap-y-2 text-sm sm:text-base text-white/85"
            data-testid="game-counters"
          >
            <div>
              <span className="text-white/60 me-2">
                {lang === 'ar' ? COPY.game.movesAr : COPY.game.movesFr}
              </span>
              <span className="font-lat-display text-white tabular-nums" data-testid="game-moves">
                {moves}
              </span>
            </div>

            <div>
              <span className="text-white/60 me-2">
                {lang === 'ar' ? COPY.game.timeAr : COPY.game.timeFr}
              </span>
              <span
                className="font-lat-display text-white tabular-nums"
                dir="ltr"
                data-testid="game-time"
              >
                {formattedTime}
              </span>
            </div>

            {formattedBest && (
              <div>
                <span className="text-white/60 me-2">
                  {lang === 'ar' ? COPY.game.bestAr : COPY.game.bestFr}
                </span>
                <span className="text-white/95 tabular-nums" data-testid="game-best">
                  {formattedBest}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Accessible match status announcement */}
        <p className="sr-only" aria-live="polite" data-testid="game-live-status">
          {liveAnnouncement}
        </p>

        {/* Board wrapper with zero layout shift between gameplay and win state */}
        <div className="relative mt-10 sm:mt-14 max-w-[360px] sm:max-w-[440px] lg:max-w-[540px] mx-auto">
          <div
            data-testid="game-board"
            className={`grid grid-cols-3 lg:grid-cols-4 gap-[2px] border border-white/18 bg-white/18 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              won ? 'opacity-15 pointer-events-none' : 'opacity-100'
            }`}
          >
            {deck.map((tile, idx) => {
              const isMatched = matchedPairIds.includes(tile.pairId);
              const isFlipped = isMatched || flippedIndices.includes(idx);
              const isFreshMatch = recentMatchPair === tile.pairId;

              const stateLabel = isMatched
                ? lang === 'ar'
                  ? COPY.game.cardMatchedAr
                  : COPY.game.cardMatchedFr
                : isFlipped
                ? `${lang === 'ar' ? COPY.game.cardOpenAr : COPY.game.cardOpenFr} ${idx + 1}`
                : `${lang === 'ar' ? COPY.game.cardHiddenAr : COPY.game.cardHiddenFr} ${idx + 1}`;

              return (
                <button
                  key={tile.uid}
                  type="button"
                  role="button"
                  data-testid={`game-tile-${idx}`}
                  data-pair={tile.pairId}
                  data-flipped={isFlipped ? 'true' : 'false'}
                  data-matched={isMatched ? 'true' : 'false'}
                  aria-pressed={isFlipped}
                  aria-label={stateLabel}
                  disabled={won || isMatched || locked || flippedIndices.includes(idx)}
                  onClick={() => handleTileSelect(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTileSelect(idx);
                    }
                  }}
                  className="game-tile-perspective relative aspect-square w-full min-h-[72px] min-w-[72px] rounded-none p-0 bg-[#3A111B] cursor-pointer focus-visible:z-20 focus-visible:outline-2 focus-visible:outline-white disabled:cursor-default"
                >
                  <span className={`game-tile-inner block ${isFlipped ? 'is-flipped' : ''}`}>
                    {/* Tile Back: --burgundy-soft with white hairline border & logo rosette */}
                    <span className="game-tile-face game-tile-back flex items-center justify-center bg-[#6A2535] border border-white/20">
                      <RosetteMark className="w-9 h-9 sm:w-11 sm:h-11 opacity-75" />
                    </span>

                    {/* Tile Front: Supplied food/matcha crop with NO captions or prices */}
                    <span
                      className={`game-tile-face game-tile-front overflow-hidden bg-[#3A111B] ${
                        isMatched ? 'ring-1 ring-inset ring-white' : ''
                      }`}
                    >
                      <img
                        src={tile.photo.src}
                        srcSet={tile.photo.srcSet}
                        sizes="(max-width: 1023px) 120px, 140px"
                        alt={lang === 'ar' ? tile.photo.altAr : tile.photo.altFr}
                        loading="lazy"
                        draggable={false}
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover ${tile.photo.imgClassName ?? ''}`}
                      />
                      {isMatched && (
                        <span
                          className="absolute top-1.5 end-1.5 w-6 h-6 flex items-center justify-center bg-[#3A111B]/80 pointer-events-none"
                          aria-hidden="true"
                        >
                          <RosetteMark className="w-4 h-4" blooming={isFreshMatch} />
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* WIN STATE: Drawn directly over faded board with zero card/box */}
          {won && (
            <div
              data-testid="game-win-overlay"
              className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4"
            >
              <p className="font-ar-display text-4xl sm:text-5xl text-white">
                {COPY.game.winAr}
              </p>
              <p dir="ltr" className="mt-1 font-lat-display text-sm sm:text-base text-white/90">
                {COPY.game.winFrCaps}
              </p>

              <p className="mt-5 text-sm sm:text-base text-white/85 tabular-nums">
                {lang === 'ar'
                  ? `${COPY.game.movesAr}: ${moves} · ${COPY.game.timeAr}: ${formattedTime}`
                  : `${COPY.game.movesFr} : ${moves} · ${COPY.game.timeFr} : ${formattedTime}`}
              </p>

              {GAME_REWARD && (
                <p className="mt-3 text-sm text-white/90">
                  {lang === 'ar' ? GAME_REWARD.ar : GAME_REWARD.fr}
                </p>
              )}

              <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={resetGame}
                  data-testid="game-replay-btn"
                  className="btn-sweep btn-sweep-dark inline-flex items-center justify-center px-6 py-3 border border-white text-white text-sm font-medium cursor-pointer"
                >
                  {lang === 'ar' ? COPY.game.replayAr : COPY.game.replayFr}
                </button>

                <button
                  type="button"
                  disabled={sharing}
                  onClick={handleShareScore}
                  data-testid="game-share-btn"
                  className="btn-sweep btn-sweep-dark inline-flex items-center justify-center px-6 py-3 bg-white text-[#541B28] hover:text-white text-sm font-semibold cursor-pointer"
                >
                  {lang === 'ar' ? COPY.game.shareAr : COPY.game.shareFr}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Offscreen canvas used for «شارك نتيجتك · Partager» */}
        <canvas ref={shareCanvasRef} className="hidden" aria-hidden="true" />
      </div>

      <div className="mt-20 lg:mt-28">
        <CarpetDivider />
      </div>
    </section>
  );
};
