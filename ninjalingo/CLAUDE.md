# NinjaLingo (airm-pro.github.io/ninjalingo)

VR Spanish vocabulary game for Meta Quest in the Quest Browser via WebXR, with a browser fallback (the mouse points one saber). A voice shouts a word, food flies at you, you cut the right one.

- Domain terms are defined in `CONTEXT.md`. The plan is in `BACKLOG.md`.
- **Version** is in the `h1` (`<span class="ver">`). Bump with every push: minor for features, patch for fixes. History: v0.1 first playable.
- UI language: English (the player speaks English and learns Spanish from Spain). Code comments: English. No em dashes in UI text.

## Files

- `index.html`: the whole game code. No build step. three.js r128 and its `GLTFLoader` from CDNs.
- `words/es.json`: the word list, by theme. Each item has `id`, `es` (with article), `en`, `model`.
- `models/*.glb`: Kenney Food Kit, CC0, 5-50 KB each. Kenney's site blocks scripted downloads, so they came from the copy in `m4gr3d/Godot-Android-Samples` (`apps/gltf_viewer/godot/gltfs/food_kit`), 200 models in total, so more are easy to add.
- `audio/es/<id>.shout.mp3` and `<id>.clear.mp3`: ElevenLabs takes, model `eleven_v4`, voice `YKrm0N1EAM9Bw27j8kuD` (Leónidas, Castilian). Prompts: `[shouting] ¡La manzana!` and `La manzana.` One word pair costs about 34 credits per variation. Download links expire after about 2.4 hours.

To add a word: add a model, an entry in `es.json` and both takes. Check the model at a glance first. The apple and tomato look the same, and the lemon, onion, egg and whole watermelon read as blobs, so those were left out.

## Structure of the script

Tuning constants → storage → content loading → WebAudio (voice, SFX, synth backing loop) → scene → text panels → objects, cut halves, sparks → sabers and `sweepHit` → game (`pickItem`, `startRound`, `resolve`, `moveStage`, `finish`) → `step(dt)` state machine → loop and sessions → menu.

States: `count` → `gap` → `round` → `feedback` → `gap` …, ending in `failed` or `done`. All logic is in `step(dt)`, separate from rendering, so it runs headless.

Non-obvious:
- The kit leaves metalness at the glTF default of 1, which renders black without an env map, so `loadModel` swaps every material for Lambert.
- Sky and floor don't write depth. Nothing goes below them, and the floor was hiding the lower half of the text panels.
- Cut halves use clipping planes, recomputed each frame from a plane in the half's local space.
- XR frame times use a different clock from `performance.now`, so `loop` guards against a negative first delta.
- `BLADE_TILT` angles the blade forward from the grip's -Z axis, which points about 45° up when the controller is held level. **Not yet checked on a real headset.**

## Testing without the headset

- `window.__nlDebug()` returns the internals. Set mode `sim` with `setMode('sim')` to run `step(dt)` by hand and pose sabers yourself.
- Playwright with swiftshader works: launch chromium with `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader` and serve over `http://localhost`.
- The real VR path runs under Meta's `iwer` emulator in Playwright: inject `iwer/build/iwer.min.js` with `addInitScript`, then `new IWER.XRDevice(IWER.metaQuest3).installRuntime({forceInstall:true})`, because Chromium's own `navigator.xr` otherwise wins. Move `device.controllers.right.position` to swing. Headless frame rates are low and `dt` is capped, so swing in big steps.

## Known gaps

- Not yet played on a real Quest. `BLADE_TILT`, `MIN_SWING`, hit radius, object distance, text size and the audio mix probably need tuning.
- Starting values are guesses: 5-minute session, 2 correct cuts per stage, drains of 0/10/20, response window 2.5-8 s.
- The backing track is a placeholder synth loop.
