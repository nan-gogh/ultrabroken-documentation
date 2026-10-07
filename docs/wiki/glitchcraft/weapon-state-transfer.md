---
title: "Weapon State Transfer"
uid: "JMU"
label: "WST"
versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
credits: ["BigDUCCO", "kurocat471", "ElDuende", "Mentor_Kurt", "Vee.Might.Exist", "Syb"]
date: "2023-05-19"
description: "Allows you to transfer the durability, fused material, and modifier between equipment of the same type"
aliases: ["weapon transfer", "weapon-state-transfer", "Unload WST", "unload-wst"]
tags: ["weapon", "fuse", "entanglement", "equipment", "item"]
---

# Weapon State Transfer

## Summary
Allows you to copy the durability, fused material, and modifier from one piece of equipment to another.

The equipment to copy from (the _donor_) and the equipment to transfer to (the _target_) must be the same type (so both weapons, both shields, or both bows). Only modifiers that vary between instances of the same weapon (e.g. Shield Guard Up, Long Throw, Five-Shot Burst) can be transferred with WST; fixed weapon modifiers (e.g. Improved Flurry Rush, Water Warrior) cannot be transferred.

Every WST method is ultimately just the following steps:

- Prepare donor equipment in the inventory, or on the ground
- Equip the target
- Do something to delete the target object from the world, but keep it equipped in the inventory
- Pick up the donor to apply WST to the inventory item, although Link will still have the donor equipped
- Optionally, unequip and re-equip to remove that desync

!!! warning
    Version `1.0.0` requires the donor equipment to be a zuggle drop.

## Credits

_Collision method: BigDUCCO, kurocat471, ElDuende, Mentor_Kurt - 19 May 2023_

_Overload method: BigDUCCO, Vee.Might.Exist, Syb (date unknown)_

## Instructions

=== "Method 1 (Collision, `1.0.0`–`1.1.1`)" ###
    !!! warning
        Collision methods on versions after 1.0 are finicky. To get better results, you need to be **exactly** perpendicular to the wall.

    #### Requirements

    - 2 long sticks (can be found on an enemy southeast of Fuse shrine)
    - A target item (weapon/bow/shield)
        - For weapons, you'll need an extra long stick.
        - For bows, you'll need an old wooden bow (can be found inside the In-isa [Fuse] Shrine, on an enemy east of Ascend shrine) or a bow of similar size.
        - For shields, you'll need a a fan or any other large zonai item, as well as an extra unfused shield.
    - A donor item of the same category as the target item with the fuse, durability and modifier you want.
    - Any shield (if not using shields)

    #### Setup

    0. SAVE FIRST, this glitch might delete the target item if done improperly.
    1. Drop the donor item nearby
    2. Equip the target item and line Link up with a large enough flat wall (ex.: Interior Shrine walls)
        - If the target is a shield, fuse a fan to it.
    3. Scope, aim with bow, use camera, or face Link away from the wall.
    4. Parry once for weapons, twice for bows/shields .
    5. Open inventory, equip:
        - The long stick, if target is a weapon
        - The old wooden bow,  if target is a bow
        - The other shield, if target is a shield
        - If not on version 1.0, unpause and pause again
    6. Drop the 2 non-equipped long sticks, then drop the item equipped in step 5.
    7. Equip the target item.
    8. Pause buffer, drop the target item and close the menu.
    9. Pick up the donor item without picking up anything else.

    If done correctly, the target item should have everything the donor item has.

    #### Notes on this method

    - The weapons, shields and bows aren't the only ones that work, it all depends on their hitboxes
    - You might find equal success using other thin bows, thin spears with other targets
    - Similarily, the shield fuse is not always necessary, as some shields are naturally bigger than others
    - Depending on the bow you use (ex. Phrenic Bow), you'll still be able to perform WST, but the Old Wooden Bow has very good consistency.

=== "Method 2 (Overload, all versions)" ###
    !!! info
        This method also gives you a pre-WST copy of the target item, thanks to Equipment Mitosis.

    #### Requirements
    - You must be able to reach the zuggle overload threshold

    #### Setup

    1. Prepare the donor item in the inventory
    1. Overload drop the target item
    1. Drop the donor item
    1. Pick up the target item to delete it from Link's hands
        - Drop the new (unequipped) inventory copy if that tab is now full
    1. Pick up the donor item to apply WST
    1. Unequip and re-equip the target to resync your equipment

=== "Method 3 (Fuse Entanglement, all versions)" ###
    #### Requirements
    - The target item must have no fusion on it

    #### Setup

    1. Prepare the donor item in the inventory, or dropped nearby
    1. Fuse entangle the target item to a shield (if a weapon or bow) or weapon (if a shield or bow)
    1. Have both sides of the fuse entanglement equipped
    1. Pause, and destroy the fusion on (or unequip) the FE parent
    1. If the donor item is in the inventory, drop it without equipping it first
    1. Unpause and pick up the donor item
    1. Unequip and re-equip the target to resync your equipment


=== "Method 4 (Mineru, all versions)" ###
    #### Requirements
    - The target item must have no fusion on it

    #### Setup

    1. Prepare the donor item in the inventory, or dropped nearby
    1. Mineru FE the target item and equip it
    1. Dismiss Mineru, and wait for the target item to disappear
    1. Drop and pick up the donor item
    1. Unequip and re-equip the target to resync your equipment

=== "Method 5 (Like Like, all versions)" ###
    #### Requirements
    - Proximity to a Like Like
    - Ability to warp

    #### Setup

    1. Prepare the donor item in the inventory
    1. Sluggle the target item
    1. Warp somewhere
    1. Drop and pick up the donor item
    1. Unequip and re-equip the target to resync your equipment

## Notes

- In 1.0.0, performing WST this way can allow you to delete the modifier completely.
- Many of the non-collision methods are referred to as 'Unload WST', but every WST method does this kind of unloading.

## Resources
- Discord: original setup posts by BigDUCCO:
    - [Collision](https://discord.com/channels/1086729144307564648/1105598687167664239/1109319667673223189)
    - [Unload](https://discord.com/channels/1086729144307564648/1113557914444111873/1116378940546748416)
- [YouTube](https://www.youtube.com/watch?v=pMsoToqT52g)
- [YouTube](https://www.youtube.com/watch?v=ycKeFgsb7gs)
- [YouTube](https://www.youtube.com/watch?v=NRZpPp1vVsQ)
- [YouTube](https://www.youtube.com/watch?v=Kzf_uJBvRjI)
- [YouTube](https://www.youtube.com/watch?v=1gWV6p814F8)
