import type { StorybookConfig } from '@storybook/react-native-web-vite';

const configuration: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-native-web-vite',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
};

export default configuration;
