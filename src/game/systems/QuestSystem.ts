import type { QuestStage } from '../types';
export type QuestEvent = 'starter' | 'battle' | 'crystal' | 'report';
const transitions: Partial<Record<QuestStage, Partial<Record<QuestEvent, QuestStage>>>> = {
  meet: { starter: 'explore' },
  explore: { battle: 'investigate' },
  investigate: { crystal: 'return' },
  return: { report: 'complete' },
};
export function advanceQuest(stage: QuestStage, event: QuestEvent): QuestStage {
  return transitions[stage]?.[event] ?? stage;
}
export const objectives: Record<QuestStage, string> = {
  meet: 'Speak with Dr. Liora outside the laboratory.',
  explore: 'Head north. Win a wild battle or befriend a creature.',
  investigate: 'Investigate the crystal in the northern clearing.',
  return: 'Return to Dr. Liora with your discovery.',
  complete: 'Chapter complete. Keep exploring and befriending creatures.',
};
