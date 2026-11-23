import type { TrackKind } from './board-track';

const messages: Record<TrackKind, [string, string, string]> = {
  start: ['Ziko retrouve la maison où sa mission a commencé.', 'Consulter le départ', 'Le passage par la maison donne droit à une allocation.'],
  cleanup: ['Du plastique s’accumule au bord de l’eau. Ziko peut organiser un nettoyage.', 'Préparer le nettoyage', 'Pour nettoyer, il faut des bénévoles et assez de matériel pour les équiper.'],
  minigame: ['Un défi d’arcade attend Ziko. Son score déterminera sa récompense.', 'Voir le défi', 'Objectif : marquer le plus de points possible en 30 secondes.'],
  card: ['Un événement inattendu peut changer la mission de Ziko.', 'Découvrir la case surprise', 'Les cartes surprises peuvent apporter une trouvaille ou un imprévu.'],
  job: ['Un petit boulot permet à Ziko de financer ses projets.', 'Consulter les offres', 'Boulot classique : plus de pièces. Boulot écolo : un bénéfice pour la planète.'],
  combat: ['Une créature née des déchets se dresse sur le chemin.', 'Préparer le combat', 'Ziko choisira un outil de nettoyage adapté au point faible de la créature.'],
  trap: ['Attention : une fausse bonne idée pourrait coûter cher à Ziko.', 'Examiner le piège', 'Un emballage vert ne garantit pas qu’un produit respecte la nature.'],
  demo: ['Des habitants veulent défendre leur région aux côtés de Ziko.', 'Préparer la manifestation', 'Plus il y a de participants, plus une loi de protection peut être votée.'],
  animal: ['Une espèce est en danger. Ziko peut lui venir en aide.', 'Préparer le sauvetage', 'Selon l’espèce, il faudra du matériel adapté ou des pièces écolo.'],
  tv: ['La télévision invite Ziko à parler de sa mission.', 'Préparer l’interview', 'Les réponses de Ziko sensibiliseront les spectateurs et attireront des bénévoles.'],
  chantier: ['Un projet local peut améliorer durablement la région.', 'Consulter les chantiers', 'Les chantiers accessibles dépendent de l’âge de Ziko et du matériel disponible.'],
};

export function showTileDialog(kind: TrackKind, title: string, onAction: (brief: string, accepted: boolean) => void,
  copy?: { description: string; action: string; rating?: HTMLElement; details?: HTMLElement }) {
  const [description, action, brief] = messages[kind];
  const dialog = document.createElement('dialog');
  dialog.className = 'tile-dialog';
  const heading = document.createElement('h2');
  heading.id = 'tile-heading'; heading.textContent = title;
  dialog.setAttribute('aria-labelledby', heading.id);
  const body = document.createElement('p'); body.textContent = copy?.description ?? description;
  const button = document.createElement('button'); button.textContent = copy?.action ?? action;
  dialog.append(heading);
  if (copy?.rating) dialog.append(copy.rating);
  dialog.append(body);
  if (copy?.details) dialog.append(copy.details);
  dialog.append(button);
  (document.fullscreenElement ?? document.body).append(dialog);
  dialog.addEventListener('cancel', event => { event.preventDefault(); dialog.close(); });
  dialog.addEventListener('close', () => { dialog.remove(); const ok = dialog.returnValue === 'action'; onAction(ok ? brief : 'Retour au plateau.', ok); }, { once: true });
  dialog.onkeydown = event => event.stopPropagation();
  button.onclick = () => dialog.close('action');
  dialog.showModal();
  return dialog;
}
