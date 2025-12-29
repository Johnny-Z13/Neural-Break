import * as THREE from 'three'
import { EffectsSystem } from '../graphics/EffectsSystem'

export class PowerUp {
  private mesh: THREE.Mesh
  private position: THREE.Vector3
  private radius: number = 0.5 // Increased by 25% from 0.4
  private alive: boolean = true
  private effectsSystem: EffectsSystem | null = null
  private pulseTime: number = 0
  private rotationSpeed: number = 3.5 // Faster rotation for "fizz"
  private trailTimer: number = 0
  private trailInterval: number = 0.07 // Faster trail for "fizz"
  private letterMesh: THREE.Mesh | null = null
  
  // 🧲 MAGNETISM SYSTEM 🧲
  private static readonly MAGNET_RADIUS = 4.0        // Distance at which magnetism kicks in
  private static readonly MAGNET_STRENGTH = 12.0     // Acceleration towards player
  private static readonly MAX_MAGNET_SPEED = 18.0    // Max speed when being pulled
  private velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
  private isMagnetized: boolean = false

  constructor(x: number, y: number) {
    this.position = new THREE.Vector3(x, y, 0)
    this.createMesh()
  }

  private createMesh(): void {
    // 🔷 POWER-UP - Now GREEN theme with 'P' letter! 🔷
    // Create base container
    const containerGeometry = new THREE.CircleGeometry(0.125, 8) // Scaled up
    const containerMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    this.mesh = new THREE.Mesh(containerGeometry, containerMaterial)
    this.mesh.position.copy(this.position)
    
    // 💚 GREEN GLOWING BASE 💚
    const glowGeometry = new THREE.CircleGeometry(0.56, 32) // Scaled up from 0.45
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FF00, // GREEN glow
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    glow.position.z = -0.01
    this.mesh.add(glow)
    
    // 💫 OUTER GLOW RING 💫
    const outerRingGeometry = new THREE.RingGeometry(0.625, 0.81, 32) // Scaled up from 0.5, 0.65
    const outerRingMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FF00, // GREEN
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    })
    const outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial)
    this.mesh.add(outerRing)
    
    // 🟢 INNER RING 🟢
    const innerRingGeometry = new THREE.RingGeometry(0.44, 0.525, 32) // Scaled up from 0.35, 0.42
    const innerRingMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FF00, // Green
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    })
    const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial)
    this.mesh.add(innerRing)
    
    // ✨ 'P' LETTER - WEAPON POWER! ✨
    this.createLetterP()
    
    // 💫 ENERGY PARTICLES - Now 12 particles for more "fizz"! 💫
    for (let i = 0; i < 12; i++) {
      const particleGeometry = new THREE.CircleGeometry(0.05, 6) // Scaled up
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: 0x00FF00, // GREEN particles
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      })
      const particle = new THREE.Mesh(particleGeometry, particleMaterial)
      const angle = (i / 12) * Math.PI * 2
      particle.position.set(
        Math.cos(angle) * 0.7, // Scaled up
        Math.sin(angle) * 0.7,
        0
      )
      this.mesh.add(particle)
    }
  }

  private createLetterP(): void {
    // Create 'P' shape using box geometries
    const letterColor = 0xFFFFFF // White letter for contrast
    const letterMaterial = new THREE.MeshBasicMaterial({
      color: letterColor,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    })
    
    // Create a group for the letter - SCALED UP
    const letterGroup = new THREE.Group()
    letterGroup.scale.setScalar(1.25)
    
    // Vertical bar of P
    const verticalGeometry = new THREE.BoxGeometry(0.08, 0.4, 0.01)
    const verticalBar = new THREE.Mesh(verticalGeometry, letterMaterial.clone())
    verticalBar.position.set(-0.06, -0.02, 0.02)
    letterGroup.add(verticalBar)
    
    // Top horizontal bar of P
    const topBarGeometry = new THREE.BoxGeometry(0.18, 0.08, 0.01)
    const topBar = new THREE.Mesh(topBarGeometry, letterMaterial.clone())
    topBar.position.set(0.03, 0.14, 0.02)
    letterGroup.add(topBar)
    
    // Middle horizontal bar of P
    const midBarGeometry = new THREE.BoxGeometry(0.18, 0.08, 0.01)
    const midBar = new THREE.Mesh(midBarGeometry, letterMaterial.clone())
    midBar.position.set(0.03, 0.0, 0.02)
    letterGroup.add(midBar)
    
    // Right curved part of P (simplified as vertical bar)
    const rightBarGeometry = new THREE.BoxGeometry(0.08, 0.22, 0.01)
    const rightBar = new THREE.Mesh(rightBarGeometry, letterMaterial.clone())
    rightBar.position.set(0.12, 0.07, 0.02)
    letterGroup.add(rightBar)
    
    this.mesh.add(letterGroup)
    this.letterMesh = verticalBar // Reference for animation
  }

  update(deltaTime: number, playerPosition?: THREE.Vector3): void {
    if (!this.alive) return

    // 🧲 APPLY MAGNETISM - Pull towards player! 🧲
    if (playerPosition) {
      this.applyMagnetism(playerPosition, deltaTime)
    }

    // 💠 DRAMATIC PULSING ANIMATION 💠
    this.pulseTime += deltaTime
    // More dramatic pulse when magnetized!
    const basePulse = this.isMagnetized ? 0.95 : 0.85
    const pulseAmount = this.isMagnetized ? 0.15 : 0.2
    const pulseSpeed = this.isMagnetized ? 12 : 6 // Faster for "fizz"
    const pulse = basePulse + Math.sin(this.pulseTime * pulseSpeed) * pulseAmount
    this.mesh.scale.setScalar(pulse)

    // Gentle rotation animation
    this.mesh.rotation.z += deltaTime * this.rotationSpeed

    // ✨ ANIMATE PARTICLES - Orbiting around pickup with more speed! ✨
    const children = this.mesh.children
    const particleCount = 12
    for (let i = 4; i < 4 + particleCount; i++) { // Skip glow, rings, and letter group
      const child = children[i]
      if (child instanceof THREE.Mesh) {
        const particleIndex = i - 4
        const angle = ((particleIndex) / particleCount) * Math.PI * 2 + this.pulseTime * 4 // Faster "fizz"
        const radius = 0.7 + Math.sin(this.pulseTime * 5 + particleIndex) * 0.15 // Scaled up
        child.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        )
        const particleMaterial = child.material as THREE.MeshBasicMaterial
        particleMaterial.opacity = 0.7 + Math.sin(this.pulseTime * 7 + particleIndex) * 0.3
      }
    }

    // Update glow and ring pulsing
    this.updateGlowEffects()

    // Create particle trail effect
    this.updateTrail(deltaTime)
  }

  private updateGlowEffects(): void {
    const time = this.pulseTime
    
    // Update main glow
    if (this.mesh.children[0]) {
      const glow = this.mesh.children[0] as THREE.Mesh
      const glowMaterial = glow.material as THREE.MeshBasicMaterial
      glowMaterial.opacity = 0.5 + Math.sin(time * 4) * 0.2
      glow.scale.setScalar(1 + Math.sin(time * 5) * 0.15)
    }
    
    // Update outer ring
    if (this.mesh.children[1]) {
      const outerRing = this.mesh.children[1] as THREE.Mesh
      const outerRingMaterial = outerRing.material as THREE.MeshBasicMaterial
      outerRingMaterial.opacity = 0.7 + Math.sin(time * 3) * 0.3
      outerRing.scale.setScalar(1 + Math.sin(time * 4) * 0.1)
    }
    
    // Update inner ring
    if (this.mesh.children[2]) {
      const innerRing = this.mesh.children[2] as THREE.Mesh
      const innerRingMaterial = innerRing.material as THREE.MeshBasicMaterial
      innerRingMaterial.opacity = 0.8 + Math.sin(time * 5) * 0.2
    }
  }

  private updateTrail(deltaTime: number): void {
    if (!this.effectsSystem) return

    this.trailTimer += deltaTime
    // Faster trail when magnetized!
    const interval = this.isMagnetized ? this.trailInterval * 0.5 : this.trailInterval
    if (this.trailTimer >= interval) {
      // Create sparkle particles - CYAN color
      const sparkleVelocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.3
      )
      
      // Green sparkles for weapon power-up
      const sparkleColor = new THREE.Color().setHSL(
        0.33 + Math.sin(this.pulseTime * 2) * 0.05, // Green hue range
        1.0,
        0.7
      )
      
      this.effectsSystem.createSparkle(this.position, sparkleVelocity, sparkleColor, 0.5)
      
      this.trailTimer = 0
    }
  }

  // 🧲 MAGNETISM - Suck pickup towards player when close! 🧲
  private applyMagnetism(playerPosition: THREE.Vector3, deltaTime: number): void {
    const toPlayer = playerPosition.clone().sub(this.position)
    const distance = toPlayer.length()
    
    if (distance < PowerUp.MAGNET_RADIUS && distance > 0.1) {
      this.isMagnetized = true
      
      // Calculate attraction strength (stronger when closer)
      const normalizedDistance = distance / PowerUp.MAGNET_RADIUS
      const attractionStrength = PowerUp.MAGNET_STRENGTH * (1 - normalizedDistance * 0.5)
      
      // Apply acceleration towards player
      const direction = toPlayer.normalize()
      this.velocity.add(direction.multiplyScalar(attractionStrength * deltaTime))
      
      // Clamp velocity
      if (this.velocity.length() > PowerUp.MAX_MAGNET_SPEED) {
        this.velocity.normalize().multiplyScalar(PowerUp.MAX_MAGNET_SPEED)
      }
      
      // Update position
      this.position.add(this.velocity.clone().multiplyScalar(deltaTime))
      this.mesh.position.copy(this.position)
    } else {
      this.isMagnetized = false
      // Slow down when not magnetized
      this.velocity.multiplyScalar(0.9)
    }
  }

  collect(): void {
    this.alive = false
    
    // Create collection effect - CYAN EXPLOSION!
    if (this.effectsSystem) {
      // Green explosion effect
      this.effectsSystem.createExplosion(this.position, 1.5, new THREE.Color().setHSL(0.33, 1.0, 0.6))
      
      // Electric burst with cyan tint
      this.effectsSystem.createElectricDeath(this.position, 'PowerUp')
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

  getRadius(): number {
    return this.radius
  }

  isAlive(): boolean {
    return this.alive
  }

  setEffectsSystem(effectsSystem: EffectsSystem): void {
    this.effectsSystem = effectsSystem
  }
}
