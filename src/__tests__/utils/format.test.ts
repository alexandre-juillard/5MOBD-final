import { traduireErreur } from '@/utils/errors';
import { filtrerParVisibilite, rechercherDansAdresses } from '@/utils/filters';
import { calculerNoteMoyenne, formaterDate, formaterNoteMoyenne } from '@/utils/format';

import { creerAdresseTest } from '../fixtures';

describe('calculerNoteMoyenne', () => {
  it('retourne 0 sans avis', () => {
    expect(calculerNoteMoyenne([])).toBe(0);
  });

  it('arrondit la moyenne au dixième', () => {
    expect(calculerNoteMoyenne([{ note: 5 }, { note: 4 }, { note: 4 }])).toBe(4.3);
  });
});

describe('formaterNoteMoyenne', () => {
  it("indique l'absence d'avis", () => {
    expect(formaterNoteMoyenne([])).toBe('Aucun avis');
  });

  it('formate la moyenne en français', () => {
    expect(formaterNoteMoyenne([{ note: 5 }, { note: 4 }])).toBe('4,5/5 · 2 avis');
  });
});

describe('formaterDate', () => {
  it('retourne une chaîne vide sans date', () => {
    expect(formaterDate(null)).toBe('');
  });

  it('formate une date en français', () => {
    expect(formaterDate(new Date(2026, 0, 15))).toMatch(/15 janvier 2026/);
  });
});

describe('traduireErreur', () => {
  it('traduit un code Firebase connu', () => {
    expect(traduireErreur({ code: 'auth/email-already-in-use' })).toBe('Un compte existe déjà avec cet email.');
    expect(traduireErreur({ code: 'auth/invalid-credential' })).toBe('Email ou mot de passe incorrect.');
    expect(traduireErreur({ code: 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' })).toMatch(
      /vérifiez la clé API/,
    );
    expect(traduireErreur({ code: 'auth/configuration-not-found' })).toMatch(/pas activée/);
  });

  it('retourne un message générique sinon', () => {
    const generique = 'Une erreur inattendue est survenue. Veuillez réessayer.';
    expect(traduireErreur(new Error('boom'))).toBe(generique);
    expect(traduireErreur({ code: 'inconnu' })).toBe(generique);
    expect(traduireErreur(null)).toBe(generique);
  });
});

describe('filtres', () => {
  const adresses = [
    creerAdresseTest({ id: 'a', nom: 'Boulangerie', estPublique: true }),
    creerAdresseTest({ id: 'b', nom: 'Parc secret', estPublique: false, description: 'Calme' }),
    creerAdresseTest({ id: 'c', nom: 'Musée', estPublique: true, proprietaireNom: 'Marie' }),
  ];

  it('filtre par visibilité', () => {
    expect(filtrerParVisibilite(adresses, 'toutes')).toHaveLength(3);
    expect(filtrerParVisibilite(adresses, 'publiques').map((adresse) => adresse.id)).toEqual(['a', 'c']);
    expect(filtrerParVisibilite(adresses, 'privees').map((adresse) => adresse.id)).toEqual(['b']);
  });

  it('recherche dans le nom, la description et le propriétaire sans tenir compte de la casse', () => {
    expect(rechercherDansAdresses(adresses, '')).toHaveLength(3);
    expect(rechercherDansAdresses(adresses, 'BOULANG').map((adresse) => adresse.id)).toEqual(['a']);
    expect(rechercherDansAdresses(adresses, 'calme').map((adresse) => adresse.id)).toEqual(['b']);
    expect(rechercherDansAdresses(adresses, 'marie').map((adresse) => adresse.id)).toEqual(['c']);
  });
});
