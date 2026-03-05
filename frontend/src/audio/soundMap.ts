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
 * Offsets are placeholders — update when real sprite sheet is compiled.
 */
export const SPRITE_MAP: Record<SoundId, [number, number]> = {
  scouter_beep: [0, 500],
  power_up: [600, 1200],
  capsule_pop: [1900, 400],
  reveal_chime: [2400, 600],
  explosion: [3100, 2000],
  radar_ping: [5200, 800],
  thunder_roar: [6100, 2500],
  transform: [8700, 3000],
  swoosh: [11800, 200],
  modal_open: [12100, 150],
  modal_close: [12350, 150],
  undo: [12600, 300],
  error_tone: [13000, 250],
};

/** All sound IDs for iteration */
export const SOUND_IDS: SoundId[] = Object.keys(SPRITE_MAP) as SoundId[];

/** Audio sprite source paths (format preference order) */
export const SPRITE_SRC = ['/audio/sprite.webm', '/audio/sprite.mp3'];
