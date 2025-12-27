import * as THREE from 'three'
import { EffectsSystem } from '../graphics/EffectsSystem'

export class SpeedUp {
  private mesh: THREE.Mesh
  private position: THREE.Vector3
  private radius: number = 0.4
  private alive: boolean = true
  private effectsSystem: EffectsSystem | null = null
  private pulseTime: number = 0
  private rotationSpeed: number = 3.0 // Faster rotation for speed pickup!
  private trailTimer: number = 0
  private trailInterval: number = 0.08
  
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
    // ⚡ SPEED-UP - Yellow/Orange theme with 'S' letter! ⚡
    // Create base container
    const containerGeometry = new THREE.CircleGeometry(0.1, 8)
    const containerMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    this.mesh = new THREE.Mesh(containerGeometry, containerMaterial)
    this.mesh.position.copy(this.position)
    
    // 🟡 YELLOW GLOWING BASE 🟡
    const glowGeometry = new THREE.CircleGeometry(0.45, 32)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFF00, // YELLOW glow
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    glow.position.z = -0.01
    this.mesh.add(glow)
    
    // 🟠 OUTER GLOW RING - Orange tinted 🟠
    const outerRingGeometry = new THREE.RingGeometry(0.5, 0.65, 32)
    const outerRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFAA00, // ORANGE
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    })
    const outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial)
    this.mesh.add(outerRing)
    
    // 🟡 INNER RING 🟡
    const innerRingGeometry = new THREE.RingGeometry(0.35, 0.42, 32)
    const innerRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFF00, // Yellow
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    })
    const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial)
    this.mesh.add(innerRing)
    
    // ✨ 'S' LETTER - SPEED! ✨
    this.createLetterS()
    
    // ⚡ SPEED LINES - Motion blur effect! ⚡
    this.createSpeedLines()
    
    // 💫 ENERGY PARTICLES - Fast-moving yellow particles! 💫
    for (let i = 0; i < 10; i++) {
      const particleGeometry = new THREE.CircleGeometry(0.035, 6)
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFF00, // YELLOW particles
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      })
      const particle = new THREE.Mesh(particleGeometry, particleMaterial)
      const angle = (i / 10) * Math.PI * 2
      particle.position.set(
        Math.cos(angle) * 0.55,
        Math.sin(angle) * 0.55,
        0
      )
      this.mesh.add(particle)
    }
  }

  private createLetterS(): void {
    // Create 'S' shape using curved segments
    const letterColor = 0xFFFFFF // White letter for contrast
    const letterMaterial = new THREE.MeshBasicMaterial({
      color: letterColor,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    })
    
    // Create a group for the letter
    const letterGroup = new THREE.Group()
    
    // Top curve of S
    const topCurveGeometry = new THREE.BoxGeometry(0.2, 0.08, 0.01)
    const topCurve = new THREE.Mesh(topCurveGeometry, letterMaterial.clone())
    topCurve.position.set(0, 0.14, 0.02)
    letterGroup.add(topCurve)
    
    // Top-left vertical
    const topLeftGeometry = new THREE.BoxGeometry(0.08, 0.14, 0.01)
    const topLeft = new THREE.Mesh(topLeftGeometry, letterMaterial.clone())
    topLeft.position.set(-0.08, 0.07, 0.02)
    letterGroup.add(topLeft)
    
    // Middle bar of S
    const middleBarGeometry = new THREE.BoxGeometry(0.2, 0.08, 0.01)
    const middleBar = new THREE.Mesh(middleBarGeometry, letterMaterial.clone())
    middleBar.position.set(0, 0.0, 0.02)
    letterGroup.add(middleBar)
    
    // Bottom-right vertical
    const bottomRightGeometry = new THREE.BoxGeometry(0.08, 0.14, 0.01)
    const bottomRight = new THREE.Mesh(bottomRightGeometry, letterMaterial.clone())
    bottomRight.position.set(0.08, -0.07, 0.02)
    letterGroup.add(bottomRight)
    
    // Bottom curve of S
    const bottomCurveGeometry = new THREE.BoxGeometry(0.2, 0.08, 0.01)
    const bottomCurve = new THREE.Mesh(bottomCurveGeometry, letterMaterial.clone())
    bottomCurve.position.set(0, -0.14, 0.02)
    letterGroup.add(bottomCurve)
    
    this.mesh.add(letterGroup)
  }

  private createSpeedLines(): void {
    // Create motion blur lines to emphasize speed
    const lineColor = 0xFFAA00 // Orange speed lines
    const lineMaterial = new THREE.MeshBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })
    
    // Create 3 speed lines trailing behind
    for (let i = 0; i < 3; i++) {
      const lineGeometry = new THREE.BoxGeometry(0.3 - i * 0.05, 0.02, 0.01)
      const line = new THREE.Mesh(lineGeometry, lineMaterial.clone())
      line.position.set(-0.35 - i * 0.15, 0.2 - i * 0.15, 0.01)
      this.mesh.add(line)
      
      const line2 = new THREE.Mesh(lineGeometry.clone(), lineMaterial.clone())
      line2.position.set(-0.35 - i * 0.15, -0.2 + i * 0.15, 0.01)
      this.mesh.add(line2)
    }
  }

  update(deltaTime: number, playerPosition?: THREE.Vector3): void {
    if (!this.alive) return

    // 🧲 APPLY MAGNETISM - Pull towards player! 🧲
    if (playerPosition) {
      this.applyMagnetism(playerPosition, deltaTime)
    }

    // ⚡ FAST PULSING ANIMATION - Speedy! ⚡
    this.pulseTime += deltaTime
    // Even faster pulse when magnetized!
    const pulseSpeed = this.isMagnetized ? 10 : 6
    const pulse = 0.8 + Math.sin(this.pulseTime * pulseSpeed) * 0.25
    this.mesh.scale.setScalar(pulse)

    // ⚡ FAST ROTATION - Speed effect (even faster when magnetized)! ⚡
    const rotSpeed = this.isMagnetized ? this.rotationSpeed * 2 : this.rotationSpeed
    this.mesh.rotation.z += deltaTime * rotSpeed

    // ✨ ANIMATE PARTICLES - Fast orbiting! ✨
    const children = this.mesh.children
    // Particles start after: glow, outer ring, inner ring, letter group (5 elements), speed lines (6)
    const particleStartIndex = 4 + 6 // Letter group + speed lines
    for (let i = particleStartIndex; i < children.length; i++) {
      const child = children[i]
      if (child instanceof THREE.Mesh) {
        const particleIndex = i - particleStartIndex
        const angle = (particleIndex / 10) * Math.PI * 2 + this.pulseTime * 4 // Faster orbit
        const radius = 0.55 + Math.sin(this.pulseTime * 5 + particleIndex) * 0.12
        child.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        )
        const particleMaterial = child.material as THREE.MeshBasicMaterial
        particleMaterial.opacity = 0.6 + Math.sin(this.pulseTime * 8 + particleIndex) * 0.4
      }
    }

    // Update glow and ring pulsing
    this.updateGlowEffects()

    // Create particle trail effect
    this.updateTrail(deltaTime)
  }

  private updateGlowEffects(): void {
    const time = this.pulseTime
    
    // Update main glow - faster pulse for speed
    if (this.mesh.children[0]) {
      const glow = this.mesh.children[0] as THREE.Mesh
      const glowMaterial = glow.material as THREE.MeshBasicMaterial
      glowMaterial.opacity = 0.5 + Math.sin(time * 6) * 0.3
      glow.scale.setScalar(1 + Math.sin(time * 7) * 0.2)
    }
    
    // Update outer ring
    if (this.mesh.children[1]) {
      const outerRing = this.mesh.children[1] as THREE.Mesh
      const outerRingMaterial = outerRing.material as THREE.MeshBasicMaterial
      outerRingMaterial.opacity = 0.6 + Math.sin(time * 5) * 0.4
      outerRing.scale.setScalar(1 + Math.sin(time * 6) * 0.15)
    }
    
    // Update inner ring
    if (this.mesh.children[2]) {
      const innerRing = this.mesh.children[2] as THREE.Mesh
      const innerRingMaterial = innerRing.material as THREE.MeshBasicMaterial
      innerRingMaterial.opacity = 0.7 + Math.sin(time * 7) * 0.3
    }
    
    // Animate speed lines
    for (let i = 4; i < 10; i++) {
      const child = this.mesh.children[i]
      if (child instanceof THREE.Mesh) {
        const lineMaterial = child.material as THREE.MeshBasicMaterial
        lineMaterial.opacity = 0.4 + Math.sin(time * 8 + i * 0.5) * 0.4
      }
    }
  }

  private updateTrail(deltaTime: number): void {
    if (!this.effectsSystem) return

    this.trailTimer += deltaTime
    // Faster trail when magnetized!
    const interval = this.isMagnetized ? this.trailInterval * 0.4 : this.trailInterval
    if (this.trailTimer >= interval) {
      // Create sparkle particles - YELLOW/ORANGE color
      const sparkleVelocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.8, // More spread for speed effect
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.4
      )
      
      // Yellow/orange sparkles for speed-up
      const sparkleColor = new THREE.Color().setHSL(
        0.12 + Math.sin(this.pulseTime * 3) * 0.05, // Yellow-orange hue range
        1.0,
        0.7
      )
      
      this.effectsSystem.createSparkle(this.position, sparkleVelocity, sparkleColor, 0.4)
      
      this.trailTimer = 0
    }
  }

  // 🧲 MAGNETISM - Suck pickup towards player when close! 🧲
  private applyMagnetism(playerPosition: THREE.Vector3, deltaTime: number): void {
    const toPlayer = playerPosition.clone().sub(this.position)
    const distance = toPlayer.length()
    
    if (distance < SpeedUp.MAGNET_RADIUS && distance > 0.1) {
      this.isMagnetized = true
      
      // Calculate attraction strength (stronger when closer)
      const normalizedDistance = distance / SpeedUp.MAGNET_RADIUS
      const attractionStrength = SpeedUp.MAGNET_STRENGTH * (1 - normalizedDistance * 0.5)
      
      // Apply acceleration towards player
      const direction = toPlayer.normalize()
      this.velocity.add(direction.multiplyScalar(attractionStrength * deltaTime))
      
      // Clamp velocity
      if (this.velocity.length() > SpeedUp.MAX_MAGNET_SPEED) {
        this.velocity.normalize().multiplyScalar(SpeedUp.MAX_MAGNET_SPEED)
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
    
    // Create collection effect - YELLOW EXPLOSION!
    if (this.effectsSystem) {
      // Yellow explosion effect
      this.effectsSystem.createExplosion(this.position, 1.5, new THREE.Color().setHSL(0.15, 1.0, 0.6))
      
      // Electric burst with yellow tint
      this.effectsSystem.createElectricDeath(this.position, 'SpeedUp')
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

