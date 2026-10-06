export type Coordonnees = {
  latitude: number;
  longitude: number;
};

export type ProfilUtilisateur = {
  id: string;
  nom: string;
  photoUrl: string | null;
};

export type Adresse = Coordonnees & {
  id: string;
  proprietaireId: string;
  proprietaireNom: string;
  nom: string;
  description: string;
  photoUrl: string | null;
  adresseTexte: string;
  estPublique: boolean;
  creeLe: Date | null;
};

export type NouvelleAdresse = Coordonnees & {
  nom: string;
  description: string;
  adresseTexte: string;
  estPublique: boolean;
  photoUri: string | null;
};

export type Avis = {
  id: string;
  auteurId: string;
  auteurNom: string;
  auteurPhotoUrl: string | null;
  note: number;
  commentaire: string;
  photoUrl: string | null;
  creeLe: Date | null;
};

export type NouvelAvis = {
  note: number;
  commentaire: string;
  photoUri: string | null;
  photoUrlExistante: string | null;
};

export type ResultatGeocodage = Coordonnees & {
  libelle: string;
};
