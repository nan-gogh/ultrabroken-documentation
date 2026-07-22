---
title: "Zelda's Torch"
uid: "TW8"
draft: true
label: "ZTorch"
versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
credits: ["mulberry, Aergyl, Jordan, MandelbrotChaylay, Squidwest"]
date: "2025-12-06"
description: "Using Super Fuse Overload, the unique torch Zelda carries in the prologue can be obtained."
aliases: [""]
tags: ["Equipment", "Zelda"]
---

# Zelda's Torch

## Summary

By completely filling the game's global dependency array with persistent dependencies, Prologue Zelda can be forced to Overload Drop her torch, which has unique properties. Once obtained in the prologue, it can be transferred to a progressed file in the same way as the Prologue Master Sword.

I'm... less sorry than I was before if you see the page like this. It's still not done, but it finally has a (nearly) complete set of steps for every version. Feels good.

Still though, there's a reason it's not published. Follow these guides at your own risk.

_First obtained by mulberry - Dec 07th, 2025_

## Instructions

- This page will offer three guides, each tailored for a specific version range.
- There are other combinations of SFO Methods and transfer methods that will work on each version, but something had to go to make this page readable and I chose variations.
- The provided combinations are the most efficient on the listed version ranges.

=== "SFO Method 4 + SLD" ###
    ---
    versions: ["1.0.0", "1.1.0", "1.1.1"]
    ---

    - These versions predate the addition of active smuggles causing "D-Pad Lock", so they can perform Save Load Dupe on Zelda's Torch without having to cull Link.
    - This in turn avoids invoking the "Callback", which requires Lift Storage Warp to overcome in all newer patches.
    - However, they also predate Drop-Swap Culling, so they are more or less required to use Method 4 of Super Fuse Overload, which is moderately more difficult than Method 1.
    
    #### Part 1: Prep
    ---
    notoc: true
    ---

    1. By whichever means desired, get 13 Zuggle Overload (9 on `1.0.0`)
    2. Prepare a DI Ghost Shield (`E`). This is technically optional, but it saves time and complexity and the steps assume you have it. Get it.
    3. Create an Intangible Aerophasing setup at (location).
    4. You will also need several unfused weapons and shields, a bow, at least one arrow, and a material.
    
    #### Part 2: SFO and Torch Collection
    ---
    notoc: true
    ---
    
    ##### 2a: Performing SFO

    1. Use the Aerophasing setup to ensure it has a cull stored; this will allow the culling area to remain loaded through a banc change
    2. Travel to (shrine) and enter it. **Do not warp there.**
    3. [Overload Drop](uid:8QH) a shield and pick it up to duplicate shields until there are 19 dropped and 3+ spare in the inventory
    4. **Overload Drop** a weapon `A` and fuse it to a shield `B`
    5. [Overload Cold Fuse](uid:O64) 21 shields `C1-C21` to A (the 19 dropped & 2 from inventory)
    6. **Fail-drop** `A` and **drop** `B`
    7. [Overload Pickup](uid:8QH) `C1`
    8. Duplicate 30 shields `D1-D30` off `E`, dropping each on the ground and **Overload Cold Fusing** them to `C1` as you go
    9. **Fail-drop** `C1` and **drop** it aside
    10. Repeat 7-9 for `C2-C19` with the **same** `D1-D30`
    11. For `C20` and `C21`, check periodically in the menu to see if Menu Link starts overload dropping things. Once he does, _proceed to step 11_
    12. **Overload Cold Fuse** an unrelated material to `C[n]`. If it works, **Collect it** and **Overload Cold Fuse** the next `D[n]`, then repeat. If it fails, _proceed to step 12_
    13. **Fail-drop** `C[n]` and **drop** it. You may have to **unequip your bow** for it to return. **Be sure it returns before dropping it.**
    14. **Drop** `A`

    ##### 2b: Permaculling the shields

    1. [Drop Zuggle](uid:0YL) a shield. If `E` was prepared, it can be used.
    2. Equip one of `B`, `C[n]`, or `D[n]` and step onto the phasing platform
    3. **Pause** the game while Link is **culled**. This will cause Link to consistently be **unculled** when the game is unpaused
    4. **Unpause** the game and immediately **open** the Shield Quick Menu (D-pad Left). If Link is **unculled** behind the menu, **drop** the equipped shield. If not, repeat step 3.
    5. Repeat steps 2-4 for _all_ `B`, `C[n]`, and `D[n]`, ultimately resulting in the entire setup being permaculled

    ##### 2c: Collecting Zelda's Torch in the prologue

    1. Return to the title screen and begin a new file. This will only enter the prologue scenario and create occasional autosaves (up to 4), so don't fret about your progressed file.
    2. Progress to the _second_ autosave (give timing cue but it's just after the first dialogue cutscene thing), then return to (shrine name).
    3. Use the D-Pad to unequip all equipment, then resync Link's armor, and finally use the D-Pad to re-equip items until a nocked arrow fails to attach to the bow (and instead just floats there).
    4. Load the second prologue autosave. Zelda will drop her torch, so pick it up.
    5. If she does not, try loading back to (shrine) and repeating steps 3-4; It may take a few tries for her torch to be one of the dependencies that fails.
    6. Proceed until receiving the _third prologue autosave.
    7. **Close the game** to end SFO

    #### Part 3: Save Load Dupe
    ---
    notoc: true
    ---

    1. Load a progressed file, then warp to (shrine) and enter it to receive an autosave (protip, make this the same as the SFO shrine in the final setup so they can skip this)
    2. Load the _third_ prologue autosave and walk to (location)
    3. Equip Zelda's Torch and **unpause** to make sure Link has it equipped in-world
    4. **Pause** the game, **drop** Zelda's Torch, and **swap** to another weapon (likely, you only have the Prologue Master Sword)
    5. **Pause buffer** (unpause and pause again 3 frames later; any earlier will eat the input and any later is too late)
    6. **Drop** the swapped-to weapon and **load** the (shrine) autosave
    7. If SLD was performed correctly, Zelda's Torch should be at (spot) within the shrine
    8. Collect Zelda's Torch and save the game

    #### Part 4: Bonuses
    ---
    notoc: true
    ---

    - This is a lot of work for a torch, even if it's really cool. But if you're careful, you can also obtain Mineru's Arm and Prologue Master Sword during this setup, for very little extra work. Like shockingly little.

    ##### Adjustments for Mineru's Arm

    1. Before beginning Part 2a, summon Mineru's Sage Avatar.
    2. After completing Part 2b, before returning to the title screen, warp to Mogisari Shrine, at Lomei Sky Labyrinth in the northeastern sky.
    3. Follow [These steps](uid:J7X#collecting-minerus-arm_1) to collect Mineru's Arm.
    4. Warp back to (shrine) and get a new autosave inside it with Mineru's Arm collected.
    5. Proceed as normal from the start of Part 2c.

    ##### Adjustments for the Prologue Master Sword

    1. After Part 3, step 8 ("Collect Zelda's Torch and save the game"), reload the third prologue autosave
    2. Repeat the SLD, but start with the Prologue Master Sword equipped, SLDing it instead.
    3. Yeah this is basically a free addon for `1.0.0-1.1.1`.

=== "SFO Method 4 + Cull Detachment Zuggle (1.1.2 type)" ###
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
	3. Prepare a DI Ghost Shield (`E`). This is technically optional, but it saves time and complexity and the steps assume you have it. Get it.
	4. Create an Intangible Aerophasing setup at (location).
	5. You will also need several unfused weapons and shields, a bow, at least one arrow, and a material.
    
	#### Part 2: SFO and Torch Collection
	---
	notoc: true
	---

	##### 2a: Performing SFO

	1. Use the Aerophasing setup to ensure it has a cull stored; this will allow the culling area to remain loaded through a banc change
	2. Travel to (shrine) and enter it. **Do not warp there.**
	3. [Overload Drop](uid:8QH) a shield and pick it up to duplicate shields until there are 19 dropped and 3+ spare in the inventory
	4. **Overload Drop** a weapon `A` and fuse it to a shield `B`
	5. [Overload Cold Fuse](uid:O64) 21 shields `C1-C21` to A (the 19 dropped & 2 from inventory)
	6. **Fail-drop** `A` and **drop** `B`
	7. [Overload Pickup](uid:8QH) `C1`
	8. Duplicate 30 shields `D1-D30` off `E`, dropping each on the ground and **Overload Cold Fusing** them to `C1` as you go
	9. **Fail-drop** `C1` and **drop** it aside
	10. Repeat 7-9 for `C2-C19` with the **same** `D1-D30`
	11. For `C20` and `C21`, check periodically in the menu to see if Menu Link starts overload dropping things. Once he does, _proceed to step 11_
	12. **Overload Cold Fuse** an unrelated material to `C[n]`. If it works, **Collect it** and **Overload Cold Fuse** the next `D[n]`, then repeat. If it fails, _proceed to step 12_
	13. **Fail-drop** `C[n]` and **drop** it. You may have to **unequip your bow** for it to return. **Be sure it returns before dropping it.**
	14. **Drop** `A`

	##### 2b: Permaculling the shields

	1. [Drop Zuggle](uid:0YL) a shield. If `E` was prepared, it can be used.
	2. Equip one of `B`, `C[n]`, or `D[n]` and step onto the phasing platform
	3. **Pause** the game while Link is **culled**. This will cause Link to consistently be **unculled** when the game is unpaused
	4. **Unpause** the game and immediately **open** the Shield Quick Menu (D-pad Left). If Link is **unculled** behind the menu, **drop** the equipped shield. If not, repeat step 3.
	5. Repeat steps 2-4 for _all_ `B`, `C[n]`, and `D[n]`, ultimately resulting in the entire setup being permaculled

	##### 2c: Collecting Zelda's Torch in the prologue

	1. Return to the title screen and begin a new file. This will only enter the prologue scenario and create occasional autosaves (up to 5, but typically 4), so don't fret about your progressed file.
	2. Progress to the _second_ autosave (give timing cue but it's just after the first dialogue cutscene thing), then return to (shrine name).
	3. Use the D-Pad to unequip all equipment, then resync Link's armor, and finally use the D-Pad to re-equip items until a nocked arrow fails to attach to the bow (and instead just floats there).
	4. Load the second prologue autosave. Zelda will drop her torch, so pick it up.
	5. If she does not, try loading back to (shrine) and repeating steps 3-4; It may take a few tries for her torch to be one of the dependencies that fails.
	6. Proceed until receiving the _third_ prologue autosave.
	7. **Close the game** to end SFO

	As an aside, most of the rest of the setup will be spent in your progressed save. If desired, you may create a prologue hard save with the torch obtained, in order to prevent the save that has it from being overwritten. Just, please check and make sure you have a progressed autosave to load to before doing this. Please. I don't want to be responsible for someone losing their file.

	#### Part 3: Cull Detachment Zuggle and Retrieval
	---
	notoc: true
	---

	##### 3a: CDZ prep

	1. Use Mineru Limbo to Duga Dip a weapon `W1`
	2. Use Mineru's culling to DI a chain: `W1`->`S1`->`W2`->`S2`
	3. Detangle `W1` from Mineru and zuggle all 4 items to Domizuin Shrine at Akkala Citadel Ruins
	4. `S1` FE Hover Stone `H`
	5. `W1` FS2FE Steering Stick `A1`; place `A1` atop `H` in a culling area, check to make sure it's culling, and SDC it with the cf parent
	6. Glue `A1`->`H` to prevent `A1` from culling
	7. Smuggle `S1`, then equip `S2` and a random weapon. Shock thing placeholder. DSU `S2`, throw->drop `W2`, fd random shield
	8. Ensure `W1` is not Zuggle Dropped (so that `S1` is not attached to Link)
	9. Place Steering Stick `A2` in the culling area, recall it, and L-Cancel Null FE it to `S2` from outside the culling margin
	10. Glue an Apple (or something else that readily culls) to `A2`, place both in the culling area, and check that only the Apple culls when leaving the culling margin
	11. Glue `A2` to `A1` with both still atop `H`, and shake `H` free. Then, exit and quickly re-enter the culling margin to see that `A1` can cull again (if you get stuck, use memories to uncull)
	12. Zuggle `W1`, then recall `H` and load the save that has Zelda's Torch

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
	- The CDZ setup can also be repeated to zuggle the Prologue Master Sword (aka "mnf"), though it doesn't particularly save any labor.

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

=== "Nested Batch DI + Cull Detachment Zuggle (1.2.0+ type)" ###
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
	4. Zuggle the 4 items (you will need to unequip bow) and travel to [shrine].

	#### Part 2: SFO and Torch Collection
	---
	notoc: true
	---

	##### 2a: Nested Batch DI SFO

	- The working weapon mentioned above is `A1`, and the working shield is `A2`
	(select a shrine, doofus, so you know just where you are. Don't you know that I might be... your wishing well?)

	=== "Condensed" ######

	1. `A1` Overload FE shield `B` and Recall Lock it
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

	##### 2b: Collecting Zelda's Torch in the Prologue

    1. Return to the title screen and begin a new file. This will only enter the prologue scenario and create occasional autosaves (up to 5), so don't fret about your progressed file
    2. Progress to the _second_ autosave (give timing cue but it's just after the first dialogue cutscene thing), then return to (shrine name)
    3. Use the D-Pad to unequip all equipment, then resync Link's armor, and finally use the D-Pad to re-equip items until a nocked arrow fails to attach to the bow (and instead just floats there)
    4. Load the second prologue autosave. Zelda will drop her torch, so pick it up
    5. If she does not, try loading back to (shrine) and repeating steps 3-4; It may take a few tries for her torch to be one of the dependencies that fails
    6. After collecting the torch, proceed until receiving the _third_ prologue autosave (timing cue), then load the (shrine) autosave
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
---
notoc: true
---

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
	- A burnable explosive will instantly blow Link up. I don't... know why you would do this. But you can.
	- A Pepper or Sunshroom will instantly create a weak updraft, as long as the torch is on the ground.
	- A roastable material can be roasted for a free portable snack! It's slow
- You can overload or cold drop it with a bow unsheathed but not drawn and it'll light your arrow. Neat.
- Ought to play with it more and find fun tool uses...

### Credits ?

- Zelda's Torch obtained by mulberry - Dec 07th, 2025

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

- Update 1.0.0-1.1.1 steps to use Marakuguc instead of a placeholder
- Add verbosity meter to anywhere it's good to have
- Finish 1.1.2 steps after getting answers to the question of reality
- Double check all steps for all patches, and then triple check
- Fix tabbage to use actual tabs (thank u blackmars for indoctrinating me these work so much better)
- Add resources and credits for the new zuggle methods
- Try the new
