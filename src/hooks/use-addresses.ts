import { useEffect, useState } from 'react';

import { useAuthentification } from '@/context/auth-context';
import { ecouterAdressesPubliques, ecouterMesAdresses } from '@/services/address-service';
import type { Adresse } from '@/types/models';
import { traduireErreur } from '@/utils/errors';

type EtatAdresses = {
  adresses: Adresse[];
  chargement: boolean;
  erreur: string | null;
};

const useEcouteAdresses = (
  ecouter: typeof ecouterMesAdresses,
): EtatAdresses => {
  const { utilisateur } = useAuthentification();
  const [etat, definirEtat] = useState<EtatAdresses>({ adresses: [], chargement: true, erreur: null });

  useEffect(() => {
    if (!utilisateur) {
      return;
    }
    return ecouter(
      utilisateur.uid,
      (adresses) => definirEtat({ adresses, chargement: false, erreur: null }),
      (erreur) => definirEtat({ adresses: [], chargement: false, erreur: traduireErreur(erreur) }),
    );
  }, [utilisateur, ecouter]);

  return etat;
};

export const useMesAdresses = (): EtatAdresses => useEcouteAdresses(ecouterMesAdresses);

export const useAdressesPubliques = (): EtatAdresses => useEcouteAdresses(ecouterAdressesPubliques);
