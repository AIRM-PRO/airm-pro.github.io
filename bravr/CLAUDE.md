# Orbital Brawl (jknowak.pl/bravr)

VR brawler for Meta Quest 2, played in the Quest Browser via WebXR. The player wears wrist weights. The original hand-speed limit (fast swings dealt no damage) was removed on request in Oct 2026: harder punches now shove enemies further. The only safety nudge left is a tutorial line about not snapping the elbow straight.

- Live: https://jknowak.pl/bravr (GitHub Pages, repo `jknowak/jknowak.github.io`, branch `main`, folder `bravr/`)
- **Version**: shown next to the title in the menu (`<span class="ver">` in the `h1`). Bump it with every change you push: minor for features (v0.5 → v0.6), patch for fixes (v0.5 → v0.5.1). History: v0.1 first version, v0.2 tutorial, v0.3 enemies punch back, v0.4 shields/grenades/upgrades, v0.5 robot enemies, drag and throw, open-ended breaks, v0.5.1 dedicated bombers from wave 1, v0.6 one-hit kills with gory finishes, faster tempo, front-only attack arc (feedback from a playtester), v0.7 ship hull with a doorway behind you, hit-and-run charges, throw on release, Bilard always on.
- The old Claude artifact preview is no longer maintained; don't update it.
- UI language: Polish. Code comments: English.
- Domain terms (stances, shield, stun, fatality, bombs, upgrades) are defined in `CONTEXT.md`. The plan is in `BACKLOG.md`.

## Files

- `index.html` is the whole game: one file containing the menu page, CSS and the game script. No build step.
- `robot.glb` is the enemy model ("Rigged robot" by joney_lol, poly.pizza, CC-BY; credited at the bottom of the menu). It is loaded relative to the page (`robot.glb`).
- Dependencies: three.js **r128** global UMD build from cdnjs (`THREE` global, no modules), plus r128 `GLTFLoader` and `SkeletonUtils` from jsdelivr (`three@0.128.0/examples/js/...`), Google Fonts (Chakra Petch, IBM Plex Sans).

## Game design

- The player stands on a deck in a 2×2 m doorway of a steel ship hull (`base`, `placeBase()` on every `setAnchor`; hull face at `WALL_Z` = −0.8 m behind the anchor) floating above a planet; the old round platform is hidden. Armored soldiers fly in from 8–11 m (superman pose, weaving, boot thruster sparks, cruising up to 3× `SPEED` when far and braking on arrival).
- **Rings and hit-and-run:** everyone spawns onto the *outer* staging line (2.4 m, ±45°). `charges()` sends a rested (`e.rest`) melee enemy to a free spot on the *inner* ring (0.65 m, ±45°) when fewer than `min(1 + round/2, 3)` are in; it dashes in (approach speed ×3), winds up, punches once and `toStage()` sends it back out (`e.retreat`, also ×3, upright pose). Shoves, throws, drops and stuns also end in `toStage`. A spot is free when the arc distance to every other enemy on that ring clears both torsos (`freeAngle`, torso radius `bodyR = 0.2 · scale · bulk`). `separate()` also pushes overlapping torsos apart every frame and keeps them ≥ 0.36 m from the player. Nobody stands still: they strafe, bob and rock (`hold`).
- **Enemy attack:** `windup` (`CHARGE` ≈ 0.7 s ±25%: fist pulls back, orange orb, visor heats) → `swing` (`SWING` 0.28 s lunge at your head, lands at `IMPACT` = 55%) → `recover` (`RECOVER` 0.35 s) → back out. The swing is **blocked** if either of your hands is within 0.13 m of its fist before impact, and **dodged** if your head has moved more than 0.22 m since the swing started. Otherwise you take 1 HP (brute: 2). A landed hit is still stored as `leaks` (history compat) and shown as "Oberwałeś".
- **Player HP:** `PLAYER_HP` = 10 on the left wrist watch; **mana** (`MANA` 10, `MANA_REGEN` 0.5/s during waves) on the right one (`watches`, `drawWatches`). At 0 HP: knockout (`G.kos`), enemies blown back, HP refills, and the most recent upgrade is lost. HP and mana refill at every rest.
- **Shield, one-hit kills and stun:** `TYPES` give shields grunt 0, soldier 2, brute 4, and 1 HP each. `hit(e, kind, h, at, dir)` drains the shield first (`DRAIN`); once it is down any hit kills grunts and soldiers through `crush()` (style `decap` for a neck chop or a punch to the head, otherwise `shatter` (the robot falls apart into head, arms, chest and hips) or `punch` (limbs torn); blasts and bumps always shatter). Brutes have `stuns:true`: their first hit after the shield is stunned instead. A punch on a shield `shove`s the enemy (`SHOVE` 5.2 m/s, about 2.2 m) into state `shoved`; it tumbles, then goes back to `approach` and flies to its front slot. The shield regenerates after 5 s without a hit. `stun()` → state `stunned` for `STUN` 4 s, then any hit kills (`finish`). Chop to the neck and the rip are **fatalities** (`G.fatal`, +3 mana). An unfinished stun recovers with no shield (the next hit stuns again). Status bars over the head and a field bubble come from `e.showStatus()`.
- **Grenades:** **bombers** throw them: from wave 1 one enemy (two from wave 5, `bomberCap`) spawns on the outer ring with `e.bomber`, is never promoted, and doesn't count against the melee cap (`meleeCap`, `wantSpawn`). In `hover` it cocks an arm and `throwBomb`s every `rnd(9, 13) − 0.3·round` s (max 2 live): a high lob (0.9–1.8 s by distance) that stops about 0.42 m in front of your chest and drifts closer until `BOMB.fuse` 3.2 s. They glow, trail sparks, and blink and beep faster near the end. Catch: a loose hand closing into a fist (`u.grabEv`) within 0.15 m (a grenade in reach wins over grabbing an enemy); throw: release the grip (hand velocity × 1.3). A thrown grenade sticks to the enemy it hits, shoves it and blows 0.35 s later. A fist moving into one sets it off. `explode` hurts the player (1 HP within `BOMB.radius` 0.7 m of the chest) and `hit`s enemies with `blast`.
- **Bilard** (always on since v0.7): a `shoved` enemy faster than 2 m/s `hit`s whoever it touches with `bump`; a `thrown` one also takes a `bump` itself on the first collision, on the hull, or when it slows down without hitting anything.
- **Upgrades** (`UPGRADES`, `G.ups`): each rest offers 3 cards (`offerCards`) and you punch one. `haishu` (a blade-hand backhand bats a grenade back, 1 mana), `squat` (dodging with the head ≥ 25 cm lower than at swing start gives +2 mana), `charge` (a fist still for 1 s glows; the next punch is `charged`: drain 3, double shove), `thunder` (fists slammed together in front of the chest at > 1.2 m/s closing speed, 4 mana: shields to 0 within 1 m, shove).
- Session = 6 s countdown, then N waves with breaks between them, then an end screen. A **break has no timer** (`dur: Infinity`): the player punches an upgrade card and then the **DALEJ** button (`nextBtn`, `advance()`). `cfg.rest` is only the suggested length shown on the HUD. Pull a trigger to exit at the end.
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
- **Drag and throw:** `u.grabEv` (true for 0.25 s after a hand closes into a fist, until used) with the hand slower than 1.4 m/s, within 0.18 m of an enemy fist or elbow, or near the head/torso, puts it in state `held` (`held()`): it lerps after the hand at `18/mass` per s. Releasing the grip faster than 1 m/s throws it (`shove` at `clamp(speed·3, 5, 12)/mass`, `e.thrown`); slower just drops it. After 2.5 s it breaks free into a swing. Not on stunned enemies (their grab is the rip). Thrown or shoved enemies can't pass behind the hull.
- **Stances** (`u.stance`): grip (`buttons[1]`) = `fist`, trigger (`buttons[0]`) = `blade`, nothing = `loose`; the fist wins when both are held. `u.grabEv` is the grab window after a hand closes (`u.grabT`, `u.grabUsed`).
- **Hands:** the hand models live in WebXR **grip space** (`getControllerGrip`): origin in the curled fingers, -Z along the handle towards the thumb, +X out of the back of the right hand, +Y up the forearm. `makeHand` builds the right hand (palm, 4 two-segment fingers, thumb, an 8 cm wrist-weight cuff tilted `CUFF_TILT` = 0.6 rad from +Y towards +Z, which is where the real forearm runs) and mirrors it with `scale.x = -1` for the left. **No forearm**: a straight +Y forearm made the elbows look too high. `poseHand(m, curl, blade)`. The model is rebuilt on `connected` once handedness is known. Fingers curl with `u.curl` (analog grip/trigger value, full fist when pressed). Gloves turn red with `u.blood` and drip.
- **Gore:** blood drops with gravity, chunks, meat, bone, guts and expanding blood mist (`blood`/`meat`/`guts`/`mist`). `bleed(obj, local, dir, rate, dur)` squirts from a point on a moving object (wounds, neck fountain, arm sockets, rip halves). `stump()` adds a raw cap and a bone stub. Wound splats stick to the chest (`wound`). Punch kills can tear off arms and the head. Particles are capped at 900.

### Enemies (`TYPES`)

- grunt / Szeregowy: no shield, one hit; olive robot
- soldier / Żołnierz: shield 2, then one hit; black and gold robot, blue field
- brute / Brutal: shield 4, then stun and fatality; scale 1.28, rust robot, red field
- The mix gets harder with wave number (`pickType`). The number alive at once is capped at `min(2 + floor(round/2), 5)`.
- Models: `makeEnemy` builds a procedural low-poly rig: `g` (faces the player, +Z towards them) → `body` (lean) → `upper`/`lower` (split on rip), a `head` group (flies off on decap), `arms[]`/`legs[]`/`boots[]`, and `setCharge(f, showOrb)` / `dim()` helpers. When `robot.glb` has loaded (`window.__obReady`), `fitRobot` hides the procedural meshes, moves the joints to the robot's proportions and adds a `SkeletonUtils.clone` of the robot with per-tier tints (`ROBOT_TINT`; 'Does not work' is the eyes+wings material, used as the visor/charge glow). `driveRobot` sets bone rotations every frame from the procedural joints' world rotations (`RIG`, rest offsets in `ROBOT.rest`). Fingers are curled into fists once (`ROBOT.curl`). `fistPos(e, i)` gives the robot's knuckles. Gore: `tear(e, part, group)` makes a static copy of a body piece (`ROBOT.parts`, triangles by dominant bone), posed with `boneWorld · boneInverse · bindMatrix`, hangs it on the procedural group that flies off, and collapses the bone on the live mesh. Pieces need `skinning:false` material copies (r128). Without the model (load failure, `file://`), the procedural enemies are used.
- Animation: `animate(e, gdt)` picks pose targets per state (approach/hover/windup/swing/grabbed/held/shoved/stunned), smooths them into `e.pose` (relative to `GUARD`) and layers `e.flinch` on top.

## Tuning constants (top of the script)

```
SPEED  = {slow:1.05, mid:1.5, fast:2.0}        // enemy flight m/s (near; up to 3x when far)
MIN_SPEED = 0.35
CHARGE = 0.7                                   // average windup after charging in
SWING = 0.28, IMPACT = 0.55, RECOVER = 0.35    // enemy punch length, when it lands, pause after
PLAYER_HP = 10
MANA = 10, MANA_REGEN = 0.5
STUN = 4, SHOVE = 5.2
BOMB = {fuse:3.2, radius:0.7}
DMG / DRAIN                                    // HP damage and shield drain per hit kind
RING = {inner:{d:0.65, max:45}, outer:{d:2.4, max:45}}
```

Inner-ring height is `anchor.y - 0.42 .. -0.20` (`innerDy`). Spawn cadence is `1.6 + rand*1.2 - min(round,6)*0.12` s.

## Structure of the script

settings + menu UI → three.js scene (stars, planet, platform, lights, head-following point light) → HUD canvas-texture planes (`hud`, `big`, `toast`, wrist `watches`) → hands in grip space (`hands[0..1].userData`: pos, palm, vel, speed, stance, grabEv, curl, bladeK, charged, blood, model) → WebAudio synth SFX (no audio files) → enemies + `animate` → rings, spawn, `promote` → gore (particles, `bleed`) → `hit`/`shove`/`stun`/`finish`/`kill`, enemy swing (`startSwing`, `block`, `dodged`, `hitPlayer`, `knockout`) → grenades (`throwBomb`, `updateBombs`, `explode`) → upgrades and rest cards → `updateHands` → `thunderclap` → `combat(e)` → `approach`/`hold`/`shoved`/`separate` → `updateEnemies` → `loop()` → session start/end → results + history.

- `anchor` = head position/facing captured at the start and at each wave. Enemies and the HUD are placed relative to it, so the player can turn between waves.
- Reference space: `local-floor`.

## Storage (localStorage, per device)

`ob-cfg` (settings), `ob-hist` (last 20 sessions), `ob-tab` (last menu tab). All access is wrapped in try/catch. History records made before Oct 2026 have `control` and no `blows`/`blocks`/`dodges`, and the UI shows `–` for the missing fields.

## Testing without the headset

- `window.__obPreview(mode, w, h)` renders a static scene to a flat canvas with no XR needed. Modes: `gameplay`, `ship` (looking back at the hull and doorway from the enemies' side), `swing`, `punch`, `decap`, `rip`, `stun`, `bombs`, `cards` (rest with upgrade cards and DALEJ), `hands` (close-up: left fist with the HP watch, right blade hand), `rest`, `done`, `roster`. Use it for screenshots (Playwright) or to eyeball models. Call it from the devtools console.
- `window.__obSim(sec, round, puncher)` runs the wave logic headlessly (still head, optional auto-jabbing right fist) and returns hits, KOs, kills, grenades thrown and `minGap` (the smallest torso clearance seen; it should stay ≥ 0).
- `window.__obDebug()` returns the internals (`G`/`setG`, `enemies`, `bombs`, `hands`, `hit`, `throwBomb`, `updateEnemies`, `updateBombs`, `thunderclap`, …) for scripted single-mechanic tests: place an enemy, fake a hand (`stance`, `pos`, `palm`, `vel`, `speed`, `grabEv`), step the updates and check the state.
- Playwright with swiftshader works for both: launch chromium with `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`. Serve the repo over http (`python3 -m http.server` from the repo root, open `/bravr/index.html`) and `await window.__obReady` first. Over `file://` the robot can't load and you get the procedural enemies.
- For interactive testing on a PC, use **Immersive Web Emulator** (Meta's Chrome/Edge extension). It emulates a Quest with draggable controllers and buttons. Serve the folder locally (`npx serve bravr` or `python -m http.server`), because `localhost` counts as a secure context. Emulated motion is coarse, so `MIN_SPEED` and the punch-direction check can misfire.
- On the real headset, enable developer mode, connect USB, open `chrome://inspect` on the PC → inspect the Quest Browser tab for the console and live edits.

## Known gaps / next ideas

- Not yet tested on a real Quest 2. Hit radii, ring distances, block/dodge thresholds, the watch placement, `CUFF_TILT`, the grenade catch radius and the thunderclap detection probably need tuning after the first play.
- Balance is a guess: with no defence a still player takes about 20 hits a minute (grenades included); the auto-jabbing sim kills about 8 a minute.
- Robot gore pieces are posed in the model's bind pose (A-pose), not the current pose. Enemy hit zones are still the procedural ones, which roughly match the robot.
- Enemy punch aim is faked (lunge + arm pose toward your head, no IK), so the fist may visibly miss even when the hit counts.
- No hand-tracking support (controllers only).
- HUD canvas text uses Chakra Petch only if the font has loaded before first draw. Otherwise it falls back to Arial Narrow.
- More ideas and the phase plan are in `BACKLOG.md`.

## Workflow

Edit `bravr/index.html` → bump the version next to the title → test locally (Playwright over http, or the emulator) → commit and push to `main` → Pages deploys in about 1 min.
