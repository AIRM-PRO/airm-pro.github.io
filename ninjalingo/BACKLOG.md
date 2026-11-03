# NinjaLingo backlog

Terms are defined in `CONTEXT.md`. Items within a phase are in rough priority order.

## Phase 1: first playable (v0.1, Nov 2026, not yet played on a real headset)

The goal is to find out whether cutting an object after hearing a shout feels good and whether the words stick.

- [x] Voice: ElevenLabs takes saved to the repo through the connector, no API key needed.
- [x] Theme: food, 20 words from Kenney's Food Kit (CC0).
- [x] Two sabers and cutting: any direction, minimum swing speed, first object hit counts.
- [x] Name callouts with the shout and clear takes.
- [x] Item stages saved in `localStorage`: New, Learning, Known.
- [x] Adaptive response window, misses, and the written word after a mistake.
- [x] Health bar with stage-based drain, the Failed screen, score and combo.
- [x] Theme session only.
- [x] A backing track, not synced to anything (placeholder synth loop).
- [ ] Play it on a real Quest and tune `BLADE_TILT`, `MIN_SWING`, text size and the audio mix.
- [ ] Find out whether the words actually stick.

Starting values to tune by playing (not decided, just where to start): a 5-minute session, 2 correct cuts to move up a stage.

## Phase 2: after the first test

- [ ] Modifier callouts (colours first, then numbers).
- [ ] Mixed session and review dates.
- [ ] More themes.

## Phase 3

- [ ] Situation callouts, with tags that fit and clash.
- [ ] Optional `alt` Latin American forms in hints.
