# ECHOWILD development checklist

- [x] Foundation and overworld: two areas, collision, movement, dialogue.
- [x] Creatures and battles: starters, encounters, combat, defeat recovery.
- [x] Capture and progression: collection, party, experience, inventory.
- [x] Story and persistence: crystal quest, versioned saves, continue.
- [x] Quality: logic tests, production build, keyboard/browser verification.

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
- Quality: original title diorama, NPC markers, keyboard focus, reduced-motion support,
  clean `npm ci`, typecheck, and production build verified. Final suite contains 35 gameplay
  tests; the temporary scaffold-only script check was removed. Both development and
  production builds completed the full chapter in Chrome. Browser checks also cover
  defeat recovery, failed capture, corrupt saves, blocked storage, and 1280×720 layout.

## Local commit history

| Commit    | Checkpoint                                                 |
| --------- | ---------------------------------------------------------- |
| `fb7ec5f` | Phaser/TypeScript/Vite foundation                          |
| `70ac0b6` | Connected overworld, original graphics, movement, dialogue |
| `7ec7db9` | Starters, wild encounters, combat and experience           |
| `ec541e3` | Capture, consumable items and party management             |
| `ef93a75` | Complete crystal quest and validated local save/continue   |
| `c112cc6` | Title art, reduced motion, keyboard accessibility          |
| `6cc957a` | Consistent source/test formatting                          |

| `06fc8b5` | Original crystal favicon |
| `0297c2c` | Remove obsolete scaffold-only assertion |

## Remaining / next milestone

- Human playtesting of pacing, balance, and readability; Safari/Firefox verification.
- Sound design and music, building interiors, trainer battles, evolution, and additional content.
- Dedicated Tiled asset export/import tooling before scaling up the region.
- Recommended next slice: a third area, one trainer, and a second story objective.

No remote push or deployment has been performed.
