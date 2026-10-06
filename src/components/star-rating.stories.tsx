import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';

import { NoteEtoiles } from './star-rating';

const meta = {
  title: 'Composants/NoteEtoiles',
  component: NoteEtoiles,
  args: {
    note: 4,
    taille: 24,
  },
  argTypes: {
    note: { control: { type: 'range', min: 0, max: 5, step: 0.1 } },
  },
} satisfies Meta<typeof NoteEtoiles>;

export default meta;

type Histoire = StoryObj<typeof meta>;

export const LectureSeule: Histoire = {};

export const SansNote: Histoire = {
  args: { note: 0 },
};

function NoteInteractive() {
  const [note, definirNote] = useState(0);
  return <NoteEtoiles note={note} onChange={definirNote} taille={36} />;
}

export const Interactive: Histoire = {
  render: () => <NoteInteractive />,
};
