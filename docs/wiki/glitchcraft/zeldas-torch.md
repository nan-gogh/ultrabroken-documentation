---
title: "Zelda's Torch"
uid: "TW8"
label: "ZTorch"
versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
credits: ["Aergyl", "ArmindoEmiya", "Blackmars", "Jordan", "KiloVictor", "MandelbrotChaylay", "mulberry", "Pearfalse", "Squidwest", "Toti Sauce"]
date: "2025-12-06"
description: "Using Super Fuse Overload, the unique torch Zelda carries in the prologue can be obtained."
aliases: [""]
tags: ["Equipment", "Zelda"]
---

# Zelda's Torch

## Summary

By completely filling the game's global dependency array with persistent dependencies, Prologue Zelda can be forced to Overload Drop her torch, which has unique properties. Once obtained in the prologue, it can be transferred to a progressed file in the same way as the Prologue Master Sword.

_First obtained by mulberry - Dec 07th, 2025_

_Prologue transfer methods developed by absolute committee_

_(original SRZ credited to Aergyl, Jordan, KiloVictor, MandelbrotChaylay, mulberry, Toti Sauce, & Yee)_

_(new CDZ methods credited to all of the above, plus ArmindoEmiya, Blackmars, Pearfalse, & Squidwest)_

## Instructions

- This page will offer three guides, each tailored for a specific version range.
- There are other combinations of SFO Methods and transfer methods that will work on each version, but something had to go to make this page readable and I chose variations.
- The provided combinations are the most efficient on the listed version ranges.

=== "Overload CF->Pcull + SLD" ###
	---
	versions: ["1.0.0", "1.1.0", "1.1.1"]
	---

	- These versions predate the addition of active smuggles causing "D-Pad Lock", so they can perform Save Load Dupe on Zelda's Torch without having to cull Link.
	- This in turn avoids invoking the "Callback", which requires specific workarounds to overcome in all newer patches.
	- However, they also predate Drop-Swap Culling, so they are more or less required to use Method 4 of Super Fuse Overload, which is moderately more difficult than Method 1.

	#### Part 1: Prep
	---
	notoc: true
	---

	1. By whichever means desired, get 13 Zuggle Overload (9 on `1.0.0`)
	2. Prepare a DI Ghost Shield (`E`). This is technically optional, but it saves time and complexity and the steps assume you have it. Get it.
	3. Create an Intangible Aeroculling setup. Any surface culling area may be used, but it _must_ have a recall-locked platform.
	4. You will also need several unfused weapons and shields, a bow, at least one arrow, and a material.

	#### Part 2: SFO and Torch Collection
	---
	notoc: true
	---

	##### 2a: Performing SFO

	1. Use the Aerophasing setup to ensure it has a cull stored; this will allow the setup to continue working within a shrine
	2. Zuggle the AC base; this will keep the cull stored through loading screens
	3. Warp to Marakuguc Shrine in Goron City. It has a large and early overlap with the prologue. Defeat the construct inside and destroy its bow
	4. Overload Drop a weapon (`A`) and fuse it to a shield (`B`)
	5. Drop `B`, then duplicate 26 shields (`C1-C26`) using Overload (up to 20 of these may be dropped on the ground during this step, just be careful not to despawn `B`)
	6. Pick up `B` and Overload Cold Fuse `C1-C26` to `A`
	7. Faildrop `A` and drop `B`
	8. Overload Pickup `C1`
	9. Duplicate 25 shields `D1-D25` off `E`, dropping each on the ground and **Overload Cold Fusing** them to `C1` as you go
	10. **Fail-drop** `C1` and **drop** it aside
	11. Repeat steps 8-10 with each `C[n]`, using the **same** `D1-D25` instead of duping a new set
	12. After every other repetition, fuse pairs of `C[n]` together to keep under the drop limit
	13. Sometime during `C25` or `C26`, Link will begin Overload Dropping equipment inside the pause menu. _When you see this, move to step 13._
	14. **Overload Cold Fuse** an unrelated material to `C[n]`. If it works, **Collect it** and **Overload Cold Fuse** the next `D[n]`, then repeat. If it fails, _proceed to step 12_
	15. **Fail-drop** `C[n]` and **drop** it. You may have to **unequip your bow** for it to return. **Be sure it returns before dropping it.**
	16. **Drop** `A`

	##### 2b: Permaculling the shields

	1. [Drop Zuggle](uid:0YL) a shield. If `E` was prepared, it can be used.
	2. Equip one of `B`, `C[n]`, or `D[n]` and step onto the phasing platform
	3. **Pause** the game while Link is **culled**. This will cause Link to consistently be **unculled** when the game is unpaused.
	4. Wait a moment, then **pause buffer** so that Link is still **unculled** behind the menu. After re-pausing, promptly **drop** the equipped shield to permacull it.
	5. Repeat steps 2-4 for _all_ `B`, `C[n]`, and `D[n]`, ultimately resulting in the entire setup being permaculled

	##### 2c: Collecting Zelda's Torch in the prologue

	1. Return to the title screen and begin a new file. This will only enter the prologue scenario and create occasional autosaves (up to 5, but typically 4), so don't fret about your progressed file
	2. As soon as the prologue is entered and an autosave received, reload to Marakuguc Shrine
	3. Use the D-Pad to unequip all equipment, then resync Link's armor, and finally use the D-Pad to re-equip items until a nocked arrow fails to attach to the bow (and instead just floats there)
	4. Load back to the prologue. Zelda will drop her torch, so pick it up. Provided you were at absolute maximum SFO before loading, she should always drop it
	5. ...But if not, any SFO strong enough to generate menu effects will do, given enough tries. Thus, spam-reloading the first prologue autosave is also a viable (if random) option
	6. Once the torch has been obtained, continue until another prologue autosave is received
	7. **Close the game** to end SFO

	#### Part 3: Save Load Dupe
	---
	notoc: true
	---

	1. Reopen the game and check to make sure you still have a Marakuguc autosave. If not, go get one
	2. Load the prologue autosave that has Zelda's Torch obtained, and move as far backwards as Zelda will let you (at least to before the Luminous Stone Room)
	3. Equip Zelda's Torch and **unpause** to make sure Link has it equipped in-world
	4. **Pause** the game, **drop** Zelda's Torch, and **swap** to another weapon (likely, you only have the Prologue Master Sword)
	5. **Pause buffer** (unpause and pause again 3 frames later; any earlier will eat the input and any later is too late)
	6. **Drop** the swapped-to weapon and **load** the Marakuguc autosave
	7. If SLD was performed correctly, Zelda's Torch should be in the room with the Soldier Construct
	8. Collect Zelda's Torch and save the game
	9. If the SLD was failed for any reason, simply try again

	#### Part 4: Bonuses
	---
	notoc: true
	---

	- This is a lot of work for a torch, even if it's really cool. But if you're careful, you can also obtain Mineru's Arm and Prologue Master Sword during this setup, for very little extra work. Like shockingly little.

	##### Adjustments for Mineru's Arm

	1. Before beginning Part 2a, summon Mineru's Sage Avatar.
	2. After completing Part 2b, before returning to the title screen, warp to Mogisari Shrine, at Lomei Sky Labyrinth in the northeastern sky.
	3. Follow [These steps](uid:J7X#collecting-minerus-arm_1) to collect Mineru's Arm.
	4. Manually save the game. (trying to return to Marakuguc during SFO is asking for it)
	5. Proceed as normal with Part 2c.
	6. In Part 3, load the manual save and get a new Marakuguc autosave
	7. Load to that new autosave at the end of Part 3

	##### Adjustments for the Prologue Master Sword

	1. After Part 3, step 8 ("Collect Zelda's Torch and save the game"), reload the prologue autosave that has Zelda's Torch again.
	2. Repeat the SLD, but start with the Prologue Master Sword equipped, SLDing it instead.
	3. Yeah this is basically a free addon for `1.0.0-1.1.1`.

=== "Overload CF->Pcull + CDZ (1.1.2 type)" ###
	---
	versions: ["1.1.2"]
	---

	- `1.1.2` is in a particularly awkward position, postdating D-Pad Lock but predating Drop-Swap Culling.
	- However, through the combined efforts of many excellent glitch hunters, a consistent, prologue-friendly weapon Zuggle has been developed.
	- Rejoice, and learn.

	#### Part 1: Prep
	---
	notoc: true
	---

	1. Having Mineru unlocked will be needed for the steps as written. There are workarounds but they're beyond the scope of this article.
	2. By whichever means desired, get 13 Zuggle Overload.
	3. Prepare a DI Ghost Shield (`E`). This is technically optional, but it saves time and complexity and the steps assume you have it. Get it. Besides, you need to know some DI tech for later.
	4. Create an Intangible Aeroculling setup, with a shield base. Any surface culling area may be used, but it _must_ have a recall-locked platform.
	5. You will also need several unfused weapons and shields, a bow, at least one arrow, and a material.

	#### Part 2: SFO and Torch Collection
	---
	notoc: true
	---

	##### 2a: Performing SFO

	1. Use the Aerophasing setup to ensure it has a cull stored; this will allow the setup to continue working within a shrine
	2. Zuggle the AC base; this will keep the cull stored through loading screens
	3. Warp to Marakuguc Shrine in Goron City. It has a large and early overlap with the prologue. Defeat the construct inside and destroy its bow
	4. Overload Drop a weapon (`A`) and fuse it to a shield (`B`)
	5. Drop `B`, then duplicate 21 shields (`C1-C21`) using Overload (up to 20 of these may be dropped on the ground during this step, just be careful not to despawn `B`)
	6. Pick up `B` and Overload Cold Fuse `C1-C21` to `A`
	7. Faildrop `A` and drop `B`
	8. Overload Pickup `C1`
	9. Duplicate 30 shields `D1-D30` off `E`, dropping each on the ground and **Overload Cold Fusing** them to `C1` as you go
	10. **Fail-drop** `C1` and **drop** it aside
	11. Repeat steps 8-10 with each `C[n]`, using the **same** `D1-D30` instead of duping a new set
	12. After every other repetition, fuse pairs of `C[n]` together to keep under the drop limit
	13. Sometime during `C21`, Link will begin Overload Dropping equipment inside the pause menu. _When you see this, move to step 13._
	14. **Overload Cold Fuse** an unrelated material to `C[n]`. If it works, **Collect it** and **Overload Cold Fuse** the next `D[n]`, then repeat. If it fails, _proceed to step 12_
	15. **Fail-drop** `C[n]` and **drop** it. You may have to **unequip your bow** for it to return. **Be sure it returns before dropping it.**
	16. **Drop** `A`
	
	##### 2b: Permaculling the shields

	1. [Drop Zuggle](uid:0YL) a shield. If `E` was prepared, it can be used.
	2. Equip one of `B`, `C[n]`, or `D[n]` and step onto the phasing platform
	3. **Pause** the game while Link is **culled**. This will cause Link to consistently be **unculled** when the game is unpaused
	4. **Unpause** the game and immediately **open** the Shield Quick Menu (D-pad Left). If Link is **unculled** behind the menu, **drop** the equipped shield. If not, repeat step 3.
	5. Repeat steps 2-4 for _all_ `B`, `C[n]`, and `D[n]`, ultimately resulting in the entire setup being permaculled

	##### 2c: Collecting Zelda's Torch in the prologue

	1. Return to the title screen and begin a new file. This will only enter the prologue scenario and create occasional autosaves (up to 5, but typically 4), so don't fret about your progressed file
	2. As soon as the prologue is entered and an autosave received, reload to Marakuguc Shrine
	3. Use the D-Pad to unequip all equipment, then resync Link's armor, and finally use the D-Pad to re-equip items until a nocked arrow fails to attach to the bow (and instead just floats there)
	4. Load back to the prologue. Zelda will drop her torch, so pick it up. Provided you were at absolute maximum SFO before loading, she should always drop it
	5. ...But if not, any SFO strong enough to generate menu effects will do, given enough tries. Thus, spam-reloading the first prologue autosave is also a viable (if random) option
	6. Once the torch has been obtained, continue until another prologue autosave is received
	7. **Close the game** to end SFO

	As an aside, most of the rest of the setup will be spent in your progressed save. If desired, you may create a prologue hard save with the torch obtained, in order to prevent the save that has it from being overwritten. Just, please check and make sure you have a progressed autosave to load to before doing this. Please. I don't want to be responsible for someone losing their file.

	#### Part 3: Cull Detachment Zuggle and Retrieval
	---
	notoc: true
	---

	##### 3a: CDZ prep

	=== "Condensed" ######

		1. Use Mineru Limbo to Duga Dip a weapon `W1`, then use Mineru's culling to make a DI chain: `W1`->`S1`->`W2`->`S2`->`W3`
		2. Glue all normal parents to a rocket and send them away, then detangle `W1` from Mineru and zuggle all 4 items to Domizuin Shrine at Akkala Citadel Ruins
		3. `S1` L-Cancel Null FE Hover Stone `H`
		4. `W1` FS2FE Steering Stick `A1` and keep CF parent `C`; place `A1` atop `H` in a culling area, check to make sure it's culling, and SDC it with `C`. Finally, glue `A1`->`H` to prevent `A1` from culling
		5. Smuggle `S1` and equip `S2`, then shock drop `S2` and smuggle it in the Drop position
		6. Ensure `W1` is not Zuggle Dropped (so that `S1` is not attached to Link)
		7. Place Steering Stick `A2` in the culling area, recall it, and L-Cancel Null FE it to `S2` from outside the culling margin
		8. Glue an Apple (or something else that readily culls) to `A2`, place both in the culling area, and check that only the Apple culls when leaving the culling margin
		9. Glue `A2` to `A1` with both still atop `H`, and shake `H` free. Then, exit and quickly re-enter the culling margin to see that `A1` can cull again (if you get stuck, use memories to uncull)
		10. Smuggle `W3` and equip `W2`, then throw `W2` and smuggle it in the Drop position.
		11. Smuggle `W1`, then equip a random weapon and shield
		12. Recall `H` and pause. Drop the equipped weapon and shield, and load the save that has Zelda's Torch

	=== "Verbose" ######

		1. Use Mineru Limbo to Duga Dip a weapon `W1`, then use Mineru's culling to make a DI chain: `W1`->`S1`->`W2`->`S2`->`W3`:
			1. Follow [these steps]() to FE a weapon `W1` to Mineru and Duga Dip it
			2. Faildrop-Swap-Unequip `W1` to smuggle it, then equip another weapon
			3. Target shield `S1` with Fuse, and induce Mineru to return in her orb
			4. Just before `W1` is culled by Mineru, fuse `S1`. It will become DI'd as well
			5. Drop `W1`, then repeat 1b-1d with `S1` as the parent and `W2` as the child
			6. Repeat 1b-1d again with `W2` as the parent and `S2` as the child
			7. Repeat 1b-1d one last time with `S2` as the child and `W3` as the parent
		2. Glue all normal parents to a rocket and send them away, then detangle `W1` from Mineru and zuggle all 4 items to Domizuin Shrine at Akkala Citadel Ruins:
			1. Glue the non-DI parents of `S1`, `W2`, and `S2` to a rocket and activate it. This will quickly send all 3 of them far enough away to despawn. Due to DI mechanics, this safely disposes of them
			2. Pick up `W1` and `S1` (it doesn't matter what order you zuggle them in, but I'm prescribing one to make the steps clearer)
			3. Faildrop-Swap-Unequip both `W1` and `S1`
			4. Pick up `W2` and `S2`
			5. Faildrop-Swap-Unequip both `W2` and `S2`
			6. Pick up `W3`
			7. Faildrop-Swap-Unequip `W3`
			8. Equip and Warm Faildrop a weapon and shield
			9. Warp or load save to reach Akkala Citadel Ruins
		3. `S1` L-Cancel Null FE Hover Stone `H`:
			1. Why don't we have an L-Cancel FE page, exactly? This is before-my-time tech, so I can't be the one to make it either...
		4. `W1` FS2FE Steering Stick `A1` and keep CF parent `C`; place `A1` atop `H` in a culling area, check to make sure it's culling, and SDC it with `C`. Finally, glue `A1`->`H` to prevent `A1` from culling
		5. Smuggle `S1` and equip `S2`, then shock drop `S2` and smuggle it in the Drop position:
			1. Faildrop-Swap-Unequip `S1` to smuggle it, then equip `S2`
			2. Hold ZL to guard with shield (don't draw weapon), and walk into an active Shock Emitter. Link will be stunned, and `S2` will move to Link's feet
			3. Release ZL before the stun animation ends to prevent Link from moving `S2` back into his hand
			4. Faildrop-Swap-Unequip `S2` to smuggle it
		6. Ensure `W1` is not Zuggle Dropped (so that `S1` is not attached to Link)
		7. Place Steering Stick `A2` in the culling area, recall it, and L-Cancel Null FE it to `S2` from outside the culling margin
		8. Glue an Apple (or something else that readily culls) to `A2`, place both in the culling area, and check that only the Apple culls when leaving the culling margin
		9. Glue `A2` to `A1` with both still atop `H`, and shake `H` free from `A1`. Then, exit and quickly re-enter the culling margin to see that `A1` can cull again (if you get stuck, use memories to uncull)
		10. Smuggle `W3` and equip `W2`, then throw `W2` and smuggle it in the Drop position:
			1. Faildrop-Swap-Unequip `W3` to smuggle it, then equip `W2`
			2. Throw W2 and don't press Y or R after
			3. Faildrop-Swap-Unequip `W2` to smuggle it
		11. Smuggle `W1`, then equip a random weapon and shield
		12. Recall `H` and pause. Drop the equipped weapon and shield, and load the save that has Zelda's Torch

	##### 3b: CDZ

	1. Press A repeatedly to pick up `W2` and `S2` until the weapon and shield inventories are both full and `S2` is equipped
	2. Swap off Zelda's Torch (unpausing to ensure the swapped-to weapon is Warm Equipped), then drop-swap _to_ Zelda's Torch
	3. After a moment, Link should cull and stay culled. **Pause**.
	4. Drop every unequipped shield and weapon except for one spare weapon besides Zelda's Torch (this can be the mnf or a copy of `W2`)
	5. Finally, drop Zelda's Torch and swap to the last remaining weapon
	6. **Pause Buffer**, but with lenient timing. Specifically, assuming 3 shields and 6 weapons were dropped before dropping Zelda's Torch, you have **12 frames** to pause again after unpausing (=0.4 seconds).
	7. Unequip and re-equip `S2`. The unequip will destroy `A2`, forcing `A1` to uncull (and thus instantly unculling Link while still paused), and the equip will thus resync the swapped-to weapon.
	8. Drop the equipped weapon, and without unpausing, load a progressed save.

	##### 3c: Retrieval

	1. Upon arriving at the progressed file, Zelda's Torch should be visibly zuggled on Link's back
	2. Simply stand somewhere safe and Warm Drop any weapon to drop the zuggle.
	3. However, it still has a dependency to Link, and is undiscovered. This prevents it from being picked up with an empty hand.
	4. To overcome this, either equip another weapon, or else Ultrahand the torch. The former sends it straight to the inventory, while the latter removes the lingering dependency.
	5. Save the game.

	#### Part 4: Bonuses
	---
	notoc: true
	---

	- This is a lot of work for a torch, even if it's a really cool torch. But if you're careful, you can also obtain Mineru's Arm during this setup, for very little extra effort.
	- The CDZ setup can also be repeated to zuggle the Prologue Master Sword (aka "mnf"), though it doesn't particularly save any labor to do it now.

	##### Adjustments for Mineru's Arm

	1. Before beginning Part 2a, summon Mineru's Sage Avatar.
	2. After completing Part 2b, before returning to the title screen, warp to any of the three Sky Labyrinths. The Northeast one ("Lomei Sky Labyrinth") is the most-tested.
	3. Follow [These steps](uid:J7X#collecting-minerus-arm_1) to collect Mineru's Arm.
	4. Make a hard save if not planning to hard save in the prologue, and simply get an autosave otherwise.
	5. Proceed as normal from the start of Part 2c.
	6. When it comes time to reopen the game in Part 3, ensure you load a save that has Mineru's Arm.

	##### Adjustments for the Prologue Master Sword

	1. After the final step of Part 3 ("Save the game"), perform all of part 3 again. But this time, zuggle the Prologue Master Sword instead of Zelda's Torch.
	2. If all your prologue autosaves have expired by the end of Part 3a, simply return to the title screen and start a new file. The CDZ setup survives this just fine.

=== "Nested Batch DI + CDZ (1.2.0+ type)" ###
	---
	versions: ["1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
	---

	- These versions postdate both D-Pad Lock and Drop-Swap Culling.
	- Thus, they must cull Link to be able to transfer Zelda's Torch, but have access to an easy way to do so.
	- Recent developments have allowed for a zuggle method which is nearly timing-free, and doesn't require LSW.
	- This reduces the execution difficulty of the zuggle and simplifies the retrieval, so it will be recommended here despite being somewhat more complicated to set up than previous methods.
	- With access to Drop-Swap Culling, they also have a much easier time performing SFO.

	#### Part 1: Prep
	---
	notoc: true
	---

	1. By whichever means desired, prepare 13 Zuggle Overload (such that having all equipment equipped acts normal, but drawing bow causes swaps to overload drop).
	2. Prepare 4 "Gen 2" DI Ghosts: 2 shields and 2 weapons. One of each will be used in the SFO process, with the others just for easy duping.
	3. It's possibly important that the working shield and weapon don't share any dependency relations to each other.
	4. Zuggle the 4 items (you will need to unequip bow) and enter Rasitakiwak Shrine (next to Link's House).

	#### Part 2: SFO and Torch Collection
	---
	notoc: true
	---

	##### 2a: Nested Batch DI SFO

	- The working weapon mentioned above is `A1`, and the working shield is `A2`

	=== "Condensed" ######

		1. Defeat all the constructs and destroy their equipment
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

	=== "Verbose" ######

		1. Defeat all the constructs and destroy their equipment
		2. `A1` Overload FE shield `B` and Recall Lock it:
			1. Drop-Swap-Unequip `A1` to smuggle it
			2. Overload Drop a random weapon and fuse it to a shield
			3. Fuse `B` to said weapon to FE it to `A1`
			4. Swap weapon to resync it, then drop the new weapon to drop `A1`
			5. Pick up and drop `A1` to undo its Zuggle Drop
			6. Position `B` where desired, then Recall it, pause while Recall is active, and load any save
		3. `A2` and `B` Ghost DI weapon `C`:
			1. Smuggle `A2` and equip `B`
			2. Fuse `C` to `B` and pause a few frames later
			3. Drop-Swap `B` to DI `C`
		4. `A2` Overload FE weapon `D1`; leave `A2` Zuggle Dropped
		5. Equip `B`, Smuggle `C`, and Overload Pickup `D1`
		6. `B`, `C`, and `D1` Overload Batch DI 25 weapons `E1-E25`:
			1. Fuse `E1` to `D1` to FE it to `C`
			2. Fuse `E1` to `D1` again. This time, it will Pseudo Fuse and begin fading, so pause a few frames after pressing Y
			3. (fail)Drop-Swap-Unequip `B` to DI `E1`
			4. Repeat 6a-6c with each `E[n]`
			5. If it turns out later you missed a few, don't worry about it. As long as you have at least 20, you can just compensate with additional `F[n]` shields later
		7. Drop `D1` (don't bother faildropping), then pick up and drop `C` to undo its Zuggle Drop
		8. `A2` Overload FE weapon `D2`; leave `A2` Zuggle Dropped
		9. Throw purgatorize `E1-E25`:
			1. Smuggle `E1`
			2. Equip `E2` and throw it
			3. Press Y or R to return `E2` to Link's hand
			4. Repeat 9a-9c with each `E[n]`, throwing any random weapon for the final purgatorization
		10. Equip `B` and Overload Pickup `D2`
		11. `B`, `E1-E25`, and `D2` Overload Batch DI 24 shields `F1-F24`:
			1. Fuse `F1` to `D2` to FE it to `E1-25`
			2. Fuse `F2` to `D2` again. This time, it will Pseudo Fuse and begin fading, so open the shield Quick Menu a few frames after pressing Y
			3. You will likely miss the correct pause timing and need to release the D-Pad for a couple frames
			4. Drop-Swap-Unequip `B` (using the D-Pad) tp DI `F1`
			5. Repeat 11a-11d with each `F[n]`
			6. If you didn't end up with 25 parents, you will need more than 24 children
		12. Leave `B` dropped, then faildrop `D2` and drop it once it returns, and finally pick up and drop `A2` to undo its Zuggle Drop
		13. If desired, check for "full" SFO: Use the D-Pad to equip an unfused weapon and shield, then try to nock an arrow. If it appears, but does not attach to Link's hand, full SFO is reached

	##### 2b: Collecting Zelda's Torch in the Prologue

	1. Return to the title screen and begin a new file. This will only enter the prologue scenario and create occasional autosaves (up to 5, but typically 4), so don't fret about your progressed file
	2. As soon as the prologue is entered and an autosave received, reload to Marakuguc Shrine
	3. Use the D-Pad to unequip all equipment, then resync Link's armor, and finally use the D-Pad to re-equip items until a nocked arrow fails to attach to the bow (and instead just floats there)
	4. Load back to the prologue. Zelda will drop her torch, so pick it up. Provided you were at absolute maximum SFO before loading, she should always drop it
	5. ...But if not, any SFO strong enough to generate menu effects will do, given enough tries. Thus, spam-reloading the first prologue autosave is also a viable (if random) option
	6. Once the torch has been obtained, continue until another prologue autosave is received, then load the Marakuguc autosave
	7. One by one, **pick up** and **unequip** all `F[n]` to destroy them, deleting all the dependencies and ending SFO

	As an aside, most of the rest of the setup will be spent in your progressed save. If desired, you may create a prologue hard save with the torch obtained, in order to prevent the save that has it from being overwritten. Just, please check and make sure you have a progressed autosave to load to before doing this. Please. I don't want to be responsible for someone losing their file.

	#### Part 3: Cull Detachment Zuggle and Retrieval
	---
	notoc: true
	---

	##### 3a: CDZ Prep

	=== "Condensed" ######

	1. Create a "Gen 1" DI weapon, `W1`, and zuggle it to the Akkala Citadel Ruins
	2. Create a DI chain `W1`->`S1`->`W2`->`S2`, then undo `W2`'s Zuggle Drop and delete the remaining normal parents of the chain
	3. `S1` FE Hover Stone `H`
	4. `W1` FE `S3` fuse SDC
	5. Place Steering Stick `A` in a culling area, then recall it and FE it to `S2` from outside the margin
	6. Place `A` atop `H` in a culling area, then check that `A` has a cull stored: Glue an Apple (or other object that readily culls) to `A`; the Apple should still cull upon leaving the culling margin
	7. Glue `S3` to `A` and check that Link culls when exiting the margin (either quickly re-enter, or else watch a memory to uncull)
	8. Drop Smuggle `S2`, Drop Purgatorify `W2`, and Smuggle `W1`, then equip a random weapon and shield
	9. Recall `H`, then pause, drop the weapon and shield, and load the save that has Zelda's Torch collected

	##### 3b: CDZ

	1. Press A repeatedly to pick up `W2` and `S2` until the weapon and shield inventories are both full and `S2` is equipped
	2. Swap off Zelda's Torch (unpausing to ensure the swapped-to weapon is Warm Equipped), then drop-swap _to_ Zelda's Torch
	3. After a moment, Link should cull and stay culled. **Pause**.
	4. Drop every unequipped shield and weapon except for one spare weapon besides Zelda's Torch (this can be the mnf or a copy of `W2`)
	5. Finally, drop Zelda's Torch and swap to the last remaining weapon
	6. **Pause Buffer**, but with lenient timing. Specifically, assuming 3 shields and 6 weapons were dropped before dropping Zelda's Torch, you have **12 frames** to pause again after unpausing (=0.4 seconds)
	7. Unequip and re-equip `S2`. The unequip will destroy `A`, forcing `S3` to uncull (and thus instantly unculling Link while still paused), and the equip will thus resync the swapped-to weapon
	8. Drop the equipped weapon, and without unpausing, load a progressed save

	##### 3c: Retrieval

	1. Upon arriving at the progressed file, Zelda's Torch should be visibly zuggled on Link's back
	2. Simply stand somewhere safe and Warm Drop any weapon to drop the zuggle
	3. However, it still has a dependency to Link, and is undiscovered. This prevents it from being picked up with an empty hand
	4. To overcome this, either equip another weapon, or else Ultrahand the torch. The former sends it straight to the inventory, while the latter removes the lingering dependency
	5. Save the game

	#### Part 4: Bonuses
	---
	notoc: true
	---

	- This is a lot of work for a torch, even if it's really cool. But if you're careful, you can also obtain Mineru's Arm during this setup, for very little extra work.
	- The CDZ setup can also be repeated to zuggle the Prologue Master Sword (aka "mnf"), though it doesn't particularly save any labor.

	##### Adjustments for Mineru's Arm

	1. Before beginning Part 2a, summon Mineru's Sage Avatar.
	2. After Part 2a, before returning to the title screen, warp to any of the three Sky Labyrinths. The Northeast one ("Lomei Sky Labyrinth") is the most-tested.
	3. Follow [These steps](uid:J7X#collecting-minerus-arm_1) to collect Mineru's Arm.
	4. Warp back to [shrine] and get a new autosave inside it with Mineru's Arm collected.
	5. Proceed as normal from the start of Part 2b.
	6. When it comes time to reopen the game in Part 3, ensure you load a save that has Mineru's Arm.

	##### Adjustments for the Prologue Master Sword

	1. After the final step of Part 3 ("Save the game"), perform all of part 3 again. But this time, zuggle the Prologue Master Sword instead of Zelda's Torch.
	2. If all your prologue autosaves have expired by the end of Part 3a, simply return to the title screen and start a new file. The CDZ setup survives this just fine.
	3. And eh, technically I think it's possible to make a ~50% reusable CDZ setup (where all you need to remake is W1, S2, and their children), but I can't wrap my head around that right now.

## Notes

### Properties

#### As a weapon:

- Zelda's Torch is a peculiar 1-handed weapon which uses a blend of the properties of the Torch and the Traveler's Sword✨, along with some entirely unique properties.
- Like the Torch, it uses the Torch model and sounds, has 8 base durability, can be lit aflame at its tip, and will not burn out.
- Like the Traveler's Sword✨, it uses the Traveler's Sword Sheath, deals 7 damage, and is sharp without a fuse.
- Like other glitch weapons, it has no name or description, and usually displays "MsgNotFound" in those fields instead. However, it _does_ have a unique icon of a lit torch.
- It can be fused to, but _cannot_ be fused to other things.
- Uniquely to Zelda's Torch, it will automatically light if Cold Dropped (or Overload Dropped, or any other way of making the actor not equipped by Link when created).
- Furthermore, it uses a unique color for the light it emanates when lit, yellower than the standard lit torch.

#### As a building part:

- Dropped in the world, Zelda's Torch again uses a blend of properties.
- Like a Torch, it has 50 mass and is buoyant, flammable, and so on.
- Like a Traveler's Sword✨, it acts sharp and can cut when moved quickly enough.
- Though it sparks in the inventory during a storm, it does not actually attract electricity.
- Uniquely, when autobuilt, it will be _lit by default_. This is most clearly useful with Balloons, but do consider the auto-detonating bomb my friend

#### As a tool:

- Overload Dropping a fused Zelda's Torch can burn the fuse without the torch in the inventory becoming unfused. This makes it infinitely reusable. Some possibilities:
	- A Pine Cone will instantly boost any nearby fire.
	- A burnable explosive will instantly blow Link up. I don't know why you would do this. But you can.
	- A Pepper or Sunshroom will instantly create a weak updraft, as long as the torch is on the ground.
	- A roastable material can be roasted for a free portable snack! It's slow
- You can overload or cold drop it with a bow unsheathed but not drawn and it'll light your arrow. Neat.
- Ought to play with it more and find fun tool uses...

### Credits ?

- Zelda's Torch obtained by mulberry - Dec 07th, 2025
- Credits for supplementary glitches, techniques, and discoveries on their respective pages

### Resources

??? quote "Discord Resources"

	- [Original Zelda's Torch Get](https://discord.com/channels/1086729144307564648/1110956205624532993/1447220634987003984)

### Related
- [Zuggle Overload](search:Zuggle Overload)
- [Despawn Interrupt](search:Despawn Interrupt)
- [Fuse Entanglement](search:Fuse Entanglement)

### Page Todos: ?
---
notoc: true
---

Before publishing:

- Uh, nothing?
- I guess I'm publishing. Didn't think that was happening tonight

Soon after publishing:

- Add resources and credits for the new zuggle methods
- Do a formatting pass and clean up any junk

Whenever

- Try the new sfo
