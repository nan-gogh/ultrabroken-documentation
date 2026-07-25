---
title: "Cull Detachment"
draft: true
label: "CD"
versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
credits: ["mulberry"]
date: "2026-07-10"
description: "Destroying an object glued to a physically-culled SDC instantly unculls Link, even without unpausing."
aliases: [""]
tags: ["Culling"]
---

# Cull Detachment

## Summary

An object culled by a culling area is instantly unculled when something glued to it is unglued. Unequipping the glued object (or an FE parent thereof) allows this uncull to happen portably, and within the pause menu. This is most usefully applied to an SDC stick, in order to uncull Link during certain setups.

In order to not prevent the SDC from culling, the glued object (the "Trigger") must use some kind of workaround. The instructions below describe each known workaround, categorized by portability.

_Discovered by mulberry - July 10th, 2026_

## Instructions

=== "Warpable" ###

	- These methods can be taken through warps and other loading screens with the proper preparations. Some even work within other maps (like shrines or the prologue).
	- At a minimum, the parents of the Trigger and the SDC must be zuggled, as the glue between them will break upon going through a loading screen with either or both equipped.

	=== "Cull Storage" ####

		- Using a cull-stored Trigger allows the mechanism to continue working even within other maps.

		=== "CS + FE" #####

			By storing the cull _during_ fuse entanglement, the Trigger can be slotted. This allows for greater flexibility, as a slotted Trigger can never lose its stored cull from dropping the parent.

			1. Place the Trigger in a small culling area and check that it culls upon exiting the margin
			2. Recall the Trigger and stand outside the margin
			3. Fuse entangle the Trigger (usually to a zuggled parent via Overload FE or Null FE)
			4. (optional) check for cull storage by confirming that something like an Apple can still cull when glued to the Trigger

		=== "FE -> CS" #####

			Storing the cull after fuse entanglement requires that the trigger can still cull, which precludes slotting it. However, it is simpler.

			1. Fuse entangle the Trigger
			2. Place the Trigger in a small culling area and exit the margin
			3. Recall the Trigger, then drop its parent and pick it up again, and finally end recall
			4. (optional) check for cull storage by confirming that something like an Apple can still cull when glued to the Trigger

	=== "Cull Lock" ####

		- Cull-locking the Trigger allows the mechanism to keep working within other maps.
		- In contrast to Cull Storage, Cull Locking is trickier and more restrictive. However, it can hold the mechanism in place without the need of a platform.

		=== "Recall View Cull Lock" #####

		Can be inconsistent, but works with "Gen 1" DI/VD parents (allowing for easy zuggle).

		1. Store a cull on the SDC; this will allow the Trigger to cull despite being glued to something that can't
		2. Drop the Trigger's parent and open Recall while the Trigger culls
		3. Enter and quickly exit the culling margin, without entering the Trigger's update range
		4. Check if the Trigger was pculled, and try again if not

		=== "Faildrop Cull Lock"

		Very consistent, but only works with normal parents.

		1. Store a cull on the SDC; this will allow the Trigger to cull despite being glued to something that can't
		2. Drop the Trigger's parent and highlight the Trigger/SDC with Ultrahand
		3. Position Link outside the margin, where closing UH view will allow for immediate pickup of the Trigger's parent
		4. Close UH, pick up the parent, and pause before the Trigger culls. One way this can be done is to buffer the ability wheel and select the Map Rune
		5. Faildrop-swap-unequip the parent, so that the Trigger is intangibly culled and the parent is mid-faildrop while the Trigger finishes physically culling

	=== "Late Pickup" ####

		- Probably the simplest method: Just pick up the Trigger's parent _after_ dropping the SDC's parent.
		- Depending on distance and other factors, may sometimes need a cutscene to update the SDC and induce the cull. Ascend (canceled) is well-regarded for this.

	=== "Overload Pickup" ####

		- overload pickup the parent of the Trigger while inducing the cull with ascend or whatever. Apparently I don't get this one or the direct pickup one, so needs testing.

=== "Portable" ###

	- These methods can be taken arbitrarily far from the culling area in use, but will not persist through a loading screen.

	=== "Overload Drop" ####

		- overload drop something to act as the Trigger. (don't remember whether I tested this one outside of physics range, so needs testing)

	=== "Auto FE" ####

		- auto fe. (same)

	=== "Mineru FE" ####

		- placeholder (glue direction is important. the SDC needs to be cull-stored. And Mineru _must_ be culled for an instant menu uncull.)

=== "Local" ###

	- These methods will break upon traveling too far from the culling area.

	=== "Reference FE" ###

		- need to test whether this is even a good idea
