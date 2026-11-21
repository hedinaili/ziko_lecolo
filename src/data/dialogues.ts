import type { CreatureId, Era } from '../core/types';

export type CreatureLineKind = 'intro' | 'hitWeak' | 'playerMiss' | 'defeated' | 'victory';

export const CREATURE_LINES: Readonly<Record<Exclude<CreatureId, 'roiOrdures'>, Record<CreatureLineKind, readonly string[]>>> = {
  sacZombie: {
    intro: ['Grrr… Je suis à usage UNIQUE… mais je vais durer 400 ans ! Mouahaha !'],
    hitWeak: ['Aïe ! Pas la pince ! Je suis chatouilleux du nœud !'],
    playerMiss: ['Raté ! Même une poubelle vise mieux que toi !'],
    defeated: ['Je me sens… tout recyclé… Adieu, monde cruel… Bonjour, sac réutilisable !'],
    victory: ['Je retourne flotter dans l\'océan. Les tortues vont ADORER… Non, en fait.'],
  },
  golemPneus: {
    intro: ['VROUM. MOI GOLEM. MOI ÉCRASER. MOI… avoir un pneu crevé, attends deux secondes.'],
    hitWeak: ['Hé ! Qui t\'a appris à dévisser comme ça ?!'],
    playerMiss: ['Ha ! Tu tournes en rond, comme moi sur le périphérique !'],
    defeated: ['Pfffffff… Fais de moi… une aire de jeux…'],
    victory: ['MOI GAGNER. MOI REPARTIR SUR LA ROUTE 66. MOI PAS RESPECTER LIMITATION.'],
  },
  meduse: {
    intro: ['Bonjouuur, je suis 100 % naturelle ! Bon, d\'accord… 100 % pétrole. C\'est naturel aussi, non ?'],
    hitWeak: ['Arrête de m\'éponger ! J\'ai mis trois millions d\'années à être aussi grasse !'],
    playerMiss: ['Glisse, glisse, petit écolo !'],
    defeated: ['Je fonds… je fonds… Dites aux mouettes que je suis désolée…'],
    victory: ['Je vais faire une marée noire. Ou une marée… très, très foncée.'],
  },
  smog: {
    intro: ['Respire un grand coup ! … Non, vraiment, vas-y. Hé hé hé. Kof kof.'],
    hitWeak: ['Nooon, pas l\'aspirateur ! Je suis allergique à l\'air pur !'],
    playerMiss: ['Tu ne vois rien ? C\'est normal, le brouillard, c\'est moi !'],
    defeated: ['Je me dissipe… On se reverra… aux heures de pointe…'],
    victory: ['Ce soir, je fais une fête. Thème : pic de pollution !'],
  },
};

export const BOSS_LINES = {
  intro: 'À genoux devant Sa Majesté le Roi des Ordures, Seigneur des Décharges, Empereur des Emballages, et Champion du monde de « Je jette par terre, c\'est pas grave » !',
  seesMop: 'Une SERPILLIÈRE ? Tu viens défier un ROI avec une SERPILLIÈRE ? … Attends. Pourquoi elle brille ?',
  phase2: 'Mes sacs ! Mes magnifiques sacs ! Peu importe ! PLACE AUX PNEUS ! J\'ai toujours rêvé d\'être un monster truck !',
  phase3: 'Tu m\'as dégonflé ? Très bien ! Je deviens… UN NUAGE ! Essaie donc de taper un nuage, petit malin !',
  playerMiss: 'Tu aimes mon sceptre au logo du recyclage ? Je l\'ai trouvé dans une poubelle… jaune. Ironique, non ?',
  hitWeak: 'Aïe ! Mais enfin, je suis un ROI ! On ne frappe pas un roi ! C\'est écrit dans le règlement des rois !',
  defeated: 'Impossible… Je suis… trié… Je vais devenir… du compost… Dites à ma mère, la Décharge, que je l\'aimais…',
  victory: 'Hahaha ! Dès demain, je rebaptise la Terre « La Poubelle » ! … Non, c\'est trop gentil. « La Grosse Poubelle » !',
  prevented: 'Euh… Il n\'y a plus assez de déchets pour me fabriquer. Je vais rester… un petit prince. Un tout, tout petit prince.',
} as const;

export const TV_HOSTS: Readonly<Record<Era, { show: string; host: string; quirk: string }>> = {
  child: { show: 'Le Petit Journal du quartier', host: 'Mme Pipelette', quirk: 'Mon chat Croquette vous salue, d\'ailleurs !' },
  young: { show: 'Planète Région', host: 'Jean-Michel Météo', quirk: 'Petite parenthèse : demain, grand soleil sur le plateau !' },
  adult: { show: 'Le 20 h', host: 'Sophie Sérieux-Tout-le-Temps', quirk: 'Restons sérieux. Très sérieux. Extrêmement sérieux.' },
  hero: { show: 'World Live', host: 'Bob Mondial', quirk: 'Hello, bonjour, hola, ciao, guten Tag… euh… salut !' },
};

export const TV_HEADLINES = {
  excellent: ['UN ENFANT ARMÉ D\'UNE SERPILLIÈRE ÉMEUT LA PLANÈTE !'],
  good: ['ZIKO À LA TÉLÉ : LE PUBLIC CONQUIS (ET LE CHAT DE MME PIPELETTE AUSSI)'],
  average: ['ZIKO PASSE À LA TÉLÉ, LA MÉTÉO PASSE AVANT LUI'],
  low: ['ZIKO À LA TÉLÉ : SA SERPILLIÈRE A PLUS DE FANS QUE LUI'],
  bonus: ['LE SAC-ZOMBIE PORTE PLAINTE CONTRE ZIKO : « IL M\'A PINCÉ ! »'],
} as const;

export function headlineTier(ratio: number): keyof Omit<typeof TV_HEADLINES, 'bonus'> {
  if (ratio >= 1) return 'excellent';
  if (ratio >= 0.66) return 'good';
  if (ratio >= 0.33) return 'average';
  return 'low';
}
