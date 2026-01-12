# 🎮 GAME MODE MANAGEMENT REVIEW

**Date:** 2026-01-12  
**Reviewer:** AI Assistant  
**Status:** 🔴 ISSUES IDENTIFIED - REFACTOR RECOMMENDED

---

## 📋 EXECUTIVE SUMMARY

The game has **THREE distinct modes** with different play areas, progression systems, and configurations:

- **ARCADE MODE** - Radial play area, circular boundary, objective-based levels (1-10)
- **TEST MODE** - Identical to Arcade, but with invincibility enabled for testing
- **ROGUE MODE** - Vertical corridor, side barriers, layer-based progression with wormhole exits and special mutations

### ✅ What's Working

1. **GameModeManager class** provides good central configuration
2. **Mode-specific configs** in `modes.config.ts` are well-documented
3. **Visual separation** between modes (boundaries, starfields, camera) works correctly
4. **Special mutation system** (RogueSpecial) is well-architected

### 🔴 Critical Issues Found

1. **Rogue Mode Layer Skipping Bug** - Layer counter increments incorrectly
2. **Special Selection Has No Deduplication** - Can get same power-up repeatedly
3. **Config Duplication** - Same settings exist in 3+ places
4. **Mixed Responsibilities** - Game.ts handles too much mode-specific logic

---

## 🐛 ISSUE #1: ROGUE MODE LAYER SKIPPING

### Problem

The Rogue mode layer counter skips layers or shows incorrect numbers.

### Root Cause

**Location:** `Game.ts:2175`

```typescript
// 🎲 ROGUE MODE: Continue to next layer after choice 🎲
private continueRogueLayer(): void {
  // ...
  
  // Advance to next layer
  this.rogueLayer++  // ⚠️ ALWAYS increments, even on first call
  
  // Show layer notification with correct number
  this.uiManager.showRogueLayerNotification(this.rogueLayer)
  
  // 🎲 DON'T call advanceLevel() - Rogue mode stays at level 998!
  // Just reset the objectives so enemies keep spawning
  this.levelManager.resetObjectives()  // ⚠️ This doesn't track layers!
```

### Why It Happens

1. `rogueLayer` is initialized to `1` in `initializeRogueMode()` (line 509)
2. When player completes first layer → `continueRogueLayer()` is called → increments to `2`
3. **BUT** the UI might have already shown "Layer 2" notification before this
4. The `LevelManager` doesn't know about Rogue layers - it stays at level 998
5. No persistent tracking of which layer player is actually on

### Impact

- Player sees "Layer 2" when they just finished Layer 1
- Confusing progression feedback
- Makes balancing difficulty impossible (can't tie enemy spawn rates to layer number)

### Recommended Fix

**Option A: Separate Rogue Layer Tracking**
```typescript
// In Game.ts
private rogueCurrentLayer: number = 1  // What layer player is ON
private rogueLayersCompleted: number = 0  // How many completed

private completeRogueLayer(): void {
  this.rogueLayersCompleted++
  // Show "LAYER X COMPLETE" with current layer number
  this.uiManager.showRogueLayerCompleteNotification(this.rogueCurrentLayer)
  // Then show choice screen
  this.showRogueChoiceScreen()
}

private continueRogueLayer(): void {
  this.rogueCurrentLayer++  // NOW increment
  // Show "ENTERING LAYER X" with new layer number
  this.uiManager.showRogueLayerStartNotification(this.rogueCurrentLayer)
  // Continue game
}
```

**Option B: Use LevelManager for Rogue Layers**
```typescript
// Make LevelManager mode-aware
class LevelManager {
  private rogueLayer: number = 1
  
  advanceRogueLayer(): void {
    this.rogueLayer++
  }
  
  getRogueLayer(): number {
    return this.rogueLayer
  }
}
```

**Recommendation:** Use **Option A** - keeps Rogue mode self-contained in Game.ts.

---

## 🐛 ISSUE #2: SPECIAL SELECTION HAS NO DEDUPLICATION

### Problem

**Location:** `RogueSpecial.ts:289-292`

```typescript
export function getRandomSpecials(count: number = 3): RogueSpecial[] {
  const shuffled = [...ROGUE_SPECIALS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, ROGUE_SPECIALS.length))
}
```

This function:
- ✅ Prevents duplicates **within a single choice** (3 unique options per layer)
- ❌ Does NOT prevent duplicates **across layers** (can get same power-up every layer)
- ❌ Does NOT prevent offering maxed-out power-ups
- ❌ Does NOT balance selection (some specials rarer/more common)

### Example Problem Scenario

```
Layer 1: Player chooses "RAPID FIRE" (+15% fire rate)
Layer 2: Offered "RAPID FIRE" again (can stack to +32%)
Layer 3: Offered "RAPID FIRE" again (can stack to +52%)
Layer 10: Player has 10x fire rate upgrades → game-breaking
```

### Recommended Fix

**Option A: Track Selected Specials (Simple)**
```typescript
// In Game.ts
private rogueSelectedSpecials: Set<string> = new Set()

private showRogueChoiceScreen(): void {
  const choiceScreen = RogueChoiceScreen.create(
    this.audioManager,
    this.rogueSelectedSpecials,  // Pass already-selected IDs
    (special: RogueSpecial) => {
      this.rogueSelectedSpecials.add(special.id)
      this.applyRogueSpecial(special)
      this.continueRogueLayer()
    }
  )
  // ...
}

// In RogueSpecial.ts
export function getRandomSpecials(
  count: number = 3, 
  excludeIds: Set<string> = new Set()
): RogueSpecial[] {
  const available = ROGUE_SPECIALS.filter(s => !excludeIds.has(s.id))
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, available.length))
}
```

**Option B: Weighted Selection System (Better for Balancing)**
```typescript
// In RogueSpecial.ts
export interface RogueSpecial {
  id: string
  name: string
  description: string
  type: SpecialType
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'  // NEW
  maxStacks: number  // NEW: How many times can be selected (0 = unlimited)
  // ...
}

export function getRandomSpecials(
  count: number = 3,
  selectedCounts: Map<string, number> = new Map()
): RogueSpecial[] {
  // Filter out maxed specials
  const available = ROGUE_SPECIALS.filter(s => {
    const timesSelected = selectedCounts.get(s.id) || 0
    return s.maxStacks === 0 || timesSelected < s.maxStacks
  })
  
  // Weighted random selection based on rarity
  // (implementation details...)
}
```

**Recommendation:** Start with **Option A** (simple tracking), upgrade to **Option B** later for better game balance.

---

## 🔧 ISSUE #3: CONFIG DUPLICATION

### Problem

Mode-specific settings are scattered across **FOUR different files**:

1. **`GameModeManager.ts`** - GAME_MODE_CONFIGS
2. **`modes.config.ts`** - STARFIELD_CONFIG, CAMERA_CONFIG, BOUNDARY_CONFIG, etc.
3. **`LevelManager.ts`** - getRogueLevelConfig(), getTestLevelConfig()
4. **`game.config.ts`** - GAME_CONFIG (some mode-agnostic settings)

### Example: Rogue Mode Vertical Scroll Speed

```typescript
// Defined in GameModeManager.ts
scrollSpeed: 3.0

// Also hardcoded in Game.ts
private rogueScrollSpeed: number = 3.0

// Referenced in modes.config.ts
scrollSpeed: 3.0
```

**If you want to change Rogue scroll speed, you must edit 3+ places!**

### Impact

- Hard to maintain
- Easy to create inconsistencies
- Confusing for new developers
- Refactoring is risky

### Recommended Fix

**Single Source of Truth Pattern:**

```typescript
// NEW FILE: src/config/modes/index.ts
import { GameMode } from '../core/GameState'

export interface ModeConfig {
  // Identity
  name: string
  description: string
  
  // Progression
  progression: {
    type: 'objectives' | 'wormhole' | 'endless'
    startingLevel: number
    levelLabel: string
    wormholeDistance?: number
  }
  
  // Play Area
  playArea: {
    type: 'radial' | 'vertical'
    boundary: {
      type: 'circular' | 'corridor'
      radius?: number
      widthMultiplier?: number
    }
  }
  
  // Camera
  camera: {
    verticalOffset: number
    followSmoothing: number
    scrollSpeed?: number
  }
  
  // Visuals
  visuals: {
    starfieldFlowsDown: boolean
    showCircularBoundary: boolean
    showSideBarriers: boolean
    showWormholeExit: boolean
    backgroundColor: string
  }
  
  // Spawning
  spawning: {
    enemyMode: 'circular' | 'vertical'
    pickupMode: 'circular' | 'vertical'
  }
  
  // Special Features
  features: {
    hasSpecialChoices: boolean
    playerInvincible?: boolean
  }
  
  // Enemy Config
  enemies: {
    spawnRates: {
      miteSpawnRate: number
      droneSpawnRate: number
      // ... etc
    }
  }
}

// SINGLE SOURCE OF TRUTH
export const MODE_CONFIGS: Record<GameMode, ModeConfig> = {
  [GameMode.ORIGINAL]: { /* ... */ },
  [GameMode.ROGUE]: { /* ... */ },
  [GameMode.TEST]: { /* ... */ }
}

// Convenience getters
export function getModeConfig(mode: GameMode): ModeConfig {
  return MODE_CONFIGS[mode]
}
```

**Then everywhere else just imports and uses:**
```typescript
import { getModeConfig } from '../config/modes'

const config = getModeConfig(this.gameMode)
const scrollSpeed = config.camera.scrollSpeed || 0
```

**Migration Plan:**
1. Create new unified config structure
2. Migrate GameModeManager to use it
3. Migrate modes.config.ts settings into it
4. Migrate LevelManager configs into it
5. Delete old config files
6. Update all consumers

---

## 🏗️ ISSUE #4: GAME.TS IS TOO BIG

### Problem

`Game.ts` is **2,354 lines** and handles:
- Game loop
- Mode switching
- Player management
- Enemy management
- Weapon management
- Power-up management
- Level transitions
- Rogue mode logic
- Wormhole animations
- Death animations
- Scoring
- UI updates
- Audio management
- Camera control
- Collision detection

**This violates Single Responsibility Principle!**

### Recommended Refactor

Split into mode-specific game controllers:

```
src/core/
  Game.ts                     # Main orchestrator (200 lines)
  GameMode.ts                 # Base class for modes
  modes/
    ArcadeMode.ts             # Objective-based gameplay
    RogueMode.ts              # Wormhole/layer gameplay
    TestMode.ts               # Extends ArcadeMode
```

**Example Structure:**

```typescript
// Game.ts - ORCHESTRATOR ONLY
export class Game {
  private currentMode: GameMode | null = null
  
  startMode(modeType: GameMode): void {
    this.cleanupCurrentMode()
    
    switch(modeType) {
      case GameMode.ORIGINAL:
        this.currentMode = new ArcadeMode(/* deps */)
        break
      case GameMode.ROGUE:
        this.currentMode = new RogueMode(/* deps */)
        break
      case GameMode.TEST:
        this.currentMode = new TestMode(/* deps */)
        break
    }
    
    this.currentMode.initialize()
    this.currentMode.start()
  }
  
  update(deltaTime: number): void {
    this.currentMode?.update(deltaTime)
  }
}

// modes/RogueMode.ts - ROGUE-SPECIFIC LOGIC
export class RogueMode extends BaseGameMode {
  private currentLayer: number = 1
  private layersCompleted: number = 0
  private wormholeExit: WormholeExit | null = null
  private selectedSpecials: Set<string> = new Set()
  
  initialize(): void {
    this.setupRogueBoundaries()
    this.setupRogueCamera()
    this.spawnWormholeExit()
  }
  
  update(deltaTime: number): void {
    super.update(deltaTime)  // Common logic
    this.updateRogueScroll(deltaTime)
    this.checkWormholeCollision()
  }
  
  private handleLayerComplete(): void {
    this.layersCompleted++
    this.showSpecialChoiceScreen()
  }
  
  private continueToNextLayer(): void {
    this.currentLayer++
    this.spawnWormholeExit()
    this.resumeGame()
  }
}
```

**Benefits:**
- Each mode is self-contained
- Easy to add new modes
- Easier to test
- Clearer code ownership
- Reduced merge conflicts

---

## 📊 CONFIG CONSOLIDATION STRATEGY

### Current State
```
GameModeManager.ts (173 lines)
├─ GAME_MODE_CONFIGS
└─ GameModeManager class

modes.config.ts (277 lines)
├─ STARFIELD_CONFIG
├─ CAMERA_CONFIG
├─ BOUNDARY_CONFIG
├─ ENEMY_SPAWN_CONFIG
├─ PICKUP_SPAWN_CONFIG
├─ PROGRESSION_CONFIG
└─ VISUAL_MODE_CONFIG

LevelManager.ts (651 lines)
├─ getLevelConfig() - Arcade levels 1-10
├─ getRogueLevelConfig() - Rogue layer config
└─ getTestLevelConfig() - Test mode config

game.config.ts (48 lines)
└─ GAME_CONFIG - Player/weapon base stats
```

### Proposed Structure
```
src/config/
  index.ts                    # Re-exports everything
  game.config.ts              # Mode-agnostic (player, weapon base stats)
  balance.config.ts           # Mode-agnostic (existing)
  modes/
    index.ts                  # Mode configurations
    arcade.config.ts          # All Arcade mode settings
    rogue.config.ts           # All Rogue mode settings
    test.config.ts            # All Test mode settings
    types.ts                  # Shared types
```

### Migration Steps

1. **Create new structure** (1-2 hours)
   - Create `src/config/modes/` directory
   - Create `types.ts` with unified ModeConfig interface
   - Copy arcade config from GameModeManager → `arcade.config.ts`
   - Copy rogue config from GameModeManager → `rogue.config.ts`
   - Copy test config from GameModeManager → `test.config.ts`

2. **Consolidate scattered configs** (2-3 hours)
   - Merge STARFIELD_CONFIG into mode configs
   - Merge CAMERA_CONFIG into mode configs
   - Merge BOUNDARY_CONFIG into mode configs
   - Merge ENEMY_SPAWN_CONFIG into mode configs
   - Merge PICKUP_SPAWN_CONFIG into mode configs
   - Merge PROGRESSION_CONFIG into mode configs
   - Merge VISUAL_MODE_CONFIG into mode configs

3. **Update consumers** (3-4 hours)
   - Update GameModeManager to use new configs
   - Update Game.ts to use new configs
   - Update LevelManager to use new configs
   - Update EnemyManager to use new configs
   - Update PickupManager(s) to use new configs
   - Update StarfieldManager to use new configs
   - Update SceneManager to use new configs

4. **Delete old files** (30 mins)
   - Remove old GameModeManager (or keep as thin wrapper)
   - Remove old modes.config.ts
   - Remove mode-specific logic from LevelManager

5. **Test all three modes** (1-2 hours)
   - Verify Arcade mode works identically
   - Verify Rogue mode works identically
   - Verify Test mode works identically
   - Run through full gameplay loops

**Total Estimated Time: 8-12 hours**

---

## 🎯 IMMEDIATE ACTION ITEMS

### Priority 1: Fix Rogue Layer Skipping (1 hour)

```typescript
// In Game.ts
private rogueCurrentLayer: number = 1
private rogueLayersCompleted: number = 0

private completeRogueLayer(): void {
  this.rogueLayersCompleted++
  console.log(`✅ Completed Layer ${this.rogueCurrentLayer}`)
  this.showRogueChoiceScreen()
}

private continueRogueLayer(): void {
  this.rogueCurrentLayer++
  console.log(`🚀 Starting Layer ${this.rogueCurrentLayer}`)
  this.uiManager.showRogueLayerNotification(this.rogueCurrentLayer)
  // Rest of logic...
}
```

### Priority 2: Fix Special Selection Deduplication (1-2 hours)

```typescript
// In Game.ts
private rogueSelectedSpecialIds: Set<string> = new Set()

private showRogueChoiceScreen(): void {
  const choiceScreen = RogueChoiceScreen.create(
    this.audioManager,
    this.rogueSelectedSpecialIds,  // Pass set of already-selected IDs
    (special: RogueSpecial) => {
      this.rogueSelectedSpecialIds.add(special.id)
      this.applyRogueSpecial(special)
      this.continueRogueLayer()
    }
  )
  document.body.appendChild(choiceScreen)
}

// In RogueSpecial.ts
export function getRandomSpecials(
  count: number = 3,
  excludeIds: Set<string> = new Set()
): RogueSpecial[] {
  const available = ROGUE_SPECIALS.filter(s => !excludeIds.has(s.id))
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, available.length))
}

// In RogueChoiceScreen.ts
static create(
  audioManager: AudioManager | null,
  excludeIds: Set<string>,  // NEW parameter
  onSelectSpecial: (special: RogueSpecial) => void
): HTMLElement {
  const specials = getRandomSpecials(3, excludeIds)  // Pass exclusions
  // Rest of logic...
}
```

### Priority 3: Add Console Logging for Debugging (30 mins)

Add detailed logging to track layer progression:

```typescript
// In Game.ts - completeRogueLayer()
console.log('═════════════════════════════════════')
console.log(`🎲 LAYER ${this.rogueCurrentLayer} COMPLETE`)
console.log(`   Layers Completed: ${this.rogueLayersCompleted}`)
console.log(`   Next Layer: ${this.rogueCurrentLayer + 1}`)
console.log('═════════════════════════════════════')

// In Game.ts - continueRogueLayer()
console.log('═════════════════════════════════════')
console.log(`🚀 STARTING LAYER ${this.rogueCurrentLayer}`)
console.log(`   Total Layers Completed: ${this.rogueLayersCompleted}`)
console.log('═════════════════════════════════════')

// In RogueChoiceScreen.ts - create()
console.log('🎲 Rogue Choice Screen Created')
console.log(`   Excluded Specials: ${Array.from(excludeIds).join(', ')}`)
console.log(`   Available Specials: ${specials.map(s => s.id).join(', ')}`)
```

---

## 📝 LONG-TERM RECOMMENDATIONS

### 1. Refactor to Mode Classes (8-12 hours)
- Create `src/core/modes/` directory
- Extract Arcade/Rogue/Test logic into separate classes
- Reduce Game.ts to orchestrator role

### 2. Consolidate Configs (8-12 hours)
- Merge all mode configs into `src/config/modes/`
- Single source of truth per mode
- Delete redundant config files

### 3. Add Mode-Specific Tests (4-6 hours)
- Unit tests for each mode's progression logic
- Integration tests for mode switching
- Test Rogue layer tracking specifically

### 4. Improve Rogue Special Selection (4-6 hours)
- Add rarity system (common/uncommon/rare/legendary)
- Add max stack limits per special
- Add weighted random selection
- Add "reroll" option (costs something?)

### 5. Add Rogue Run Persistence (6-8 hours)
- Save Rogue run state to localStorage
- Allow "Continue Run" from start screen
- Track best run stats (highest layer reached)

---

## 🧪 TESTING CHECKLIST

After fixing bugs, verify:

- [ ] Arcade mode starts at Level 1
- [ ] Arcade mode progresses through levels 1-10
- [ ] Arcade mode win condition works
- [ ] Test mode starts at Level 1
- [ ] Test mode has invincibility
- [ ] Test mode otherwise identical to Arcade
- [ ] Rogue mode starts at Layer 1
- [ ] Rogue mode layer counter increments correctly (1→2→3...)
- [ ] Rogue mode special selection never offers duplicates
- [ ] Rogue mode special selection excludes already-chosen specials
- [ ] Rogue mode wormhole collision detection works
- [ ] Rogue mode wormhole entry animation plays
- [ ] Rogue mode choice screen appears after wormhole
- [ ] Rogue mode stat mutations stack correctly
- [ ] Rogue mode firing mode mutations work
- [ ] Rogue mode side barriers constrain player
- [ ] Rogue mode vertical scrolling works
- [ ] Rogue mode player stays at bottom of screen
- [ ] Starfield flows down in Rogue mode
- [ ] Starfield drifts randomly in Arcade/Test modes

---

## 💡 FINAL THOUGHTS

Your game has a **solid foundation** with good separation of concerns in many areas. The mode system works, but has grown organically without a unified architecture plan.

The two critical bugs (layer skipping and duplicate specials) are **quick fixes** (2-3 hours total). The config consolidation is a **larger refactor** but will pay dividends in maintainability.

I recommend:
1. **Fix bugs first** (Priority 1 & 2) - Get Rogue mode working correctly
2. **Add logging** (Priority 3) - Make debugging easier
3. **Plan refactor** (Long-term) - Schedule 2-3 days for clean-up when you have time

The game is playable and fun - these fixes will make it **more maintainable** and **easier to balance**.

---

**End of Review**
