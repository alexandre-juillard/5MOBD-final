import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import type { Coordonnees } from '@/types/models';

export type EtatLocalisation = {
  position: Coordonnees | null;
  autorisationRefusee: boolean;
  chargement: boolean;
  actualiser: () => Promise<Coordonnees | null>;
};

export const obtenirPositionActuelle = async (): Promise<Coordonnees | null> => {
  const { status: statut } = await Location.requestForegroundPermissionsAsync();
  if (statut !== 'granted') {
    return null;
  }
  const derniere = await Location.getLastKnownPositionAsync().catch(() => null);
  try {
    const actuelle = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitude: actuelle.coords.latitude, longitude: actuelle.coords.longitude };
  } catch {
    return derniere ? { latitude: derniere.coords.latitude, longitude: derniere.coords.longitude } : null;
  }
};

export const useLocalisation = (): EtatLocalisation => {
  const [position, definirPosition] = useState<Coordonnees | null>(null);
  const [autorisationRefusee, definirAutorisationRefusee] = useState(false);
  const [chargement, definirChargement] = useState(true);

  const appliquerPosition = useCallback((nouvellePosition: Coordonnees | null) => {
    definirAutorisationRefusee(nouvellePosition === null);
    if (nouvellePosition) {
      definirPosition(nouvellePosition);
    }
    definirChargement(false);
  }, []);

  const actualiser = useCallback(async () => {
    definirChargement(true);
    const nouvellePosition = await obtenirPositionActuelle().catch(() => null);
    appliquerPosition(nouvellePosition);
    return nouvellePosition;
  }, [appliquerPosition]);

  useEffect(() => {
    let actif = true;
    obtenirPositionActuelle()
      .catch(() => null)
      .then((nouvellePosition) => {
        if (actif) {
          appliquerPosition(nouvellePosition);
        }
      });
    return () => {
      actif = false;
    };
  }, [appliquerPosition]);

  return { position, autorisationRefusee, chargement, actualiser };
};
