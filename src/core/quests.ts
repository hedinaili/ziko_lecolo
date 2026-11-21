import { QUESTS, type QuestDef } from '../data/content';
import { eraOf, type Ctx, type GameState } from './state';
import type { ChantierId, Era } from './types';
import { addCoins, addVolunteers } from './world';

function builtSinceEra(state: GameState, ids: ChantierId[]): number {
  let n = 0;
  for (const id of ids) n += (state.chantiers[id] ?? 0) - (state.eraStartChantiers[id] ?? 0);
  return n;
}

export function questProgress(state: GameState, quest: QuestDef): number {
  const c = state.counters;
  const s = state.eraStartCounters;
  switch (quest.id) {
    case 'petitJardinier':
      return c.chantiers - s.chantiers;
    case 'premierNettoyage':
      return c.cleanups - s.cleanups;
    case 'championEnHerbe':
      return c.medals - s.medals;
    case 'roulerPropre':
      return builtSinceEra(state, ['borne']);
    case 'laLoiCestNous':
      return state.laws.includes('antiPlastic') ? 1 : 0;
    case 'caGrandit':
      return state.volunteers;
    case 'leVentTourne':
      return builtSinceEra(state, ['eolienne']);
    case 'sanctuaire':
      return builtSinceEra(state, ['reservePlantes', 'reserveAnimaux']);
    case 'respirerEnfin':
      return state.metrics.toxicGas < 35 ? 1 : 0;
    case 'planeteProtegee':
      return builtSinceEra(state, ['reserveMondiale']);
    case 'tousEnsemble':
      return state.laws.includes('climate') ? 1 : 0;
    case 'dernierCombat':
      return c.bossDefeated + c.bossPrevented - (s.bossDefeated + s.bossPrevented);
  }
}

export function questsOfEra(era: Era): QuestDef[] {
  return QUESTS.filter((q) => q.era === era);
}

export function activeQuests(state: GameState): QuestDef[] {
  return questsOfEra(eraOf(state)).filter((q) => !state.quests.completed.includes(q.id) && !state.quests.expired.includes(q.id));
}

export function checkQuests(ctx: Ctx): void {
  for (const quest of activeQuests(ctx.state)) {
    if (questProgress(ctx.state, quest) < quest.target) continue;
    ctx.state.quests.completed.push(quest.id);
    ctx.emit({ type: 'questCompleted', id: quest.id });
    ctx.emit({ type: 'milestone', size: 'small', key: `quest:${quest.id}` });
    if (quest.reward.coins) addCoins(ctx, quest.reward.coins, `quest:${quest.id}`);
    if (quest.reward.volunteers) addVolunteers(ctx, quest.reward.volunteers, `quest:${quest.id}`);
  }
}

export function expireQuests(ctx: Ctx, era: Era): void {
  for (const quest of questsOfEra(era)) {
    if (!ctx.state.quests.completed.includes(quest.id) && !ctx.state.quests.expired.includes(quest.id)) {
      ctx.state.quests.expired.push(quest.id);
    }
  }
}

export function startEraTracking(state: GameState): void {
  state.eraStartCounters = { ...state.counters };
  state.eraStartChantiers = { ...state.chantiers };
}
