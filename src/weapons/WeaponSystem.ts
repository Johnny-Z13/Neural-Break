import * as THREE from 'three'
import { Player } from '../entities/Player'
import { Enemy } from '../entities/Enemy'
import { Projectile } from './Projectile'
import { SceneManager } from '../graphics/SceneManager'
import { InputManager } from '../core/InputManager'
import { AudioManager } from '../audio/AudioManager'

export class WeaponSystem {
  private projectiles: Projectile[] = []
  private player: Player
  private sceneManager: SceneManager
  private audioManager: AudioManager
  private fireTimer: number = 0
  private fireRate: number = 0.2 // Faster firing for ASTEROIDS-style gameplay
  private damage: number = 2
  private projectileSpeed: number = 15
  private range: number = 15
  private lastFiringDirection: THREE.Vector3 = new THREE.Vector3(0, 1, 0) // Default up

  initialize(player: Player, sceneManager: SceneManager, audioManager: AudioManager): void {
    this.player = player
    this.sceneManager = sceneManager
    this.audioManager = audioManager
  }

  update(deltaTime: number, enemies: Enemy[], inputManager: InputManager): void {
    // Update fire timer
    this.fireTimer += deltaTime

    // ASTEROIDS-style firing - fire in movement direction or last movement direction
    if (inputManager.isFiring() && this.fireTimer >= this.fireRate) {
      this.fireInDirection(inputManager)
      this.fireTimer = 0
    }

    // Update all projectiles
    for (const projectile of this.projectiles) {
      if (projectile.isAlive()) {
        projectile.update(deltaTime)
      }
    }

    // Remove dead projectiles
    this.cleanupProjectiles()
  }

  private findClosestEnemy(enemies: Enemy[]): Enemy | null {
    let closestEnemy: Enemy | null = null
    let closestDistance = this.range

    const playerPos = this.player.getPosition()

    for (const enemy of enemies) {
      if (enemy.isAlive()) {
        const distance = playerPos.distanceTo(enemy.getPosition())
        if (distance < closestDistance) {
          closestDistance = distance
          closestEnemy = enemy
        }
      }
    }

    return closestEnemy
  }

  private fireInDirection(inputManager: InputManager): void {
    const playerPos = this.player.getPosition()
    const movement = inputManager.getMovementVector()
    
    // Determine firing direction
    let firingDirection: THREE.Vector3
    if (movement.x !== 0 || movement.y !== 0) {
      // Fire in movement direction
      firingDirection = new THREE.Vector3(movement.x, movement.y, 0).normalize()
      this.lastFiringDirection = firingDirection.clone()
    } else {
      // Fire in last movement direction if not moving
      firingDirection = this.lastFiringDirection.clone()
    }
    
    // Create projectile
    const projectile = new Projectile(
      playerPos.clone().add(firingDirection.clone().multiplyScalar(0.5)), // Start slightly in front of player
      firingDirection,
      this.projectileSpeed,
      this.damage
    )

    this.projectiles.push(projectile)
    this.sceneManager.addToScene(projectile.getMesh())

    // Audio feedback for firing
    this.audioManager.playFireSound()

    // Visual feedback for firing
    this.createMuzzleFlash(playerPos, firingDirection)
  }

  private createMuzzleFlash(position: THREE.Vector3, direction: THREE.Vector3): void {
    // Create temporary muzzle flash effect
    const geometry = new THREE.RingGeometry(0.1, 0.3, 8)
    const material = new THREE.MeshBasicMaterial({
      color: 0x00FFFF,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })

    const flash = new THREE.Mesh(geometry, material)
    flash.position.copy(position)
    flash.lookAt(position.clone().add(direction))
    
    this.sceneManager.addToScene(flash)

    // Animate and remove flash
    let flashTime = 0.1
    const animateFlash = () => {
      flashTime -= 0.016 // ~60fps
      material.opacity = flashTime / 0.1
      
      if (flashTime <= 0) {
        this.sceneManager.removeFromScene(flash)
      } else {
        requestAnimationFrame(animateFlash)
      }
    }
    animateFlash()
  }

  private cleanupProjectiles(): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i]
      if (!projectile.isAlive()) {
        this.sceneManager.removeFromScene(projectile.getMesh())
        this.projectiles.splice(i, 1)
      }
    }
  }

  removeProjectile(projectile: Projectile): void {
    const index = this.projectiles.indexOf(projectile)
    if (index !== -1) {
      this.sceneManager.removeFromScene(projectile.getMesh())
      this.projectiles.splice(index, 1)
    }
  }

  getProjectiles(): Projectile[] {
    return this.projectiles
  }

  // Upgrade methods for future expansion
  upgradeFireRate(multiplier: number): void {
    this.fireRate *= multiplier
  }

  upgradeDamage(amount: number): void {
    this.damage += amount
  }

  upgradeRange(amount: number): void {
    this.range += amount
  }
}
