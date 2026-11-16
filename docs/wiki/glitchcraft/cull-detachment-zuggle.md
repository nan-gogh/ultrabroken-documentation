---
title: "Cull Detachment Zuggle"
uid: "R14"
draft: true
label: "CDTZ"
versions: ["1.0.0", "1.1.0", "1.1.1", "1.1.2", "1.2.0", "1.2.1", "1.3.0/1.4.0", "1.4.1", "1.4.2", "1.4.3", "Switch 2"]
credits: ["mulberry"]
date: "2026-07-11"
description: "Cull Detachment allows precise control of unculling Link in the menu, enabling load zuggle methods with lenient timing."
aliases: []
tags: ["culling", "zuggling"]
---

# Cull Detachment Zuggle

## Summary

By giving us a way to uncull Link at a precise time in the pause screen, Cull Detachment and Swap Resync allow easy load zuggling of any equipment. This is particularly useful for zuggling Decayed and regular Master Swords, as well as zuggling weapons on version `1.1.2`.

The zuggle can also degrade into an SLD on some pause buffer timings. This extends the success range of the timing window by one or two frames. In `1.2.0` and up, with the right kind of Cull Detachment setup, the SLD timing window extends forever, guaranteeing success.

_Discovered by mulberry - July 11th, 2026_

## Version differences

On version `1.2.0` and up, you need an SDC **parent** to also be in the culling area, in order to stop every successful attempt turning into an invizuggle. Leaving the SDC in there alongside it is required for zuggling out of the Prologue or minigames, and removes the limit on the timing window for SLD. Using portacull equipment is an ideal way of doing this.

The exact steps will vary depending on the setup used, and SLD may limit which save files you can reload into, but the gist of every variant is this:

- Equip the item to zuggle, and the FE parent of the Trigger item
- Cull Link using the glued SDC
- If aiming to zuggle a Decayed or regular Master Sword, swap to some other (droppable) weapon, unpause, pause again
- Drop unrelated equipment to create buffer timing
	- For most players, 7 will be enough to create a lenient timing window
	- Players on the Switch 2 Edition should consider doubling that, since equipment drops twice as fast
	- You can drop up to 18 buffers without hitting the drop limit of 21, which should give you plenty of time
	- If your cull detachment setup doesn't depend on any unprotected dropped equipment, you don't even need to stop there
- Drop the zuggle target (or desynced weapon) and swap to something else of the same kind
- Pause buffer
- Unequip Trigger parent to uncull the SDC and Link
- Re-equip the Trigger parent to resync
- Drop the swapped-to equipment
- Reload another file without unpausing
- The target equipment will either be on Link's back/hand (load zuggle), or will have dropped in the new file at the same co-ordinates (SLD)

## Zuggle or SLD?

Getting the zuggle is ideal, but the SLD transfer method exists as a backup approach. Which transfer method you end up using will vary depending on a number of factors:

- Your game version
- If you're zuggling a Decayed or regular Master Sword
- How you time your final pause, relative to the target's **zuggle drop frame**

The zuggle drop frame is the frame where the game has decided that the drop-queued target is allowed to drop off Link, but before the drop actually starts. This frame is usually the one that leads to successful SLD, but results can vary:

<table>
	<thead>
		<caption>Equipment transfer result</caption>
	</thead>
	<tr>
		<th rowspan="2">Game version, Target equipment</th>
		<th colspan="4">Timing of final <kbd>+</kbd> press vs zuggle drop frame</th>
	</tr>
	<tr>
		<th>Before</th>
		<th>Exactly on</th>
		<th>1 frame after</th>
		<th>2+ frames after
	</tr>
	<tbody>
		<tr><th><code>1.0.0</code> (all equipment)</th>
			<td rowspan="6">✅ Load Zuggle</td>
			<td colspan="2">⚠️ SLD<br /><small></small></td>
			<td>❌ Deleted</td>
		</tr>
		<tr><th><code>1.1.0</code>–<code>1.1.2</code> (Master Sword)</th>
			<td colspan="3">❌ Deleted</td>
		</tr>
		<tr><th><code>1.1.0</code>–<code>1.1.1</code> (other)</th>
			<td colspan="2">⚠️ SLD</td>
			<td>❌ Deleted</td>
		</tr>
		<tr><th><code>1.1.2</code> (other)</th>
			<td>⚠️ SLD</td>
			<td colspan="2">❌ Deleted</td>
		</tr>
		<tr><th><code>1.2.0</code>+ (Master Sword)</th>
			<td colspan="3">❌ Deleted</td>
		</tr>
		<tr><th><code>1.2.0</code>+ (other)</th>
			<td colspan="3">⚠️ SLD (assuming the SDC is also in the culling area)</td>
		</tr>
	</tbody>
</table>

The 'Master Sword' equipment subcategory applies if you are zuggling a regular or Decayed Master Sword. The additional steps needed to successfully unzuggle a Master Sword are documented in Master Sword Liberation.

### Post-SLD Retrieval

If you transfer with SLD, you will have to retrieve it before going through another loading screen, so you will need to load directly into a file where the target's drop point:

- is inbounds in the new map
- is close by, if in the overworld

Load Zuggle is guaranteed to transfer no matter what you select, so any file will work. You can even return to the title screen (e.g. to switch between files on Switch 2 Edition) and still zuggle successfully.

