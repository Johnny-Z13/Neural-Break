export enum GameStateType {
  START_SCREEN = 'start_screen',
  PLAYING = 'playing',
  GAME_OVER = 'game_over'
}

export interface GameStats {
  score: number
  survivedTime: number
  level: number
  enemiesKilled: number
  dataMinersKilled: number
  scanDronesKilled: number
  chaosWormsKilled: number
  voidSpheresKilled: number
  crystalSwarmsKilled: number
  bossesKilled: number
  damageTaken: number
  totalXP: number
  highestCombo: number
  highestMultiplier: number // Track highest multiplier achieved
}

export interface HighScoreEntry {
  name: string
  score: number
  survivedTime: number
  level: number
  date: string
}

import { HighScoreServiceFactory, LocalStorageHighScoreService } from '../data/HighScoreService'

// 🎯 ARCADE-STYLE POINT VALUES - Only for SHOOTING enemies! 🎯
export const KILL_POINTS = {
  DataMite: 100,
  ScanDrone: 250,
  ChaosWorm: 500,
  VoidSphere: 1000,
  CrystalShardSwarm: 750,
  Boss: 5000
} as const

export class ScoreManager {
  private static readonly MAX_HIGH_SCORES = 10

  // 🎮 GET BASE POINTS FOR ENEMY TYPE 🎮
  static getKillPoints(enemyType: string): number {
    return (KILL_POINTS as any)[enemyType] || 100
  }

  // Score is now tracked directly via addKillScore - this just returns the current score
  static calculateScore(stats: GameStats): number {
    // Score is now accumulated directly from kills with multipliers
    // This method just returns the current score (already calculated)
    return stats.score
  }

  /**
   * Save high score using the configured service (localStorage or API)
   * Returns true if the score was successfully saved and made it to the leaderboard
   */
  static async saveHighScore(entry: HighScoreEntry): Promise<boolean> {
    const service = HighScoreServiceFactory.getService()
    return await service.saveHighScore(entry)
  }

  /**
   * Get high scores using the configured service
   */
  static async getHighScores(): Promise<HighScoreEntry[]> {
    const service = HighScoreServiceFactory.getService()
    return await service.getHighScores()
  }

  /**
   * Check if a score qualifies as a high score
   */
  static async isHighScore(score: number): Promise<boolean> {
    const highScores = await this.getHighScores()
    if (highScores.length < this.MAX_HIGH_SCORES) return true
    return score > highScores[highScores.length - 1].score
  }

  static formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  static formatScore(score: number): string {
    return score.toLocaleString()
  }

  // Debug method to test high score system
  static async addTestScore(): Promise<void> {
    const testEntry: HighScoreEntry = {
      name: 'TestPlayer',
      score: 12345,
      survivedTime: 180, // 3 minutes
      level: 5,
      date: new Date().toLocaleDateString()
    }
    const saved = await this.saveHighScore(testEntry)
    console.log('🧪 Test high score added:', testEntry, saved ? '✅' : '❌')
  }

  // Debug method to clear all scores
  static async clearAllScores(): Promise<void> {
    const service = HighScoreServiceFactory.getService()
    await service.clearAllScores()
    console.log('🗑️ All high scores cleared')
  }
  
  // 💾 GET LAST PLAYER NAME - For convenience! 💾
  static getLastPlayerName(): string {
    const service = HighScoreServiceFactory.getService()
    if (service instanceof LocalStorageHighScoreService) {
      return (service as any).getLastPlayerName()
    }
    return ''
  }
}
