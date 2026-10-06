import type { Avis } from '@/types/models';

export const calculerNoteMoyenne = (listeAvis: Pick<Avis, 'note'>[]): number => {
  if (listeAvis.length === 0) {
    return 0;
  }
  const total = listeAvis.reduce((somme, avis) => somme + avis.note, 0);
  return Math.round((total / listeAvis.length) * 10) / 10;
};

export const formaterNoteMoyenne = (listeAvis: Pick<Avis, 'note'>[]): string => {
  if (listeAvis.length === 0) {
    return 'Aucun avis';
  }
  const moyenne = calculerNoteMoyenne(listeAvis).toFixed(1).replace('.', ',');
  return `${moyenne}/5 · ${listeAvis.length} avis`;
};

export const formaterDate = (date: Date | null): string => {
  if (!date) {
    return '';
  }
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};
