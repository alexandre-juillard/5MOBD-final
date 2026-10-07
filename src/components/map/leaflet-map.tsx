import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { couleurs, positionParDefaut } from '@/constants/theme';
import type { Coordonnees } from '@/types/models';

import {
  analyserMessageCarte,
  construireScriptMiseAJour,
  construireScriptRecentrage,
  genererHtmlCarte,
} from './leaflet-html';
import type { MarqueurCarte } from './types';

export type ProprietesCarteLeaflet = {
  centre: Coordonnees | null;
  zoom: number;
  position?: Coordonnees | null;
  marqueurs?: MarqueurCarte[];
  emplacement?: Coordonnees | null;
  onSelection?: (id: string) => void;
  onClic?: (coordonnees: Coordonnees) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function CarteLeaflet({
  centre,
  zoom,
  position = null,
  marqueurs = [],
  emplacement = null,
  onSelection,
  onClic,
  style,
  testID,
}: ProprietesCarteLeaflet) {
  const referenceWebView = useRef<WebView>(null);
  const [pret, definirPret] = useState(false);
  const [centreInitial] = useState(() => centre ?? positionParDefaut);
  const selectionnable = Boolean(onClic);

  const html = useMemo(
    () => genererHtmlCarte({ centre: centreInitial, zoom, selectionnable }),
    [centreInitial, zoom, selectionnable],
  );

  useEffect(() => {
    if (pret) {
      referenceWebView.current?.injectJavaScript(construireScriptMiseAJour({ position, marqueurs, emplacement }));
    }
  }, [pret, position, marqueurs, emplacement]);

  useEffect(() => {
    if (pret && centre) {
      referenceWebView.current?.injectJavaScript(construireScriptRecentrage(centre, zoom));
    }
  }, [pret, centre, zoom]);

  const recevoirMessage = (evenement: WebViewMessageEvent) => {
    const message = analyserMessageCarte(evenement.nativeEvent.data);
    if (!message) {
      return;
    }
    if (message.type === 'pret') {
      definirPret(true);
    } else if (message.type === 'selection') {
      onSelection?.(message.id);
    } else {
      onClic?.({ latitude: message.latitude, longitude: message.longitude });
    }
  };

  return (
    <View style={[styles.conteneur, style]}>
      <WebView
        ref={referenceWebView}
        source={{ html, baseUrl: 'https://mesbonnesadresses.app/' }}
        originWhitelist={['*']}
        onMessage={recevoirMessage}
        javaScriptEnabled
        domStorageEnabled
        nestedScrollEnabled
        setSupportMultipleWindows={false}
        style={styles.webView}
        testID={testID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: couleurs.fond,
  },
  webView: {
    flex: 1,
    backgroundColor: couleurs.fond,
  },
});
