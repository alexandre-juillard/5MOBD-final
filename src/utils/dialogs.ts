import { Alert, Platform } from 'react-native';

export const confirmer = (titre: string, message: string, libelleConfirmation = 'Confirmer'): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return Promise.resolve(globalThis.confirm ? globalThis.confirm(`${titre}\n\n${message}`) : true);
  }
  return new Promise((resoudre) => {
    Alert.alert(titre, message, [
      { text: 'Annuler', style: 'cancel', onPress: () => resoudre(false) },
      { text: libelleConfirmation, style: 'destructive', onPress: () => resoudre(true) },
    ]);
  });
};

export const informer = (titre: string, message: string): void => {
  if (Platform.OS === 'web') {
    globalThis.alert?.(`${titre}\n\n${message}`);
    return;
  }
  Alert.alert(titre, message);
};
