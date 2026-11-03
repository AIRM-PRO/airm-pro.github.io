# NinjaLingo backlog

Terms are defined in `CONTEXT.md`. Items within a phase are in rough priority order.

## Phase 1: first playable

The goal is to find out whether cutting an object after hearing a shout feels good and whether the words stick.

- [ ] Voice check: generate 3 words with the ElevenLabs connector and confirm the `.mp3` files can be saved to the repo. If they can't, use an API key and a small script.
- [ ] Choose the theme from whichever CC0 model pack has the most recognisable objects (food is the likely winner), about 20 words.
- [ ] Two sabers and cutting: any direction, minimum swing speed, first object hit counts.
- [ ] Name callouts with the shout and clear takes.
- [ ] Item stages saved in `localStorage`: New, Learning, Known.
- [ ] Adaptive response window, misses, and the written word after a mistake.
- [ ] Health bar with stage-based drain, the Failed screen, score and combo.
- [ ] Theme session only.
- [ ] A backing track, not synced to anything.

Starting values to tune by playing (not decided, just where to start): a 5-minute session, 2 correct cuts to move up a stage.

## Phase 2: after the first test

- [ ] Modifier callouts (colours first, then numbers).
- [ ] Mixed session and review dates.
- [ ] More themes.

## Phase 3

- [ ] Situation callouts, with tags that fit and clash.
- [ ] Optional `alt` Latin American forms in hints.
