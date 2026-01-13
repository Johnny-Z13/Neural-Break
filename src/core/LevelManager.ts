/**
 * 🎯 LEVEL MANAGER - Objective-Based Level System
 * 
 * Each level has specific kill objectives that must be completed.
 * When objectives are met, all enemies are cleared and level transition plays.
 * 
 * Example: Level 1 = Kill 10 DataMites + 5 ScanDrones
 */

export interface LevelObjectives {
  dataMites: number
  scanDrones: number
  chaosWorms: number
  voidSpheres: number
  crystalSwarms: number
  fizzers: number
  ufos: number
  bosses: number
}

export interface LevelConfig {
  level: number
  name: string
  objectives: LevelObjectives
  miteSpawnRate: number
  droneSpawnRate: number
  wormSpawnRate: number
  voidSpawnRate: number
  crystalSpawnRate: number
  fizzerSpawnRate: number
  ufoSpawnRate: number
  bossSpawnRate: number
}

export interface LevelProgress {
  dataMites: number
  scanDrones: number
  chaosWorms: number
  voidSpheres: number
  crystalSwarms: number
  fizzers: number
  ufos: number
  bosses: number
}

export class LevelManager {
  private static readonly TOTAL_LEVELS = 10
  private currentLevel: number = 1
  private totalElapsedTime: number = 0
  private currentProgress: LevelProgress
  private objectivesComplete: boolean = false
  
  // 🎲 Rogue mode layer tracking
  private rogueCurrentLayer: number = 1

  /**
   * 🎯 LEVEL CONFIGURATIONS WITH OBJECTIVES
   * Each level defines:
   * - Kill objectives (how many of each enemy to kill)
   * - Spawn rates (how often enemies spawn)
   * 
   * ⏱️ TARGET: 100-120 seconds per level
   * 🎯 ALL ENEMY TYPES BY LEVEL 5 (compressed progression)
   * 🎲 Fizzers are OPTIONAL (multiplier-based spawns)
   */
  static getLevelConfig(level: number): LevelConfig {
    // 🎲 ROGUE MODE - Return Rogue layer configuration
    if (level === 998) {
      return this.getRogueLevelConfig()
    }
    
    // 🧪 TEST MODE - Return test configuration
    if (level === 999) {
      return this.getTestLevelConfig()
    }
    
    const configs: LevelConfig[] = [
      // ═══════════════════════════════════════════════════════
      // LEVEL 1: BASICS - DataMites + ScanDrones (~100s)
      // ═══════════════════════════════════════════════════════
      {
        level: 1,
        name: "NEURAL INITIALIZATION",
        objectives: {
          dataMites: 25,      // ~80s of spawning @ 1.6s
          scanDrones: 8,      // ~80s of spawning @ 10s
          chaosWorms: 0,
          voidSpheres: 0,
          crystalSwarms: 0,
          fizzers: 0,         // Optional (multiplier-based)
          ufos: 0,
          bosses: 0
        },
        miteSpawnRate: 1.6,
        droneSpawnRate: 10,       // Slightly slower for tutorial
        wormSpawnRate: Infinity,
        voidSpawnRate: Infinity,
        crystalSpawnRate: Infinity,
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: Infinity,
        bossSpawnRate: Infinity
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 2: WORM THREAT - ChaosWorm appears! (~100s)
      // ═══════════════════════════════════════════════════════
      {
        level: 2,
        name: "SYSTEM BREACH",
        objectives: {
          dataMites: 30,
          scanDrones: 10,
          chaosWorms: 2,      // 🆕 Big segmented enemy!
          voidSpheres: 0,
          crystalSwarms: 0,
          fizzers: 0,         // Optional (multiplier-based)
          ufos: 0,
          bosses: 0
        },
        miteSpawnRate: 1.3,
        droneSpawnRate: 8,
        wormSpawnRate: 50,        // 🆕 Spawns 2x during level
        voidSpawnRate: Infinity,
        crystalSpawnRate: Infinity,
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: Infinity,
        bossSpawnRate: Infinity
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 3: VOID + CRYSTAL - Tank + Orbital! (~110s)
      // ═══════════════════════════════════════════════════════
      {
        level: 3,
        name: "VOID CORRUPTION",
        objectives: {
          dataMites: 35,
          scanDrones: 12,
          chaosWorms: 2,
          voidSpheres: 1,     // 🆕 Tank enemy (slow, tanky)
          crystalSwarms: 1,   // 🆕 Orbital shards
          fizzers: 0,         // Optional (multiplier-based)
          ufos: 0,
          bosses: 0
        },
        miteSpawnRate: 1.2,
        droneSpawnRate: 7,
        wormSpawnRate: 45,
        voidSpawnRate: 90,        // 🆕 Spawns once mid-level
        crystalSpawnRate: 70,     // 🆕 Spawns mid-late
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: Infinity,
        bossSpawnRate: Infinity
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 4: UFO ARRIVAL - Flying saucer! (~110s)
      // ═══════════════════════════════════════════════════════
      {
        level: 4,
        name: "ALIEN INCURSION",
        objectives: {
          dataMites: 40,
          scanDrones: 15,
          chaosWorms: 2,
          voidSpheres: 1,
          crystalSwarms: 1,
          fizzers: 0,         // Optional (multiplier-based)
          ufos: 2,            // 🆕 Alien craft with lasers!
          bosses: 0
        },
        miteSpawnRate: 1.1,
        droneSpawnRate: 6.5,
        wormSpawnRate: 48,
        voidSpawnRate: 85,
        crystalSpawnRate: 75,
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: 55,         // 🆕 Spawns 2x during level
        bossSpawnRate: Infinity
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 5: FIRST BOSS - All enemy types! (~120s) 🎯
      // ═══════════════════════════════════════════════════════
      {
        level: 5,
        name: "DREADNOUGHT",
        objectives: {
          dataMites: 45,
          scanDrones: 18,
          chaosWorms: 3,
          voidSpheres: 1,
          crystalSwarms: 2,
          fizzers: 0,         // Optional (multiplier-based)
          ufos: 2,
          bosses: 1           // 🆕 First boss encounter!
        },
        miteSpawnRate: 1.0,
        droneSpawnRate: 6,
        wormSpawnRate: 40,
        voidSpawnRate: 100,       // Spawns once
        crystalSpawnRate: 50,     // Spawns 2x
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: 55,
        bossSpawnRate: 110        // 🆕 Boss spawns mid-level
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 6: SWARM - High variety! (~110s)
      // ═══════════════════════════════════════════════════════
      {
        level: 6,
        name: "NEURAL OVERLOAD",
        objectives: {
          dataMites: 50,
          scanDrones: 20,
          chaosWorms: 3,
          voidSpheres: 2,
          crystalSwarms: 2,
          fizzers: 0,         // Optional (multiplier-based)
          ufos: 2,
          bosses: 1
        },
        miteSpawnRate: 0.9,
        droneSpawnRate: 5,
        wormSpawnRate: 35,
        voidSpawnRate: 50,        // 🎲 2x VoidSpheres
        crystalSpawnRate: 45,     // 🎲 More crystals
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: 50,
        bossSpawnRate: 105        // Boss near end
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 7: CHAOS - Worms everywhere! (~110s) 🎲
      // ═══════════════════════════════════════════════════════
      {
        level: 7,
        name: "DATA STORM",
        objectives: {
          dataMites: 55,
          scanDrones: 22,
          chaosWorms: 5,      // 🎲 SURPRISE! Worm overload
          voidSpheres: 2,
          crystalSwarms: 2,
          fizzers: 0,         // Optional (multiplier-based)
          ufos: 2,
          bosses: 1
        },
        miteSpawnRate: 0.85,
        droneSpawnRate: 4.5,
        wormSpawnRate: 22,        // 🎲 Worms spawn often!
        voidSpawnRate: 55,
        crystalSpawnRate: 50,
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: 52,
        bossSpawnRate: 100
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 8: UFO SQUADRON - Flying saucer swarm! (~115s) 🎲
      // ═══════════════════════════════════════════════════════
      {
        level: 8,
        name: "ALIEN ARMADA",
        objectives: {
          dataMites: 60,
          scanDrones: 25,
          chaosWorms: 3,
          voidSpheres: 2,
          crystalSwarms: 3,
          fizzers: 0,         // Optional (multiplier-based)
          ufos: 4,            // 🎲 SURPRISE! UFO swarm
          bosses: 1
        },
        miteSpawnRate: 0.8,
        droneSpawnRate: 4.2,
        wormSpawnRate: 38,
        voidSpawnRate: 57,
        crystalSpawnRate: 35,
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: 28,         // 🎲 UFOs spawn frequently!
        bossSpawnRate: 105
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 9: DOUBLE BOSS - Boss rush! (~115s) 🎲
      // ═══════════════════════════════════════════════════════
      {
        level: 9,
        name: "DIGITAL APOCALYPSE",
        objectives: {
          dataMites: 65,
          scanDrones: 28,
          chaosWorms: 4,
          voidSpheres: 3,
          crystalSwarms: 3,
          fizzers: 0,         // Optional (multiplier-based)
          ufos: 3,
          bosses: 2           // 🎲 SURPRISE! Two bosses
        },
        miteSpawnRate: 0.75,
        droneSpawnRate: 3.8,
        wormSpawnRate: 32,
        voidSpawnRate: 38,
        crystalSpawnRate: 40,
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: 45,
        bossSpawnRate: 55         // 🎲 Bosses spawn quickly!
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 10: NEURAL BREAK - TOTAL CHAOS! (~120s) 💥
      // ═══════════════════════════════════════════════════════
      {
        level: 10,
        name: "NEURAL BREAK",
        objectives: {
          dataMites: 70,
          scanDrones: 30,
          chaosWorms: 5,
          voidSpheres: 3,
          crystalSwarms: 4,
          fizzers: 0,         // Optional (multiplier-based)
          ufos: 4,
          bosses: 3           // 🎲 Triple boss finale!
        },
        miteSpawnRate: 0.7,
        droneSpawnRate: 3.5,
        wormSpawnRate: 25,
        voidSpawnRate: 35,
        crystalSpawnRate: 30,
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: 35,
        bossSpawnRate: 40         // 💥 Bosses spawn rapidly!
      }
    ]

    const clampedLevel = Math.max(1, Math.min(level, LevelManager.TOTAL_LEVELS))
    return configs[clampedLevel - 1]
  }

  constructor() {
    this.currentLevel = 1
    this.totalElapsedTime = 0
    this.currentProgress = this.createEmptyProgress()
    this.objectivesComplete = false
  }

  private createEmptyProgress(): LevelProgress {
    return {
      dataMites: 0,
      scanDrones: 0,
      chaosWorms: 0,
      voidSpheres: 0,
      crystalSwarms: 0,
      fizzers: 0,
      ufos: 0,
      bosses: 0
    }
  }

  start(): void {
    this.currentLevel = 1
    this.totalElapsedTime = 0
    this.currentProgress = this.createEmptyProgress()
    this.objectivesComplete = false
  }
  
  startAtLevel(level: number): void {
    this.currentLevel = level
    this.totalElapsedTime = 0
    this.currentProgress = this.createEmptyProgress()
    this.objectivesComplete = false
  }

  update(deltaTime: number): void {
    this.totalElapsedTime += deltaTime
  }

  getCurrentLevel(): number {
    return this.currentLevel
  }

  getCurrentLevelConfig(): LevelConfig {
    // 🎲 For Rogue mode (level 998), use the current layer number
    if (this.currentLevel === 998) {
      return LevelManager.getRogueLevelConfig(this.rogueCurrentLayer)
    }
    return LevelManager.getLevelConfig(this.currentLevel)
  }

  getTotalElapsedTime(): number {
    return this.totalElapsedTime
  }

  // ═══════════════════════════════════════════════════════
  // 🎯 OBJECTIVE TRACKING
  // ═══════════════════════════════════════════════════════

  /**
   * Register an enemy kill for objective tracking
   */
  registerKill(enemyType: string): void {
    if (this.objectivesComplete) return

    switch (enemyType) {
      case 'DataMite':
        this.currentProgress.dataMites++
        break
      case 'ScanDrone':
        this.currentProgress.scanDrones++
        break
      case 'ChaosWorm':
        this.currentProgress.chaosWorms++
        break
      case 'VoidSphere':
        this.currentProgress.voidSpheres++
        break
      case 'CrystalShardSwarm':
        this.currentProgress.crystalSwarms++
        break
      case 'Fizzer':
        this.currentProgress.fizzers++
        break
      case 'UFO':
        this.currentProgress.ufos++
        break
      case 'Boss':
        this.currentProgress.bosses++
        break
    }
  }

  /**
   * Check if all objectives are complete
   */
  checkObjectivesComplete(): boolean {
    if (this.objectivesComplete) return true

    const config = this.getCurrentLevelConfig()
    const objectives = config.objectives
    const progress = this.currentProgress

    const complete = (
      progress.dataMites >= objectives.dataMites &&
      progress.scanDrones >= objectives.scanDrones &&
      progress.chaosWorms >= objectives.chaosWorms &&
      progress.voidSpheres >= objectives.voidSpheres &&
      progress.crystalSwarms >= objectives.crystalSwarms &&
      progress.fizzers >= objectives.fizzers &&
      progress.ufos >= objectives.ufos &&
      progress.bosses >= objectives.bosses
    )

    if (complete) {
      this.objectivesComplete = true
    }

    return complete
  }

  /**
   * Get current progress towards objectives
   */
  getProgress(): LevelProgress {
    return { ...this.currentProgress }
  }

  /**
   * Get objectives for current level
   */
  getObjectives(): LevelObjectives {
    return { ...this.getCurrentLevelConfig().objectives }
  }

  /**
   * Advance to next level (called after transition)
   */
  advanceLevel(): void {
    if (this.currentLevel < LevelManager.TOTAL_LEVELS) {
      this.currentLevel++
      this.currentProgress = this.createEmptyProgress()
      this.objectivesComplete = false
    }
  }

  /**
   * Reset objectives without advancing level (for Rogue mode layers)
   */
  resetObjectives(): void {
    this.currentProgress = this.createEmptyProgress()
    this.objectivesComplete = false
  }
  
  /**
   * 🎲 Rogue mode: Set the current layer number
   */
  setRogueLayer(layerNumber: number): void {
    this.rogueCurrentLayer = layerNumber
  }
  
  /**
   * 🎲 Rogue mode: Get the current layer number
   */
  getRogueLayer(): number {
    return this.rogueCurrentLayer
  }
  
  /**
   * 🎲 Rogue mode: Advance to next layer
   */
  advanceRogueLayer(): void {
    this.rogueCurrentLayer++
    this.resetObjectives()
  }

  /**
   * Check if all levels are complete
   */
  isGameComplete(): boolean {
    return this.currentLevel >= LevelManager.TOTAL_LEVELS && this.objectivesComplete
  }

  /**
   * Get level progress as percentage (0-100)
   */
  getLevelProgress(): number {
    const config = this.getCurrentLevelConfig()
    const objectives = config.objectives
    const progress = this.currentProgress

    // Calculate total kills needed
    const totalNeeded = (
      objectives.dataMites +
      objectives.scanDrones +
      objectives.chaosWorms +
      objectives.voidSpheres +
      objectives.crystalSwarms +
      objectives.fizzers +
      objectives.ufos +
      objectives.bosses
    )

    // Calculate total kills achieved
    const totalAchieved = (
      Math.min(progress.dataMites, objectives.dataMites) +
      Math.min(progress.scanDrones, objectives.scanDrones) +
      Math.min(progress.chaosWorms, objectives.chaosWorms) +
      Math.min(progress.voidSpheres, objectives.voidSpheres) +
      Math.min(progress.crystalSwarms, objectives.crystalSwarms) +
      Math.min(progress.fizzers, objectives.fizzers) +
      Math.min(progress.ufos, objectives.ufos) +
      Math.min(progress.bosses, objectives.bosses)
    )

    if (totalNeeded === 0) return 100
    return Math.min(100, (totalAchieved / totalNeeded) * 100)
  }

  /**
   * Get total game progress as percentage (0-100)
   */
  getTotalProgress(): number {
    const completedLevels = this.currentLevel - 1
    const currentLevelProgress = this.getLevelProgress() / 100
    return ((completedLevels + currentLevelProgress) / LevelManager.TOTAL_LEVELS) * 100
  }

  /**
   * Check if objectives are complete (for transition trigger)
   */
  areObjectivesComplete(): boolean {
    return this.objectivesComplete
  }

  static getTotalLevels(): number {
    return LevelManager.TOTAL_LEVELS
  }
  
  /**
   * 🧪 TEST MODE - Endless level with all enemy types
   * For testing and review purposes
   */
  startTestLevel(): void {
    this.currentLevel = 999 // Special level number for test mode
    this.totalElapsedTime = 0
    this.currentProgress = {
      dataMites: 0,
      scanDrones: 0,
      chaosWorms: 0,
      voidSpheres: 0,
      crystalSwarms: 0,
      fizzers: 0,
      ufos: 0,
      bosses: 0
    }
    this.objectivesComplete = false
  }
  
  /**
   * 🧪 Get test level configuration with all enemies
   */
  // ═══════════════════════════════════════════════════════
  // 🎲 ROGUE MODE CONFIGURATION - DYNAMIC LAYER SYSTEM
  // ═══════════════════════════════════════════════════════
  /**
   * 🎲 Generate dynamic layer configuration based on current layer number
   * Each layer has a unique "theme" with different enemy compositions
   * Difficulty scales progressively with layer number
   * 
   * Layer Themes (cycle every 6 layers):
   * 1. Swarm - Lots of mites and drones
   * 2. Chaos - Worms and void spheres
   * 3. Crystal - Crystal swarms focus
   * 4. Mixed - All enemy types
   * 5. Elite - Tougher enemies (UFOs, Void Spheres)
   * 6. Boss - Boss encounter every 6th layer
   */
  static getRogueLevelConfig(layerNumber: number = 1): LevelConfig {
    // Determine layer theme (cycles every 6 layers)
    const themeIndex = ((layerNumber - 1) % 6) + 1
    
    // Base difficulty multiplier (increases with layer)
    const difficultyScale = 1 + (layerNumber - 1) * 0.15 // 15% increase per layer
    
    // Layer theme configurations
    let config: LevelConfig
    
    switch (themeIndex) {
      case 1: // 🐛 SWARM LAYER - Lots of basic enemies
        config = {
          level: 998,
          name: `SWARM ASSAULT - LAYER ${layerNumber}`,
          objectives: {
            dataMites: Math.floor(40 * difficultyScale),
            scanDrones: Math.floor(15 * difficultyScale),
            chaosWorms: 1,
            voidSpheres: 0,
            crystalSwarms: 1,
            fizzers: 2,
            ufos: 0,
            bosses: 0
          },
          miteSpawnRate: 1.0 / difficultyScale,
          droneSpawnRate: 5.0 / difficultyScale,
          wormSpawnRate: 45.0,
          voidSpawnRate: Infinity,
          crystalSpawnRate: 40.0,
          fizzerSpawnRate: 15.0 / difficultyScale,
          ufoSpawnRate: Infinity,
          bossSpawnRate: Infinity
        }
        break
        
      case 2: // 🌀 CHAOS LAYER - Worms and void spheres
        config = {
          level: 998,
          name: `CHAOS STORM - LAYER ${layerNumber}`,
          objectives: {
            dataMites: Math.floor(20 * difficultyScale),
            scanDrones: Math.floor(8 * difficultyScale),
            chaosWorms: Math.floor(3 * difficultyScale),
            voidSpheres: Math.floor(2 * difficultyScale),
            crystalSwarms: 1,
            fizzers: 1,
            ufos: 0,
            bosses: 0
          },
          miteSpawnRate: 1.5 / difficultyScale,
          droneSpawnRate: 7.0,
          wormSpawnRate: 25.0 / difficultyScale,
          voidSpawnRate: 35.0 / difficultyScale,
          crystalSpawnRate: 50.0,
          fizzerSpawnRate: 20.0,
          ufoSpawnRate: Infinity,
          bossSpawnRate: Infinity
        }
        break
        
      case 3: // 💎 CRYSTAL LAYER - Crystal swarms focus
        config = {
          level: 998,
          name: `CRYSTAL FIELD - LAYER ${layerNumber}`,
          objectives: {
            dataMites: Math.floor(25 * difficultyScale),
            scanDrones: Math.floor(10 * difficultyScale),
            chaosWorms: 1,
            voidSpheres: 1,
            crystalSwarms: Math.floor(3 * difficultyScale),
            fizzers: 2,
            ufos: 0,
            bosses: 0
          },
          miteSpawnRate: 1.3 / difficultyScale,
          droneSpawnRate: 6.5,
          wormSpawnRate: 50.0,
          voidSpawnRate: 45.0,
          crystalSpawnRate: 20.0 / difficultyScale,
          fizzerSpawnRate: 16.0 / difficultyScale,
          ufoSpawnRate: Infinity,
          bossSpawnRate: Infinity
        }
        break
        
      case 4: // 🎭 MIXED LAYER - Balanced variety
        config = {
          level: 998,
          name: `NEURAL MAZE - LAYER ${layerNumber}`,
          objectives: {
            dataMites: Math.floor(30 * difficultyScale),
            scanDrones: Math.floor(12 * difficultyScale),
            chaosWorms: Math.floor(2 * difficultyScale),
            voidSpheres: Math.floor(2 * difficultyScale),
            crystalSwarms: Math.floor(2 * difficultyScale),
            fizzers: 3,
            ufos: 1,
            bosses: 0
          },
          miteSpawnRate: 1.2 / difficultyScale,
          droneSpawnRate: 6.0 / difficultyScale,
          wormSpawnRate: 35.0,
          voidSpawnRate: 40.0,
          crystalSpawnRate: 38.0,
          fizzerSpawnRate: 14.0 / difficultyScale,
          ufoSpawnRate: 55.0,
          bossSpawnRate: Infinity
        }
        break
        
      case 5: // ⚡ ELITE LAYER - Tough enemies
        config = {
          level: 998,
          name: `ELITE GAUNTLET - LAYER ${layerNumber}`,
          objectives: {
            dataMites: Math.floor(15 * difficultyScale),
            scanDrones: Math.floor(10 * difficultyScale),
            chaosWorms: Math.floor(2 * difficultyScale),
            voidSpheres: Math.floor(3 * difficultyScale),
            crystalSwarms: Math.floor(2 * difficultyScale),
            fizzers: 2,
            ufos: Math.floor(2 * difficultyScale),
            bosses: 0
          },
          miteSpawnRate: 2.0 / difficultyScale,
          droneSpawnRate: 7.0,
          wormSpawnRate: 30.0,
          voidSpawnRate: 28.0 / difficultyScale,
          crystalSpawnRate: 35.0,
          fizzerSpawnRate: 18.0,
          ufoSpawnRate: 40.0 / difficultyScale,
          bossSpawnRate: Infinity
        }
        break
        
      case 6: // 👹 BOSS LAYER - Boss encounter
        config = {
          level: 998,
          name: `SECTOR GUARDIAN - LAYER ${layerNumber}`,
          objectives: {
            dataMites: Math.floor(20 * difficultyScale),
            scanDrones: Math.floor(8 * difficultyScale),
            chaosWorms: 1,
            voidSpheres: 1,
            crystalSwarms: 1,
            fizzers: 1,
            ufos: 1,
            bosses: 1  // Boss spawns on layer 6, 12, 18, etc.
          },
          miteSpawnRate: 1.5 / difficultyScale,
          droneSpawnRate: 7.0,
          wormSpawnRate: 45.0,
          voidSpawnRate: 50.0,
          crystalSpawnRate: 45.0,
          fizzerSpawnRate: 20.0,
          ufoSpawnRate: 55.0,
          bossSpawnRate: 30.0  // Boss spawns after 30 seconds
        }
        break
        
      default:
        // Fallback (should never happen)
        config = this.getRogueLevelConfig(1)
    }
    
    return config
  }

  // ═══════════════════════════════════════════════════════
  // 🧪 TEST MODE CONFIGURATION
  // ═══════════════════════════════════════════════════════
  static getTestLevelConfig(): LevelConfig {
    return {
      level: 999,
      name: "TEST MODE - ALL ENEMIES",
      objectives: {
        dataMites: 99999,    // Effectively endless
        scanDrones: 99999,
        chaosWorms: 99999,
        voidSpheres: 99999,
        crystalSwarms: 99999,
        fizzers: 99999,
        ufos: 99999,
        bosses: 99999
      },
      // Fast spawn rates to get all enemy types quickly
      miteSpawnRate: 2.0,
      droneSpawnRate: 8.0,
      wormSpawnRate: 12.0,
      voidSpawnRate: 15.0,
      crystalSpawnRate: 10.0,
      fizzerSpawnRate: 14.0,
      ufoSpawnRate: 18.0,
      bossSpawnRate: 25.0
    }
  }

  // ═══════════════════════════════════════════════════════
  // 🎮 LEGACY COMPATIBILITY (for timer-based systems)
  // ═══════════════════════════════════════════════════════

  /**
   * Legacy method - returns 0 since we're objective-based now
   */
  getLevelElapsedTime(): number {
    return 0
  }

  /**
   * Legacy method - objectives-based system doesn't use time
   * This always returns false now - use checkObjectivesComplete() instead
   */
  checkLevelComplete(): boolean {
    return false
  }
}
