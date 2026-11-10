# ECHOWILD development checklist

- [x] Foundation and overworld: two areas, collision, movement, dialogue.
- [ ] Creatures and battles: starters, encounters, combat, defeat recovery.
- [ ] Capture and progression: collection, party, experience, inventory.
- [ ] Story and persistence: crystal quest, versioned saves, continue.
- [ ] Quality: logic tests, production build, keyboard/browser verification.

Local development only. Original code-authored pixel art; no external game assets.

## Checkpoints

- Foundation: strict TypeScript, Phaser 4.2.1, Vite, Vitest; production build passes.
- Overworld: Tiled JSON layers, both area exits, three NPCs, journal, keyboard movement.
  Six tests pass; headless Chrome renders both title and world without runtime errors.
