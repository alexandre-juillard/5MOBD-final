import {
  estEmailValide,
  estFormulaireValide,
  validerAdresse,
  validerAvis,
  validerConnexion,
  validerInscription,
} from '@/utils/validation';

describe('estEmailValide', () => {
  it.each(['jean@exemple.fr', ' marie.dupont@mail.com ', 'a@b.co'])('accepte %s', (email) => {
    expect(estEmailValide(email)).toBe(true);
  });

  it.each(['', 'jean', 'jean@', 'jean@exemple', '@exemple.fr', 'jean @exemple.fr'])('refuse "%s"', (email) => {
    expect(estEmailValide(email)).toBe(false);
  });
});

describe('validerConnexion', () => {
  it('ne retourne aucune erreur pour des champs valides', () => {
    expect(validerConnexion('jean@exemple.fr', 'secret')).toEqual({});
  });

  it('signale les champs vides', () => {
    expect(validerConnexion('', '')).toEqual({
      email: "L'email est obligatoire.",
      motDePasse: 'Le mot de passe est obligatoire.',
    });
  });

  it('signale un email invalide', () => {
    expect(validerConnexion('jean', 'secret').email).toBe("L'email n'est pas valide.");
  });
});

describe('validerInscription', () => {
  it('ne retourne aucune erreur pour une inscription valide', () => {
    expect(validerInscription('Jean', 'jean@exemple.fr', 'secret1', 'secret1')).toEqual({});
  });

  it('refuse un nom trop court ou trop long', () => {
    expect(validerInscription('J', 'jean@exemple.fr', 'secret1', 'secret1').nom).toBeDefined();
    expect(validerInscription('J'.repeat(51), 'jean@exemple.fr', 'secret1', 'secret1').nom).toBeDefined();
  });

  it('refuse un mot de passe trop court', () => {
    expect(validerInscription('Jean', 'jean@exemple.fr', '123', '123').motDePasse).toBe(
      'Le mot de passe doit contenir au moins 6 caractères.',
    );
  });

  it('refuse une confirmation différente', () => {
    expect(validerInscription('Jean', 'jean@exemple.fr', 'secret1', 'secret2').confirmation).toBe(
      'Les mots de passe ne correspondent pas.',
    );
  });

  it('signale un email manquant ou invalide', () => {
    expect(validerInscription('Jean', '', 'secret1', 'secret1').email).toBe("L'email est obligatoire.");
    expect(validerInscription('Jean', 'jean@', 'secret1', 'secret1').email).toBe("L'email n'est pas valide.");
  });
});

describe('validerAdresse', () => {
  it('accepte une adresse complète', () => {
    expect(validerAdresse('Chez Paul', 'Très bon', true)).toEqual({});
  });

  it('exige un nom et un emplacement', () => {
    const erreurs = validerAdresse(' ', '', false);
    expect(erreurs.nom).toBeDefined();
    expect(erreurs.emplacement).toBe("Choisissez l'emplacement de l'adresse.");
  });

  it('limite la longueur du nom et de la description', () => {
    expect(validerAdresse('a'.repeat(81), '', true).nom).toBeDefined();
    expect(validerAdresse('Chez Paul', 'a'.repeat(501), true).description).toBeDefined();
  });
});

describe('validerAvis', () => {
  it('accepte une note avec commentaire', () => {
    expect(validerAvis(4, 'Super', false)).toEqual({});
  });

  it('accepte une note avec uniquement une photo', () => {
    expect(validerAvis(5, '', true)).toEqual({});
  });

  it.each([0, 6, 2.5, Number.NaN])('refuse la note %p', (note) => {
    expect(validerAvis(note, 'Super', false).note).toBe('Choisissez une note entre 1 et 5.');
  });

  it('exige un commentaire ou une photo', () => {
    expect(validerAvis(3, '   ', false).commentaire).toBe('Ajoutez un commentaire ou une photo.');
  });

  it('limite la longueur du commentaire', () => {
    expect(validerAvis(3, 'a'.repeat(1001), false).commentaire).toBeDefined();
  });
});

describe('estFormulaireValide', () => {
  it('est vrai sans erreur', () => {
    expect(estFormulaireValide({})).toBe(true);
    expect(estFormulaireValide({ nom: undefined })).toBe(true);
  });

  it('est faux avec au moins une erreur', () => {
    expect(estFormulaireValide({ nom: 'Erreur' })).toBe(false);
  });
});
