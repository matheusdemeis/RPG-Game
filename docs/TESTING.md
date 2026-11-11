# Validation and playtest guide

Run `npm run typecheck`, `npm test`, and `npm run build` before a change is committed. Run `npm run dev` to test the actual game. A passing build does not establish gameplay correctness.

## Verified for the initial release

- `npm ci`, `npm run dev`, `npm run typecheck`, `npm test` (35 tests), `npm run build`, and `npm run preview` pass.
- Headless Chrome completed starter selection, map travel, a wild victory, failed/successful capture, crystal investigation, quest completion, save/reload/continue, and party lead selection.
- A separate production-bundle playthrough completed the chapter, including combat, capture, escape, and save/reload. The production bundle does not expose the development inspector.
- Browser checks cover dialogue movement lock, journal Tab focus, new-game cancellation, corrupt save rejection, unavailable storage, WASD, defeat recovery, reduced-motion mode, and desktop layouts down to 1280×720.
- No JavaScript runtime errors occurred in the passing browser checks. Capture branch tests use controlled random rolls; the passing production playthrough used normal randomness.

Still recommended: hands-on pacing/balance playtesting and Safari/Firefox checks. There is no mobile/touch control implementation.

## Automated logic coverage

- Reachable exits and NPCs in both areas; solid objects; Tiled layer dimensions.
- Multi-line dialogue completion and callback idempotence.
- Type cycle, damage scaling, speed order/ties, misses, recovery, victory/defeat, no rewards after battle end.
- Experience carryover, multiple levels, level cap, HP growth.
- Encounter gating, first-encounter guarantee, post-battle protection.
- Capture probability, finite items, failed-turn retaliation, collection limits, party switching.
- Ordered quest events and idempotent completion.
- Save round trips, malformed JSON, versions, positions, invalid stats, IDs, inventory, unknown fields, and unavailable storage.

## Manual regression route

- New game: continue is disabled without a save. Start and interact with all three NPCs.
- Try WASD and arrows; walk into each obstacle type and an NPC. Verify four facing directions and camera follow.
- Check that dialogue and the journal prevent movement. Use both E/Space and mouse controls.
- Choose each starter in separate runs. Reach Whispering Trail and play a battle using all four moves.
- Attempt a capture at full and low HP. Check success, failure, depleted supplies, and collection membership.
- Use a tonic; verify full-health/empty-inventory restrictions. Escape a battle and return to the map.
- Faint one creature with a backup; then lose with no healthy companions. Verify party replacement and recovery in Willowmere.
- Investigate the crystal before and after resolving a battle. Complete the report to Liora. Talk again to ensure the quest reward is not repeated.
- Change the party leader. Save with multiple creatures and altered HP/experience/items, reload, and continue. Compare values and position.
- Start a new game with an existing save, cancel, then confirm. The old slot remains until the new game is saved.
- Test a corrupt save in a disposable browser profile. Verify the message, disabled Continue, and working New journey.
- Block LocalStorage in a disposable profile. The game must still run; failed saves must display feedback.
- Check 1280×720, 1440×900, and 1920×1080. Check browser zoom, button focus, and reduced-motion preference.

Browser QA uses temporary Playwright scripts outside the repository and the installed Chrome binary. Deterministic random rolls are used for specific capture branches; movement, dialogue, battle buttons, quest actions, and save/load run through the real UI. The development build exposes `window.__ECHOWILD__` for inspection; production omits it.

## November 11 visual/UX revision

The current suite contains **41 passing tests**, including six new battle-event tests:
ordered/detached HP snapshots, final hit → faint → reward sequencing, healing before
retaliation, misses without damage, capture before experience, and separate fainted/incoming
party-leader snapshots. Battle rules still return their original text results.

Rechecked `npm run dev`, `npm run typecheck`, `npm run test`, and `npm run build`.
Chrome completed the revised chapter in development and in the production bundle. The
production playthrough used normal randomness and verified combat, capture, escape, quest
completion, and save/reload. No JavaScript runtime errors occurred in the passing checks.

Targeted browser checks also verified:

- HP presentation waits for each combatant's event; inputs remain disabled while a turn resolves.
- Distinct damage, healing, miss, failed-capture and successful-capture feedback.
- Dialogue Space advances exactly one line, and portraits/progress remain visible.
- Journal Tab navigation and Save focus survive panel refreshes without escaping the dialog.
- Starter selection and journal layout fit at 1280×720; title, both maps and battle art were visually reviewed.
- Existing corruption/unavailable-storage behavior, defeat recovery, WASD and reduced-motion mode still work.

Manual review remains useful for preferred text speed, long sessions with a large collection,
and cross-browser rendering. No new audio or mobile control system was introduced.
