import { Starfield } from './Starfield'

/**
 * Singleton manager for the starfield background
 * Keeps starfield running between menu screens for seamless transitions
 */
export class StarfieldManager {
  private static instance: StarfieldManager | null = null
  private starfield: Starfield | null = null

  private constructor() {}

  static getInstance(): StarfieldManager {
    if (!StarfieldManager.instance) {
      StarfieldManager.instance = new StarfieldManager()
    }
    return StarfieldManager.instance
  }

  /**
   * Ensure starfield is running
   */
  start(): void {
    // Check if canvas already exists and is animating
    const existingCanvas = document.getElementById('starfieldCanvas')
    if (existingCanvas && this.starfield) {
      // Already running
      return
    }
    
    // Create new starfield if needed
    if (!this.starfield) {
      this.starfield = new Starfield()
    }
    
    this.starfield.start()
  }

  /**
   * Stop the starfield (when entering gameplay)
   */
  stop(): void {
    if (this.starfield) {
      this.starfield.stop()
    }
  }

  /**
   * Set starfield speed (1-10)
   */
  setSpeed(speed: number): void {
    if (this.starfield) {
      this.starfield.setSpeed(speed)
    }
  }

  /**
   * Check if starfield is currently active
   */
  isRunning(): boolean {
    return document.getElementById('starfieldCanvas') !== null
  }

  /**
   * Fully destroy the starfield (cleanup)
   */
  destroy(): void {
    if (this.starfield) {
      this.starfield.destroy()
      this.starfield = null
    }
  }
}
