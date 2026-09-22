# Ghost Scanner

A combinator that outputs the items needed to build construction ghosts as circuit-network signals.
Wire it to a requester chest or train logic and let your factory supply its own construction sites.

Unlocked by **Advanced combinators**. Recipe: 5 copper cable, 5 electronic circuits.

## Scan modes

Click the scanner to choose a mode:

- **Normal**: scans the logistic network the scanner is placed in.
- **Area**: scans a custom rectangle. Press **Select area** to get a selection tool, then left-click and drag on the map. The area is highlighted while you hover over the scanner.

Switching the scanner off clears its output and pauses scanning.

## What gets reported

Each scanner can toggle these individually:

- Entity ghosts
- Tile ghosts (concrete, landfill, …)
- Modules requested by entity ghosts
- Modules requested by already-built entities (item-request proxies)
- Upgrades (items needed to fulfil upgrade markers)
- Cliff explosives for cliffs marked for deconstruction

## Settings

Map settings:

| Setting                                  | Default | Description                                                             |
| ---------------------------------------- | ------- | ----------------------------------------------------------------------- |
| Scanned cells per tick                   | 5       | Logistic cells (or Area regions) scanned each tick. Lower improves UPS. |
| Logistic network update interval (ticks) | 180     | Minimum ticks between full re-scans of each scanner.                    |
| Scan tick delay                          | 5       | Minimum tick spacing between scan work slices.                          |
| Per-scanner result limit                 | 1000    | Ghosts found per scan pass; 0 removes the limit. Lower improves UPS.    |
| Area mode maximum side length            | 512     | Largest allowed Area selection, in tiles.                               |
| Show hidden items                        | off     | Also report hidden items.                                               |
| Invert output                            | off     | Output negative values, useful for request combinators.                 |
| Round to stacks                          | off     | Round counts up (down when inverted) to full stacks.                    |

Per-player settings: border and fill color of the Area overlay.

## Compatibility

This mod is based on [GhostScanner4](https://mods.factorio.com/mod/GhostScanner4) but has been improved and cannot be enabled together with

- [GhostScanner](https://mods.factorio.com/mod/GhostScanner)
- [GhostScanner2](https://mods.factorio.com/mod/GhostScanner2)
- [GhostScanner4](https://mods.factorio.com/mod/GhostScanner4)
- [ghost-combinator](https://mods.factorio.com/mod/ghost-combinator) - may works, but shouldn't be used together
- [ghost-reader](https://mods.factorio.com/mod/ghost-reader) - may works, but shouldn't be used together. Also, this mod has pretty poor performance, so I wouldn't recommend it at all.
