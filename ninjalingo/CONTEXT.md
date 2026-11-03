# NinjaLingo — glossary

A VR game in the style of Beat Saber: objects fly at the player, a voice shouts the name of one of them in a foreign language, and the player cuts that object. The player speaks **English** and is learning **Spanish from Spain** (castellano, the **target language**). The UI and hints are in English. Word data is split per language (`words/es.json`), so another target language can be added later as a new file and a new voice.

## Purpose

- The game is for **learning** vocabulary. Fun matters, but when a design choice trades learning against chaos, learning wins. The player should leave knowing words they didn't know before.

## Core loop

- **Callout**: what the voice shouts in the **target language**. It points at the object(s) the player should cut. There are three kinds, from easiest to hardest:
  - **Name callout**: a noun with its article. "*¡La manzana!*" means cut the apple. Gender is learned along the way.
  - **Modifier callout**: a noun plus a colour or number. "*¡El tranvía rojo!*" means cut the red tram, not the green one. "*¡Dos perros!*" means cut the pair of dogs, not the single one.
  - **Situation callout**: a whole sentence that names no object. The player has to understand it and cut what fits. "*¡Otra vez está todo lleno de malas hierbas!*" ("Weeds everywhere again!") means cut the hoe or the trowel, not the saw or the hammer. It tests understanding, not just recognising a word.
- **Target**: a flying object that answers the current callout. Cutting it is a correct answer. A callout can have **several** targets. Cutting any one of them is enough.
- **Tag**: a label on an object (`drink`, `garden`, `tool`, …). A situation callout lists the tags that **fit** (its targets) and the tags that **clash** (its distractors). Objects with neither kind of tag never fly during that callout, so no object is ever ambiguous.
- **Distractor**: any other flying object while a callout is active. Cutting one is a wrong answer.

When each kind becomes available depends on what it tests:

- Name callouts are always available.
- A modifier callout needs its noun to be at least Learning, because it tests the colour or number, not the noun. Each modifier (*rojo*, *dos*) is an item of its own.
- A situation callout needs about 15 Known items in its theme, because it tests understanding the sentence, not the names of the objects. Each phrase records its theme.

Callouts are for things that can be cut. No verbs or actions for now.

_Avoid_: "note" or "block" (Beat Saber terms). Here the things in flight are objects with names, not rhythm notes.

## Item stages

An **item** is one thing the player learns: a word (from name and modifier callouts) or a situation phrase. A situation phrase has its own stage, separate from the stages of the object names that answer it.

Each item has a **stage** per player, stored on the device (`localStorage`) so it carries over between sessions. New words are taught in play, not in a lesson screen before the wave.

- **New**: the first callouts of an item. The target flies **alone**, glowing, with the written word above it. With nothing else in the air it can't be confused with anything. The point is to hear the word while cutting the object. If the player lets it pass, the item stays New and comes back soon. There is no stage below it to drop to.
- **Learning**: 1–2 distractors. The written word appears only after a wrong cut or a miss.
- **Known**: full distractor count, audio only.

Correct cuts move an item up a stage and wrong cuts move it down. The exact thresholds are still open.

_Avoid_: "level" for an item's stage, because "level" is reserved for game progression.

## Pacing

- **Pace** is set by the player's thinking time, not by the music. Nothing is synced to a beat, and there are no beatmaps. Music, if any, is only background.
- **Response window**: how long the target stays within reach after its callout. Objects drift slowly, and the voice repeats the word once halfway through. The window **adapts** to the player: it starts at about 6 s and shrinks or grows with how fast their recent correct cuts were.
- **Miss**: the target leaves reach without being cut. It counts as "didn't know": the written word is shown and the item drops a stage, the same as a wrong cut.

_Avoid_: "timeout" in UI text. A miss is something the player does, not a timer running out.

## Content

- **Object**: a cuttable thing in flight. It has a `.glb` model, its Spanish name with the article, an English gloss and its tags. Models come from ready-made CC0 low-poly packs (Quaternius, Kenney, poly.pizza) in one consistent style, recoloured in code for modifier callouts. Simple shapes can be procedural. Text-to-3D is a last resort for a single missing word.
- **The vocabulary follows the models**: a word goes into the game only if a model exists that a player recognises at a glance from 1–2 m away while it moves.
- **Dialect**: all vocabulary, phrases and takes are Castilian: *el coche*, *el móvil*, *el ordenador*, *el zumo*, *vosotros*, and the lisped *z*/*ce*. A word that differs in Latin America can carry an optional `alt` shown only in hints ("also: *el carro*, Latin America"). It is never called out and never accepted as a separate answer.
- **Voice**: one native voice from Spain for the whole game, pre-generated with ElevenLabs as `.mp3` files stored next to the item data. There's no browser TTS. Every item has two **takes**:
  - **Shout take**: loud and energetic. It's used for callouts in the Learning and Known stages.
  - **Clear take**: slower and calmer. It's used in the New stage and for the repeat halfway through the response window.
- **Theme**: a vocabulary group the player studies (food, garden, transport, …). Distractors from the same theme are harder, so they teach more.

_Avoid_: "pack" for a vocabulary group, because that word is taken by the third-party model packs.

## Failing

- **Health bar**: mistakes drain it, and at zero the **session** ends early, as in Beat Saber. How long a full session lasts is still open.
- **Drain** depends on the stage of the item: a mistake on a New item costs nothing, on a Learning item a little, and on a Known item the most. Correct cuts refill some of the bar. The bar measures forgetting what you knew, not having yet to learn something. Exact amounts are still open.
- **Failed session**: when the bar hits zero, every stage change from that session stays, gains and drops alike. Stages are saved after every cut, so they always reflect what the player knows right now. Failing costs the score and combo for that run, and a plain "Failed" screen offers a restart.

## Cutting

- **Saber**: the player holds one in each hand, as in Beat Saber. Either one can cut anything.
- **Cut**: a saber swung through an object fast enough. Any direction counts. A minimum swing speed stops a blade drifting through an object while the player is thinking from counting as a wrong answer. If one swing passes through two objects, only the first counts and the swing ends. Objects fly spaced apart so this is rare.

## Session modes

The player chooses one at the start of each session.

- **Theme session**: the player picks a theme and plays only its items, in order.
- **Mixed session**: the game picks items across all themes, mixing items due for review with a few New ones.
- **Review date**: when a Known item is next due in a mixed session. It moves further out with each correct cut (about 1, 3, 7, 21 days…). Exact intervals are still open.
