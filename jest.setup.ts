import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('@/config/firebase', () => ({
  authentification: { currentUser: null },
  baseDeDonnees: {},
  stockage: {},
  estFirebaseConfigure: true,
}));

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getLastKnownPositionAsync: jest.fn(async () => null),
  getCurrentPositionAsync: jest.fn(async () => ({ coords: { latitude: 48.85, longitude: 2.35 } })),
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchCameraAsync: jest.fn(async () => ({ canceled: true, assets: null })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: null })),
}));

jest.mock('expo-image-manipulator', () => ({
  SaveFormat: { JPEG: 'jpeg' },
  ImageManipulator: {
    manipulate: jest.fn(() => ({
      resize: jest.fn(),
      renderAsync: jest.fn(async () => ({
        saveAsync: jest.fn(async () => ({ uri: 'file://compressee.jpg' })),
      })),
    })),
  },
}));

jest.mock('react-native-maps', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  const MapView = React.forwardRef((proprietes: Record<string, unknown>, reference: unknown) => {
    React.useImperativeHandle(reference, () => ({ animateToRegion: jest.fn() }));
    return React.createElement(View, { ...proprietes, testID: proprietes.testID ?? 'map-view' });
  });
  const Marker = (proprietes: Record<string, unknown>) => React.createElement(View, proprietes);
  return { __esModule: true, default: MapView, Marker };
});
