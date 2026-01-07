import * as THREE from 'three'
import { Player } from './Player'
import { EffectsSystem } from '../graphics/EffectsSystem'
import { EnemyProjectile } from '../weapons/EnemyProjectile'
import { AudioManager } from '../audio/AudioManager'

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

  constructor(x: number, y: number) {
    this.position = new THREE.Vector3(x, y, 0)
    this.velocity = new THREE.Vector3(0, 0, 0)
  }

  abstract initialize(): void
  abstract updateAI(deltaTime: number, player: Player): void

  update(deltaTime: number, player: Player): void {
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

  protected updateVisuals(deltaTime: number): void {
    // Default pulsing effect
    const pulse = Math.sin(Date.now() * 0.005) * 0.1 + 1
    this.mesh.scale.setScalar(pulse)
  }

  takeDamage(damage: number): void {
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

    if (this.health <= 0) {
      this.alive = false
      this.createDeathEffect()
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

  protected createDeathEffect(): void {
    // 💥 SUPER JUICY DEATH EFFECT WITH VECTOR PARTICLES! 💥
    if (this.effectsSystem) {
      // Determine death effect type based on enemy
      const enemyType = this.constructor.name
      
      // ALWAYS spawn death particles (vector style) for every enemy!
      let deathColor: THREE.Color | undefined
      
      switch (enemyType) {
        case 'DataMite':
          // 🔥 DATA MITE - Quick orange pop with energy burst! 🔥
          deathColor = new THREE.Color(1, 0.3, 0)
          this.effectsSystem.createExplosion(this.position, 1.2, deathColor)
          // Add extra sparkles for small enemy
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2
            const velocity = new THREE.Vector3(
              Math.cos(angle) * 2,
              Math.sin(angle) * 2,
              (Math.random() - 0.5) * 1
            )
            this.effectsSystem.createSparkle(this.position, velocity, deathColor, 0.32) // 20% shorter
          }
          break
        case 'ScanDrone':
          // 📡 SCAN DRONE - Electric discharge with grid collapse! 📡
          deathColor = new THREE.Color().setHSL(0.1, 0.9, 0.7)
          this.effectsSystem.createElectricDeath(this.position, enemyType)
          this.effectsSystem.createExplosion(this.position, 1.5, deathColor)
          // Add cyan energy burst
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2
            const velocity = new THREE.Vector3(
              Math.cos(angle) * 3,
              Math.sin(angle) * 3,
              (Math.random() - 0.5) * 1.5
            )
            const cyanColor = new THREE.Color().setHSL(0.5, 1.0, 0.6)
            this.effectsSystem.createSparkle(this.position, velocity, cyanColor, 0.4) // 20% shorter
          }
          break
        case 'ChaosWorm':
          // 🐛 CHAOS WORM - Handled by custom death sequence 🐛
          deathColor = new THREE.Color().setHSL(Math.random(), 0.9, 0.7)
          this.effectsSystem.createExplosion(this.position, 2.0, deathColor)
          break
        case 'VoidSphere':
          // 🌀 VOID SPHERE - Massive void collapse with distortion! 🌀
          deathColor = new THREE.Color(0.5, 0, 1)
          this.effectsSystem.createExplosion(this.position, 3.0, deathColor)
          this.effectsSystem.addDistortionWave(this.position, 2.5)
          // Add purple void particles
          for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2
            const velocity = new THREE.Vector3(
              Math.cos(angle) * (2 + Math.random() * 3),
              Math.sin(angle) * (2 + Math.random() * 3),
              (Math.random() - 0.5) * 2
            )
            const purpleColor = new THREE.Color(0.7, 0, 1)
            this.effectsSystem.createSparkle(this.position, velocity, purpleColor, 0.48) // 20% shorter
          }
          break
        case 'CrystalShardSwarm':
          // 💎 CRYSTAL SWARM - Shattering crystals with lightning burst! 💎
          deathColor = new THREE.Color(0, 1, 1)
          this.effectsSystem.createElectricDeath(this.position, enemyType)
          this.effectsSystem.createExplosion(this.position, 2.2, deathColor)
          // Add rainbow crystal shards
          for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2
            const velocity = new THREE.Vector3(
              Math.cos(angle) * (3 + Math.random() * 2),
              Math.sin(angle) * (3 + Math.random() * 2),
              (Math.random() - 0.5) * 2
            )
            const hue = (i / 16) % 1
            const crystalColor = new THREE.Color().setHSL(hue, 1.0, 0.7)
            this.effectsSystem.createSparkle(this.position, velocity, crystalColor, 0.56) // 20% shorter
          }
          break
        case 'Fizzer':
          // ⚡ FIZZER - Electric zap explosion with erratic sparks! ⚡
          deathColor = new THREE.Color().setHSL(0.5, 1.0, 0.6)
          this.effectsSystem.createElectricDeath(this.position, enemyType)
          this.effectsSystem.createExplosion(this.position, 1.8, deathColor)
          // Add erratic electric sparks
          for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2
            const speed = 2 + Math.random() * 4
            const velocity = new THREE.Vector3(
              Math.cos(angle) * speed,
              Math.sin(angle) * speed,
              (Math.random() - 0.5) * 2
            )
            const electricColor = new THREE.Color().setHSL(0.5 + Math.random() * 0.1, 1.0, 0.7)
            this.effectsSystem.createSparkle(this.position, velocity, electricColor, 0.4) // 20% shorter
          }
          break
        case 'UFO':
          // 🛸 UFO - Alien craft explosion with tractor beam collapse! 🛸
          deathColor = new THREE.Color().setHSL(0.6, 0.8, 0.5)
          this.effectsSystem.createExplosion(this.position, 2.5, deathColor)
          // Add cyan/blue alien energy particles
          for (let i = 0; i < 18; i++) {
            const angle = (i / 18) * Math.PI * 2
            const velocity = new THREE.Vector3(
              Math.cos(angle) * (2.5 + Math.random() * 2.5),
              Math.sin(angle) * (2.5 + Math.random() * 2.5),
              (Math.random() - 0.5) * 2
            )
            const alienColor = new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 1.0, 0.6)
            this.effectsSystem.createSparkle(this.position, velocity, alienColor, 0.48) // 20% shorter
          }
          // Add tractor beam collapse effect
          this.effectsSystem.addDistortionWave(this.position, 1.8)
          break
        case 'Boss':
          // 💀 BOSS - Handled by custom death animation 💀
          deathColor = new THREE.Color(1, 0, 0)
          this.effectsSystem.createExplosion(this.position, 4.0, deathColor)
          break
        default:
          deathColor = new THREE.Color().setHSL(0.0, 0.8, 0.6)
          this.effectsSystem.createExplosion(this.position, 1.0, deathColor)
      }
      
      // ALWAYS create vector-style death particles!
      this.effectsSystem.createEnemyDeathParticles(this.position, enemyType, deathColor)
    } else {
      // Fallback to old particle system if effects system not available
      this.createOldDeathEffect()
    }
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
