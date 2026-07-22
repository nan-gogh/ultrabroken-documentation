---
title: "Mineru's Arm"
uid: "J7X"
draft: true
label: "MinArm"
versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
credits: ["mulberry", "Squidwest"]
date: "2025-12-07"
description: "Using Super Fuse Overload, the unique equipment used to control Mineru's 'arm' attachement point can be obtained."
aliases: []
tags: ["Equipment", "Zuggle", "Mineru", "Crash"]
---

# Mineru's Arm

## Summary

By completely filling the game's global dependency array, Sages and Sage Avatars can be forced to Overload Drop their equipment. Uniquely of all such equipment, Mineru's "arm" equipment can be picked up and retained.

_Discovered by mulberry; Mainfield route theorized by mulberry, found by Squidwest_

## Instructions

- There are two known routes to obtain Mineru's Arm: the "Ganon" route, which uses the version of Mineru in the Ganondorf battle, and the "Mainfield" route, which uses Mineru's sage avatar.
- The former is best performed with a "Local" SFO method, while the latter only works with a "Persistent" or "Permanent" SFO method.
- This page offers specific instructions per route, per version range. It is very possible to mix-and-match strategies, but the ones provided will usually be the fastest and easiest for the given version/route.

!!! warning "The pouch during SFO"

	Whenever SFO is active, swapping equipment via the full pouch menu is likely to produce additional persistent dependencies, which can badly interfere with some setups. To avoid this, always use the D-Pad to swap equipment during SFO.

=== "Ganon Route" ###

	=== "Overload Cold Fuse -> Map Zuggle" ####
		---
		versions: ["1.0.0", "1.1.0", "1.1.1"]
		---
	
		##### Requirements
		---
		notoc: true
		---
	
		- Mineru
		- 13 Zuggle Overload (9 on `1.0.0`)
		- At least 3 shields, 2 weapons, and a bow
		- A bucket-shaped Autobuild schematic, ideally with a Hover Stone and one or more Big Batteries (this can be made on-site)
		- The Autobuild ability

		##### Performing Super Fuse Overload
		---
		notoc: true
		---

		1. Defeat Ganondorf's Army (and any dungeon bosses present in the boss rush; no promises you won't crash if you don't)
		2. Enter the tunnel before Ganondorf's Room
		3. Overload Drop a weapon (`A`) and fuse it to a shield (`B`)
		4. Drop `B`, then duplicate 26 shields (`C1-C26`) using Overload (up to 20 of these may be dropped on the ground during this step, just be careful not to despawn `B`)
		5. Pick up B and Overload Cold Fuse `C1-C26` to `A`
		6. Faildrop `A` and drop `B`
		7. Overload Pickup `C1`
		8. Hold and drop 5 materials (`D1-D5`), Cold Fuse them to `C1`, then repeat until there are 25 materials (`D1-D25`) on the ground
		9. Faildrop `C1` and drop it aside
		10. Repeat steps 7-9 with each `C[n]`, using the same `D1-D25`
		11. After every other repetition, fuse pairs of `C[n]` together to keep under the drop limit
		12. Sometime during `C25` or `C26`, Link will begin Overload Dropping equipment inside the pause menu. _When you see this, move to step 13._
		13. Cold Fuse a random material to the current `C`. If it works correctly, collect the material and Cold Fuse the next `D[n]`, then repeat step 13. _If it fails, move to step 14._
		14. Unequip bow to free a dependency slot, then faildrop `C[n]` and drop it aside
		15. Drop `A` to prevent it from being deleted during the coming cutscene, then equip a shield and a weapon (the Master Sword, if it is owned)
		16. Create the bucket autobuild, activate it, and Ultrahand `B`, `C1-C26`, and `D1-D25` into the bucket
		17. Carry the bucket into Ganon's Room, keeping it plenty ahead of Link and out of the way of the upcoming battle

		##### Collecting Mineru's Arm
		---
		notoc: true
		---

		1. Ganondorf should Overload Drop his Gloom Sword during the cutscene, though not seeing this isn't necessarily a failure
		2. Check for "full" SFO by nocking an arrow. It should appear at Link's quiver, but not attach to his hand
		3. Without getting too far from the bucket (everything inside can still despawn from distance and must not), progress the fight to Phase 3 (sages blown away)
		4. Still without allowing SFO to lapse, find Mineru along the outer wall. From each of her arms, an undiscovered equipment should be repeatedly dropping
		5. With another weapon equipped and a free weapon pouch slot, pick up this equipment. It will immediately respawn, so there's no reason not to take a bunch
		6. Collect `D1-D30` to end SFO, then _undock the console_. Fusing to Mineru's Arm while docked crashes the game, which you assuredly do not want
		7. Fuse something to Mineru's Arm, it cannot be targeted with Recall otherwise, which will be needed later
		8. Equip the fused Arm, this is necessary to Zuggle it

		##### Map Zuggle and Retrieval
		---
		notoc: true
		---

		Mineru's Arm will naturally faildrop, so a wall is not needed to Zuggle it.

		1. Hold `L` and select the Map Rune
		2. Release `L`. While the Ability Wheel is closing, press (or mash) `D-Pad Right` to open the weapon Quick Menu
		3. Without letting the Quick Menu close, drop Mineru's Arm and swap to a droppable weapon (ie not the Master Sword)
		4. Let the Quick Menu close, which will open the Map. From there, open the weapon pouch and drop the newly-equipped weapon
		5. Unpause to confirm that Mineru's Arm has been zuggled, then load a save
		6. Go somewhere you can see a long way down (atop a Hover Stone raised with a Rocket is excellent), and prepare Recall
		7. Drop an equipped weapon and use Recall to catch Mineru's Arm
		8. Equip a weapon and collect Mineru's Arm, then save the game
		9. Before using Mineru's Arm as a portable faildrop wall, destroy the fuse

	=== "Overload Cold Fuse -> Simulated Portacull Zuggle" ####
		---
		versions: ["1.1.2"]
		---

		This zuggle method also works on `1.0.0-1.1.1`, but is needlessly complex. On `1.2.0+`, it will instead result in an Invizuggle, which is not just useless but actively harmful to the cause.

		##### Requirements
		---
		notoc: true
		---
	
		- Mineru
		- 13 Zuggle Overload
		- At least 3 shields, 2 weapons, and a bow
		- A bucket-shaped Autobuild schematic, ideally with a Hover Stone and one or more Big Batteries
		- An Intangible Aeroculling setup with a shield (`E`) as the SDC base, and the SDC/Wind in a depths culling area
		- The Autobuild ability

		##### Performing Super Fuse Overload
		---
		notoc: true
		---

		1. Defeat Ganondorf's Army (and any dungeon bosses present in the boss rush; no promises you won't crash if you don't)
		2. Enter the tunnel before Ganondorf's Room and drop `E` aside
		3. Overload Drop a weapon (`A`) and fuse it to a shield (`B`)
		4. Drop `B`, then duplicate 21 shields (`C1-C21`) using Overload (up to 19 of these may be dropped on the ground during this step, just be careful not to despawn `B` or `E`)
		5. Pick up B and Overload Cold Fuse `C1-C21` to `A`
		6. Faildrop `A` and drop `B`
		7. Overload Pickup `C1`
		8. Hold and drop 5 materials (`D1-D5`), Cold Fuse them to `C1`, then repeat until there are 30 materials (`D1-D30`) on the ground
		9. Faildrop `C1` and drop it aside
		10. Repeat steps 7-9 with each `C[n]`, using the same `D1-D30`
		11. After every other repetition, fuse pairs of `C[n]` together to keep under the drop limit
		12. Around halfway through `C20`, Link will begin Overload Dropping equipment inside the pause menu. _When you see this, move to step 13._
		13. Cold Fuse a random material to the current `C`. If it works correctly, collect the material and Cold Fuse the next `D[n]`, then repeat step 13. _If it fails, move to step 14._
		14. Unequip bow to free a dependency slot, then faildrop `C[n]` and drop it aside
		15. Drop `A` to prevent it from being deleted during the coming cutscene, then pick up `E` and equip a weapon (the Master Sword, if it is owned)
		16. Create the bucket autobuild, activate it, and Ultrahand `B`, `C1-C21`, and `D1-D30` into the bucket
		16. Carry the bucket into Ganon's Room, keeping it plenty ahead of Link and out of the way of the upcoming battle

		##### Collecting Mineru's Arm
		---
		notoc: true
		---

		1. Ganondorf should Overload Drop his Gloom Sword during the cutscene, though not seeing this isn't necessarily a failure
		2. Check for "full" SFO by nocking an arrow. It should appear at Link's quiver, but not attach to his hand
		3. Without getting too far from the bucket (everything inside can still despawn from distance and must not), progress the fight to Phase 3 (sages blown away)
		4. Still without allowing SFO to lapse, find Mineru along the outer wall. From each of her arms, an undiscovered equipment should be repeatedly dropping
		5. With another weapon equipped and a free weapon pouch slot, pick up this equipment. It will immediately respawn, so there's no reason not to take a bunch
		6. Collect `D1-D30` to end SFO, then _undock the console_. Fusing to Mineru's Arm while docked crashes the game, which you assuredly do not want
		7. Fuse something to Mineru's Arm, it cannot be targeted with Recall otherwise, which will be needed later
		8. Equip the fused Arm, this is necessary to Zuggle it

		##### Simulated Portacull Map Zuggle and Retrieval
		---
		notoc: true
		---

		Mineru's Arm will naturally fail-drop, so a wall is not needed to Zuggle it.

		1. Use Ultrahand and Autobuild to create a build of a real, collectible material attached to a "goo" Steering Stick, with the Steering Stick able to sit flat on the ground
		2. Drop `E` and stand on the center of the Steering Stick, with the material pickup prompt active
		3. Press `A` and a D-Pad direction at the same time, so that the material is collected and a Quick Menu is opened
		4. Allow the Quick Menu to close while holding `L`, so that the Ability Wheel opens at the earliest possible moment, and select the Map Rune
		5. Release `L`. While the Ability Wheel is closing, press (or mash) `D-Pad Right` to open the weapon Quick Menu
		6. Without letting the Quick Menu close, drop Mineru's Arm and swap to a droppable weapon (ie not the Master Sword)
		7. Let the Quick Menu close, which will open the Map. From there, open the weapon pouch and drop the newly-equipped weapon
		8. If it cannot be dropped, Link did not cull at the correct time. Ensure the Aeroculling setup is functional and try again
		9. After a success, unpause to confirm that Mineru's Arm has been zuggled, then load a save
		10. Go somewhere you can see a long way down (atop a Hover Stone raised with a Rocket is excellent), and prepare Recall
		10. Drop an equipped weapon and use Recall to catch Mineru's Arm
		11. Equip a weapon and collect Mineru's Arm, then save the game
		12. Before using Mineru's Arm as a portable faildrop wall, destroy the fuse

	=== "Overload Cold Fuse -> Swap Resync Zuggle" ####
		---
		versions: ["1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
		---

		"Purgatory + Ghost DI" will probably be faster as an SFO method, but it's more complex. Go learn that if you like.

		##### Requirements
		---
		notoc: true
		---
	
		- Mineru
		- 13 Zuggle Overload
		- At least 3 shields, 2 weapons, and a bow
		- A bucket-shaped Autobuild schematic, ideally with a Hover Stone and one or more Big Batteries
		- A Portacull Shield or the resources to make one later via Overload Cold Fuse/Arrow SDC
		- The Autobuild ability

		##### Performing Super Fuse Overload
		---
		notoc: true
		---

		1. Defeat Ganondorf's Army (and any dungeon bosses present in the boss rush; no promises you won't crash if you don't)
		2. Enter the tunnel before Ganondorf's Room
		3. Overload Drop a weapon (`A`) and fuse it to a shield (`B`)
		4. Drop `B`, then duplicate 21 shields (`C1-C21`) using Overload (up to 19 of these may be dropped on the ground during this step, just be careful not to despawn `B` or the Portacull)
		5. Pick up B and Overload Cold Fuse `C1-C21` to `A`
		6. Faildrop `A` and drop `B`
		7. Overload Pickup `C1`
		8. Hold and drop 5 materials (`D1-D5`), Cold Fuse them to `C1`, then repeat until there are 30 materials (`D1-D30`) on the ground
		9. Faildrop `C1` and drop it aside
		10. Repeat steps 7-9 with each `C[n]`, using the same `D1-D30`
		11. After every other repetition, fuse pairs of `C[n]` together to keep under the drop limit
		12. Partway into `C21`, Link will begin Overload Dropping equipment inside the pause menu. _When you see this, move to step 13._
		13. Cold Fuse a random material to the current `C`. If it works correctly, collect the material and Cold Fuse the next `D[n]`, then repeat step 13. _If it fails, move to step 14._
		14. Unequip bow to free a dependency slot, then faildrop `C[n]` and drop it aside
		15. Drop `A` to prevent it from being deleted during the coming cutscene, then equip a shield (the Portacull, if it exists) and a weapon (the Master Sword, if it is owned)
		16. Create the bucket autobuild, activate it, and Ultrahand `B`, `C1-C21`, and `D1-D30` into the bucket
		16. Carry the bucket into Ganon's Room, keeping it plenty ahead of Link and out of the way of the upcoming battle

		##### Collecting Mineru's Arm
		---
		notoc: true
		---

		1. Ganondorf should Overload Drop his Gloom Sword during the cutscene, though not seeing this isn't necessarily a failure
		2. Check for "full" SFO by nocking an arrow. It should appear at Link's quiver, but not attach to his hand.
		3. Without getting too far from the bucket (everything inside can still despawn from distance and must not), progress the fight to Phase 3 (sages blown away)
		4. Still without allowing SFO to lapse, find Mineru along the outer wall. From each of her arms, an undiscovered equipment should be repeatedly dropping
		5. With another weapon equipped and a free weapon pouch slot, pick up this equipment. It will immediately respawn, so there's no reason not to take a bunch
		6. Collect `D1-D30` to end SFO, then _undock the console_. Fusing to Mineru's Arm while docked crashes the game, which you assuredly do not want
		7. Fuse something to Mineru's Arm, it cannot be targeted with Recall otherwise, which will be needed later
		8. Equip the fused Arm, this is necessary to Zuggle it

		##### Swap Resync Zuggle and Retrieval
		---
		notoc: true
		---

		Mineru's Arm will naturally faildrop, so a wall is not needed to Zuggle it. These steps include additional buffer drops to widen the Pause Buffer timing window.

		1. If a Portacull Shield is not already prepared, create one. Either way, equip it and **pause** the game
		2. **Drop** a buffer equipment item
		3. **Drop** the Portacull Shield and **swap** to another shield
		4. **Drop** 2 more buffer items (not the swapped-to shield)
		5. **Drop** Mineru's Arm and **swap** to another droppable weapon (ie not the Master Sword)
		6. **Pause Buffer** (unpause and pause again 3-4 frames later; any faster will eat the input and any slower is too slow)
		7. **Swap**, **equip**, or **unequip** any armor or bow
		8. **Drop** the swapped-to weapon and **unpause**
		9. Check that Mineru's Arm has been zuggled, then load a save
		10. Go somewhere you can see a long way down (atop a Hover Stone raised with a Rocket is excellent), and prepare Recall
		11. Drop an equipped weapon and use Recall to catch Mineru's Arm
		12. Equip a weapon and collect Mineru's Arm, then save the game
		13. Before using Mineru's Arm as a portable faildrop wall, destroy the fuse

	#### Faildrop Zuggle

	Instead of fusing something to Mineru's Arm and recalling the fuse during retrieval, it is also possible to maintain the pickup prompt while it is zuggled. This requires additional timed inputs, but it allows for much safer retrieval. These steps start from having already collected one or more Arms and ending SFO:

	1. Fill the weapon pouch
	2. Swap from a random weapon to Mineru's Arm so that the latter will Overload Drop
	3. Faildrop Mineru's Arm so that it returns to Link, and on the last frame before it returns, press A to attempt to pick it up
	4. If timed correctly, Mineru's Arm will still have a pickup prompt despite being equipped. _This will end if it is sheathed/unsheathed, so leave it where it is_
	5. Proceed with whichever Zuggle method is being used; the pickup prompt will stay through the zuggle and through loading a save
	6. After loading to a progressed save, simply equip a weapon and collect Mineru's Arm (if it was zuggled to Link's back, this may require some finagling)

=== "Mainfield Route" ###

	=== "Aerophasing Permacull" ####
		---
		versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2"]
		---

		Ooh I have to test an absurd idea. Or maybe I _get_ to test it? Well for now I'm gonna write the aerophasing steps as a placeholder.

		##### Requirements
		---
		notoc: true
		---

		- Mineru
		- An Intangible Aeroculling setup

		##### Performing SFO
		---
		notoc: true
		---

		1. Enter a shrine/Ganon's Tunnel or, whatever. Sorry I'm still thinking this through
		2. Drop the Aeroculling base and make an unglued platform
		3. Get a weapon and/or shield Drop Smuggle/Zuggle and duplicate fused items of the same type
		4. Stand on the platform so that Link begins phasing
		5. Do... whatever the thing you're supposed to is... to pcull the fused items. I have migraine approaching
		6. Keep going. Continue. You need to do MORE. 600 at LEAST.
		7. And then, when the equipped items stop attaching correctly and/or lose their fuses in-world, you're done.

		##### Collecting Mineru's Arm
		---
		notoc: true
		---

		1. Equip a weapon and ensure there is space in your weapon pouch
		2. Warp to any of the three Sky Labyrinths. Other low-gravity zones are observed to crash the game during SFO
		3. As soon as you gain control of Link, walk in a small clockwise circle while spamming A (see "Mainfield Mineru's Arm Route" resource below)
		4. Execution permitting, you will pick up a new 2-handed weapon, dealing 38 damage (as listed in the menu), which has no icon, description, model, or collision, and is called MsgNotFound
		5. If unsuccessful, stand about halfway between the shrine's warp point and its left/east "Dragon pillar", and spam A between Panic Blood Moons (see "Mainfield Route Backup Strat" resource below)
		6. If Mineru was not summoned in advance, simply summon her after the warp (and optionally warp again to get a go at the primary strat)
		7. About 3 seconds after control is gained, a panic blood moon will occur, which will _usually_ give an autosave. Further PBMs will occur much sooner than the first, and are unlikely to provide an autosave
		8. Make a hard save if desired, then close the game to clear SFO if desired

	=== "Nested Overload Batch DI" ####
		---
		versions: ["1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
		---

		You get a better and more streamlined setup because you're on current. Yay!

		##### Requirements
		---
		notoc: true
		---

		- Mineru
		- 13 Zuggle Overload
		- 2 DI Ghost weapons (one is `A1`, the other is unnamed)
		- 2 DI Ghost shields (one is `A2`, the other is unnamed)
		- A bow and at least one arrow

		##### Performing Super Fuse Overload
		---
		notoc: true
		---

		=== "Condensed" ######
		
			1. Enter a shrine (Rasitakiwak is the most tested choice), defeat any constructs which are present, and delete their weapons
			2. `A1` Overload FE shield `B` and Recall Lock it
			3. `A2` and `B` Ghost DI weapon `C`
			4. `A2` Overload FE weapon `D1`; leave `A2` Zuggle Dropped
			5. Equip `B`, Smuggle `C`, and Overload Pickup `D1`
			6. `B`, `C`, and `D1` Overload Batch DI 25 weapons `E1-E25`
			7. Drop `D1` (don't bother faildropping), then pick up and drop `C` to undo its Zuggle Drop
			8. `A2` Overload FE weapon `D2`; leave `A2` Zuggle Dropped
			9. Throw purgatorize `E1-E25`
			10. Equip `B` and Overload Pickup `D2`
			11. `B`, `E1-E25`, and `D2` Overload Batch DI 24 shields `F1-F24`
			12. Leave `B` dropped, then faildrop `D2` and drop it once it returns, and finally pick up and drop `A2` to undo its Zuggle Drop
			13. If desired, check for "full" SFO: Use the D-Pad to equip an unfused weapon and shield, then try to nock an arrow. If it appears, but does not attach to Link's hand, full SFO is reached

		=== "Expanded" ######

			1. Enter a shrine (Rasitakiwak is the most tested choice), defeat any constructs which are present, and delete their weapons
			2. `A1` Overload FE shield `B` and Recall Lock it
			3. `A2` and `B` Ghost DI weapon `C`
			4. `A2` Overload FE weapon `D1`; leave `A2` Zuggle Dropped
			5. Equip `B`, Smuggle `C`, and Overload Pickup `D1`
			6. `B`, `C`, and `D1` Overload Batch DI 25 weapons `E1-E25`:
				1. Fuse `E[n]` to weapons twice and pause 2-7 frames after the second Fuse input
				2. Drop-swap-unequip `B` to DI `E[n]`; can use faildrop-swap-unequip to not have to pick up `B` every cycle
				3. Pick up `B` (if needed) and repeat 6a-6b with the next `E[n]`
			7. Drop `D1` (don't bother faildropping), then pick up and drop `C` to undo its Zuggle Drop
			8. `A2` Overload FE weapon `D2`; leave `A2` Zuggle Dropped
			9. Throw purgatorize `E1-E25`:
				1. Smuggle `E1`
				2. Pick up E2 and throw it
				3. Unsheathe E2 to return it to hand
				4. Repeat 9a-9c with each E, using any random weapon for the last throw
				5. If there are fewer than 25 weapons, don't worry about it
			10. Equip `B` and Overload Pickup `D2`
			11. `B`, `E1-E25`, and `D2` Overload Batch DI 24 shields `F1-F24`:
				1. Fuse `F[n]` to weapons twice and pause 2-7 frames after the second Fuse input
				2. Starting with `F2`, the second Fuse input will cause a strong lag spike, so pausing with the D-Pad is easier
				3. Drop-swap-unequip `B` to DI `F[n]`; _faildrop is not advised_ due to the risk of dropping the D-Pad input
				4. Pick up `B` and repeat 11a-11c with the next `F[n]`
				5. If there were more/fewer than 25 weapons in Step 9, fewer/more shields may be needed to compensate
				6. For the last few fuses, check on Menu Link after each DI. When he starts looking folded, SFO is likely complete
			12. Leave `B` dropped, then faildrop `D2` and drop it once it returns, and finally pick up and drop `A2` to undo its Zuggle Drop
			13. If desired, check for "full" SFO: Use the D-Pad to equip an unfused weapon and shield, then try to nock an arrow. If it appears, but does not attach to Link's hand, full SFO is reached

		=== "Extremely Verbose" ######

			1. Enter a shrine (Rasitakiwak is the most tested choice), defeat any constructs which are present, and delete their weapons
			2. `A1` Overload FE shield `B` and Recall Lock it:
				1. Smuggle `A1`
				2. Overload Drop a weapon and fuse it to a shield
				3. Fuse `B` to weapons just once
				4. Swap weapon to resync, then drop it
				5. Pick up and drop `A1` to remove its Zuggle Drop
				6. Position `B` where desired, Recall it, and load a save while Recall is active
			3. `A2` and `B` Ghost DI weapon `C`:
				1. Smuggle `A2` and equip `B`
				2. Fuse `C` to shields and pause a few frames later
				3. Drop-swap-unequip `B` to DI `C`
			4. `A2` Overload FE weapon `D1`; leave `A2` Zuggle Dropped:
				1. Smuggle `A2`
				2. Overload Drop a shield and fuse it to a weapon
				3. Fuse `D1` to shields just once
				4. Swap shield to resync, then drop it
			5. Equip `B`, Smuggle `C`, and Overload Pickup `D1`
			6. `B`, `C`, and `D1` Overload Batch DI 25 weapons `E1-E25`:
				1. Fuse `E[n]` to weapons twice and pause 2-7 frames after the second Fuse input
				2. Drop-swap-unequip `B` to DI `E[n]`; can use faildrop-swap-unequip to not have to pick up `B` every cycle
				3. Pick up `B` (if needed) and repeat 6a-6b with the next `E[n]`
			7. Drop `D1` (don't bother faildropping), then pick up and drop `C` to undo its Zuggle Drop
			8. `A2` Overload FE weapon `D2`; leave `A2` Zuggle Dropped:
				1. Smuggle `A2`
				2. Overload Drop a shield and fuse it to a weapon
				3. Fuse `D2` to shields just once
				4. Swap shield to resync, then drop it
			9. Throw purgatorize `E1-E25`:
				1. Smuggle `E1`
				2. Pick up E2 and throw it
				3. Unsheathe E2 to return it to hand
				4. Repeat 9a-9c with each E, using any random weapon for the last throw
				5. If there are fewer than 25 weapons, don't worry about it as long as there are at least 20
			10. Equip `B` and Overload Pickup `D2`
			11. `B`, `E1-E25`, and `D2` Overload Batch DI 24 shields `F1-F24`:
				1. Fuse `F[n]` to weapons twice and pause 2-7 frames after the second Fuse input
				2. Starting with `F2`, the second Fuse input will cause a strong lag spike, so pausing with the D-Pad is easier
				3. Drop-swap-unequip `B` to DI `F[n]`; _faildrop is not advised_ due to the risk of dropping the D-Pad input
				4. Pick up `B` and repeat 11a-11c with the next `F[n]`
				5. If there were more/fewer than 25 weapons in Step 9, fewer/more shields may be needed to compensate
				6. For the last few fuses, check on Menu Link after each DI. When he starts looking folded, SFO is likely complete
			12. Leave `B` dropped, then faildrop `D2` and drop it once it returns, and finally pick up and drop `A2` to undo its Zuggle Drop
			13. If desired, check for "full" SFO: Use the D-Pad to equip an unfused weapon and shield, then try to nock an arrow. If it appears, but does not attach to Link's hand, full SFO is reached

		##### Collecting Mineru's Arm
		---
		notoc: true
		---

		1. Equip a weapon and ensure there is space in your weapon pouch
		2. Warp to any of the three Sky Labyrinths. Other low-gravity zones are observed to crash the game during SFO
		3. As soon as you gain control, walk in a small clockwise circle while spamming A (see "Mainfield Mineru's Arm Route" resource below)
		4. Execution permitting, you will pick up a new 2-handed weapon, dealing 38 damage (as listed in the menu), which has no icon, description, model, or collision, and is called MsgNotFound
		5. If unsuccessful, stand about halfway between the shrine's warp point and its right "Dragon pillar", and spam A between Panic Blood Moons (see "Mainfield Route Backup Strat" resource below)
		6. If Mineru was not summoned in advance, simply summon her after the warp (and optionally warp again to get a go at the primary strat)
		7. About 3 seconds after control is gained, a panic blood moon will occur, which will _usually_ give an autosave. Further PBMs will occur much sooner than the first, and are unlikely to provide an autosave
		8. Make a hard save if desired, then close the game to clear SFO if desired

	#### Other SFO Methods

	Due to the simple (yet arduous) criteria of Super Fuse Overload, there are several ways to perform it that either lend themselves well to being made persistent, or are themselves naturally persistent. The methods selected here are generally regarded to be the most efficient, but this can and will change. Ultimately, the best method is the one you are willing to do.

## Notes

### Properties

#### As a weapon:
---
notoc: true
---

- Mineru's Arm is a 40 damage, 40 durability 2-handed weapon with no model, collision, name, or description.
- It can be guarded with, even if it does not have a shield fused to it.
- It can be fused to, but doing so can crash the game (see below).
- Though there is a seperate Left and Right arm, picking up either adds the Left arm to the pouch.

#### Crashing:
---
notoc: true
---

- If the game attempts to generate an icon for a fused Mineru's Arm while running in Docked Mode, the game will crash.
- This happens both on the initial fuse, and when picking up or fail-dropping a fused arm.
- By having another fused item generate an icon just before Mineru's Arm does, it will inherit a corrupted version of the first item's icon. This prevents the game crash above.

#### As a tool:
---
notoc: true
---

- While standing on the ground, or in certain (very limited) airborne circumstances, Mineru's Arm will always fail-drop.
- This also causes anything later than it in the drop queue to fail-drop as well.
- Thus, Mineru's Arm can be used as a portable wall whenever _nearly any_ glitch requires a fail-drop to occur at some moment.

### Credits

- Mineru's Arm ganon route found by mulberry - Dec 07th, 2025
- Mineru's Arm mainfield route found by Squidwest - Mar 18th, 2026

### Resources

??? info "Video Resources"

	??? tip "Retrieving Fused+Zuggled Mineru's Arm"

		placeholder

	??? tip "Mainfield Route Primary Strat"

		placeholder

	??? tip "Mainfield Route Backup Strat"

		placeholder

??? quote "Discord Resources"

	- [Original Mineru's Arm Get](https://discord.com/channels/1086729144307564648/1110956205624532993/1447304812197838930)
	- [Mainfield Mineru's Arm Route](https://discord.com/channels/1086729144307564648/1113557914444111873/1484238374909902868)
	- [Mainfield Route Backup Method](https://discord.com/channels/1086729144307564648/1110956205624532993/1510038404178383040)

### Related
- [Zuggle Overload](search:Zuggle Overload)
- [Despawn Interrupt](search:Despawn Interrupt)
- [Fuse Entanglement](search:Fuse Entanglement)

### page todos ?
---
notoc: true
---

- embed important clips instead of just linking to them
- do that crazy Mineru SDC Pcull idea and see if it's peak (Update: It's... okay. In theory it could even be used for Zelda's Torch. But it's just a lot to wrap your head around.)
- Do the new DI hover stone SFO and see if it's peak enough to supersede nested batch DI
- double-check steps and formatting
- see about adding the verbosity meter to other step lists if pertinent
