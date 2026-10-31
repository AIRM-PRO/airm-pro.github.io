# Orbital Brawl — glossary

Domain terms for the game. UI terms are Polish. The English name is what the code and docs use.

## Hand stances

Each hand is always in exactly one stance, set by the controller buttons:

- **Fist** (*Pięść*): the grip (`buttons[1]`, under the middle finger) is held. If both buttons are held, the fist wins. A fist punches and grabs.
- **Blade hand** (*Dłoń bojowa*): only the index trigger (`buttons[0]`) is held. The fingers are straight and tight, with the thumb pressed along them (karate shuto / nukite / haishu). It does all the open-hand strikes. The old *Cięcie* (chop through the neck) is now a blade-hand strike.
- **Loose hand** (*Luźna dłoń*): nothing is held. It does no damage. Closing a loose hand into a fist is what grabs (see *Grab*).

_Avoid_: "open palm" on its own, because it doesn't say whether the hand is loose or a blade hand.

## Grabbing and throwing

- **Grab** (*Chwyt*): a hand closing into a fist (from loose or blade) near something grabbable: a bomb (17 cm), an enemy fist or elbow (18 cm), head or torso. The hand can grab for 0.25 s after closing, and only while moving slower than 1.4 m/s; a fast fist punches instead.
- **Bomb throw**: the bomb flies when you release the grip, with your hand's velocity. If you hold a bomb too long, it explodes in your hand.
- **Drag** (*Ciągnięcie*): a grab on any non-stunned enemy. It trails your hand with lag weighted by its mass. The other hand can still punch it.
- **Throw** (*Rzut*): let go of the grip while the hand moves faster than 1 m/s, like a grenade; a slower release just drops the enemy. A thrown enemy **breaks**: on another enemy (both take a hit, see *Bilard*), on the hull, or when it lands. Breaking drains 2 shield or kills an unshielded grunt/soldier. Held longer than 2.5 s, it breaks free and punches.
- **Bilard**: always on (it was an upgrade until v0.7). A shoved or thrown enemy hitting another drains its shield or kills it, and knocks it on.
- When a grenade is within reach of the closing hand, the grab catches the grenade, not the enemy.
- **Rip** (*Rozerwanie*): both hands grab the torso, then pull apart **vertically** (one hand up, one down). The torso tears at the waist into upper and lower halves.

## Enemy durability

- **Shield** (*Pole siłowe*): grunt 0, soldier 2, brute 4 (since v0.6; it was 0/4/8). While it is up, hits drain the shield. A punch drains 1 and **shoves** the enemy back about 2–3 m. A blade-hand strike drains 2 with only a small shove. The shield regenerates slowly after 5 s without being hit.
- **One-hit kill** (*Miazga*): once the shield is down, any hit kills a grunt or soldier with a gory finish: the head comes off (neck chop, or a punch to the head), or the robot shatters into head, arms, chest and hips, or limbs tear off. (Before v0.6 enemies had 10/20/30 HP.)
- **Stun** (*Ogłuszenie*): only brutes. The first hit after their shield is down stuns them for about 4 s instead of killing. If the stun runs out, they recover with no shield.
- **Fatality**: killing a **stunned** brute with a special move: rip, blade-hand decapitation, uppercut or hammer (later: ear clap, nukite through the chest). It refunds 3 mana. Any other hit on a stunned brute is a plain kill.
- The **rip** can only be done on a stunned enemy.

_Avoid_: "resilience" or "armor" for the shield.

## Strikes

- **Punch** (*Cios*): a fist hitting the torso or head while moving away from the player.
- **Blade strikes** (all with the blade hand): **shuto** (edge of the hand through the neck or torso), **nukite** (fingertips driven forward into the chest), **haishu** (backhand: the back of the hand swung outward).
- **Super moves** (*Super ciosy*), free, no mana:
  - **Uppercut** (*Podbródkowy*): a fist rising fast and steeply into the chin. Drains 3 shield and pops the enemy up and back; without a shield the head is launched straight up.
  - **Hammer** (*Młot*): both fists together, brought down hard on the head or torso. Drains 4 shield (a brute's whole shield); without a shield it crushes the robot downwards.
  - On a stunned brute both are fatalities.
- **Ear clap** (*Klaśnięcie w uszy*): both hands in blade-hand stance strike opposite sides of the head within 0.15 s of each other, each moving inward. Against a shield it drains 3 and briefly dazes the enemy (it pauses its attack). Otherwise it deals 8 HP. On a stunned enemy it is a fatality: the head bursts.

## Szczęka (the jaw)

- A flying metal jaw about 45 cm across, pushed by two jets at the back. It hovers in front of you chomping (open, shut, three times), then lunges at your face.
- **3 hits** kill it: a smack from **above or below while it is shut** (it tumbles up or down a few metres and comes back), a smack with the free hand while it bites the other, a thrown wreck, or the laser.
- **Bite** (*Ugryzienie*): a fist or blade pushed into it any other way gets stuck in its teeth; that hand does nothing until the jaw dies or lets go (6 s), and it gnaws 1 HP every 2.5 s.
- **Lift** (*Podniesienie*): two hands closing on its sides. One hand alone isn't enough: it twists round and bites. Released in a swing it is thrown and knocks into others (Bilard). **Imadło**: slam it down to crush it. **Rękawice**: a bite no longer locks the hand; push the other fist into the mouth and pull the hands apart vertically to split it like a log (fatality).

## Wrecks

- **Wreck** (*Wrak*): the body of a dead robot or jaw. It flies off from the kill, slows to a drift away from the ship, blocks other enemies, and can be grabbed and thrown at them (a Bilard hit). It shrinks away after about 40 s or 10 m.

## Mana

- **Mana** (*Mana*): a pool of 10 that refills at about 1 point per 2 s. It is shown on the right wrist watch (HP is on the left). It pays for the strong moves: a blade strike costs 1, an ear clap 3, and a fatality is free and refunds some mana. Punches are free. With an empty pool, a blade hand acts as a loose hand.

## Upgrade tree and powers

- Upgrades sit on branches (Pięść, Dłoń, Oczy, Czas, Ciało). Some need another first (Burza after Ładunek, Rękawice after Imadło); Laser, Bóg prędkości, Pancerz and Zbiornik have **3 levels**. Each card shows the next level. A knockout takes back the last level picked.
- **Character sheet** (*Twoja postać*): shown in the break next to the cards: max HP, max mana, regen, kills and the tree with level pips.
- **Laser**: a loose hand at the side of your head (like a scout salute in waiting) shows a crosshair where you look; pulling the trigger (flat hand) fires from the eyes: 0.3 s, then 1 s, then 2 s by level. 2 mana. While it fires you see everything through red.
- **Bóg prędkości** (god of speed): both hands far behind your back slows the world (not you) for 2 / 3.5 / 5 s by level. 3 mana.
- **Pause** (*Pauza*): A or B shows all moves and your upgrades and freezes the fight.

## Gloves and watches

- **Glove** (*Rękawica*): the player's virtual hand. It ends at the wrist with a short cuff (about 8 cm) angled along the real forearm direction, which is roughly backwards along the controller handle, not grip +Y. There are no forearms or elbows. IK arms are only a backlog idea.
- **Watch** (*Zegarek*): a small panel on the outside of each cuff (left = HP, right = mana). It replaces the old forearm model and HP panel.

## Enemy model

- One rigged robot mesh ("Rigged robot" by joney_lol, poly.pizza, **CC-BY**: credited in the menu), recoloured and rescaled per **tier**. It has folding back wings, which suit the flying approach. Its bones follow an invisible procedural rig, which is what hit zones and poses are defined on.

## Tiers and bombs

| Tier | Look | Shield / HP | Bomb | Damage to player | Radius |
|---|---|---|---|---|---|
| **Szeregowy** (grunt) | stock olive, scale 1.0 | 0 / 10 | **Granat** (grenade): small, lobbed, 2.5 s fuse | 1 | 0.7 m |
| **Żołnierz** (soldier) | black and gold, scale 1.1, blue shield | 4 / 20 | **Mina** (mine): sticks to the platform, blinks faster for 3 s | 2 | 1.0 m |
| **Brutal** (brute) | rust and bronze, scale 1.3, red shield, glowing wings | 8 / 30 | **Kula** (orb): heavy, slow, homes in on the head | 3 | 1.4 m |

- **Bombers** (*Bombardier*): enemies that stay on the outer ring (about 2.6 m away) and only throw bombs in a high lob, every 9–13 s: one from wave 1, two from wave 5, on top of the melee enemies. Other enemies waiting on the outer ring just wait their turn. The inner ring punches. Bombs glow, trail sparks, and blink and beep faster as the fuse runs down.
- A **blast** hurts everything in its radius, player and enemies alike. Against an enemy it counts as 2 punches (shield first, then HP). A bomb the player throws back explodes on contact with an enemy.
- A bomb is caught with a grab. Punching a bomb detonates it on your fist.
- **Kula**: grabbing it stops it homing in, but its fuse keeps running. **Two hands** throw it at full power. **One hand** can hold it, but the hand sags under the weight and a one-hand throw is only a weak lob (about 30% of the hand's velocity), so it usually blows up within reach of you.

## Enemy tempo

- **Attack tempo**: since v0.7 one charge = windup about 0.7 s ±25%, swing 0.28 s, recover 0.35 s, then back out (v0.6 stood and punched repeatedly with a 1.6 s windup). Enemies fly in about 25% faster and spawn more often.
- **Front arc**: attackers stand within ±45° of where you face (bombers ±40°), inside the headset's view. Soldiers sometimes throw a 2-punch combo. Brutes add a slower overhead slam that has to be dodged, because it can't be blocked.
- **Shove** (*Odrzut*): a punch on a shield sends the enemy 2–3 m back. A **throw** sends it further. Either way the enemy has to fly round in an arc back into a front slot on the ring before it can attack again. It never attacks from behind or the side.

## Arena and enemy rhythm

- **Hull** (*Kadłub*): a steel ship wall behind the player with a 2×2 m **doorway** (*Właz*) the player stands in and guards. It is why enemies only come from the front, and nothing flies behind it.
- **Staging line**: melee enemies wait about 2.4 m out (±45°).
- **Charge** (*Szarża*): one to three at a time, an enemy dashes in to a strike spot (0.65 m), winds up about 0.7 s, throws one punch and flies straight back out (**hit and run**). It is in reach for about 1.5 s per visit.

## Session

- **Wave** (*Fala*): a timed fight.
- **Break** (*Przerwa*): between waves, with **no timer**. The player punches one upgrade card, then punches **DALEJ** to start the next wave. A suggested length (the menu's break setting) counts down on the HUD and then shows "GOTOWY?".
