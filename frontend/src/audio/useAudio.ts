import { useContext } from 'react';
import { AudioContext } from './SoundProvider';
import type { AudioContextValue } from './SoundProvider';

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error('useAudio must be used within a SoundProvider');
  }
  return ctx;
}
