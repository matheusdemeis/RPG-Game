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
| `06fc8b5` | Original crystal favicon                                   |
| `0297c2c` | Remove obsolete scaffold-only assertion                    |

## Remaining / next milestone

- Human playtesting of pacing, balance, and readability; Safari/Firefox verification.
- Sound design and music, building interiors, trainer battles, evolution, and additional content.
- Dedicated Tiled asset export/import tooling before scaling up the region.
- Recommended next slice: a third area, one trainer, and a second story objective.

No remote push or deployment has been performed.

## Visual and UX refinement — November 11, 2026

- [x] Terrain: authored planting zones, textured path borders, shoreline reeds and lily pads,
      timber bridge, canopy silhouettes, cottage detail, and cached ground shadows.
- [x] Characters: 48 original facing/stride frames, distinct outfits and silhouettes,
      improved side/back views, and NPCs facing the player during conversations.
- [x] Battles: layered clearing, entrances, ordered presentation snapshots, animated HP,
      move selection feedback, hit/heal/miss cues, capture effects, and faint/switch/reward moments.
- [x] Interface: shared teal/cream surfaces, larger detail text, portraits and dialogue
      progress, scoped keyboard focus, save feedback, and reduced-motion behavior.
- [x] Title: refined composition, grounded companions, slow clouds, foreground parallax,
      crystal ambience, and a guarded fade into the adventure.
- [x] Verification: 41 tests, strict typecheck, development server, production build,
      complete Chrome playthroughs, visual review at 1440×1000 and 1280×720, and focus/storage checks.

Gameplay rules, encounter probabilities, collision geometry, content scope, and the version-1
save format are preserved. No runtime dependencies or external art assets were added.
Terrain decoration is baked once per map; ambient effects honor reduced motion.

| Commit    | Refinement                                                 |
| --------- | ---------------------------------------------------------- |
| `ee17998` | Terrain, planting, scenery details and shadows             |
| `df73bea` | Character silhouettes, stride frames and NPC facing        |
| `74be451` | Typed, ordered battle snapshots with six regression tests  |
| `6bba65f` | Battle staging, feedback and encounter transitions         |
| `6f105d9` | Consistent panels, readable details and dialogue portraits |
| `9db4021` | Title atmosphere, parallax and transition polish           |
| `749b283` | Keep keyboard focus within the active dialog               |

Remaining polish opportunities: more hand-shaped terrain contours, richer creature poses,
small narrative environmental props, hands-on pacing review, and Safari/Firefox verification.
These are refinements to the existing slice, not prerequisites for playing the chapter.
