---
title: "Drop Equip"
uid: "HY9"
---

# Drop Equip

A fully equipped item in the drop [equip position](uid:S8I).

Some guides will refer to drop equips as drop _smuggles_, because the discovery of this glitched equipment state predated our full understanding of what a smuggle in this game actually is.

## Strength

Drop Equips can be _strong_ or _weak_ (sometimes called _static_ and _dynamic_). Weak Drop Equips revert to normal dynamic equipment state when you do any input that makes Link change how he holds that equipment; strong Drop Equips don't.

## Methods

=== "Throwing with smuggle" ###
	---
	versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2"]
	---

	Obtain any persistent \[static\] smuggle, then equip and throw (or shock-drop) the target. The target will become a weak drop equip, and the smuggle will be sent to purgatory.

=== "Overload double-drop" ###
	---
	versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0", "1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
	---

	- Overload drop/pickup some equipment
	- Pause, drop-swap it
	- Unpause and pause again <!-- TODO: membuffer can warm new equips, so does that work here? -->
	- Drop the newly equipped item to unsmuggle the original
	- Pick up the original item for a strong drop equip

	You will end up d-pad locked after step 3 on `1.1.2` and later. You can work around this by culling Link before pausing, or for bows and shields on `1.1.2`, using the ability wheel to open the quick menu. Culling Link _before_ the drop-swap will desync your equipment, but isn't a problem for this setup, and may be easier to perform for some culling sources (e.g. portacull). Confusingly, you are just as prone to d-pad lock if the original equipment was despawn interrupted, despite that usually not happening; it does this if the equipment is the active smuggle, but has no other connection to Link.

- [Search for drop equip methods](search:drop equip)
- [Search for drop smuggle methods](search:drop smuggle)

## Converting to a zuggle

Drop equips can be converted to [drop zuggles](search:Drop Zuggle) quite easily. Most methods are variants on what it takes to make a [zuggle drop](uid:L84).

## Sending to purgatory

If you warm-drop a drop equip, the equipment will be sent to [purgatory](uid:TAO). Unlike most purgatory methods, this will keep the equipment's collision with terrain.

## Undoing

To undo a drop equip, fail drop it. You can also pick it up if you have an empty equipment slot, which will act exactly like an unequip.

