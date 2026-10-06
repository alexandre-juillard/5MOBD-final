import type { Preview } from '@storybook/react-native-web-vite';
import { View } from 'react-native';

import { couleurs } from '../src/constants/theme';

const apercu: Preview = {
  decorators: [
    (Histoire) => (
      <View style={{ padding: 16, backgroundColor: couleurs.fond, maxWidth: 480 }}>
        <Histoire />
      </View>
    ),
  ],
  parameters: {
    layout: 'padded',
    controls: {
      matchers: {
        color: /(background|color)$/i,
      },
    },
  },
};

export default apercu;
