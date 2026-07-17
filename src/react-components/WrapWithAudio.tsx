import { createContext } from 'react';

export interface AudioContext {
  playSound?: (sound: string) => void;
}

export const AudioContext = createContext<AudioContext>({});
