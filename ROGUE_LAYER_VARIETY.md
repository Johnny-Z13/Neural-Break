# 🎲 Rogue Mode Layer Variety System

## Overview

Rogue mode now features a **dynamic layer system** with 6 unique layer themes that cycle throughout your ascent. Each layer has different enemy compositions, spawn rates, and difficulty scaling.

## 🎯 Layer Themes (Cycle Every 6 Layers)

### Layer 1, 7, 13, ... - 🐛 SWARM ASSAULT
**Focus:** Basic enemies in large numbers
- **High spawn:** Data Mites (40+), Scan Drones (15+), Fizzers
- **Low spawn:** Crystal Swarms
- **Minimal:** Chaos Worms
- **Challenge:** Overwhelming numbers, dodging patterns

### Layer 2, 8, 14, ... - 🌀 CHAOS STORM
**Focus:** Chaos Worms and Void Spheres
- **High spawn:** Chaos Worms (3+), Void Spheres (2+)
- **Moderate:** Data Mites, Scan Drones
- **Challenge:** Unpredictable movement, gravity wells

### Layer 3, 9, 15, ... - 💎 CRYSTAL FIELD
**Focus:** Crystal Shard Swarms
- **High spawn:** Crystal Swarms (3+), Fizzers
- **Moderate:** Data Mites, Scan Drones
- **Challenge:** Shard patterns, multiple swarms

### Layer 4, 10, 16, ... - 🎭 NEURAL MAZE
**Focus:** Balanced variety of all enemy types
- **High spawn:** Mixed composition
- **Includes:** UFOs (laser threats)
- **Challenge:** Adapting to multiple enemy behaviors

### Layer 5, 11, 17, ... - ⚡ ELITE GAUNTLET
**Focus:** Tough enemies (UFOs, Void Spheres)
- **High spawn:** Void Spheres (3+), UFOs (2+)
- **Lower:** Basic enemies
- **Challenge:** Laser dodging, gravity management

### Layer 6, 12, 18, ... - 👹 SECTOR GUARDIAN
**Focus:** Boss encounter
- **Boss spawn:** After 30 seconds
- **Support enemies:** Moderate mix
- **Challenge:** Boss fight + adds management

## 📈 Progressive Difficulty Scaling

Each layer increases difficulty by **15% per layer**:

```
Layer 1:  100% difficulty (baseline)
Layer 2:  115% difficulty
Layer 3:  130% difficulty
Layer 4:  145% difficulty
...
Layer 10: 235% difficulty
```

**Scaling applies to:**
- Enemy kill objectives (more enemies required)
- Spawn rates (enemies spawn faster)

## 🎮 Power-Up System

Power-ups spawn at consistent rates across all layers:
- **Power-Ups:** 2 per layer (weapon boosts)
- **Speed-Ups:** 2 per layer (movement boosts)
- **Med Packs:** 3 per layer (health restore)

Between layers, you choose from 3 random **Specials** that modify:
- Stats (health, speed, damage)
- Firing modes (spread, burst, rapid)
- Behaviors (shield regen, magnetism, piercing)

## 🔧 Technical Implementation

### LevelManager
- `getRogueLevelConfig(layerNumber)` - Returns layer-specific config
- `setRogueLayer(layerNumber)` - Sets current layer
- `advanceRogueLayer()` - Advances to next layer with reset
- `getRogueLayer()` - Gets current layer number

### Layer Tracking
- Layer number tracked in `LevelManager`
- Configuration dynamically generated per layer
- Level stays at 998, layer increments separately

### Enemy Spawning
- Each theme has unique spawn rate multipliers
- Faster spawn = more dangerous
- `Infinity` spawn rate = enemy type disabled for that layer

## 🎯 Design Goals

✅ **Variety** - Each layer feels different
✅ **Progression** - Difficulty scales predictably
✅ **Replayability** - Theme cycle creates rhythm
✅ **Challenge** - Boss layers every 6th layer
✅ **Balance** - Power-ups and specials available consistently

## 🚀 Future Enhancements

Potential additions:
- Layer-specific visual themes (colors, effects)
- Special events on milestone layers (10, 20, 30...)
- Modifier layers (double speed, low gravity, darkness)
- Adaptive difficulty based on player performance
- Layer preview before entering wormhole

---

**Last Updated:** 2026-01-13
**Version:** 1.0.0
