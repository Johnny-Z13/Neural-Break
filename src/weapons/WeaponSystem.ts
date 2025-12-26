import * as THREE from 'three'
import { Player } from '../entities/Player'
import { Enemy } from '../entities/Enemy'
import { Projectile } from './Projectile'
import { SceneManager } from '../graphics/SceneManager'
import { InputManager } from '../core/InputManager'
import { AudioManager } from '../audio/AudioManager'
import { EffectsSystem } from '../graphics/EffectsSystem'

// 🎯 WEAPON TYPES 🎯
export enum WeaponType {
  BULLETS = 'bullets',
  LASERS = 'lasers',
  PHOTONS = 'photons'
}

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
  private lastFiringDirection: THREE.Vector3 = new THREE.Vector3(0, 1, 0) // Default up (matches player initial facing)
  private effectsSystem: EffectsSystem | null = null
  
  // 🎯 WEAPON TYPE SYSTEM 🎯
  private currentWeaponType: WeaponType = WeaponType.BULLETS
  private weaponTypeChangeCallback: ((weaponType: WeaponType) => void) | null = null

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
    
    // 🎯 ALWAYS fire in the direction the ship is VISUALLY facing! 🎯
    // This ensures bullets come out of the nose of the ship, not based on input lag
    const firingDirection = this.player.getFacingDirection()
    
    // Update last firing direction for reference
    this.lastFiringDirection = firingDirection.clone()
    
    // Get power-up level from player
    const powerUpLevel = this.player.getPowerUpLevel()
    
    // Calculate weapon stats based on power-up level
    const bulletCount = 1 + powerUpLevel // 1 bullet at level 0, 11 at level 10
    const speedMultiplier = 1 + powerUpLevel * 0.1 // +10% per level (was 15%, adjusted)
    const damageMultiplier = 1 + powerUpLevel * 0.15 // +15% per level
    const sizeMultiplier = 1 + powerUpLevel * 0.1 // +10% per level
    
    // Calculate spread pattern
    const maxSpread = 30 * (Math.PI / 180) // 30 degrees in radians
    const spreadAngle = maxSpread * (1 - powerUpLevel / 10) // Narrows as level increases
    
    // Fire multiple bullets
    for (let i = 0; i < bulletCount; i++) {
      let bulletDirection: THREE.Vector3
      
      if (bulletCount === 1) {
        // Single bullet - fire straight
        bulletDirection = firingDirection.clone()
      } else {
        // Multiple bullets - spread pattern
        const angleOffset = (i - (bulletCount - 1) / 2) * (spreadAngle / (bulletCount - 1))
        
        // Rotate firing direction by angle offset
        const cos = Math.cos(angleOffset)
        const sin = Math.sin(angleOffset)
        bulletDirection = new THREE.Vector3(
          firingDirection.x * cos - firingDirection.y * sin,
          firingDirection.x * sin + firingDirection.y * cos,
          0
        ).normalize()
      }
      
      // Create projectile with scaled stats, weapon type, AND POWER LEVEL for VFX scaling!
      const projectile = new Projectile(
        playerPos.clone().add(bulletDirection.clone().multiplyScalar(0.5)), // Start slightly in front of player
        bulletDirection,
        this.projectileSpeed * speedMultiplier,
        this.damage * damageMultiplier,
        sizeMultiplier,
        this.currentWeaponType, // Pass weapon type
        powerUpLevel // 🔥 Pass power level for VFX scaling!
      )
      
      // 🎆 Connect effects system for SUPER JUICY projectiles!
      if (this.effectsSystem) {
        projectile.setEffectsSystem(this.effectsSystem)
      }

      this.projectiles.push(projectile)
      this.sceneManager.addToScene(projectile.getMesh())
    }

    // 🔥 Audio feedback for firing - NOW WITH POWER SCALING! 🔥
    this.audioManager.playPowerScaledFireSound(powerUpLevel, this.currentWeaponType)

    // 🔥 Visual feedback for firing - NOW WITH POWER SCALING! 🔥
    this.createMuzzleFlash(playerPos, firingDirection, powerUpLevel)
  }

  private createMuzzleFlash(position: THREE.Vector3, direction: THREE.Vector3, powerLevel: number = 0): void {
    // 🎯 PERFORMANCE-OPTIMIZED MUZZLE FLASH - Single mesh only! 🎯
    // Visual impact from size/opacity, not multiple meshes
    const baseInnerRadius = 0.06 + powerLevel * 0.008
    const baseOuterRadius = 0.18 + powerLevel * 0.02
    const segments = 6 // Fixed low segment count for performance
    
    // Color based on weapon type
    let flashColor: number
    switch (this.currentWeaponType) {
      case WeaponType.LASERS:
        flashColor = powerLevel >= 5 ? 0xFF55AA : 0xFF0066
        break
      case WeaponType.PHOTONS:
        flashColor = powerLevel >= 5 ? 0x66FFFF : 0x00FFFF
        break
      default: // BULLETS
        flashColor = powerLevel >= 5 ? 0xFFDD00 : 0xFFAA00
    }
    
    const geometry = new THREE.RingGeometry(baseInnerRadius, baseOuterRadius, segments)
    const material = new THREE.MeshBasicMaterial({
      color: flashColor,
      transparent: true,
      opacity: 0.7 + powerLevel * 0.02,
      blending: THREE.AdditiveBlending
    })

    const flash = new THREE.Mesh(geometry, material)
    flash.position.copy(position)
    flash.lookAt(position.clone().add(direction))
    
    this.sceneManager.addToScene(flash)
    
    // REMOVED: Extra flash rings - single mesh is sufficient and performant

    // Fast flash animation - fixed duration
    const flashDuration = 0.08
    let flashTime = flashDuration
    const animateFlash = () => {
      flashTime -= 0.016 // ~60fps
      const progress = flashTime / flashDuration
      material.opacity = progress * (0.7 + powerLevel * 0.02)
      
      if (flashTime <= 0) {
        this.sceneManager.removeFromScene(flash)
        geometry.dispose()
        material.dispose()
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

  cleanup(): void {
    // Remove all projectiles from scene and clear array
    for (const projectile of this.projectiles) {
      this.sceneManager.removeFromScene(projectile.getMesh())
    }
    this.projectiles = []
    
    // Reset firing state
    this.fireTimer = 0
    this.lastFiringDirection = new THREE.Vector3(0, 1, 0) // Reset to default up
    
    console.log('🧹 WeaponSystem cleaned up and reset')
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
  
  // 🎆 SET EFFECTS SYSTEM FOR SUPER JUICY EFFECTS! 🎆
  setEffectsSystem(effectsSystem: EffectsSystem): void {
    this.effectsSystem = effectsSystem
  }
  
  // 🎯 WEAPON TYPE METHODS 🎯
  getCurrentWeaponType(): WeaponType {
    return this.currentWeaponType
  }
  
  setWeaponType(weaponType: WeaponType): void {
    if (this.currentWeaponType !== weaponType) {
      this.currentWeaponType = weaponType
      
      // Adjust stats based on weapon type
      switch (weaponType) {
        case WeaponType.BULLETS:
          this.fireRate = 0.2
          this.damage = 2
          this.projectileSpeed = 15
          break
        case WeaponType.LASERS:
          this.fireRate = 0.15 // Faster
          this.damage = 3 // More damage
          this.projectileSpeed = 20 // Faster
          break
        case WeaponType.PHOTONS:
          this.fireRate = 0.1 // Very fast
          this.damage = 4 // High damage
          this.projectileSpeed = 25 // Very fast
          break
      }
      
      // Notify UI of weapon change
      if (this.weaponTypeChangeCallback) {
        this.weaponTypeChangeCallback(weaponType)
      }
      
      console.log(`🎯 Weapon changed to: ${weaponType.toUpperCase()}`)
    }
  }
  
  setWeaponTypeChangeCallback(callback: (weaponType: WeaponType) => void): void {
    this.weaponTypeChangeCallback = callback
  }
  
  // 🎯 CYCLE WEAPON TYPE - Called when power-up is collected 🎯
  cycleWeaponType(): void {
    const weaponTypes = [WeaponType.BULLETS, WeaponType.LASERS, WeaponType.PHOTONS]
    const currentIndex = weaponTypes.indexOf(this.currentWeaponType)
    const nextIndex = (currentIndex + 1) % weaponTypes.length
    this.setWeaponType(weaponTypes[nextIndex])
  }
}
