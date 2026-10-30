# Orbital Brawl — glossary

Domain terms for the game. UI terms are Polish. The English name is what the code and docs use.

## Hand stances

Each hand is always in exactly one stance, set by the controller buttons:

- **Fist** (*Pięść*): the grip (`buttons[1]`, under the middle finger) is held. If both buttons are held, the fist wins. A fist punches and grabs.
- **Blade hand** (*Dłoń bojowa*): only the index trigger (`buttons[0]`) is held. The fingers are straight and tight, with the thumb pressed along them (karate shuto / nukite / haishu). It does all the open-hand strikes. The old *Cięcie* (chop through the neck) is now a blade-hand strike.
- **Loose hand** (*Luźna dłoń*): nothing is held. It does no damage. Closing a loose hand into a fist is what grabs (see *Grab*).

_Avoid_: "open palm" on its own, because it doesn't say whether the hand is loose or a blade hand.

## Grabbing and throwing

- **Grab** (*Chwyt*): a loose hand closing into a fist within about 12 cm of something grabbable: an enemy bomb, an enemy forearm or wrist, or the torso. A hand that is already a fist when it reaches the target punches instead. It never grabs.
- **Bomb throw**: the bomb flies when you release the grip, with your hand's velocity. If you hold a bomb too long, it explodes in your hand.
- **Drag** (*Ciągnięcie*): a grab on an enemy's arm, fist or torso (any non-stunned enemy). The enemy trails your hand with lag weighted by its mass. The other hand can still punch it.
- **Arm throw** (*Rzut*): while dragging, a yank (hand moving faster than 1.5 m/s) throws the enemy along that direction; heavy enemies fly shorter. If you hold an enemy for more than 2 s without throwing, it breaks free and gets a free punch. A thrown enemy has to fly back round and attack from the front again.
- When a grenade is within reach of the closing hand, the grab catches the grenade, not the enemy.
- **Rip** (*Rozerwanie*): both hands grab the torso, then pull apart **vertically** (one hand up, one down). The torso tears at the waist into upper and lower halves.

## Enemy durability

- **Shield** (*Pole siłowe*): grunt 0, soldier 2, brute 4 (since v0.6; it was 0/4/8). While it is up, hits drain the shield. A punch drains 1 and **shoves** the enemy back about 2–3 m. A blade-hand strike drains 2 with only a small shove. The shield regenerates slowly after 5 s without being hit.
- **One-hit kill** (*Miazga*): once the shield is down, any hit kills a grunt or soldier with a gory finish: the head comes off (neck chop, or a punch to the head), or the robot shatters into head, arms, chest and hips, or limbs tear off. (Before v0.6 enemies had 10/20/30 HP.)
- **Stun** (*Ogłuszenie*): only brutes. The first hit after their shield is down stuns them for about 4 s instead of killing. If the stun runs out, they recover with no shield.
- **Fatality**: killing a **stunned** brute with a special move: rip or blade-hand decapitation (later: ear clap, nukite through the chest). It refunds 3 mana. Any other hit on a stunned brute is a plain kill.
- The **rip** can only be done on a stunned enemy.

_Avoid_: "resilience" or "armor" for the shield.

## Strikes

- **Punch** (*Cios*): a fist hitting the torso or head while moving away from the player.
- **Blade strikes** (all with the blade hand): **shuto** (edge of the hand through the neck or torso), **nukite** (fingertips driven forward into the chest), **haishu** (backhand: the back of the hand swung outward).
- **Ear clap** (*Klaśnięcie w uszy*): both hands in blade-hand stance strike opposite sides of the head within 0.15 s of each other, each moving inward. Against a shield it drains 3 and briefly dazes the enemy (it pauses its attack). Otherwise it deals 8 HP. On a stunned enemy it is a fatality: the head bursts.

## Mana

- **Mana** (*Mana*): a pool of 10 that refills at about 1 point per 2 s. It is shown on the right wrist watch (HP is on the left). It pays for the strong moves: a blade strike costs 1, an ear clap 3, and a fatality is free and refunds some mana. Punches are free. With an empty pool, a blade hand acts as a loose hand.

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

- **Attack tempo**: windup about 1.6 s ±25%, swing 0.28 s, recover 0.35 s (v0.6; was 2.2 / 0.32 / 0.45, and 3.6 / 0.42 / 0.7 before that). Enemies fly in about 25% faster and spawn more often.
- **Front arc**: attackers stand within ±45° of where you face (bombers ±40°), inside the headset's view. Soldiers sometimes throw a 2-punch combo. Brutes add a slower overhead slam that has to be dodged, because it can't be blocked.
- **Shove** (*Odrzut*): a punch on a shield sends the enemy 2–3 m back. A **throw** sends it further. Either way the enemy has to fly round in an arc back into a front slot on the ring before it can attack again. It never attacks from behind or the side.

## Session

- **Wave** (*Fala*): a timed fight.
- **Break** (*Przerwa*): between waves, with **no timer**. The player punches one upgrade card, then punches **DALEJ** to start the next wave. A suggested length (the menu's break setting) counts down on the HUD and then shows "GOTOWY?".
