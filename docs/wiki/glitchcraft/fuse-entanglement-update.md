---
title: "Fuse Entanglement"
draft: true
label: "FE"
versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
credits: ["Physioninja"]
date: "2023-05-24"
description: "Allows objects to be fused to equipment and exist in the world simultaneously."
aliases: ["fuse entanglement", "FE"]
tags: ["fuse", "culling"]
---

# Fuse Entanglement

## Summary
Allows objects to be fused to equipment and exist in the world simultaneously.

## Instructions
=== "L Cancel FE" ###
	---
	versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2"]
	obsolete: false
	---
	The method that Fuse Entanglement was originally discovered with. It is arguably the easiest method to execute, but it is also only compatible with shields and is patched on newer versions.

	_Physioninja - 24 May 2023_
	
	1. Have a shield equipped and activate the fuse rune
	2. Whilst focusing on the target object with fuse, hold L and press ZL to fuse to the shield just before the rune wheel opens
	3. Once the rune wheel opens, let go of L and quickly spam dpad left (timing the press also works) to enter the shield quick menu without unpausing the game
	4. Switch to a different shield and let go of dpad

=== "Fuse Storage FE" ###
	---
	versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3"]
	obsolete: false
	---
	Getting fuse storage on an object and swapping equipment while the fuse-stored object unculls causes FE. Often abbreviated as FSFE.

	#### Like-Like FSFE ?
	---
	versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0"]
	obsolete: false
	---
	Causes FE through the like like method of fuse storage. This method only works on equipment and bombs, as other objects either cannot be eaten or are destroyed upon being eaten by like likes.

	_Mozz, Ryan? - 18 June 2023_
	
	1. Get fuse storage on the target object
		- The icon of the equipment you are fusing to on the fuse interface should NOT flash white if the timing was correct
	2. Drop the equipment item that was used to get fuse storage and swap to another item of the same type
	3. Stun or kill the like like to release fuse storage and the target should appear at the dropped item
	!!! note "Note"
		While it is technically possible to achieve like-like FE through the "late" fuse storage timing (icon flashes white), it requires pausing on the exact frame that the fuse storage gets released and thus is not recommended.

	#### Area Cull FSFE ?
	---
	versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
	obsolete: false
	---
	Causes FE through the area cull method of fuse storage. This method works with most objects except for battery-consuming zonai devices as their increased cull range makes them incompatible with the setup.

	_mulberry, Yee, Zas - 25 February 2024_

	1. Position the fuse target at the edge of a small-margin culling area. Some of the most common locations are Hudson's house in Tarrey Town or Akkala Citadel
	2. If Link is not already standing outside the culling area, focus the fuse target with ultrahand while walking out
	3. Face Link to the fuse target and switch to the fuse rune. It is important that the fuse target remains unculled up to this point
	4. Enter the map, then play and skip through a memory
	5. Unpause and quickly press ZL/Y to get fuse storage on the desired equipment
		- If the timing was correct, the icon of the item you fused to should flash white on the fuse interface. Fusing one frame early with no flash is also fine, though the only way to tell if you got the timing correct this way is to attempt the FE
	6. Walk back into the culling area while holding L, then select the map rune and skip through another memory
	7. Equip a different item of the same type used for fuse storage (unequipping and reequipping the same item also works) and unpause
	!!! note "Note"
		If the fuse target is an equipment item that was equipped before dropping onto the ground, do not watch a memory and instead simply switch equipment after opening the map with the L menu

	It's also possible to get fuse storage by pressing and releasing L & B at the same time, then immediately following up with ZL/Y to get fuse storage on the desired equipment. This is not possible to perform on switch 2 edition, as the doubled framerate cap causes the fuse target to cull too quickly. However, it is still possible to perform fuse storage on switch 2 edition without memories using the turnaround setup. More info can be found in the fuse storage page.

=== "Cull FE" ###
	---
	versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
	obsolete: false
	---
	Uses culling to interrupt a fuse, causing FE. Some methods and setup variations recursively require fuse entanglement in order to perform, but have no restrictions on the types of objects that can be entangled.

	#### SDC Cull FE ?
	---
	versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
	obsolete: false
	---
	Performing stick desync clip and then culling the stick during a fuse causes FE.

	_ultrababouin, suusi, Ryan? - 21 September 2023_

	1. Cold fuse (or fuse entangle) a steering stick to a weapon/shield
	2. Move the steering stick inside a culling area and perform stick desync clip, quickly dismounting before Link clips through the ground
		- It is also recommended (though not required) to attach another object to the steering stick after dismounting it to make cull behavior for future steps consistent
	3. Mount and unmount a different steering stick/Mineru to unlock rune wheel
	4. Exit the culling area with the fuse rune active
	5. Fuse to the desired equipment just as Link culls
	6. Watch a memory to uncull Link and quickly mount another steering stick to stop the culling
	!!! note "Note"
		An alternative approach to step 4, which is applicable only if the desynced stick is entangled, is to cull Link by dropping the item that the stick is entangled to outside of the culling area.
	!!! tip "Tip"
		Any other method of culling the desynced stick works in place of area culling, i.e. fusing the desynced stick to a shield and feeding the shield with a bomb glued to it to a like like.

	#### Like-Like Cull FE ?
	---
	versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
	obsolete: true
	---
	Uses like-like stick culling as the cull mechanism for FE. It is obsolete due to the difficulty of the setup's execution and risk of softlocking.

	_Ock, SteFen45 - 10 October 2023_

	1. Find a like like inside of a culling area and perform Like-Like Stick Smuggling
	2. Leave the culling area and wait for Link to cull
	3. Switch to the recall rune while culled
	4. Watch and skip through a memory to uncull Link, then unpause
	5. While in recall, switch to the fuse rune and fuse to the target object 18 frames later
	!!! warning "Warning"
		Fusing a frame late causes the game to become softlocked. It is recommended to repeat this step a few times without fusing to familiarize yourself with the timing.
	6. Warp or skip through another memory and immediately mount another stick to stop the culling

	#### YeeFE ?
	---
	versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3"]
	obsolete: false
	---
	Culling a desynced stick fused to Mineru allows for FE. The fuse timing can be made slightly easier with recall buffering, and can also be done with Mineru Culling to avoid needing a steering stick.

	_Yee, mulberry - 20 February 2024_

	1. Cold fuse (or fuse entangle) a steering stick and perform Stick Desync Clip with it
	2. Fuse the desynced stick to Mineru
	3. Prompt Mineru to cull and fuse to the desired equipment just before Link culls
	
	
### Ohter Setup / Variation
1. Step one
2. Step two

## Notes
### Remarks
Remarks

### Additions
Additions

### Extensions
Extensions

## Resources
- [Link Title](Link URL)

## Related
- [Searchbar Query](search:Searchbar Query)
