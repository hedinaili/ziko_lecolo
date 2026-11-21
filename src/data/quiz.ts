import type { Era } from '../core/types';

export interface QuizQuestion {
  id: string;
  era: Era;
  question: string;
  /** Always 3 answers: correct, plausible-but-wrong, absurd (docs/19). Shuffled on display. */
  correct: string;
  wrong: string;
  absurd: string;
  /** Host reaction when the absurd answer is picked. */
  laugh?: string;
}

export const QUIZ: readonly QuizQuestion[] = [
  // --- Enfant ---------------------------------------------------------------
  { id: 'verre', era: 'child', question: 'Dans quelle poubelle va une bouteille en verre ?', correct: 'Le bac à verre', wrong: 'La poubelle jaune', absurd: "Dans la bouche du Sac-Zombie, il adore ça" },
  { id: 'lumiere', era: 'child', question: "Pourquoi éteindre la lumière en sortant d'une pièce ?", correct: "Pour économiser l'énergie", wrong: "Pour que l'ampoule refroidisse", absurd: 'Parce que la lumière a besoin de dormir aussi' },
  { id: 'abeilles', era: 'child', question: 'À quoi servent les abeilles ?', correct: 'À polliniser les fleurs', wrong: 'À fabriquer de la cire pour les bougies', absurd: 'À piquer les présentateurs télé', laugh: '« Hé ! Ce n\'est pas drôle ! » … (rires du public)' },
  { id: 'sacPlastique', era: 'child', question: 'Combien de temps met un sac plastique pour disparaître dans la nature ?', correct: 'Plusieurs centaines d\'années', wrong: 'Environ deux ans', absurd: 'Il ne disparaît pas, il part en vacances' },
  { id: 'compost', era: 'child', question: 'Que peut-on mettre dans un composteur ?', correct: 'Des épluchures de légumes', wrong: 'Des piles usagées', absurd: 'Mon devoir de maths' },
  { id: 'transport', era: 'child', question: 'Quel moyen de transport pollue le moins ?', correct: 'Le vélo', wrong: 'La voiture', absurd: 'Le dragon (il crache du feu, ce n\'est pas top)' },
  // --- Jeune ----------------------------------------------------------------
  { id: 'greenwashing', era: 'young', question: 'Que veut dire « greenwashing » ?', correct: "Faire croire qu'un produit est écolo alors qu'il ne l'est pas", wrong: "Laver ses vêtements à l'eau froide", absurd: 'Laver son linge avec des épinards' },
  { id: 'borne', era: 'young', question: 'À quoi sert une borne de recharge ?', correct: 'À recharger les véhicules électriques', wrong: 'À mesurer la pollution', absurd: 'À recharger les présentateurs fatigués' },
  { id: 'forets', era: 'young', question: 'Pourquoi les forêts sont-elles importantes ?', correct: 'Elles absorbent du CO₂ et abritent des animaux', wrong: 'Elles réchauffent la planète', absurd: 'Pour que les écureuils aient le Wi-Fi' },
  { id: 'solaire', era: 'young', question: "D'où vient l'énergie solaire ?", correct: 'Du Soleil', wrong: 'Du pétrole', absurd: 'D\'une pile géante cachée dans le ciel' },
  { id: 'eauRobinet', era: 'young', question: 'Que faire pendant qu\'on se brosse les dents ?', correct: 'Fermer le robinet', wrong: 'Laisser couler l\'eau chaude', absurd: 'Chanter très fort pour effrayer les microbes' },
  { id: 'vrac', era: 'young', question: 'Pourquoi acheter en vrac ?', correct: "Pour éviter les emballages inutiles", wrong: 'Parce que c\'est toujours plus rapide', absurd: 'Pour faire des batailles de lentilles' },
  // --- Adulte ---------------------------------------------------------------
  { id: 'extinction', era: 'adult', question: "Qu'est-ce qu'une espèce menacée d'extinction ?", correct: 'Une espèce qui risque de disparaître', wrong: 'Une espèce qui vit la nuit', absurd: 'Une espèce qui a peur du noir' },
  { id: 'banquise', era: 'adult', question: 'Pourquoi la banquise fond-elle ?', correct: 'À cause du réchauffement climatique', wrong: 'À cause des marées', absurd: 'Les ours polaires la mangent en glace à l\'eau' },
  { id: 'eolienne', era: 'adult', question: 'Que transforme une éolienne ?', correct: 'Le vent en électricité', wrong: 'La chaleur en électricité', absurd: 'Les nuages en barbe à papa' },
  { id: 'recifs', era: 'adult', question: 'Pourquoi protéger les récifs de corail ?', correct: 'Ils abritent une grande partie de la vie marine', wrong: 'Ils produisent du sable pour les plages', absurd: 'Ce sont les appartements des poissons, et ils paient leur loyer' },
  { id: 'reserve', era: 'adult', question: 'À quoi sert une réserve naturelle ?', correct: 'À protéger les plantes et les animaux', wrong: 'À stocker de la nourriture pour l\'hiver', absurd: 'À garder la nature en réserve, au cas où' },
  { id: 'airPollue', era: 'adult', question: "Pourquoi l'air pollué rend-il malade ?", correct: 'Les particules abîment les poumons', wrong: 'Il fait baisser la température du corps', absurd: 'Il raconte des blagues nulles' },
  // --- Super-héros ----------------------------------------------------------
  { id: 'reduire', era: 'hero', question: 'Quelle est la meilleure façon de réduire les déchets ?', correct: 'En produire moins : réduire, réutiliser, recycler', wrong: 'Tout brûler', absurd: 'Les cacher sous le tapis' },
  { id: 'message', era: 'hero', question: 'Quel message pour le monde entier ?', correct: 'Chaque geste compte, ensemble on peut y arriver', wrong: 'Il est trop tard, on ne peut plus rien faire', absurd: 'Achetez ma serpillière dédicacée !', laugh: '(Bob Mondial) « Buy… his… mop ? » … (fou rire général)' },
  { id: 'climat', era: 'hero', question: 'Que change un accord mondial pour le climat ?', correct: 'Tous les pays agissent ensemble', wrong: 'Seuls les pays riches agissent', absurd: 'La météo devient obligée d\'être sympa' },
  { id: 'energiePropre', era: 'hero', question: 'Quelle énergie est renouvelable ?', correct: "L'énergie du vent", wrong: 'Le charbon', absurd: "L'énergie de mon tonton après le café" },
  { id: 'oceans', era: 'hero', question: 'Quelle part de l\'oxygène que l\'on respire vient des océans ?', correct: 'Environ la moitié', wrong: 'Presque rien', absurd: 'Aucune, les poissons gardent tout pour eux' },
  { id: 'heros', era: 'hero', question: "Qu'est-ce qui fait un vrai super-héros de la planète ?", correct: 'Agir chaque jour et entraîner les autres', wrong: 'Avoir des super-pouvoirs', absurd: 'Une cape qui va bien avec la serpillière' },
];

export function quizById(id: string): QuizQuestion | undefined {
  return QUIZ.find((q) => q.id === id);
}
