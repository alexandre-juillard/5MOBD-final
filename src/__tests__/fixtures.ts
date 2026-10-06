import type { Adresse, Avis, ProfilUtilisateur } from '@/types/models';

export const profilTest: ProfilUtilisateur = {
  id: 'utilisateur-1',
  nom: 'Jean Dupont',
  photoUrl: null,
};

export const creerAdresseTest = (valeurs: Partial<Adresse> = {}): Adresse => ({
  id: 'adresse-1',
  proprietaireId: profilTest.id,
  proprietaireNom: profilTest.nom,
  nom: 'Chez Paul',
  description: 'Un bistrot chaleureux',
  photoUrl: null,
  adresseTexte: '1 rue de Paris, 75001 Paris',
  latitude: 48.8566,
  longitude: 2.3522,
  estPublique: true,
  creeLe: new Date(2026, 5, 1),
  ...valeurs,
});

export const creerAvisTest = (valeurs: Partial<Avis> = {}): Avis => ({
  id: 'auteur-2',
  auteurId: 'auteur-2',
  auteurNom: 'Marie Curie',
  auteurPhotoUrl: null,
  note: 4,
  commentaire: 'Très bonne adresse',
  photoUrl: null,
  creeLe: new Date(2026, 5, 2),
  ...valeurs,
});
