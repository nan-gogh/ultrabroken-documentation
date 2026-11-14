---
title: "Drop Smuggle"
uid: "089"
aliases: ["ds"]
---

# Drop Smuggle

A [smuggle](uid:TGY) in the drop [equip position](uid:S8I).

Note that [drop _equips_](uid:HY9) are sometimes referred to as drop smuggles, despite not being true smuggles. Unlike drop equips though, drop smuggles have no _strong_/_weak_ distinction in practice, due to us having no known way to move a dynamic smuggle to the drop position (smuggling a weak drop equip would just make it a static drop smuggle).

## Effects

Drop Smuggles, unlike their static/dynamic counterparts, can be equipped:

- Equipping a Drop Smuggle does nothing to affect its smuggle status; it's just smuggled _and_ equipped now.
- If you swap from a Drop Smuggle to something else, and you have no \[unculled\] drop zuggles, it will be unequipped without being deleted, preserving its smuggle status. However, just unequipping will delete the Drop Smuggled equipment.
- If you have a free equipment slot, you can also pick up the equipped Drop Smuggle a second time, which acts exactly like unequipping it. Unlike with an overload drop, you won't get an inventory duplicate, or an unloaded actor for WST, but it is a convenient way to remove D-Pad Lock from a drop smuggle.

## Methods

[Search for drop smuggle methods](search:Drop Smuggle)

## Converting to a zuggle

Equip and warm-drop any other equipment of the same type. The drop smuggle will become a drop zuggle.

## Undoing

To undo a drop smuggle, equip it and fail drop it; it will then be equipped normally. You can also equip it and pick it up a second time, if you have a free equipment slot, to unequip it. Despite this inventory requirement, the item will not duplicate.

For game versions after `1.0`, a Despawn Interrupted drop smuggle cannot be undone. It can only be unsmuggled through one of the following changes:
- converting it to a drop zuggle;
- deleting it by equipping and unequipping;
- sending it to purgatory by equipping and warm-dropping;
- reverted to non-DI by equipping it and warping (ensure it's not also smuggled first, or the equipment will be deleted).
