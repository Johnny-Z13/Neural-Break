import * as THREE from 'three'
import { Player } from './Player'
import { EffectsSystem } from '../graphics/EffectsSystem'
import { EnemyProjectile } from '../weapons/EnemyProjectile'

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
  protected lastPosition: THREE.Vector3 = new THREE.Vector3()
  protected trailTimer: number = 0
  protected trailInterval: number = 0.05 // Trail every 50ms

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
    this.health -= damage
    
    // JUICY visual feedback - flash bright saturated color (NOT white!) and scale up
    const material = this.mesh.material as THREE.MeshLambertMaterial
    const originalColor = material.color.clone()
    const originalScale = this.mesh.scale.clone()
    
    // Get HSL of original color and boost brightness while keeping saturation
    const hsl = { h: 0, s: 0, l: 0 }
    originalColor.getHSL(hsl)
    // Flash with boosted saturation/brightness but NOT white
    material.color.setHSL(hsl.h, 1.0, 0.7) // Saturated bright version of enemy color
    this.mesh.scale.multiplyScalar(1.5)
    
    setTimeout(() => {
      material.color.copy(originalColor)
      this.mesh.scale.copy(originalScale)
    }, 100)

    if (this.health <= 0) {
      this.alive = false
      this.createDeathEffect()
    }
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
          deathColor = new THREE.Color(1, 0.3, 0)
          this.effectsSystem.createExplosion(this.position, 0.8, deathColor)
          break
        case 'ScanDrone':
          deathColor = new THREE.Color().setHSL(0.1, 0.9, 0.7)
          this.effectsSystem.createElectricDeath(this.position, enemyType)
          break
        case 'ChaosWorm':
          deathColor = new THREE.Color().setHSL(Math.random(), 0.9, 0.7)
          this.effectsSystem.createExplosion(this.position, 2.0, deathColor)
          break
        case 'VoidSphere':
          deathColor = new THREE.Color(0.5, 0, 1)
          this.effectsSystem.createExplosion(this.position, 2.5, deathColor)
          this.effectsSystem.addDistortionWave(this.position, 1.5)
          break
        case 'CrystalShardSwarm':
          deathColor = new THREE.Color(0, 1, 1)
          this.effectsSystem.createElectricDeath(this.position, enemyType)
          this.effectsSystem.createExplosion(this.position, 1.8, deathColor)
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
  
  // 🎆 SET EFFECTS SYSTEM FOR SUPER JUICY EFFECTS! 🎆
  setEffectsSystem(effectsSystem: EffectsSystem): void {
    this.effectsSystem = effectsSystem
  }
}
