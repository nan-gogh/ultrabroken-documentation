---
title: "Version Differences"
uid: "1IR"
label: "VER"
---

# Version Differences

Tears of the Kingdom has had several updates since its initial release, and these strongly affect using glitches in practice. Most glitches do exist in all versions, but not all game versions can use all setups. There are also some differences to note between the Switch 1 and Switch 2 editions of the game.

# General Adaptations

Many version- and context-specific setup variations are oriented around different ways to zuggle and fuse entangle:

## Zuggling
- **Drop Delay**: dropping other equipment straight out of the inventory ahead of something equipped will make the latter drop that number of frames later, making timing windows more lenient.
- **Map Rune**: Opening the map from the ability wheel will run the game for one frame before opening the Purah Pad, and you can open equipment quick menus before that frame. This frame completes the swap equip that makes Map Zuggle possible, and provides the precise timing needed for [invizuggling with a portacull](uid:MP9).
- **Culling**: Pausing while Link is culled will bypass the d-pad lock the game usually applies when you pause with active smuggles. The subsequent problems of culled smuggles and desync can be fixed with Cull Detachment and Swap Resync respestively.
- **Despawn Interrupt**: DI equiment is almost entirely exempt from d-pad lock, and never culls when smuggled, so it can be zuggled with many methods, including those that otherwise stopped working on newer versions.

## Fuse Entanglement
- **Culling**: Culling the fuse target enables Fuse Storage on all versions; culling Link with predicable timing ([e.g. Mineru](uid:PM1)) enables fuse entanglement.
- **Overload**: Zuggle Overload enables timing-free animated Cold Fuse, which will fuse entangle to all unculled zuggles. Pair this with DI and you have completely timing- and d-pad lock-free FE.

# Version History

This section lists all versions of the game, as well as some of the most important changes for glitchcraft purposes.

## 1.0

The earliest-released version of the game. For the general public, this is only available if you buy the Switch 1 edition on a game card (code `HAC-P-AXN7A`) and never install any updates. It is not possible to play this, or any other 2023 version, on a Switch 2.

1.0 is by far the most broken version of the game, with a lot of glitches easy to perform before you've even left GSI. It's also the version with the fastest available speedrun times, especially in shorter categories. It does, however, come with some important differences unique to this version:

- Zuggle Overload is achieved in fewer zuggles (the canonical minimum is 9 instead of 13). Additionally, any use of Earthwake or Sidon's water bubble will permanently attach them to Link until you close the game.
- Hyrule Castle is full of culling areas that are all gone in every other version.
- Swap–drop (equipping something in the pause screen, then dropping that item before unpausing) works differently, as 1.0 will spawn an actor for that equipment without you needing to unpause first.
- Weapon State Transfer requires the donor equipment to be a zuggle drop.

!!!info
	There are many other glitch-specific differences in 1.0 not listed here. Check that glitch's page for more info.

## 1.1.0

This is the day one patch, which updates a lot of game fundamentals. Some glitches are patched, although the majority of them are still there, and work the same way.

Glitches removed in this version:

- Swap–drop tech
- Memory Interrupt (original portable setup)
- Zonai Storage
- Infinite Horse Stamina

Some glitches remain, but their behaviour is notably different:

- Autobuild ghosts hold a position further away from Link, so Autobuild Cancel is more potent.
- [Despawn Interrupted](uid:JEV) equipment fully unequips and smuggles when fail-dropped.

## 1.1.1

This version fixes a softlock that can theoretically happen in the main GSI quest _The Closed Door_. There are no other differences, so we frequently consider these two versions the same.

## 1.1.2

This is the killjoy version that patches a whole raft of glitches. Some of the most important changes are:

- Introduces **d-pad lock**, making map zuggling and Drop SLD impossible on most equipment. You can still use the ability wheel to bypass this for shields and bows, so [Drop Delay Zuggle](search:Drop Delay Zuggle) is one of the best methods for zuggling unprepared equiment on this version. Throw SLD still works.
- Midair Sort Duping, Autobuild Cancel, and FABS are all patched.
	- Any FABS food stacks created in earlier versions are not modified or deleted.

## 1.2.0

This version made a fundamental change to how equipment behaves mid-drop, making many older zuggle methods apparently impossible by turning them into invizuggles. However, this new culling source is also very exploitable, allowing for crucial techniques like [portable culling](search:Portable Culling).

- L-Cancel Fuse Entanglement is patched.
- The ability wheel no longer bypasses d-pad lock, preventing Drop Delay Zuggling.
- Smuggles now cull if something else if equipped. Although this was likely done to prevent Zuggling and Fuse Entanglement, it now allows Portable Culling, and makes Invizuggling much easier.
- Any warm-dropped equipment now forcibly unculls itself and its children.
- Notably, fail drops _don't_ do this yet, allowing for [Quick Smuggling](search:Quick Smuggling).

## 1.2.1

This was the last version released in 2023, and remained the latest version until the launch of the Switch 2.

- Quick Smuggling is patched (fail drops also force-uncull).
- Like Like Fuse Storage is patched. (Like Likes' general equipment culling behaviours are otherwise the same.)

## 1.3.0

The first version released in over a year. This version is best known as what ships on a Switch 2 Edition game card, as well as what pre-release public demos of the Switch 2 Edition ran.

This is the minimum version you're allowed to run on a Switch 2 console. It's not known how this version differs from 1.2.1 on the Switch 1 edition.

- Game performance is improved, making lag-based glitches such as [Hydro Clipping](search:Hydro Clipping) harder to perform.

## 1.4.0

- Released alongside the Switch 2 public launch. No known differences from 1.3.0 on S2; on S1, game performance is improved, and lag-based glitches are much harder to perform.

## 1.4.1

- Patches a GSI softlock with one of the Steward Constructs that gives you the Battery. No other known differences from 1.4.0.

## 1.4.2

- Hacked autobuilds no longer work (any object in the blueprint that doesn't contain an Ultrahand attachment point is deleted). This prevents using a Ganondorf blueprint to duplicate essences on fully completed files.

## 1.4.3

- All glitches related to the 'Link QR' (an autobuild blueprint containing a _Player_ entity, which triggered when merely hovered over) are patched.

# Switch 2

The Switch 2 Edition of the game contains some notable differences for glitchcraft:

- The higher frame rate makes timing-based glitches and pause buffers much harder to execute.
- Mineru turns into an orb and culls faster, giving Mineru cull-based glitches a different timing overall.
- All glitches that persist through returning to the title screen also persist through switching between File 1 / File 2.

Aside from improved performance, nothing changes when running the Switch 1 edition of the game on Switch 2 hardware.

## Temporary downgrade

If your copy of Tears of the Kingdom is a Switch 1 edition physical game card, and you bought the Switch 2 edition upgrade as a one-time purchase from the eShop, you can eject the virtual game card for the upgrade and temporarily revert to the Switch 1 edition. You'll be back at 30fps, with all of your File 1 progress preserved (File 2 is inaccessible, but will _not_ be deleted or corrupted in any way). You can then re-insert the virtual game card to return to the Switch 2 edition of the game, with your updated save data intact.

Note that although this downgrades the game _edition_, it doesn't change the game _version_; it's still not possible to downgrade TotK on unmodded hardware without a factory reset.
