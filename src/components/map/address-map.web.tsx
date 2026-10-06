import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { StyleSheet, View } from 'react-native';

import { couleurs, positionParDefaut } from '@/constants/theme';
import type { Coordonnees } from '@/types/models';

import { chargerStyleLeaflet } from './leaflet-style';
import type { ProprietesCarteAdresses } from './types';

chargerStyleLeaflet();

const attributionOsm = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function Recentrage({ position }: { position: Coordonnees | null }) {
  const carte = useMap();
  useEffect(() => {
    if (position) {
      carte.setView([position.latitude, position.longitude], 13);
    }
  }, [carte, position]);
  return null;
}

export function CarteAdresses({ position, marqueurs, onSelection, style }: ProprietesCarteAdresses) {
  const centre = position ?? positionParDefaut;
  return (
    <View style={[styles.conteneur, style]} testID="carte-adresses">
      <MapContainer center={[centre.latitude, centre.longitude]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution={attributionOsm} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Recentrage position={position} />
        {position ? (
          <CircleMarker
            center={[position.latitude, position.longitude]}
            radius={8}
            pathOptions={{ color: couleurs.blanc, weight: 3, fillColor: '#2F80ED', fillOpacity: 1 }}>
            <Popup>Vous êtes ici</Popup>
          </CircleMarker>
        ) : null}
        {marqueurs.map((marqueur) => (
          <CircleMarker
            key={marqueur.id}
            center={[marqueur.latitude, marqueur.longitude]}
            radius={10}
            pathOptions={{
              color: couleurs.blanc,
              weight: 2,
              fillColor: marqueur.estPersonnel ? couleurs.marqueurPerso : couleurs.marqueurPublic,
              fillOpacity: 0.95,
            }}>
            <Popup>
              <strong>{marqueur.titre}</strong>
              {marqueur.description ? <div>{marqueur.description}</div> : null}
              <button type="button" onClick={() => onSelection(marqueur.id)} style={stylesWeb.bouton}>
                Voir le détail
              </button>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </View>
  );
}

const stylesWeb = {
  bouton: {
    marginTop: 8,
    padding: '6px 10px',
    border: 'none',
    borderRadius: 6,
    background: couleurs.primaire,
    color: couleurs.blanc,
    cursor: 'pointer',
    fontWeight: 600,
  },
};

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    overflow: 'hidden',
  },
});
