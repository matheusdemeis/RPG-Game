# ECHOWILD development checklist

- [x] Foundation and overworld: two areas, collision, movement, dialogue.
- [x] Creatures and battles: starters, encounters, combat, defeat recovery.
- [x] Capture and progression: collection, party, experience, inventory.
- [x] Story and persistence: crystal quest, versioned saves, continue.
- [ ] Quality: logic tests, production build, keyboard/browser verification.

Local development only. Original code-authored pixel art; no external game assets.

## Checkpoints

- Foundation: strict TypeScript, Phaser 4.2.1, Vite, Vitest; production build passes.
- Overworld: Tiled JSON layers, both area exits, three NPCs, journal, keyboard movement.
  Six tests pass; headless Chrome renders both title and world without runtime errors.
- Battles: three starters, four moves, type matchups, speed, HP, experience, recovery.
  Sixteen tests pass; Chrome completed starter selection, travel, and a wild victory.
- Capture: health-based probability, finite prisms/tonics, party lead selection, automatic
  fainted-leader replacement. Twenty-three tests pass. Browser verified failed and successful capture.
- Story/save: complete crystal investigation and report, repeat-safe rewards, manual local
  save, continue, new-game confirmation, corruption/storage handling. Thirty-six tests pass.
  Chrome completed the entire chapter and verified party/items/position after page reload.
