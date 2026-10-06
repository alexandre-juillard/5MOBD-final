import { useEffect } from 'react';
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { StyleSheet, View } from 'react-native';

import { couleurs, positionParDefaut } from '@/constants/theme';
import type { Coordonnees } from '@/types/models';

import { chargerStyleLeaflet } from './leaflet-style';
import type { ProprietesSelecteurEmplacement } from './types';

chargerStyleLeaflet();

const attributionOsm = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function GestionCarte({
  centre,
  onChange,
}: {
  centre: Coordonnees | null;
  onChange: (coordonnees: Coordonnees) => void;
}) {
  const carte = useMap();
  useEffect(() => {
    if (centre) {
      carte.setView([centre.latitude, centre.longitude], 16);
    }
  }, [carte, centre]);
  useMapEvents({
    click: (evenement) => onChange({ latitude: evenement.latlng.lat, longitude: evenement.latlng.lng }),
  });
  return null;
}

export function SelecteurEmplacement({ emplacement, centre, onChange, style }: ProprietesSelecteurEmplacement) {
  const depart = centre ?? emplacement ?? positionParDefaut;
  return (
    <View style={[styles.conteneur, style]} testID="selecteur-emplacement">
      <MapContainer center={[depart.latitude, depart.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution={attributionOsm} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <GestionCarte centre={centre} onChange={onChange} />
        {emplacement ? (
          <CircleMarker
            center={[emplacement.latitude, emplacement.longitude]}
            radius={10}
            pathOptions={{ color: couleurs.blanc, weight: 2, fillColor: couleurs.marqueurPerso, fillOpacity: 0.95 }}
          />
        ) : null}
      </MapContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
