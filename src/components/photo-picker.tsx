import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { couleurs, espacements, rayons } from '@/constants/theme';
import type { SourceImage } from '@/utils/image-picker';

export type ProprietesSelecteurPhoto = {
  uri: string | null;
  libelle?: string;
  onChoisir: (source: SourceImage) => void;
  onRetirer?: () => void;
  desactive?: boolean;
  testID?: string;
};

export function SelecteurPhoto({
  uri,
  libelle = 'Photo',
  onChoisir,
  onRetirer,
  desactive = false,
  testID = 'selecteur-photo',
}: ProprietesSelecteurPhoto) {
  const cameraDisponible = Platform.OS !== 'web';
  return (
    <View style={styles.conteneur} testID={testID}>
      <Text style={styles.libelle}>{libelle}</Text>
      {uri ? (
        <View>
          <Image source={{ uri }} style={styles.apercu} accessibilityLabel="Aperçu de la photo" testID={`${testID}-apercu`} />
          {onRetirer ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retirer la photo"
              onPress={onRetirer}
              disabled={desactive}
              style={styles.retirer}
              testID={`${testID}-retirer`}>
              <Text style={styles.retirerTexte}>✕</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choisir dans la galerie"
          disabled={desactive}
          onPress={() => onChoisir('galerie')}
          style={[styles.action, desactive && styles.inactif]}
          testID={`${testID}-galerie`}>
          <Text style={styles.actionTexte}>🖼️ Galerie</Text>
        </Pressable>
        {cameraDisponible ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Prendre une photo"
            disabled={desactive}
            onPress={() => onChoisir('camera')}
            style={[styles.action, desactive && styles.inactif]}
            testID={`${testID}-camera`}>
            <Text style={styles.actionTexte}>📷 Appareil photo</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    marginBottom: espacements.m,
  },
  libelle: {
    fontSize: 14,
    fontWeight: '600',
    color: couleurs.texte,
    marginBottom: espacements.xs,
  },
  apercu: {
    width: '100%',
    height: 180,
    borderRadius: rayons.m,
    backgroundColor: couleurs.bordure,
    marginBottom: espacements.s,
  },
  retirer: {
    position: 'absolute',
    top: espacements.s,
    right: espacements.s,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retirerTexte: {
    color: couleurs.blanc,
    fontSize: 16,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: espacements.s,
  },
  action: {
    flex: 1,
    minHeight: 44,
    borderRadius: rayons.m,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: couleurs.secondaire,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: couleurs.surface,
  },
  actionTexte: {
    color: couleurs.secondaire,
    fontWeight: '600',
  },
  inactif: {
    opacity: 0.5,
  },
});
