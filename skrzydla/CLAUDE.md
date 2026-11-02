# Skrzydła (jknowak.pl/skrzydla)

Winged flight game for Meta Quest 2 in the Quest Browser via WebXR, with a browser fallback (keyboard / touch). You flap your real arms to climb, hold them out to glide, tilt them to bank, and fly through a procedurally generated fantasy city at dusk.

- Live: https://jknowak.pl/skrzydla (GitHub Pages, repo `jknowak/jknowak.github.io`, branch `main`, folder `skrzydla/`). Sibling of `bravr/` (Orbital Brawl), same conventions.
- **Version** is in the `h1` (`<span class="ver">`). Bump with every push: minor for features, patch for fixes. History: v0.1 first version.
- UI language: Polish. Code comments: English. No em dashes in UI text.

## Files

- `index.html` is the whole game: menu page, CSS and script in one file. No build step, no assets (everything is procedural, all sound is WebAudio synth).
- Dependency: three.js **r128** global build from cdnjs (`THREE` global). Google Fonts: Cinzel, IBM Plex Sans.

## Flight model (`physics(dt, inp)`)

Input from `readInput()` (same for VR and browser, because the browser drives two fake hands):
- `s` wing spread 0..1 = horizontal distance between the hands (0.55 m → 0, 1.2 m → 1). Both grips held = locked at 1 (tired-arms assist).
- `body.yaw` = perpendicular to the line between the hands when spread, else head yaw. Heading = `rig.rotation.y + body.yaw`.
- `bank` = (left hand y − right hand y) / span, deadzone 0.08; thumbstick X adds to it. Left hand up = turn right.
- `pitch`: head pitch (`cfg.pitch = 'head'`, default) or hands forward/back of the head (`'hands'`). Browser: W/S.
- `P` flap power = sum of downward hand speeds (capped 4 m/s each) for hands held > 0.25 m out to the side and moving mostly downward.
- `brake` = mean trigger value.

Per step: velocity split into `u` along the body direction `F` and the rest `Wp`. Sideslip and sinking are damped hard (`0.35 + 4.6·s·q`, q = (u/STALL)² clamped), rising only lightly; damped sinking turns into forward speed (×0.4·s). Drag `(0.0012 + 0.0026·s + 0.02·brake)·u²+0.012·u`. Full gravity `G` 6.6, plus lift `LIFT·G·s·q` along the wing normal. Flap adds `P·dt·(FLAP_UP·N + FLAP_FWD·F)`. Updrafts push up while inside the column. Bank turns the whole rig around the head (`TURN` rad/s scaled by spread and speed) and rotates the velocity with it. Above 280 m gravity grows.

Measured with `__skSim` (fake hands): holding flap from the start tower climbs ~1.7 m/s at ~75 km/h; gliding settles near 58 km/h sinking ~0.6 m/s; diving with W reaches ~85 km/h; full-bank circle ≈ 9 s.

Collision: one sphere (`BODY_R` 0.9 m) 0.9 m above the rig origin under the head. Colliders per chunk: `f` vertical frustum (tower drums, roofs, turrets, islands, balconies; flat tops are landable), `c` capsule (bridge deck and arch), `b` AABB (houses). Ground at y = 0. Impact > 9 m/s across a wall = crash (sound, red flash, haptics, counted; no death).

## City (`genChunk(cx, cz)`)

- 140 m chunks, seeded by `hash3(cx, cz, SEED)`; 5×5 kept around you, one new chunk built per frame, nearest-ahead first. Each chunk bakes into one lit mesh (`matSolid`, vertex colours) and one unlit mesh for windows (`matGlow`) via `Bld`.
- District palette (`PALS`: white stone/blue, sandstone/terracotta, slate/copper, rose/violet) and height factor come from value noise.
- Content: 2–4 towers (drums with balconies and planters, windows on drum faces, side turrets, cone/dome/garden tops, rare 190–250 m landmark), bridges with arches between towers, 0–2 floating islands (rock cone, grass, trees, vines, waterfall, shrine), houses, ground trees, parks, canals, high clouds, 0–1 updraft column, 0–1 bird flock.
- Chunk (0,0) has the start tower (78 m, flat garden top, no bridges) at (0, 14), a clear corridor ahead (−Z), three guide lanterns and an updraft at (30, −40).
- Shared instanced meshes: lanterns + halos (`lanMesh`, `halo`), updraft columns (`draftMesh`, custom shader), birds (`birdBody`, `wingA`, `wingB`, flock orbit + flee from the player within 14 m), sparkles.
- Collected lanterns are remembered per flight by id `cx,cz,i`.

## VR specifics

- `local-floor`. For 0.8 s after entering, `placeAtSpawn()` keeps re-placing the rig so your head is over the spawn point and you face −Z.
- Wings: dynamic meshes in rig space, shoulder (from the head) → hand → tip, 4 secondaries + 5 primaries, fold with `s`.
- HUD and pause panel are canvas textures parented to the camera. Comfort vignette (`vig`) darkens the edges with turn rate and speed (`cfg.comfort`).
- A/X pause, B/Y in pause ends the flight. Haptics on flaps, lanterns, crashes.

## Storage

`sk-cfg` (pitch, power, comfort, world), `sk-seed` (last city), `sk-hist` (last 20 flights). All wrapped in try/catch.

## Testing without the headset

- Browser mode exercises everything except controller reading.
- `window.__skSim(sec, (t, keys) => {...})` runs a headless flight with the fake hands (set `keys.Space`, `KeyD`, `KeyW`, `ShiftLeft`, …) and returns height, speed, crashes, lanterns and a 1 Hz trace.
- `window.__skDebug()` returns internals.
- Playwright: launch chromium with `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`, serve the repo over http and open `/skrzydla/index.html`. Note the renderer canvas sets inline `display:block`, so the menu hides it with `!important`.

## Known gaps / ideas

- Not yet tested on a real Quest 2. Flap thresholds, `LIFT`, `TURN`, the wing-spread range and the vignette strength will need tuning by feel.
- Flapping is tiring by design; "Łatwa" siła skrzydeł gives ×1.45 flap and more lift.
- Ideas: landing challenges on garden roofs, rings/races through bridge arches, day/night, perching, wind gusts, other players' ghost flights.
