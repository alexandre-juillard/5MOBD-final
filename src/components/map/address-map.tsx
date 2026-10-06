import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { couleurs, positionParDefaut } from '@/constants/theme';

import { deltaZoomVille, type ProprietesCarteAdresses } from './types';

export function CarteAdresses({ position, marqueurs, onSelection, style }: ProprietesCarteAdresses) {
  const referenceCarte = useRef<MapView>(null);

  useEffect(() => {
    if (position) {
      referenceCarte.current?.animateToRegion({ ...position, ...deltaZoomVille }, 600);
    }
  }, [position]);

  return (
    <View style={[styles.conteneur, style]} testID="carte-adresses">
      <MapView
        ref={referenceCarte}
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...(position ?? positionParDefaut), ...deltaZoomVille }}
        showsUserLocation
        showsMyLocationButton
        toolbarEnabled={false}>
        {marqueurs.map((marqueur) => (
          <Marker
            key={marqueur.id}
            identifier={marqueur.id}
            coordinate={{ latitude: marqueur.latitude, longitude: marqueur.longitude }}
            title={marqueur.titre}
            description={marqueur.description || 'Appuyez pour voir le détail'}
            pinColor={marqueur.estPersonnel ? couleurs.marqueurPerso : couleurs.marqueurPublic}
            onCalloutPress={() => onSelection(marqueur.id)}
            testID={`marqueur-${marqueur.id}`}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    overflow: 'hidden',
  },
});
