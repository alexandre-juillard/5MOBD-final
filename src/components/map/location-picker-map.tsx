import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { couleurs, positionParDefaut } from '@/constants/theme';

import { deltaZoomRue, type ProprietesSelecteurEmplacement } from './types';

export function SelecteurEmplacement({ emplacement, centre, onChange, style }: ProprietesSelecteurEmplacement) {
  const referenceCarte = useRef<MapView>(null);

  useEffect(() => {
    if (centre) {
      referenceCarte.current?.animateToRegion({ ...centre, ...deltaZoomRue }, 500);
    }
  }, [centre]);

  return (
    <View style={[styles.conteneur, style]} testID="selecteur-emplacement">
      <MapView
        ref={referenceCarte}
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...(centre ?? emplacement ?? positionParDefaut), ...deltaZoomRue }}
        showsUserLocation
        toolbarEnabled={false}
        onPress={(evenement) => onChange(evenement.nativeEvent.coordinate)}>
        {emplacement ? (
          <Marker
            coordinate={emplacement}
            draggable
            pinColor={couleurs.marqueurPerso}
            onDragEnd={(evenement) => onChange(evenement.nativeEvent.coordinate)}
          />
        ) : null}
      </MapView>
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
