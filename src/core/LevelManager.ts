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
      // LEVEL 1: TUTORIAL - Learn the basics (~90 seconds)
      // ═══════════════════════════════════════════════════════
      {
        level: 1,
        name: "NEURAL INITIALIZATION",
        objectives: {
          dataMites: 18,      // Increased from 12
          scanDrones: 6,      // Increased from 4
          chaosWorms: 0,
          voidSpheres: 0,
          crystalSwarms: 0,
          fizzers: 0,
          ufos: 0,
          bosses: 0
        },
        miteSpawnRate: 1.6,       // Faster (was 2.0)
        droneSpawnRate: 6.5,      // Faster (was 8)
        wormSpawnRate: Infinity,
        voidSpawnRate: Infinity,
        crystalSpawnRate: Infinity,
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: Infinity,
        bossSpawnRate: Infinity
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 2: CHAOS INTRODUCTION - First big enemy! (~2 min)
      // ═══════════════════════════════════════════════════════
      {
        level: 2,
        name: "SYSTEM BREACH",
        objectives: {
          dataMites: 28,      // Increased from 20
          scanDrones: 12,     // Increased from 8
          chaosWorms: 2,      // Increased from 1 - MORE variety
          voidSpheres: 0,
          crystalSwarms: 0,
          fizzers: 1,         // 🆕 Introduce Fizzer earlier!
          ufos: 0,
          bosses: 0
        },
        miteSpawnRate: 1.2,       // Faster (was 1.5)
        droneSpawnRate: 4.8,      // Faster (was 6)
        wormSpawnRate: 55,        // Faster (was 80)
        voidSpawnRate: Infinity,
        crystalSpawnRate: Infinity,
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: Infinity,
        bossSpawnRate: Infinity
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 3: MULTIPLE THREATS - Fizzer + VoidSphere (~2-2.5 min)
      // ═══════════════════════════════════════════════════════
      {
        level: 3,
        name: "VOID CORRUPTION",
        objectives: {
          dataMites: 35,      // Increased from 25
          scanDrones: 15,     // Increased from 10
          chaosWorms: 2,      // Increased from 1
          voidSpheres: 1,     // 🆕 Introduce VoidSphere!
          crystalSwarms: 1,   // 🆕 Introduce CrystalSwarm earlier!
          fizzers: 2,         // Increased from 1
          ufos: 0,
          bosses: 0
        },
        miteSpawnRate: 1.0,       // Faster (was 1.3)
        droneSpawnRate: 4.0,      // Faster (was 5)
        wormSpawnRate: 50,        // Faster (was 70)
        voidSpawnRate: 85,        // Faster (was 110)
        crystalSpawnRate: 95,     // 🆕 Spawns once
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: Infinity,
        bossSpawnRate: Infinity
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 4: CRYSTALLINE SWARM - More variety (~2.5 min)
      // ═══════════════════════════════════════════════════════
      {
        level: 4,
        name: "CRYSTAL FORMATION",
        objectives: {
          dataMites: 42,      // Increased from 30
          scanDrones: 18,     // Increased from 12
          chaosWorms: 3,      // Increased from 2
          voidSpheres: 2,     // Increased from 1
          crystalSwarms: 2,   // Increased from 1
          fizzers: 2,         // Increased from 1
          ufos: 1,            // 🆕 Introduce UFO earlier!
          bosses: 0
        },
        miteSpawnRate: 0.9,       // Faster (was 1.2)
        droneSpawnRate: 3.6,      // Faster (was 4.5)
        wormSpawnRate: 42,        // Faster (was 55)
        voidSpawnRate: 70,        // Faster (was 95)
        crystalSpawnRate: 75,     // Faster (was 100)
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: 110,        // 🆕 Spawns once
        bossSpawnRate: Infinity
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 5: ESCALATION - All enemies active! (~2.5 min)
      // ═══════════════════════════════════════════════════════
      {
        level: 5,
        name: "ALIEN INCURSION",
        objectives: {
          dataMites: 48,      // Increased from 32
          scanDrones: 20,     // Increased from 14
          chaosWorms: 3,      // Increased from 2
          voidSpheres: 2,     // Increased from 1
          crystalSwarms: 2,   // Increased from 1
          fizzers: 3,         // Increased from 1
          ufos: 2,            // Increased from 1
          bosses: 0
        },
        miteSpawnRate: 0.8,       // Faster (was 1.0)
        droneSpawnRate: 3.2,      // Faster (was 4)
        wormSpawnRate: 38,        // Faster (was 50)
        voidSpawnRate: 65,        // Faster (was 85)
        crystalSpawnRate: 65,     // Faster (was 90)
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: 85,         // Faster (was 120)
        bossSpawnRate: Infinity
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 6: ESCALATION - More of everything (~2.5 min)
      // ═══════════════════════════════════════════════════════
      {
        level: 6,
        name: "NEURAL OVERLOAD",
        objectives: {
          dataMites: 55,      // Increased from 35
          scanDrones: 24,     // Increased from 16
          chaosWorms: 4,      // Increased from 3
          voidSpheres: 3,     // Increased from 2
          crystalSwarms: 2,   // Increased from 1
          fizzers: 3,         // Increased from 2
          ufos: 2,            // Increased from 1
          bosses: 0
        },
        miteSpawnRate: 0.7,       // Faster (was 0.9)
        droneSpawnRate: 2.8,      // Faster (was 3.5)
        wormSpawnRate: 35,        // Faster (was 45)
        voidSpawnRate: 58,        // Faster (was 75)
        crystalSpawnRate: 60,     // Faster (was 85)
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: 75,         // Faster (was 110)
        bossSpawnRate: Infinity
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 7: HIGH INTENSITY - All enemy types + Boss! (~3 min)
      // ═══════════════════════════════════════════════════════
      {
        level: 7,
        name: "DATA STORM",
        objectives: {
          dataMites: 62,      // Increased from 40
          scanDrones: 28,     // Increased from 18
          chaosWorms: 4,      // Increased from 3
          voidSpheres: 3,     // Increased from 2
          crystalSwarms: 3,   // Increased from 2
          fizzers: 4,         // Increased from 2
          ufos: 3,            // Increased from 2
          bosses: 1           // 🆕 Introduce Boss earlier!
        },
        miteSpawnRate: 0.6,       // Faster (was 0.8)
        droneSpawnRate: 2.5,      // Faster (was 3.2)
        wormSpawnRate: 32,        // Faster (was 40)
        voidSpawnRate: 52,        // Faster (was 65)
        crystalSpawnRate: 55,     // Faster (was 70)
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: 68,         // Faster (was 90)
        bossSpawnRate: 140        // 🆕 Spawns once mid-level
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 8: DOUBLE BOSSES - Multiple bosses! (~3 min)
      // ═══════════════════════════════════════════════════════
      {
        level: 8,
        name: "DREADNOUGHT ASSAULT",
        objectives: {
          dataMites: 70,      // Increased from 42
          scanDrones: 32,     // Increased from 20
          chaosWorms: 5,      // Increased from 3
          voidSpheres: 3,     // Increased from 2
          crystalSwarms: 3,   // Increased from 2
          fizzers: 4,         // Increased from 2
          ufos: 3,            // Increased from 2
          bosses: 2           // Increased from 1
        },
        miteSpawnRate: 0.55,      // Faster (was 0.7)
        droneSpawnRate: 2.2,      // Faster (was 3.0)
        wormSpawnRate: 28,        // Faster (was 38)
        voidSpawnRate: 48,        // Faster (was 60)
        crystalSpawnRate: 50,     // Faster (was 65)
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: 60,         // Faster (was 80)
        bossSpawnRate: 100        // Faster spawning (was 160)
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 9: TRIPLE THREAT - Multiple bosses! (~3 min)
      // ═══════════════════════════════════════════════════════
      {
        level: 9,
        name: "DIGITAL APOCALYPSE",
        objectives: {
          dataMites: 80,      // Increased from 45
          scanDrones: 38,     // Increased from 22
          chaosWorms: 6,      // Increased from 4
          voidSpheres: 4,     // Increased from 2
          crystalSwarms: 4,   // Increased from 2
          fizzers: 5,         // Increased from 2
          ufos: 4,            // Increased from 2
          bosses: 3           // Increased from 2
        },
        miteSpawnRate: 0.5,       // Faster (was 0.6)
        droneSpawnRate: 2.0,      // Faster (was 2.8)
        wormSpawnRate: 25,        // Faster (was 35)
        voidSpawnRate: 44,        // Faster (was 55)
        crystalSpawnRate: 48,     // Faster (was 60)
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: 55,         // Faster (was 75)
        bossSpawnRate: 85         // Faster (was 110)
      },

      // ═══════════════════════════════════════════════════════
      // LEVEL 10: NEURAL BREAK - Final chaos (~3 min)
      // ═══════════════════════════════════════════════════════
      {
        level: 10,
        name: "NEURAL BREAK",
        objectives: {
          dataMites: 95,      // Increased from 50
          scanDrones: 45,     // Increased from 25
          chaosWorms: 7,      // Increased from 4
          voidSpheres: 5,     // Increased from 3
          crystalSwarms: 5,   // Increased from 3
          fizzers: 6,         // Increased from 3
          ufos: 5,            // Increased from 3
          bosses: 4           // Increased from 3
        },
        miteSpawnRate: 0.4,       // Faster (was 0.5)
        droneSpawnRate: 1.8,      // Faster (was 2.5)
        wormSpawnRate: 22,        // Faster (was 32)
        voidSpawnRate: 38,        // Faster (was 50)
        crystalSpawnRate: 42,     // Faster (was 55)
        fizzerSpawnRate: Infinity,
        ufoSpawnRate: 48,         // Faster (was 70)
        bossSpawnRate: 70         // Faster (was 90)
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
