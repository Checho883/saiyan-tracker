export type SoundId =
  | 'scouter_beep'
  | 'power_up'
  | 'capsule_pop'
  | 'reveal_chime'
  | 'explosion'
  | 'radar_ping'
  | 'thunder_roar'
  | 'transform'
  | 'swoosh'
  | 'modal_open'
  | 'modal_close'
  | 'undo'
  | 'error_tone';

/**
 * Howler.js sprite map: each entry is [offset_ms, duration_ms].
 * Compiled from 13 synthesized sound effects with 100ms gaps.
 */
export const SPRITE_MAP: Record<SoundId, [number, number]> = {
  scouter_beep: [0, 267],
  power_up: [367, 500],
  capsule_pop: [967, 300],
  reveal_chime: [1367, 500],
  explosion: [1967, 1500],
  radar_ping: [3567, 640],
  thunder_roar: [4307, 2000],
  transform: [6407, 1389],
  swoosh: [7896, 200],
  modal_open: [8196, 115],
  modal_close: [8411, 214],
  undo: [8725, 417],
  error_tone: [9242, 200],
};

/** All sound IDs for iteration */
export const SOUND_IDS: SoundId[] = Object.keys(SPRITE_MAP) as SoundId[];

/** Audio sprite source paths (format preference order) */
export const SPRITE_SRC = ['/audio/sprite.webm', '/audio/sprite.mp3'];
