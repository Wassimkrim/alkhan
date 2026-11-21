export type DayKey = 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

export interface OpenStatus {
  isOpen: boolean;
  todayKey: DayKey;
  statusTextAr: string;
  statusTextFr: string;
}

const WEEKDAY_MAP: Record<string, DayKey> = {
  Sat: 'sat',
  Sun: 'sun',
  Mon: 'mon',
  Tue: 'tue',
  Wed: 'wed',
  Thu: 'thu',
  Fri: 'fri',
};

export function getAlgiersDateParts(date: Date = new Date()): {
  dayKey: DayKey;
  hour: number;
  minute: number;
} {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Algiers',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(date);
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Sat';
  const rawHour = Number(parts.find((p) => p.type === 'hour')?.value ?? '12');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');

  return {
    dayKey: WEEKDAY_MAP[weekday] ?? 'sat',
    hour: rawHour === 24 ? 0 : rawHour,
    minute,
  };
}

export function getAlgiersOpenStatus(date: Date = new Date()): OpenStatus {
  const { dayKey, hour, minute } = getAlgiersDateParts(date);
  const currentMinutes = hour * 60 + minute;

  const isFriday = dayKey === 'fri';
  const openHour = isFriday ? 15 : 10;
  const closeHour = isFriday ? 22 : 21;
  const openMinutes = openHour * 60;
  const closeMinutes = closeHour * 60;

  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  const openStr = `${String(openHour).padStart(2, '0')}:00`;
  const closeStr = `${String(closeHour).padStart(2, '0')}:00`;

  if (isOpen) {
    return {
      isOpen: true,
      todayKey: dayKey,
      statusTextAr: `مفتوح الآن · يُغلق عند ${closeStr}`,
      statusTextFr: `Ouvert · ferme à ${closeHour}h`,
    };
  }

  if (currentMinutes < openMinutes) {
    return {
      isOpen: false,
      todayKey: dayKey,
      statusTextAr: `مُغلق الآن · يفتح اليوم عند ${openStr}`,
      statusTextFr: `Fermé · ouvre à ${openHour}h`,
    };
  }

  const tomorrowIsFri = dayKey === 'thu';
  const nextOpenHour = tomorrowIsFri ? 15 : 10;
  const nextOpenStr = `${String(nextOpenHour).padStart(2, '0')}:00`;

  return {
    isOpen: false,
    todayKey: dayKey,
    statusTextAr: `مُغلق الآن · يفتح غداً عند ${nextOpenStr}`,
    statusTextFr: `Fermé · ouvre demain à ${nextOpenHour}h`,
  };
}

/**
 * Determine whether object-fit: cover or object-fit: contain should be used for a video
 * so it is only cropped if its aspect ratio closely matches the container.
 */
export function getVideoObjectFit(
  naturalWidth: number,
  naturalHeight: number,
  containerWidth: number,
  containerHeight: number
): 'cover' | 'contain' {
  if (naturalWidth <= 0 || naturalHeight <= 0 || containerWidth <= 0 || containerHeight <= 0) {
    return 'contain';
  }
  const naturalRatio = naturalWidth / naturalHeight;
  const boxRatio = containerWidth / containerHeight;
  return Math.abs(naturalRatio - boxRatio) <= 0.04 ? 'cover' : 'contain';
}

export type TimeOfDayPeriod = 'morning' | 'afternoon' | 'evening';

export interface TimeOfDayInfo {
  period: TimeOfDayPeriod;
  greetingAr: string;
  greetingFr: string;
}

export function getAlgiersTimeOfDay(date: Date = new Date()): TimeOfDayInfo {
  const { hour } = getAlgiersDateParts(date);
  if (hour >= 5 && hour < 12) {
    return {
      period: 'morning',
      greetingAr: 'صباح الخير',
      greetingFr: 'Bonjour',
    };
  }
  if (hour >= 12 && hour < 18) {
    return {
      period: 'afternoon',
      greetingAr: 'مساء النور',
      greetingFr: 'Bon après-midi',
    };
  }
  return {
    period: 'evening',
    greetingAr: 'مساء الخير',
    greetingFr: 'Bonsoir',
  };
}

export interface ClockDialGeometry {
  openHour: number;
  closeHour: number;
  startAngleDeg: number;
  endAngleDeg: number;
  handAngleDeg: number;
  arcPath: string;
  handX: number;
  handY: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: +(cx + r * Math.cos(rad)).toFixed(2),
    y: +(cy + r * Math.sin(rad)).toFixed(2),
  };
}

/**
 * Computes SVG geometry for a 24-hour circular dial where 00:00 sits at 12 o'clock (-90deg).
 */
export function get24hClockGeometry(
  dayKey: DayKey,
  hour: number,
  minute: number,
  cx = 100,
  cy = 100,
  radius = 82,
  handLength = 66
): ClockDialGeometry {
  const isFriday = dayKey === 'fri';
  const openHour = isFriday ? 15 : 10;
  const closeHour = isFriday ? 22 : 21;

  const startAngleDeg = (openHour / 24) * 360 - 90;
  const endAngleDeg = (closeHour / 24) * 360 - 90;
  const fractionalHour = hour + minute / 60;
  const handAngleDeg = (fractionalHour / 24) * 360 - 90;

  const startPt = polarToCartesian(cx, cy, radius, startAngleDeg);
  const endPt = polarToCartesian(cx, cy, radius, endAngleDeg);
  const largeArc = endAngleDeg - startAngleDeg > 180 ? 1 : 0;
  const arcPath = `M ${startPt.x} ${startPt.y} A ${radius} ${radius} 0 ${largeArc} 1 ${endPt.x} ${endPt.y}`;

  const handPt = polarToCartesian(cx, cy, handLength, handAngleDeg);

  return {
    openHour,
    closeHour,
    startAngleDeg,
    endAngleDeg,
    handAngleDeg,
    arcPath,
    handX: handPt.x,
    handY: handPt.y,
  };
}

export function getInviteShareMessage(lang: 'ar' | 'fr', mapsUrl: string): string {
  return lang === 'ar'
    ? `نلتقي في الخان؟ ☕ ${mapsUrl}`
    : `On se retrouve à ElKhan ? ☕ ${mapsUrl}`;
}

export function getWhatsAppInviteUrl(lang: 'ar' | 'fr', mapsUrl: string): string {
  const text = getInviteShareMessage(lang, mapsUrl);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export interface DayHoursInfo {
  dayKey: DayKey;
  isToday: boolean;
  openHour: number;
  closeHour: number;
  timeRange: string;
  liveStatus: OpenStatus | null;
}

export function getDayHoursInfo(dayKey: DayKey, date: Date = new Date()): DayHoursInfo {
  const status = getAlgiersOpenStatus(date);
  const isFriday = dayKey === 'fri';
  const openHour = isFriday ? 15 : 10;
  const closeHour = isFriday ? 22 : 21;
  const timeRange = `${String(openHour).padStart(2, '0')}:00 – ${String(closeHour).padStart(2, '0')}:00`;
  const isToday = status.todayKey === dayKey;

  return {
    dayKey,
    isToday,
    openHour,
    closeHour,
    timeRange,
    liveStatus: isToday ? status : null,
  };
}

export type TrackAction =
  | 'directions'
  | 'call'
  | 'instagram'
  | 'invite'
  | 'postcard'
  | 'evening_mode'
  | 'game_win'
  | 'game_share';

export function trackClick(action: TrackAction, label?: string): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({
    event: 'elkhan_cta_click',
    action,
    ...(label ? { label } : {}),
  });
}

export function fisherYatesShuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function formatGameSeconds(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export interface BestGameScore {
  moves: number;
  seconds: number;
}

export function isBetterGameScore(
  candidate: BestGameScore,
  existing: BestGameScore | null
): boolean {
  if (!existing) return true;
  if (candidate.moves !== existing.moves) return candidate.moves < existing.moves;
  return candidate.seconds < existing.seconds;
}

