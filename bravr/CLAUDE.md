# Orbital Brawl (jknowak.pl/bravr)

VR brawler for Meta Quest 2, played in the Quest Browser via WebXR. The player wears wrist weights. The original hand-speed limit (fast swings dealt no damage) was removed on request in Oct 2026: harder punches now shove enemies further. The only safety nudge left is a tutorial line about not snapping the elbow straight.

- Live: https://jknowak.pl/bravr (GitHub Pages, repo `jknowak/jknowak.github.io`, branch `main`, folder `bravr/`)
- Preview copy: Claude artifact https://claude.ai/artifact/8XVJLvVyVnMRva6Vhvvxsn. WebXR is probably blocked inside the artifact frame (not tested on a headset), so the artifact is only a menu preview. Play on jknowak.pl.
- UI language: Polish. Code comments: English.
- Domain terms (stances, shield, stun, fatality, bombs, upgrades) are defined in `CONTEXT.md`. The plan is in `BACKLOG.md`.

## Files

- `index.html` is the whole game: one file containing the menu page, CSS and the game script. No build step.
- Dependencies: three.js **r128** global UMD build from cdnjs (`THREE` global, no modules), Google Fonts (Chakra Petch, IBM Plex Sans).
- The artifact copy is the same file with the `<!doctype>/<html>/<head>/<body>` wrapper stripped and the charset/viewport metas removed. Artifacts add their own skeleton.

## Game design

- The player floats on a small platform above a planet. Armored soldiers fly in from 8–11 m (superman pose, weaving, boot thruster sparks, cruising up to 3× `SPEED` when far and braking on arrival).
- **Rings:** enemies stand on an *inner* ring (0.6 m, ±64°) that attacks, or an *outer* ring (1.05 m, ±76°) that waits, shakes fists and moves in when a gap opens (`promote`). A spot is free when the arc distance to every other enemy on that ring clears both torsos (`freeAngle`, torso radius `bodyR = 0.2 · scale · bulk`). `separate()` also pushes overlapping torsos apart every frame and keeps them ≥ 0.36 m from the player. Nobody stands still: they strafe, bob and rock (`hold`).
- **Enemy attack loop:** `windup` (`CHARGE` ≈ 2.2 s ±25%: fist pulls back, orange orb, visor heats) → `swing` (`SWING` 0.32 s lunge at your head, lands at `IMPACT` = 55%) → `recover` (`RECOVER` 0.45 s) → windup again. The swing is **blocked** if either of your hands is within 0.13 m of its fist before impact, and **dodged** if your head has moved more than 0.22 m since the swing started. Otherwise you take 1 HP (brute: 2). A landed hit is still stored as `leaks` (history compat) and shown as "Oberwałeś".
- **Player HP:** `PLAYER_HP` = 10 on the left wrist watch; **mana** (`MANA` 10, `MANA_REGEN` 0.5/s during waves) on the right one (`watches`, `drawWatches`). At 0 HP: knockout (`G.kos`), enemies blown back, HP refills, and the most recent upgrade is lost. HP and mana refill at every rest.
- **Shield and stun:** `TYPES` give shield/HP (grunt 0/10, soldier 4/20, brute 8/30). `hit(e, kind, h, at, dir)` drains the shield first (`DRAIN`), then HP (`DMG`). A punch on a shield `shove`s the enemy (`SHOVE` 5.2 m/s, about 2.2 m) into state `shoved`; it tumbles, then goes back to `approach` and flies to its front slot. The shield regenerates after 5 s without a hit. Nobody dies from a normal hit: at ≤ 10% HP `stun()` → state `stunned` for `STUN` 4 s, then any hit kills (`finish`). Chop to the neck and the rip are **fatalities** (`G.fatal`, +3 mana). An unfinished stun recovers at 25% HP with no shield. Status bars over the head and a field bubble come from `e.showStatus()`.
- **Grenades:** outer-ring (`hover`) enemies `throwBomb` (max 2 live): a lob that stops about 0.42 m in front of your chest and drifts closer until `BOMB.fuse` 2.6 s. Catch: a loose hand closing into a fist (`u.grabEv`) within 0.12 m; throw: release the grip (hand velocity × 1.3). A thrown grenade sticks to the enemy it hits, shoves it and blows 0.35 s later. A fist moving into one sets it off. `explode` hurts the player (1 HP within `BOMB.radius` 0.7 m of the chest) and `hit`s enemies with `blast`.
- **Upgrades** (`UPGRADES`, `G.ups`): each rest offers 3 cards (`offerCards`) and you punch one. `bilard` (a shoved enemy's collisions `hit` others with `bump`), `haishu` (a blade-hand backhand bats a grenade back, 1 mana), `squat` (dodging with the head ≥ 25 cm lower than at swing start gives +2 mana), `charge` (a fist still for 1 s glows; the next punch is `charged`: drain 3, double shove), `thunder` (fists slammed together in front of the chest at > 1.2 m/s closing speed, 4 mana: shields to 0 within 1 m, shove).
- Session = 6 s countdown, then N waves of work/rest (default 6 × 60 s / 30 s), then an end screen. Pull a trigger to exit at the end.
- Kills trigger brief bullet-time (`ts = 0.18` for 0.35 s, then easing back).

### Moves

| Move | Input | Rule | Damage |
|---|---|---|---|
| Cios (punch) | grip = fist | fist enters torso/head zone moving *away from the player* (velocity·away > 0.25) | 3 HP / 1 shield + shove |
| Dłoń bojowa (blade) | trigger only = blade hand | palm point through torso, head (`blade`) or neck (`neck`); 1 mana each | 4 HP, neck 6 / 2 shield; neck on a stunned enemy = decap fatality |
| Rozerwanie (rip) | both fists on a **stunned** torso | grab while both hands < 1.2 m/s, then pull them 0.3 m further apart **vertically** than at grab | fatality, torso splits at the waist |

- No upper speed limit. A hand slower than `MIN_SPEED` (0.35 m/s) doesn't register.
- **Knockback:** a non-lethal hit adds `(0.5 + min(speed,4)·0.35) / mass` m/s to the enemy's `kv` along the strike (damped, then sprung back to its spot), triggers a flinch (lean back, head snap, arms flung, twist), cuts 1.2 s off its windup and interrupts a swing.
- Per-hand cooldown per enemy: 0.5 s.
- **Stances** (`u.stance`): grip (`buttons[1]`) = `fist`, trigger (`buttons[0]`) = `blade`, nothing = `loose`; the fist wins when both are held. `u.grabEv` is true for the frame a loose hand closes.
- **Hands:** the hand models live in WebXR **grip space** (`getControllerGrip`): origin in the curled fingers, -Z along the handle towards the thumb, +X out of the back of the right hand, +Y up the forearm. `makeHand` builds the right hand (palm, 4 two-segment fingers, thumb, an 8 cm wrist-weight cuff tilted `CUFF_TILT` = 0.6 rad from +Y towards +Z, which is where the real forearm runs) and mirrors it with `scale.x = -1` for the left. **No forearm**: a straight +Y forearm made the elbows look too high. `poseHand(m, curl, blade)`. The model is rebuilt on `connected` once handedness is known. Fingers curl with `u.curl` (analog grip/trigger value, full fist when pressed). Gloves turn red with `u.blood` and drip.
- **Gore:** blood drops with gravity, chunks, meat, bone, guts and expanding blood mist (`blood`/`meat`/`guts`/`mist`). `bleed(obj, local, dir, rate, dur)` squirts from a point on a moving object (wounds, neck fountain, arm sockets, rip halves). `stump()` adds a raw cap and a bone stub. Wound splats stick to the chest (`wound`). Punch kills can tear off arms and the head. Particles are capped at 900.

### Enemies (`TYPES`)

- grunt / Szeregowy: 0 shield / 10 HP, grey, no cape
- soldier / Żołnierz: 4 / 20, black with gold trim, crest, red cape, blue field
- brute / Brutal: 8 / 30, scale 1.28, bronze trim, shoulder spikes, dark cape, red field
- The mix gets harder with wave number (`pickType`). The number alive at once is capped at `min(2 + floor(round/2), 5)`.
- Models are procedural low-poly three.js groups (`makeEnemy`): `g` (faces the player, +Z towards them) → `body` (lean) → `upper`/`lower` (split on rip), a `head` group (flies off on decap), `arms[]`/`legs[]`/`boots[]`, and `setCharge(f, showOrb)` / `dim()` helpers.
- Animation: `animate(e, gdt)` picks pose targets per state (approach/hover/windup/swing/grabbed/shoved/stunned), smooths them into `e.pose` (relative to `GUARD`) and layers `e.flinch` on top.

## Tuning constants (top of the script)

```
SPEED  = {slow:0.85, mid:1.2, fast:1.6}        // enemy flight m/s (near; up to 3x when far)
MIN_SPEED = 0.35
CHARGE = 2.2                                   // average windup before an enemy swings
SWING = 0.32, IMPACT = 0.55, RECOVER = 0.45    // enemy punch length, when it lands, pause after
PLAYER_HP = 10
MANA = 10, MANA_REGEN = 0.5
STUN = 4, SHOVE = 5.2
BOMB = {fuse:2.6, flight:1.0, radius:0.7}
DMG / DRAIN                                    // HP damage and shield drain per hit kind
RING = {inner:{d:0.6, max:64}, outer:{d:1.05, max:76}}
```

Inner-ring height is `anchor.y - 0.42 .. -0.20` (`innerDy`). Spawn cadence is `2.2 + rand*1.6 - min(round,6)*0.15` s.

## Structure of the script

settings + menu UI → three.js scene (stars, planet, platform, lights, head-following point light) → HUD canvas-texture planes (`hud`, `big`, `toast`, wrist `watches`) → hands in grip space (`hands[0..1].userData`: pos, palm, vel, speed, stance, grabEv, curl, bladeK, charged, blood, model) → WebAudio synth SFX (no audio files) → enemies + `animate` → rings, spawn, `promote` → gore (particles, `bleed`) → `hit`/`shove`/`stun`/`finish`/`kill`, enemy swing (`startSwing`, `block`, `dodged`, `hitPlayer`, `knockout`) → grenades (`throwBomb`, `updateBombs`, `explode`) → upgrades and rest cards → `updateHands` → `thunderclap` → `combat(e)` → `approach`/`hold`/`shoved`/`separate` → `updateEnemies` → `loop()` → session start/end → results + history.

- `anchor` = head position/facing captured at the start and at each wave. Enemies and the HUD are placed relative to it, so the player can turn between waves.
- Reference space: `local-floor`.

## Storage (localStorage, per device)

`ob-cfg` (settings), `ob-hist` (last 20 sessions), `ob-tab` (last menu tab). All access is wrapped in try/catch. History records made before Oct 2026 have `control` and no `blows`/`blocks`/`dodges`, and the UI shows `–` for the missing fields.

## Testing without the headset

- `window.__obPreview(mode, w, h)` renders a static scene to a flat canvas with no XR needed. Modes: `gameplay`, `swing`, `punch`, `decap`, `rip`, `stun`, `bombs`, `cards` (rest with upgrade cards), `hands` (close-up: left fist with the HP watch, right blade hand), `rest`, `done`, `roster`. Use it for screenshots (Playwright) or to eyeball models. Call it from the devtools console.
- `window.__obSim(sec, round, puncher)` runs the wave logic headlessly (still head, optional auto-jabbing right fist) and returns hits, KOs, kills, grenades thrown and `minGap` (the smallest torso clearance seen; it should stay ≥ 0).
- `window.__obDebug()` returns the internals (`G`/`setG`, `enemies`, `bombs`, `hands`, `hit`, `throwBomb`, `updateEnemies`, `updateBombs`, `thunderclap`, …) for scripted single-mechanic tests: place an enemy, fake a hand (`stance`, `pos`, `palm`, `vel`, `speed`, `grabEv`), step the updates and check the state.
- Playwright with swiftshader works for both: launch chromium with `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader` and open `index.html` via `file://`.
- For interactive testing on a PC, use **Immersive Web Emulator** (Meta's Chrome/Edge extension). It emulates a Quest with draggable controllers and buttons. Serve the folder locally (`npx serve bravr` or `python -m http.server`), because `localhost` counts as a secure context. Emulated motion is coarse, so `MIN_SPEED` and the punch-direction check can misfire.
- On the real headset, enable developer mode, connect USB, open `chrome://inspect` on the PC → inspect the Quest Browser tab for the console and live edits.

## Known gaps / next ideas

- Not yet tested on a real Quest 2. Hit radii, ring distances, block/dodge thresholds, the watch placement, `CUFF_TILT`, the grenade catch radius and the thunderclap detection probably need tuning after the first play.
- Balance is a guess: with no defence a still player takes about 19 hits a minute (the simulation counts grenades too). Enemies now take 4–19 hits to kill instead of 1–3.
- The rigged robot model (`robot.glb`, CC-BY joney_lol) is in the folder but not used yet (Phase 2 in `BACKLOG.md`).
- Enemy punch aim is faked (lunge + arm pose toward your head, no IK), so the fist may visibly miss even when the hit counts.
- No hand-tracking support (controllers only).
- HUD canvas text uses Chakra Petch only if the font has loaded before first draw. Otherwise it falls back to Arial Narrow.
- More ideas and the phase plan are in `BACKLOG.md`.

## Workflow

Edit `bravr/index.html` → test locally with the emulator → commit and push to `main` → Pages deploys in about 1 min. To update the artifact, strip the wrapper as above and republish to the same artifact URL.
