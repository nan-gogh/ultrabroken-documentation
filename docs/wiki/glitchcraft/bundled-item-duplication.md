---
title: "Bundled Item Duplication"
uid: "099"
label: "BID"
versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
credits: ["Ock", "KiloVictor", "mulberry", "Blackmars", "Yee", "Squidwest"]
date: "2023-12-12"
description: "Holding and then destroying a material a couple of frames before Link culls causes it to get put into a state of constantly respawning when holding another item, allowing for massive duping."
aliases: ["bundled-item-duplication", "bundled-item-dupe", "bid"]
tags: ["duplication", "item", "culling"]
---

# Bundled Item Duplication

## Summary

Culling Link right after holding a material detaches the material (until Link unculls), during which it is destroyable. If done, the empty hold bundle can be made to constantly respawn held materials, allowing for massive duping. It is the fastest material duplication glitch currently known.

## Setups

=== "Like-Like Stick Cull BID" ###
	---
	versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
	obsolete: true
	---
	The method that BID was originally discovered with. It is generally not recommended anymore due to like-like stick culling producing inconsistent results with step 2's cull timing.

	_Ock - 12 December 2023_
	
 	1. Setup like like stick culling (some locations are more consistent than others (look-out landing like likes are terrible))
	2. Hold any item which bursts from heavy impact (bird eggs are recommended) 2 frames before Link culls. If done correctly the item will fall onto the ground and break
	3. Drop the unloaded item onto the ground, you may have to watch multiple memories to uncull Link enough for him to drop the item
	4. Watch another memory to uncull Link, then immediately mount a horse, mineru, a steering stick, or lift an object to stop the culling

	!!! tip "Tip"
		- If you are having trouble with this method, there is an altenative method that removes the timing, but it requires getting specific cull luck: Watch a memory to uncull, hold L during the memory and don't release it, wait 1 second, then unpause and choose the map rune ([Discord](https://discord.com/channels/1086729144307564648/1110956205624532993/1197162039974580356) (Lightos_))
	
=== "SDC Cull BID" ###
	---
	versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
	obsolete: false
	---
	Originally created by Kilovictor, this setup is the easiest and most consistent BID method to date. It is similar in principle to the LLSC setup, but with a much more consistent culling mechanism.

	_Kilovictor, mulberry - 7 April 2024_
	
	1. Fuse entangle a steering stick to a weapon/shield
	2. Perform stick desync clip on the entangled steering stick, then fuse it to another weapon/shield
	3. Place the original equipment that the stick is entangled to inside a culling area
		- While not necessary, it is recommended to also attach an extra material to the equipment inside the culling area to make cull/uncull behavior consistent.
	4. Pick up the steering-stick-fused item to equip it and exit the culling area
	5. Drop the stick-fused item to uncull
	6. Pause and hold any item which bursts from heavy impact (bird eggs are recommended)
	7. Watch a memory and unpause, the item which you just held should fall onto the ground and break
	8. Drop the stick-fused item to uncull once again, then drop the unloaded item onto the ground
		- Step 8 relies on a drop mechanic unique to v1.2.0+. To uncull Link from the SDC cull on v1.1.2 and older:
		- Unequip or swap off of the stick-fused item
		- Watch a memory and then unpause
	10. (optional) Prepare to throw an item to pickup both the stick-fused item and the stick-entangled item

=== "Mineru Cull BID" ###
	---
	versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
	obsolete: false
	---
	The fastest and simplest BID method to date at the cost of a frame perfect timing which can be made more consistent using recall.

	_mulberry - 9 June 2024_

	1. Cold fuse a steering stick to a weapon or shield
	2. Perform stick desync clip with the cold fused steering stick, then fuse the steering stick to Mineru
	3. Proc Mineru to cull by aiming ultrahand at her while standing near a wall/ledge
	4. Pause just as the orb of light from Mineru's callback touches Link's hand, then hold an egg and unpause
	5. Drop the now-broken egg on the ground and dismiss Mineru
	
	!!! tip "Tip"
		To make the timing for step 4 easier, enter recall instead of jumping and repeatedly press L + B to advance the game frame by frame until Mineru's callback orb is in the correct position. Be careful though, as it is very easy to get stuck culled if you buffer too many frames, forcing you to load a save and completely restarting the setup.
		
=== "Cull Storage BID" ###
	---
	versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
	obsolete: false
	---
	Uses cull storage to time a cull to occur exactly 2 frames after Link holds an item.

	_mulberry, Blackmars - 12 June 2024_

	1. Fuse entangle a steering stick to a shield
	2. Perform stick desync clip with the entangled steering stick inside a culling area
	3. Mount another steering stick/Mineru to unlock rune wheel
	4. Perform cull storage on the entangled steering stick
	5. Buffer drop 4 (7 on switch 2) unequipped equipment items before dropping the FE base shield
	6. Unpause while holding L, then select the map rune when the rune wheel pops up
	7. Hold an egg and unpause
	8. If the egg breaks, drop the now-broken egg on the ground. Otherwise try again from step 4

=== "Hold Smuggle BID" ###
	---
	versions: ["1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
	obsolete: false
	---
	Combines portable culling with Mineru Hold Smuggle to consistently buffer a frame and cull Link after holding an item.
	
	_Yee - 10 August 2024_

	Prerequisites:

	- 2 bird eggs
	- Mineru's sage ability
	
	!!! tip "Tip"
		Before starting, it is recommended to have as close to 2 bird eggs in the inventory as possible, since you will need to get rid of this material completely in step 3.
		
	1. Create portacull shield/weapon and drop a bird egg on the ground to collect later
	2. Perform Mineru Hold Smuggle with another bird egg
	3. Using the materials quick menu, throw the remaining quantity of the item Link is currently holding onto the ground until it no longer appears in the quick menu
		- If the previous two steps have been done correctly, Link in the inventory should appear to be holding the breakable item in his hand despite the inventory showing 0/5 items held.
	4. Jump and pause midair, then add an item to the currently held stack and remove it
	5. Press - to enter the map and watch a memory
	6. Go back into the inventory and unhold the breakable item by pressing X
	7. Buffer drop 7 (13 on switch 2) unequipped equipment items before dropping the portacull item and swapping to a different item of the same type
	8. Unpause and drop the now-destroyed item on the ground
	9. Pick up the original egg left on the ground in step 1
  
    An alternative approach to steps 7 and 8 which doesn't require dropping excess equipment:
	  1. Drop portacull item and swap to a different item of the same type
	  2. Pause buffer and switch equipment again
	  3. When the egg drops and breaks, drop the currently equipped item to uncull Link

=== "Portacull BID" ###
	---
	versions: ["1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
	obsolete: false
	---
	Uses portacull while in recall to force a newly held breakable item to fall onto the ground and break.
	
	_Squidwest - 27 May 2026_

	1. Create a portacull shield
	2. Open recall and then pause
	3. Hold a bird egg
	4. Unpause, and time a d-pad press to open the quick menu on the first possible frame
		- Spamming can work, but timing the press is more consistent with practice
		- Either way, when successful, Link's right hand will still be nearly fully held out, with the Recall glow clearly visible
	5. Drop the portacull shield and spam the dpad again to swap to a different shield without unpausing the game
	6. Close the shield quick menu, then open it again as soon as Link culls and switch shields
		- If done correctly, Link will remain culled upon unpausing, and the egg should fall onto the ground and break. If not, try again from step 2.
	7. Drop the currently equipped shield to uncull Link, then drop the unloaded item on the ground

	!!! tip "Tips"

		- If another means is used to break the material (eg a thrown DI Ghost or a returning boomerang), step 6 may be skipped entirely. Furthermore, nearly any breakable material may be used in place of the bird egg.
		- However, when skipping step 6 _and_ using alternate materials, some drop delay may be needed to lengthen the cull. This is done by dropping ~1-2 extra equipment items before the portacull during step 5, still without letting the game unpause.
		- The steps call for a portacull _shield_ specifically. This is for clarity only; a portacull weapon may be used instead.

## Duplication

Once BID has been set up using one of the methods described above, you can start duplicating your items. To do that:

1. Hold another of the bursting item that was destroyed to setup BID, then hold up to 4 more items you would like to duplicate
2. Unpause and a bundle of the items Link is currently holding should appear in the spot that the invisible item was set down in (unless the wind blew it away)
3. From now on, every time the currently held item stack is updated by unholding or holding any of the 4 duplication targets (including unholding+reholding the _same_ target), the items from before the stack was updated will appear at the location of the dropped bundle

To pick up your duplicated items:

1. Hold ZL and R, then jump in place and enter the material quick menu as soon as Link lands on the ground again
2. Select any item from the menu, and continue holding R as you exit the menu
3. Now you can pick up items on the ground so long as Link remains in the material throw state

To end BID:

1. Unhold all of your items or switch tabs in the inventory
2. Unpause
3. Go back into the inventory and hold another item
	
## Notes

- To maximize consistency with the held item breaking, try holding the item while standing on a hard surface and/or increasing the height between Link and the ground.
- It is best practice to avoid performing BID in large open spaces, as wind can blow the bundle away from where it was placed and cause items spawned from it to fling towards their origin.
- The effects of hold smuggle from BID persist through loads, unless canceled
- Using a thrown Ghost DI equipment (still in the thrown state), you can stand in the hitbox of the weapon while holding the breakable item to instantly break it during BID setups, which removes the randomness of inconsistent cull durations associated with some BID setups.

## Resources
- [Original Source](https://discord.com/channels/1086729144307564648/1113557914444111873/1184150352174514308)

??? example "Examples & Tutorials (click to expand)"
	- [LLSC BID Tutorial](https://www.youtube.com/watch?v=WNnnI13a954)
	- [SDC Cull BID Walkthrough (Old)](https://www.youtube.com/watch?v=jQkN32W59Kc)
	- [Updated SDC Cull BID Tutorial](https://www.youtube.com/watch?v=xeD2SfNF7zA&t=276s)
	- [Mineru BID Walkthrough](https://www.youtube.com/watch?v=8cHT4KoQ_0Y)
	- [Cull Storage BID Example](https://discord.com/channels/1086729144307564648/1113557914444111873/1530706286612578578)
	- [Portacull BID Example](https://discord.com/channels/1086729144307564648/1113557914444111873/1509118048819351603)

## Related
- [Memory Buffering](uid:UWY)
- [Like Like Stick Smuggling](uid:6KV)
- [Fuse Entanglement](search:fuse entanglement)
- [Cold Fuse](search:cold fuse)
- [Stick Desync Clip](search:stick desync clip)
- [Mineru Hold Smuggle](uid:12A)
- [Cull Storage](uid:7A4)
- [Portable Culling](uid:LMB)
