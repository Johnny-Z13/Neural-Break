/**
 * High Score Service - Abstracted storage layer
 * Supports localStorage (current) and can be extended for backend API
 */

import { HighScoreEntry } from '../core/GameState'

export interface IHighScoreService {
  saveHighScore(entry: HighScoreEntry): Promise<boolean>
  getHighScores(): Promise<HighScoreEntry[]>
  clearAllScores(): Promise<void>
}

/**
 * LocalStorage implementation (current - for development/local)
 * ⚠️ WARNING: Not secure, can be manipulated, domain-specific
 */
export class LocalStorageHighScoreService implements IHighScoreService {
  private readonly STORAGE_KEY = 'neural_break_high_scores'
  private readonly LAST_NAME_KEY = 'neural_break_last_player_name' // Remember last name
  private readonly MAX_SCORES = 10
  private readonly MAX_NAME_LENGTH = 20

  async saveHighScore(entry: HighScoreEntry): Promise<boolean> {
    try {
      // Validate entry
      if (!this.validateEntry(entry)) {
        console.warn('❌ Invalid high score entry:', entry)
        return false
      }

      // Sanitize entry
      const sanitized = this.sanitizeEntry(entry)

      const highScores = await this.getHighScores()
      
      // Check if this is actually a high score
      if (highScores.length >= this.MAX_SCORES) {
        const lowestScore = highScores[highScores.length - 1].score
        if (sanitized.score <= lowestScore) {
          return false // Not a high score
        }
      }

      highScores.push(sanitized)
      
      // Sort by score descending, then by date (newer first for ties)
      highScores.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score
        }
        // For ties, prefer newer entries
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
      
      // Keep only top scores
      const trimmedScores = highScores.slice(0, this.MAX_SCORES)
      
      // Save to localStorage
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedScores))
        
        // 💾 REMEMBER LAST PLAYER NAME for convenience! 💾
        localStorage.setItem(this.LAST_NAME_KEY, sanitized.name)
        
        // Verify the entry was saved (check by score and name)
        const saved = trimmedScores.some(
          s => s.score === sanitized.score && s.name === sanitized.name
        )
        
        if (saved) {
          console.log(`✅ High score saved successfully: ${sanitized.name} - ${sanitized.score}`)
        }
        
        return saved
      } else {
        console.warn('⚠️ localStorage not available')
        return false
      }
    } catch (error) {
      console.error('❌ Error saving high score:', error)
      return false
    }
  }

  async getHighScores(): Promise<HighScoreEntry[]> {
    try {
      if (!this.isLocalStorageAvailable()) {
        return []
      }

      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) {
        return []
      }

      const parsed = JSON.parse(stored) as HighScoreEntry[]
      
      // Validate all entries
      const validScores = parsed.filter(entry => this.validateEntry(entry))
      
      // Re-sort in case of corruption
      validScores.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
      
      return validScores.slice(0, this.MAX_SCORES)
    } catch (error) {
      console.error('❌ Error loading high scores:', error)
      // Try to recover by clearing corrupted data
      try {
        localStorage.removeItem(this.STORAGE_KEY)
      } catch (e) {
        // Ignore
      }
      return []
    }
  }

  async clearAllScores(): Promise<void> {
    try {
      if (this.isLocalStorageAvailable()) {
        localStorage.removeItem(this.STORAGE_KEY)
      }
    } catch (error) {
      console.error('❌ Error clearing high scores:', error)
    }
  }

  private validateEntry(entry: HighScoreEntry): boolean {
    // Check required fields
    if (!entry || typeof entry !== 'object') {
      return false
    }

    // Validate name
    if (!entry.name || typeof entry.name !== 'string' || entry.name.trim().length === 0) {
      return false
    }

    if (entry.name.length > this.MAX_NAME_LENGTH) {
      return false
    }

    // Validate score
    if (typeof entry.score !== 'number' || !isFinite(entry.score) || entry.score < 0) {
      return false
    }

    // Validate survivedTime
    if (typeof entry.survivedTime !== 'number' || !isFinite(entry.survivedTime) || entry.survivedTime < 0) {
      return false
    }

    // Validate level
    if (typeof entry.level !== 'number' || !isFinite(entry.level) || entry.level < 1) {
      return false
    }

    // Validate date
    if (!entry.date || typeof entry.date !== 'string') {
      return false
    }

    return true
  }

  private sanitizeEntry(entry: HighScoreEntry): HighScoreEntry {
    return {
      name: entry.name.trim().substring(0, this.MAX_NAME_LENGTH),
      score: Math.floor(Math.max(0, entry.score)),
      survivedTime: Math.max(0, entry.survivedTime),
      level: Math.max(1, Math.floor(entry.level)),
      date: entry.date || new Date().toLocaleDateString()
    }
  }

  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }
  
  // 💾 GET LAST PLAYER NAME - For convenience! 💾
  getLastPlayerName(): string {
    try {
      if (this.isLocalStorageAvailable()) {
        const lastName = localStorage.getItem(this.LAST_NAME_KEY)
        return lastName || ''
      }
    } catch (error) {
      console.warn('⚠️ Error getting last player name:', error)
    }
    return ''
  }
}

/**
 * API High Score Service (for future backend integration)
 * TODO: Implement when backend is ready
 */
export class APIHighScoreService implements IHighScoreService {
  private readonly API_URL = import.meta.env.VITE_API_URL || '/api/highscores'

  async saveHighScore(entry: HighScoreEntry): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry)
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()
      return result.success === true
    } catch (error) {
      console.error('❌ Error saving high score to API:', error)
      return false
    }
  }

  async getHighScores(): Promise<HighScoreEntry[]> {
    try {
      const response = await fetch(`${this.API_URL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('❌ Error loading high scores from API:', error)
      return []
    }
  }

  async clearAllScores(): Promise<void> {
    // Not typically available via API for security
    console.warn('⚠️ clearAllScores not available via API')
  }
}

/**
 * Factory to get the appropriate service
 * Can be configured via environment variable or config
 */
export class HighScoreServiceFactory {
  private static instance: IHighScoreService | null = null

  static getService(): IHighScoreService {
    if (this.instance) {
      return this.instance
    }

    // Check if API mode is enabled (use import.meta.env for Vite)
    const useAPI = import.meta.env.VITE_USE_API_HIGHSCORES === 'true'
    
    if (useAPI) {
      console.log('📡 Using API High Score Service')
      this.instance = new APIHighScoreService()
    } else {
      console.log('💾 Using LocalStorage High Score Service')
      this.instance = new LocalStorageHighScoreService()
    }

    return this.instance
  }

  static setService(service: IHighScoreService): void {
    this.instance = service
  }
}

