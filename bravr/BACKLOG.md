# Orbital Brawl backlog

Terms are defined in `CONTEXT.md`. Items within a phase are in rough priority order.

## v0.9 (Oct 2026)

- [x] A/B pause with a moves panel; character sheet with stats and the upgrade tree in the break.
- [x] Upgrade tree with prerequisites and 3-level upgrades (Laser, Bóg prędkości, Pancerz, Zbiornik); new Imadło and Rękawice.
- [x] Szczęka: flying jaw, smack from above/below when shut, bites fists, lift with both hands and throw, crush (Imadło), split (Rękawice).
- [x] Dead robots float as wrecks that block others and can be thrown.

## v0.8 (Oct 2026)

- [x] Super moves: uppercut to the chin (3 shield, head launched up) and two-fist hammer from above (4 shield, crushes the robot). Both are fatalities on a stunned brute.

## v0.7 (Oct 2026)

- [x] Ship hull with a 2×2 m doorway behind the player (justifies the front-only arc).
- [x] Hit-and-run: enemies charge in, punch once and fly back out.
- [x] Throw on grip release (like grenades), forgiving grab window; thrown enemies break on impact.
- [x] Bilard always on (removed from the upgrade cards).

## v0.6: playtester feedback (Oct 2026)

- [x] One-hit kills once the shield is down (grunt 0 / soldier 2 / brute 4 shield); brutes keep the stun + fatality.
- [x] More fatality-style finishes on every kill: `shatter` (robot falls apart), head knocked off by a punch to the head.
- [x] Faster tempo (windup 1.6 s, swing 0.28 s, faster flight and spawns).
- [x] Attackers only from the front (±45°, bombers ±40°); bombers calmer (every 9–13 s, second one from wave 5).

## Done after the first headset test (Oct 2026)

- [x] Wrist cuff in line with the palm (`CUFF_TILT` 0).
- [x] Break with no timer: pick a card, punch DALEJ.
- [x] Grenades thrown from about 2.6 m; bigger, glowing, spark trail, beeping.

## Phase 1: done (Oct 2026, untested on a headset)

Core systems the first upgrades need:

- [x] Hand stances: grip = fist, trigger = blade hand (straight fingers, thumb pressed alongside), none = loose hand. Fist wins when both are held.
- [x] Gloves only: remove the forearm, add a short cuff angled along the real forearm, with a watch on each cuff (left HP, right mana).
- [x] Mana: 10 max, about 1 point per 2 s regen. Blade strike costs 1. An empty pool makes the blade hand act as loose.
- [x] Shield and HP rescale: grunt 0/10, soldier 4/20, brute 8/30. A punch on a shield shoves the enemy 2–3 m. Shield regen after 5 s.
- [x] Stun at ≤10% HP for 4 s; any hit kills, a special move (chop to the neck, rip) is a fatality (+3 mana). The rip works only on a stunned enemy and needs a vertical pull.
- [x] Shoved or thrown enemies fly back in an arc to a front slot.
- [x] Faster enemy tempo: windup 2.2 s, swing 0.32 s, recover 0.45 s.
- [x] Grenades (Granat) thrown by outer-ring enemies. Catch one with a grab (loose hand closing into a fist), throw it on release. A thrown grenade sticks to the enemy it hits and blows 0.35 s later. Blasts hurt the player and enemies. Punching one detonates it on your fist.
- [x] Upgrade pick in the rest period: 3 cards, punch one. A knockout loses the most recent upgrade.

First upgrades:

- [x] **Bilard** (billiards): a shoved or thrown enemy colliding with another drains that one's shield.
- [x] **Haishu-odbicie** (backhand deflect): a blade-hand backhand knocks a grenade back without catching it.
- [x] **Przysiad** (squat): ducking under an enemy punch (head drops ≥ 25 cm) refills 2 mana.
- [x] **Ładunek** (charge): a fist held still for 1 s charges; the next punch shoves twice as far and drains 3 shield.
- [x] **Klaśnięcie burzy** (thunder clap): both fists slammed together in front of the chest costs 4 mana and strips the shields of everything within 1 m.

## Phase 2: enemies and finishing moves

- [x] Replace the procedural enemies with the rigged robot (`robot.glb`, CC-BY joney_lol; credit in the menu). Needs the three.js r128 `GLTFLoader` and `SkeletonUtils` from jsdelivr. Pose bones in code (it has no animations). Gore by zero-scaling bones (head for decap, upper/lower half for the rip). Publish the .glb alongside the artifact.
- [x] Three tier looks (tints and field bubbles; brute wings glow; no extra parts yet): grunt in stock olive; soldier in black and gold with a blue shield bubble; brute in rust and bronze with a red bubble and glowing wings.
- [ ] Ear clap (both blade hands on the head within 0.15 s): 3 shield and a daze / 8 HP / head-burst fatality. Costs 3 mana.
- [ ] Nukite through the chest as a fatality.
- [ ] Fatality reward: mana refund plus run currency.
- [x] Drag and arm throw: grab an arm, fist or torso, drag it with inertia, yank (> 1.5 m/s) to throw; it breaks free after 2 s.
- [ ] Mine (Mina, soldier) and orb (Kula, brute) bombs. The orb needs two hands for a full throw; one hand only lobs it weakly.
- [ ] Soldier 2-punch combo; brute overhead slam that can't be blocked.

## Phase 3: remaining upgrades and the roguelite layer

- [ ] **Żywa tarcza** (human shield): an enemy held by the arm doesn't break free and blocks bombs and punches.
- [ ] **Kontra** (parry): a block in the last 0.1 s before impact stuns the attacker for 2 s.
- [ ] **Przylepiec** (sticky): a thrown mine sticks to an enemy, which panics into its friends.
- [ ] Trade-offs: **Szklane pięści** (glass fists: ×2 punch damage, −3 max HP), **Berserk** (×2 mana regen under 30% HP, no blocking), **Rzeźnik** (butcher: a fatality heals 1 HP, a plain kill costs 1 mana).
- [ ] Rarity and combination hints on the upgrade cards (Bilard + Żywa tarcza).
- [ ] Meta progression: a currency that carries over between runs unlocks moves, enemy types and arenas.
- [ ] Optional hardcore mode: death ends the run.

## Later / ideas

- [ ] A calibration pose in the menu: per-hand rotation and position offset (covers different controller grips).
- [ ] Two-bone IK arms (only if gloves alone feel wrong).
- [ ] Hand-tracking support.
- [ ] A practice wave that teaches each move in turn; a calorie/rep counter.
