import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fisherYatesShuffle,
  formatGameSeconds,
  get24hClockGeometry,
  getAlgiersOpenStatus,
  getAlgiersTimeOfDay,
  getDayHoursInfo,
  getVideoObjectFit,
  getWhatsAppInviteUrl,
  isBetterGameScore,
} from './khanLogic';

test('Algiers open status on Saturday at 14:30 CET is open until 21:00', () => {
  const satAfternoon = new Date('2026-11-21T13:30:00Z');
  const status = getAlgiersOpenStatus(satAfternoon);
  assert.equal(status.todayKey, 'sat');
  assert.equal(status.isOpen, true);
  assert.equal(status.statusTextAr, 'مفتوح الآن · يُغلق عند 21:00');
  assert.equal(status.statusTextFr, 'Ouvert · ferme à 21h');
});

test('Algiers open status on Friday at 14:00 CET is closed before 15:00', () => {
  const friBeforeOpen = new Date('2026-11-20T13:00:00Z');
  const status = getAlgiersOpenStatus(friBeforeOpen);
  assert.equal(status.todayKey, 'fri');
  assert.equal(status.isOpen, false);
  assert.equal(status.statusTextFr, 'Fermé · ouvre à 15h');
});

test('Algiers open status on Friday at 21:30 CET is open until 22:00', () => {
  const friLate = new Date('2026-11-20T20:30:00Z');
  const status = getAlgiersOpenStatus(friLate);
  assert.equal(status.todayKey, 'fri');
  assert.equal(status.isOpen, true);
  assert.equal(status.statusTextFr, 'Ouvert · ferme à 22h');
});

test('Algiers open status on Thursday night announces Friday 15:00', () => {
  const thuNight = new Date('2026-11-19T20:30:00Z');
  const status = getAlgiersOpenStatus(thuNight);
  assert.equal(status.todayKey, 'thu');
  assert.equal(status.isOpen, false);
  assert.equal(status.statusTextAr, 'مُغلق الآن · يفتح غداً عند 15:00');
});

test('Video object-fit returns cover when aspect ratio matches and contain when mismatched', () => {
  assert.equal(getVideoObjectFit(720, 960, 360, 480), 'cover');
  assert.equal(getVideoObjectFit(720, 1280, 360, 640), 'cover');
  assert.equal(getVideoObjectFit(720, 960, 360, 640), 'contain');
});

test('Algiers time of day returns morning, afternoon, and evening moods accurately', () => {
  assert.equal(getAlgiersTimeOfDay(new Date('2026-11-21T07:30:00Z')).period, 'morning');
  assert.equal(getAlgiersTimeOfDay(new Date('2026-11-21T14:00:00Z')).period, 'afternoon');
  assert.equal(getAlgiersTimeOfDay(new Date('2026-11-21T19:30:00Z')).period, 'evening');
});

test('24h dial geometry computes exact angles for Saturday and Friday hours', () => {
  const sat = get24hClockGeometry('sat', 12, 0);
  assert.equal(sat.openHour, 10);
  assert.equal(sat.closeHour, 21);
  assert.equal(sat.handAngleDeg, 90);
  assert.equal(sat.startAngleDeg, 60);

  const fri = get24hClockGeometry('fri', 0, 0);
  assert.equal(fri.openHour, 15);
  assert.equal(fri.closeHour, 22);
  assert.equal(fri.handAngleDeg, -90);
});

test('WhatsApp invite URL encodes Arabic and French invitation messages with Maps link', () => {
  const maps = 'https://maps.app.goo.gl/Ff61BEv6fCTCUn818';
  const arUrl = getWhatsAppInviteUrl('ar', maps);
  const frUrl = getWhatsAppInviteUrl('fr', maps);
  assert.ok(arUrl.startsWith('https://wa.me/?text='));
  assert.ok(decodeURIComponent(arUrl).includes('نلتقي في الخان؟'));
  assert.ok(decodeURIComponent(arUrl).includes(maps));
  assert.ok(decodeURIComponent(frUrl).includes('On se retrouve à ElKhan ?'));
});

test('Day selector helper returns real hours and live status only when selected day is today', () => {
  const satAfternoon = new Date('2026-11-21T13:30:00Z');
  const todayInfo = getDayHoursInfo('sat', satAfternoon);
  assert.equal(todayInfo.isToday, true);
  assert.equal(todayInfo.timeRange, '10:00 – 21:00');
  assert.equal(todayInfo.liveStatus?.isOpen, true);

  const fridayInfo = getDayHoursInfo('fri', satAfternoon);
  assert.equal(fridayInfo.isToday, false);
  assert.equal(fridayInfo.timeRange, '15:00 – 22:00');
  assert.equal(fridayInfo.liveStatus, null);
});

test('Fisher-Yates shuffle preserves exact tile multiset and formats game duration/best score', () => {
  const input = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6];
  const shuffled = fisherYatesShuffle(input);
  assert.equal(shuffled.length, 12);
  assert.deepEqual([...shuffled].sort((a, b) => a - b), input);

  assert.equal(formatGameSeconds(0), '00:00');
  assert.equal(formatGameSeconds(75), '01:15');

  assert.equal(isBetterGameScore({ moves: 10, seconds: 40 }, null), true);
  assert.equal(isBetterGameScore({ moves: 9, seconds: 55 }, { moves: 10, seconds: 40 }), true);
  assert.equal(isBetterGameScore({ moves: 10, seconds: 35 }, { moves: 10, seconds: 40 }), true);
  assert.equal(isBetterGameScore({ moves: 10, seconds: 45 }, { moves: 10, seconds: 40 }), false);
});


