import {
  createContext,
  useCallback,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { Howl, Howler } from 'howler';
import { SPRITE_MAP, SPRITE_SRC } from './soundMap';
import type { SoundId } from './soundMap';
import { useSoundEffect } from './useSoundEffect';
import { useRewardStore } from '../store/rewardStore';

export interface AudioContextValue {
  play: (soundId: SoundId) => void;
  toggleMute: () => void;
  isMuted: boolean;
}

export const AudioContext = createContext<AudioContextValue | null>(null);

/** Auto-subscribes to animation events and plays corresponding sounds */
function SoundEffectListener() {
  useSoundEffect();
  return null;
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const howlRef = useRef<Howl | null>(null);
  const [isMuted, setIsMuted] = useState(true); // Sound OFF by default
  const initializedRef = useRef(false);
  const soundEnabled = useRewardStore((s) => s.settings?.sound_enabled);

  // Lazy-initialize Howl on first play (respects browser autoplay policy)
  const initAudio = useCallback(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    howlRef.current = new Howl({
      src: SPRITE_SRC,
      sprite: SPRITE_MAP,
      preload: true,
      html5: false, // Web Audio API required for sprite support
    });
  }, []);

  const play = useCallback(
    (soundId: SoundId) => {
      if (isMuted) return;
      initAudio();
      if (!howlRef.current) return;
      const id = howlRef.current.play(soundId);
      // playbackRate variation: 0.9-1.1 to prevent monotony (AUDIO-09)
      const rate = 0.9 + Math.random() * 0.2;
      howlRef.current.rate(rate, id);
    },
    [isMuted, initAudio],
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      Howler.mute(newMuted);
      useRewardStore.getState().updateSettings({ sound_enabled: !newMuted });
      return newMuted;
    });
  }, []);

  // Sync mute state from backend settings
  useEffect(() => {
    if (soundEnabled !== undefined) {
      const shouldMute = !soundEnabled;
      setIsMuted(shouldMute);
      Howler.mute(shouldMute);
    }
  }, [soundEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (howlRef.current) {
        howlRef.current.unload();
        howlRef.current = null;
        initializedRef.current = false;
      }
    };
  }, []);

  return (
    <AudioContext.Provider value={{ play, toggleMute, isMuted }}>
      <SoundEffectListener />
      {children}
    </AudioContext.Provider>
  );
}
