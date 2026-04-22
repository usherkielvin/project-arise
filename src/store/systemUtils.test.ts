import { describe, expect, it } from 'vitest';
import { localDateKey, shouldEnablePenaltyForDateChange, xpForLevel } from './systemUtils';

describe('systemUtils', () => {
  it('calculates progressively increasing XP thresholds', () => {
    expect(xpForLevel(1)).toBe(100);
    expect(xpForLevel(2)).toBeGreaterThan(xpForLevel(1));
    expect(xpForLevel(3)).toBeGreaterThan(xpForLevel(2));
  });

  it('enables penalty only for unfinished quests from previous day', () => {
    const previousDate = '2026-04-21';
    const quests = [
      { completed: false, dateCreated: '2026-04-21T07:30:00.000Z' },
      { completed: true, dateCreated: '2026-04-21T09:00:00.000Z' },
      { completed: false, dateCreated: '2026-04-22T09:00:00.000Z' },
    ];

    expect(shouldEnablePenaltyForDateChange(quests, previousDate)).toBe(true);
    expect(shouldEnablePenaltyForDateChange([{ completed: true, dateCreated: quests[0].dateCreated }], previousDate)).toBe(false);
  });

  it('returns stable local date keys', () => {
    const date = new Date('2026-04-22T12:00:00.000Z');
    expect(localDateKey(date)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
