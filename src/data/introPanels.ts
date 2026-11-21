/** The 15 opening comic panels (docs/02 "Le scénario case par case"). */

export type BackgroundId =
  | 'garden'
  | 'livingRoom'
  | 'ocean'
  | 'smogCity'
  | 'hospital'
  | 'heat'
  | 'gasStation'
  | 'dumpNight'
  | 'parkAttack'
  | 'endangered'
  | 'disasters'
  | 'bedroom'
  | 'sprout'
  | 'doorstep'
  | 'earth';

export type Emotion = 'joyful' | 'curious' | 'worried' | 'sad' | 'shocked' | 'scared' | 'angry' | 'determined' | 'hopeful';
export type PanelEffect = 'none' | 'shake' | 'glitch' | 'heat';

export interface IntroPanel {
  id: number;
  background: BackgroundId;
  emotion: Emotion;
  /** Ziko seen from behind (last panel). */
  back?: boolean;
  side: 'left' | 'right';
  narration: string;
  bubble?: string;
  effect: PanelEffect;
  /** Big glowing number shown over the picture (e.g. the 300 years left for sea life). */
  bigNumber?: string;
  /** Golden caption under the picture (last panel). */
  caption?: string;
}

export const INTRO_PANELS: readonly IntroPanel[] = [
  { id: 1, background: 'garden', emotion: 'joyful', side: 'left', effect: 'none', narration: "Voici Ziko. Il a 10 ans, et ce qu'il aime le plus au monde, c'est la nature.", bubble: 'Je crois que je suis un peu une plante !' },
  { id: 2, background: 'livingRoom', emotion: 'worried', side: 'right', effect: 'none', narration: 'Un soir, les scientifiques font une annonce à la télévision…' },
  { id: 3, background: 'ocean', emotion: 'shocked', side: 'left', effect: 'none', bigNumber: '300', narration: 'Les êtres marins n\'ont plus que 300 ans avant de disparaître.', bubble: '300 ans ?! Et les tortues ? Et les baleines ?' },
  { id: 4, background: 'smogCity', emotion: 'worried', side: 'right', effect: 'none', narration: 'Plus de la moitié des humains sont malades à cause de la pollution.', bubble: 'Mamie tousse tout le temps… C\'est pour ça ?' },
  { id: 5, background: 'hospital', emotion: 'sad', side: 'left', effect: 'none', narration: "L'espérance de vie des humains est tombée à 50 ans.", bubble: "C'est presque l'âge de Papa…" },
  { id: 6, background: 'heat', emotion: 'worried', side: 'right', effect: 'heat', narration: "La Terre a 4 °C de plus que d'habitude, et ça monte vite.", bubble: 'Il fait chaud, même la nuit…' },
  { id: 7, background: 'gasStation', emotion: 'worried', side: 'left', effect: 'none', narration: 'La planète commence à manquer de pétrole.', bubble: 'Mais alors… comment on va faire ?' },
  { id: 8, background: 'dumpNight', emotion: 'scared', side: 'right', effect: 'glitch', narration: 'Dans les montagnes de déchets, quelque chose bouge…', bubble: "… C'était quoi, ça ?" },
  { id: 9, background: 'parkAttack', emotion: 'angry', side: 'left', effect: 'shake', narration: 'Des créatures monstrueuses surgissent des déchets et attaquent les êtres vivants !', bubble: 'Laissez-les tranquilles !' },
  { id: 10, background: 'endangered', emotion: 'sad', side: 'right', effect: 'none', narration: "De plus en plus d'animaux sont menacés d'extinction.", bubble: "Ils n'ont rien fait de mal…" },
  { id: 11, background: 'disasters', emotion: 'angry', side: 'left', effect: 'shake', narration: 'Les catastrophes naturelles sont de plus en plus nombreuses.' },
  { id: 12, background: 'bedroom', emotion: 'worried', side: 'right', effect: 'none', narration: "Cette nuit-là, Ziko n'arrive pas à dormir.", bubble: "Pourquoi personne ne fait rien ? Est-ce qu'il est trop tard ?" },
  { id: 13, background: 'sprout', emotion: 'hopeful', side: 'left', effect: 'none', narration: 'Au matin, Ziko remarque une petite pousse qui a traversé le béton.', bubble: "Elle n'a pas abandonné, elle…" },
  { id: 14, background: 'doorstep', emotion: 'determined', side: 'right', effect: 'none', narration: 'Ziko prend une grande décision.', bubble: 'Si personne ne commence… alors ce sera moi !' },
  { id: 15, background: 'earth', emotion: 'determined', back: true, side: 'left', effect: 'none', caption: "Vie sur Terre : jusqu'en l'an 2 800 ?", narration: 'Ziko a 40 ans pour protéger la vie sur Terre.' },
];

export const INTRO_TEXT =
  'À 10 ans, Ziko part avec sa serpillière et une idée : nettoyer la rivière de son quartier pour que les poissons y reviennent.\n\n' +
  'Il a 40 ans pour rallier les habitants, protéger les espèces menacées et aider les êtres vivants à vivre mieux, plus longtemps.';
