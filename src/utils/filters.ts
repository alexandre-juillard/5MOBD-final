import type { Adresse } from '@/types/models';

export type FiltreVisibilite = 'toutes' | 'publiques' | 'privees';

export const filtrerParVisibilite = (adresses: Adresse[], filtre: FiltreVisibilite): Adresse[] => {
  if (filtre === 'publiques') {
    return adresses.filter((adresse) => adresse.estPublique);
  }
  if (filtre === 'privees') {
    return adresses.filter((adresse) => !adresse.estPublique);
  }
  return adresses;
};

export const rechercherDansAdresses = (adresses: Adresse[], recherche: string): Adresse[] => {
  const terme = recherche.trim().toLowerCase();
  if (!terme) {
    return adresses;
  }
  return adresses.filter((adresse) =>
    [adresse.nom, adresse.description, adresse.adresseTexte, adresse.proprietaireNom].some((valeur) =>
      valeur.toLowerCase().includes(terme),
    ),
  );
};
