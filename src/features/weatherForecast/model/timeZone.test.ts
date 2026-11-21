import { describe, expect, it } from 'vitest';
import {
  isKnownZone,
  zoneDifference,
  zonedDayKey,
  zonedDayStart,
  zonedHour,
} from './timeZone.js';

// 23:30 UTC on 21 November: already the 22nd in Helsinki (UTC+2).
const late = new Date(Date.UTC(2026, 10, 21, 23, 30));

describe('time zone helpers', () => {
  it("files a time under the place's own day and hour", () => {
    expect(zonedDayKey(late, 'Europe/Helsinki')).toBe('2026-11-22');

    expect(zonedDayKey(late, 'Europe/Lisbon')).toBe('2026-11-21');

    expect(zonedHour(late, 'Europe/Helsinki')).toBe(1);
  });

  it("starts the day at the place's midnight", () => {
    expect(zonedDayStart(late, 'Europe/Helsinki').toISOString()).toBe(
      '2026-11-21T22:00:00.000Z',
    );
  });

  it('finds midnight across a DST switch', () => {
    // 10:00 CEST on the spring-forward day: midnight was still CET.
    expect(
      zonedDayStart(
        new Date(Date.UTC(2026, 2, 29, 8)),
        'Europe/Bratislava',
      ).toISOString(),
    ).toBe('2026-03-28T23:00:00.000Z');

    // 10:00 CET on the fall-back day: midnight was still CEST.
    expect(
      zonedDayStart(
        new Date(Date.UTC(2026, 9, 25, 9)),
        'Europe/Bratislava',
      ).toISOString(),
    ).toBe('2026-10-24T22:00:00.000Z');
  });

  it('knows a zone only if the browser does', () => {
    expect(isKnownZone('Europe/Bratislava')).toBe(true);

    expect(isKnownZone('Mars/Olympus')).toBe(false);
  });

  it("says how far the place's clock is from another", () => {
    const differ = (zone: string) =>
      zoneDifference(zone, late) === null
        ? 0
        : zoneDifference(zone, late)?.startsWith('+')
          ? 1
          : -1;

    // Against itself, whatever the browser's zone.
    const browser = Intl.DateTimeFormat().resolvedOptions().timeZone;

    expect(zoneDifference(browser, late)).toBeNull();

    expect(differ('Pacific/Kiritimati')).toBe(1);

    expect(differ('Pacific/Pago_Pago')).toBe(-1);
  });
});
