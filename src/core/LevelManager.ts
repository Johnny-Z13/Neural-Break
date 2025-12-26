/**
 * LevelManager - Compressed 10-level progression system for rapid dev/testing
 * 
 * This compresses the original 30-minute progression into 10 short levels.
 * Each level represents a compressed version of the original time-based progression.
 * 
 * TODO: Later we can stretch this back out to the full 30-minute experience.
 */

export interface LevelConfig {
  level: number
  duration: number // Duration in seconds for this level
  miteSpawnRate: number // DataMite spawn interval
  droneSpawnRate: number // ScanDrone spawn interval (Infinity = disabled)
  wormSpawnRate: number // ChaosWorm spawn interval (Infinity = disabled)
  voidSpawnRate: number // VoidSphere spawn interval (Infinity = disabled)
  crystalSpawnRate: number // CrystalShardSwarm spawn interval (Infinity = disabled)
  bossSpawnRate: number // Boss spawn interval (Infinity = disabled)
}

export class LevelManager {
  private static readonly TOTAL_LEVELS = 10
  private currentLevel: number = 1
  private levelStartTime: number = 0
  private totalElapsedTime: number = 0

  /**
   * Get configuration for a specific level
   * Levels compress the original 30-minute progression:
   * - Levels 1-2: Tutorial/Early (DataMites + ScanDrones)
   * - Level 3: ChaosWorms introduced
   * - Level 4: CrystalShardSwarms introduced
   * - Level 5: VoidSpheres introduced
   * - Levels 6-10: Escalating difficulty with all enemies
   */
  static getLevelConfig(level: number): LevelConfig {
    const configs: LevelConfig[] = [
      // Level 1: Tutorial - DataMites + ScanDrones appear early!
      {
        level: 1,
        duration: 30, // 30 seconds
        miteSpawnRate: 1.0,
        droneSpawnRate: 6, // ScanDrones from level 1!
        wormSpawnRate: Infinity,
        voidSpawnRate: Infinity,
        crystalSpawnRate: Infinity,
        bossSpawnRate: Infinity // No boss in level 1
      },
      // Level 2: More ScanDrones
      {
        level: 2,
        duration: 30,
        miteSpawnRate: 0.8,
        droneSpawnRate: 4, // More common! (was 8)
        wormSpawnRate: Infinity,
        voidSpawnRate: Infinity,
        crystalSpawnRate: Infinity,
        bossSpawnRate: Infinity
      },
      // Level 3: ChaosWorms introduced
      {
        level: 3,
        duration: 45,
        miteSpawnRate: 0.6,
        droneSpawnRate: 3.5, // More common! (was 7)
        wormSpawnRate: 20,
        voidSpawnRate: Infinity,
        crystalSpawnRate: Infinity,
        bossSpawnRate: Infinity
      },
      // Level 4: CrystalShardSwarms introduced
      {
        level: 4,
        duration: 45,
        miteSpawnRate: 0.5,
        droneSpawnRate: 3, // More common! (was 6)
        wormSpawnRate: 18,
        crystalSpawnRate: 30,
        voidSpawnRate: Infinity,
        bossSpawnRate: Infinity
      },
      // Level 5: VoidSpheres introduced
      {
        level: 5,
        duration: 60,
        miteSpawnRate: 0.5,
        droneSpawnRate: 2.5, // More common! (was 5)
        wormSpawnRate: 15,
        crystalSpawnRate: 25,
        voidSpawnRate: 40,
        bossSpawnRate: Infinity // Boss can start appearing in level 6+
      },
      // Level 6: Escalating difficulty
      {
        level: 6,
        duration: 60,
        miteSpawnRate: 0.4,
        droneSpawnRate: 2, // More common! (was 4)
        wormSpawnRate: 12,
        crystalSpawnRate: 20,
        voidSpawnRate: 35,
        bossSpawnRate: 120 // First boss at level 6 (every 2 minutes)
      },
      // Level 7: High intensity
      {
        level: 7,
        duration: 60,
        miteSpawnRate: 0.4,
        droneSpawnRate: 1.8, // More common! (was 3.5)
        wormSpawnRate: 10,
        crystalSpawnRate: 18,
        voidSpawnRate: 30,
        bossSpawnRate: 90 // Boss every 90 seconds
      },
      // Level 8: Peak difficulty
      {
        level: 8,
        duration: 60,
        miteSpawnRate: 0.3,
        droneSpawnRate: 1.5, // More common! (was 3)
        wormSpawnRate: 8,
        crystalSpawnRate: 15,
        voidSpawnRate: 25,
        bossSpawnRate: 75 // Boss every 75 seconds
      },
      // Level 9: Extreme difficulty
      {
        level: 9,
        duration: 60,
        miteSpawnRate: 0.3,
        droneSpawnRate: 1.2, // More common! (was 2.5)
        wormSpawnRate: 7,
        crystalSpawnRate: 12,
        voidSpawnRate: 20,
        bossSpawnRate: 60 // Boss every 60 seconds
      },
      // Level 10: Maximum intensity
      {
        level: 10,
        duration: 90,
        miteSpawnRate: 0.25,
        droneSpawnRate: 1, // More common! (was 2)
        wormSpawnRate: 5,
        crystalSpawnRate: 10,
        voidSpawnRate: 15,
        bossSpawnRate: 45 // Boss every 45 seconds - FINAL LEVEL!
      }
    ]

    // Clamp level to valid range
    const clampedLevel = Math.max(1, Math.min(level, LevelManager.TOTAL_LEVELS))
    return configs[clampedLevel - 1]
  }

  constructor() {
    this.currentLevel = 1
    this.levelStartTime = 0
    this.totalElapsedTime = 0
  }

  start(): void {
    this.currentLevel = 1
    this.levelStartTime = 0
    this.totalElapsedTime = 0
  }

  update(deltaTime: number): void {
    this.totalElapsedTime += deltaTime
    this.levelStartTime += deltaTime
  }

  getCurrentLevel(): number {
    return this.currentLevel
  }

  getCurrentLevelConfig(): LevelConfig {
    return LevelManager.getLevelConfig(this.currentLevel)
  }

  getLevelElapsedTime(): number {
    return this.levelStartTime
  }

  getTotalElapsedTime(): number {
    return this.totalElapsedTime
  }

  /**
   * Check if current level is complete and advance if needed
   * Returns true if level advanced
   */
  checkLevelComplete(): boolean {
    const config = this.getCurrentLevelConfig()
    if (this.levelStartTime >= config.duration) {
      if (this.currentLevel < LevelManager.TOTAL_LEVELS) {
        this.currentLevel++
        this.levelStartTime = 0
        return true
      }
    }
    return false
  }

  isGameComplete(): boolean {
    return this.currentLevel >= LevelManager.TOTAL_LEVELS && 
           this.levelStartTime >= this.getCurrentLevelConfig().duration
  }

  getLevelProgress(): number {
    const config = this.getCurrentLevelConfig()
    return Math.min(100, (this.levelStartTime / config.duration) * 100)
  }

  getTotalProgress(): number {
    // Calculate total progress across all levels
    let totalDuration = 0
    for (let i = 1; i <= LevelManager.TOTAL_LEVELS; i++) {
      totalDuration += LevelManager.getLevelConfig(i).duration
    }
    
    let elapsed = 0
    for (let i = 1; i < this.currentLevel; i++) {
      elapsed += LevelManager.getLevelConfig(i).duration
    }
    elapsed += this.levelStartTime
    
    return Math.min(100, (elapsed / totalDuration) * 100)
  }

  static getTotalLevels(): number {
    return LevelManager.TOTAL_LEVELS
  }
}

