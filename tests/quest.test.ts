import { expect, it } from 'vitest';
import { advanceQuest } from '../src/game/systems/QuestSystem';

it('requires the story events in sequence and makes completion idempotent', () => {
  expect(advanceQuest('meet', 'crystal')).toBe('meet');
  let stage = advanceQuest('meet', 'starter');
  expect(stage).toBe('explore');
  expect(advanceQuest(stage, 'report')).toBe('explore');
  stage = advanceQuest(stage, 'battle');
  expect(stage).toBe('investigate');
  stage = advanceQuest(stage, 'crystal');
  expect(stage).toBe('return');
  stage = advanceQuest(stage, 'report');
  expect(stage).toBe('complete');
  for (const event of ['starter', 'battle', 'crystal', 'report'] as const)
    expect(advanceQuest(stage, event)).toBe('complete');
});
