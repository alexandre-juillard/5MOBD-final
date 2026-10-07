import { StyleSheet, View } from 'react-native';

import { CarteLeaflet } from './leaflet-map';
import type { ProprietesSelecteurEmplacement } from './types';

export function SelecteurEmplacement({ emplacement, centre, onChange, style }: ProprietesSelecteurEmplacement) {
  return (
    <View style={[styles.conteneur, style]} testID="selecteur-emplacement">
      <CarteLeaflet
        centre={centre}
        zoom={16}
        emplacement={emplacement}
        onClic={onChange}
        testID="selecteur-emplacement-webview"
      />
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
