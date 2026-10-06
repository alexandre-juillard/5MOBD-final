export type ErreursFormulaire<T extends string> = Partial<Record<T, string>>;

const motifEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const estEmailValide = (email: string): boolean => motifEmail.test(email.trim());

export type ChampsConnexion = 'email' | 'motDePasse';

export const validerConnexion = (email: string, motDePasse: string): ErreursFormulaire<ChampsConnexion> => {
  const erreurs: ErreursFormulaire<ChampsConnexion> = {};
  if (!email.trim()) {
    erreurs.email = "L'email est obligatoire.";
  } else if (!estEmailValide(email)) {
    erreurs.email = "L'email n'est pas valide.";
  }
  if (!motDePasse) {
    erreurs.motDePasse = 'Le mot de passe est obligatoire.';
  }
  return erreurs;
};

export type ChampsInscription = 'nom' | 'email' | 'motDePasse' | 'confirmation';

export const validerInscription = (
  nom: string,
  email: string,
  motDePasse: string,
  confirmation: string,
): ErreursFormulaire<ChampsInscription> => {
  const erreurs: ErreursFormulaire<ChampsInscription> = {};
  const nomNettoye = nom.trim();
  if (nomNettoye.length < 2) {
    erreurs.nom = 'Le nom doit contenir au moins 2 caractères.';
  } else if (nomNettoye.length > 50) {
    erreurs.nom = 'Le nom ne peut pas dépasser 50 caractères.';
  }
  if (!email.trim()) {
    erreurs.email = "L'email est obligatoire.";
  } else if (!estEmailValide(email)) {
    erreurs.email = "L'email n'est pas valide.";
  }
  if (motDePasse.length < 6) {
    erreurs.motDePasse = 'Le mot de passe doit contenir au moins 6 caractères.';
  }
  if (confirmation !== motDePasse) {
    erreurs.confirmation = 'Les mots de passe ne correspondent pas.';
  }
  return erreurs;
};

export type ChampsAdresse = 'nom' | 'description' | 'emplacement';

export const validerAdresse = (
  nom: string,
  description: string,
  emplacementDefini: boolean,
): ErreursFormulaire<ChampsAdresse> => {
  const erreurs: ErreursFormulaire<ChampsAdresse> = {};
  const nomNettoye = nom.trim();
  if (nomNettoye.length < 2) {
    erreurs.nom = 'Le nom doit contenir au moins 2 caractères.';
  } else if (nomNettoye.length > 80) {
    erreurs.nom = 'Le nom ne peut pas dépasser 80 caractères.';
  }
  if (description.trim().length > 500) {
    erreurs.description = 'La description ne peut pas dépasser 500 caractères.';
  }
  if (!emplacementDefini) {
    erreurs.emplacement = "Choisissez l'emplacement de l'adresse.";
  }
  return erreurs;
};

export type ChampsAvis = 'note' | 'commentaire';

export const validerAvis = (
  note: number,
  commentaire: string,
  avecPhoto: boolean,
): ErreursFormulaire<ChampsAvis> => {
  const erreurs: ErreursFormulaire<ChampsAvis> = {};
  if (!Number.isInteger(note) || note < 1 || note > 5) {
    erreurs.note = 'Choisissez une note entre 1 et 5.';
  }
  const commentaireNettoye = commentaire.trim();
  if (!commentaireNettoye && !avecPhoto) {
    erreurs.commentaire = 'Ajoutez un commentaire ou une photo.';
  } else if (commentaireNettoye.length > 1000) {
    erreurs.commentaire = 'Le commentaire ne peut pas dépasser 1000 caractères.';
  }
  return erreurs;
};

export const estFormulaireValide = (erreurs: Record<string, string | undefined>): boolean =>
  Object.values(erreurs).every((valeur) => !valeur);
