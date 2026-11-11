# ECHOWILD

An original, client-side monster-taming RPG set in Auralis. Explore Willowmere Village and Whispering Trail, choose a companion, battle and befriend wild creatures, and discover the meaning of a mysterious crystal's song.

## Run locally

Use **Node.js 24 LTS** (see `.nvmrc`) and npm.

```bash
nvm install             # optional: install/use the .nvmrc version with nvm
npm ci
npm run dev
```

Open the Local URL printed by Vite (normally **http://127.0.0.1:5173/**).

```bash
npm run typecheck       # strict TypeScript
npm test                # pure game-logic tests
npm run build           # typecheck + production bundle in dist/
npm run preview         # serve the production bundle locally
```

No account, API keys, backend, or external asset downloads are required at runtime. Phaser is the only runtime dependency. Dependencies are pinned in `package-lock.json`. The implementation was also checked on the workspace's Node 23.11.0, but Vitest officially supports LTS Node 22/24 rather than Node 23; use Node 24 for development.

## Play the opening chapter

1. Start a **New journey**. Walk north and slightly left to **Dr. Liora**, outside the blue-roofed laboratory.
2. Press **E** or **Space** beside her. Advance the conversation and choose Solkit, Brooklet, or Mossling.
3. Follow the main path north into **Whispering Trail**. Ranger Fen, west of the path, explains combat.
4. Walk through the tall grass. Choose moves or use **Echo Prisms** to befriend a wild creature. Lower HP improves capture probability; fainted creatures cannot be captured.
5. After winning or capturing, follow the path north. Interact with the crystal from the southern edge of its clearing.
6. Return to Dr. Liora to complete **The Crystal Disturbance**.
7. Open the journal and choose **Save journey**. Reload the page and choose **Continue journey**.

You can keep exploring after the ending. Liora heals all companions and restores a minimum supply of prisms and tonics for free. Defeat returns you safely to Willowmere with your companions healed. There is no permanent creature loss.

| Control                        | Action                             |
| ------------------------------ | ---------------------------------- |
| WASD / arrow keys              | Walk and face in four directions   |
| E / Space                      | Interact; advance dialogue         |
| Tab                            | Open journal                       |
| Escape                         | Close journal; leave a wild battle |
| 1–4                            | Choose a battle move               |
| C                              | Offer an Echo Prism                |
| T                              | Use a meadow tonic                 |
| E after battle                 | Return to exploration              |
| Mouse / keyboard focus + Enter | Activate interface buttons         |

The journal shows all owned creatures, their stats and experience, and lets you choose a healthy leader. A healthy companion automatically replaces a fainted leader during battle. The MVP collection holds up to 60 creatures, with one active battler.

**Saving is manual.** Use Save journey or Save & title. One versioned save slot is stored under `echowild.save.v1` in this browser's LocalStorage. Origin/port changes, private browsing, or clearing browser data can affect access to that save. New journey asks for confirmation when a valid save exists, and does not replace it until you save the new game. Invalid saves are rejected with a visible message rather than crashing the game.

## Architecture

- `src/main.ts`: Phaser 4 initialization, pixel scaling, scene registration.
- `src/game/scenes/`: boot, title, overworld, and battle orchestration.
- `src/game/state/GameSession.ts`: a single typed session owned by Phaser's registry; no module-global mutable game state.
- `src/game/systems/`: pure combat, capture, experience, encounter, quest, dialogue, and save rules.
- `src/game/data/creatures.ts` and `moves.ts`: data-driven species, statistics, and moves.
- `src/game/data/maps/index.ts`: map content, collision queries, NPCs, exits, and a standard orthogonal **Tiled JSON** adapter. Phaser loads the generated Ground layer using its Tiled parser; Collision and Objects layers retain editor-compatible semantics.
- `src/game/art/`: original pixel graphics authored in code, generated once into Phaser textures. No borrowed creature sprites or game assets.
- `src/game/ui/UI.ts`: semantic HTML controls over the Phaser canvas, with scoped event handlers; no UI framework.
- `tests/`: deterministic unit tests for navigation, combat, captures, progression, dialogue, quest transitions, and save validation.

Rendering never performs damage or capture calculations. `BattleSystem` accepts a random-number function for deterministic testing. Quest progress is an explicit state machine. Save validation constructs a fresh canonical state and verifies IDs, numeric bounds, walkable positions, and quest/party consistency.

The visual refinement keeps this structure: `art/terrain.ts` bakes decorative borders, planting and shadows from `data/maps/decoration.ts`; `art/characters.ts` generates 48 facing/stride frames; `art/battlefield.ts` stages the forest clearing; and `ui/BattleEffects.ts` presents ordered snapshots emitted by the battle rules. Original graphics are generated locally, with no extra runtime dependencies. Atmosphere and transitions respect reduced motion, and the existing save format and collision geometry are unchanged.

## Scope and next steps

The first chapter is a complete vertical slice: two exterior areas, three original species, repeatable wild encounters, combat, capture, progression, party management, a quest ending, and local saves. Buildings are scenery; this release has no interiors, trainer battles, evolution, sound/music, online services, or mobile touch controls.

Recommended next milestone: playtest balance and map density, then add a third area with a trainer encounter and a small second quest. Add exported tileset/map authoring tools before expanding content significantly. See [the roadmap](docs/ROADMAP.md) and [manual checks](docs/TESTING.md).
