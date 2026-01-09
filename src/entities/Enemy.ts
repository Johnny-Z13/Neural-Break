import * as THREE from 'three'
import { Player } from './Player'
import { EffectsSystem } from '../graphics/EffectsSystem'
import { EnemyProjectile } from '../weapons/EnemyProjectile'
import { AudioManager } from '../audio/AudioManager'

// 🌟 ENEMY LIFECYCLE STATE MACHINE 🌟
export enum EnemyState {
  SPAWNING = 'spawning',
  ALIVE = 'alive',
  DYING = 'dying',
  DEAD = 'dead'
}

// 🎬 ANIMATION CONFIGURATION INTERFACES 🎬
export interface SpawnConfig {
  duration: number
  invulnerable: boolean
  particles?: {
    count: number
    colors: number[]
    speed: number
    burstAtStart?: boolean
  }
  sound?: string
  screenFlash?: {
    intensity: number
    color: number
  }
}

export interface DeathConfig {
  duration: number
  particles?: {
    count: number
    colors: number[]
    speed: number
  }
  sound?: string
  screenFlash?: {
    intensity: number
    color: number
  }
  explosion?: {
    size: number
    color: number
  }
  distortionWave?: {
    radius: number
  }
  electricDeath?: boolean
}

export abstract class Enemy {
  protected mesh: THREE.Mesh
  protected position: THREE.Vector3
  protected velocity: THREE.Vector3
  protected health: number
  protected maxHealth: number
  protected speed: number
  protected damage: number
  protected xpValue: number
  protected radius: number
  protected alive: boolean = true
  protected effectsSystem: EffectsSystem | null = null
  protected audioManager: AudioManager | null = null
  protected lastPosition: THREE.Vector3 = new THREE.Vector3()
  protected trailTimer: number = 0
  protected trailInterval: number = 0.05 // Trail every 50ms
  
  // 📊 KILL TRACKING - Separate from alive flag for enemies with death animations! 📊
  private killTracked: boolean = false
  
  // 💥 DEATH DAMAGE - Enemies damage nearby enemies when they die! 💥
  protected deathDamageRadius: number = 3.0 // Default radius for death damage
  protected deathDamageAmount: number = 10 // Default damage to nearby enemies
  
  // 🎬 LIFECYCLE STATE MACHINE 🎬
  protected state: EnemyState = EnemyState.SPAWNING
  protected animTimer: number = 0
  private spawnSoundPlayed: boolean = false
  private deathSoundPlayed: boolean = false

  constructor(x: number, y: number) {
    this.position = new THREE.Vector3(x, y, 0)
    this.velocity = new THREE.Vector3(0, 0, 0)
  }

  abstract initialize(): void
  abstract updateAI(deltaTime: number, player: Player): void
  
  // 🎬 LIFECYCLE CONFIGURATION - Override in subclasses for custom behavior 🎬
  protected getSpawnConfig(): SpawnConfig {
    return {
      duration: 0.25,
      invulnerable: true,
      particles: {
        count: 8,
        colors: [0xFF6600, 0xFF8800],
        speed: 3,
        burstAtStart: true
      }
    }
  }
  
  protected getDeathConfig(): DeathConfig {
    return {
      duration: 0,
      particles: {
        count: 15,
        colors: [0xFF4400, 0xFF6600],
        speed: 3
      },
      explosion: {
        size: 1.2,
        color: 0xFF4400
      }
    }
  }
  
  // 🎬 LIFECYCLE HOOKS - Override for custom animations 🎬
  protected onSpawnUpdate(progress: number): void {
    // Default: elastic scale-in
    const elasticProgress = progress < 1 
      ? 1 - Math.pow(1 - progress, 3) * Math.cos(progress * Math.PI * 2)
      : 1
    this.mesh.scale.setScalar(Math.max(0.01, elasticProgress))
  }
  
  protected onDeathUpdate(progress: number): void {
    // Default: fade out
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
        const material = child.material as THREE.MeshBasicMaterial | THREE.LineBasicMaterial
        if (material && material.opacity !== undefined) {
          material.opacity = 1 - progress
        }
      }
    })
  }

  update(deltaTime: number, player: Player): void {
    // 🎬 LIFECYCLE STATE MACHINE UPDATE 🎬
    switch (this.state) {
      case EnemyState.SPAWNING:
        this.updateSpawnAnimation(deltaTime)
        this.updateVisuals(deltaTime)
        return
        
      case EnemyState.DYING:
        this.updateDeathAnimation(deltaTime)
        this.updateVisuals(deltaTime)
        return
        
      case EnemyState.DEAD:
        return
        
      case EnemyState.ALIVE:
        // Normal behavior - continue below
        break
    }
    
    if (!this.alive) return

    // Store last position for trail calculation
    this.lastPosition.copy(this.position)
    
    this.updateAI(deltaTime, player)
    
    // Update position
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime))
    this.mesh.position.set(this.position.x, this.position.y, 0) // Ensure z=0 for top-down view
    
    // Create trail effects if moving fast enough and effects system is available
    this.updateTrails(deltaTime)

    // Update visual effects
    this.updateVisuals(deltaTime)
  }

  // 🌟 SPAWN ANIMATION HANDLER 🌟
  private updateSpawnAnimation(deltaTime: number): void {
    const config = this.getSpawnConfig()
    this.animTimer += deltaTime
    const progress = Math.min(1.0, this.animTimer / config.duration)
    
    // Play spawn sound at start
    if (!this.spawnSoundPlayed) {
      this.spawnSoundPlayed = true
      if (config.particles?.burstAtStart && this.effectsSystem) {
        this.spawnParticleBurst(config.particles)
      }
      if (config.screenFlash && this.effectsSystem) {
        this.effectsSystem.addScreenFlash(
          config.screenFlash.intensity,
          new THREE.Color(config.screenFlash.color)
        )
      }
      if (config.sound && this.audioManager) {
        // Play spawn sound if defined (can be added to AudioManager later)
      }
    }
    
    // Call subclass hook for custom spawn animation
    this.onSpawnUpdate(progress)
    
    // Complete spawn
    if (progress >= 1.0) {
      this.state = EnemyState.ALIVE
      this.animTimer = 0
    }
  }
  
  // 💀 DEATH ANIMATION HANDLER 💀
  private updateDeathAnimation(deltaTime: number): void {
    const config = this.getDeathConfig()
    this.animTimer += deltaTime
    const progress = config.duration > 0 
      ? Math.min(1.0, this.animTimer / config.duration)
      : 1.0
    
    // Call subclass hook for custom death animation
    this.onDeathUpdate(progress)
    
    // Complete death
    if (progress >= 1.0) {
      this.state = EnemyState.DEAD
      this.alive = false
      this.mesh.visible = false
    }
  }

  protected updateVisuals(deltaTime: number): void {
    // Default pulsing effect (only when alive)
    if (this.state === EnemyState.ALIVE) {
      const pulse = Math.sin(Date.now() * 0.005) * 0.1 + 1
      this.mesh.scale.setScalar(pulse)
    }
  }

  takeDamage(damage: number): void {
    // 🛡️ INVULNERABLE DURING SPAWN/DEATH ANIMATIONS! 🛡️
    const config = this.getSpawnConfig()
    if (this.state === EnemyState.SPAWNING && config.invulnerable) return
    if (this.state === EnemyState.DYING || this.state === EnemyState.DEAD) return
    
    const wasAlive = this.alive
    this.health -= damage
    
    // 🔴 RED FLASH + HIT SOUND - Just like player ship! 🔴
    if (wasAlive && this.health > 0) {
      // Enemy is HIT but NOT KILLED - show clear feedback!
      this.flashRed()
      
      // Play hit sound
      if (this.audioManager) {
        this.audioManager.playEnemyHitSound()
      }
    }

    if (this.health <= 0 && this.state === EnemyState.ALIVE) {
      this.startDeathSequence()
    }
  }
  
  // 💀 START DEATH SEQUENCE 💀
  private startDeathSequence(): void {
    this.state = EnemyState.DYING
    this.animTimer = 0
    this.deathSoundPlayed = false
    
    const config = this.getDeathConfig()
    
    // Play death sound
    if (!this.deathSoundPlayed && this.audioManager) {
      this.deathSoundPlayed = true
      const enemyType = this.constructor.name
      this.audioManager.playEnemyDeathSound(enemyType)
    }
    
    // Trigger death effects at start
    if (this.effectsSystem) {
      // Particles
      if (config.particles) {
        this.spawnParticleBurst(config.particles)
      }
      
      // Explosion
      if (config.explosion) {
        this.effectsSystem.createExplosion(
          this.position,
          config.explosion.size,
          new THREE.Color(config.explosion.color)
        )
      }
      
      // Screen flash
      if (config.screenFlash) {
        this.effectsSystem.addScreenFlash(
          config.screenFlash.intensity,
          new THREE.Color(config.screenFlash.color)
        )
      }
      
      // Distortion wave
      if (config.distortionWave) {
        this.effectsSystem.addDistortionWave(
          this.position,
          config.distortionWave.radius
        )
      }
      
      // Electric death
      if (config.electricDeath) {
        const enemyType = this.constructor.name
        this.effectsSystem.createElectricDeath(this.position, enemyType)
      }
      
      // Vector death particles
      const enemyType = this.constructor.name
      const deathColor = config.explosion 
        ? new THREE.Color(config.explosion.color)
        : new THREE.Color(0xFF4400)
      this.effectsSystem.createEnemyDeathParticles(this.position, enemyType, deathColor)
    }
    
    // If no death animation duration, transition to dead immediately
    if (config.duration === 0) {
      this.state = EnemyState.DEAD
      this.alive = false
      this.mesh.visible = false
    }
  }
  
  // 💥 CENTRALIZED PARTICLE BURST HELPER 💥
  protected spawnParticleBurst(config: { count: number, colors: number[], speed: number }): void {
    if (!this.effectsSystem) return
    
    for (let i = 0; i < config.count; i++) {
      const angle = (i / config.count) * Math.PI * 2
      const speedVariance = config.speed + Math.random() * 2
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speedVariance,
        Math.sin(angle) * speedVariance,
        (Math.random() - 0.5) * 2
      )
      
      // Alternate between colors if multiple provided
      const colorHex = config.colors[i % config.colors.length]
      const color = new THREE.Color(colorHex)
      
      this.effectsSystem.createSparkle(this.position, velocity, color, 0.3)
    }
  }
  
  // 🔴 RED FLASH - Clear visual feedback that enemy was hit! 🔴
  private flashRed(): void {
    const material = this.mesh.material as THREE.MeshLambertMaterial
    const originalColor = material.color.clone()
    const originalEmissive = material.emissive.clone()
    const originalScale = this.mesh.scale.clone()
    
    // BRIGHT RED FLASH! (same as player)
    material.emissive.setHex(0xFF0000) // Pure red glow
    material.color.setHex(0xFF0000)    // Full red
    
    // Scale up for impact effect
    this.mesh.scale.multiplyScalar(1.3)
    
    // Flash sequence: Red → White → Red → Normal
    setTimeout(() => {
      material.emissive.setHex(0xFFFFFF) // White flash
      material.color.setHex(0xFFAAAA)    // Light red
    }, 50)
    
    setTimeout(() => {
      material.emissive.setHex(0xFF0000) // Back to red
      material.color.setHex(0xFF4444)    
      this.mesh.scale.copy(originalScale) // Reset scale
    }, 100)
    
    setTimeout(() => {
      material.emissive.setHex(0xFF6666) // Fading red
      material.color.setHex(0xFF8888)    
    }, 150)
    
    setTimeout(() => {
      // Restore original colors
      material.emissive.copy(originalEmissive)
      material.color.copy(originalColor)
    }, 200)
  }

  // 💀 DEPRECATED - Death effects now handled by lifecycle system 💀
  // This method is kept for backwards compatibility with enemies that haven't
  // been fully migrated yet, but will be removed in the future.
  protected createDeathEffect(): void {
    // No-op - death effects are now triggered in startDeathSequence()
  }
  
  private createOldDeathEffect(): void {
    // Original death effect code as fallback
    const particleCount = 15
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      positions[i3] = this.position.x
      positions[i3 + 1] = this.position.y
      positions[i3 + 2] = this.position.z
      
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5
      const speed = 3 + Math.random() * 2
      velocities[i3] = Math.cos(angle) * speed
      velocities[i3 + 1] = Math.sin(angle) * speed
      velocities[i3 + 2] = (Math.random() - 0.5) * 2
      
      colors[i3] = 1
      colors[i3 + 1] = Math.random() * 0.5
      colors[i3 + 2] = 0
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    })

    const particles = new THREE.Points(geometry, material)
    
    if (this.mesh.parent) {
      this.mesh.parent.add(particles)
      
      let time = 0
      const animate = () => {
        time += 0.016
        
        const positions = particles.geometry.attributes.position.array as Float32Array
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3
          positions[i3] += velocities[i3] * 0.016
          positions[i3 + 1] += velocities[i3 + 1] * 0.016
          positions[i3 + 2] += velocities[i3 + 2] * 0.016
        }
        particles.geometry.attributes.position.needsUpdate = true
        
        material.opacity = Math.max(0, 1 - time * 2)
        
        if (time < 0.5) {
          requestAnimationFrame(animate)
        } else {
          this.mesh.parent?.remove(particles)
        }
      }
      animate()
    }
  }
  
  protected updateTrails(deltaTime: number): void {
    if (!this.effectsSystem) return
    
    this.trailTimer += deltaTime
    
    // Only create trails if moving and enough time has passed
    const movement = this.position.distanceTo(this.lastPosition)
    if (movement > 0.1 && this.trailTimer >= this.trailInterval) {
      const enemyType = this.constructor.name
      this.effectsSystem.createEnemyTrail(this.position, this.velocity, enemyType)
      this.trailTimer = 0
    }
  }

  destroy(): void {
    this.alive = false
  }

  // Collision detection
  isCollidingWith(other: { getPosition(): THREE.Vector3, getRadius(): number }): boolean {
    const distance = this.position.distanceTo(other.getPosition())
    return distance < (this.radius + other.getRadius())
  }

  // Getters
  getMesh(): THREE.Mesh {
    return this.mesh
  }

  getPosition(): THREE.Vector3 {
    return this.position.clone()
  }

  getHealth(): number {
    return this.health
  }

  getDamage(): number {
    return this.damage
  }

  getXPValue(): number {
    return this.xpValue
  }

  getRadius(): number {
    return this.radius
  }

  isAlive(): boolean {
    return this.alive
  }
  
  // 🔷 VELOCITY MANIPULATION FOR SEPARATION 🔷
  getVelocity(): THREE.Vector3 {
    return this.velocity.clone()
  }
  
  setVelocity(velocity: THREE.Vector3): void {
    this.velocity.copy(velocity)
  }
  
  // Apply external force (for separation/collision resolution)
  applyForce(force: THREE.Vector3, deltaTime: number): void {
    this.velocity.add(force.clone().multiplyScalar(deltaTime))
  }
  
  // 📊 KILL TRACKING - For enemies with death animations (ChaosWorm, Boss) 📊
  // This ensures kills are counted even when alive is temporarily set back to true
  hasBeenKillTracked(): boolean {
    return this.killTracked
  }
  
  markKillTracked(): void {
    this.killTracked = true
  }
  
  // Check if enemy should be counted as a kill (dead or dying with death animation)
  shouldTrackKill(): boolean {
    return this.health <= 0 && !this.killTracked
  }
  
  // 🎆 SET EFFECTS SYSTEM FOR SUPER JUICY EFFECTS! 🎆
  setEffectsSystem(effectsSystem: EffectsSystem): void {
    this.effectsSystem = effectsSystem
  }
  
  setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager
  }
  
  // 💥 GET DEATH DAMAGE PROPERTIES 💥
  getDeathDamageRadius(): number {
    return this.deathDamageRadius
  }
  
  getDeathDamageAmount(): number {
    return this.deathDamageAmount
  }
}
