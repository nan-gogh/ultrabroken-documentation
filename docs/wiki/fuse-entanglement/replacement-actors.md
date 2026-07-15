---
title: "Replacement Actors"
uid: "G46"
draft: true
description: "Some fusible objects replace themselves with another object when fused, which can cause the game to crash if Fuse Entanglement is attempted."
aliases: ["Replacements"]
tags: ["entanglement", "crash"]
---

# Replacement Actors

## Summary

- Some fusible objects ("actors") replace themselves with another actor (sometimes of the same type) when fused. Without special considerations, attempting to Fuse Entangle these actors will _crash the game_.
- This page contains a set of tables of such "Replacement Actors", divided into categories (with the necessary overlap).
- Each tables lists both the actor ID and a plain translation of which object this ID corresponds to, along with the equivalents for what the actor is replaced with.
- If the actor replaces with itself, this is noted.
- Additionally, some replacement actors, once fused, return something else when defused via Pelison. When this is the case, it will be denoted in the tables below.

## Tables ?

### Environmental & Enemy Objects ?

Natural inorganic objects, along with objects which are spawned by/are part of enemies.

| Index | Base Actor Name<br/>`Base Actor ID` | Replacement Actor Name<br/>`Replacement Actor ID` | RA is self? | Defuse Replacement Name (If Applicable)<br/>`Defuse Replacement ID` | Info |
| --- | --- | --- | --- | --- | --- |
| 1 | Small Icicle<br/>`AsbObj_Icicle_A_01` | Small Icicle<br/>`AsbObj_Icicle_A_01` | ✔️ | ❌ |  |
| 2 | Large Icicle<br/>`AsbObj_Icicle_A_02` | Small Icicle (If scale <0.6 when fused)<br/>`AsbObj_Icicle_A_01`<br/>Large Icicle (If scale ≥0.6 when fused)<br/>`AsbObj_Icicle_A_02` | ❌<br/><br/>✔️ | ❌ |  |
| 3 | Snowball<br/>`BrokenSnowBall` | Small Fused Snowball (If scale <1.25 when fused)<br/>`BrokenSnowBallForAttachmentSmall`<br/>Large Fused Snowball (If scale ≥1.25 when fused)<br/>`BrokenSnowballForAttachmentLarge` | ❌<br/><br/>❌ | Snowball<br/>`BrokenSnowBall` |  |
| 4 | Small Fused Snowball<br/>`BrokenSnowBallForAttachmentSmall` | Small Fused Snowball (If scale <1.25 when fused)<br/>`BrokenSnowBallForAttachmentSmall`<br/>Large Fused Snowball (If scale ≥1.25 when fused)<br/>`BrokenSnowballForAttachmentLarge` | ✔️<br/><br/>❌ | Snowball<br/>`BrokenSnowBall` | Only accessible with DI |
| 5 | Large Fused Snowball<br/>`BrokenSnowBallForAttachmentLarge` | Small Fused Snowball<br/>`BrokenSnowBallForAttachmentSmall`<br/>(If scale <1.25 when fused)<br/>Large Fused Snowball<br/>`BrokenSnowballForAttachmentLarge`<br/>(If scale ≥1.25 when fused) | ❌<br/>✔️ | Snowball<br/>`BrokenSnowBall` | Only accessible with DI |
| 6 | Gleeok Snowball<br/>`BrokenSnowBallForDrake` | Small Fused Snowball (If scale <1.25 when fused)<br/>`BrokenSnowBallForAttachmentSmall`<br/>Large Fused Snowball (If scale ≥1.25 when fused)<br/>`BrokenSnowballForAttachmentLarge` | ❌<br/>❌ | Snowball<br/>`BrokenSnowBall` |  |
| 7 | Gleeok Icicle<br/>`Drake_Icicle` | Fused Gleeok Icicle<br/>`Drake_IcicleForAttachment` | ❌ | ❌ | ? |
| 8 | Small Gloom Rock<br/>`DungeonBoss_Goron_Rock_Weapon` | Small Gloom Rock<br/>`DungeonBoss_Goron_Rock_Weapon` | ✔️ | ❌ |  |
| 9 | Large Gloom Rock<br/>`DungeonBoss_Goron_Rock_Weapon_Large` | Large Gloom Rock<br/>`DungeonBoss_Goron_Rock_Weapon_Large` | ✔️ | ❌ |  |
| 10 | Ice Shard<br/>`IceWall_Piece` | Ice Shard<br/>`IceWall_Piece` | ✔️ | ❌ |  |
| 11 | Star Fragment (Skydiving)<br/>`Item_CatchInAir` | Star Fragment<br/>`Item_Ore_J` | ❌ | ❌ |  |
| 12 | Red Chuchu Jelly<br/>`Item_Enemy_15` | Red Chuchu Jelly<br/>`Item_Enemy_15` | ✔️ | ❌ |  |
| 13 | Yellow Chuchu Jelly<br/>`Item_Enemy_16` | Yellow Chuchu Jelly<br/>`Item_Enemy_16` | ✔️ | ❌ |  |
| 14 | White Chuchu Jelly<br/>`Item_Enemy_17` | White Chuchu Jelly<br/>`Item_Enemy_17` | ✔️ | ❌ |  |
| 15 | Rock Like Projectile<br/>`LikeLikeRock` | Fused Rock Like Projectile<br/>`LikeLikeRock_ForAttachment` | ❌ | ❌ |  |
| 16 | Evermean Log (Depths)<br/>`MinusObj_TreeGeneralleaf_A_01_Trent_Trunk` | Fused Evermean Log (Depths)<br/>`MinusObj_TreeGeneralleaf_A_01_Treant_ForAttachment` | ❌ | Evermean Log (Depths)<br/>`MinusObj_TreeGeneralleaf_A_01_Trent_Trunk` | _sic_ |
| 17 | 3x3m Ice Board<br/>`Obj_FreezeBoard_A_01` | 3x3m Ice Board<br/>`Obj_FreezeBoard_A_01` | ✔️ | ❌ | ? |
| 18 | 3x6m Ice Board<br/>`Obj_FreezeBoard_A_02` | 3x6m Ice Board<br/>`Obj_FreezeBoard_A_02` | ✔️ | ❌ | ? |
| 19 | Evermean Log (Oak)<br/>`Obj_TreeBroadleaf_A_L_Treant_Trunk` | Fused Evermean Log (Oak)<br/>`Obj_TreeWood_A_L_Treant_ForAttachment` | ❌ | Evermean Log (Oak)<Br/>`Obj_TreeBroadleaf_A_L_Treant_Trunk` |  |
| 20 | Flux Construct I Block<br/>`Zonau_BlockMaster_Block` | Fused Flux Construct I Block<br/>`Zonau_BlockMaster_Block_ForAttachment` | ❌ | ❌ |  |
| 21 | Flux Construct II Block<br/>`Zonau_BlockMaster_Block_Middle` | Fused Flux Construct II Block<br/>`Zonau_BlockMaster_Block_Middle_ForAttachment` | ❌ | ❌ |  |
| 22 | Flux Construct III Block<br/>`Zonau_BlockMaster_Block_Senior` | Fused Flux Construct III Block<br/>`Zonau_BlockMaster_Block_Senior_ForAttachment` | ❌ | ❌ |  |

### Manufactured Objects ?

Objects which are not natural, but are also not from an enemy.

| Index | Base Actor Name<br/>`Base Actor ID` | Replacement Actor Name<br/>`Replacement Actor ID` | RA is self? | Defuse Replacement Name (If Applicable)<br/>`Defuse Replacement ID` | Info |
| --- | --- | --- | --- | --- | --- |
| 1 | Tattered Sail<br/>`AsbObj_WoodSail_A_01` | Fused Tattered Sail<br/>`AsbObj_WoodSail_A_01_ForAttachment` | ❌ | Tattered Sail<br/>`AsbObj_WoodSail_A_01` | Replacement does not pivot |
| 2 | Pristine Sail<br/>`AsbObj_WoodSail_A_02` | Fused Pristine Sail<br/>`AsbObj_WoodSail_A_02_ForAttachment` | ❌ | Pristine Sail<br/>`AsbObj_WoodSail_A_02` | Replacement Does not pivot |
| 3 | 8x4m Shrine Metal Plate<br/>`DgnObj_BoardIron_E_Cart_02`<br/>Has extra snap points | 8x4m Shrine Metal Plate<br/>`DgnObj_BoardIron_E` | ❌ | ❌ |  Only in Marakuguc - _Wheeled Wonders_ |
| 4 | Small Water Globule<br/>`DgnObj_FloatingWater_A_01` | Fused Small Water Globule<br/>`DgnObj_FloatingWater_A_01_ForAttachment` | ❌ | ❌ | Replacement has fake water |
| 5 | Large Water Globule<br/>`DgnObj_FloatingWater_A_02` | Fused Large Water Globule<br/>`DgnObj_FloatingWater_A_02_ForAttachment` | ❌ | ❌ | Replacement has fake water |
| 6 | Shrine Ice Block<br/>`DgnObj_IceBlock` | Shrine Ice Block<br/>`DgnObj_IceBlock` | ✔️ | ❌ |  |
| 7 | 12x12m Shrine Stone Board<br/>`DgnObj_Small_BoardStone_A_03` | 8x8m Shrine Stone Board<br/>`Dgn_Obj_BoardStone_A_04` | ❌ | ❌ | Only in Kimayat - _Proving Grounds: Smash_ |
| 8 | 2x2x2m Shrine Iron Box (Heavy)<br/>`DgnObj_Small_BoxIron_B_06` | 2x2x2m Shrine Iron Box (Normal)<br/>`Obj_BoxIron_B_2x2x2_01` | ❌ | ❌ | Only in Wao-os - _Lever Power_ |
| 9 | Stone Pole (?)<br/>`DgnObj_Small_StonePole_A_02` | Stone Pole (Normal)<br/>`DgnObj_Small_StonePole_A_01` | ❌ | ❌ | Only in Mayachin - _A Fixed Device_ |
| 10 | Stone Pole (Heavy)<br/>`DgnObj_Small_StonePole_A_03` | Stone Pole (Normal)<br/>`DgnObj_Small_StonePole_A_01` | ❌ | ❌ | Only in Riogok - _Force Transfer_ |
| 11 | Flame Ball (pre-lit)<br/>`DgnObj_StoneBall_Fire` | Flame Ball (not pre-lit)<br/>`DgnObj_StoneBall_NoFire` | ❌ | ❌ | Only in Lightning Temple |
| 12 | Long Shrine Log<br/>`DgnObj_WoodPole_A` | Short Shrine Log<br/>`DgnObj_WoodPole_A_02` | ❌ | ❌ |
| 13 | Small Iron Ball (Light)<br/>`IronBall_Light` | Small Iron Ball (Normal)<br/>`DgnObj_Small_IronBall_02` | ❌ | ❌ | Only in Wao-os - _Lever Power_  |
| 14 | Wooden Box (Gerudo Canyon Stable)<br/>`Kibako_Contain_01_NoRespawn` | Wooden Box (Normal)<br/>`Kibako_Contain_01` | ❌ | ❌ |  |
| 15 | Balloon (Capsule)<br/>`SpObj_BalloonEnvelope_Capsule_A_01` | Balloon<br/>`SpObj_BalloonEnvelope_A_01` | ❌ | ❌ |  |
| 16 | Beam Emitter (Capsule)<br/>`SpObj_Beamos_Capsule_A_01` | Beam Emitter<br/>`SpObj_Beamos_A_01` | ❌ | ❌ |  |
| 17 | Cannon (Capsule)<br/>`SpObj_Cannon_Capsule_A_01` | Cannon<br/>`SpObj_Cannon_A_01` | ❌ | ❌ |  |
| 18 | Cart (Capsule)<br/>`SpObj_Cart_Capsule_A_01` | Cart<br/>`SpObj_Cart_A_01` | ❌ | ❌ |  |
| 19 | Homing Cart (Capsule)<br/>`SpObj_Chaser_Capsule_A_01` | Homing Cart<br/>`SpObj_Chaser_A_01` | ❌ | ❌ |  |
| 20 | Steering Stick (Capsule)<br/>`SpObj_ControlStick_Capsule_A_01` | Steering Stick<br/>`SpObj_ControlStick_A_01` | ❌ | ❌ |  |
| 21 | Portable Pot (Capsule)<br/>`SpObj_CookSet_Capsule_A_01` | Portable Pot<br/>`SpObj_CookSet_A_01` | ❌ | ❌ |  |
| 22 | Shock Emitter (Capsule)<br/>`SpObj_ElectricBoxGenerator_Capsule_A_01` | Shock Emitter<br/>`SpObj_ElectricBoxGenerator` | ❌ | ❌ |  |
| 23 | Battery (Capsule)<br/>`SpObj_EnergyBank_Capsule_A_01` | Battery<br/>`SpObj_EnergyBank_A_01` | ❌ | ❌ |  |
| 24 | Big Battery (Capsule)<br/>`SpObj_EnergyBank_Capsule_A_02` | Big Battery<br/>`SpObj_EnergyBank_A_02` | ❌ | ❌ |  |
| 25 | Small Wheel (Capsule)<br/>`SpObj_FastWheel_Capsule_A_01` | Small Wheel<br/>`SpObj_FastWheel_A_01` | ❌ | ❌ |  |
| 26 | Big Wheel (Capsule)<br/>`SpObj_FastWheel_Capsule_A_02` | Big Wheel<br/>`SpObj_SwitchWheel_A_01` | ❌ | ❌ | _sic_ |
| 27 | Flame Emitter (Capsule)<br/>`SpObj_FlameThrower_Capsule_A_01` | Flame Emitter<br/>`SpObj_FlameThrower_A_01` | ❌ | ❌ |  |
| 28 | Light (Capsule)<br/>`SpObj_FlashLight_Capsule_A_01` | Light<br/>`SpObj_FlashLight_A_01` | ❌ | ❌ |  |
| 29 | Hover Stone (Capsule<br/>`SpObj_FloatingStone_Capsule_A_01` | Hover Stone<br/>`SpObj_FloatingStone_A_01` | ❌ | ❌ |  |
| 30 | Construct Head (Capsule)<br/>`SpObj_GolemHead_Capsule_A_01` | Construct Head<br/>`SpObj_GolemHead_A_01` | ❌ | ❌ |  |
| 31 | Hydrant (Capsule)<br/>`SpObj_LiftableWaterPump_Capsule_A_01` | Hydrant<br/>`SpObj_WaterPump_A_01` | ❌ | ❌ |  |
| 32 | Wing (Capsule)<br/>`SpObj_LiftGeneratorWing_Capsule_A_01` | Wing<br/>`SpObj_LiftGeneratorWing_A_01` | ❌ | ❌ |  |
| 33 | Mirror (Capsule)<br/>`SpObj_LightMirror_Capsule_A_01` | Mirror<br/>`SpObj_LightMirror_A_01` | ❌ | ❌ |  |
| 34 | Stake (Capsule)<br/>`SpObj_Pile_Capsule_A_01` | Stake<br/>`SpObj_Pile_A_01` | ❌ | ❌ |  |
| 35 | Rocket (Capsule)<br/>`SpObj_Rocket_Capsule_A_01` | Rocket<br/>`SpObj_Rocket_A_01` | ❌ | ❌ |  |
| 36 | Sled (Capsule)<br/>`SpObj_SlipBoard_Capsule_A_01` | Sled<br/>`SpObj_SlipBoard_A_01` | ❌ | ❌ |  |
| 37 | Frost Emitter (Capsule)<br/>`SpObj_SnowMachine_Capsule_A_01` | Frost Emitter<br/>`SpObj_SnowMachine_A_01` | ❌ | ❌ |  |
| 38 | Spring (Capsule)<br/>`SpObj_SpringPiston_Capsule_A_01` | Spring<br/>`SpObj_SpringPiston_A_01` | ❌ | ❌ |  |
| 39 | Stabilizer<br/>`SpObj_TiltingDoll_Capsule_A_01` | Stabilizer<br/>`SpObj_TiltingDoll_A_01` | ❌ | ❌ |  |
| 40 | Time Bomb (Capsule)<br/>`SpObj_TimerBomb_Capsule_A_01` | Time Bomb<br/>`SpObj_TimerBomb_A_01` | ❌ | ❌ |  |
| 41 | Fan (Capsule)<br/>`SpObj_WindGenerator_Capsule_A_01` | Fan<br/>`SpObj_WindGenerator_A_01` | ❌ | ❌ |  |
| 42 | Tenoko Island Boat<br/>`TwnObj_Village_Fishing_Boat_A_02` | Fused Tenoko Island Boat<br/>`TwnObj_Village_Fishing_Boat_A_02_ForAttachment` | ❌ | Tenoko Island Boat<br/>`TwnObj_Village_Fishing_Boat_A_02` |  |

### Plants (except logs) ?

Living plants, excluding logs. When taken out from the inventory, these are always their replacement and not the original (except for self-replacing items).

| Index | Base Actor Name<br/>`Base Actor ID` | Replacement Actor Name<br/>`Replacement Actor ID` | RA is self? | Info |
| --- | --- | --- | --- | --- |
| 1 | Bomb Flower<br/>`BombFruit` | Bomb Flower<br/>`BombFruit` | ✔️ |  |
| 2 | Muddle Bud (Planted)<br/>`ConfusionFruit_Static` | Muddle Bud<br/>`ConfusionFruit` | ❌ | ? |
| 3 | Shock Fruit<br/>`ElectricalFruit` | Shock Fruit<br/>`ElectricalFruit` | ✔️ |  |
| 4 | Fire Fruit<br/>`FireFruit` | Fire Fruit<br/>`FireFruit` | ✔️ |  |
| 5 | Ice Fruit<br/>`IceFruit` | Ice Fruit<br/>`IceFruit` | ✔️ |  |
| 6 | Rushroom (Planted)<br/>`Item_Mushroom_D` | Rushroom<br/>`Item_MushroomGet_D` | ❌ | ? |
| 7 | Brightcap (Planted)<br/>`Item_Mushroom_K` | Brightcap<br/>`Item_MushroomGet_K` | ❌ | ? |
| 8 | Hyrule Herb (Planted)<br/>`Item_Plant_A` | Hyrule Herb<br/>`Item_PlantGet_A` | ❌ | ? |
| 9 | Hearty Radish (Planted)<br/>`Item_Plant_B` | Hearty Radish<br/>`Item_PlantGet_B` | ❌ | ? |
| 10 | Hearty Radish (Garden Tutorial)<br/>`Item_Plant_B_TemporaryOwnedByNpc` | Hearty Radish<br/>`Item_PlantGet_B` | ❌ | ? |
| 11 | Big Hearty Radish (Planted)<br/>`Item_Plant_C` | Big Hearty Radish<br/>`Item_PlantGet_C` | ❌ | ? |
| 12 | Big Hearty Radish (Garden Tutorial)<br/>`Item_Plant_C_TemporaryOwnedByNpc` | Big Heary Radish<br/>`Item_PlantGet_C` | ❌ | ? |
| 13 | Cool Safflina (Planted)<br/>`Item_Plant_E` | Cool Safflina<br/>`Item_PlantGet_E` | ❌ | ? |
| 14 | Warm Safflina (Planted)<br/>`Item_Plant_F` | Warm Safflina<br/>`Item_PlantGet_F` | ❌ | ? |
| 15 | Mighty Thistle (Planted)<br/>`Item_Plant_G` | Mighty Thistle<br/>`Item_PlantGet_G` | ❌ | ? |
| 16 | Armoranth (Planted)<br/>`Item_Plant_H` | Armoranth<br/>`Item_PlantGet_H` | ❌ | ? |
| 17 | Blue Nightshade (Planted)<br/>`Item_Plant_I` | Blue Nightshade<br/>`Item_PlantGet_I` | ❌ | ? |
| 18 | Blue Nightshade (Oaki's)<br/>`Item_Plant_I_OwnedByNpc` | Blue Nightshade<br/>`Item_PlantGet_I` | ❌ | ? |
| 19 | Silent Princess (Planted)<br/>`Item_Plant_J` | Silent Princess<br/>`Item_PlantGet_J` | ❌ | ? |
| 20 | Silent Princess (Oaki's)<br/>`Item_Plant_J_OwnedByNpc` | Silent Princess<br/>`Item_PlantGet_J` | ❌ | ? |
| 21 | Electric Safflina (Planted)<br/>`Item_Plant_L` | Electric Safflina<br/>`Item_PlantGet_L` | ❌ | ? |
| 22 | Swift Carrot (Planted)<br/>`Item_Plant_M` | Swift Carrot<br/>`Item_PlantGet_M` | ❌ | ? |
| 23 | Swift Carrot (Kakariko Garden)<br/>`Item_Plant_M_OwnedByNpc` | Swift Carrot<br/>`Item_PlantGet_M` | ❌ | ? |
| 24 | Swift Carrot (Garden Tutorial)<br/>`Item_Plant_M_TemporaryOwnedByNpc` | Swift Carrot<br/>`Item_PlantGet_M` | ❌ | ? |
| 25 | Swift Violet (Planted)<br/>`Item_Plant_O` | Swift Violet<br/>`Item_PlantGet_O` | ❌ | ? |
| 26 | Endura Carrot (Planted)<br/>`Item_Plant_Q` | Endura Carrot<br/>`Item_PlantGet_Q` | ❌ | ? |
| 27 | Endura Carrot (Garden Tutorial)<br/>`Item_Plant_Q_TemporaryOwnedByNpc` | Endura Carrot<br/>`Item_PlantGet_Q` | ❌ | ? |
| 28 | Sundelion (Planted)<br/>`Item_Plant_R` | Sundelion<br/>`Item_PlantGet_R` | ❌ | ? |
| 29 | Sundelion (Mellie's)<br/>`Item_Plant_R_Kakariko_008` | Sundelion<br/>`Item_PlantGet_R` | ❌ | ? |
| 30 | Stambulb (Planted)<br/>`Item_Plant_S` | Stambulb<br/>`Item_PlantGet_S` | ❌ | ? |
| 31 | Puffshroom (Planted)<br/>`SmokeFuit_Static` | Puffshroom<br/>`SmokeFruit` | ❌ | _sic_ |
|  | ──────────────────────── | ───────────────── |  |  |

### Logs ?

Logs. Includes anything considered logs by the game.

| Index | Base Actor Name<br/>`Base Actor ID` | Replacement Actor Name<br/>`Replacement Actor ID` | Defuse Replacement Name (If Applicable)<br/>`Defuse Replacement ID` | Info |
| --- | --- | --- | --- | --- |
| 1 | Long Shrine Log<br/>`DgnObj_WoodPole_A` | Short Shrine Log<br/>`DgnObj_WoodPole_A_02` | ❌ |  |
| 2 | Evermean Log (Depths)<br/>`MinusObj_TreeGeneralleaf_A_01_Trent_Trunk` | Fused Evermean Log (Depths)<br/>`MinusObj_TreeGeneralleaf_A_01_Treant_ForAttachment` | Evermean Log (Depths)<br/>`MinusObj_TreeGeneralleaf_A_01_Trent_Trunk` | _sic_ |
| 3 | Short Depths Log (From Tree)<br/>`MinusObj_TreeGeneralleaf_A_01_Trunk` | Fused Depths Log<br/>`Obj_TreeGeneralleaf_C_01_ForAttachment` | Long Depths Log<br/>`MinusObj_TreeGeneralleaf_C_01_Trunk_Aligned` |  |
| 4 | Short Depths Log<br/>`MinusObj_TreeGeneralleaf_A_01_Trunk_Aligned` | Fused Depths Log<br/>`Obj_TreeGeneralleaf_C_01_ForAttachment` | Long Depths Log<br/>`MinusObj_TreeGeneralleaf_C_01_Trunk_Aligned` |  |
| 5 | Medium Depths Log (From Tree)<br/>`MinusObj_TreeGeneralleaf_B_01_Trunk` | Fused Depths Log<br/>`Obj_TreeGeneralleaf_C_01_ForAttachment` | Long Depths Log<br/>`MinusObj_TreeGeneralleaf_C_01_Trunk_Aligned` |  |
| 6 | Medium Depths Log<br/>`MinusObj_TreeGeneralleaf_B_01_Trunk_Aligned` | Fused Depths Log<br/>`Obj_TreeGeneralleaf_C_01_ForAttachment` | Long Depths Log<br/>`MinusObj_TreeGeneralleaf_C_01_Trunk_Aligned` |  |
| 7 | Long Depths Log (From Tree)<br/>`MinusObj_TreeGeneralleaf_C_01_Trunk` | Fused Depths Log<br/>`Obj_TreeGeneralleaf_C_01_ForAttachment` | Long Depths Log<br/>`MinusObj_TreeGeneralleaf_C_01_Trunk_Aligned` |  |
| 8 | Long Depths Log<br/>`MinusObj_TreeGeneralleaf_C_01_Trunk_Aligned` | Fused Depths Log<br/>`Obj_TreeGeneralleaf_C_01_ForAttachment` | Long Depths Log<br/>`MinusObj_TreeGeneralleaf_C_01_Trunk_Aligned` |  |
| 9 | Long Blue Depths Log (From Tree)<br/>`MinusObj_TreeGeneralleaf_D_01_Trunk` | Fused Blue Depths Log<br/>`Obj_TreeGeneralleaf_D_01_ForAttachment` | Long Blue Depths Log<br/>`MinusObj_TreeGeneralleaf_C_01_Trunk_Aligned` |  |
| 10 | Long Blue Depths Log<br/>`MinusObj_TreeGeneralleaf_D_01_Trunk_Aligned` | Fused Blue Depths Log<br/>`Obj_TreeGeneralleaf_C_01_ForAttachment` | Long Blue Depths Log<br/>`MinusObj_TreeGeneralleaf_C_01_Trunk_Aligned` |  |
| 11 | Large Apple Log (From Tree)<br/>`Obj_TreeApple_A_L_01_Trunk` | Medium Apple Log<br/>`Obj_TreeApple_A_M_01_Trunk` | ❌ |  |
| 12 | Large Apple Log<br/>`Obj_TreeApple_A_L_01_Trunk_Aligned` | Medium Apple Log<br/>`Obj_TreeApple_A_M_01_Trunk` | ❌ |  |
| 13 | Oak Log Stump<br/>`Obj_TreeBroadleafDead_B_L_01_Trunk` | Fused Oak Log<br/>`Obj_TreeWood_A_01_ForAttachment` | Oak Log<br/>`Obj_TreeBroadleaf_A_L_Trunk` |  |
| 14 | Evermean Log (Oak)<br/>`Obj_TreeBroadleaf_A_L_Treant_Trunk` | Fused Evermean Log (Oak)<br/>`Obj_TreeWood_A_L_Treant_ForAttachment` | Evermean Log (Oak)<Br/>`Obj_TreeBroadleaf_A_L_Treant_Trunk` |  |
| 15 | Oak Log (From Tree)<br/>`Obj_TreeBroadleaf_A_L_Trunk` | Fused Oak Log<br/>`Obj_TreeWood_A_01_ForAttachment` | Oak Log<br/>`Obj_TreeBroadleaf_A_L_Trunk` |  |
| 16 | Oak Log<br/>`Obj_TreeBroadleaf_A_L_Trunk_Aligned` | Fused Oak Log<br/>`Obj_TreeWood_A_01_ForAttachment` | Oak Log<br/>`Obj_TreeBroadleaf_A_L_Trunk` |  |
| 17 | Medium Burned Log<br/>`Obj_TreeBurned_B_01_Trunk` | Short Burned Log (From Tree)<br/>`Obj_TreeBurned_A_01_Trunk` | ❌ | ? |
| 18 | Long Burned Log<br/>`Obj_TreeBurned_B_02_Trunk` | Short Burned Log (From Tree)<br/>`Obj_TreeBurned_A_01_Trunk` | ❌ | ? |
| 19 | Long Dead Spruce Log (From Tree)<br/>`Obj_TreeConiferousDead_A_01_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 20 | Long Dead Spruce Log<br/>`Obj_TreeConiferousDead_A_01_Trunk_Aligned` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 21 | Short Dead Spruce Log<br/>`Obj_TreeConiferousDead_A_02_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 22 | Long Dead Snowy Spruce Log (From Tree)<br/>`Obj_TreeConiferousDead_A_Snow_01_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 23 | Long Dead Snowy Spruce Log<br/>`Obj_TreeConiferousDead_A_Snow_01_Trunk_Aligned` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 24 | Short Spruce Log (From Tree)<br/>`Obj_TreeConiferous_A_01_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 25 | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 26 | Long Spruce Log<br/>`Obj_TreeConiferous_A_02_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 27 | Large Spruce Log<br/>`Obj_TreeConiferous_A_03_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 28 | Short Snowy Spruce Log (From Tree)<br/>`Obj_TreeConiferous_A_Snow_01_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 29 | Short Snowy Spruce Log<br/>`Obj_TreeConiferous_A_Snow_01_Trunk_Aligned` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 30 | Long Snowy Spruce Log<br/>`Obj_TreeConiferous_A_Snow_02_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 31 | Large Snowy Spruce Log<br/>`Obj_TreeConiferous_A_Snow_03_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 32 | Short Pale Spruce Log (From Tree)<br/>`Obj_TreeConiferous_C_01_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 33 | Short Pale Spruce Log<br/>`Obj_TreeConiferous_C_01_Trunk_Aligned` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 34 | Long Pale Spruce Log<br/>`Obj_TreeConiferous_C_02_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 35 | Large Pale Spruce Log<br/>`Obj_TreeConiferous_C_03_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 36 | Apple Log Stump (With Leaf)<br/>`Obj_TreeDeadLeaf_A_01_Trunk` | Apple Log Stump (No Leaf)<br/>`Obj_TreeDead_A_01_Trunk` | ❌ | ? |
| 37 | Seres Scablands Tree Log<br/>`Obj_TreeDragonBlood_A_03_Trunk` | Fused Birch Log<br/>`Obj_TreeWhiteBirch_A_01_ForAttachment` | Birch Log 1<br/>`Obj_TreeWhiteBirch_A_01_Trunk_Aligned` | ? |
| 38 | Lost Woods Tree Log<br/>`Obj_TreeGhost_A_03_Trunk` | Fused Oak Log<br/>`Obj_TreeWood_A_01_ForAttachment` | Oak Log<br/>`Obj_TreeBroadleaf_A_L_Trunk` |  |
| 39 | Long Maple Log (From Tree)<br/>`Obj_TreeMaple_A_01_Trunk` | Fused Maple Log<br/>`Obj_TreeMaple_A_01_ForAttachment` | Long Maple Log<br/>`Obj_TreeMaple_A_01_Trunk_Aligned` | ? |
| 40 | Long Maple Log<br/>`Obj_TreeMaple_A_01_Trunk_Aligned` | Fused Maple Log<br/>`Obj_TreeMaple_A_01_ForAttachment` | Long Maple Log<br/>`Obj_TreeMaple_A_01_Trunk_Aligned` | ? |
| 41 | Short Maple Log<br/>`Obj_TreeMaple_A_02_Trunk` | Fused Maple Log<br/>`Obj_TreeMaple_A_01_ForAttachment` | Long Maple Log<br/>`Obj_TreeMaple_A_01_Trunk_Aligned` | ? |
| 42 | Long Maple Log 2<br/>`Obj_TreeMaple_B_01_Trunk` | Fused Maple Log<br/>`Obj_TreeMaple_A_01_ForAttachment` | Long Maple Log<br/>`Obj_TreeMaple_A_01_Trunk_Aligned` | ? |
| 43 | Short Maple Log 2<br/>`Obj_TreeMaple_B_02_Trunk` | Fused Maple Log<br/>`Obj_TreeMaple_A_01_ForAttachment` | Long Maple Log<br/>`Obj_TreeMaple_A_01_Trunk_Aligned` | ? |
| 44 | Long Maple Log 3<br/>`Obj_TreeMaple_C_01_Trunk` | Fused Maple Log<br/>`Obj_TreeMaple_A_01_ForAttachment` | Long Maple Log<br/>`Obj_TreeMaple_A_01_Trunk_Aligned` | ? |
| 45 | Short Maple Log 3<br/>`Obj_TreeMaple_C_02_Trunk` | Fused Maple Log<br/>`Obj_TreeMaple_A_01_ForAttachment` | Long Maple Log<br/>`Obj_TreeMaple_A_01_Trunk_Aligned` | ? |
| 46 | Straight Beach Palm Log (From Tree)<br/>`Obj_TreePalmBeach_A_01_Trunk` | Fused Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_ForAttachment` | Straight Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_Trunk_Aligned` |  |
| 47 | Sraight Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_Trunk_Aligned` | Fused Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_ForAttachment` | Straight Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_Trunk_Aligned` |  |
| 48 | Curved Beach Palm Log<br/>`Obj_TreePalmBeach_A_02_Trunk` | Fused Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_ForAttachment` | Straight Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_Trunk_Aligned` |  |
| 49 | Long Oasis Palm Log<br/>`Obj_TreePalm_A_01_Trunk` | Fused Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_ForAttachment` | Straight Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_Trunk_Aligned` | ? |
| 50 | Short Oasis Palm Log<br/>`Obj_TreePalm_A_02_Trunk` | Fused Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_ForAttachment` | Straight Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_Trunk_Aligned` | ? |
| 51 | Long Sky Apple Log (From Tree)<br/>`Obj_TreeSkyApple_A_L_01_Trunk` | Medium Sky Apple Log<br/>`Obj_TreeSkyApple_A_M_01_Trunk` | ❌ | ? |
| 52 | Long Sky Apple Log<br/>`Obj_TreeSkyApple_A_L_01_Trunk_Aligned` | Medium Sky Apple Log<br/>`Obj_TreeSkyApple_A_M_01_Trunk` | ❌ | ? |
| 53 | Long Sky Oak Log (From Tree)<br/>`Obj_TreeSkyBroadleaf_A_L_Trunk` | Fused Sky Oak Log<br/>`Obj_TreeWhiteWood_A_01_ForAttachment` | Long Sky Oak Log<br/>`Obj_TreeSkyBroadleaf_A_L_Trunk_Aligned` | ? |
| 54 | Long Sky Oak Log<br/>`Obj_TreeSkyBroadleaf_A_L_Trunk_Aligned` | Fused Sky Oak Log<br/>`Obj_TreeWhiteWood_A_01_ForAttachment` | Long Sky Oak Log<br/>`Obj_TreeSkyBroadleaf_A_L_Trunk_Aligned` | ? |
| 55 | Long Sky Oak Log (Raft Construct)<br/>`Obj_TreeSkyBroadleaf_A_L_Trunk_NoDamage` | Fused Sky Oak Log<br/>`Obj_TreeWhiteWood_A_01_ForAttachment` | Long Sky Oak Log<br/>`Obj_TreeSkyBroadleaf_A_L_Trunk_Aligned` | ? |
| 56 | Dead Snowy Sky Oak Log<br/>`Obj_TreeSkyDead_A_Snow_01_Trunk` | Fused Sky Oak Log<br/>`Obj_TreeWhiteWood_A_01_ForAttachment` | Long Sky Oak Log<br/>`Obj_TreeSkyBroadleaf_A_L_Trunk_Aligned` | ? |
| 57 | Birch Log 1 (From Tree)<br/>`Obj_TreeWhiteBirch_A_01_Trunk` | Fused Birch Log<br/>`Obj_TreeWhiteBirch_A_01_ForAttachment` | Birch Log 1<br/>`Obj_TreeWhiteBirch_A_01_Trunk` | ? |
| 58 | Birch Log 1<br/>`Obj_TreeWhiteBirch_A_01_Trunk_Aligned` | Fused Birch Log<br/>`Obj_TreeWhiteBirch_A_01_ForAttachment` | Birch Log 1<br/>`Obj_TreeWhiteBirch_A_01_Trunk` | ? |
| 59 | Birch Log 2 (From Tree)<br/>`Obj_TreeWhiteBirch_A_02_Trunk` | Fused Birch Log<br/>`Obj_TreeWhiteBirch_A_01_ForAttachment` | Birch Log 1<br/>`Obj_TreeWhiteBirch_A_01_Trunk` | ? |
| 60 | Birch Log 3 (From Tree)<br/>`Obj_TreeWhiteBirch_A_03_Trunk` | Fused Birch Log<br/>`Obj_TreeWhiteBirch_A_01_ForAttachment` | Birch Log 1<br/>`Obj_TreeWhiteBirch_A_01_Trunk` | ? |
| 61 | Birch Log 4 (From Tree)<br/>`Obj_TreeWhiteBirch_A_04_Trunk` | Fused Birch Log<br/>`Obj_TreeWhiteBirch_A_01_ForAttachment` | Birch Log 1<br/>`Obj_TreeWhiteBirch_A_01_Trunk` | ? |
| 62 | Willow Log<br/>`Obj_TreeWillow_A_01_Trunk` | Fused Willow Log<br/>`Obj_TreeWillow_A_01_ForAttachment` | Willow Log<br/>`Obj_TreeWillow_A_01_Trunk` |  |

### Items and Materials ?

Anything which can enter the inventory. All such actors brought out from the inventory are the replacement, except thrown capsules.

| Index | Base Actor Name<br/>`Base Actor ID` | Replacement Actor Name<br/>`Replacement Actor ID` | RA is self? | Info |
| --- | --- | --- | --- | --- |
| 1 | Bomb Flower<br/>`BombFruit` | Bomb Flower<br/>`BombFruit` | ✔️ |  |
| 2 | Muddle Bud (Planted)<br/>`ConfusionFruit_Static` | Muddle Bud<br/>`ConfusionFruit` | ❌ | ? |
| 3 | Shock Fruit<br/>`ElectricalFruit` | Shock Fruit<br/>`ElectricalFruit` | ✔️ |  |
| 4 | Fire Fruit<br/>`FireFruit` | Fire Fruit<br/>`FireFruit` | ✔️ |  |
| 5 | Ice Fruit<br/>`IceFruit` | Ice Fruit<br/>`IceFruit` | ✔️ |  |
| 6 | Star Fragment (Skydiving)<br/>`Item_CatchInAir` | Star Fragment<br/>`Item_Ore_J` | ❌ |  |
| 7 | Red Chuchu Jelly<br/>`Item_Enemy_15` | Red Chuchu Jelly<br/>`Item_Enemy_15` | ✔️ |  |
| 8 | Yellow Chuchu Jelly<br/>`Item_Enemy_16` | Yellow Chuchu Jelly<br/>`Item_Enemy_16` | ✔️ |  |
| 9 | White Chuchu Jelly<br/>`Item_Enemy_17` | White Chuchu Jelly<br/>`Item_Enemy_17` | ✔️ |  |
| 10 | Bird Egg<br/>`Item_Material_04` | Bird Egg<br/>`Item_Material_04` | ✔️ |  |
| 11 | Rushroom (Planted)<br/>`Item_Mushroom_D` | Rushroom<br/>`Item_MushroomGet_D` | ❌ | ? |
| 12 | Brightcap (Planted)<br/>`Item_Mushroom_K` | Brightcap<br/>`Item_MushroomGet_K` | ❌ | ? |
| 13 | Hyrule Herb (Planted)<br/>`Item_Plant_A` | Hyrule Herb<br/>`Item_PlantGet_A` | ❌ | ? |
| 14 | Hearty Radish (Planted)<br/>`Item_Plant_B` | Hearty Radish<br/>`Item_PlantGet_B` | ❌ | ? |
| 15 | Hearty Radish (Garden Tutorial)<br/>`Item_Plant_B_TemporaryOwnedByNpc` | Hearty Radish<br/>`Item_PlantGet_B` | ❌ | ? |
| 16 | Big Hearty Radish (Planted)<br/>`Item_Plant_C` | Big Hearty Radish<br/>`Item_PlantGet_C` | ❌ | ? |
| 17 | Big Hearty Radish (Garden Tutorial)<br/>`Item_Plant_C_TemporaryOwnedByNpc` | Big Heary Radish<br/>`Item_PlantGet_C` | ❌ | ? |
| 18 | Cool Safflina (Planted)<br/>`Item_Plant_E` | Cool Safflina<br/>`Item_PlantGet_E` | ❌ | ? |
| 19 | Warm Safflina (Planted)<br/>`Item_Plant_F` | Warm Safflina<br/>`Item_PlantGet_F` | ❌ | ? |
| 20 | Mighty Thistle (Planted)<br/>`Item_Plant_G` | Mighty Thistle<br/>`Item_PlantGet_G` | ❌ | ? |
| 21 | Armoranth (Planted)<br/>`Item_Plant_H` | Armoranth<br/>`Item_PlantGet_H` | ❌ | ? |
| 22 | Blue Nightshade (Planted)<br/>`Item_Plant_I` | Blue Nightshade<br/>`Item_PlantGet_I` | ❌ | ? |
| 23 | Blue Nightshade (Oaki's)<br/>`Item_Plant_I_OwnedByNpc` | Blue Nightshade<br/>`Item_PlantGet_I` | ❌ | ? |
| 24 | Silent Princess (Planted)<br/>`Item_Plant_J` | Silent Princess<br/>`Item_PlantGet_J` | ❌ | ? |
| 25 | Silent Princess (Oaki's)<br/>`Item_Plant_J_OwnedByNpc` | Silent Princess<br/>`Item_PlantGet_J` | ❌ | ? |
| 26 | Electric Safflina (Planted)<br/>`Item_Plant_L` | Electric Safflina<br/>`Item_PlantGet_L` | ❌ | ? |
| 27 | Swift Carrot (Planted)<br/>`Item_Plant_M` | Swift Carrot<br/>`Item_PlantGet_M` | ❌ | ? |
| 28 | Swift Carrot (Kakariko Garden)<br/>`Item_Plant_M_OwnedByNpc` | Swift Carrot<br/>`Item_PlantGet_M` | ❌ | ? |
| 29 | Swift Carrot (Garden Tutorial)<br/>`Item_Plant_M_TemporaryOwnedByNpc` | Swift Carrot<br/>`Item_PlantGet_M` | ❌ | ? |
| 30 | Swift Violet (Planted)<br/>`Item_Plant_O` | Swift Violet<br/>`Item_PlantGet_O` | ❌ | ? |
| 31 | Endura Carrot (Planted)<br/>`Item_Plant_Q` | Endura Carrot<br/>`Item_PlantGet_Q` | ❌ | ? |
| 32 | Endura Carrot (Garden Tutorial)<br/>`Item_Plant_Q_TemporaryOwnedByNpc` | Endura Carrot<br/>`Item_PlantGet_Q` | ❌ | ? |
| 33 | Sundelion (Planted)<br/>`Item_Plant_R` | Sundelion<br/>`Item_PlantGet_R` | ❌ | ? |
| 34 | Sundelion (Mellie's)<br/>`Item_Plant_R_Kakariko_008` | Sundelion<br/>`Item_PlantGet_R` | ❌ | ? |
| 35 | Stambulb (Planted)<br/>`Item_Plant_S` | Stambulb<br/>`Item_PlantGet_S` | ❌ | ? |
| 36 | Puffshroom (Planted)<br/>`SmokeFuit_Static` | Puffshroom<br/>`SmokeFruit` | ❌ | _sic_ |
| 37 | Balloon (Capsule)<br/>`SpObj_BalloonEnvelope_Capsule_A_01` | Balloon<br/>`SpObj_BalloonEnvelope_A_01` | ❌ |  |
| 38 | Beam Emitter (Capsule)<br/>`SpObj_Beamos_Capsule_A_01` | Beam Emitter<br/>`SpObj_Beamos_A_01` | ❌ |  |
| 39 | Cannon (Capsule)<br/>`SpObj_Cannon_Capsule_A_01` | Cannon<br/>`SpObj_Cannon_A_01` | ❌ |  |
| 40 | Cart (Capsule)<br/>`SpObj_Cart_Capsule_A_01` | Cart<br/>`SpObj_Cart_A_01` | ❌ |  |
| 41 | Homing Cart (Capsule)<br/>`SpObj_Chaser_Capsule_A_01` | Homing Cart<br/>`SpObj_Chaser_A_01` | ❌ |  |
| 42 | Steering Stick (Capsule)<br/>`SpObj_ControlStick_Capsule_A_01` | Steering Stick<br/>`SpObj_ControlStick_A_01` | ❌ |  |
| 43 | Portable Pot (Capsule)<br/>`SpObj_CookSet_Capsule_A_01` | Portable Pot<br/>`SpObj_CookSet_A_01` | ❌ |  |
| 44 | Shock Emitter (Capsule)<br/>`SpObj_ElectricBoxGenerator_Capsule_A_01` | Shock Emitter<br/>`SpObj_ElectricBoxGenerator` | ❌ | _sic_ |
| 45 | Battery (Capsule)<br/>`SpObj_EnergyBank_Capsule_A_01` | Battery<br/>`SpObj_EnergyBank_A_01` | ❌ |  |
| 46 | Big Battery (Capsule)<br/>`SpObj_EnergyBank_Capsule_A_02` | Big Battery<br/>`SpObj_EnergyBank_A_02` | ❌ |  |
| 47 | Small Wheel (Capsule)<br/>`SpObj_FastWheel_Capsule_A_01` | Small Wheel<br/>`SpObj_FastWheel_A_01` | ❌ |  |
| 48 | Big Wheel (Capsule)<br/>`SpObj_FastWheel_Capsule_A_02` | Big Wheel<br/>`SpObj_SwitchWheel_A_01` | ❌ | _sic_ |
| 49 | Flame Emitter (Capsule)<br/>`SpObj_FlameThrower_Capsule_A_01` | Flame Emitter<br/>`SpObj_FlameThrower_A_01` | ❌ |  |
| 50 | Light (Capsule)<br/>`SpObj_FlashLight_Capsule_A_01` | Light<br/>`SpObj_FlashLight_A_01` | ❌ |  |
| 51 | Hover Stone (Capsule<br/>`SpObj_FloatingStone_Capsule_A_01` | Hover Stone<br/>`SpObj_FloatingStone_A_01` | ❌ |  |
| 52 | Construct Head (Capsule)<br/>`SpObj_GolemHead_Capsule_A_01` | Construct Head<br/>`SpObj_GolemHead_A_01` | ❌ |  |
| 53 | Hydrant (Capsule)<br/>`SpObj_LiftableWaterPump_Capsule_A_01` | Hydrant<br/>`SpObj_WaterPump_A_01` | ❌ |  |
| 54 | Wing (Capsule)<br/>`SpObj_LiftGeneratorWing_Capsule_A_01` | Wing<br/>`SpObj_LiftGeneratorWing_A_01` | ❌ |  |
| 55 | Mirror (Capsule)<br/>`SpObj_LightMirror_Capsule_A_01` | Mirror<br/>`SpObj_LightMirror_A_01` | ❌ |  |
| 56 | Stake (Capsule)<br/>`SpObj_Pile_Capsule_A_01` | Stake<br/>`SpObj_Pile_A_01` | ❌ |  |
| 57 | Rocket (Capsule)<br/>`SpObj_Rocket_Capsule_A_01` | Rocket<br/>`SpObj_Rocket_A_01` | ❌ |  |
| 58 | Sled (Capsule)<br/>`SpObj_SlipBoard_Capsule_A_01` | Sled<br/>`SpObj_SlipBoard_A_01` | ❌ |  |
| 59 | Frost Emitter (Capsule)<br/>`SpObj_SnowMachine_Capsule_A_01` | Frost Emitter<br/>`SpObj_SnowMachine_A_01` | ❌ |  |
| 60 | Spring (Capsule)<br/>`SpObj_SpringPiston_Capsule_A_01` | Spring<br/>`SpObj_SpringPiston_A_01` | ❌ |  |
| 61 | Stabilizer<br/>`SpObj_TiltingDoll_Capsule_A_01` | Stabilizer<br/>`SpObj_TiltingDoll_A_01` | ❌ |  |
| 62 | Time Bomb (Capsule)<br/>`SpObj_TimerBomb_Capsule_A_01` | Time Bomb<br/>`SpObj_TimerBomb_A_01` | ❌ |  |
| 63 | Fan (Capsule)<br/>`SpObj_WindGenerator_Capsule_A_01` | Fan<br/>`SpObj_WindGenerator_A_01` | ❌ |  |
|  | ───────────────────────────── | ───────────────────── |  |  |

### Zonai Device Capsules ?

Capsules. Strictly a subset of the items category, but a little extra emphasis on this one can't hurt. Sorted to match the sort order in the inventory.

| Index | Base Actor Name<br/>`Base Actor ID` | Replacement Actor Name<br/>`Replacement Actor ID` | Info |
| --- | --- | --- | --- |
| 1 | Fan (Capsule)<br/>`SpObj_WindGenerator_Capsule_A_01` | Fan<br/>`SpObj_WindGenerator_A_01` |  |
| 2 | Wing (Capsule)<br/>`SpObj_LiftGeneratorWing_Capsule_A_01` | Wing<br/>`SpObj_LiftGeneratorWing_A_01` |  |
| 3 | Cart (Capsule)<br/>`SpObj_Cart_Capsule_A_01` | Cart<br/>`SpObj_Cart_A_01` |  |
| 4 | Balloon (Capsule)<br/>`SpObj_BalloonEnvelope_Capsule_A_01` | Balloon<br/>`SpObj_BalloonEnvelope_A_01` |  |
| 5 | Rocket (Capsule)<br/>`SpObj_Rocket_Capsule_A_01` | Rocket<br/>`SpObj_Rocket_A_01` |  |
| 6 | Time Bomb (Capsule)<br/>`SpObj_TimerBomb_Capsule_A_01` | Time Bomb<br/>`SpObj_TimerBomb_A_01` |  |
| 7 | Portable Pot (Capsule)<br/>`SpObj_CookSet_Capsule_A_01` | Portable Pot<br/>`SpObj_CookSet_A_01` |  |
| 8 | Flame Emitter (Capsule)<br/>`SpObj_FlameThrower_Capsule_A_01` | Flame Emitter<br/>`SpObj_FlameThrower_A_01` |  |
| 9 | Frost Emitter (Capsule)<br/>`SpObj_SnowMachine_Capsule_A_01` | Frost Emitter<br/>`SpObj_SnowMachine_A_01` |  |
| 10 | Shock Emitter (Capsule)<br/>`SpObj_ElectricBoxGenerator_Capsule_A_01` | Shock Emitter<br/>`SpObj_ElectricBoxGenerator` | _sic_ |
| 11 | Beam Emitter (Capsule)<br/>`SpObj_Beamos_Capsule_A_01` | Beam Emitter<br/>`SpObj_Beamos_A_01` |  |
| 12 | Hydrant (Capsule)<br/>`SpObj_LiftableWaterPump_Capsule_A_01` | Hydrant<br/>`SpObj_WaterPump_A_01` |  |
| 13 | Steering Stick (Capsule)<br/>`SpObj_ControlStick_Capsule_A_01` | Steering Stick<br/>`SpObj_ControlStick_A_01` |  |
| 14 | Big Wheel (Capsule)<br/>`SpObj_FastWheel_Capsule_A_02` | Big Wheel<br/>`SpObj_SwitchWheel_A_01` | _sic_ |
| 15 | Small Wheel (Capsule)<br/>`SpObj_FastWheel_Capsule_A_01` | Small Wheel<br/>`SpObj_FastWheel_A_01` |  |
| 16 | Sled (Capsule)<br/>`SpObj_SlipBoard_Capsule_A_01` | Sled<br/>`SpObj_SlipBoard_A_01` |  |
| 17 | Battery (Capsule)<br/>`SpObj_EnergyBank_Capsule_A_01` | Battery<br/>`SpObj_EnergyBank_A_01` |  |
| 18 | Big Battery (Capsule)<br/>`SpObj_EnergyBank_Capsule_A_02` | Big Battery<br/>`SpObj_EnergyBank_A_02` |  |
| 19 | Spring (Capsule)<br/>`SpObj_SpringPiston_Capsule_A_01` | Spring<br/>`SpObj_SpringPiston_A_01` |  |
| 20 | Cannon (Capsule)<br/>`SpObj_Cannon_Capsule_A_01` | Cannon<br/>`SpObj_Cannon_A_01` |  |
| 21 | Stabilizer<br/>`SpObj_TiltingDoll_Capsule_A_01` | Stabilizer<br/>`SpObj_TiltingDoll_A_01` |  |
| 22 | Hover Stone (Capsule<br/>`SpObj_FloatingStone_Capsule_A_01` | Hover Stone<br/>`SpObj_FloatingStone_A_01` |  |
| 23 | Light (Capsule)<br/>`SpObj_FlashLight_Capsule_A_01` | Light<br/>`SpObj_FlashLight_A_01` |  |
| 24 | Stake (Capsule)<br/>`SpObj_Pile_Capsule_A_01` | Stake<br/>`SpObj_Pile_A_01` |  |
| 25 | Mirror (Capsule)<br/>`SpObj_LightMirror_Capsule_A_01` | Mirror<br/>`SpObj_LightMirror_A_01` |  |
| 26 | Homing Cart (Capsule)<br/>`SpObj_Chaser_Capsule_A_01` | Homing Cart<br/>`SpObj_Chaser_A_01` |  |
| 27 | Construct Head (Capsule)<br/>`SpObj_GolemHead_Capsule_A_01` | Construct Head<br/>`SpObj_GolemHead_A_01` |  |
|  | ───────────────────────────── | ───────────────────── |  |

### Master List ?

Rather long, and rather wide. Feel free to peruse the sorted tables above.

| Index | Base Actor Name<br/>`Base Actor ID` | Replacement Actor Name<br/>`Replacement Actor ID` | RA is self? | Defuse Replacement Name (If Applicable)<br/>`Defuse Replacement ID` | Info |
| --- | --- | --- | --- | --- | --- |
| 1 | Small Icicle<br/>`AsbObj_Icicle_A_01` | Small Icicle<br/>`AsbObj_Icicle_A_01` | ✔️ | ❌ |  |
| 2 | Large Icicle<br/>`AsbObj_Icicle_A_02` | Small Icicle (If scale <0.6 when fused)<br/>`AsbObj_Icicle_A_01`<br/>Large Icicle (If scale ≥0.6 when fused)<br/>`AsbObj_Icicle_A_02` | ❌<br/><br/>✔️ | ❌ |  |
| 3 | Tattered Sail<br/>`AsbObj_WoodSail_A_01` | Fused Tattered Sail<br/>`AsbObj_WoodSail_A_01_ForAttachment` | ❌ | Tattered Sail<br/>`AsbObj_WoodSail_A_01` | Replacement does not pivot |
| 4 | Pristine Sail<br/>`AsbObj_WoodSail_A_02` | Fused Pristine Sail<br/>`AsbObj_WoodSail_A_02_ForAttachment` | ❌ | Pristine Sail<br/>`AsbObj_WoodSail_A_02` | Replacement Does not pivot |
| 5 | Bomb Flower<br/>`BombFruit` | Bomb Flower<br/>`BombFruit` | ✔️ | ❌ |  |
| 6 | Snowball<br/>`BrokenSnowBall` | Small Fused Snowball (If scale <1.25 when fused)<br/>`BrokenSnowBallForAttachmentSmall`<br/>Large Fused Snowball (If scale ≥1.25 when fused)<br/>`BrokenSnowballForAttachmentLarge` | ❌<br/><br/>❌ | Snowball<br/>`BrokenSnowBall` |  |
| 7 | Small Fused Snowball<br/>`BrokenSnowBallForAttachmentSmall` | Small Fused Snowball (If scale <1.25 when fused)<br/>`BrokenSnowBallForAttachmentSmall`<br/>Large Fused Snowball (If scale ≥1.25 when fused)<br/>`BrokenSnowballForAttachmentLarge` | ✔️<br/><br/>❌ | Snowball<br/>`BrokenSnowBall` | Only accessible with DI |
| 8 | Large Fused Snowball<br/>`BrokenSnowBallForAttachmentLarge` | Small Fused Snowball (If scale <1.25 when fused)<br/>`BrokenSnowBallForAttachmentSmall`<br/>Large Fused Snowball (If scale ≥1.25 when fused)<br/>`BrokenSnowballForAttachmentLarge` | ❌<br/>✔️ | Snowball<br/>`BrokenSnowBall` | Only accessible with DI |
| 9 | Gleeok Snowball<br/>`BrokenSnowBallForDrake` | Small Fused Snowball (If scale <1.25 when fused)<br/>`BrokenSnowBallForAttachmentSmall`<br/>Large Fused Snowball (If scale ≥1.25 when fused)<br/>`BrokenSnowballForAttachmentLarge` | ❌<br/>❌ | Snowball<br/>`BrokenSnowBall` |  |
| 10 | Muddle Bud (Planted)<br/>`ConfusionFruit_Static` | Muddle Bud<br/>`ConfusionFruit` | ❌ | ❌ | ? |
| 11 | 8x4m Shrine Metal Plate<br/>`DgnObj_BoardIron_E_Cart_02`<br/>Has extra snap points | 8x4m Shrine Metal Plate<br/>`DgnObj_BoardIron_E` | ❌ | ❌ |  Only in Marakuguc - _Wheeled Wonders_ |
| 12 | Small Water Globule<br/>`DgnObj_FloatingWater_A_01` | Fused Small Water Globule<br/>`DgnObj_FloatingWater_A_01_ForAttachment` | ❌ | ❌ | Replacement has fake water |
| 13 | Large Water Globule<br/>`DgnObj_FloatingWater_A_02` | Fused Large Water Globule<br/>`DgnObj_FloatingWater_A_02_ForAttachment` | ❌ | ❌ | Replacement has fake water |
| 14 | Shrine Ice Block<br/>`DgnObj_IceBlock` | Shrine Ice Block<br/>`DgnObj_IceBlock` | ✔️ | ❌ |  |
| 15 | 12x12m Shrine Stone Board<br/>`DgnObj_Small_BoardStone_A_03` | 8x8m Shrine Stone Board<br/>`Dgn_Obj_BoardStone_A_04` | ❌ | ❌ | Only in Kimayat - _Proving Grounds: Smash_ |
| 16 | 2x2x2m Shrine Iron Box (Heavy)<br/>`DgnObj_Small_BoxIron_B_06` | 2x2x2m Shrine Iron Box (Normal)<br/>`Obj_BoxIron_B_2x2x2_01` | ❌ | ❌ | Only in Wao-os - _Lever Power_ |
| 17 | Stone Pole (?)<br/>`DgnObj_Small_StonePole_A_02` | Stone Pole (Normal)<br/>`DgnObj_Small_StonePole_A_01` | ❌ | ❌ | Only in Mayachin - _A Fixed Device_ ? |
| 18 | Stone Pole (Heavy)<br/>`DgnObj_Small_StonePole_A_03` | Stone Pole (Normal)<br/>`DgnObj_Small_StonePole_A_01` | ❌ | ❌ | Only in Riogok - _Force Transfer_ |
| 19 | Flame Ball (pre-lit)<br/>`DgnObj_StoneBall_Fire` | Flame Ball (not pre-lit)<br/>`DgnObj_StoneBall_NoFire` | ❌ | ❌ | Only in Lightning Temple |
| 20 | Long Shrine Log<br/>`DgnObj_WoodPole_A` | Short Shrine Log<br/>`DgnObj_WoodPole_A_02` | ❌ | ❌ |
| 21 | Gleeok Icicle<br/>`Drake_Icicle` | Fused Gleeok Icicle<br/>`Drake_IcicleForAttachment` | ❌ | ❌ | ? |
| 22 | Small Gloom Rock<br/>`DungeonBoss_Goron_Rock_Weapon` | Small Gloom Rock<br/>`DungeonBoss_Goron_Rock_Weapon` | ✔️ | ❌ |  |
| 23 | Large Gloom Rock<br/>`DungeonBoss_Goron_Rock_Weapon_Large` | Large Gloom Rock<br/>`DungeonBoss_Goron_Rock_Weapon_Large` | ✔️ | ❌ |  |
| 24 | Shock Fruit<br/>`ElectricalFruit` | Shock Fruit<br/>`ElectricalFruit` | ✔️ | ❌ |  |
| 25 | Fire Fruit<br/>`FireFruit` | Fire Fruit<br/>`FireFruit` | ✔️ | ❌ |  |
| 26 | Faron Enemy Camp Lookout Tower Trunk<br/>`FldObj_EnemyLookoutBanana_A_01_Trunk` | Fused Faron Enemy Camp Lookout Tower Trunk<br/>`Obj_EnemyLookoutBanana_A_01_ForAttachment` | ❌ | Faron Enemy Camp Lookout Tower Trunk<br/>`FldObj_EnemyLookoutBanana_A_01_Trunk` |  |
| 27 | Enemy Camp Lookout Tower Trunk<br/>`FldObj_ScaffoldWood_A_03_Trunk` | Fused Enemy Camp Lookout Tower Trunk<br/>`Obj_ScaffoldWood_A_03_ForAttachment` | ❌ | Enemy Camp Lookout Tower Trunk<br/>`FldObj_ScaffoldWood_A_03_Trunk` |  |
| 28 | Ice Fruit<br/>`IceFruit` | Ice Fruit<br/>`IceFruit` | ✔️ | ❌ |  |
| 29 | Ice Shard<br/>`IceWall_Piece` | Ice Shard<br/>`IceWall_Piece` | ✔️ | ❌ |  |
| 30 | Small Iron Ball (Light)<br/>`IronBall_Light` | Small Iron Ball (Normal)<br/>`DgnObj_Small_IronBall_02` | ❌ | ❌ | Only in Wao-os - _Lever Power_  |
| 31 | Star Fragment (Skydiving)<br/>`Item_CatchInAir` | Star Fragment<br/>`Item_Ore_J` | ❌ | ❌ |  |
| 32 | Red Chuchu Jelly<br/>`Item_Enemy_15` | Red Chuchu Jelly<br/>`Item_Enemy_15` | ✔️ | ❌ |  |
| 33 | Yellow Chuchu Jelly<br/>`Item_Enemy_16` | Yellow Chuchu Jelly<br/>`Item_Enemy_16` | ✔️ | ❌ |  |
| 34 | White Chuchu Jelly<br/>`Item_Enemy_17` | White Chuchu Jelly<br/>`Item_Enemy_17` | ✔️ | ❌ |  |
| 35 | Bird Egg<br/>`Item_Material_04` | Bird Egg<br/>`Item_Material_04` | ✔️ | ❌ |  |
| 36 | Rushroom (Planted)<br/>`Item_Mushroom_D` | Rushroom<br/>`Item_MushroomGet_D` | ❌ | ❌ | ? |
| 37 | Brightcap (Planted)<br/>`Item_Mushroom_K` | Brightcap<br/>`Item_MushroomGet_K` | ❌ | ❌ | ? |
| 38 | Hyrule Herb (Planted)<br/>`Item_Plant_A` | Hyrule Herb<br/>`Item_PlantGet_A` | ❌ | ❌ | ? |
| 39 | Hearty Radish (Planted)<br/>`Item_Plant_B` | Hearty Radish<br/>`Item_PlantGet_B` | ❌ | ❌ | ? |
| 40 | Hearty Radish (Garden Tutorial)<br/>`Item_Plant_B_TemporaryOwnedByNpc` | Hearty Radish<br/>`Item_PlantGet_B` | ❌ | ❌ | ? |
| 41 | Big Hearty Radish (Planted)<br/>`Item_Plant_C` | Big Hearty Radish<br/>`Item_PlantGet_C` | ❌ | ❌ | ? |
| 42 | Big Hearty Radish (Garden Tutorial)<br/>`Item_Plant_C_TemporaryOwnedByNpc` | Big Heary Radish<br/>`Item_PlantGet_C` | ❌ | ❌ | ? |
| 43 | Cool Safflina (Planted)<br/>`Item_Plant_E` | Cool Safflina<br/>`Item_PlantGet_E` | ❌ | ❌ | ? |
| 44 | Warm Safflina (Planted)<br/>`Item_Plant_F` | Warm Safflina<br/>`Item_PlantGet_F` | ❌ | ❌ | ? |
| 45 | Mighty Thistle (Planted)<br/>`Item_Plant_G` | Mighty Thistle<br/>`Item_PlantGet_G` | ❌ | ❌ | ? |
| 46 | Armoranth (Planted)<br/>`Item_Plant_H` | Armoranth<br/>`Item_PlantGet_H` | ❌ | ❌ | ? |
| 47 | Blue Nightshade (Planted)<br/>`Item_Plant_I` | Blue Nightshade<br/>`Item_PlantGet_I` | ❌ | ❌ | ? |
| 48 | Blue Nightshade (Oaki's)<br/>`Item_Plant_I_OwnedByNpc` | Blue Nightshade<br/>`Item_PlantGet_I` | ❌ | ❌ | ? |
| 49 | Silent Princess (Planted)<br/>`Item_Plant_J` | Silent Princess<br/>`Item_PlantGet_J` | ❌ | ❌ | ? |
| 50 | Silent Princess (Oaki's)<br/>`Item_Plant_J_OwnedByNpc` | Silent Princess<br/>`Item_PlantGet_J` | ❌ | ❌ | ? |
| 51 | Electric Safflina (Planted)<br/>`Item_Plant_L` | Electric Safflina<br/>`Item_PlantGet_L` | ❌ | ❌ | ? |
| 52 | Swift Carrot (Planted)<br/>`Item_Plant_M` | Swift Carrot<br/>`Item_PlantGet_M` | ❌ | ❌ | ? |
| 53 | Swift Carrot (Kakariko Garden)<br/>`Item_Plant_M_OwnedByNpc` | Swift Carrot<br/>`Item_PlantGet_M` | ❌ | ❌ | ? |
| 54 | Swift Carrot (Garden Tutorial)<br/>`Item_Plant_M_TemporaryOwnedByNpc` | Swift Carrot<br/>`Item_PlantGet_M` | ❌ | ❌ | ? |
| 55 | Swift Violet (Planted)<br/>`Item_Plant_O` | Swift Violet<br/>`Item_PlantGet_O` | ❌ | ❌ | ? |
| 56 | Endura Carrot (Planted)<br/>`Item_Plant_Q` | Endura Carrot<br/>`Item_PlantGet_Q` | ❌ | ❌ | ? |
| 57 | Endura Carrot (Garden Tutorial)<br/>`Item_Plant_Q_TemporaryOwnedByNpc` | Endura Carrot<br/>`Item_PlantGet_Q` | ❌ | ❌ | ? |
| 58 | Sundelion (Planted)<br/>`Item_Plant_R` | Sundelion<br/>`Item_PlantGet_R` | ❌ | ❌ | ? |
| 59 | Sundelion (Mellie's)<br/>`Item_Plant_R_Kakariko_008` | Sundelion<br/>`Item_PlantGet_R` | ❌ | ❌ | ? |
| 60 | Stambulb (Planted)<br/>`Item_Plant_S` | Stambulb<br/>`Item_PlantGet_S` | ❌ | ❌ | ? |
| 61 | Wooden Box (Gerudo Canyon Stable)<br/>`Kibako_Contain_01_NoRespawn` | Wooden Box (Normal)<br/>`Kibako_Contain_01` | ❌ | ❌ |  |
| 62 | Rock Like Projectile<br/>`LikeLikeRock` | Fused Rock Like Projectile<br/>`LikeLikeRock_ForAttachment` | ❌ | ❌ |  |
| 63 | Evermean Log (Depths)<br/>`MinusObj_TreeGeneralleaf_A_01_Trent_Trunk` | Fused Evermean Log (Depths)<br/>`MinusObj_TreeGeneralleaf_A_01_Treant_ForAttachment` | ❌ | Evermean Log (Depths)<br/>`MinusObj_TreeGeneralleaf_A_01_Trent_Trunk` | _sic_ |
| 64 | Short Depths Log (From Tree)<br/>`MinusObj_TreeGeneralleaf_A_01_Trunk` | Fused Depths Log<br/>`Obj_TreeGeneralleaf_C_01_ForAttachment` | ❌ | Long Depths Log<br/>`MinusObj_TreeGeneralleaf_C_01_Trunk_Aligned` |  |
| 65 | Short Depths Log<br/>`MinusObj_TreeGeneralleaf_A_01_Trunk_Aligned` | Fused Depths Log<br/>`Obj_TreeGeneralleaf_C_01_ForAttachment` | ❌ | Long Depths Log<br/>`MinusObj_TreeGeneralleaf_C_01_Trunk_Aligned` |  |
| 66 | Medium Depths Log (From Tree)<br/>`MinusObj_TreeGeneralleaf_B_01_Trunk` | Fused Depths Log<br/>`Obj_TreeGeneralleaf_C_01_ForAttachment` | ❌ | Long Depths Log<br/>`MinusObj_TreeGeneralleaf_C_01_Trunk_Aligned` |  |
| 67 | Medium Depths Log<br/>`MinusObj_TreeGeneralleaf_B_01_Trunk_Aligned` | Fused Depths Log<br/>`Obj_TreeGeneralleaf_C_01_ForAttachment` | ❌ | Long Depths Log<br/>`MinusObj_TreeGeneralleaf_C_01_Trunk_Aligned` |  |
| 68 | Long Depths Log (From Tree)<br/>`MinusObj_TreeGeneralleaf_C_01_Trunk` | Fused Depths Log<br/>`Obj_TreeGeneralleaf_C_01_ForAttachment` | ❌ | Long Depths Log<br/>`MinusObj_TreeGeneralleaf_C_01_Trunk_Aligned` |  |
| 69 | Long Depths Log<br/>`MinusObj_TreeGeneralleaf_C_01_Trunk_Aligned` | Fused Depths Log<br/>`Obj_TreeGeneralleaf_C_01_ForAttachment` | ❌ | Long Depths Log<br/>`MinusObj_TreeGeneralleaf_C_01_Trunk_Aligned` |  |
| 70 | Long Blue Depths Log (From Tree)<br/>`MinusObj_TreeGeneralleaf_D_01_Trunk` | Fused Blue Depths Log<br/>`Obj_TreeGeneralleaf_D_01_ForAttachment` | ❌ | Long Blue Depths Log<br/>`MinusObj_TreeGeneralleaf_C_01_Trunk_Aligned` |  |
| 71 | Long Blue Depths Log<br/>`MinusObj_TreeGeneralleaf_D_01_Trunk_Aligned` | Fused Blue Depths Log<br/>`Obj_TreeGeneralleaf_C_01_ForAttachment` | ❌ | Long Blue Depths Log<br/>`MinusObj_TreeGeneralleaf_C_01_Trunk_Aligned` |  |
| 72 | 3x3m Ice Board<br/>`Obj_FreezeBoard_A_01` | 3x3m Ice Board<br/>`Obj_FreezeBoard_A_01` | ✔️ | ❌ | ? |
| 73 | 3x6m Ice Board<br/>`Obj_FreezeBoard_A_02` | 3x6m Ice Board<br/>`Obj_FreezeBoard_A_02` | ✔️ | ❌ | ? |
| 74 | Large Apple Log (From Tree)<br/>`Obj_TreeApple_A_L_01_Trunk` | Medium Apple Log<br/>`Obj_TreeApple_A_M_01_Trunk` | ❌ | ❌ |  |
| 75 | Large Apple Log<br/>`Obj_TreeApple_A_L_01_Trunk_Aligned` | Medium Apple Log<br/>`Obj_TreeApple_A_M_01_Trunk` | ❌ | ❌ |  |
| 76 | Oak Log Stump<br/>`Obj_TreeBroadleafDead_B_L_01_Trunk` | Fused Oak Log<br/>`Obj_TreeWood_A_01_ForAttachment` | ❌ | Oak Log<br/>`Obj_TreeBroadleaf_A_L_Trunk` |  |
| 77 | Evermean Log (Oak)<br/>`Obj_TreeBroadleaf_A_L_Treant_Trunk` | Fused Evermean Log (Oak)<br/>`Obj_TreeWood_A_L_Treant_ForAttachment` | ❌ | Evermean Log (Oak)<Br/>`Obj_TreeBroadleaf_A_L_Treant_Trunk` |  |
| 78 | Oak Log (From Tree)<br/>`Obj_TreeBroadleaf_A_L_Trunk` | Fused Oak Log<br/>`Obj_TreeWood_A_01_ForAttachment` | ❌ | Oak Log<br/>`Obj_TreeBroadleaf_A_L_Trunk` |  |
| 79 | Oak Log<br/>`Obj_TreeBroadleaf_A_L_Trunk_Aligned` | Fused Oak Log<br/>`Obj_TreeWood_A_01_ForAttachment` | ❌ | Oak Log<br/>`Obj_TreeBroadleaf_A_L_Trunk` |  |
| 80 | Medium Burned Log<br/>`Obj_TreeBurned_B_01_Trunk` | Short Burned Log (From Tree)<br/>`Obj_TreeBurned_A_01_Trunk` | ❌ | ❌ | ? |
| 81 | Long Burned Log<br/>`Obj_TreeBurned_B_02_Trunk` | Short Burned Log (From Tree)<br/>`Obj_TreeBurned_A_01_Trunk` | ❌ | ❌ | ? |
| 82 | Long Dead Spruce Log (From Tree)<br/>`Obj_TreeConiferousDead_A_01_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | ❌ | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 83 | Long Dead Spruce Log<br/>`Obj_TreeConiferousDead_A_01_Trunk_Aligned` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | ❌ | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 84 | Short Dead Spruce Log<br/>`Obj_TreeConiferousDead_A_02_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | ❌ | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 85 | Long Dead Snowy Spruce Log (From Tree)<br/>`Obj_TreeConiferousDead_A_Snow_01_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | ❌ | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 86 | Long Dead Snowy Spruce Log<br/>`Obj_TreeConiferousDead_A_Snow_01_Trunk_Aligned` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | ❌ | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 87 | Short Spruce Log (From Tree)<br/>`Obj_TreeConiferous_A_01_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | ❌ | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 88 | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | ❌ | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 89 | Long Spruce Log<br/>`Obj_TreeConiferous_A_02_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | ❌ | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 90 | Large Spruce Log<br/>`Obj_TreeConiferous_A_03_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | ❌ | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 91 | Short Snowy Spruce Log (From Tree)<br/>`Obj_TreeConiferous_A_Snow_01_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | ❌ | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 92 | Short Snowy Spruce Log<br/>`Obj_TreeConiferous_A_Snow_01_Trunk_Aligned` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | ❌ | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 93 | Long Snowy Spruce Log<br/>`Obj_TreeConiferous_A_Snow_02_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | ❌ | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 94 | Large Snowy Spruce Log<br/>`Obj_TreeConiferous_A_Snow_03_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | ❌ | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 95 | Short Pale Spruce Log (From Tree)<br/>`Obj_TreeConiferous_C_01_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | ❌ | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 96 | Short Pale Spruce Log<br/>`Obj_TreeConiferous_C_01_Trunk_Aligned` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | ❌ | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 97 | Long Pale Spruce Log<br/>`Obj_TreeConiferous_C_02_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | ❌ | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 98 | Large Pale Spruce Log<br/>`Obj_TreeConiferous_C_03_Trunk` | Fused Spruce Log<br/>`Obj_TreeConiferous_A_01_ForAttachment` | ❌ | Short Spruce Log<br/>`Obj_TreeConiferous_A_01_Trunk_Aligned` | ? |
| 99 | Apple Log Stump (With Leaf)<br/>`Obj_TreeDeadLeaf_A_01_Trunk` | Apple Log Stump (No Leaf)<br/>`Obj_TreeDead_A_01_Trunk` | ❌ | ❌ | ? |
| 100 | Seres Scablands Tree Log<br/>`Obj_TreeDragonBlood_A_03_Trunk` | Fused Birch Log<br/>`Obj_TreeWhiteBirch_A_01_ForAttachment` | ❌ | Birch Log 1<br/>`Obj_TreeWhiteBirch_A_01_Trunk_Aligned` | ? |
| 101 | Lost Woods Tree Log<br/>`Obj_TreeGhost_A_03_Trunk` | Fused Oak Log<br/>`Obj_TreeWood_A_01_ForAttachment` | ❌ | Oak Log<br/>`Obj_TreeBroadleaf_A_L_Trunk` |  |
| 102 | Long Maple Log (From Tree)<br/>`Obj_TreeMaple_A_01_Trunk` | Fused Maple Log<br/>`Obj_TreeMaple_A_01_ForAttachment` | ❌ | Long Maple Log<br/>`Obj_TreeMaple_A_01_Trunk_Aligned` | ? |
| 103 | Long Maple Log<br/>`Obj_TreeMaple_A_01_Trunk_Aligned` | Fused Maple Log<br/>`Obj_TreeMaple_A_01_ForAttachment` | ❌ | Long Maple Log<br/>`Obj_TreeMaple_A_01_Trunk_Aligned` | ? |
| 104 | Short Maple Log<br/>`Obj_TreeMaple_A_02_Trunk` | Fused Maple Log<br/>`Obj_TreeMaple_A_01_ForAttachment` | ❌ | Long Maple Log<br/>`Obj_TreeMaple_A_01_Trunk_Aligned` | ? |
| 105 | Long Maple Log 2<br/>`Obj_TreeMaple_B_01_Trunk` | Fused Maple Log<br/>`Obj_TreeMaple_A_01_ForAttachment` | ❌ | Long Maple Log<br/>`Obj_TreeMaple_A_01_Trunk_Aligned` | ? |
| 106 | Short Maple Log 2<br/>`Obj_TreeMaple_B_02_Trunk` | Fused Maple Log<br/>`Obj_TreeMaple_A_01_ForAttachment` | ❌ | Long Maple Log<br/>`Obj_TreeMaple_A_01_Trunk_Aligned` | ? |
| 107 | Long Maple Log 3<br/>`Obj_TreeMaple_C_01_Trunk` | Fused Maple Log<br/>`Obj_TreeMaple_A_01_ForAttachment` | ❌ | Long Maple Log<br/>`Obj_TreeMaple_A_01_Trunk_Aligned` | ? |
| 108 | Short Maple Log 3<br/>`Obj_TreeMaple_C_02_Trunk` | Fused Maple Log<br/>`Obj_TreeMaple_A_01_ForAttachment` | ❌ | Long Maple Log<br/>`Obj_TreeMaple_A_01_Trunk_Aligned` | ? |
| 109 | Straight Beach Palm Log (From Tree)<br/>`Obj_TreePalmBeach_A_01_Trunk` | Fused Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_ForAttachment` | ❌ | Straight Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_Trunk_Aligned` |  |
| 110 | Sraight Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_Trunk_Aligned` | Fused Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_ForAttachment` | ❌ | Straight Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_Trunk_Aligned` |  |
| 111 | Curved Beach Palm Log<br/>`Obj_TreePalmBeach_A_02_Trunk` | Fused Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_ForAttachment` | ❌ | Straight Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_Trunk_Aligned` |  |
| 112 | Long Oasis Palm Log<br/>`Obj_TreePalm_A_01_Trunk` | Fused Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_ForAttachment` | ❌ | Straight Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_Trunk_Aligned` | ? |
| 113 | Short Oasis Palm Log<br/>`Obj_TreePalm_A_02_Trunk` | Fused Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_ForAttachment` | ❌ | Straight Beach Palm Log<br/>`Obj_TreePalmBeach_A_01_Trunk_Aligned` | ? |
| 114 | Long Sky Apple Log (From Tree)<br/>`Obj_TreeSkyApple_A_L_01_Trunk` | Medium Sky Apple Log<br/>`Obj_TreeSkyApple_A_M_01_Trunk` | ❌ | ❌ | ? |
| 115 | Long Sky Apple Log<br/>`Obj_TreeSkyApple_A_L_01_Trunk_Aligned` | Medium Sky Apple Log<br/>`Obj_TreeSkyApple_A_M_01_Trunk` | ❌ | ❌ | ? |
| 116 | Long Sky Oak Log (From Tree)<br/>`Obj_TreeSkyBroadleaf_A_L_Trunk` | Fused Sky Oak Log<br/>`Obj_TreeWhiteWood_A_01_ForAttachment` | ❌ | Long Sky Oak Log<br/>`Obj_TreeSkyBroadleaf_A_L_Trunk_Aligned` | ? |
| 117 | Long Sky Oak Log<br/>`Obj_TreeSkyBroadleaf_A_L_Trunk_Aligned` | Fused Sky Oak Log<br/>`Obj_TreeWhiteWood_A_01_ForAttachment` | ❌ | Long Sky Oak Log<br/>`Obj_TreeSkyBroadleaf_A_L_Trunk_Aligned` | ? |
| 118 | Long Sky Oak Log (Raft Construct)<br/>`Obj_TreeSkyBroadleaf_A_L_Trunk_NoDamage` | Fused Sky Oak Log<br/>`Obj_TreeWhiteWood_A_01_ForAttachment` | ❌ | Long Sky Oak Log<br/>`Obj_TreeSkyBroadleaf_A_L_Trunk_Aligned` | ? |
| 119 | Dead Snowy Sky Oak Log<br/>`Obj_TreeSkyDead_A_Snow_01_Trunk` | Fused Sky Oak Log<br/>`Obj_TreeWhiteWood_A_01_ForAttachment` | ❌ | Long Sky Oak Log<br/>`Obj_TreeSkyBroadleaf_A_L_Trunk_Aligned` | ? |
| 120 | Birch Log 1 (From Tree)<br/>`Obj_TreeWhiteBirch_A_01_Trunk` | Fused Birch Log<br/>`Obj_TreeWhiteBirch_A_01_ForAttachment` | ❌ | Birch Log 1<br/>`Obj_TreeWhiteBirch_A_01_Trunk` | ? |
| 121 | Birch Log 1<br/>`Obj_TreeWhiteBirch_A_01_Trunk_Aligned` | Fused Birch Log<br/>`Obj_TreeWhiteBirch_A_01_ForAttachment` | ❌ | Birch Log 1<br/>`Obj_TreeWhiteBirch_A_01_Trunk` | ? |
| 122 | Birch Log 2 (From Tree)<br/>`Obj_TreeWhiteBirch_A_02_Trunk` | Fused Birch Log<br/>`Obj_TreeWhiteBirch_A_01_ForAttachment` | ❌ | Birch Log 1<br/>`Obj_TreeWhiteBirch_A_01_Trunk` | ? |
| 123 | Birch Log 3 (From Tree)<br/>`Obj_TreeWhiteBirch_A_03_Trunk` | Fused Birch Log<br/>`Obj_TreeWhiteBirch_A_01_ForAttachment` | ❌ | Birch Log 1<br/>`Obj_TreeWhiteBirch_A_01_Trunk` | ? |
| 124 | Birch Log 4 (From Tree)<br/>`Obj_TreeWhiteBirch_A_04_Trunk` | Fused Birch Log<br/>`Obj_TreeWhiteBirch_A_01_ForAttachment` | ❌ | Birch Log 1<br/>`Obj_TreeWhiteBirch_A_01_Trunk` | ? |
| 125 | Willow Log<br/>`Obj_TreeWillow_A_01_Trunk` | Fused Willow Log<br/>`Obj_TreeWillow_A_01_ForAttachment` | ❌ | Willow Log<br/>`Obj_TreeWillow_A_01_Trunk` |  |
| 126 | Puffshroom (Planted)<br/>`SmokeFuit_Static` | Puffshroom<br/>`SmokeFruit` | ❌ | ❌ | _sic_ |
| 127 | Balloon (Capsule)<br/>`SpObj_BalloonEnvelope_Capsule_A_01` | Balloon<br/>`SpObj_BalloonEnvelope_A_01` | ❌ | ❌ |  |
| 128 | Beam Emitter (Capsule)<br/>`SpObj_Beamos_Capsule_A_01` | Beam Emitter<br/>`SpObj_Beamos_A_01` | ❌ | ❌ |  |
| 129 | Cannon (Capsule)<br/>`SpObj_Cannon_Capsule_A_01` | Cannon<br/>`SpObj_Cannon_A_01` | ❌ | ❌ |  |
| 130 | Cart (Capsule)<br/>`SpObj_Cart_Capsule_A_01` | Cart<br/>`SpObj_Cart_A_01` | ❌ | ❌ |  |
| 131 | Homing Cart (Capsule)<br/>`SpObj_Chaser_Capsule_A_01` | Homing Cart<br/>`SpObj_Chaser_A_01` | ❌ | ❌ |  |
| 132 | Steering Stick (Capsule)<br/>`SpObj_ControlStick_Capsule_A_01` | Steering Stick<br/>`SpObj_ControlStick_A_01` | ❌ | ❌ |  |
| 133 | Portable Pot (Capsule)<br/>`SpObj_CookSet_Capsule_A_01` | Portable Pot<br/>`SpObj_CookSet_A_01` | ❌ | ❌ |  |
| 134 | Shock Emitter (Capsule)<br/>`SpObj_ElectricBoxGenerator_Capsule_A_01` | Shock Emitter<br/>`SpObj_ElectricBoxGenerator` | ❌ | ❌ |  |
| 135 | Battery (Capsule)<br/>`SpObj_EnergyBank_Capsule_A_01` | Battery<br/>`SpObj_EnergyBank_A_01` | ❌ | ❌ |  |
| 136 | Big Battery (Capsule)<br/>`SpObj_EnergyBank_Capsule_A_02` | Big Battery<br/>`SpObj_EnergyBank_A_02` | ❌ | ❌ |  |
| 137 | Small Wheel (Capsule)<br/>`SpObj_FastWheel_Capsule_A_01` | Small Wheel<br/>`SpObj_FastWheel_A_01` | ❌ | ❌ |  |
| 138 | Big Wheel (Capsule)<br/>`SpObj_FastWheel_Capsule_A_02` | Big Wheel<br/>`SpObj_SwitchWheel_A_01` | ❌ | ❌ | _sic_ |
| 139 | Flame Emitter (Capsule)<br/>`SpObj_FlameThrower_Capsule_A_01` | Flame Emitter<br/>`SpObj_FlameThrower_A_01` | ❌ | ❌ |  |
| 140 | Light (Capsule)<br/>`SpObj_FlashLight_Capsule_A_01` | Light<br/>`SpObj_FlashLight_A_01` | ❌ | ❌ |  |
| 141 | Hover Stone (Capsule<br/>`SpObj_FloatingStone_Capsule_A_01` | Hover Stone<br/>`SpObj_FloatingStone_A_01` | ❌ | ❌ |  |
| 142 | Construct Head (Capsule)<br/>`SpObj_GolemHead_Capsule_A_01` | Construct Head<br/>`SpObj_GolemHead_A_01` | ❌ | ❌ |  |
| 143 | Hydrant (Capsule)<br/>`SpObj_LiftableWaterPump_Capsule_A_01` | Hydrant<br/>`SpObj_WaterPump_A_01` | ❌ | ❌ |  |
| 144 | Wing (Capsule)<br/>`SpObj_LiftGeneratorWing_Capsule_A_01` | Wing<br/>`SpObj_LiftGeneratorWing_A_01` | ❌ | ❌ |  |
| 145 | Mirror (Capsule)<br/>`SpObj_LightMirror_Capsule_A_01` | Mirror<br/>`SpObj_LightMirror_A_01` | ❌ | ❌ |  |
| 146 | Stake (Capsule)<br/>`SpObj_Pile_Capsule_A_01` | Stake<br/>`SpObj_Pile_A_01` | ❌ | ❌ |  |
| 147 | Rocket (Capsule)<br/>`SpObj_Rocket_Capsule_A_01` | Rocket<br/>`SpObj_Rocket_A_01` | ❌ | ❌ |  |
| 148 | Sled (Capsule)<br/>`SpObj_SlipBoard_Capsule_A_01` | Sled<br/>`SpObj_SlipBoard_A_01` | ❌ | ❌ |  |
| 149 | Frost Emitter (Capsule)<br/>`SpObj_SnowMachine_Capsule_A_01` | Frost Emitter<br/>`SpObj_SnowMachine_A_01` | ❌ | ❌ |  |
| 150 | Spring (Capsule)<br/>`SpObj_SpringPiston_Capsule_A_01` | Spring<br/>`SpObj_SpringPiston_A_01` | ❌ | ❌ |  |
| 151 | Stabilizer<br/>`SpObj_TiltingDoll_Capsule_A_01` | Stabilizer<br/>`SpObj_TiltingDoll_A_01` | ❌ | ❌ |  |
| 152 | Time Bomb (Capsule)<br/>`SpObj_TimerBomb_Capsule_A_01` | Time Bomb<br/>`SpObj_TimerBomb_A_01` | ❌ | ❌ |  |
| 153 | Fan (Capsule)<br/>`SpObj_WindGenerator_Capsule_A_01` | Fan<br/>`SpObj_WindGenerator_A_01` | ❌ | ❌ |  |
| 154 | Tenoko Island Boat<br/>`TwnObj_Village_Fishing_Boat_A_02` | Fused Tenoko Island Boat<br/>`TwnObj_Village_Fishing_Boat_A_02_ForAttachment` | ❌ | Tenoko Island Boat<br/>`TwnObj_Village_Fishing_Boat_A_02` |  |
| 155 | Flux Construct I Block<br/>`Zonau_BlockMaster_Block` | Fused Flux Construct I Block<br/>`Zonau_BlockMaster_Block_ForAttachment` | ❌ | ❌ |  |
| 156 | Flux Construct II Block<br/>`Zonau_BlockMaster_Block_Middle` | Fused Flux Construct II Block<br/>`Zonau_BlockMaster_Block_Middle_ForAttachment` | ❌ | ❌ |  |
| 157 | Flux Construct III Block<br/>`Zonau_BlockMaster_Block_Senior` | Fused Flux Construct III Block<br/>`Zonau_BlockMaster_Block_Senior_ForAttachment` | ❌ | ❌ |  |
