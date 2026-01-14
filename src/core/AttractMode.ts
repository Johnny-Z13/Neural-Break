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
import { DataMite } from '../entities/DataMite'
import { ScanDrone } from '../entities/ScanDrone'
import { ChaosWorm } from '../entities/ChaosWorm'
import { VoidSphere } from '../entities/VoidSphere'
import { CrystalShardSwarm } from '../entities/CrystalShardSwarm'
import { Fizzer } from '../entities/Fizzer'
import { UFO } from '../entities/UFO'
import { Boss } from '../entities/Boss'

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
  private spawnTimer: number = 0
  private spawnInterval: number = 1.5 // Spawn every 1.5 seconds
  private maxEnemies: number = 12 // Maximum enemies on screen
  private isActive: boolean = false
  private readonly boundaryRadius: number = 35 // Larger than gameplay area
  
  // Enemy type pool for variety
  private readonly enemyTypes = [
    'datamite',
    'scandrone',
    'chaosworm',
    'voidsphere',
    'crystal',
    'fizzer',
    'ufo',
    'boss'
  ]

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  /**
   * Start attract mode
   */
  start(): void {
    if (this.isActive) return
    
    this.isActive = true
    this.spawnTimer = 0
    console.log('🎮 Attract Mode: Started')
    
    // Spawn initial enemies for immediate visual impact
    for (let i = 0; i < 4; i++) {
      this.spawnRandomEnemy()
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
   * Update attract mode - spawn and move enemies
   */
  update(deltaTime: number): void {
    if (!this.isActive) return

    // Spawn new enemies periodically
    this.spawnTimer += deltaTime
    if (this.spawnTimer >= this.spawnInterval && this.enemies.length < this.maxEnemies) {
      this.spawnRandomEnemy()
      this.spawnTimer = 0
      // Vary spawn interval for organic feel
      this.spawnInterval = 1.0 + Math.random() * 2.0
    }

    // Update all enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const attractEnemy = this.enemies[i]
      
      // Update enemy animation (but catch any errors from missing game systems)
      try {
        attractEnemy.enemy.update(deltaTime)
      } catch (error) {
        // Silently handle errors from enemies trying to access missing game systems
        // This is expected in attract mode where we don't have full game infrastructure
      }
      
      // Update autonomous movement
      this.updateEnemyMovement(attractEnemy, deltaTime)
      
      // Remove enemies that go too far off screen
      const pos = attractEnemy.enemy.position
      const distFromCenter = Math.sqrt(pos.x * pos.x + pos.y * pos.y)
      
      if (distFromCenter > this.boundaryRadius + 10) {
        if (attractEnemy.enemy.mesh) {
          this.scene.remove(attractEnemy.enemy.mesh)
        }
        attractEnemy.enemy.destroy()
        this.enemies.splice(i, 1)
      }
    }
  }

  /**
   * Spawn a random enemy type
   */
  private spawnRandomEnemy(): void {
    const type = this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)]
    
    // Spawn at random position around the edge
    const angle = Math.random() * Math.PI * 2
    const spawnRadius = this.boundaryRadius
    const x = Math.cos(angle) * spawnRadius
    const y = Math.sin(angle) * spawnRadius
    
    // Create enemy based on type
    let enemy: Enemy | null = null
    
    try {
      switch (type) {
        case 'datamite':
          enemy = new DataMite(x, y, this.scene)
          break
        case 'scandrone':
          enemy = new ScanDrone(x, y, this.scene)
          break
        case 'chaosworm':
          enemy = new ChaosWorm(x, y, this.scene)
          break
        case 'voidsphere':
          enemy = new VoidSphere(x, y, this.scene)
          break
        case 'crystal':
          enemy = new CrystalShardSwarm(x, y, this.scene)
          break
        case 'fizzer':
          enemy = new Fizzer(x, y, this.scene)
          break
        case 'ufo':
          enemy = new UFO(x, y, this.scene)
          break
        case 'boss':
          enemy = new Boss(x, y, this.scene)
          break
      }
    } catch (error) {
      console.warn('⚠️ Attract Mode: Failed to create enemy:', type, error)
      return
    }
    
    if (!enemy) return
    
    // Skip spawn animation - set enemy to ALIVE state immediately
    // This prevents errors from trying to access game systems that don't exist in attract mode
    // @ts-ignore - accessing protected property for attract mode
    enemy.state = EnemyState.ALIVE
    
    if (enemy.mesh) {
      enemy.mesh.scale.set(1, 1, 1)
      if (enemy.mesh.material && 'opacity' in enemy.mesh.material) {
        (enemy.mesh.material as any).opacity = 1
      }
    }
    
    // Set initial target position (towards center with some randomness)
    const targetAngle = angle + Math.PI + (Math.random() - 0.5) * Math.PI * 0.5
    const targetDist = Math.random() * this.boundaryRadius * 0.6
    const targetX = Math.cos(targetAngle) * targetDist
    const targetY = Math.sin(targetAngle) * targetDist
    
    // Create attract enemy wrapper
    const attractEnemy: AttractEnemy = {
      enemy,
      velocity: new THREE.Vector2(0, 0),
      targetPosition: new THREE.Vector2(targetX, targetY),
      retargetTimer: 0,
      retargetInterval: 3 + Math.random() * 4 // 3-7 seconds between retargets
    }
    
    this.enemies.push(attractEnemy)
  }

  /**
   * Update enemy movement with smooth wandering behavior
   */
  private updateEnemyMovement(attractEnemy: AttractEnemy, deltaTime: number): void {
    const enemy = attractEnemy.enemy
    const pos = enemy.position
    
    // Retarget periodically
    attractEnemy.retargetTimer += deltaTime
    if (attractEnemy.retargetTimer >= attractEnemy.retargetInterval) {
      attractEnemy.retargetTimer = 0
      attractEnemy.retargetInterval = 3 + Math.random() * 4
      
      // Pick new random target within bounds
      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * this.boundaryRadius * 0.7
      attractEnemy.targetPosition.set(
        Math.cos(angle) * dist,
        Math.sin(angle) * dist
      )
    }
    
    // Move towards target with smooth acceleration
    const dx = attractEnemy.targetPosition.x - pos.x
    const dy = attractEnemy.targetPosition.y - pos.y
    const distToTarget = Math.sqrt(dx * dx + dy * dy)
    
    if (distToTarget > 1) {
      // Normalize direction
      const dirX = dx / distToTarget
      const dirY = dy / distToTarget
      
      // Different speeds for different enemy types
      let baseSpeed = 5.0
      if (enemy instanceof Fizzer) baseSpeed = 8.0
      if (enemy instanceof Boss) baseSpeed = 3.0
      if (enemy instanceof ChaosWorm) baseSpeed = 6.0
      
      // Smooth acceleration towards target
      const acceleration = 10.0
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
      // Slow down when near target
      attractEnemy.velocity.multiplyScalar(0.95)
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
