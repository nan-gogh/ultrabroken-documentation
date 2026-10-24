---
title: "Kinematic Weapons"
uid: "OO2"
label: "KW"
versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
credits: ["mulberry", "dt13269", "Squidwest"]
date: "2026-02-25"
description: "Allows weapons with the 'kinematic' motion type to be obtained, which don't react to outside forces (making them movable only by certain techniques)."
aliases: ["kinematic equipment","unmovable equipment"]
tags: ["equipment"]
---

# Kinematic Weapons

## Summary
Allows weapons with the 'kinematic' motion type to be obtained, which don't react to outside forces (making them movable only by certain techniques).

_Discovered by dt13269, mulberry; Optimizations by mulberry, Squidwest - 25 February 2026_

## Instructions

All methods require a weapon currently held by a Depths Ghost, which will be referred to as the "target weapon" or "target".

=== "Pause-Cancel FE Methods" ###
    ---
    versions: ["1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
    ---

    These Methods pause the game while performing FE on the target, preventing the depths ghost from detecting it being tampered with.

    #### Method 1: Pause-Cancel Overload FE + Load Null Fuse ?

    - This method uses Overload FE to extract the weapon, allowing for quick extraction without "expending" a given depths ghost.

    Steps:

    1. Zuggle any shield
    2. [Overload Drop](uid:8QH) another shield and fuse it to a weapon
    3. Highlight the target weapon with Fuse
    4. Press ZL and **pause** the game on the same frame. This can be done by buffering the ability wheel, or by opening a menu
    5. When the game unpauses, the target should FE to the zuggled shield, but remain floating and interactible
    6. Highlight the target weapon with Fuse again
    7. Press ZL and +/- on the same frame, then load a save. The target should be where it was, but uninteractible
    8. Move away from the target weapon and use a Rocket Shield to detangle it from the zuggled shield
    9. The target weapon should regain interaction and remain floating

    _Method discovered by mulberry - Mar 11th, 2026_

    #### Method 2: Pause-Cancel Mineru FE + Load Null Fuse ?

    - This method uses Mineru Cold Fuse to extract the weapon, uniquely allowing for extraction without Zuggle Overload.

    Steps:

    1. Find a large weapon cairn, with 3 depths ghosts atop it. These are large enough for Mineru to spawn atop them.
    2. Zuggle any shield
    3. Mineru FE another shield
    4. Highlight the target weapon with Fuse
    5. Make Mineru cull, and perform "Animated" [Mineru Cold Fuse](uid:IG2) on the target weapon (the frame which causes the visual and sound effects to play)
    6. On the frame you press ZL, **pause** the game. This can be done by opening a menu, or by performing this method on an unobtained weapon (??? prompt)
    7. When the game unpauses, the target should FE to the zuggled shield, but remain floating and interactible
    8. Highlight the target weapon with Fuse again
    9. Press ZL and +/- on the same frame, then load a save. The target should be where it was, but uninteractible
    10. Move away from the target weapon and use a Rocket Shield to detangle it from the zuggled shield
    11. The target weapon should regain interaction and remain floating

    _Method discoverd by mulberry - Mar 11th, 2026_

    #### Method 3: Pause-Cancel Overload FE + Warp Fuse ?

    - This method uses a warp to pause the game after the second fuse, allowing for quick remote extraction.

    Steps:

    1. Zuggle any non-DI shield
    2. [Overload Drop](uid:8QH) another shield and fuse it to a weapon
    3. Highlight the target weapon with Fuse
    4. Press ZL and **pause** the game on the same frame. This can be done by buffering the ability wheel, or by opening a menu
    5. When the game unpauses, the target should FE to the zuggled shield, but remain floating and interactible
    6. Highlight the target weapon with Fuse again
    7. Press ZL and +/- on the same frame, then warp to your destination without unpausing
    8. Use Octo Detanglement on the _equipped_ shield. This will detangle from the _zuggled_ parent shield without having to time the cancel
    9. The target weapon should regain interaction and remain floating

    _Method discovered by mulberry - Mar 11th, 2026_

    #### Pause-Cancel??? ?

    - Instead of pausing during the FE, any method requiring Pause-Cancel can alternatively be performed with Overload Pickup:

    Replacement Steps:

    1. [Overload Pickup](uid:8QH) the target weapon
    2. Move out of the depths ghost's update range, but stay within its spawn range
    3. This distance varies between depths ghosts, but can be made more lenient by facing the camera away from it
    4. **Fail-drop** the target, then **drop** it once it returns to Link
    5. Proceed with a given Pause-Cancel method; The depths ghost will not despawn even without performing Pause-Cancel

=== "Overload Pickup Methods" ###
    ---
    versions: ["1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
    ---

    These Methods use Overload Pickup to move the target to a distance where the depths ghost can't detect it being tampered with.

    #### Method 4: Basic Loadless ?

    - This method relies on the ability to detach a fully-fused and ghosted weapon from its parent via Overload Pickup, allowing Octo Detanglement to be done out of update range (as is necessary to preserve the detanglement target).

    Steps:

    1. [Overload Pickup](uid:8QH) the target weapon
    2. Move out of the depths ghost's update range, but stay within its spawn range
    3. This distance varies between depths ghosts, but can be made more lenient by facing the camera away from it
    4. **Fail-drop** the target, then **drop** it once it returns to Link. It should remain floating and interactible
    5. Overload Pickup the target again and fuse it to a shield
    6. Move out of the spawn range of the depths ghost
    7. **Fail-drop** the target, then **drop** it once it moves from the shield to Link's back
    8. Move out of update range of the target and use Octo Detanglement on the parent shield
    9. The target weapon should regain interaction and remain floating

    _Method discovered by Squidwest - Mar 11th, 2026_

    #### Method 5: Minimalist Loadless ?

    - This method relies on the fact that an Overload Cold Fuse causes the target to be considered "Fused" for a single frame.

    Steps:

    1. [Overload Pickup](uid:8QH) the target weapon
    2. Move to the edge of the depths ghost's spawn range. Face away from the depths ghost to prevent it from updating
    3. Fail-drop the target, then drop it once it returns. It should remain floating and interactible
    4. [Overload Drop](uid:8QH) a shield and fuse it to a weapon
    5. Overload Cold Fuse the target to the shield on the frame Link exits the depths ghost's spawn range
    6. The target weapon should remain floating and interactible

    _Method discovered by mulberry - Mar 11th, 2026_

    #### Method 6: Temporary Ghosting ?

    - This method relies on the fact that an Overload Cold Fuse to an out-of-range parent can be made to not update (and thus de-ghost) until approached.

    Steps:

    1. [Overload Pickup](uid:8QH) the target weapon
    2. Move out of the depths ghost's update range, but stay within its spawn range
    3. This distance varies between depths ghosts, but can be made more lenient by facing the camera away from it
    4. Fail-drop the target, then drop it once it returns. It should remain floating and interactible
    5. [Overload Drop](uid:8QH) a shield (A) and fuse it to a weapon
    6. Overload Cold Fuse a shield (B) to A
    7. **Fail-drop** A, then and *drop* it once it returns to Link
    8. Overload Pickup B, then move it out of Link's update range (max Ultrahand distance is far enough)
    9. Highlight the target weapon with Fuse
    10. Press ZL and **pause** the game on the same frame. This can be done by buffering the ability wheel, or by opening any menu
    11. When the game unpauses, the target weapon should warp to B and become uninteractible, without appearing fused in the inventory
    12. Exit the depths ghost's spawn range, then return to the target weapon; it should regain interaction and remain floating

    _Method discovered by mulberry - Mar 11th, 2026_

=== "Other Methods" ###
    ---
    versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
    ---

    These methods share nothing in common with the other methods on this page. They are usually inefficent, except on `1.0.0`, where they are the only working methods.

    #### Method 7: Reverse Overload FE ?

    - This method uses Overload FE to Fuse Entangle an undiscovered item to the Kinematic Weapon without discovering that item.
    - This reverts the KW to an undiscovered item, allowing the New Item Prompt to be used to protect it from deletion.

    Steps:

    1. Prepare an undiscovered item.
    2. [Overload Pickup](uid:8QH) the target weapon
    3. Move out of the depths ghost's update range, but stay within its spawn range
    4. This distance varies between depths ghosts, but can be made more lenient by facing the camera away from it
    5. Fail-drop the target, then Zuggle it once it returns
    6. Overload Drop a weapon and fuse it to a shield
    7. Fuse the undiscovered item to weapon, causing Overload FE to the target weapon
    8. Swap weapon to reattach, then drop equipped weapon (and thus the Kinematic weapon) at the edge of the Depths Ghost's spawn range
    9. Use Ultrahand on the Kinematic Weapon to undo the resulting Zuggle Drop
    10. Walk out of the Depths Ghost's spawn range and pick up the Kinematic Weapon during the Depths Ghost's despawn animation
    11. Performed correctly, the New Item Prompt will protect the Kinematic Weapon from being destroyed by the Depths Ghost

    #### Method 8: Lift Storage Warp ?

    - This method uses Lift Storage Warp to teleport Link out of the Depths Ghosts' spawn area during the New Item Prompt. Said prompt protects the Kinematic Weapon from despawning.
    - It only works on an undiscovered Kinematic Weapon.

    1. The steps get added _after_ sleep and testing occur
    2. In that order

    #### Method 9: Super Fuse Overload ?

    - This method uses Super Fuse Overload to exhuast the game's Global Dependency Array and prevent the depths ghost from ever "equipping" the weapon.
    - It is extremely suboptimal for all patches `1.1.0` and up, but is the only known way to obtain a Kinematic Weapon on `1.0.0` without access to an undiscovered item.

    Steps:

    1. Perform Minigame Escape so that panic blood moons cannot occur.
    2. Find the edge of a depths ghosts' spawn area and stand near to but outside of it.
    3. Perform Super Fuse Overload via a local method.
    4. With every dependency slot filled, enter the depths ghost's spawn area. The depths ghost will despawn without affecting its weapon.
    5. Remove some of the dependencies created with SFO so that the weapon can be picked up.
    6. Zuggle the weapon and load a save.
    7. Stand still and [Warm Drop](uid:C6H) a weapon to drop the KW for retrieval without giving it velocity.

    Theorized mechanism: The depths ghost, having overload-dropped the weapon, will immediately consider it to be "taken", and thus will follow the usual order of events: It will change the weapon's motion type from "Kinematic" to "Dynamic", then despawn itself without despawning the weapon. However, because the Depths Ghost->Weapon dependency is missing, the attempt to change the weapon's motion type will **fail**.

    _Method discovered by Squidwest - Apr 24th, 2026_

## Notes

### General Properties

- Cannot be glued "from" (holding it/something attached to it), only "to" (holding something unattached to it).
- Uses an effective mass of 1,000,000 for certain purposes, such as calculating glue strength.
- Does not collide with anything, though regular ("Dynamic") objects _will still collide with it_.
- As it does not collide, external forces do not affect it, thus only a select few actions can change its velocity.
- Version `1.0.0` lacks a check for whether the weapon is fused, making most methods impossible.

### Known ways to move Kinematic Weapons

#### Pickup-related Actions ?
---
notoc: true
---

Kinematic Weapons can still be picked up, and will also accept velocity from some related actions:

- Carrying it around; Drop Smuggle-like states retain collision and are notably more forceful than normal
- Dropping it while moving, which directly adds Link's velocity
- Throwing it, which directly adds throw velocity; Boomerangs will follow a return arc

#### Ability-related Actions ?
---
notoc: true
---

- Autobuild can select, snap, and move Kinematic Weapons freely, making it one of the best ways to position one
- Recall (and Recall Lock) can both **move** and **stop** a Kinematic Weapon in all the expected ways
- Ultrahand can slightly reduce the velocity of a Kinematic Weapon by attaching something; this can stop the KW completely if it is already slow enough
- Additionally, attaching an upside-down Wing can cause the Kinematic Weapon to anomalously surge upwards
- Fusing the Kinematic Weapon to another item causes it to follow; ordinary Fuse will not allow retrieval, but Pseudo Fuse will

### Other Notes

!!! warning "Take care!"

    Warping causes a "sleep" on equipped items, which will undo this state! You can zuggle it to take it with you safely.

## Resources
- [Original discovery](https://discordapp.com/channels/1086729144307564648/1110956205624532993/1476367185642520639)
- [Original Load Null Fuse Method](https://discord.com/channels/1086729144307564648/1110956205624532993/1476693921533923390)
- [Pause-Cancel Method](https://discord.com/channels/1086729144307564648/1113557914444111873/1481259601495195739)
- [Mineru Pause-Cancel Method](https://discord.com/channels/1086729144307564648/1113557914444111873/1481251852237672609)
- [Pause-Cancel Warp Method](https://discord.com/channels/1086729144307564648/1113557914444111873/1481411419093340222)
- [Basic Loadless Method](https://discord.com/channels/1086729144307564648/1113557914444111873/1481190445135691836)
- [Minimalist Loadless Method](https://discord.com/channels/1086729144307564648/1113557914444111873/1481347605215580363)
- [Temporary Ghosting Method](https://discord.com/channels/1086729144307564648/1113557914444111873/1481367458517487877)
- [SFO Method](https://discord.com/channels/1086729144307564648/1105598687167664239/1497841862579327147)

## Related
- [Zuggle Overload](search:Zuggle Overload)
- [Mineru FE](search:Mineru Fuse Entanglement)
