import { StyleSheet, View } from 'react-native';

import { CarteLeaflet } from './leaflet-map';
import type { ProprietesCarteAdresses } from './types';

export function CarteAdresses({ position, marqueurs, onSelection, style }: ProprietesCarteAdresses) {
  return (
    <View style={[styles.conteneur, style]} testID="carte-adresses">
      <CarteLeaflet
        centre={position}
        zoom={13}
        position={position}
        marqueurs={marqueurs}
        onSelection={onSelection}
        testID="carte-adresses-webview"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
  },
});
