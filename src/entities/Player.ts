import * as THREE from 'three'
import { InputManager } from '../core/InputManager'
import { AudioManager } from '../audio/AudioManager'

export class Player {
  private mesh: THREE.Mesh
  private position: THREE.Vector3
  private velocity: THREE.Vector3
  private health: number = 100
  private maxHealth: number = 100
  private speed: number = 5
  private dashCooldown: number = 0
  private dashDuration: number = 0
  private dashSpeed: number = 15
  private level: number = 1
  private xp: number = 0
  private xpToNext: number = 15
  private isDashing: boolean = false
  private audioManager: AudioManager | null = null

  constructor() {
    this.position = new THREE.Vector3(0, 0, 0)
    this.velocity = new THREE.Vector3(0, 0, 0)
  }

  initialize(audioManager?: AudioManager): void {
    this.audioManager = audioManager || null
    // Create player geometry - humanoid silhouette made of flowing data streams
    const geometry = new THREE.ConeGeometry(0.3, 1, 8)
    
    // Create glowing material with cyberpunk colors
    const material = new THREE.MeshLambertMaterial({
      color: 0x66CCFF,
      emissive: 0x004466,
      transparent: true,
      opacity: 0.9
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.copy(this.position)
    this.mesh.rotation.z = Math.PI // Rotate 180 degrees to point upward
    
    // Add a glowing outline effect
    const outlineGeometry = new THREE.ConeGeometry(0.35, 1.05, 8)
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FFFF,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    })
    const outline = new THREE.Mesh(outlineGeometry, outlineMaterial)
    this.mesh.add(outline)

    // Add particle trail effect
    this.createParticleTrail()
  }

  private createParticleTrail(): void {
    const particleCount = 20
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      positions[i3] = 0
      positions[i3 + 1] = 0
      positions[i3 + 2] = 0

      // Cyan trail colors
      colors[i3] = 0
      colors[i3 + 1] = 1
      colors[i3 + 2] = 1
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })

    const trail = new THREE.Points(geometry, material)
    this.mesh.add(trail)
  }

  update(deltaTime: number, inputManager: InputManager): void {
    // Update cooldowns
    if (this.dashCooldown > 0) {
      this.dashCooldown -= deltaTime
    }
    
    if (this.dashDuration > 0) {
      this.dashDuration -= deltaTime
      if (this.dashDuration <= 0) {
        this.isDashing = false
      }
    }

    // Handle movement input
    const movement = inputManager.getMovementVector()
    
    // Handle dash input (now on Shift key)
    if (inputManager.isDashing() && this.dashCooldown <= 0 && !this.isDashing) {
      this.startDash()
    }

    // Apply movement
    const currentSpeed = this.isDashing ? this.dashSpeed : this.speed
    this.velocity.x = movement.x * currentSpeed
    this.velocity.y = movement.y * currentSpeed

    // Update position
    this.position.x += this.velocity.x * deltaTime
    this.position.y += this.velocity.y * deltaTime

    // Keep player within world bounds (60x60 world, so ±29 to account for wall thickness)
    const bounds = 29
    this.position.x = Math.max(-bounds, Math.min(bounds, this.position.x))
    this.position.y = Math.max(-bounds, Math.min(bounds, this.position.y))

    // Update mesh position
    this.mesh.position.copy(this.position)

    // Update visual effects based on movement
    this.updateVisualEffects()
  }

  private startDash(): void {
    this.isDashing = true
    this.dashDuration = 0.2 // 200ms dash duration
    this.dashCooldown = 3.0 // 3 second cooldown
    
    // Visual effect for dash
    const material = this.mesh.material as THREE.MeshLambertMaterial
    material.emissive.setHex(0x00FFFF)
    
    setTimeout(() => {
      material.emissive.setHex(0x004466)
    }, 200)
  }

  private updateVisualEffects(): void {
    // Rotate player based on movement direction
    if (this.velocity.length() > 0) {
      const angle = Math.atan2(this.velocity.y, this.velocity.x) + Math.PI / 2
      this.mesh.rotation.z = angle + Math.PI // Add base 180-degree rotation
    }

    // Pulsing effect when dashing
    if (this.isDashing) {
      const pulse = Math.sin(Date.now() * 0.02) * 0.1 + 1
      this.mesh.scale.setScalar(pulse)
    } else {
      this.mesh.scale.setScalar(1)
    }
  }

  takeDamage(damage: number): void {
    this.health = Math.max(0, this.health - damage)
    
    // Visual feedback for taking damage
    const material = this.mesh.material as THREE.MeshLambertMaterial
    material.emissive.setHex(0xFF0000)
    
    setTimeout(() => {
      material.emissive.setHex(0x004466)
    }, 100)
  }

  addXP(amount: number): void {
    this.xp += amount
    
    // Check for level up
    while (this.xp >= this.xpToNext) {
      this.levelUp()
    }
  }

  private levelUp(): void {
    this.xp -= this.xpToNext
    this.level++
    this.xpToNext = Math.floor(this.xpToNext * 1.3) // Increase XP requirement
    
    // Audio feedback for level up
    if (this.audioManager) {
      this.audioManager.playLevelUpSound()
    }
    
    // Visual effect for level up
    const material = this.mesh.material as THREE.MeshLambertMaterial
    material.emissive.setHex(0x00FF00)
    
    setTimeout(() => {
      material.emissive.setHex(0x004466)
    }, 500)
    
    console.log(`Level Up! Now level ${this.level}`)
  }

  // Collision detection
  isCollidingWith(other: { getPosition(): THREE.Vector3, getRadius(): number }): boolean {
    const distance = this.position.distanceTo(other.getPosition())
    return distance < (0.3 + other.getRadius()) // Player radius is 0.3
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

  getMaxHealth(): number {
    return this.maxHealth
  }

  getLevel(): number {
    return this.level
  }

  getXP(): number {
    return this.xp
  }

  getXPToNext(): number {
    return this.xpToNext
  }

  isDead(): boolean {
    return this.health <= 0
  }

  getRadius(): number {
    return 0.3
  }
}
