import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { informer } from './dialogs';

export type SourceImage = 'galerie' | 'camera';

const optionsSelection: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  quality: 0.8,
};

export const choisirImage = async (source: SourceImage): Promise<string | null> => {
  if (source === 'camera' && Platform.OS !== 'web') {
    const autorisation = await ImagePicker.requestCameraPermissionsAsync();
    if (!autorisation.granted) {
      informer('Autorisation refusée', "L'accès à l'appareil photo est nécessaire pour prendre une photo.");
      return null;
    }
    const resultat = await ImagePicker.launchCameraAsync(optionsSelection);
    return resultat.canceled ? null : resultat.assets[0]?.uri ?? null;
  }
  if (Platform.OS !== 'web') {
    const autorisation = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!autorisation.granted) {
      informer('Autorisation refusée', "L'accès à la galerie est nécessaire pour choisir une photo.");
      return null;
    }
  }
  const resultat = await ImagePicker.launchImageLibraryAsync(optionsSelection);
  return resultat.canceled ? null : resultat.assets[0]?.uri ?? null;
};
