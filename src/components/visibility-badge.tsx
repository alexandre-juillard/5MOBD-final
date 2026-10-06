import { StyleSheet, Text, View } from 'react-native';

import { couleurs, espacements, rayons } from '@/constants/theme';

export type ProprietesBadgeVisibilite = {
  estPublique: boolean;
};

export function BadgeVisibilite({ estPublique }: ProprietesBadgeVisibilite) {
  return (
    <View style={[styles.badge, estPublique ? styles.publique : styles.privee]}>
      <Text style={[styles.texte, estPublique ? styles.textePublique : styles.textePrivee]}>
        {estPublique ? 'Publique' : 'Privée'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: espacements.s,
    paddingVertical: 2,
    borderRadius: rayons.rond,
  },
  publique: {
    backgroundColor: '#DDF1F4',
  },
  privee: {
    backgroundColor: '#F1E7E4',
  },
  texte: {
    fontSize: 12,
    fontWeight: '700',
  },
  textePublique: {
    color: couleurs.secondaire,
  },
  textePrivee: {
    color: couleurs.primaireFonce,
  },
});
