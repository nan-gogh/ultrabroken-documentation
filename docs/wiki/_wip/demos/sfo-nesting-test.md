---
title: "Super Fuse Overload"
uid: "BW8"
label: "SFO"
versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
credits: ["mulberry, Aergyl, Jordan, MandelbrotChaylay, Squidwest"]
date: "2025-12-06"
description: "By creating 600-700 Cold Fuse connections, the game can be prevented from forming any new dependencies. Mainly used to obtain Mineru's Arm and Zelda's Torch."
aliases: ["super-fuse-overload"]
tags: ["Equipment", "Fuse", "Overload", "Mineru"]
---

# Super Fuse Overload

## Summary

By creating 600-700 dependencies via Fuse, the game will be overloaded and unable to form any new dependencies. This causes every actor to act [Zuggle Overloaded](uid:8QH), and every equipment to act [Fuse Overloaded](uid:76A).

_Discovered by mulberry; Optimizations by Aergyl, Jordan, MandelbrotChaylay, mulberry, Squidwest_

## Addtional Information

### Explanation ?
---
notoc: true
---

When the game needs to relate one actor to another, it creates a "dependency". This includes things like equipment<->user, fuse<->equipment, mountable<->rider, liftable<->lifter, and so on.

Each actor stores all its own dependencies within its own array, with a maximum of 33 entries per actor (29 on `1.0.0`). If a dependency tries to be created, but one or both actors have a full array, the dependency will simply not form. This is the cause of Zuggle Overload and Fuse Overload, among others.

However, the game also stores all current dependencies in a _global_ array with a maximum of 750 entries. If this array is filled, dependencies will _always_ fail to be created, even if there is room in the involved actors' own arrays. This is the mechanism Super Fuse Overload exploits.

### Page Info ?
---
notoc: true
---

#### SFO Types ?

This page categorizes SFO methods into 3 types:

- "Local" methods are usually simpler and easier, but cannot be used for some cases (eg Zelda's Torch) because they will be destroyed on warp (including Panic Blood Moons), load, or excessive distance.
- "Persistent" methods are usually more complex, but can be used for all cases due to being protected from unintentional destruction (but are still able to be destroyed on purpose).
- "Permanent" methods are local methods with all the components permanently culled. This balances usefulness and simplicity, at the cost of needing to close the game to be undone.

#### Methodology ?

- Expected execution time (from a clean launch of the game) is 20-40 minutes, depending on method and execution. Before proceeding with a method, please read the instructions carefully, and be sure you understand the component glitches and techniques.
- The precise instructions for SFO sometimes change depending on the intended usage. To account for this, several variants of each method are provided: One basic variant, plus one for each valid use case (excluding niche uses).

### Warnings

If the global dependency array is nearly full, a Panic Blood Moon will be triggered. Many game states prevent PBMs, so Super Fuse Overload will usually be performed in one of these states.

!!! danger "Crash risk"
    Finally, some dependencies will **crash the game** if they fail to form. Suspected examples include:

    - Gorons and their "Goron Knuckle" weapon
    - Monster-Control Crew leaders and their battle standard
    - A Like-Like and a piece of equipment it has eaten

## Instructions

=== "Method 1 (Persistent):<br/>Purgatory + Overload Batch DI" ###
    ---
    versions: ["1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
    obsolete: false
    ---

    #### Basic info ?
    ---
    notoc: true
    ---

    - This is a [Persistent](#SFO-Types) method that makes use of DI equipment to maximize adjustability, ease of use, and framerate. 
    - It can be used for anything, but is best-suited for Mineru's Arm and Zelda's Torch.
    - While it is technically possible on `1.1.2` and earlier, the absence of "Drop-Swap Culling" makes it significantly more difficult.
    - Methods 3 and 4 will be faster and easier on those versions (for local and persistent needs, respectively).
    - For clarity, the steps given are thus optimized for `1.2.0` and up (and will work only on those versions).

    _Method developed by MandelbrotChaylay, Squidwest; Optimized by MandelbrotChaylay, mulberry, Squidwest_

    #### Basic Method ?

    ##### Requirements
    ---
    notoc: true
    ---

    - 13 Zuggle Overload
    - A bow to manage overload with
    - A DI Ghost weapon `A1`
    - A DI Ghost shield `B1`
    - Ideally, a second DI Ghost of each type to simplify duplication
    - Optionally, a fused equipment item

    ##### Part 1: Creating the base setup
    ---
    notoc: true
    ---
    
    1. `B1` [Overload FE](uid:0XV#method-3-vddi-smugglezuggle) weapon `B2`
    2. [Recall Lock](uid:EY8) `B2`
    3. `A1` and normal weapon `A2` [Ghost DI](uid:BEW#method-1-fuse-drop-swap-120) shield `A3`
    4. `A1` **Overload FE** normal shield `A4`; Leave `A1` [Zuggle Dropped](uid:L84)
    5. Equip `A2`, [Smuggle](uid:TGY) `A3`, and [Overload Pickup](uid:8QH) `A4`
    6. `A2-A4` [Overload Batch DI](uid:PG3#method-1-overload-pf-drop-swap-culling-120) 19 weapons `C1-C19`
    7. Confirm `C1-C19` all exist, then **Fail-Drop** `A4` to move it to Link's hand
    8. `A3` & `A4` **Ghost DI** weapon `C20`
    9. **Drop** `A4`
    10. Re-smuggle `A3`, equip a random shield, and **Fuse** something disposable to it. This will leave `A4` as the sole FE parent of `C20`
    11. Smuggle any _one_ `C`, then **equip** another and **throw it**. Finally, unsheathe weapon to return the thrown one to Link's hand. The smuggled weapon is now in Purgatory
    12. Repeat step 11 to Purgatorize _all_ `C`, using a random weapon for the final throw (it can be unequipped after)
    13. **Recall Lock** `A4`, discarding `A2` and `A3` through the load

    ##### Part 2: Performing and undoing SFO
    ---
    notoc: true
    ---

    1. Zuggle Drop `B1`, equip `A4`, and **Overload Pickup** `B2`
    2. `C1-20`, `B2`, & `A4` **Overload Batch DI** 30 Shields `D1-D30`
    3. There will be a substantial lag on the second fuse of each shield after `D1`, so using the D-pad to **drop-swap** is advised. To prevent mishaps with this, _do not_ fail-drop `A4`.
    4. _Super Fuse Overload_ should occur on the 30th shield. If confirmation is needed, **drop** the fused equipment item. If the fuse is deleted, SFO is fully active
    5. Leaving `A4` dropped, **fail-drop** `B2` and **drop** it _after_ it returns to Link's hand. Finally, un-Zuggle Drop `B1`
    6. The entire setup will now persist, and SFO will be fully active as long as Link equips each type of equipment (with exactly _one_ being fused)
    7. To undo SFO: **pick up** each `D`, **unequip** it, and **drop** it. Each deleted shield will remove 20 dependencies from the global limit

    ##### Resources ?
    ---
    notoc: true
    ---

    ??? example "Method Structure Diagram"

        ```mermaid
        graph TD
            A[B1] -->|FE| B[B2]
            C[A2] -->|DI| D[A3]
            E[A1] -->|DI| D
            E --> |FE| F[A4]
            D --> |Batch DI| G["C1-20"]
            F --> |Batch DI| G
            G --> |Batch DI| H["D1-30"]
            B --> |Batch DI| H
        ```

    #### For Mineru's Arm (Persistent variant) ?

    ##### Requirements
    ---
    notoc: true
    ---

    - 13 Zuggle Overload
    - A bow to manage overload with
    - A DI Ghost weapon `A1`
    - A DI Ghost shield `B1`
    - Ideally, a second DI Ghost of each type to simplify duplication
    - Optionally, a fused equipment item
    - Mineru

    ##### Part 1: Creating the base setup
    ---
    notoc: true
    ---
    
    1. Ensure Mineru is summoned. This will save some headache later
    2. Enter Rasitakiwak Shrine, defeat all the constructs, and dispose of their weapons (for example by leaving/reentering)
    3. (Most shrines may be used; Rasitakiwak is simply a well-tested option)
    4. `B1` [Overload FE](uid:0XV#method-3-vddi-smugglezuggle) weapon `B2`
    5. [Recall Lock](uid:EY8) `B2`
    6. `A1` and normal weapon `A2` [Ghost DI](uid:BEW#method-1-fuse-drop-swap-120) shield `A3`
    7. `A1` **Overload FE** normal shield `A4`; Leave `A1` [Zuggle Dropped](uid:L84)
    8. Equip `A2`, [Smuggle](uid:TGY) `A3`, and [Overload Pickup](uid:8QH) `A4`
    9. `A2-A4` [Overload Batch DI](uid:PG3#method-1-overload-pf-drop-swap-culling-120) 19 weapons `C1-C19`
    10. Confirm `C1-C19` all exist, then **Fail-Drop** `A4` to move it to Link's hand
    11. `A3` & `A4` **Ghost DI** weapon `C20`
    12. **Drop** `A4`
    13. Re-smuggle `A3`, equip a random shield, and **Fuse** something disposable to it. This will leave `A4` as the sole FE parent of `C20`
    14. Smuggle any _one_ `C`, then **equip** another and **throw it**. Finally, unsheathe weapon to return the thrown one to Link's hand. The smuggled weapon is now in Purgatory
    15. Repeat step 11 to Purgatorize _all_ `C`, using a random weapon for the final throw (it can be unequipped after)
    16. **Recall Lock** `A4`, discarding `A2` and `A3` through the load

    ##### Part 2: Performing and undoing SFO
    ---
    notoc: true
    ---

    1. Zuggle Drop `B1`, equip `A4`, and **Overload Pickup** `B2`
    2. `C1-20`, `B2`, & `A4` **Overload Batch DI** 30 Shields `D1-D30`
    3. There will be a substantial lag on the second fuse of each shield after `D1`, so using the D-pad to **drop-swap** is advised. To prevent mishaps with this, _do not_ fail-drop `A4`.
    4. _Super Fuse Overload_ should occur on the 30th shield. If confirmation is needed, **drop** the fused equipment item. If the fuse is deleted, SFO is fully active
    5. Leaving `A4` dropped, **fail-drop** `B2` and **drop** it _after_ it returns to Link's hand. Finally, un-Zuggle Drop `B1`
    6. The entire setup will now persist, and SFO will be fully active as long as Link equips each type of equipment (with exactly _one_ being fused)
    7. To undo SFO: **pick up** each `D`, **unequip** it, and **drop** it. Each deleted shield will remove 20 dependencies from the global limit

    ##### Part 3: Obtaining Mineru's Arm
    ---
    notoc: true
    ---

    1. Equip a weapon and ensure there is space in your weapon pouch
    2. Warp to Mogisari Shrine at the Lomei Sky Labyrinth. Other low gravity zones may work, but are untested for stability during SFO
    3. As soon as you gain control, walk in a small clockwise circle while spamming A (see video below (uh, when I add it))
    4. Execution permitting, you will pick up a new 2-handed weapon, dealing 38 damage, which has no icon, description, model, or collision, and is called MsgNotFound
    5. If unsuccessful, stand nearish to the shrine entrance and spam A between Panic Blood Moons (see other video I also haven't added)
    6. If Mineru was not summoned, simply summon her after the warp (and optionally warp again to get a go at the primary strat)
    6. About 3 seconds after control is gained, a panic blood moon will occur, which will _usually_ give an autosave
    7. Either return to Rasitakiwak Shrine to clear SFO, or simply save/autosave the game and close it

    ##### Resources ?
    ---
    notoc: true
    ---

    ??? example "Method Structure Diagram"

        ```mermaid
        graph TD

            B1[B1]
            B2[B2]
            A1[A1]
            A2[A2]
            A3[A3]
            A4[A4]
            PARENTS["Purgatory Parents<br/>(C1-C20)"]
            CHILDREN["DI Children<br/>(D1-D30)"]

            B1 -->|FE| B2
            A2 -->|DI| A3
            A1 -->|DI| A3
            A1 -->|FE| A4
            A3 -->|Batch DI| PARENTS
            A4 -->|Batch DI| PARENTS
            PARENTS -->|Batch DI| CHILDREN
            B2 -->|Batch DI| CHILDREN
        ```

    #### For Zelda's Torch ?
    
    ##### Requirements
    ---
    notoc: true
    ---

    - 13 Zuggle Overload
    - A bow to manage overload with
    - A DI Ghost weapon `A1`
    - A DI Ghost shield `B1`
    - Ideally, a second DI Ghost of each type to simplify duplication
    - Optionally, a fused equipment item
    - The _second_ prologue autosave or later (the torch falls out of bounds on the first autosave)

    ##### Part 1: Creating the base setup
    ---
    notoc: true
    ---

    1. Enter Rasitakiwak Shrine, defeat all the constructs, and dispose of their weapons (for example by leaving/reentering)
    2. (In this case, Rasitakiwak is ideal, as it contains both an overlapping area with the prologue, and multiple steering sticks to create a Portacull with)
    3. `B1` [Overload FE](uid:0XV#method-3-vddi-smugglezuggle) weapon `B2`
    4. [Recall Lock](uid:EY8) `B2`
    5. `A1` and normal weapon `A2` [Ghost DI](uid:BEW#method-1-fuse-drop-swap-120) shield `A3`
    6. `A1` **Overload FE** normal shield `A4`; Leave `A1` [Zuggle Dropped](uid:L84) 
    7. Equip `A2`, [Smuggle](uid:TGY) `A3`, and [Overload Pickup](uid:8QH) `A4`
    8. `A2-A4` [Overload Batch DI](uid:PG3#method-1-overload-pf-drop-swap-culling-120) 19 weapons `C1-C19`
    9. Confirm `C1-C19` all exist, then **Fail-Drop** `A4` to move it to Link's hand
    10. `A3` & `A4` **Ghost DI** weapon `C20`
    11. **Drop** `A4`
    12. Re-smuggle `A3`, equip a random shield, and **Fuse** something disposable to it. This will leave `A4` as the sole FE parent of `C20`
    14. Smuggle any _one_ `C`, then **equip** another and **throw it**. Finally, unsheathe weapon to return the thrown one to Link's hand. The smuggled weapon is now in Purgatory
    15. Repeat step 11 to Purgatorize _all_ `C`, using a random weapon for the final throw (it can be unequipped after)
    16. **Recall Lock** `A4`, discarding `A2` and `A3` through the load

    ##### Part 2: Performing and undoing SFO
    ---
    notoc: true
    ---

    1. Zuggle Drop `B1`, equip `A4`, and **Overload Pickup** `B2`
    2. `C1-20`, `B2`, & `A4` **Overload Batch DI** 30 Shields `D1-D30`
    3. There will be a substantial lag on the second fuse of each shield after `D1`, so using the D-pad to **drop-swap** is advised. To prevent mishaps with this, _do not_ fail-drop `A4`.
    4. _Super Fuse Overload_ should occur on the 30th shield. If confirmation is needed, **drop** the fused equipment item. If the fuse is deleted, SFO is fully active
    5. Leaving `A4` dropped, **fail-drop** `B2` and **drop** it _after_ it returns to Link's hand. Finally, un-Zuggle Drop `B1`
    6. The entire setup will now persist, and SFO will be fully active as long as Link equips each type of equipment (with exactly _one_ being fused)
    7. To undo SFO: **pick up** each `D`, **unequip** it, and **drop** it. Each deleted shield will remove 20 dependencies from the global limit

    ##### Part 3: Obtaining Zelda's Torch
    ---
    notoc: true
    ---

    1. Load the prologue autosave. Zelda will drop her torch, so pick it up
    2. If she does not, try loading to Rasitakiwak and back; It may take a few tries for her torch to be one of the dependencies that fails
    3. Get another prologue autosave with the torch in the inventory, then either load back to Rasitakiwak to clear SFO, or simply close the game
    4. Follow your preferred method to obtain MNF, but zuggle/SLD Zelda's Torch back to your progressed save instead
    5. Save the game or get an autosave

    ##### Resources ?
    ---
    notoc: true
    ---

    ??? example "Method Structure Diagram"

        ```mermaid
        graph TD
            A[B1] -->|FE| B[B2]
            C[A2] -->|DI| D[A3]
            E[A1] -->|DI| D
            E --> |FE| F[A4]
            D --> |Batch DI| G["C1-20"]
            F --> |Batch DI| G
            G --> |Batch DI| H["D1-30"]
            B --> |Batch DI| H
        ```

    #### For duplication ?

    ##### Requirements
    ---
    notoc: true
    ---

    - 13 Zuggle Overload (9 on `1.0.0`)
    - If on `1.1.2` or earlier, Intangible Aerophasing
    - A bow to manage overload with
    - A DI Ghost weapon `A1`
    - A DI Ghost shield `B1`
    - Ideally, a second of each to simplify duplication
    - Optionally, a fused equipment item
    - 1 or more of the duplication target

    ##### Part 1: Creating the base setup
    ---
    notoc: true
    ---

    1. Enter a minigame with no timer, such as House Building or the Desert Race's prep phase. If only materials (and not Zonai Devices) are to be duped, a shrine will also work
    2. For a minigame, actually entering it should wait until part 2. But do perform the setup within the area
    3. `B1` [Overload FE](uid:0XV#method-3-vddi-smugglezuggle) weapon `B2`
    4. [Recall Lock](uid:EY8) `B2`
    5. `A1` and normal weapon `A2` [Ghost DI](uid:BEW#method-1-fuse-drop-swap-120) shield `A3`
    6. `A1` **Overload FE** normal shield `A4`; Leave `A1` [Zuggle Dropped](uid:L84)
    7. Equip `A2`, [Smuggle](uid:TGY) `A3`, and [Overload Pickup](uid:8QH) `A4`
    8. `A2-A4` [Overload Batch DI](uid:PG3#method-1-overload-pf-drop-swap-culling-120) 19 weapons `C1-C19`
    9. Confirm `C1-C19` all exist, then **Fail-Drop** `A4` to move it to Link's hand
    10. `A3` & `A4` **Ghost DI** weapon `C20`
    11. **Drop** `A4`
    12. Re-smuggle `A3`, equip a random shield, and **Fuse** something disposable to it. This will leave `A4` as the sole FE parent of `C20`
    13. Smuggle any _one_ `C`, then **equip** another and **throw it**. Finally, unsheathe weapon to return the thrown one to Link's hand. The smuggled weapon is now in Purgatory
    14. Repeat step 11 to Purgatorize _all_ `C`, using a random weapon for the final throw (it can be unequipped after)
    15. **Recall Lock** `A4`, discarding `A2` and `A3` through the load

    ##### Part 2: Performing and undoing SFO
    ---
    notoc: true
    ---

    1. Zuggle Drop `B1`, equip `A4`, and **Overload Pickup** `B2`
    2. `C1-20`, `B2`, & `A4` **Overload Batch DI** 30 Shields `D1-D30`
    3. There will be a substantial lag on the second fuse of each shield after `D1`, so using the D-pad to **drop-swap** is advised. To prevent mishaps with this, _do not_ fail-drop `A4`.
    4. _Super Fuse Overload_ should occur on the 30th shield. If confirmation is needed, **drop** the fused equipment item. If the fuse is deleted, SFO is fully active
    5. Leaving `A4` dropped, **fail-drop** `B2` and **drop** it _after_ it returns to Link's hand. Finally, un-Zuggle Drop `B1`
    6. The entire setup will now persist, and SFO will be fully active as long as Link equips each type of equipment (with exactly _one_ being fused)
    7. To undo SFO: **pick up** each `D`, **unequip** it, and **drop** it. Each deleted shield will remove 20 dependencies from the global limit

    ##### Part 3: Duplicating with SFO
    ---
    notoc: true
    ---

    - Throw Hold Duping is slower but easier
    - SFO BID is faster but trickier
    - Each has some targets it cannot dupe, but all materials and devices are covered between them

    ###### Throw Hold Duplication ?

    1. Ready a **throw** of the duplication target. It should fall to the ground
    2. **Collect it** by stepping backwards and pressing A
    3. To cause another material to drop, simply swap materials. If only duplicating one target, swap back after
    4. Repeat steps 2-3 for **1** duplicate of the target per cycle
    5. **Destroy** all D[n] to end SFO before ending the minigame/exiting the shrine
    6. Save the game/get an autosave

    ###### SFO BID ?

    There are two BID methods. One does not require SFO to be reduced/undone, but is slower. The other requires this, but is faster. Either way, some things to understand:

    - BID relies on detaching the "Hold Bundle" from Link. It weighs next to nothing, has very little friction, and is perfectly round. If it or Link move away from where it was detached, the duped items will Gain Speed in proportion to this distance.
    - Thus, it is very ideal to detach the bundle within some kind of divot.
    - Having this bundle detached causes "Interaction Lock". To override this and allow duplicated materials to be collected, a material throw must be readied.

    ??? abstract "Readying Throw"
 
        1. Hold R and ZL
        2. Perform a ZL Jump in any direction
        3. Just as Link lands, press D-Pad Up to select a material (it doesn't matter which)
        4. To un-ready throw, press **Cancel** (B/X). If the readied material is overload-dropped, _do not_ actually throw it

        Depending on preference and finger durability, one may ready throw only while collecting materials (bone-friendly), or simply have it readied constantly (faster).

    ??? abstract "Without SFO Reduction"
    
        1. **Pause**, hold 1 random material and **unpause**. It will fall from Link's cupped hands and sparkle
        2. Press A to **drop** the material. Link will perform the dropping animation, but the fallen material will not change. It can be collected before proceeding if desired
        3. Optionally, unequip something to free a single dependency slot, to be taken by the throw material. This will prevent the throw bundle from being destroyed if R is accidentally released
        4. Hold a random material (ideally not a duplication target) and 4 of the duplication target. These will appear in the world
        5. **Collect** the 4 target materials on the ground (and optionally the random material, it changes nothing)
        6. **Pause**, **un-hold** the 4 duplication targets, **hold** 4 more duplication targets, then **unpause**
        7. **Collect** the 4 materials on the ground
        8. Repeat Steps 6 and 7 to satisfaction
        9. To end BID, **un-hold** all 5 materials, then **hold** and **un-hold** anything
        10. **Destroy** all `D` to end SFO before ending the minigame/exiting the shrine
        11. Save the game/get an autosave

    ??? abstract "With SFO Reduction"

        1. **Pause**, hold 1 random material and **unpause**. It will fall from Link's cupped hands and sparkle
        2. Press A to **drop** the material. Link will still do the dropping animation, but the fallen material will not change. It can be collected before proceeding if desired
        3. **Destroy** one or more `D` to reduce SFO. This will allow held items to attach to the dropped hold bundle
        4. Hold a random material and 4 duplication targets. These will appear in the invisible hold bundle
        5. **Pause**, **un-hold** and **re-hold** at least 1 item (but up to 4 if changing targets is desired), then **Unpause**
        6. Repeat step 5 up to 4 total times for 16 items the ground (17 is the maximum before drop limit right now); collecting many at once is moderately faster
        7. **Collect** the materials on the ground
        8. Repeat steps 5-7 to satisfaction
        9. To end BID. **un-hold** all 5 materials, then **hold** and **un-hold** anything
        10. **Destroy** all D[n] to end SFO before ending the minigame/exiting the shrine
        11. Save the game/get an autosave

=== "Method 2 (Local):<br/>Purgatory + DI" ###
    ---
    versions: ["1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
    obsolete: false
    ---

    #### Basic info ?
    ---
    notoc: true
    ---

    - This is a [Local](#SFO-Types) method that makes use of a specially-prepared equipment item to maximize portability and in-the-moment speed.
    - It is ideal for duplication, and can be used for Mineru's Arm by an older route, but cannot be used for Zelda's Torch.
    - While it is technically possible on `1.1.2` and earlier, the absence of "Drop-Swap Culling" makes it significantly more difficult.
    - Methods 3 and 4 will be faster and easier on those versions (for local and persistent needs, respectively).
    - For clarity, the steps given are thus optimized for `1.2.0` and up (and will work only on those versions).

    _Method developed by mulberry_

    #### The equipment ?

    - In summary, make a DI Ghost shield with 30-32 DI Ghost weapons Cold Fused to it, then purgatorize all the weapons so that they can all be "equipped" at once by zuggle dropping the shield.
    - This needn't be done using the given steps. However, they are optimized for speed and practicality.

    ##### Requirements
    ---
    notoc: true
    ---

    - 13 Zuggle Overload
    - A DI Ghost Shield `A` and normal shield `B`
    - A Torch
    - A Flame Emitter

    ##### Steps
    ---
    notoc: true
    ---

    1. Follow [this Batch DI method](uid:PG3#method-2-overload-pf-torch-culling-all-versions) to create a DI Ghost shield `C` with 30 DI Ghost weapon children (`F1` through `F30`)
    2. Swap shields to delete CF parent `D` (it is not desired), then drop the equipped shield to drop `C`
    3. Distance despawn `B`, then [Smuggle](uid:TGY) `A` and use a rocket shield. This will remove `C`'s two parent dependencies, making room for 2 more children
    4. `C` and random shield [Ghost DI](uid:BEW#method-1-fuse-drop-swap-120) weapon `F31`
    5. Distance despawn random shield
    6. Repeat steps 4 and 5 to create `F32`
    7. Smuggle any _one_ `F`, then **pick up** another and **throw** it.
    8. Swing weapon or ready weapon throw to return the thrown weapon to Link's hand
    9. Repeat steps 7 and 8 for _all_ `F`, using any normal weapon for the final throw (it can be unequipped afterwards)
    10. The final result should be DI Ghost shield `C` with 32 attached purgatory DI Ghost weapon children (`F1` through `F32`)

    #### Basic method ?

    ##### Requirements
    ---
    notoc: true
    ---

    - The special equipment
    - A DI Weapon to dupe with (optional, you _are_ expected to have overload at this point and that dupes just fine)
    - Up to 21 materials

    ##### Setting up and destroying SFO
    ---
    notoc: true
    ---

    1. Enter a minigame with no timer, such as House Building or the Desert Race's prep phase. If only materials (and not Zonai Devices) are to be duped, a shrine will also work
    2. Zuggle Drop `C` to attach the 32 weapons to Link
    3. Dupe a weapon `G1` and equip it
    4. `F1-F32` & `G1` [Ghost DI](uid:BEW) material/equipment `H1`. **Do not detangle or delete G1.**
    5. **Repeat** until attempting to fuse `H[n]` to `G[n]` fails (18-21 repetitions are expected depending on environment); Menu Link should be overloaded at this point
    6. To destroy SFO, simply inventory pickup each `G[n]`, or exit shrine if in one. Distance despawn _will not fully work_ due to the properties of DI
    7. If safety is preferred, use equipment for all `H[n]` instead of materials. This way, if `G[n]` is destroyed by drop limit/distance, `H[n]` can still be manually destroyed to clear the dependencies.

    ##### Resources ?
    ---
    notoc: true
    ---

    ??? example "Method Structure Diagram"

        ```mermaid
        graph TD
            C["DI Ghost Shield<br/>(C)"]
            F["32 Purgatory Weapons<br/>(F1-F32)"]
            PARENTS["Normal Parents<br/>(G1-G21)"]
            CHILDREN["DI Children<br/>(H1-H21)"]

            C -->|CF| F
            F -->|"Fuse<br/>(becomes CF)"| CHILDREN
            PARENTS -->|"Fuse<br/>(stays attached)"| CHILDREN
        ```

    #### For Duplication ?

    ##### Requirements
    ---
    notoc: true
    ---

    - The special equipment
    - A DI Weapon to dupe with (optional, you _are_ expected to have overload at this point and that dupes just fine)
    - Up to 21 materials
    - At least one of the duplication target

    ##### Part 1: Setting up and destroying SFO
    ---
    notoc: true
    ---

    1. Enter a minigame with no timer, such as House Building or the Desert Race's prep phase. If only materials (and not Zonai Devices) are to be duped, a shrine will also work
    2. Zuggle Drop `C` to attach the 32 weapons to Link
    3. Dupe a weapon `G1` and equip it
    4. `F1-F32` & `G1` [Ghost DI](uid:BEW) material/equipment `H1`. **Do not detangle or delete G1.**
    5. **Repeat** until attempting to fuse `H[n]` to `G[n]` fails (18-21 repetitions are expected depending on environment); Menu Link should be overloaded at this point
    6. To destroy SFO, simply inventory pickup each `G[n]`, or exit shrine if in one. Distance despawn _will not fully work_ due to the properties of DI
    7. If safety is preferred, use equipment for all `H[n]` instead of materials. This way, if `G[n]` is destroyed by drop limit/distance, `H[n]` can still be manually destroyed to clear the dependencies.

    ##### Part 2: Duplicating with SFO
    ---
    notoc: true
    ---

    - Throw Hold Duping is slower but easier
    - SFO BID is faster but trickier
    - Each has some targets it cannot dupe, but all materials and devices are covered between them

    ###### Throw Hold Duplication ?

    1. Ready a **throw** of the duplication target. It should fall to the ground
    2. **Collect it** by stepping backwards and pressing A
    3. To cause another material to drop, simply swap materials. If only duplicating one target, swap back after
    4. Repeat steps 2-3 for **1** duplicate of the target per cycle
    5. **Inventory pickup** all `G` to end SFO before ending the minigame/exiting the shrine
    6. Save the game/get an autosave

    ###### SFO BID ?

    There are two BID methods. One does not require SFO to be reduced/undone, but is slower. The other requires this, but is faster. Either way, some things to understand:

    - BID relies on detaching the "Hold Bundle" from Link. It weighs next to nothing, has very little friction, and is perfectly round. If it or Link move away from where it was detached, the duped items will Gain Speed in proportion to this distance.
    - Thus, it is very ideal to detach the bundle within some kind of divot.
    - Having this bundle detached causes "Interaction Lock". To override this and allow duplicated materials to be collected, a material throw must be readied.

    ??? abstract "Readying Throw"
 
        1. Hold R and ZL
        2. Perform a ZL Jump in any direction
        3. Just as Link lands, press D-Pad Up to select a material (it doesn't matter which)
        4. To un-ready throw, press **Cancel** (B/X). If the readied material is overload-dropped, _do not_ actually throw it

        Depending on preference and finger durability, one may ready throw only while collecting materials (bone-friendly), or simply have it readied constantly (faster).

    ??? abstract "Without SFO Reduction"
    
        1. **Pause**, hold 1 random material and **unpause**. It will fall from Link's cupped hands and sparkle
        2. Press A to **drop** the material. Link will perform the dropping animation, but the fallen material will not change. It can be collected before proceeding if desired
        3. Optionally, unequip something to free a single dependency slot, to be taken by the throw material. This will prevent the throw bundle from being destroyed if R is accidentally released
        4. Hold a random material (ideally not a duplication target) and 4 of the duplication target. These will appear in the world
        5. **Collect** the 4 target materials on the ground (and optionally the random material, it changes nothing)
        6. **Pause**, **un-hold** the 4 duplication targets, **hold** 4 more duplication targets, then **unpause**
        7. **Collect** the 4 materials on the ground
        8. Repeat Steps 6 and 7 to satisfaction
        9. To end BID, **un-hold** all 5 materials, then **hold** and **un-hold** anything
        10. **Inventory pickup** all `G` to end SFO before ending the minigame/exiting the shrine
        11. Save the game/get an autosave

    ??? abstract "With SFO Reduction"

        1. **Pause**, hold 1 random material and **unpause**. It will fall from Link's cupped hands and sparkle
        2. Press A to **drop** the material. Link will still do the dropping animation, but the fallen material will not change. It can be collected before proceeding if desired
        3. **Destroy** one or more `D` to reduce SFO. This will allow held items to attach to the dropped hold bundle
        4. Hold a random material and 4 duplication targets. These will appear in the invisible hold bundle
        5. **Pause**, **un-hold** and **re-hold** at least 1 item (but up to 4 if changing targets is desired), then **Unpause**
        6. Repeat step 5 up to 4 total times for 16 items the ground (17 is the maximum before drop limit right now); collecting many at once is moderately faster
        7. **Collect** the materials on the ground
        8. Repeat steps 5-7 to satisfaction
        9. To end BID. **un-hold** all 5 materials, then **hold** and **un-hold** anything
        10. **Inventory pickup** all `G` to end SFO before ending the minigame/exiting the shrine
        11. Save the game/get an autosave

    ##### Resources ?
    ---
    notoc: true
    ---

    ??? example "Method Structure Diagram"

        ```mermaid
        graph TD
            C["DI Ghost Shield<br/>(C)"]
            F["32 Purgatory Weapons<br/>(F1-F32)"]
            PARENTS["Normal Parents<br/>(G1-G21)"]
            CHILDREN["DI Children<br/>(H1-H21)"]

            C -->|CF| F
            F -->|"Fuse<br/>(becomes CF)"| CHILDREN
            PARENTS -->|"Fuse<br/>(stays attached)"| CHILDREN
        ```
        
    #### For Mineru's Arm (Local SFO variant) ?

    ##### Requirements
    ---
    notoc: true
    ---

    - The special equipment
    - Opitionally, a DI Weapon to efficiently dupe with
    - Up to 21 materials
    - A Portacull Shield or the means to make one portably

    ##### Part 1: Setting up SFO
    ---
    notoc: true
    ---

    1. Defeat Army and enter the tunnel before Ganondorf
    2. Zuggle `C` to attach the 32 weapons to Link
    3. Dupe a weapon `G1` and equip it
    4. `G1` [Ghost DI](uid:BEW) material/equipment `H1`; **Do not detangle or delete G1.**
    5. **Repeat** until attempting to fuse `H[n]` to `G[n]` fails (18-21 repetitions are expected); Menu Link should be overloaded at this point
    6. Glue all `G[n]` together and Ultrahand them into Ganon's Room, holding them far aside to keep them out of the way

    ##### Part 2: Obtaining Mineru's Arm
    ---
    notoc: true
    ---

    1. Progress the fight to Phase 2 (2nd form), and **drop** a fused equipment. The fuse should delete. If not, **drop** more one at a time until it does
    2. Progress to Phase 3 (sages blown away), and find Mineru
    3. **Pick up** her arm, which is invisible, collisionless, and repeatedly drops from either visible arm. It cannot be collected with an empty hand when undiscovered. Take several to be safe
    4. **Inventory pickup** all `G[n]` to undo SFO, then _UNDOCK THE CONSOLE._
    5. **Fuse** something to Mineru's Arm. _If the console is docked, this will crash the game._
    6. Use the portacull to SRZ Mineru's Arm (it will naturally fail-drop, so a wall is not needed)
    7. Load a save. If you undid SFO, there will be no crash risk
    8. Go somewhere you can see a long way down and prepare Recall (atop a Hover Stone raised with a Rocket is excellent)
    9. **Drop** an equipped weapon and immediately **Recall** the item fused to Mineru's Arm (which still has no collision)
    10. **Equip** a weapon and **pick up** Mineru's Arm (if undiscovered on this save, it still cannot be collected with an empty hand)
    11. If planning to use Mineru's arm as a fail-drop wall, **destroy** the fuse (If the console is docked, fail-dropping a fused Mineru's Arm will _crash the game_)
    12. Save the game/Get an autosave

    ##### Resources ?
    ---
    notoc: true
    ---

    ??? example "Method Structure Diagram"

        ```mermaid
        graph TD
            C["DI Ghost Shield<br/>(C)"]
            F["32 Purgatory Weapons<br/>(F1-F32)"]
            PARENTS["Normal Parents<br/>(G1-G21)"]
            CHILDREN["DI Children<br/>(H1-H21)"]

            C -->|CF| F
            F -->|"Fuse<br/>(becomes CF)"| CHILDREN
            PARENTS -->|"Fuse<br/>(stays attached)"| CHILDREN
        ```

    #### Persistent Variant (but not yet) ?
    ---
    notoc: true
    ---

    - It is possible to exploit the mechanics of DI to make this method persistent.
    - This will be provided as a seperate method at a later date (The minimum form and what it's good for need to be determined first).
    - If a non-local method is desired, Methods 1 or 4 will almost certainly be easier (for `1.2.0+` and `1.0.0-1.1.2` respectively).

=== "Method 3 (Local):<br/>Overload Cold Fuse" ###
    ---
    versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
    obsolete: false
    ---

    #### Basic info ?
    ---
    notoc: true
    ---

    - This is a [Local](#SFO-Types) method with minimal additional glitches required. 
    - It is perfectly acceptable for duplicating throwables and holdables on all versions, and can obtain Mineru's Arm by an older route.
    - It can also be made permanent via permacull; This is provided as Method 4 for clarity.
    
    _Method by mulberry(?); Optimized by Aergyl, mulberry(?)_

    #### Basic method ?

    ##### Requirements
    ---
    notoc: true
    ---

    - 13 zuggle overload (9 on `1.0.0`)
    - A bow
    - A weapon
    - 2+ unfused shields
    - A handful of fused equipment items
    - 31+ materials

    ##### Setting up and destroying SFO
    ---
    notoc: true
    ---

    1. [Overload Drop](uid:8QH) a shield and pick it up to duplicate shields until there are 19 dropped and 3+ spare in the inventory
    2. **Overload Drop** a weapon `A` and **Fuse** it to a shield `B`
    3. [Overload Cold Fuse](uid:O64) 21 shields `C1-C21` to `A` (the 19 dropped & 2 from inventory)
    4. **Fail-drop** `A` and **drop** `B`
    5. [Overload Pickup](uid:8QH) `C1` and **Overload Cold Fuse** 30 materials `D1-D30` to it
    6. **Fail-drop** `C1` and **drop** it aside
    7. Repeat 7 for `C2-C19` with the **same** `D1-D30`
    8. For `C20` and `C21`, check periodically in the menu to see if Menu Link starts overload dropping things. Once he does, _proceed to step 11_
    9. **Overload Cold Fuse** an unrelated material to `C[n]`. If it works, **collect it** and **Overload Cold Fuse** the next `D[n]`, then repeat. If it fails, _proceed to step 12_
    10. **Fail-drop** `C[n]` and **drop** it. You may have to **unequip your bow** for it to return. _Be sure it returns before dropping it._
    11. To destroy SFO, simply **collect** all `D[n]`, deleting them and the dependencies they have to each `C[n]`

    ##### Resources ?
    ---
    notoc: true
    ---

    ??? example "Method Structure Diagram"

        ```mermaid
        graph TD
            A{Link} -->|Equip| B[Shield B]
            A -->|Overload Drop| C[Weapon A]
            B -->|Fuse| C
            C -->|cf| D[Shields C1-C21]
            D -->|cf| E[Materials D1-D30]
        ```

    #### For Duplication ?

    ##### Requirements
    ---
    notoc: true
    ---

    - 13 zuggle overload (9 on `1.0.0`)
    - A bow
    - A weapon
    - 2+ unfused shields
    - A handful of fused equipment items
    - 31+ materials
    - 1+ of the duplication target

    ##### Part 1: Performing SFO
    ---
    notoc: true
    ---

    1. Enter a minigame with no timer, such as House Building or the Desert Race's prep phase. If only materials (and not Zonai Devices) are to be duped, a shrine will also work
    2. [Overload Drop](uid:8QH) a shield and pick it up to duplicate shields until there are 19 dropped and 3+ spare in the inventory
    3. **Overload Drop** a weapon `A` and **Fuse** it to a shield `B`
    4. [Overload Cold Fuse](uid:O64) 21 shields `C1-C21` to `A` (the 19 dropped & 2 from inventory)
    5. **Fail-drop** `A` and **drop** `B`
    6. [Overload Pickup](uid:8QH) `C1` and **Overload Cold Fuse** 30 materials `D1-D30` to it
    7. **Fail-drop** `C1` and **drop** it aside
    8. Repeat 7 for `C2-C19` with the **same** `D1-D30`
    9. For `C20` and `C21`, check periodically in the menu to see if Menu Link starts overload dropping things. Once he does, _proceed to step 11_
    10. **Overload Cold Fuse** an unrelated material to `C[n]`. If it works, **collect it** and **Overload Cold Fuse** the next `D[n]`, then repeat. If it fails, _proceed to step 12_
    11. **Fail-drop** `C[n]` and **drop** it. You may have to **unequip your bow** for it to return. _Be sure it returns before dropping it._

    ##### Part 2: Duplicating with SFO
    ---
    notoc: true
    ---

    - Throw Hold Duping is slower but easier
    - SFO BID is faster but trickier
    - Each has some targets it cannot dupe, but all materials and devices are covered between them

    ###### Throw Hold Duplication ?

    1. Ready a **throw** of the duplication target. It should fall to the ground
    2. **Collect it** by stepping backwards and pressing A
    3. To cause another material to drop, simply swap materials. If only duplicating one target, swap back after
    4. Repeat steps 2-3 for **1** duplicate of the target per cycle
    5. **Collect** all `D[n]` to end SFO before ending the minigame/exiting the shrine
    6. Save the game/get an autosave

    ###### SFO BID ?

    There are two BID methods. One does not require SFO to be reduced/undone, but is slower. The other requires this, but is faster. Either way, some things to understand:

    - BID relies on detaching the "Hold Bundle" from Link. It weighs next to nothing, has very little friction, and is perfectly round. If it or Link move away from where it was detached, the duped items will Gain Speed in proportion to this distance.
    - Thus, it is very ideal to detach the bundle within some kind of divot.
    - Having this bundle detached causes "Interaction Lock". To override this and allow duplicated materials to be collected, a material throw must be readied.

    ??? abstract "Readying Throw"
 
        1. Hold R and ZL
        2. Perform a ZL Jump in any direction
        3. Just as Link lands, press D-Pad Up to select a material (it doesn't matter which)
        4. To un-ready throw, press **Cancel** (B/X). If the readied material is overload-dropped, _do not_ actually throw it

        Depending on preference and finger durability, one may ready throw only while collecting materials (bone-friendly), or simply have it readied constantly (faster).

    ??? abstract "Without SFO Reduction"
    
        1. **Pause**, hold 1 random material and **unpause**. It will fall from Link's cupped hands and sparkle
        2. Press A to **drop** the material. Link will perform the dropping animation, but the fallen material will not change. It can be collected before proceeding if desired
        3. Optionally, unequip something to free a single dependency slot, to be taken by the throw material. This will prevent the throw bundle from being destroyed if R is accidentally released
        4. Hold a random material (ideally not a duplication target) and 4 of the duplication target. These will appear in the world
        5. **Collect** the 4 target materials on the ground (and optionally the random material, it changes nothing)
        6. **Pause**, **un-hold** the 4 duplication targets, **hold** 4 more duplication targets, then **unpause**
        7. **Collect** the 4 materials on the ground
        8. Repeat Steps 6 and 7 to satisfaction
        9. To end BID, **un-hold** all 5 materials, then **hold** and **un-hold** anything
        10. **Collect** all `D[n]` to end SFO before ending the minigame/exiting the shrine
        11. Save the game/get an autosave

    ??? abstract "With SFO Reduction"

        1. **Pause**, hold 1 random material and **unpause**. It will fall from Link's cupped hands and sparkle
        2. Press A to **drop** the material. Link will still do the dropping animation, but the fallen material will not change. It can be collected before proceeding if desired
        3. **Collect** one or more `D[n]` to reduce SFO. This will allow held items to attach to the dropped hold bundle
        4. Hold a random material and 4 duplication targets. These will appear in the invisible hold bundle
        5. **Pause**, **un-hold** and **re-hold** at least 1 item (but up to 4 if changing targets is desired), then **Unpause**
        6. Repeat step 5 up to 4 total times for 16 items the ground (17 is the maximum before drop limit right now); collecting many at once is moderately faster
        7. **Collect** the materials on the ground
        8. Repeat steps 5-7 to satisfaction
        9. To end BID. **un-hold** all 5 materials, then **hold** and **un-hold** anything
        10. **Collect** all `D[n]` to end SFO before ending the minigame/exiting the shrine
        11. Save the game/get an autosave

    ##### Resources ?
    ---
    notoc: true
    ---

    ??? example "Method Structure Diagram"

        ```mermaid
        graph TD
            A{"Enter Minigame/Shrine"} -->|Equip| B[Shield B]
            A -->|Overload Drop| C[Weapon A]
            B -->|Fuse| C
            C -->|cf| D[Shields C1-C21]
            D -->|cf| E[Materials D1-D30]
        ```

    #### For mineru's Arm (Local SFO variant) ?

    ##### Requirements
    ---
    notoc: true
    ---

    - 13 zuggle overload (9 on `1.0.0`)
    - A bow
    - A weapon
    - 2+ unfused shields
    - Several fused equipment items
    - 31+ materials
    - If on 1.2.0+, a Portacull Shield (or the materials to make one via Overload Cold Fuse)
    - A bucket-shaped autobuild with enough Hover Stones to float (and optionally 1-2 Big Batteries)

    ##### Part 1: Performing SFO
    ---
    notoc: true
    ---

    1. Defeat Army and enter the tunnel before Ganondorf
    2. Drop the portacull aside. Be sure not to go too far from any of the working objects (about halfway down the tunnel is safe)
    3. [Overload Drop](uid:8QH) a shield and pick it up to duplicate shields until there are 19 dropped and 3+ spare in the inventory
    4. **Overload Drop** a weapon `A` and **Fuse** it to a shield `B`
    5. [Overload Cold Fuse](uid:O64) 21 shields `C1-C21` to `A` (the 19 dropped & 2 from inventory)
    6. **Fail-drop** `A` and **drop** `B`
    7. [Overload Pickup](uid:8QH) `C1` and **Overload Cold Fuse** 30 materials `D1-D30` to it
    8. **Fail-drop** `C1` and **drop** it aside
    9. Repeat Step 7 for `C2-C19` with the **same** `D1-D30`
    10. For `C20` and `C21`, check periodically in the menu to see if Menu Link starts overload dropping things. Once he does, _proceed to step 11_
    11. **Overload Cold Fuse** an unrelated material to `C[n]`. If it works, **collect it** and **Overload Cold Fuse** the next `D[n]`, then repeat. If it fails, _proceed to step 12_
    12. **Fail-drop** `C[n]` and **drop** it. You may have to **unequip your bow** for it to return. **Be sure it returns before dropping it.**
    13. **Drop** `A` near the entrance of Ganondorf's room, but not too close to where the barrier will spawn (it cannot be moved after dropping it!)
    14. Move `B`, all of `C`, and all of `D` into the bucket build using Ultrahand
    15. Carry the bucket into Ganondorf's room, holding it high and far aside to keep it out of the way of the fight

    ##### Part 2: Obtaining Mineru's Arm
    ---
    notoc: true
    ---

    1. Progress the fight to Phase 2 (2nd form), and **drop** a fused equipment. The fuse should delete. If not, **drop** more one at a time until it does
    2. Progress to Phase 3 (sages blown away), and find Mineru
    3. **Pick up** her arm, which is invisible, collisionless, and repeatedly drops from either visible arm. It cannot be collected with an empty hand when undiscovered. Take several to be safe
    4. **Collect** the materials in the bucket to undo SFO, then _UNDOCK THE CONSOLE._
    5. **Fuse** something to Mineru's Arm. _If the console is docked, this will crash the game._
    6. Zuggle Mineru's Arm. It will always fail-drop while on the ground, so either version can be done without a wall
    7. If on `1.1.1` or earlier, Map Zuggle Mineru's Arm
    8. If on `1.1.2`, [Insert genius and triumphant zuggle method here, once it gets found]
    8. If on `1.2.0` or later, use the portacull to SRZ Mineru's Arm
    9. Load a save. If you undid SFO, there will be no crash risk
    10. Go somewhere you can see a long way down and prepare Recall (atop a Hover Stone raised with a Rocket is excellent)
    11. **Drop** an equipped weapon and immediately **Recall** the item fused to Mineru's Arm (which still has no collision)
    12. **Equip** a weapon and **pick up** Mineru's Arm (if undiscovered on this save, it still cannot be collected with an empty hand)
    13. If planning to use Mineru's arm as a fail-drop wall, **destroy** the fuse (If the console is docked, dropping a fused Mineru's Arm will _crash the game_)
    14. Save the game/Get an autosave

    ##### Resources ?
    ---
    notoc: true
    ---

    ??? example "Method Structure Diagram"

        ```mermaid
        graph TD
            A[Shield B] -->|Fuse| B[Weapon A]
            B -->|cf| C[Shields C1-C21]
            C -->|cf| D[Materials D1-D30]
            A -->|Take in| E{Ganon Room}
            C -->|Take in| E
            D -->|Take in| E
        ```

=== "Method 4 (Permanent):<br/>Overload Cold Fuse + Permacull" ###
    ---
    versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
    obsolete: false
    ---

    #### Basic info ?
    ---
    notoc: true
    ---

    - This is a [Permanent](#SFO-Types) method with minimal additional glitches required. It is acceptable for Zelda's Torch and Mineru's Arm.
    - It _can_ be used for duplication, but is needlessly complex and hazardous for this usage; Use Method 3 instead.
    - The steps given are specialized for `1.1.2` and below. They will work on `1.2.0+`, but are inefficient.

    #### Basic method ?

    ##### Requirements
    ---
    notoc: true
    ---

    - 13 Zuggle overload (9 on `1.0.0`)
    - Intangible Aerophasing (guide assumes this is set up at Akkala Citadel Ruins)
    - A bow
    - 2+ unfused weapons
    - 2+ unfused shields
    - Several fused equipment items
    - A material
    - A DI Ghost Shield `E` (to greatly simplify both duplication and permaculling)

    ##### Part 1: Performing SFO
    ---
    notoc: true
    ---

    1. Use the Aerophasing setup to ensure it has a cull stored; this will allow the culling area to remain loaded through a banc change
    2. Travel to a nearby shrine ("Mayachideg" is best for a Citadel setup) and enter it. **Do not warp there.**
    3. [Overload Drop](uid:8QH) a shield and pick it up to duplicate shields until there are 19 dropped and 3+ spare in the inventory
    4. **Overload Drop** a weapon `A` and fuse it to a shield `B`
    5. [Overload Cold Fuse](uid:O64) 21 shields `C1-C21` to `A` (the 19 dropped & 2 from inventory)
    6. **Fail-drop** `A` and **drop** `B`
    7. [Overload Pickup](uid:8QH) `C1`
    8. Duplicate 30 shields `D1-D30` off `E`, dropping each on the ground and **Overload Cold Fusing** them to `C1` as you go
    9. **Fail-drop** `C1` and **drop** it aside
    10. Repeat 7-9 for `C2-C19` with the **same** `D1-D30`
    11. For `C20` and `C21`, check periodically in the menu to see if Menu Link starts overload dropping things. Once he does, _proceed to step 11_
    12. **Overload Cold Fuse** an unrelated material to `C[n]`. If it works, **Collect it** and **Overload Cold Fuse** the next `D[n]`, then repeat. If it fails, _proceed to step 12_
    13. **Fail-drop** `C[n]` and **drop** it. You may have to **unequip your bow** for it to return. **Be sure it returns before dropping it.**
    14. **Drop** `A`

    ##### Part 2: Permaculling the shields
    ---
    notoc: true
    ---

    1. [Smuggle](uid:TGY) `E`. If `E` was not prepared, Zuggle any other unrelated shield by your preferred method
    2. Equip one of `B`, `C[n]`, or `D[n]` and step onto an un-glued object to begin phasing
    3. **Pause** the game while Link is **culled**. This will cause Link to consistently be **unculled** when the game is unpaused
    4. **Unpause** the game and immediately **open** the Shield Quick Menu (D-pad Left). If Link is **unculled** behind the menu, **drop** the equipped shield. If not, repeat step 3.
    5. Repeat steps 1-4 for _all_ `B`, `C[n]`, and `D[n]`, ultimately resulting in the entire setup being permaculled

    ##### Resources ?
    ---
    notoc: true
    ---

    ??? example "Method Structure Diagram"

        ```mermaid
        graph TD
            A[Shield B] -->|Fuse| B[Weapon A]
            B -->|cf| C[Shields C1-C21]
            C -->|cf| D[Shields D1-D30]
            A -->|Permacull| E{Persists}
            C -->|Permacull| E
            D -->|Permacull| E
            B -->|Indirect Permacull| E
        ```

    #### For Zelda's Torch ?

    ##### Requirements
    ---
    notoc: true
    ---

    - 13 Zuggle overload (9 on `1.0.0`)
    - Intangible Aerophasing (guide assumes this is set up at Akkala Citadel Ruins)
    - A bow
    - 2+ unfused weapons
    - 2+ unfused shields
    - Several fused equipment items
    - A material
    - A DI Ghost Shield `E`
    - The _second_ prologue autosave

    ##### Part 1: Performing SFO
    ---
    notoc: true
    ---

    1. Use the Aerophasing setup to ensure it has a cull stored; this will allow the culling area to remain loaded through a banc change
    2. Travel to a nearby shrine ("Mayachideg" is best for a Citadel setup) and enter it. **Do not warp there.**
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

    ##### Part 2: Permaculling the shields
    ---
    notoc: true
    ---

    1. [Smuggle](uid:TGY) `E`. If `E` was not prepared, Zuggle any other unrelated shield by your preferred method
    2. Equip one of `B`, `C[n]`, or `D[n]` and step onto the phasing platform
    3. **Pause** the game while Link is **culled**. This will cause Link to consistently be **unculled** when the game is unpaused
    4. **Unpause** the game and immediately **open** the Shield Quick Menu (D-pad Left). If Link is **unculled** behind the menu, **drop** the equipped shield. If not, repeat step 3.
    5. Repeat steps 1-4 for _all_ `B`, `C[n]`, and `D[n]`, ultimately resulting in the entire setup being permaculled

    ##### Part 3: Obtaining Zelda's Torch
    ---
    notoc: true
    ---

    1. Load your prologue save. Zelda will drop her torch, so pick it up
    2. If she does not, try loading to Mayachideg and back; It may take a few tries for her torch to be one of the dependencies that fails
    3. Get another autosave and close the game to clear SFO
    4. Follow your preferred method to obtain MNF, but zuggle/SLD Zelda's Torch back to your progressed save instead
    5. Save the game or get an autosave

    ##### Resources ?
    ---
    notoc: true
    ---

    ??? example "Method Structure Diagram"

        ```mermaid
        graph TD
            A[Shield B] -->|Fuse| B[Weapon A]
            B -->|cf| C[Shields C1-C21]
            C -->|cf| D[Shields D1-D30]
            A -->|Permacull| E{Persists}
            C -->|Permacull| E
            D -->|Permacull| E
            B -->|Indirect Permacull| E
        ```

    #### For Mineru's Arm (persistent SFO variant) ?

    ##### Requirements
    ---
    notoc: true
    ---

    - 13 Zuggle overload (9 on `1.0.0`)
    - Intangible Aerophasing (guide assumes this is set up at Akkala Citadel Ruins)
    - A bow
    - 2+ unfused weapons
    - 2+ unfused shields
    - Several fused equipment items
    - A material
    - A DI Ghost shield `E`

    ##### Part 1: Performing SFO
    ---
    notoc: true
    ---

    1. Ensure Mineru is summoned. This will save some headache later
    2. Use the Aerophasing setup to ensure it has a cull stored; this will allow the culling area to remain loaded through _a_ banc change
    3. Walk up to the nearby shrine ("Mayachideg" is best for a Citadel setup) and enter it. **Do not warp there.**
    4. [Overload Drop](uid:8QH) a shield and pick it up to duplicate shields until there are 19 dropped and 3+ spare in the inventory
    5. **Overload Drop** a weapon `A` and fuse it to a shield `B`
    6. [Overload Cold Fuse](uid:O64) 21 shields `C1-C21` to `A` (the 19 dropped & 2 from inventory)
    7. **Fail-drop** `A` and **drop** `B`
    8. [Overload Pickup](uid:8QH) `C1`
    9. Duplicate 30 shields `D1-D30` off the DI shield, dropping each on the ground and **Overload Cold Fusing** them to `C1` as you go
    10. **Fail-drop** `C1` and **drop** it aside
    11. Repeat 8-10 for `C2-C19` with the same `D1-D30`
    12. For `C20` and `C21`, check periodically in the menu to see if Menu Link starts overload dropping things. Once he does, proceed to step 12
    13. **Overload Cold Fuse** an unrelated material to `C[n]`. If it works, pick it back up and **Overload Cold Fuse** the next `D[n]`, then repeat. If it fails, proceed to step 13
    14. **Fail-drop** `C[n]` and **drop** it. You may have to unequip your bow for it to return. **Be sure it returns before dropping it.**
    15. **Drop** `A`

    ##### Part 2: Permaculling the shields
    ---
    notoc: true
    ---

    1. [Smuggle](uid:TGY) `E`. If `E` was not prepared, Zuggle any other unrelated shield by your preferred method
    2. Equip one of `B`, `C[n]`, or `D[n]` and step onto the phasing platform
    3. **Pause** the game while Link is **culled**. This will cause Link to consistently be **unculled** when the game is unpaused
    4. **Unpause** the game and immediately **open** the Shield Quick Menu (D-pad Left). If Link is **unculled** behind the menu, **drop** the equipped shield. If not, repeat step 3.
    5. Repeat steps 1-4 for _all_ `B`, `C[n]`, and `D[n]`, ultimately resulting in the entire setup being permaculled

    ##### Part 3: Obtaining Mineru's Arm
    ---
    notoc: true
    ---

    1. Equip a weapon and ensure there is space in your weapon pouch
    2. Warp to Mogisari Shrine at the Lomei Sky Labyrinth. Other low gravity zones may work, but are untested for stability during SFO
    3. As soon as you gain control, walk in a small clockwise circle while spamming A (see video below (uh, when I add it))
    4. Execution permitting, you will pick up a new 2-handed weapon, dealing 38 damage, which has no icon, description, model, or collision, and is called MsgNotFound
    5. If unsuccessful, stand nearish to the shrine entrance and spam A between Panic Blood Moons (see other video I also haven't added)
    6. If Mineru was not summoned, simply summon her after the warp (and optionally warp again to get a go at the primary strat)
    6. About 3 seconds after control is gained, a panic blood moon will occur, which will _usually_ give an autosave
    7. Hard save the game if desired, then close it to clear SFO

    ##### Resources ?
    ---
    notoc: true
    ---

    ??? example "Method Structure Diagram"

        ```mermaid
        graph TD

            LINK[Link]
            AERO[Aerophasing]
            LOCATION[Shrine]
            A[Weapon A]
            B[Shield B]
            C["Shields<br/>C1-C21"]
            D["Shields<br/>D1-D30"]
            PERMACULL[Permacull]
            STATE[Permanent]

            LINK -->|Store cull| AERO
            LINK -->|"Enter without<br/>warping"| LOCATION
            AERO -->|"Still works<br/>inside"| LOCATION
            LINK -->|Equip| B
            LINK -->|Overload Drop| A
            B -->|Fuse| A
            A -->|CF| C
            C -->|CF| D
            AERO -->|Allows| PERMACULL
            B -->|Directly| PERMACULL
            C -->|Directly| PERMACULL
            D -->|Directly| PERMACULL
            A -->|Indirectly| PERMACULL
            PERMACULL -->|Makes| STATE
        ```

## Notes

### General SFO properties

- The global dependency heap is full, so no new dependencies can be created.
- Every newly-loaded NPC and enemy will overload drop everything they're carrying.
- Many such overload drops will crash the game (presumably due to missing code for interacting with the world as a dropped item?).
- Every newly-loaded fused equipment item will lose its fuse in-world (not in the inventory). It will detangle for one frame and then be deleted.

### Tips and Additional Uses

- Link's equipment can be used for fine-grained control over the final few dependency slots. With a bow, fused shield, fused weapon (and its sheath), and fully synced armor, up to 9 dependencies are fully controllable.
- SFO bypasses the "Overload SDC protection" present on `1.2.0` and up, allowing any mountable actor to be SDC'd simply by mounting.
- Depths Ghosts will despawn without having ever taken ownership of their weapons, allowing for Kinematic Weapons to be obtained without fusing them.
- Every attempt at fusing something will cause Fuse Overload Fuse Storage, allowing for [Fuse Overload Fuse Entanglement](uid:G8Q) without performing actual Fuse Overload.

### Credits ?

I might end up distributing this into the right places but idk. Maybe both, for maximum referencing speed?

- SFO discovered by ??? (I guess I need another round of asking about the origin)
- SFO first performed on vanilla by Aergyl, mulberry - Dec 05th, 2025
- Mineru's Arm ganon route found by mulberry - Dec 07th, 2025
- Zelda's Torch obtained by mulberry - Dec 07th, 2025
- SFO Throw Duplication found by mulberry - Dec 06th, 2025
- SFO BID (both variants) found by mulberry - Mar 27th, 2026
- Mineru's Arm mainfield route found by Squidwest - Mar 18th, 2026
- SFOFE by mulberry(?) - Feb 24th, 2026(?)
- SFO KW found by Squidwest - Apr 24th, 2026

- DI SFO by MandelbrotChaylay - Feb 01st, 2026
- Rediscovered and optimized by Squidwest - Feb 24th, 2026
- Hand Purg + non-batch DI SFO by mulberry - Feb 24th, 2026
- Overload Cold Fuse SFO by Aergyl, mulberry - Dec 05th, 2026
- (Method 4 is really only an extension of Method 3, so I don't think it even _has_ seperate credits? I ought to try this "reading" thing sometime idk)

### Page Todos: ?
---
notoc: true
---

- Find better minigames to recommend
- Figure out more about SFO BID (is it possible to deoverload enough for normal BID without actually destroying part of the setup? I guess if your overload comes from ZD DI Ghosts like mine does, that should work a treat) (what actually happens if the throw bundle is thrown empty, and can it be used for faster device duplication?)
- Find a more convenient Minigame Escape for unprogressed files (I miss you minecart land ;_;)
- Actually obtain Zelda's Torch at some point to provide better directions and warn of the pitfalls (soon tm)
- Get some illustrative images, screenshots, and videos going (less... soon... tm)
- Run the pre-`1.2.0` aerophasing setup by someone who actually plays an old patch
- Update/Publish the permalinked pages to include missing modern methods & tech
- Additionally, update the permalinked pages to include DI tech wherever needed/practical
- Possibly just split the page into several nothing on this wiki should be 1275 lines ("SFO" for basic setups; "Mineru's Arm", "Zelda's Torch", & "Throw Hold Duplication" for variants) (and update BID page to include SFO tech as an obsolete alternative)

### Resources

??? quote "Discord Resources"

    - [Original Discovery](https://discord.com/channels/1086729144307564648/1110956205624532993/1446913364268683395)
    - [Original Zelda's Torch Get](https://discord.com/channels/1086729144307564648/1110956205624532993/1447220634987003984)
    - [Original Mineru's Arm Get](https://discord.com/channels/1086729144307564648/1110956205624532993/1447304812197838930)
    - [SFO Throw Duplication](https://discord.com/channels/1086729144307564648/1110956205624532993/1446921416875446423)
    - [Original DI Method](https://discord.com/channels/1086729144307564648/1109838351596527726/1467646671142916238)
    - [Optimized Hand Purg + BDI Method](https://discord.com/channels/1111875355758837830/1128775917376897145/1475776267910516747) (not the first nor the best, but the one I have a source for 👍)
    - [Hand Purg + DI Method](https://discord.com/channels/1111875355758837830/1128775917376897145/1475872486359830538)
    - [SFOFE](https://discord.com/channels/1111875355758837830/1128775917376897145/1475878511720923380)
    - [Easier Mineru's Arm Route](https://discord.com/channels/1086729144307564648/1113557914444111873/1484238374909902868)
    - [SFO BID](https://discord.com/channels/1086729144307564648/1113557914444111873/1487214470131486862)
    - [SFO KW](https://discord.com/channels/1086729144307564648/1105598687167664239/1497841862579327147)

### Related
- [Zuggle Overload](search:Zuggle Overload)
- [Despawn Interrupt](search:Despawn Interrupt)
- [Fuse Entanglement](search:Fuse Entanglement)



## Ultra Testing Zone ?
---
notoc: true
---

### Idea 1 ?

- Idea 1: Condense steps into minimum form as the header of a dropdown, so that the more verbose steps can be revealed as the reader desires.
- This is a faux tutorial. That, for some reason, is a real tutorial for Mineruvian DI Dpurg
- Ugly af
- Still no better on H5 level
- This would need new site features to work well, namely an H7 header level which uses completely normal formatting (except, possibly, a subtly clickable text color)

=== "Idea 1 Method 1" ####

    - This method is the preferred one on new patches.
    - Fast method.

    Steps:

    ##### 1. Mineru CF the target ?

    1. Get a portacull of opposite type to target
    2. Drop target `A`
    3. Fuse to Mineru and portacull 1-2f later

    ##### 2. Overload FE the target ?

    1. Smuggle future DI Ghost Parent `B`
    2. Overload drop item of same type `C`
    3. Fuse `C` to opposite type
    4. Fuse target to `C`
    5. Swap from `C` to another item of that type
    6. Warm drop it
    7. Pick up/drop `B` to reduce overload

    ##### 3. Overload Pickup target and equip portacull ?

    1. You know how to do this.

    ##### 4. Fuse+Faildrop target and late portacull ?

    1. Mount Mineru and highlight the target with her Fuse
    2. If Mineru's Arm is not owned, place Mineru's back to a wall
    3. Ensure there will be room to re-equip the target when it is fail-dropped later (for example, unequip Link's bow)
    4. Fuse the target to the same slot it is CF'd to and pause at the same time (this may even feel like pressing + before the fuse button)
    5. Fail-drop the target using either the wall or Mineru's Arm. It may be wise to unequip bow/desync
    6. Perform a slow pause buffer or 2 perfect ones, so that the target no longer appears in the inventory
    7. Use the portacull

### Idea 2 ?

- Idea 2: the same thing, but use title-less headers beneath each condensed step to contain the corresponding verbose steps, allowing plain formatting to be maintained on all steps.
- Currently, this method is not workable due to the way headers automatically aggregate instead of aggregating by indentation level.
- Even though I know this, I'm still stupidly trying it :)
- As expected, formatting rules don't support this
- Or do they?

=== "Idea 2 Method 1" ####

    - This method is the preferred one on new patches.

    ##### Variant 1A ?

    - Fast method.

    Steps:

    1. Mineru CF the target
    
        ######   ?
        
        1. Get a portacull of opposite type to target
        2. Drop target `A`
        3. Fuse to Mineru and portacull 1-2f later
    
    2. Overload FE the target ?
    
        ###### - ?
        
        1. Smuggle future DI Ghost Parent `B`
        2. Overload drop item of same type `C`
        3. Fuse `C` to opposite type
        4. Fuse target to `C`
        5. Swap from `C` to another item of that type
        6. Warm drop it
        7. Pick up/drop `B` to reduce overload
        
    3. Overload Pickup target and equip portacull
    
    4. Fuse+Faildrop target and late portacull
    
        ###### Details ?
        
        1. Mount Mineru and highlight the target with her Fuse
        2. If Mineru's Arm is not owned, place Mineru's back to a wall
        3. Ensure there will be room to re-equip the target when it is fail-dropped later (for example, unequip Link's bow)
        4. Fuse the target to the same slot it is CF'd to and pause at the same time (this may even feel like pressing + before the fuse button)
        5. Fail-drop the target using either the wall or Mineru's Arm. It may be wise to unequip bow/desync
        6. Perform a slow pause buffer or 2 perfect ones, so that the target no longer appears in the inventory
        7. Use the portacull

### Idea 3 ?

- Idea 3: the same thing again, but use admonitions.
- Technically functional but not very pretty
- There's really not much else to try, and I'm not convinced any new/modified site features would make this work better. It's just a misuse of admonitions.

=== "Idea 3 Method 1" ####

    - This method is the preferred one on new patches.

    ##### Variant 1A ?

    - Fast method.

    Steps:

    ??? abstract "1. Mineru CF the target"

        1. Get a portacull of opposite type to target
        2. Drop target `A`
        3. Fuse to Mineru and portacull 1-2f later

    ??? abstract "2. Overload FE the target"

        1. Smuggle future DI Ghost Parent `B`
        2. Overload drop item of same type `C`
        3. Fuse `C` to opposite type
        4. Fuse target to `C`
        5. Swap from `C` to another item of that type
        6. Warm drop it
        7. Pick up/drop `B` to reduce overload

    ??? abstract "3. Overload Pickup target and equip portacull"

    ??? abstract "4. Fuse+Faildrop target and late portacull"

        1. Mount Mineru and highlight the target with her Fuse
        2. If Mineru's Arm is not owned, place Mineru's back to a wall
        3. Ensure there will be room to re-equip the target when it is fail-dropped later (for example, unequip Link's bow)
        4. Fuse the target to the same slot it is CF'd to and pause at the same time (this may even feel like pressing + before the fuse button)
        5. Fail-drop the target using either the wall or Mineru's Arm. It may be wise to unequip bow/desync
        6. Perform a slow pause buffer or 2 perfect ones, so that the target no longer appears in the inventory
        7. Use the portacull

### Idea 4 ?

- Idea 4: the same thing again, but use tabs (this freaking woman istg)
- Hoping the h6 delineations I'm using Work, instead of Don't Work. Will be sad otherwise
- H6 delineations technically work but in practice add too much whitespace between, trying dash delineators
- Dash delineators are better but I'm still not fond of the whitespace
- Unfortunately I think removing the line breaks will just break the formatting instead of condensing the pagespace, but I'm trying it

=== "Idea 4 Method 1" ####

    - This method is the preferred one on new patches.

    ##### Variant 1A ?

    - Fast method.

    Steps:

    === "1. Mineru CF the target" ######

    === "Details" ######

        1. Get a portacull of opposite type to target
        2. Drop target `A`
        3. Fuse to Mineru and portacull 1-2f later
    ---
    === "2. Overload FE the target" ######

    === "Details" ######

        1. Smuggle future DI Ghost Parent `B`
        2. Overload drop item of same type `C`
        3. Fuse `C` to opposite type
        4. Fuse target to `C`
        5. Swap from `C` to another item of that type
        6. Warm drop it
        7. Pick up/drop `B` to reduce overload
    ---
    === "3. Overload Pickup target and equip portacull" ######
    ---
    === "4. Fuse+Faildrop target and late portacull" ######

    === "Details" ######

        1. Mount Mineru and highlight the target with her Fuse
        2. If Mineru's Arm is not owned, place Mineru's back to a wall
        3. Ensure there will be room to re-equip the target when it is fail-dropped later (for example, unequip Link's bow)
        4. Fuse the target to the same slot it is CF'd to and pause at the same time (this may even feel like pressing + before the fuse button)
        5. Fail-drop the target using either the wall or Mineru's Arm. It may be wise to unequip bow/desync
        6. Perform a slow pause buffer or 2 perfect ones, so that the target no longer appears in the inventory
        7. Use the portacull

### Idea 5 ?

- Idea 5: tabs again, but a single selector at the top of the tutorial chooses between a condensed and a verbose mode.
- Think I'd like this more if it didn't letter the substeps. Numbers is fine boss
- Eh the letters are okay I guess
- This is probably the closest thing we have to a fully supported and intentional way to do this.

=== "Idea 5 Method 1" ####

    - This method is the preferred one on new patches.

    ##### Variant 1A ?

    - Fast method.

    === "Steps (Condensed):" ######

        1. Mineru CF the target
        2. Overload FE the target
        3. Overload Pickup target and re-equip portacull
        4. Fuse+Faildrop target and late portacull

    === "Steps (Expanded):" ######
    
        1. Mineru CF the target
            1. Get a portacull of opposite type to target
            2. Drop target `A`
            3. Fuse to Mineru and portacull 1-2f later
        2. Overload FE the target
            1. Smuggle future DI Ghost Parent `B`
            2. Overload drop item of same type `C`
            3. Fuse `C` to opposite type
            4. Fuse `A` to `C`
            5. Swap from `C` to another item of that type
            6. Warm drop it
            7. Pick up/drop `B` to reduce overload
        3. Overload Pickup target and re-equip portacull
        4. Fuse+Faildrop target and late portacull
            1. Mount Mineru and highlight the target with her Fuse
            2. If Mineru's Arm is not owned, place Mineru's back to a wall
            3. Ensure there will be room to re-equip the target when it is fail-dropped later (for example, unequip Link's bow)
            4. Fuse the target to the same slot it is CF'd to and pause at the same time (this may even feel like pressing + before the fuse button)
            5. Fail-drop the target using either the wall or Mineru's Arm. It may be wise to unequip bow/desync
            6. Perform a slow pause buffer or 2 perfect ones, so that the target no longer appears in the inventory, but has not yet fully despawned
            7. Use the portacull



## instructions rewrite hole ?

new philosophy: This page, once ported to the live page, will contain only the "basic" instructions, plus a section on use-cases. Any use-case involved enough to have its own special instructions is involved enough to have its own page on accomplishing it.

=== "Local" ###

	- These methods will be destroyed by warping, loading a save, or traveling too far away. Thus, they cannot be used for some things, but are often faster than persistent methods.

	=== "Batch->Normal DI" ####

		- Likely the fastest method on this page for versions `1.2.0+`.

		##### Gist ?

		1. Use overload and a DI Ghost (`A`) to create a batch of DI Ghost Weapons (`D`) that all share the same parent (`C`)
		2. Place all `D` in purgatory so that they can be "equipped" all at once via `C`
		3. Use `D` and a set of normal weapons (`E`) to create a set of DI Ghosts (`F`)

		##### Requirements

		- Overload
		- A DI Ghost Shield `A`
		- Ideally, a DI Ghost Weapon to dupe with

		##### Steps

		[placeholder]

	=== "Overload CF" ####

		- The only method on this page that can be performed without significant preparation on `1.0.0-1.1.2`, and thus the fastest method on those versions as well.

		##### Gist ?

		1. Use overload to to create a set of shields, each cold-fused to the same weapon
		2. Cold Fuse a set of materials to every shield one-by-one

		##### Requirements

		- Overload
		- Some of each equipment type
		- 25+ materials

		##### Steps

		[placeholder]

=== "Persistent" ###

	- Persistent methods stay active even through warping, loading saves, or traveling far away. This makes them the only way to perform certain things that SFO can achieve.

	=== "Nested Batch DI" ####

		- The only persistent method on this page that can be reversed without closing the game.

		##### Gist ?

		1. Use overload and a DI Ghost (`A`) to create a batch of DI Ghost items (`D`) that all share the same parent (`C`)
		2. Place all `D` in purgatory so that they can be "equipped" all at once via `C`
		3. Use overload and `D` to create a second batch of DI Ghost items (`E`), so that each `E` has a dependency to each `D`
		4. Recall Lock any non-DI items used in the setup

		##### Requirements

		- 13 Zuggle Overload
		- A DI Ghost Weapon `A1`
		- A DI Ghost Shield `A2`
		- A second DI Ghost Weapon and Shield (for duping)
		- Ideally, a bow and an arrow (to manipulate overload and check for SFO)
		
		##### Steps

		[placeholder (don't forget MinArm/ZTorch has a mistake!)]

	=== "Batch->Normal DI->Detangle" ####

		- Most likely the fastest persistent method on this page.

		##### Gist ?

		1. Use overload and a DI Ghost (`A`) to create a batch of DI Ghost Weapons (`D`) that all share the same parent (`C`)
		2. Place all `D` in purgatory so that they can be "equipped" all at once via `C`
		3. Use `D` and a set of normal weapons (`E`) to create DI Ghost Hover Stones (`F`) in Ihen-A
		4. Throw each `E` to detangle each `F`, leaving only the dependencies between each `D` and each `F`
		5. Create & detangle a couple more `F` to make up for the dependencies lost in step 4

		##### Requirements

		- Overload
		- A DI Ghost Shield (`A`)
		- Ideally, a DI Ghost Weapon to dupe with
		- At least 21 Hover Stones

		##### Steps

		[placeholder]

	=== "DI Break Detanglement" ####

		- More versatile than the preceding method, but typically slightly slower as well.

		##### Gist ?

		1. Use overload and a DI Ghost (`A`) to create a batch of DI Ghosts (`D`) that all share the same parent (`C`)
		2. Place all `D` in purgatory so that they can be "equipped" all at once via `C`
		3. Use `D` and a set of normal items (`E`) to create DI Ghosts of fragile fuses (`F`)
		4. Break each `E` to detangle each `F`, leaving only the dependencies between each `D` and each `F`
		5. Create & detangle a couple more `F` to make up for the dependencies lost in step 4

		##### Requirements

		- Overload
		- A DI Ghost Shield (`A`)
		- Ideally, a DI Ghost Weapon to dupe with
		- At least 21 "fragile fuses" (Must not be replacement actors(link it))

		##### Steps

		[placeholder]

	=== "Overload CF->Pcull" ####

		- I don't know if this method has any unique merit left now that culling has been unlocked on early patches? But it has historical strengths, so idk...

		##### Gist ?

		1. Use overload to to create a set of shields (`C`), each cold-fused to the same weapon (`B`), which itself is fused to a shield (`A`)
		2. Cold Fuse a second set of shields (`D`) to every (`C`), one-by-one
		3. Use some kind of culling tech to permacull `A`, every `C`, and every `D`, so that nothing can unload
		4. Ensure the culling tech does not unload

		##### Requirements

		- Overload
		- A culling tech (advised: Mulberry's Flickering Flame (Fused SDC Type))

		##### Steps

		[placeholder]
		
	=== "Pcull Only" ####

		- Don't... do this one. It's extremely simple and easy to understand, but that's because it's extremely inefficient.
		- I don't think MFF helps, because it improves every other method too.
		- If you're on 1.2.0+ don't even read the instructions. Go learn a DI method, I'm actually begging you.

		##### Gist ?

		1. Use some kind of duplication to repeatedly duplicate fused equipment items
		2. Use some kind of culling tech to permacull these duped items, preventing them from unloading
		3. Ensure the culling tech does not unload

		##### Requirements

		- A way to Drop Zuggle (advised: Overload)
		- A duplication method (advised: a DI Ghost)
		- A culling tech (advised: Mulberry's Flickering Flame (Fused SDC Type))

		##### Steps

		[placeholder]
