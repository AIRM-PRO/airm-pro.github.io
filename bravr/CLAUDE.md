# Orbital Brawl (jknowak.pl/bravr)

Slow-motion VR brawler for Meta Quest 2, played in the Quest Browser via WebXR. The player wears wrist weights, so the game rewards slow, controlled movement and refuses fast swings (joint safety is the core design rule, not a difficulty setting).

- Live: https://jknowak.pl/bravr (GitHub Pages, repo `jknowak/jknowak.github.io`, branch `main`, folder `bravr/`)
- Preview copy: Claude artifact https://claude.ai/artifact/8XVJLvVyVnMRva6Vhvvxsn. WebXR is probably blocked inside the artifact frame (not tested on a headset), so the artifact is only a menu preview. Play on jknowak.pl.
- UI language: Polish. Code comments: English.

## Files

- `index.html` is the whole game: one file containing the menu page, CSS and the game script. No build step.
- Dependencies: three.js **r128** global UMD build from cdnjs (`THREE` global, no modules), Google Fonts (Chakra Petch, IBM Plex Sans).
- The artifact copy is the same file with the `<!doctype>/<html>/<head>/<body>` wrapper stripped and the charset/viewport metas removed. Artifacts add their own skeleton.

## Game design

- The player floats on a small platform above a planet. Armored soldiers fly in from space, stop about 0.58 m away in one of 6 angular slots (-60° to +64°) at chest/belly height, then **charge for 5 s** (fist pulls back, an orange orb grows, the visor heats up) and hit the player if still alive (counted as a "leak", with a red flash).
- Session = 6 s countdown, then N waves of work/rest (default 6 × 60 s / 30 s), then an end screen. Pull a trigger to exit at the end.
- Kills trigger brief bullet-time (`ts = 0.18` for 0.35 s, then easing back).

### Moves

| Move | Input | Rule | Damage |
|---|---|---|---|
| Cios (punch) | grip held = fist | fist enters torso/head zone moving *away from the player* (velocity·away > 0.25) | 1 |
| Cięcie (chop) | grip released = open palm | palm passes through the neck zone | 2, the head flies off on a kill |
| Rozerwanie (rip) | both fists on the torso | grab while both hands < 1.2 m/s, then spread hands 0.3 m further apart than at grab | instant kill, torso splits in two |

- **Speed limit:** a hand faster than `LIMIT[cfg.limit]` deals no damage, glows red, and shows "ZA SZYBKO". A hand slower than `MIN_SPEED` (0.35 m/s) doesn't register.
- Per-hand cooldown per enemy: 0.5 s.
- Fist detection: `gamepad.buttons[1]` (grip) **or** `buttons[0]` (trigger) pressed.

### Enemies (`TYPES`)

- grunt / Szeregowy: 1 HP, grey, no cape
- soldier / Żołnierz: 2 HP, black with gold trim, crest, red cape
- brute / Brutal: 3 HP, scale 1.28, bronze trim, shoulder spikes, dark cape
- The mix gets harder with wave number (`pickType`). The number alive at once is capped at `min(2 + floor(round/2), 5)`.
- Models are procedural low-poly three.js groups (`makeEnemy`). Each enemy gets `upper`/`lower` groups (split on rip), a `head` group (flies off on decap), and `setCharge(f)` / `dim()` helpers.

## Tuning constants (top of the script)

```
SPEED  = {slow:0.55, mid:0.8, fast:1.1}        // enemy flight m/s
LIMIT  = {careful:1.4, normal:1.9, loose:2.5}  // max damaging hand speed m/s
MIN_SPEED = 0.35
CHARGE = 5.0                                   // seconds before an enemy hits you
SLOTS  = [-60,-32,-8,16,40,64]                 // degrees around the facing direction
```

Strike distance is `0.58` and the strike height is `anchor.y - 0.42 .. -0.20` (in `spawn`). Spawn cadence is `2.2 + rand*1.6 - min(round,6)*0.15` s.

## Structure of the script

settings + menu UI → three.js scene (stars, planet, platform, lights, head-following point light) → HUD canvas-texture planes (`hud`, `big`, `toast`) → controllers/hands (`hands[0..1].userData`: pos, vel, speed, isFist, fast) → WebAudio synth SFX (no audio files) → enemies → `combat(e)` → `updateEnemies` → `loop()` → session start/end → results + history.

- `anchor` = head position/facing captured at the start and at each wave. Enemies and the HUD are placed relative to it, so the player can turn between waves.
- Reference space: `local-floor`.

## Storage (localStorage, per device)

`ob-cfg` (settings), `ob-hist` (last 20 sessions), `ob-tab` (last menu tab). All access is wrapped in try/catch.

## Testing without the headset

- `window.__obPreview(mode, w, h)` renders a static scene to a flat canvas with no XR needed. Modes: `gameplay`, `decap`, `rip`, `rest`, `done`, `roster`. Use it for screenshots (Playwright) or to eyeball models. Call it from the devtools console.
- For interactive testing on a PC, use **Immersive Web Emulator** (Meta's Chrome/Edge extension). It emulates a Quest with draggable controllers and buttons. Serve the folder locally (`npx serve bravr` or `python -m http.server`), because `localhost` counts as a secure context. Emulated motion is coarse, so the hand-speed checks can misfire: temporarily set `LIMIT.loose` very high while testing.
- On the real headset, enable developer mode, connect USB, open `chrome://inspect` on the PC → inspect the Quest Browser tab for the console and live edits.

## Known gaps / next ideas

- Not yet tested on a real Quest 2. Hit radii, the speed limits and the strike distance probably need tuning after the first play.
- No hand-tracking support (controllers only).
- HUD canvas text uses Chakra Petch only if the font has loaded before first draw. Otherwise it falls back to Arial Narrow.
- Ideas: a practice wave that teaches each move in turn, calorie/rep counter, difficulty that adapts to control %.

## Workflow

Edit `bravr/index.html` → test locally with the emulator → commit and push to `main` → Pages deploys in about 1 min. To update the artifact, strip the wrapper as above and republish to the same artifact URL.
