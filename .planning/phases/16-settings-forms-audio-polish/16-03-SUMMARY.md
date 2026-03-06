---
phase: 16-settings-forms-audio-polish
plan: 03
status: complete
started: 2026-03-07
completed: 2026-03-07
---

# Plan 16-03 Summary: Audio Sprite Replacement

## What Changed
- Generated 13 distinct game-style sounds using ffmpeg synthesis (sine waves, noise, tremolo, vibrato, filters)
- Compiled sprite.mp3 (236KB, 192kbps) and sprite.webm (81KB, opus 128kbps) from individual WAV files
- Updated SPRITE_MAP offsets in soundMap.ts to match actual compiled durations
- Total sprite duration: ~9.4 seconds with 100ms gaps between sounds

## Sound Inventory
| SoundId | Duration | Character |
|---------|----------|-----------|
| scouter_beep | 267ms | Rising electronic beep |
| power_up | 500ms | Rising energy sweep with vibrato |
| capsule_pop | 300ms | Pink noise pop with highpass |
| reveal_chime | 500ms | Tremolo sine bell chime |
| explosion | 1500ms | Brown noise low boom |
| radar_ping | 640ms | Sine ping with echo |
| thunder_roar | 2000ms | Brown noise rolling thunder |
| transform | 1389ms | Dramatic vibrato power surge |
| swoosh | 200ms | Bandpass white noise whoosh |
| modal_open | 115ms | Quick ascending sine tap |
| modal_close | 214ms | Quick descending sine tap |
| undo | 417ms | Descending two-tone |
| error_tone | 200ms | Dissonant tremolo buzz |

## Key Files
- `frontend/public/audio/sprite.mp3` — MP3 format sprite sheet
- `frontend/public/audio/sprite.webm` — WebM/Opus format sprite sheet
- `frontend/src/audio/soundMap.ts` — updated SPRITE_MAP offsets

## Self-Check: PASSED
- [x] sprite.mp3 exists with non-zero size (236KB)
- [x] sprite.webm exists with non-zero size (81KB)
- [x] All 13 SoundIds have distinct synthesized sounds
- [x] SPRITE_MAP offsets computed from actual durations
- [x] TypeScript compiles cleanly
- [x] No temporary build files
