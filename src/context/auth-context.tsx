import type { User } from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  connecter,
  deconnecter,
  ecouterAuthentification,
  inscrire,
  mettreAJourPhotoProfil,
  recupererProfil,
} from '@/services/auth-service';
import type { ProfilUtilisateur } from '@/types/models';

type ValeurContexteAuthentification = {
  utilisateur: User | null;
  profil: ProfilUtilisateur | null;
  chargement: boolean;
  seConnecter: (email: string, motDePasse: string) => Promise<void>;
  sInscrire: (nom: string, email: string, motDePasse: string) => Promise<void>;
  seDeconnecter: () => Promise<void>;
  changerPhotoProfil: (uri: string) => Promise<void>;
};

const ContexteAuthentification = createContext<ValeurContexteAuthentification | null>(null);

export function FournisseurAuthentification({ children }: { children: ReactNode }) {
  const [utilisateur, definirUtilisateur] = useState<User | null>(null);
  const [profil, definirProfil] = useState<ProfilUtilisateur | null>(null);
  const [chargement, definirChargement] = useState(true);
  const inscriptionEnCours = useRef(false);

  useEffect(() => {
    const seDesabonner = ecouterAuthentification(async (utilisateurCourant) => {
      definirUtilisateur(utilisateurCourant);
      if (!utilisateurCourant) {
        definirProfil(null);
        definirChargement(false);
        return;
      }
      if (inscriptionEnCours.current) {
        definirChargement(false);
        return;
      }
      try {
        definirProfil(await recupererProfil(utilisateurCourant));
      } catch {
        definirProfil({
          id: utilisateurCourant.uid,
          nom: utilisateurCourant.displayName ?? 'Utilisateur',
          photoUrl: utilisateurCourant.photoURL,
        });
      } finally {
        definirChargement(false);
      }
    });
    return seDesabonner;
  }, []);

  const seConnecter = useCallback(async (email: string, motDePasse: string) => {
    await connecter(email, motDePasse);
  }, []);

  const sInscrire = useCallback(async (nom: string, email: string, motDePasse: string) => {
    inscriptionEnCours.current = true;
    try {
      const nouvelUtilisateur = await inscrire(nom, email, motDePasse);
      definirProfil({ id: nouvelUtilisateur.uid, nom: nom.trim(), photoUrl: null });
    } finally {
      inscriptionEnCours.current = false;
    }
  }, []);

  const seDeconnecter = useCallback(async () => {
    await deconnecter();
  }, []);

  const changerPhotoProfil = useCallback(
    async (uri: string) => {
      if (!utilisateur) {
        return;
      }
      const photoUrl = await mettreAJourPhotoProfil(utilisateur, uri);
      definirProfil((profilCourant) => (profilCourant ? { ...profilCourant, photoUrl } : profilCourant));
    },
    [utilisateur],
  );

  const valeur = useMemo(
    () => ({ utilisateur, profil, chargement, seConnecter, sInscrire, seDeconnecter, changerPhotoProfil }),
    [utilisateur, profil, chargement, seConnecter, sInscrire, seDeconnecter, changerPhotoProfil],
  );

  return <ContexteAuthentification.Provider value={valeur}>{children}</ContexteAuthentification.Provider>;
}

export const useAuthentification = (): ValeurContexteAuthentification => {
  const contexte = useContext(ContexteAuthentification);
  if (!contexte) {
    throw new Error('useAuthentification doit être utilisé dans un FournisseurAuthentification');
  }
  return contexte;
};
