---
title: "Message Not Found"
uid: "056"
label: "MNF"
versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
credits: ["LegendofLinkk", "Abahbob"]
date: "2023-05-17"
description: "Allows you to obtain the prologue master sword (named MsgNotFound or MNF), whose durability cannot decrease"
aliases: ["message not found", "message not found error", "message-not-found", "mnf", "MsgNotFound"]
tags: ["mnf"]
---

# Message Not Found

_Every unnamed inventory item shows up as MsgNotFound. This article refers to the pre-Upheaval Master Sword that Link carries in the Prologue._

## Summary
Allows you to obtain the Prologue Master Sword (named _MsgNotFound_ or MNF), whose durability cannot decrease.

Zuggling anything out of the Prologue map can be difficult, so this page will guide you through taking it out of its intended place. Once you have it in the overworld, you can zuggle it again with many standard zuggle techniques.

- **Early version methods:** _LegendofLinkk (Zuggle Method), Abahbob (SLD Method) - 17 May 2023_
- **Swap Resync Zuggle method:** _Aergyl, Jordan, KiloVictor, MandelbrotChaylay, mulberry, Toti Sauce, Yee_ - 15 Aug 2025
- **Cull Detachment Zuggle method:** _as per SRZ method, plus ArmindoEmiya, Blackmars, Pearfalse, Squidwest_ - 11 Jul 2026


## Instructions

=== "Drop SLD Methods (`1.0.0`–`1.1.1`)" ###
    ---
    versions: ["1.0.0", "1.1.0", "1.1.1"]
    ---

    === "Double SLD Method" ###

        1. Go to the In-Isa shrine (Fuse shrine)
        2. Bring one of the boulders over to the entrance with the fire fruit trees and jump on it (see video for precise location)
        3. Do all the steps for SLD without the final load
        4. Load a save of the prologue
        5. Pick up the weapon you dropped into this save (see video for precise location)
        6. Do all the steps for SLD without the final load, dropping the MNF before your other weapon
        7. Load a save in the In-Isa shrine
        8. Go back to the place in step 2 and pick up the MNF

    === "Drop Zuggle + SLD Method" ###

        1. Ensure you have a save inside Marakuguc Shrine
        2. Drop Zuggle at least one weapon
        3. Start a new game, don't move off the starting platform
        4. Pick up your Drop Zuggles
        5. Pause and drop all but one of your non-MNF weapons, then your equipped MNF
        6. Swap to your last remaining weapon
        7. Pause buffer
        8. Drop your equipped weapon
        9. Reload a save inside Marakuguc

        The MNF will either be zuggled on Link, or will have dropped in the last room by the Construct

    === "Zuggle Overload Method" ###
        ---
        obsolete: true
        ---

        1. Zuggle overload
        2. Start new game
        3. Load autosave during prolouge
        4. Pick up and drop the MNF
        5. Pick up all weapons (until inventory is full)
        6. Zuggle MNF
        7. Load the save in which you want to have the MNF

=== "Swap Resync Zuggle method (`1.2.0+`)" ###

    The fastest method on the newest versions, but unforgiving.

    _method pending_

=== "Cull Detachment Zuggle Method (`1.1.2`+)" ###
    ---
    versions: ["1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
    ---

    This method uses Cull Detachment Zuggle and Despawn Interrupt to avoid particular timing windows. This is the most beginner-friendly method by far.

    There are two separate variants: one for version `1.1.2`, and one for everything later than that.

    !!!warn "Draft"
        These writeups are a work-in-progress and have not been fully tested yet.

    First, prepare your manual save:

    1. Warp to Domizuin Shrine and deal with Gloom Hands in the citadel, if present
        - You don't need to fight them. Stand somewhere high up where they can constantly see you but not reach you, and they'll eventually disappear and stay gone until the next blood moon
    1. Warp to Marakuguc Shrine, enter it, and manually save

    === "Version `1.2.0` or later" !
        ---
        versions: ["1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
        ---

        #### Requirements
        ---
        notoc: true
        ---

        - 2+ weapons, 2+ shields
            - The steps will need more than this, but by that point, you'll have DI equipment for free dupes
        - 2+ Steering Sticks, 1+ Hover Stone
        - Ability to reach the Zuggle Overload threshold (e.g. 13 invizuggles)

        #### Making DI Equipment
        ---
        notoc: true
        ---

        1. Make a gen1 Despawn Interrupt weapon `W` by any method
            - This has to be _Eaten DI_; Void Dipping will not work for this
        1. Zuggle it, reload your manual save, and warp to Domizuin Shrine
        1. Make two DI Ghost shields `S1` and `S2`
            - You can make `S2` from either `W` or `S1`
            - Equip and drop both `W` and `S2` to ensure they aren't zuggle drops
        1. Glue all non-DI parents to a rocket
        1. Activate the rocket to shoot it off the side of the cliff and distance-despawn non-DI parents

        #### Cull Detachment construction
        ---
        notoc: true
        ---

        1. Smuggle `S1`:
            1. Equip `S1` and pause
            1. Drop it, swap to any other shield, then unequip the shield you swapped to
            1. Unpause, and `S1` will stay smuggled – no fail drop wall needed
        1. Fuse Entangle a Hover Stone to `S1`:
            1. Equip any bow, any shield, and any unfused weapon
            1. Jump and pause near the peak of the jump
            1. Swap to a different unfused shield **once** and unpause; it should drop to the ground
            1. Fuse the dropped shield to your weapon
            1. Stand somewhere with a small height drop behind Link, to avoid the fuse target clipping into the ground
            1. Take out a Hover Stone and fuse it to your shield
            1. Pause, unequip and re-equip your shield, and unpause
            1. Drop the equipped shield to release `S1`
        1. Release the zuggle drop status on `S1` by equipping it and dropping it properly
        1. Drop unfused shield `S3`, which must be the same type as `S2`
            - If you don't have one of the required type in the inventory, equip any shield, then try to pick up `S2` to stow a copy
        1. Smuggle `W` and fuse entangle `S3` to it:
            1. Equip `W` and pause
            1. Drop it, swap to any other weapon, then unequip the weapon you swapped to
            1. Unpause, and `W` will stay smuggled
            1. Equip any bow, any weapon, and any unfused shield
            1. Jump and pause near the peak of the jump
            1. Equip any unfused weapon (a spear is recommended) and unpause; it should drop to the ground
            1. Fuse the dropped weapon to your shield
            1. Fuse `S3` to your weapon
            1. Pause, unequip and re-equip your weapon, and unpause
            1. Drop the equipped weapon to release `W` (leave it zuggle dropped)
        1. Make an SDC stick:
            1. Equip any bow, any shield, and any unfused weapon
            1. Jump and pause near the peak of the jump
            1. Swap to a different unfused shield and unpause
            1. Fuse the dropped shield to your weapon
            1. Take out a Steering Stick and fuse it to your shield
            1. Mount the Steering Stick and unequip your shield to SDC the Steering Stick
        1. Take out a second Steering Stick `A` to unlock your ability wheel
        1. Fuse the SDC stick to `S3` and drop `S3` outside the culling area
        1. Drop Zuggle `S2`:
            1. Equip any unfused weapon and any bow, and ensure you have no shield equipped, but at least one in the inventory
            1. Tap ZR to nock an arrow and pick up `S2`
                - This should _overload pickup_, becoming equipped in the inventory but staying in place on the ground
            1. Pause, drop `S2`, swap to another shield, and unequip the shield you swapped to
                - This will d-pad lock you
            1. Pick up `S2` to equip it as a Drop Smuggle, which will release your d-pad lock
            1. Jump and pause midair, and swap to an unfused shield
            1. Fuse the dropped shield to your weapon, then put Link's back to a wall and drop the equipped shield
                - It should fail drop, but remain attached to the weapon
        1. Take out an apple and fuse it to your shield
            - This fuse entangles it to `S2`, which the Fuse ability will now ignore
            - Put the fuse entangled apple off to one side
        1. Place `A` in the culling area and confirm it can cull
        1. Delete `A`'s Recall history:
            1. Take out any material and glue it to the Steering Stick
            1. Recall the material and nudge Link forward slightly
            1. Pick up the material before the pair start moving
        1. Fuse Entangle `A` to `S2` while cull storing it:
            1. _(optional)_ Place a material in the culling area, but far enough away from `A` that Fuse is unlikely to target it; don't glue it to anything
            1. Recall `A` and leave the culling area
            1. Find a position where you're outside the culling area margins (you can see if the material culls), but you can still reach `A` with Fuse
            1. Fuse `A` to your shield
        1. Verify the cull storage on `A`:
            1. Move `A` back into the culling area
            1. Glue a small material, like an apple, onto the back of `A` (so that it's also in the culling area)
            1. Leave the culling area margins and confirm that the material culls, even though `A` itself won't
            1. Pick up the material. If it didn't cull, move `A` to one side, take out a new Steering Stick, and repeat the above steps with this as the new `A`
        1. Unequip your shield, weapon, and bow
        1. Move the Hover Stone against the wall, so it can support items in the culling area
        1. Place `A` on top of the Hover Stone so that it's in the culling area, but supported entirely by the Hover Stone
            - Don't glue the two together
        1. Equip W
        1. Glue `S3` to the base of `A`, ensuring it's in the culling area
        1. Equip `W` and put Link's back to a wall
        1. Pause, drop `W`, equip a different weapon, unpause
        1. Start recalling the Hover Stone and immediately pause
        1. Drop the equippd weapon and return to the title screen

        #### Prologue
        ---
        notoc: true
        ---

        1. Start a new game
            - Link will probably have a lot of disconnected armor (and possibly equipment) due to overload. If you'd rather not deal with that, reload the Prologue autosave you just got
        1. Pick up `W2` once to unlock your Weapons tab
        1. Unequip the MNF and pick up `W2` until your Weapons tab is full
        1. Pick up `S2` at least once
            - The other three copies you can get will buy you three more frames to get zuggle instead of SLD
        1. Pause, drop the equipped weapon, swap to the MNF
        1. Unpause, wait for Link to cull, and pause
        1. Drop five unequipped weapons, all unequipped shields, then your equipped MNF
        1. Equip the last remaining weapon
        1. Pause buffer
            - If you pause again before the game finishes processing the unequipped drops, you'll zuggle the MNF
            - If you don't pause again fast enough for that, you are **guaranteed** SLD
        1. Unequip and re-equip your shield to trigger Cull Detachment and Swap Resync
        1. Drop your currently equipped weapon
        1. Reload into the manual save inside Marakuguc


    === "Version `1.1.2`" ?
        ---
        versions: ["1.1.2"]
        ---

        This is the previous method with some adaptations for differences in version `1.1.2`:

        - L-Cancel Fuse Entanglement allows us to skip setting up Zuggle Overload.
        - No smuggle culling allows use of a different Despawn Interrupted equipment chain.
        - You only get one attempt at the final pause buffer in the Prologue, but the timing window is lenient.

        This method also works in older versions, but is a lot more work than those versions require.

        #### Requirements
        ---
        notoc: true
        ---

        - Mineru
        - 2+ weapons, 2+ shields
            - The steps will need more than this, but by that point, you'll have DI equipment for free dupes
        - 2+ Steering Sticks, 1+ Hover Stone, 1+ Shock Emitter or Shock Fruit

        #### Making DI Equipment
        ---
        notoc: true
        ---

        1. Warp to Siwakama Shrine, summon Mineru, and use her and the nearby Molduga to obtain DI weapon `W1`
        1. Use Mineru's ability to cull `W1` to create a DI ghost chain: `W1` → shield `S1` → weapon `W2` → shield `S2`
        1. Detangle all equipment from Mineru and distance-despawn all non-DI parents
        1. Zuggle all DI equipment, reload manual save, and warp to Domizuin
        1. Release all zuggles near (but fully outside) the main citadel culling area, and separate them out so that you can tell which is which
            - Weapons: `W1` will drop to the ground, while `W2` will float
            - Shields: `S1` will have the item name of a fused shield, and `S2` won't

        #### Cull Detachment construction
        ---
        notoc: true
        ---

        !!!warn "Weak Drop Equips"
            At two points during this setup, you create a _weak drop equip_. You **must** not press any button that makes Link change how he holds his equipment (<kbd>Y</kbd>, <kbd>R</kbd>, <kbd>ZL</kbd>, <kbd>ZR</kbd>) until the item in question is unequipped.

            If you make a mistake and the equipment moves out of the drop position, drop it normally, break the fusion on the smuggle cull source (`B2` or `C2`), and remake that equipment pair.

        1. Mineru Fuse Entangle weapon `M` and cold fuse Steering Stick `A1` to it
        1. Drop `M` while Mineru is unculled
            - If she does cull and the smuggle leaves you d-pad locked, dismiss Mineru to delete `M`, summon her again, and repeat the previous step
        1. Fuse Entangle weapon `B1` to shield `B2`; glue them together and leave them off to one side
        1. Fuse Entangle shield `C1` to shield `C2`; glue them together and leave them off to one side
        1. Equip S1 and drop-swap to any unfused shield with your back to the wall to smuggle it
        1. Null FE a Hover Stone to your shield
        1. Equip any shield, unpause, then drop the equipped shield to unsmuggle `S1`
        1. Equip `W1` and drop-swap-unequip with Link's back to a wall to smuggle it
        1. Equip `B1` and `B2` and Null FE `A1` to your weapon
        1. Unequip and re-equip weapon `B1`, unpause, then drop it to unsmggle `W1`
        1. Glue `A1` upright to the top of the Hover Stone, on the edge
            - There's an attachment point where the standing part of the stick is completely over the Hover Stone, but the handle column peeks out over the edge; aim for that
        1. Equip `W1` and `S1`, then drop them both (this removes their zuggle drop status)
        1. Move the Hover Stone against the wall so that `A1` is in the culling area
            - _(optional)_ Verify the position of `A1` by standing on the Hover Stone and carefully ungluing the two. If `A1` culls when you leave the culling area margins, the position is likely good. Re-glue `A1` to the Hover Stone with the same attachment point.
        1. Equip `M` and use it to SDC `A1`
        1. Hop on Mineru to unlock your ability wheel, then dismiss her
        1. Equip weapon `B1` and move `B2` into the culling area
        1. Leave the culling area margins to cull `B1` and smuggle it:
            1. Confirm `B1` is culled and not visible on Link
            1. Pause
            1. Drop `B1`, swap to another weapon, and unequip the weapon you swapped to
        1. Pick up `W2`, move somewhere out of the way, and throw it
            - This is one of the weak drop equips warned about above
        1. Watch a memory to get `W2` out of the throw state
        1. Drop `W2` to purgatorify it
            - This will freeze it in place, and you'll be completely unable to pick it up
            - You can pick up `B2` and unequip it now, we're done with it
        1. Equip `C1` and move `C2` into the culling area
        1. Leave the culling area margins to cull `C2`
        1. Prepare a shock source nearby (active Shock Emitter or dropped Shock Fruit)
        1. Pause, drop `C1`, swap to another shield, unequip the new shield
            - If using a Shock Fruit, equip any one-handed weapon before unpausing
        1. Pick up `S2` and hold <kbd>ZL</kbd> to continually guard with it
        1. Shock Link to drop equip `S2`
            - If using a Shock Emitter, walk into it while guarding
            - If using a Shock Fruit, hit it with your weapon while guarding
            - You **must** release <kbd>ZL</kbd> before the shock animation ends
            - This is the other weak drop equip warned about above
        1. Zuggle `S2`
            - `S2` won't d-pad lock you, so any basic zuggle method will work
            - Leave `C2` in the culling area for now
        1. Null FE an Apple to your shield
            - This is just to give `S2` a fusion, so it won't interfere with an upcoming step
            - Put the fuse entangled apple off to one side
        1. Take out Steering Stick `A2` and place it in the culling area
        1. Confirm `A2` can cull, then delete its Recall history:
            1. Take out any material and glue it to `A2`
            1. Recall the material and nudge Link forward slightly
            1. Pick up the material before the pair start moving
        1. Fuse Entangle `A2` to `S2` while cull storing it:
            1. Recall `A2` and leave the culling area
            1. Find a position where you're outside the culling area margins (`C2` will cull), but you can still reach `A2` with Fuse
            1. Null FE `A2` to your shield
        1. Verify the cull storage on `A2`:
            1. Move `A2` back into the culling area
            1. Glue a small material, like an apple, onto the back of `A2` (so that it's also in the culling area)
            1. Leave the culling area margins and confirm that the material culls, even though `A2` itself won't
            1. Pick up the material. If it didn't cull, move `A2` to one side, take out a new Steering Stick, and repeat the above steps with this as the new `A2`
        1. Pick up `W1` and drop it somewhere in the culling area margins
            - `W2` will snap back and stay stuck to your feet while `W1` is equipped; this is fine
        1. Glue `A2` onto `A1` while keeping it in the culling area
            - Be sure **not** to glue it to the Hover Stone by mistake
        1. Stand on `A1` and unglue the Hover Stone from it
        1. _(optional)_ Leave the culling area margins and confirm that Link still culls
            - If he does, re-enter the margins using memories
        1. Pick up `W1` and drop-swap it with Link's back to a wall to smuggle it
        1. Start recalling the Hover Stone and immediately pause
        1. Drop your equipped weapon and return to the title screen without unpausing

        #### Prologue
        ---
        notoc: true
        ---

        1. Start a new game
        1. Pick up copies of `W2` to fill your Weapons tab
        1. Pick up `S2` at least once
            - The other three copies you can get will add three frames of leniency to your pause buffer
        1. Swap from the MNF to another weapon, and unpause to complete the swap
        1. Pause, drop the equipped weapon, swap to the MNF
        1. Unpause, wait for Link to cull, and pause
        1. Drop five unequipped weapons, all unequipped shields, then your equipped MNF
        1. Equip the last remaining weapon
        1. Pause buffer
            - You **must** pause again before the game finishes processing the unequipped drops
        1. Unequip and re-equip your shield to trigger Cull Detachment and Swap Resync
        1. Drop your currently equipped weapon
        1. Reload into the manual save inside Marakuguc

    The MNF will either be zuggled on Link, or will have dropped in the last room by the Construct



## Notes

- This MNF can be powered up further with WST:
    - Transferring a strong fusion increases its attack power for obvious reasons.
    - WST can add Attack Up onto the MNF.
    - Corrupting its durability down to 1 will make every hit crit, doubling the damage and staggering most enemies.

## Resources
- [Discord](https://discord.com/channels/1086729144307564648/1105598687167664239/1108369158237859902)
- [Discord](https://discord.com/channels/1086729144307564648/1105598687167664239/1108527513203912794)
- [YouTube](https://www.youtube.com/watch?v=8mEBVQNCkns)
- [YouTube](https://www.youtube.com/watch?v=EAthghngbKs)
- [YouTube](https://www.youtube.com/watch?v=TKSQJ23ES_c)
- [Zocument](https://docs.google.com/document/d/1-BeufJtao2cG5ABG0ZDEUX1SbgQwc_89n7C0VZjPAdI/edit?usp=sharing)

## Related

- Save Load Dupe
- Swap Resync Zuggle
- Cull Detachment Zuggle

Other _MsgNotFound_ equipment:

- Mineru's Arm
- Zelda's Torch
- The two states of Link having his original Hylian arm (under the Champion's Leathers in the prologue, and shirtless in the final dive sequence) are implemented with two force-equipped armor chestpieces
