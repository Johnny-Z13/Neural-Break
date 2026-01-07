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

  /**
   * 🎯 LEVEL CONFIGURATIONS WITH OBJECTIVES
   * Each level defines:
   * - Kill objectives (how many of each enemy to kill)
   * - Spawn rates (how often enemies spawn)
   */
  static getLevelConfig(level: number): LevelConfig {
    const configs: LevelConfig[] = [
      // ═══════════════════════════════════════════════════════
      // LEVEL 1: TUTORIAL - Learn the basics
      // ═══════════════════════════════════════════════════════
      {
        level: 1,
        name: "NEURAL INITIALIZATION",
        objectives: {
          dataMites: 5,
          scanDrones: 1,
          chaosWorms: 0,
          voidSpheres: 0,
          crystalSwarms: 0,
          fizzers: 1,
          ufos: 0,
          bosses: 0
        },
        miteSpawnRate: 1.5,
        droneSpawnRate: 8,
        wormSpawnRate: Infinity,
        voidSpawnRate: Infinity,
        crystalSpawnRate: Infinity,
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: Infinity,
        bossSpawnRate: Infinity
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 2: VOID SPHERES & BOSS - First real challenge
      // ═══════════════════════════════════════════════════════
      {
        level: 2,
        name: "SYSTEM BREACH",
        objectives: {
          dataMites: 0,
          scanDrones: 0,
          chaosWorms: 0,
          voidSpheres: 0,
          crystalSwarms: 0,
          fizzers: 0,
          ufos: 0,
          bosses: 1
        },
        miteSpawnRate: 1.2,
        droneSpawnRate: 5,
        wormSpawnRate: Infinity,
        voidSpawnRate: 15,    // Spawn VoidSpheres every 15s
        crystalSpawnRate: Infinity,
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: Infinity,
        bossSpawnRate: 30     // Spawn Boss every 30s
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 3: CHAOS WORMS & UFOS
      // ═══════════════════════════════════════════════════════
      {
        level: 3,
        name: "CHAOS CORRUPTION",
        objectives: {
          dataMites: 0,
          scanDrones: 0,
          chaosWorms: 2,
          voidSpheres: 0,
          crystalSwarms: 1,
          fizzers: 0,
          ufos: 1,
          bosses: 0
        },
        miteSpawnRate: 1.0,
        droneSpawnRate: 4,
        wormSpawnRate: 30,     // Spawn Worms every 30s
        voidSpawnRate: Infinity,
        crystalSpawnRate: Infinity,
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: 10,      // Spawn UFOs every 10s
        bossSpawnRate: Infinity
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 4: MULTI-ENEMY MAYHEM
      // ═══════════════════════════════════════════════════════
      {
        level: 4,
        name: "CRYSTALLINE MATRIX",
        objectives: {
          dataMites: 10,
          scanDrones: 1,
          chaosWorms: 1,
          crystalSwarms: 1,
          voidSpheres: 1,
          fizzers: 0,
          ufos: 1,
          bosses: 0
        },
        miteSpawnRate: 0.9,
        droneSpawnRate: 3.5,
        wormSpawnRate: 25,
        crystalSpawnRate: 40,
        voidSpawnRate: 35,     // Enable VoidSpheres
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: 30,      // Enable UFOs
        bossSpawnRate: Infinity
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 5: VOID SPHERE - Tank enemy appears
      // ═══════════════════════════════════════════════════════
      {
        level: 5,
        name: "VOID EMERGENCE",
        objectives: {
          dataMites: 10,
          scanDrones: 0,
          chaosWorms: 3,
          crystalSwarms: 2,
          voidSpheres: 1,
          fizzers: 0,
          ufos: 0,
          bosses: 0
        },
        miteSpawnRate: 0.8,
        droneSpawnRate: 3,
        wormSpawnRate: 20,
        crystalSpawnRate: 35,
        voidSpawnRate: 60,
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: Infinity,
        bossSpawnRate: Infinity
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 6: UFO INVASION - Late game enemy
      // ═══════════════════════════════════════════════════════
      {
        level: 6,
        name: "ALIEN INCURSION",
        objectives: {
          dataMites: 0,
          scanDrones: 10,
          chaosWorms: 1,
          crystalSwarms: 3,
          voidSpheres: 1,
          ufos: 3,
          fizzers: 0,
          bosses: 0
        },
        miteSpawnRate: 0.7,
        droneSpawnRate: 2.5,
        wormSpawnRate: 18,
        crystalSpawnRate: 30,
        voidSpawnRate: 50,
        ufoSpawnRate: 25,
        fizzerSpawnRate: Infinity,
        bossSpawnRate: Infinity
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 7: HIGH INTENSITY - All enemies
      // ═══════════════════════════════════════════════════════
      {
        level: 7,
        name: "NEURAL OVERLOAD",
        objectives: {
          dataMites: 45,
          scanDrones: 20,
          chaosWorms: 4,
          crystalSwarms: 3,
          voidSpheres: 2,
          ufos: 4,
          fizzers: 2,
          bosses: 0
        },
        miteSpawnRate: 0.6,
        droneSpawnRate: 2,
        wormSpawnRate: 15,
        crystalSpawnRate: 25,
        voidSpawnRate: 40,
        ufoSpawnRate: 20,
        fizzerSpawnRate: Infinity, // Spawns from multiplier, not timer
        bossSpawnRate: Infinity
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 8: BOSS APPEARS - First boss level
      // ═══════════════════════════════════════════════════════
      {
        level: 8,
        name: "DREADNOUGHT ASSAULT",
        objectives: {
          dataMites: 50,
          scanDrones: 22,
          chaosWorms: 4,
          crystalSwarms: 4,
          voidSpheres: 2,
          ufos: 5,
          fizzers: 2,
          bosses: 1
        },
        miteSpawnRate: 0.5,
        droneSpawnRate: 1.8,
        wormSpawnRate: 12,
        crystalSpawnRate: 22,
        voidSpawnRate: 35,
        ufoSpawnRate: 18,
        fizzerSpawnRate: Infinity,
        bossSpawnRate: 90
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 9: EXTREME DIFFICULTY - Multiple bosses
      // ═══════════════════════════════════════════════════════
      {
        level: 9,
        name: "DIGITAL APOCALYPSE",
        objectives: {
          dataMites: 60,
          scanDrones: 25,
          chaosWorms: 5,
          crystalSwarms: 4,
          voidSpheres: 3,
          ufos: 6,
          fizzers: 3,
          bosses: 2
        },
        miteSpawnRate: 0.4,
        droneSpawnRate: 1.5,
        wormSpawnRate: 10,
        crystalSpawnRate: 20,
        voidSpawnRate: 30,
        ufoSpawnRate: 15,
        fizzerSpawnRate: Infinity,
        bossSpawnRate: 60
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 10: FINAL LEVEL - Maximum intensity
      // ═══════════════════════════════════════════════════════
      {
        level: 10,
        name: "NEURAL BREAK",
        objectives: {
          dataMites: 75,
          scanDrones: 30,
          chaosWorms: 6,
          crystalSwarms: 5,
          voidSpheres: 4,
          ufos: 8,
          fizzers: 4,
          bosses: 3
        },
        miteSpawnRate: 0.3,
        droneSpawnRate: 1.2,
        wormSpawnRate: 8,
        crystalSpawnRate: 18,
        voidSpawnRate: 25,
        ufoSpawnRate: 12,
        fizzerSpawnRate: Infinity,
        bossSpawnRate: 45
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

  update(deltaTime: number): void {
    this.totalElapsedTime += deltaTime
  }

  getCurrentLevel(): number {
    return this.currentLevel
  }

  getCurrentLevelConfig(): LevelConfig {
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
