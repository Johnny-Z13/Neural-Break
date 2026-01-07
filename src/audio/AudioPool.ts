/**
 * 🎵 Audio Pool Manager - Memory and Performance Optimization 🎵
 * Manages sound instances, prevents memory leaks, and limits concurrent sounds
 */

interface ActiveSound {
  nodes: AudioNode[]
  endTime: number
  priority: number
  category: SoundCategory
}

export enum SoundCategory {
  UI = 'ui',              // Always play (high priority)
  PLAYER = 'player',      // High priority
  WEAPON = 'weapon',      // Medium-high priority
  ENEMY = 'enemy',        // Medium priority
  AMBIENT = 'ambient',    // Low priority
  DEATH = 'death'         // Medium priority
}

export class AudioPool {
  private activeSounds: Set<ActiveSound> = new Set()
  private readonly MAX_CONCURRENT_SOUNDS = 48
  private readonly SOUND_BUDGETS: Record<SoundCategory, number> = {
    [SoundCategory.UI]: 8,
    [SoundCategory.PLAYER]: 8,
    [SoundCategory.WEAPON]: 12,
    [SoundCategory.ENEMY]: 8,
    [SoundCategory.AMBIENT]: 4,
    [SoundCategory.DEATH]: 8
  }
  
  // Performance tracking
  private totalNodesCreated = 0
  private totalSoundsPlayed = 0
  private lastCleanupTime = 0
  private readonly CLEANUP_INTERVAL = 1000 // Cleanup every second

  canPlaySound(category: SoundCategory, priority: number = 5): boolean {
    // Always allow high-priority UI sounds
    if (category === SoundCategory.UI && priority >= 9) {
      return true
    }

    // Check total limit
    if (this.activeSounds.size >= this.MAX_CONCURRENT_SOUNDS) {
      // Try to steal from lowest priority sound
      return this.tryStealSlot(priority)
    }

    // Check category budget
    const categoryCount = this.getCategorySoundCount(category)
    if (categoryCount >= this.SOUND_BUDGETS[category]) {
      return this.tryStealCategorySlot(category, priority)
    }

    return true
  }

  registerSound(
    nodes: AudioNode[],
    duration: number,
    category: SoundCategory,
    priority: number = 5
  ): void {
    if (!this.canPlaySound(category, priority)) {
      // Clean up nodes immediately if sound can't play
      this.disconnectNodes(nodes)
      return
    }

    const endTime = Date.now() / 1000 + duration
    const sound: ActiveSound = {
      nodes,
      endTime,
      priority,
      category
    }

    this.activeSounds.add(sound)
    this.totalNodesCreated += nodes.length
    this.totalSoundsPlayed++

    // Schedule cleanup
    setTimeout(() => {
      this.cleanupSound(sound)
    }, (duration + 0.1) * 1000)

    // Periodic global cleanup
    this.periodicCleanup()
  }

  private cleanupSound(sound: ActiveSound): void {
    if (this.activeSounds.has(sound)) {
      this.disconnectNodes(sound.nodes)
      this.activeSounds.delete(sound)
    }
  }

  private disconnectNodes(nodes: AudioNode[]): void {
    nodes.forEach(node => {
      try {
        node.disconnect()
      } catch (e) {
        // Already disconnected, ignore
      }
    })
  }

  private tryStealSlot(newPriority: number): boolean {
    // Find lowest priority sound
    let lowestPriority = newPriority
    let lowestSound: ActiveSound | null = null

    for (const sound of this.activeSounds) {
      if (sound.priority < lowestPriority) {
        lowestPriority = sound.priority
        lowestSound = sound
      }
    }

    if (lowestSound) {
      this.cleanupSound(lowestSound)
      return true
    }

    return false
  }

  private tryStealCategorySlot(category: SoundCategory, newPriority: number): boolean {
    let lowestPriority = newPriority
    let lowestSound: ActiveSound | null = null

    for (const sound of this.activeSounds) {
      if (sound.category === category && sound.priority < lowestPriority) {
        lowestPriority = sound.priority
        lowestSound = sound
      }
    }

    if (lowestSound) {
      this.cleanupSound(lowestSound)
      return true
    }

    return false
  }

  private getCategorySoundCount(category: SoundCategory): number {
    let count = 0
    for (const sound of this.activeSounds) {
      if (sound.category === category) {
        count++
      }
    }
    return count
  }

  private periodicCleanup(): void {
    const now = Date.now()
    if (now - this.lastCleanupTime < this.CLEANUP_INTERVAL) {
      return
    }

    this.lastCleanupTime = now
    const currentTime = now / 1000

    // Clean up expired sounds
    for (const sound of this.activeSounds) {
      if (sound.endTime < currentTime) {
        this.cleanupSound(sound)
      }
    }
  }

  // Force cleanup all sounds (for game over, menu transitions, etc.)
  forceCleanupAll(): void {
    for (const sound of this.activeSounds) {
      this.disconnectNodes(sound.nodes)
    }
    this.activeSounds.clear()
  }

  // Cleanup sounds by category (e.g., cleanup all enemy sounds when clearing enemies)
  cleanupCategory(category: SoundCategory): void {
    for (const sound of this.activeSounds) {
      if (sound.category === category) {
        this.cleanupSound(sound)
      }
    }
  }

  // Debug information
  getDebugInfo(): {
    activeSounds: number
    totalNodesCreated: number
    totalSoundsPlayed: number
    memoryEstimateMB: string
    breakdown: Record<SoundCategory, number>
  } {
    const breakdown: Record<SoundCategory, number> = {
      [SoundCategory.UI]: 0,
      [SoundCategory.PLAYER]: 0,
      [SoundCategory.WEAPON]: 0,
      [SoundCategory.ENEMY]: 0,
      [SoundCategory.AMBIENT]: 0,
      [SoundCategory.DEATH]: 0
    }

    for (const sound of this.activeSounds) {
      breakdown[sound.category]++
    }

    return {
      activeSounds: this.activeSounds.size,
      totalNodesCreated: this.totalNodesCreated,
      totalSoundsPlayed: this.totalSoundsPlayed,
      memoryEstimateMB: ((this.totalNodesCreated * 3) / 1024).toFixed(2),
      breakdown
    }
  }
}

