/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎮 ATTRACT MODE - Visual Demo System
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Runs behind the title screen showing enemies flying around.
 * No player, no gameplay - just a visual showcase of enemy types.
 * 
 * Features:
 * - Random enemy spawning
 * - Autonomous movement patterns
 * - Visual variety with all enemy types
 * - Automatic cleanup when game starts
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import * as THREE from 'three'
import { Enemy, EnemyState } from '../entities/Enemy'
import { Fizzer } from '../entities/Fizzer'

interface AttractEnemy {
  enemy: Enemy
  velocity: THREE.Vector2
  targetPosition: THREE.Vector2
  retargetTimer: number
  retargetInterval: number
}

export class AttractMode {
  private enemies: AttractEnemy[] = []
  private scene: THREE.Scene
  private isActive: boolean = false
  private readonly boundaryRadius: number = 35 // Larger than gameplay area
  private readonly maxFizzers: number = 3 // Only 3 fizzers zipping about

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  /**
   * Start attract mode - spawns 3 fizzers immediately
   */
  start(): void {
    if (this.isActive) return

    this.isActive = true
    console.log('🎮 Attract Mode: Started (3 Fizzers)')

    // Spawn 3 fizzers immediately
    for (let i = 0; i < this.maxFizzers; i++) {
      this.spawnFizzer()
    }
  }

  /**
   * Stop attract mode and cleanup all enemies
   */
  stop(): void {
    if (!this.isActive) return
    
    this.isActive = false
    
    // Remove all enemies from scene
    for (const attractEnemy of this.enemies) {
      if (attractEnemy.enemy.mesh) {
        this.scene.remove(attractEnemy.enemy.mesh)
      }
      attractEnemy.enemy.destroy()
    }
    
    this.enemies = []
    console.log('🎮 Attract Mode: Stopped and cleaned up')
  }

  /**
   * Update attract mode - move fizzers around
   */
  update(deltaTime: number): void {
    if (!this.isActive) return

    // Update all fizzers
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const attractEnemy = this.enemies[i]

      // Update enemy animation (but catch any errors from missing game systems)
      try {
        attractEnemy.enemy.update(deltaTime)
      } catch {
        // Silently handle errors from enemies trying to access missing game systems
      }

      // Update autonomous movement - fizzers zip around fast!
      this.updateEnemyMovement(attractEnemy, deltaTime)

      // Wrap around screen edges instead of removing
      const pos = attractEnemy.enemy.position
      const wrapRadius = this.boundaryRadius * 0.8

      if (pos.x > wrapRadius) pos.x = -wrapRadius
      if (pos.x < -wrapRadius) pos.x = wrapRadius
      if (pos.y > wrapRadius) pos.y = -wrapRadius
      if (pos.y < -wrapRadius) pos.y = wrapRadius

      // Update mesh position after wrap
      if (attractEnemy.enemy.mesh) {
        attractEnemy.enemy.mesh.position.x = pos.x
        attractEnemy.enemy.mesh.position.y = pos.y
      }
    }

    // Respawn if we somehow lost a fizzer
    while (this.enemies.length < this.maxFizzers) {
      this.spawnFizzer()
    }
  }

  /**
   * Spawn a fizzer at a random position
   */
  private spawnFizzer(): void {
    // Spawn at random position within bounds
    const angle = Math.random() * Math.PI * 2
    const spawnRadius = Math.random() * this.boundaryRadius * 0.6
    const x = Math.cos(angle) * spawnRadius
    const y = Math.sin(angle) * spawnRadius

    let enemy: Enemy | null = null

    try {
      enemy = new Fizzer(x, y)
    } catch (error) {
      console.warn('⚠️ Attract Mode: Failed to create Fizzer:', error)
      return
    }

    if (!enemy) return

    // Initialize enemy to create its mesh
    enemy.initialize()

    // Skip spawn animation - set enemy to ALIVE state immediately
    // @ts-ignore - accessing protected property for attract mode
    enemy.state = EnemyState.ALIVE

    if (enemy.mesh) {
      enemy.mesh.scale.set(1, 1, 1)
      if (enemy.mesh.material && 'opacity' in enemy.mesh.material) {
        (enemy.mesh.material as any).opacity = 1
      }
      // Add enemy mesh to scene so it's visible!
      this.scene.add(enemy.mesh)
    }

    // Set random initial target
    const targetAngle = Math.random() * Math.PI * 2
    const targetDist = Math.random() * this.boundaryRadius * 0.6
    const targetX = Math.cos(targetAngle) * targetDist
    const targetY = Math.sin(targetAngle) * targetDist

    // Create attract enemy wrapper with fast retargeting for zippy movement
    const attractEnemy: AttractEnemy = {
      enemy,
      velocity: new THREE.Vector2(
        (Math.random() - 0.5) * 10, // Start with some velocity
        (Math.random() - 0.5) * 10
      ),
      targetPosition: new THREE.Vector2(targetX, targetY),
      retargetTimer: 0,
      retargetInterval: 1.0 + Math.random() * 1.5 // Fast retargeting: 1-2.5 seconds
    }

    this.enemies.push(attractEnemy)
  }

  /**
   * Update fizzer movement - fast and zippy!
   */
  private updateEnemyMovement(attractEnemy: AttractEnemy, deltaTime: number): void {
    const enemy = attractEnemy.enemy
    const pos = enemy.position

    // Retarget frequently for erratic movement
    attractEnemy.retargetTimer += deltaTime
    if (attractEnemy.retargetTimer >= attractEnemy.retargetInterval) {
      attractEnemy.retargetTimer = 0
      attractEnemy.retargetInterval = 0.8 + Math.random() * 1.2 // Very fast retargeting

      // Pick new random target within bounds
      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * this.boundaryRadius * 0.7
      attractEnemy.targetPosition.set(
        Math.cos(angle) * dist,
        Math.sin(angle) * dist
      )
    }

    // Move towards target with snappy acceleration
    const dx = attractEnemy.targetPosition.x - pos.x
    const dy = attractEnemy.targetPosition.y - pos.y
    const distToTarget = Math.sqrt(dx * dx + dy * dy)

    if (distToTarget > 1) {
      // Normalize direction
      const dirX = dx / distToTarget
      const dirY = dy / distToTarget

      // Fast fizzer speed!
      const baseSpeed = 12.0
      const acceleration = 25.0

      // Snappy acceleration towards target
      attractEnemy.velocity.x += dirX * acceleration * deltaTime
      attractEnemy.velocity.y += dirY * acceleration * deltaTime

      // Limit velocity
      const speed = Math.sqrt(
        attractEnemy.velocity.x * attractEnemy.velocity.x +
        attractEnemy.velocity.y * attractEnemy.velocity.y
      )
      if (speed > baseSpeed) {
        attractEnemy.velocity.x = (attractEnemy.velocity.x / speed) * baseSpeed
        attractEnemy.velocity.y = (attractEnemy.velocity.y / speed) * baseSpeed
      }
    } else {
      // Quick direction change when reaching target
      attractEnemy.retargetTimer = attractEnemy.retargetInterval // Force retarget
    }

    // Apply velocity
    enemy.position.x += attractEnemy.velocity.x * deltaTime
    enemy.position.y += attractEnemy.velocity.y * deltaTime

    // Update mesh position
    if (enemy.mesh) {
      enemy.mesh.position.x = enemy.position.x
      enemy.mesh.position.y = enemy.position.y
    }
  }

  /**
   * Check if attract mode is currently active
   */
  isRunning(): boolean {
    return this.isActive
  }

  /**
   * Get current enemy count (for debugging)
   */
  getEnemyCount(): number {
    return this.enemies.length
  }
}
