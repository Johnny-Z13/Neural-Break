# 🏗️ MODE SYSTEM REFACTOR PLAN

**Date:** 2026-01-12  
**Status:** 📋 PLANNING PHASE  
**Goal:** Proper mode architecture with extensibility and maintainability

---

## 🎯 EXECUTIVE SUMMARY

### Current Problems
1. **Game.ts is 2,354 lines** - violates Single Responsibility Principle
2. **Configs scattered across 4 files** - hard to maintain, easy to create bugs
3. **Mixed mode logic** - Arcade/Rogue/Test logic intertwined in Game.ts
4. **Hard to add modes** - requires touching 6+ files
5. **No inheritance** - duplicate code between similar modes (Arcade/Test)

### Proposed Solution
1. **Mode Class Hierarchy** - Each mode is a self-contained class
2. **Unified Config System** - Single source of truth per mode
3. **Clean Game.ts** - Reduced to 300-400 lines (orchestrator only)
4. **Easy Mode Addition** - Create one class, one config, done
5. **Proper Inheritance** - TestMode extends ArcadeMode (DRY principle)

### Benefits
- ✅ Add new modes in 1-2 hours (vs 4-6 hours now)
- ✅ Easier testing (test modes in isolation)
- ✅ Clearer code ownership (each mode owns its logic)
- ✅ Reduced merge conflicts (changes isolated to mode files)
- ✅ Better maintainability (configs in one place)
- ✅ Type safety (mode-specific types enforced)

### Time Estimate
- **Phase 1 (Foundation):** 6-8 hours
- **Phase 2 (Migration):** 8-12 hours
- **Phase 3 (Testing):** 4-6 hours
- **Total:** 18-26 hours (2-3 days of work)

---

## 📐 ARCHITECTURE DESIGN

### Current Architecture (Problem)

```
Game.ts (2,354 lines)
├─ startNewGame() → Arcade initialization
├─ startRogueMode() → Rogue initialization
├─ startTestMode() → Test initialization
├─ update() → Contains if/else for each mode
├─ updateRogueMode() → Rogue-specific logic
├─ completeRogueLayer() → Rogue-specific logic
├─ spawnRogueWormholeExit() → Rogue-specific logic
└─ ... 50+ more methods mixing all modes

Config Files (scattered)
├─ GameModeManager.ts (173 lines)
├─ modes.config.ts (277 lines)
├─ LevelManager.ts (651 lines)
└─ game.config.ts (48 lines)
```

### Proposed Architecture (Solution)

```
src/
├─ core/
│  ├─ Game.ts (300-400 lines) ⬅️ ORCHESTRATOR ONLY
│  ├─ GameState.ts (existing)
│  └─ modes/
│     ├─ BaseGameMode.ts ⬅️ NEW: Abstract base class
│     ├─ ArcadeMode.ts ⬅️ NEW: Objective-based gameplay
│     ├─ RogueMode.ts ⬅️ NEW: Vertical ascent roguelite
│     ├─ TestMode.ts ⬅️ NEW: Extends ArcadeMode
│     └─ index.ts ⬅️ NEW: Exports all modes
│
├─ config/
│  ├─ game.config.ts (existing - mode-agnostic)
│  ├─ balance.config.ts (existing - mode-agnostic)
│  └─ modes/
│     ├─ types.ts ⬅️ NEW: Shared mode config types
│     ├─ arcade.config.ts ⬅️ NEW: ALL Arcade settings
│     ├─ rogue.config.ts ⬅️ NEW: ALL Rogue settings
│     ├─ test.config.ts ⬅️ NEW: ALL Test settings
│     └─ index.ts ⬅️ NEW: Exports unified configs
│
└─ (rest of project unchanged)
```

---

## 🏛️ CLASS HIERARCHY DESIGN

### Base Class: BaseGameMode (Abstract)

```typescript
// src/core/modes/BaseGameMode.ts
import * as THREE from 'three'
import { SceneManager } from '../../graphics/SceneManager'
import { InputManager } from '../InputManager'
import { Player } from '../../entities/Player'
import { EnemyManager } from '../EnemyManager'
import { WeaponSystem } from '../../weapons/WeaponSystem'
import { UIManager } from '../../ui/UIManager'
import { AudioManager } from '../../audio/AudioManager'
import { LevelManager } from '../LevelManager'
import { GameStats } from '../GameState'
import { ModeConfig } from '../../config/modes/types'

export interface GameModeDependencies {
  sceneManager: SceneManager
  inputManager: InputManager
  uiManager: UIManager
  audioManager: AudioManager
  levelManager: LevelManager
}

export abstract class BaseGameMode {
  // Dependencies (injected)
  protected sceneManager: SceneManager
  protected inputManager: InputManager
  protected uiManager: UIManager
  protected audioManager: AudioManager
  protected levelManager: LevelManager
  
  // Core game objects (owned by mode)
  protected player: Player
  protected enemyManager: EnemyManager
  protected weaponSystem: WeaponSystem
  protected powerUpManager: PowerUpManager
  protected medPackManager: MedPackManager
  protected speedUpManager: SpeedUpManager
  protected shieldManager: ShieldManager
  protected invulnerableManager: InvulnerableManager
  
  // State
  protected gameStats: GameStats
  protected combo: number = 0
  protected comboTimer: number = 0
  protected scoreMultiplier: number = 1
  protected isRunning: boolean = false
  
  // Config (loaded from config file)
  protected config: ModeConfig
  
  constructor(
    dependencies: GameModeDependencies,
    config: ModeConfig
  ) {
    this.sceneManager = dependencies.sceneManager
    this.inputManager = dependencies.inputManager
    this.uiManager = dependencies.uiManager
    this.audioManager = dependencies.audioManager
    this.levelManager = dependencies.levelManager
    this.config = config
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ABSTRACT METHODS - Must be implemented by each mode
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Initialize mode-specific systems
   */
  abstract initialize(): Promise<void>
  
  /**
   * Update mode-specific logic
   */
  abstract updateMode(deltaTime: number): void
  
  /**
   * Handle mode-specific progression (level complete, layer complete, etc.)
   */
  abstract handleProgression(): void
  
  /**
   * Get mode display name
   */
  abstract getModeName(): string
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SHARED METHODS - Common to all modes (with hooks for customization)
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Start the mode (called after initialize)
   */
  async start(): Promise<void> {
    console.log(`🎮 Starting ${this.getModeName()}...`)
    
    // Show HUD
    this.uiManager.setHUDVisibility(true)
    
    // Reset stats
    this.gameStats = this.createEmptyStats()
    this.combo = 0
    this.comboTimer = 0
    this.scoreMultiplier = 1
    
    // Start audio
    this.audioManager.startAmbientSoundscape()
    
    // Setup scene based on config
    this.setupScene()
    
    // Initialize player
    await this.initializePlayer()
    
    // Initialize weapon system
    this.initializeWeaponSystem()
    
    // Initialize enemy system
    this.initializeEnemySystem()
    
    // Initialize pickup systems
    this.initializePickupSystems()
    
    // Start level manager
    this.levelManager.startAtLevel(this.config.progression.startingLevel)
    
    // Mode-specific initialization
    await this.initialize()
    
    // Start running
    this.isRunning = true
    
    console.log(`✅ ${this.getModeName()} started`)
  }
  
  /**
   * Main update loop (called every frame)
   */
  update(deltaTime: number): void {
    if (!this.isRunning) return
    
    // Update level manager
    this.levelManager.update(deltaTime)
    
    // Update player
    this.player.update(deltaTime, this.inputManager)
    
    // Update weapon system
    this.weaponSystem.update(deltaTime)
    
    // Update enemy manager
    this.enemyManager.update(deltaTime)
    
    // Update pickup managers
    this.powerUpManager.update(deltaTime)
    this.medPackManager.update(deltaTime)
    this.speedUpManager.update(deltaTime)
    this.shieldManager.update(deltaTime)
    this.invulnerableManager.update(deltaTime)
    
    // Update combo timer
    this.updateComboTimer(deltaTime)
    
    // Mode-specific update
    this.updateMode(deltaTime)
    
    // Check progression
    if (this.shouldCheckProgression()) {
      this.handleProgression()
    }
    
    // Check game over
    if (this.player.getHealth() <= 0) {
      this.handleGameOver()
    }
  }
  
  /**
   * Cleanup mode (called when switching modes or game over)
   */
  cleanup(): void {
    console.log(`🧹 Cleaning up ${this.getModeName()}...`)
    
    this.isRunning = false
    
    // Cleanup player
    if (this.player) {
      this.player.cleanupFragments()
      this.sceneManager.removeFromScene(this.player.getMesh())
    }
    
    // Cleanup enemies
    if (this.enemyManager?.cleanup) {
      this.enemyManager.cleanup()
    }
    
    // Cleanup pickups
    if (this.powerUpManager?.cleanup) this.powerUpManager.cleanup()
    if (this.medPackManager?.cleanup) this.medPackManager.cleanup()
    if (this.speedUpManager?.cleanup) this.speedUpManager.cleanup()
    if (this.shieldManager?.cleanup) this.shieldManager.cleanup()
    if (this.invulnerableManager?.reset) this.invulnerableManager.reset()
    
    // Cleanup weapons
    if (this.weaponSystem?.cleanup) {
      this.weaponSystem.cleanup()
    }
    
    console.log(`✅ ${this.getModeName()} cleaned up`)
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PROTECTED HELPER METHODS - Available to subclasses
  // ═══════════════════════════════════════════════════════════════════════════
  
  protected setupScene(): void {
    // Apply config-based scene settings
    this.sceneManager.setEnergyBarrierVisible(this.config.playArea.boundary.type === 'circular')
    this.sceneManager.setStarfieldDownwardFlow(this.config.visuals.starfieldFlowsDown)
    
    // Setup side barriers if needed
    if (this.config.playArea.boundary.type === 'corridor') {
      this.setupSideBarriers()
    }
  }
  
  protected setupSideBarriers(): void {
    // Implementation for side barriers
    // (extract from current Game.ts)
  }
  
  protected async initializePlayer(): Promise<void> {
    this.player = new Player()
    this.player.initialize(this.audioManager)
    
    // Set callbacks
    this.player.setShieldCallbacks(
      () => this.uiManager.showShieldActivated(),
      () => this.uiManager.showShieldDeactivated()
    )
    this.player.setInvulnerableCallbacks(
      () => this.uiManager.showInvulnerableActivated(),
      () => this.uiManager.showInvulnerableDeactivated()
    )
    
    // Add to scene
    this.sceneManager.addToScene(this.player.getMesh())
    
    // Setup camera
    this.setupCamera()
  }
  
  protected setupCamera(): void {
    const playerPos = this.player.getPosition()
    const cameraOffset = this.config.camera.verticalOffset
    const cameraTargetY = playerPos.y + cameraOffset
    this.sceneManager.setCameraTarget(new THREE.Vector3(playerPos.x, cameraTargetY, 0))
  }
  
  protected initializeWeaponSystem(): void {
    this.weaponSystem = new WeaponSystem()
    this.weaponSystem.initialize(this.player, this.sceneManager, this.audioManager)
    
    const effectsSystem = this.sceneManager.getEffectsSystem()
    this.weaponSystem.setEffectsSystem(effectsSystem)
    this.player.setEffectsSystem(effectsSystem)
  }
  
  protected initializeEnemySystem(): void {
    this.enemyManager = new EnemyManager()
    this.enemyManager.initialize(this.sceneManager, this.player)
    this.enemyManager.setLevelManager(this.levelManager)
    this.enemyManager.setEffectsSystem(this.sceneManager.getEffectsSystem())
    this.enemyManager.setAudioManager(this.audioManager)
    
    // Set spawn mode based on config
    if (this.config.spawning.enemyMode === 'vertical') {
      this.enemyManager.setRogueMode(true)
    }
  }
  
  protected initializePickupSystems(): void {
    // PowerUp manager
    this.powerUpManager = new PowerUpManager()
    this.powerUpManager.initialize(this.sceneManager, this.player)
    this.powerUpManager.setLevelManager(this.levelManager)
    this.powerUpManager.setEffectsSystem(this.sceneManager.getEffectsSystem())
    
    // MedPack manager
    this.medPackManager = new MedPackManager()
    this.medPackManager.initialize(this.sceneManager, this.player)
    this.medPackManager.setLevelManager(this.levelManager)
    this.medPackManager.setEffectsSystem(this.sceneManager.getEffectsSystem())
    
    // SpeedUp manager
    this.speedUpManager = new SpeedUpManager()
    this.speedUpManager.initialize(this.sceneManager, this.player)
    this.speedUpManager.setLevelManager(this.levelManager)
    this.speedUpManager.setEffectsSystem(this.sceneManager.getEffectsSystem())
    
    // Shield manager
    this.shieldManager = new ShieldManager()
    this.shieldManager.initialize(this.sceneManager, this.player)
    this.shieldManager.setLevelManager(this.levelManager)
    this.shieldManager.setEffectsSystem(this.sceneManager.getEffectsSystem())
    
    // Invulnerable manager
    this.invulnerableManager = new InvulnerableManager()
    this.invulnerableManager.setSceneManager(this.sceneManager)
    this.invulnerableManager.setPlayer(this.player)
  }
  
  protected updateComboTimer(deltaTime: number): void {
    this.comboTimer -= deltaTime
    if (this.comboTimer <= 0) {
      this.combo = 0
    }
  }
  
  protected shouldCheckProgression(): boolean {
    // Override in subclasses if needed
    return this.levelManager.checkObjectivesComplete()
  }
  
  protected handleGameOver(): void {
    this.isRunning = false
    this.uiManager.setHUDVisibility(false)
    // Game.ts will handle showing game over screen
  }
  
  protected createEmptyStats(): GameStats {
    return {
      score: 0,
      survivedTime: 0,
      level: 1,
      enemiesKilled: 0,
      dataMinersKilled: 0,
      scanDronesKilled: 0,
      chaosWormsKilled: 0,
      voidSpheresKilled: 0,
      crystalSwarmsKilled: 0,
      fizzersKilled: 0,
      ufosKilled: 0,
      bossesKilled: 0,
      damageTaken: 0,
      totalXP: 0,
      highestCombo: 0,
      highestMultiplier: 1
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GETTERS - Expose state to Game.ts
  // ═══════════════════════════════════════════════════════════════════════════
  
  getPlayer(): Player { return this.player }
  getGameStats(): GameStats { return this.gameStats }
  getCombo(): number { return this.combo }
  getMultiplier(): number { return this.scoreMultiplier }
  isPlayerAlive(): boolean { return this.player.getHealth() > 0 }
  getConfig(): ModeConfig { return this.config }
}
```

---

### Concrete Class: ArcadeMode

```typescript
// src/core/modes/ArcadeMode.ts
import { BaseGameMode } from './BaseGameMode'
import { GameStateType } from '../GameState'

export class ArcadeMode extends BaseGameMode {
  // Arcade-specific state
  private isLevelTransitioning: boolean = false
  private transitionTimer: number = 0
  
  async initialize(): Promise<void> {
    console.log('🕹️ Initializing Arcade Mode...')
    
    // Arcade mode has circular boundary
    this.sceneManager.setEnergyBarrierVisible(true)
    
    // No special initialization needed - base class handles it
    
    console.log('✅ Arcade Mode initialized')
  }
  
  updateMode(deltaTime: number): void {
    // Arcade mode specific updates
    
    // Update level transition if active
    if (this.isLevelTransitioning) {
      this.updateLevelTransition(deltaTime)
    }
  }
  
  handleProgression(): void {
    if (this.isLevelTransitioning) return
    
    console.log('🎯 Level objectives complete! Starting transition...')
    this.startLevelTransition()
  }
  
  getModeName(): string {
    return 'ARCADE MODE'
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ARCADE-SPECIFIC METHODS
  // ═══════════════════════════════════════════════════════════════════════════
  
  private startLevelTransition(): void {
    this.isLevelTransitioning = true
    this.transitionTimer = 0
    
    // Play level complete sound
    this.audioManager.playLevelCompleteSound()
    
    // Screen shake
    this.sceneManager.addScreenShake(1.0, 0.5)
    
    // Clear all enemies with death animations
    this.clearAllEnemies()
    
    // Stop spawning
    this.enemyManager.pauseSpawning()
    
    // Show level complete notification
    setTimeout(() => {
      this.uiManager.showLevelCompleteNotification()
    }, 1000)
  }
  
  private updateLevelTransition(deltaTime: number): void {
    this.transitionTimer += deltaTime
    
    // After 3 seconds, advance level
    if (this.transitionTimer >= 3.0) {
      this.completeTransition()
    }
  }
  
  private completeTransition(): void {
    this.isLevelTransitioning = false
    
    // Check if game is complete
    if (this.levelManager.isGameComplete()) {
      console.log('🎉 ALL LEVELS COMPLETE!')
      this.handleGameOver()
      return
    }
    
    // Advance level
    this.levelManager.advanceLevel()
    
    // Resume spawning
    this.enemyManager.resumeSpawning()
  }
  
  private clearAllEnemies(): void {
    // Staggered death animations
    const enemies = this.enemyManager.getEnemies()
    enemies.forEach((enemy) => {
      const randomDelay = Math.random() * 1000
      setTimeout(() => {
        if (enemy.isAlive()) {
          enemy.takeDamage(999999)
        }
      }, randomDelay)
    })
  }
}
```

---

### Concrete Class: RogueMode

```typescript
// src/core/modes/RogueMode.ts
import * as THREE from 'three'
import { BaseGameMode } from './BaseGameMode'
import { WormholeExit } from '../../graphics/WormholeExit'
import { RogueSideBarriers } from '../../graphics/RogueSideBarriers'
import { RogueChoiceScreen } from '../../ui/screens/RogueChoiceScreen'
import { RogueSpecial } from '../RogueSpecial'

export class RogueMode extends BaseGameMode {
  // Rogue-specific state
  private currentLayer: number = 1
  private layersCompleted: number = 0
  private selectedSpecialIds: Set<string> = new Set()
  
  // Rogue-specific objects
  private wormholeExit: WormholeExit | null = null
  private sideBarriers: RogueSideBarriers | null = null
  
  // Wormhole animation state
  private isWormholeEntryAnimating: boolean = false
  private wormholeEntryTime: number = 0
  private wormholeEntryDuration: number = 1.5
  private wormholeEntryStartPos: THREE.Vector3 | null = null
  private wormholeEntryStartRotation: number = 0
  
  async initialize(): Promise<void> {
    console.log('🎲 Initializing Rogue Mode...')
    
    // Reset layer tracking
    this.currentLayer = 1
    this.layersCompleted = 0
    this.selectedSpecialIds.clear()
    
    // Setup side barriers
    this.setupRogueSideBarriers()
    
    // Spawn wormhole exit
    this.spawnWormholeExit()
    
    // Enable Rogue mode on player
    this.player.setRogueMode(true)
    
    // Enable vertical spawning for pickups
    const barrierWidth = this.calculateBarrierWidth()
    this.powerUpManager.setRogueMode(true, barrierWidth)
    this.medPackManager.setRogueMode(true, barrierWidth)
    this.speedUpManager.setRogueMode(true, barrierWidth)
    this.shieldManager.setRogueMode(true, barrierWidth)
    this.invulnerableManager.setRogueMode(true, barrierWidth)
    
    console.log(`✅ Rogue Mode initialized - Layer ${this.currentLayer}`)
  }
  
  updateMode(deltaTime: number): void {
    // Update wormhole entry animation
    if (this.isWormholeEntryAnimating) {
      this.updateWormholeEntryAnimation(deltaTime)
      return // Don't update other things during animation
    }
    
    // Update vertical scrolling
    this.updateVerticalScroll(deltaTime)
    
    // Update wormhole
    if (this.wormholeExit) {
      this.wormholeExit.update(deltaTime)
      this.checkWormholeCollision()
    }
    
    // Update side barriers
    if (this.sideBarriers) {
      const camera = this.sceneManager.getCamera()
      this.sideBarriers.update(deltaTime, camera.position.y)
      this.constrainPlayerToBoundaries()
    }
  }
  
  handleProgression(): void {
    // Rogue mode doesn't use objectives - only wormhole exit
    // This is handled in checkWormholeCollision()
  }
  
  protected shouldCheckProgression(): boolean {
    // Rogue mode uses wormhole, not objectives
    return false
  }
  
  getModeName(): string {
    return 'ROGUE MODE'
  }
  
  getCurrentLayer(): number {
    return this.currentLayer
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ROGUE-SPECIFIC METHODS
  // ═══════════════════════════════════════════════════════════════════════════
  
  private setupRogueSideBarriers(): void {
    const barrierWidth = this.calculateBarrierWidth()
    this.sideBarriers = new RogueSideBarriers(barrierWidth)
    this.sceneManager.addToScene(this.sideBarriers.getLeftWall())
    this.sceneManager.addToScene(this.sideBarriers.getRightWall())
  }
  
  private calculateBarrierWidth(): number {
    const aspect = window.innerWidth / window.innerHeight
    const frustumSize = 30
    const screenWidth = frustumSize * aspect
    return screenWidth * this.config.playArea.boundary.widthMultiplier!
  }
  
  private spawnWormholeExit(): void {
    // Clean up existing
    if (this.wormholeExit) {
      this.sceneManager.removeFromScene(this.wormholeExit.getMesh())
      this.wormholeExit.destroy()
    }
    
    // Create new wormhole
    this.wormholeExit = new WormholeExit()
    const playerPos = this.player.getPosition()
    const exitDistance = this.config.progression.wormholeDistance!
    this.wormholeExit.setPosition(playerPos.x, playerPos.y + exitDistance, 0)
    this.sceneManager.addToScene(this.wormholeExit.getMesh())
    
    console.log(`🌀 Wormhole exit spawned at Y=${playerPos.y + exitDistance}`)
  }
  
  private updateVerticalScroll(deltaTime: number): void {
    // Camera scrolls upward continuously
    const scrollSpeed = this.config.camera.scrollSpeed!
    const camera = this.sceneManager.getCamera()
    const playerPos = this.player.getPosition()
    const cameraOffset = this.config.camera.verticalOffset
    
    const targetCameraY = playerPos.y + cameraOffset
    const minScrollY = scrollSpeed * this.levelManager.getTotalElapsedTime()
    const newCameraY = Math.max(targetCameraY, minScrollY)
    camera.position.y = newCameraY
    
    // Update camera target
    this.sceneManager.setCameraTarget(new THREE.Vector3(playerPos.x, playerPos.y + cameraOffset, 0))
    
    // Keep player from falling behind
    const visibleBottom = camera.position.y - cameraOffset - 3
    if (playerPos.y < visibleBottom) {
      const pushAmount = (visibleBottom - playerPos.y) * 0.15
      this.player.getMesh().position.y = playerPos.y + pushAmount
    }
  }
  
  private checkWormholeCollision(): void {
    if (!this.wormholeExit || this.isWormholeEntryAnimating) return
    
    const playerPos = this.player.getPosition()
    if (this.wormholeExit.containsPoint(playerPos)) {
      console.log('🌀 Player entered wormhole! Starting entry animation...')
      this.startWormholeEntryAnimation()
    }
  }
  
  private startWormholeEntryAnimation(): void {
    this.isWormholeEntryAnimating = true
    this.wormholeEntryTime = 0
    this.wormholeEntryStartPos = this.player.getPosition().clone()
    this.wormholeEntryStartRotation = this.player.getMesh().rotation.z
    
    // Play sound
    this.audioManager.playWormholeEntrySound()
  }
  
  private updateWormholeEntryAnimation(deltaTime: number): void {
    if (!this.wormholeExit) return
    
    this.wormholeEntryTime += deltaTime
    const progress = Math.min(this.wormholeEntryTime / this.wormholeEntryDuration, 1.0)
    const easeProgress = 1 - Math.pow(1 - progress, 3)
    
    // Move toward wormhole center
    const wormholePos = this.wormholeExit.getPosition()
    if (this.wormholeEntryStartPos) {
      const currentPos = this.player.getPosition()
      currentPos.x = THREE.MathUtils.lerp(this.wormholeEntryStartPos.x, wormholePos.x, easeProgress)
      currentPos.y = THREE.MathUtils.lerp(this.wormholeEntryStartPos.y, wormholePos.y, easeProgress)
      this.player.getMesh().position.copy(currentPos)
    }
    
    // Rotate (spiral effect)
    const rotationSpeed = 8
    this.player.getMesh().rotation.z = this.wormholeEntryStartRotation + (progress * rotationSpeed * Math.PI * 2)
    
    // Scale down
    const scale = 1.0 - (easeProgress * 0.7)
    this.player.getMesh().scale.set(scale, scale, scale)
    
    // Animation complete
    if (progress >= 1.0) {
      this.isWormholeEntryAnimating = false
      this.completeLayer()
    }
  }
  
  private completeLayer(): void {
    this.layersCompleted++
    
    console.log('═════════════════════════════════════')
    console.log(`🎲 LAYER ${this.currentLayer} COMPLETE`)
    console.log(`   Layers Completed: ${this.layersCompleted}`)
    console.log(`   Next Layer: ${this.currentLayer + 1}`)
    console.log('═════════════════════════════════════')
    
    // Clear enemies
    this.clearAllEnemies()
    
    // Wait for death animations, then show choice
    setTimeout(() => {
      this.showSpecialChoiceScreen()
    }, 2000)
  }
  
  private showSpecialChoiceScreen(): void {
    // Pause mode
    this.isRunning = false
    
    // Pause spawning
    this.enemyManager.pauseSpawning()
    
    // Create choice screen
    const choiceScreen = RogueChoiceScreen.create(
      this.audioManager,
      this.selectedSpecialIds,
      (special: RogueSpecial) => {
        this.applySpecial(special)
        this.continueToNextLayer()
      }
    )
    
    document.body.appendChild(choiceScreen)
  }
  
  private applySpecial(special: RogueSpecial): void {
    // Track selection
    this.selectedSpecialIds.add(special.id)
    console.log(`✅ Selected special: ${special.id} (${special.name})`)
    
    // Apply mutations
    if (special.statModifier) {
      if (special.statModifier.movementSpeed) {
        this.player.applyRogueStatMutation({ movementSpeed: special.statModifier.movementSpeed })
      }
      if (special.statModifier.shieldCapacity) {
        this.player.applyRogueStatMutation({ shieldCapacity: special.statModifier.shieldCapacity })
      }
      if (special.statModifier.fireRate) {
        this.weaponSystem.applyRogueStatMutation({ fireRate: special.statModifier.fireRate })
      }
      if (special.statModifier.projectileSpeed) {
        this.weaponSystem.applyRogueStatMutation({ projectileSpeed: special.statModifier.projectileSpeed })
      }
      if (special.statModifier.heatDecay) {
        this.weaponSystem.applyRogueStatMutation({ heatDecay: special.statModifier.heatDecay })
      }
    }
    
    if (special.firingMode) {
      this.weaponSystem.applyRogueFiringMode(special.firingMode)
    }
  }
  
  private continueToNextLayer(): void {
    // Remove choice screen
    const choiceScreen = document.getElementById('rogueChoiceScreen')
    if (choiceScreen) {
      choiceScreen.remove()
    }
    RogueChoiceScreen.cleanup()
    
    // Advance layer
    this.currentLayer++
    
    console.log('═════════════════════════════════════')
    console.log(`🚀 STARTING LAYER ${this.currentLayer}`)
    console.log(`   Total Layers Completed: ${this.layersCompleted}`)
    console.log('═════════════════════════════════════')
    
    // Show layer notification
    this.uiManager.showRogueLayerNotification(this.currentLayer)
    
    // Reset objectives (stay at level 998)
    this.levelManager.resetObjectives()
    
    // Clear everything
    this.enemyManager.clearAllEnemies()
    this.weaponSystem.clearAllProjectiles()
    
    // Reset player appearance
    this.player.getMesh().scale.set(1, 1, 1)
    this.player.getMesh().rotation.z = 0
    
    // Spawn new wormhole
    this.spawnWormholeExit()
    
    // Resume spawning
    this.enemyManager.resumeSpawning()
    
    // Resume mode
    this.isRunning = true
  }
  
  private constrainPlayerToBoundaries(): void {
    if (!this.sideBarriers) return
    
    const playerPos = this.player.getPosition()
    const playerRadius = this.player.getRadius()
    const boundaryCheck = this.sideBarriers.isOutOfBounds(playerPos, playerRadius)
    
    if (boundaryCheck.isOut) {
      const clampedPos = this.sideBarriers.clampPosition(playerPos, playerRadius)
      this.player.getMesh().position.x = clampedPos.x
    }
  }
  
  private clearAllEnemies(): void {
    const enemies = this.enemyManager.getEnemies()
    const effectsSystem = this.sceneManager.getEffectsSystem()
    
    enemies.forEach((enemy) => {
      const randomDelay = Math.random() * 1000
      setTimeout(() => {
        if (enemy.isAlive()) {
          enemy.takeDamage(999999)
          effectsSystem.createExplosion(
            enemy.getPosition(),
            2.0,
            new THREE.Color(0, 1, 1) // Cyan glow
          )
        }
      }, randomDelay)
    })
  }
  
  cleanup(): void {
    // Cleanup Rogue-specific objects
    if (this.wormholeExit) {
      this.sceneManager.removeFromScene(this.wormholeExit.getMesh())
      this.wormholeExit.destroy()
      this.wormholeExit = null
    }
    
    if (this.sideBarriers) {
      this.sceneManager.removeFromScene(this.sideBarriers.getLeftWall())
      this.sceneManager.removeFromScene(this.sideBarriers.getRightWall())
      this.sideBarriers = null
    }
    
    // Call base cleanup
    super.cleanup()
  }
}
```

---

### Concrete Class: TestMode (Inherits from Arcade)

```typescript
// src/core/modes/TestMode.ts
import { ArcadeMode } from './ArcadeMode'

export class TestMode extends ArcadeMode {
  async initialize(): Promise<void> {
    console.log('🧪 Initializing Test Mode...')
    
    // Call parent initialization
    await super.initialize()
    
    // Enable test mode (invincibility)
    this.player.setTestMode(true)
    
    console.log('✅ Test Mode initialized (invincibility enabled)')
  }
  
  getModeName(): string {
    return 'TEST MODE'
  }
}
```

---

## 📦 UNIFIED CONFIG SYSTEM

### Config Types (Shared)

```typescript
// src/config/modes/types.ts

export interface ModeConfig {
  // Identity
  id: string
  name: string
  description: string
  
  // Progression
  progression: {
    type: 'objectives' | 'wormhole' | 'endless'
    startingLevel: number
    levelLabel: string
    wormholeDistance?: number
    hasSpecialChoices?: boolean
  }
  
  // Play Area
  playArea: {
    type: 'radial' | 'vertical'
    boundary: {
      type: 'circular' | 'corridor'
      radius?: number           // For circular
      widthMultiplier?: number  // For corridor (0.0-1.0)
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
    enemyMode: 'circular' | 'vertical' | 'custom'
    pickupMode: 'circular' | 'vertical' | 'custom'
    
    // Circular spawning config
    enemySpawnRadius?: number
    pickupSpawnRadius?: number
    
    // Vertical spawning config
    enemySpawnHeightMin?: number
    enemySpawnHeightVariance?: number
    enemyHorizontalSpread?: number
    pickupSpawnHeightMin?: number
    pickupSpawnHeightMax?: number
  }
  
  // Enemies (level config)
  enemies: {
    objectives: {
      dataMites: number
      scanDrones: number
      chaosWorms: number
      voidSpheres: number
      crystalSwarms: number
      fizzers: number
      ufos: number
      bosses: number
    }
    spawnRates: {
      miteSpawnRate: number
      droneSpawnRate: number
      wormSpawnRate: number
      voidSpawnRate: number
      crystalSpawnRate: number
      fizzerSpawnRate: number
      ufoSpawnRate: number
      bossSpawnRate: number
    }
  }
  
  // Special features
  features: {
    playerInvincible?: boolean
  }
}
```

### Arcade Config

```typescript
// src/config/modes/arcade.config.ts
import { ModeConfig } from './types'

export const ARCADE_CONFIG: ModeConfig = {
  id: 'arcade',
  name: 'ARCADE MODE',
  description: 'Classic objective-based gameplay with level progression',
  
  progression: {
    type: 'objectives',
    startingLevel: 1,
    levelLabel: 'Level'
  },
  
  playArea: {
    type: 'radial',
    boundary: {
      type: 'circular',
      radius: 29.5
    }
  },
  
  camera: {
    verticalOffset: 0,
    followSmoothing: 5.0
  },
  
  visuals: {
    starfieldFlowsDown: false,
    showCircularBoundary: true,
    showSideBarriers: false,
    showWormholeExit: false,
    backgroundColor: '#000011'
  },
  
  spawning: {
    enemyMode: 'circular',
    pickupMode: 'circular',
    enemySpawnRadius: 31.5,
    pickupSpawnRadius: 28
  },
  
  enemies: {
    objectives: {
      dataMites: 25,
      scanDrones: 8,
      chaosWorms: 0,
      voidSpheres: 0,
      crystalSwarms: 0,
      fizzers: 0,
      ufos: 0,
      bosses: 0
    },
    spawnRates: {
      miteSpawnRate: 1.6,
      droneSpawnRate: 10,
      wormSpawnRate: Infinity,
      voidSpawnRate: Infinity,
      crystalSpawnRate: Infinity,
      fizzerSpawnRate: Infinity,
      ufoSpawnRate: Infinity,
      bossSpawnRate: Infinity
    }
  },
  
  features: {}
}
```

### Rogue Config

```typescript
// src/config/modes/rogue.config.ts
import { ModeConfig } from './types'

export const ROGUE_CONFIG: ModeConfig = {
  id: 'rogue',
  name: 'ROGUE MODE',
  description: 'Vertical ascent roguelite with power-up choices',
  
  progression: {
    type: 'wormhole',
    startingLevel: 998,
    levelLabel: 'Layer',
    wormholeDistance: 180,
    hasSpecialChoices: true
  },
  
  playArea: {
    type: 'vertical',
    boundary: {
      type: 'corridor',
      widthMultiplier: 0.8
    }
  },
  
  camera: {
    verticalOffset: 12,
    followSmoothing: 8.0,
    scrollSpeed: 3.0
  },
  
  visuals: {
    starfieldFlowsDown: true,
    showCircularBoundary: false,
    showSideBarriers: true,
    showWormholeExit: true,
    backgroundColor: '#000008'
  },
  
  spawning: {
    enemyMode: 'vertical',
    pickupMode: 'vertical',
    enemySpawnHeightMin: 20,
    enemySpawnHeightVariance: 5,
    enemyHorizontalSpread: 20,
    pickupSpawnHeightMin: 8,
    pickupSpawnHeightMax: 18
  },
  
  enemies: {
    objectives: {
      dataMites: 99999,
      scanDrones: 99999,
      chaosWorms: 99999,
      voidSpheres: 99999,
      crystalSwarms: 99999,
      fizzers: 99999,
      ufos: 99999,
      bosses: 99999
    },
    spawnRates: {
      miteSpawnRate: 1.2,
      droneSpawnRate: 6.0,
      wormSpawnRate: 40.0,
      voidSpawnRate: 50.0,
      crystalSpawnRate: 45.0,
      fizzerSpawnRate: 18.0,
      ufoSpawnRate: 60.0,
      bossSpawnRate: Infinity
    }
  },
  
  features: {}
}
```

### Test Config

```typescript
// src/config/modes/test.config.ts
import { ModeConfig } from './types'
import { ARCADE_CONFIG } from './arcade.config'

// Test mode is identical to Arcade except invincibility
export const TEST_CONFIG: ModeConfig = {
  ...ARCADE_CONFIG,
  id: 'test',
  name: 'TEST MODE',
  description: 'Development mode with unlimited health',
  progression: {
    ...ARCADE_CONFIG.progression,
    startingLevel: 999
  },
  features: {
    playerInvincible: true
  }
}
```

### Config Index

```typescript
// src/config/modes/index.ts
import { GameMode } from '../../core/GameState'
import { ModeConfig } from './types'
import { ARCADE_CONFIG } from './arcade.config'
import { ROGUE_CONFIG } from './rogue.config'
import { TEST_CONFIG } from './test.config'

// Single source of truth for all mode configurations
export const MODE_CONFIGS: Record<GameMode, ModeConfig> = {
  [GameMode.ORIGINAL]: ARCADE_CONFIG,
  [GameMode.ROGUE]: ROGUE_CONFIG,
  [GameMode.TEST]: TEST_CONFIG
}

// Convenience getter
export function getModeConfig(mode: GameMode): ModeConfig {
  return MODE_CONFIGS[mode]
}

// Export types and configs
export * from './types'
export { ARCADE_CONFIG, ROGUE_CONFIG, TEST_CONFIG }
```

---

## 🎮 SIMPLIFIED GAME.TS

```typescript
// src/core/Game.ts (AFTER REFACTOR - ~400 lines)
import { SceneManager } from '../graphics/SceneManager'
import { InputManager } from './InputManager'
import { UIManager } from '../ui/UIManager'
import { AudioManager } from '../audio/AudioManager'
import { LevelManager } from './LevelManager'
import { GameMode, GameStateType } from './GameState'
import { GameScreens } from '../ui/GameScreens'
import { BaseGameMode, GameModeDependencies } from './modes/BaseGameMode'
import { ArcadeMode } from './modes/ArcadeMode'
import { RogueMode } from './modes/RogueMode'
import { TestMode } from './modes/TestMode'
import { getModeConfig } from '../config/modes'

export class Game {
  // Core systems (shared across all modes)
  private sceneManager: SceneManager
  private inputManager: InputManager
  private uiManager: UIManager
  private audioManager: AudioManager
  private levelManager: LevelManager
  
  // Current mode instance
  private currentMode: BaseGameMode | null = null
  private gameState: GameStateType = GameStateType.START_SCREEN
  
  // Animation frame tracking
  private isRunning: boolean = false
  private lastTime: number = 0
  private animationFrameId: number | null = null
  
  constructor() {
    // Initialize core systems
    this.sceneManager = new SceneManager()
    this.inputManager = new InputManager()
    this.uiManager = new UIManager()
    this.audioManager = new AudioManager()
    this.levelManager = new LevelManager()
    
    // Connect audio manager to UI
    GameScreens.setAudioManager(this.audioManager)
    GameScreens.setSceneManager(this.sceneManager)
  }
  
  async initialize(): Promise<void> {
    console.log('🎮 Game initialization started...')
    
    // Show loading screen
    const loadingElement = document.getElementById('loading')
    if (loadingElement) {
      loadingElement.style.display = 'block'
    }
    
    // Initialize core systems
    await this.sceneManager.initialize()
    this.inputManager.initialize()
    this.uiManager.initialize()
    this.audioManager.initialize()
    
    // Setup audio resume on user gesture
    const resumeAudioOnce = () => {
      this.audioManager.resumeAudio().catch(() => {})
      document.removeEventListener('click', resumeAudioOnce)
      document.removeEventListener('keydown', resumeAudioOnce)
      document.removeEventListener('touchstart', resumeAudioOnce)
    }
    document.addEventListener('click', resumeAudioOnce)
    document.addEventListener('keydown', resumeAudioOnce)
    document.addEventListener('touchstart', resumeAudioOnce)
    
    // Hide loading screen
    if (loadingElement) {
      loadingElement.style.display = 'none'
    }
    
    // Hide HUD initially
    this.uiManager.setHUDVisibility(false)
    
    // Show start screen
    await this.showStartScreen()
    
    // Start render loop
    this.start()
    
    console.log('✅ Game initialization complete')
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // MODE LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════
  
  private async startMode(modeType: GameMode): Promise<void> {
    console.log(`🎮 Starting ${modeType} mode...`)
    
    // Cleanup current mode
    if (this.currentMode) {
      this.currentMode.cleanup()
      this.currentMode = null
    }
    
    // Small delay for cleanup
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Get config for mode
    const config = getModeConfig(modeType)
    
    // Create dependencies object
    const dependencies: GameModeDependencies = {
      sceneManager: this.sceneManager,
      inputManager: this.inputManager,
      uiManager: this.uiManager,
      audioManager: this.audioManager,
      levelManager: this.levelManager
    }
    
    // Create mode instance
    switch (modeType) {
      case GameMode.ORIGINAL:
        this.currentMode = new ArcadeMode(dependencies, config)
        break
      case GameMode.ROGUE:
        this.currentMode = new RogueMode(dependencies, config)
        break
      case GameMode.TEST:
        this.currentMode = new TestMode(dependencies, config)
        break
      default:
        throw new Error(`Unknown game mode: ${modeType}`)
    }
    
    // Start the mode
    this.gameState = GameStateType.PLAYING
    await this.currentMode.start()
    
    console.log(`✅ ${modeType} mode started`)
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GAME LOOP
  // ═══════════════════════════════════════════════════════════════════════════
  
  start(): void {
    if (this.isRunning) return
    
    this.isRunning = true
    this.lastTime = performance.now()
    this.gameLoop()
  }
  
  stop(): void {
    this.isRunning = false
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }
  
  private gameLoop = (): void => {
    if (!this.isRunning) return
    
    const currentTime = performance.now()
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1) // Cap at 100ms
    this.lastTime = currentTime
    
    // Update current mode
    if (this.gameState === GameStateType.PLAYING && this.currentMode) {
      this.currentMode.update(deltaTime)
      
      // Check for game over
      if (!this.currentMode.isPlayerAlive()) {
        this.handleGameOver()
      }
    }
    
    // Render scene
    this.sceneManager.render()
    
    // Request next frame
    this.animationFrameId = requestAnimationFrame(this.gameLoop)
  }
  
  private render(): void {
    this.sceneManager.render()
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SCREENS
  // ═══════════════════════════════════════════════════════════════════════════
  
  private async showStartScreen(): Promise<void> {
    this.gameState = GameStateType.START_SCREEN
    
    await GameScreens.showStartScreen(
      () => this.startMode(GameMode.ORIGINAL),
      () => this.startMode(GameMode.ROGUE),
      () => this.startMode(GameMode.TEST),
      this.audioManager
    )
  }
  
  private handleGameOver(): void {
    this.gameState = GameStateType.GAME_OVER
    
    if (!this.currentMode) return
    
    const stats = this.currentMode.getGameStats()
    
    // Hide HUD
    this.uiManager.setHUDVisibility(false)
    
    // Show game over screen
    GameScreens.showGameOverScreen(stats, () => this.showStartScreen()).catch(err => {
      console.error('Error showing game over screen:', err)
    })
  }
}

// Create and start game
const game = new Game()
game.initialize().catch(err => {
  console.error('Failed to initialize game:', err)
})
```

---

## 📅 IMPLEMENTATION ROADMAP

### Phase 1: Foundation (6-8 hours)

**Goal:** Create new architecture without breaking existing code

#### Step 1.1: Create Config System (2-3 hours)
- [ ] Create `src/config/modes/` directory
- [ ] Create `types.ts` with `ModeConfig` interface
- [ ] Create `arcade.config.ts` with full Arcade config
- [ ] Create `rogue.config.ts` with full Rogue config
- [ ] Create `test.config.ts` with full Test config
- [ ] Create `index.ts` to export unified configs
- [ ] **Test:** Import and log configs - verify structure

#### Step 1.2: Create Base Mode Class (2-3 hours)
- [ ] Create `src/core/modes/` directory
- [ ] Create `BaseGameMode.ts` with abstract base class
- [ ] Implement shared initialization logic
- [ ] Implement shared update loop structure
- [ ] Implement shared cleanup logic
- [ ] **Test:** Compile - no errors

#### Step 1.3: Create Mode Implementations (2 hours)
- [ ] Create `ArcadeMode.ts` extending `BaseGameMode`
- [ ] Create `RogueMode.ts` extending `BaseGameMode`
- [ ] Create `TestMode.ts` extending `ArcadeMode`
- [ ] Create `index.ts` to export all modes
- [ ] **Test:** Compile - no errors

---

### Phase 2: Migration (8-12 hours)

**Goal:** Move logic from Game.ts to mode classes

#### Step 2.1: Extract Arcade Logic (3-4 hours)
- [ ] Copy Arcade initialization from `Game.ts` → `ArcadeMode.initialize()`
- [ ] Copy level transition logic → `ArcadeMode.handleProgression()`
- [ ] Copy Arcade update logic → `ArcadeMode.updateMode()`
- [ ] **Test:** Run Arcade mode side-by-side with old code

#### Step 2.2: Extract Rogue Logic (4-5 hours)
- [ ] Copy Rogue initialization from `Game.ts` → `RogueMode.initialize()`
- [ ] Copy wormhole logic → `RogueMode` methods
- [ ] Copy layer progression logic → `RogueMode.completeLayer()`
- [ ] Copy special selection logic → `RogueMode.showSpecialChoiceScreen()`
- [ ] **Test:** Run Rogue mode side-by-side with old code

#### Step 2.3: Extract Test Logic (1 hour)
- [ ] Implement `TestMode.initialize()` (just adds invincibility)
- [ ] **Test:** Run Test mode side-by-side with old code

#### Step 2.4: Update Game.ts (2 hours)
- [ ] Replace mode switch logic with mode instance creation
- [ ] Update game loop to delegate to mode
- [ ] Remove old mode-specific methods
- [ ] **Test:** All 3 modes work through new system

---

### Phase 3: Testing & Polish (4-6 hours)

**Goal:** Ensure everything works perfectly

#### Step 3.1: Functional Testing (2-3 hours)
- [ ] Test Arcade mode: Levels 1-10, game over, return to menu
- [ ] Test Rogue mode: 5+ layers, special selection, no duplicates
- [ ] Test Test mode: Invincibility, return to menu
- [ ] Test mode switching: Arcade→Menu→Rogue→Menu→Test
- [ ] **Result:** All modes work identically to before refactor

#### Step 3.2: Code Quality (1-2 hours)
- [ ] Run linter on all new files
- [ ] Fix any TypeScript errors
- [ ] Add JSDoc comments to public methods
- [ ] Remove any console.log statements (except meaningful ones)
- [ ] **Result:** Clean, professional code

#### Step 3.3: Cleanup Old Code (1 hour)
- [ ] Delete old `GameModeManager.ts` (replaced by mode classes)
- [ ] Delete old `modes.config.ts` (replaced by unified configs)
- [ ] Remove mode logic from `LevelManager.ts` (now in mode configs)
- [ ] Update imports across project
- [ ] **Result:** No dead code, clean structure

---

### Phase 4: Documentation (2 hours)

- [ ] Update `HOW_TO_ADD_NEW_GAME_MODES.md` for new architecture
- [ ] Update `README.md` with new structure
- [ ] Create `ARCHITECTURE.md` explaining mode system
- [ ] Add inline code comments
- [ ] **Result:** Future developers can understand system

---

## ⚠️ RISKS & MITIGATION

### Risk 1: Breaking Existing Gameplay
**Impact:** High  
**Probability:** Medium  
**Mitigation:**
- Test each mode thoroughly after migration
- Keep old code until new system proven
- Side-by-side testing during migration
- Rollback plan: Git branch for refactor

### Risk 2: Time Overrun
**Impact:** Medium  
**Probability:** Medium  
**Mitigation:**
- Break work into small chunks
- Commit frequently
- If running over, stop and reassess
- Can ship partial refactor (e.g., just Arcade)

### Risk 3: Introducing New Bugs
**Impact:** High  
**Probability:** Low  
**Mitigation:**
- Extensive testing checklist
- Debug logging during migration
- User acceptance testing before merging
- Keep debug builds for comparison

### Risk 4: Merge Conflicts (if working with team)
**Impact:** Medium  
**Probability:** Low  
**Mitigation:**
- Work in feature branch
- Communicate with team about refactor
- Merge frequently from main
- Clear ownership of files

---

## 🔄 ROLLBACK PLAN

If refactor goes wrong:

1. **Before starting:**
   - Create branch: `git checkout -b refactor/mode-system`
   - Commit current state: `git commit -am "Pre-refactor snapshot"`

2. **During refactor:**
   - Commit after each phase
   - Tag stable points: `git tag refactor-phase-1-complete`

3. **If need to rollback:**
   ```bash
   git checkout main
   git branch -D refactor/mode-system
   ```

4. **Recovery:**
   - Old code still works
   - Can cherry-pick good commits
   - Can retry refactor with lessons learned

---

## ✅ SUCCESS CRITERIA

Refactor is successful when:

- [ ] All 3 modes work identically to before
- [ ] Game.ts is <500 lines (currently 2,354)
- [ ] Each mode is self-contained class
- [ ] All configs unified in one place
- [ ] Adding new mode takes <2 hours
- [ ] No linter errors
- [ ] Code is well-documented
- [ ] Team/users approve changes

---

## 🎯 BENEFITS REALIZED

After refactor:

### For Development
- **New mode in 1-2 hours** (vs 4-6 hours before)
- **Easier testing** (test modes in isolation)
- **Clearer ownership** (mode logic lives in mode file)
- **Less merge conflicts** (changes isolated)

### For Maintenance
- **Single source of truth** for configs
- **No duplicate code** (inheritance + shared base)
- **Easier debugging** (smaller, focused files)
- **Better type safety** (mode-specific types)

### For Code Quality
- **SOLID principles** followed
- **Clean architecture** with clear boundaries
- **Testable** (can mock dependencies)
- **Extensible** (new modes easy to add)

---

## 🚀 NEXT STEPS

### Immediate (Today)
1. Review this plan
2. Ask questions / propose changes
3. Get approval to proceed

### This Week
1. Execute Phase 1 (Foundation)
2. Test configs compile and work
3. Test base class compiles

### Next Week
1. Execute Phase 2 (Migration)
2. Run side-by-side tests
3. Fix any issues found

### Following Week
1. Execute Phase 3 (Testing)
2. Execute Phase 4 (Documentation)
3. Merge to main

---

**Total Time: 18-26 hours (2-3 days)**

Ready to proceed? Let me know if you want to:
1. Start implementation now
2. Modify the plan first
3. Do a proof-of-concept for one mode
4. Something else

