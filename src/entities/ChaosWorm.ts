import * as THREE from 'three'
import { Enemy } from './Enemy'
import { Player } from './Player'
import { AudioManager } from '../audio/AudioManager'

/**
 * 🐛 CHAOS WORM - MASSIVE RAINBOW SERPENT 🐛
 * A terrifying 3x sized chaos entity that:
 * - Slithers with mesmerizing rainbow segments
 * - Needs A LOT of bullets to destroy
 * - Has a spectacular multi-stage death animation
 */
export class ChaosWorm extends Enemy {
  private segments: THREE.Mesh[] = []
  private segmentCount: number = 12 // More segments for bigger worm
  private particleSystem: THREE.Points
  private particleGeometry: THREE.BufferGeometry
  private particlePositions: Float32Array
  private particleVelocities: Float32Array
  private particleColors: Float32Array
  private particleLifetimes: Float32Array
  private particleCount: number = 400 // More particles!
  private waveOffset: number = 0
  private audioManager: AudioManager | null = null
  private sceneManager: any = null
  
  // 💀 DEATH ANIMATION STATE 💀
  private isDying: boolean = false
  private deathTimer: number = 0
  private deathDuration: number = 2.0 // 2 second death sequence
  private explodedSegments: Set<number> = new Set()

  constructor(x: number, y: number) {
    super(x, y)
    // 🔥 MASSIVE HEALTH - NEEDS LOTS OF BULLETS! 🔥
    this.health = 150
    this.maxHealth = 150
    this.speed = 1.5 // Slightly slower because bigger
    this.damage = 35 // DEVASTATING collision damage!
    this.xpValue = 35 // Big reward
    this.radius = 3.0 // 3x bigger hitbox (was 1.0)
  }
  
  setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager
  }
  
  setSceneManager(sceneManager: any): void {
    this.sceneManager = sceneManager
  }

  initialize(): void {
    // Create main body (invisible container)
    const containerGeometry = new THREE.SphereGeometry(0.1, 4, 4)
    const containerMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    this.mesh = new THREE.Mesh(containerGeometry, containerMaterial)
    this.mesh.position.copy(this.position)

    // 🎮 ASTEROIDS-STYLE SEGMENTED BODY - 3X BIGGER! 🎮
    for (let i = 0; i < this.segmentCount; i++) {
      const segmentSize = 1.8 - (i * 0.12) // 3x bigger tapering segments!
      const geometry = new THREE.OctahedronGeometry(segmentSize, 2)
      
      // Rainbow shifting colors based on segment position
      const hue = (i / this.segmentCount) * 360
      const color = new THREE.Color().setHSL(hue / 360, 0.9, 0.6)
      
      const material = new THREE.MeshLambertMaterial({
        color: color,
        emissive: color.clone().multiplyScalar(0.4),
        transparent: true,
        opacity: 0.9
      })

      const segment = new THREE.Mesh(geometry, material)
      
      // 🌟 WIREFRAME OUTLINE - Classic vector style! 🌟
      const wireframeGeometry = new THREE.OctahedronGeometry(segmentSize * 1.05, 2)
      const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      })
      const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial)
      segment.add(wireframe)
      
      // 💫 ENERGY AURA - Glowing ring per segment! 💫
      const auraGeometry = new THREE.RingGeometry(segmentSize * 0.8, segmentSize * 1.3, 16)
      const auraMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
      const aura = new THREE.Mesh(auraGeometry, auraMaterial)
      aura.rotation.x = Math.PI / 2
      segment.add(aura)
      
      // 🗡️ MASSIVE SPIKES - 3x bigger! 🗡️
      const spikeGeometry = new THREE.ConeGeometry(0.225, 1.35, 6) // 3x
      const spikeMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      })
      
      for (let j = 0; j < 8; j++) { // More spikes!
        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial.clone())
        const angle = (j / 8) * Math.PI * 2
        spike.position.set(
          Math.cos(angle) * segmentSize,
          Math.sin(angle) * segmentSize,
          0
        )
        spike.rotation.z = angle
        segment.add(spike)
      }
      
      // ⚡ INNER ENERGY CORE ⚡
      const coreGeometry = new THREE.SphereGeometry(segmentSize * 0.4, 8, 8)
      const coreMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      })
      const core = new THREE.Mesh(coreGeometry, coreMaterial)
      segment.add(core)

      this.segments.push(segment)
      this.mesh.add(segment)
    }

    // Create MASSIVE particle trail system
    this.particlePositions = new Float32Array(this.particleCount * 3)
    this.particleVelocities = new Float32Array(this.particleCount * 3)
    this.particleColors = new Float32Array(this.particleCount * 3)
    this.particleLifetimes = new Float32Array(this.particleCount)

    // Initialize particles
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3
      this.particlePositions[i3] = this.position.x
      this.particlePositions[i3 + 1] = this.position.y
      this.particlePositions[i3 + 2] = this.position.z
      
      this.particleVelocities[i3] = (Math.random() - 0.5) * 4
      this.particleVelocities[i3 + 1] = (Math.random() - 0.5) * 4
      this.particleVelocities[i3 + 2] = (Math.random() - 0.5) * 4
      
      // Rainbow colors
      const hue = Math.random()
      const color = new THREE.Color().setHSL(hue, 1.0, 0.7)
      this.particleColors[i3] = color.r
      this.particleColors[i3 + 1] = color.g
      this.particleColors[i3 + 2] = color.b
      
      this.particleLifetimes[i] = Math.random()
    }

    this.particleGeometry = new THREE.BufferGeometry()
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3))
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(this.particleColors, 3))

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.6, // 3x bigger particles
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    })

    this.particleSystem = new THREE.Points(this.particleGeometry, particleMaterial)
    this.mesh.add(this.particleSystem)
  }

  updateAI(deltaTime: number, player: Player): void {
    // If dying, don't move - just play death animation
    if (this.isDying) {
      this.updateDeathAnimation(deltaTime)
      return
    }
    
    // Serpentine movement toward player
    const playerPos = player.getPosition()
    const direction = playerPos.sub(this.position).normalize()
    
    // Add sinusoidal movement for worm-like motion
    this.waveOffset += deltaTime * 4
    const perpendicular = new THREE.Vector3(-direction.y, direction.x, 0)
    const waveAmount = Math.sin(this.waveOffset) * 3 // Bigger wave
    
    this.velocity = direction.multiplyScalar(this.speed)
      .add(perpendicular.multiplyScalar(waveAmount))
  }
  
  // 💀 BESPOKE DEATH ANIMATION 💀
  private updateDeathAnimation(deltaTime: number): void {
    this.deathTimer += deltaTime
    const progress = this.deathTimer / this.deathDuration
    
    // Explode segments one by one from tail to head
    const segmentsToExplode = Math.floor(progress * this.segmentCount)
    
    for (let i = this.segmentCount - 1; i >= this.segmentCount - segmentsToExplode; i--) {
      if (i >= 0 && !this.explodedSegments.has(i)) {
        this.explodeSegment(i)
        this.explodedSegments.add(i)
        
        // Play explosion sound for each segment
        if (this.audioManager) {
          this.audioManager.playChaosWormSegmentExplodeSound(i, this.segmentCount)
        }
      }
    }
    
    // Remaining segments shake violently
    const time = Date.now() * 0.001
    for (let i = 0; i < this.segments.length; i++) {
      if (!this.explodedSegments.has(i)) {
        const segment = this.segments[i]
        const shake = (1 - progress) * 0.5 + 0.1
        segment.position.x += (Math.random() - 0.5) * shake
        segment.position.y += (Math.random() - 0.5) * shake
        
        // Color shifts to red as death approaches
        const material = segment.material as THREE.MeshLambertMaterial
        const deathHue = 0 // Red
        const normalHue = (i / this.segmentCount)
        const currentHue = normalHue * (1 - progress) + deathHue * progress
        const color = new THREE.Color().setHSL(currentHue, 1.0, 0.5 + progress * 0.3)
        material.color.copy(color)
        material.emissive.copy(color).multiplyScalar(0.5)
      }
    }
    
    // Final explosion when all segments gone
    if (progress >= 1.0) {
      this.finalDeathExplosion()
      this.alive = false
    }
  }
  
  private explodeSegment(index: number): void {
    const segment = this.segments[index]
    if (!segment) return
    
    // Get world position of segment
    const worldPos = new THREE.Vector3()
    segment.getWorldPosition(worldPos)
    
    // Create explosion effect at segment position
    if (this.effectsSystem) {
      const hue = index / this.segmentCount
      const color = new THREE.Color().setHSL(hue, 1.0, 0.6)
      this.effectsSystem.createExplosion(worldPos, 1.5, color)
      
      // Spawn extra particles
      for (let i = 0; i < 8; i++) {
        const vel = new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          0
        )
        this.effectsSystem.createSparkle(worldPos, vel, color, 0.8)
      }
    }
    
    // Hide the segment
    segment.visible = false
  }
  
  private finalDeathExplosion(): void {
    if (this.effectsSystem) {
      // MASSIVE rainbow explosion
      for (let i = 0; i < 12; i++) {
        const hue = i / 12
        const color = new THREE.Color().setHSL(hue, 1.0, 0.7)
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          0
        )
        this.effectsSystem.createExplosion(
          this.position.clone().add(offset),
          2.0,
          color
        )
      }
      
      // Create shockwave
      this.effectsSystem.addDistortionWave(this.position, 2.0)
      
      // Final death particles
      this.effectsSystem.createEnemyDeathParticles(
        this.position,
        'ChaosWorm',
        new THREE.Color().setHSL(Math.random(), 1.0, 0.6)
      )
    }
    
    // Final sound
    if (this.audioManager) {
      this.audioManager.playChaosWormFinalDeathSound()
    }
  }

  // Override the default death to trigger custom animation
  protected createDeathEffect(): void {
    // Start the bespoke death animation instead of instant death
    this.isDying = true
    this.deathTimer = 0
    this.explodedSegments.clear()
    
    // Keep alive during death animation
    this.alive = true
    
    // Play death start sound
    if (this.audioManager) {
      this.audioManager.playChaosWormDeathStartSound()
    }
  }

  protected updateVisuals(deltaTime: number): void {
    // Skip normal visuals if dying
    if (this.isDying) return
    
    const time = Date.now() * 0.001

    // Update each segment with wave motion - 3x BIGGER spacing
    for (let i = 0; i < this.segments.length; i++) {
      const segment = this.segments[i]
      const offset = i * 0.6
      const wave = Math.sin(time * 3 + offset) * 1.2 // Bigger wave
      
      segment.position.set(
        -i * 2.4 + wave, // 3x bigger spacing
        Math.sin(time * 2 + offset) * 0.8,
        Math.cos(time * 4 + offset) * 0.4
      )
      
      // Crazy rotation
      segment.rotation.x = time * 2 + i * 0.5
      segment.rotation.y = time * 3 + i * 0.3
      segment.rotation.z = time * 1.5 + i * 0.7
      
      // Color shifting
      const material = segment.material as THREE.MeshLambertMaterial
      const hue = ((time * 0.5 + i * 0.1) % 1)
      const color = new THREE.Color().setHSL(hue, 0.9, 0.6)
      material.color.copy(color)
      material.emissive.copy(color).multiplyScalar(0.4)
      
      // Scale pulsing
      const scale = 1 + Math.sin(time * 4 + i * 0.5) * 0.25
      segment.scale.setScalar(scale)
      
      // Update spikes animation
      for (let j = 2; j < segment.children.length - 1; j++) { // Skip wireframe, aura, and core
        const spike = segment.children[j] as THREE.Mesh
        if (spike && spike.geometry instanceof THREE.ConeGeometry) {
          const spikeMaterial = spike.material as THREE.MeshBasicMaterial
          spikeMaterial.opacity = 0.6 + Math.sin(time * 8 + i + j) * 0.4
          
          // Extend spikes periodically
          const extension = 1 + Math.sin(time * 6 + i * 0.5 + j * 0.3) * 0.3
          spike.scale.y = extension
        }
      }
      
      // Update inner core
      const core = segment.children[segment.children.length - 1] as THREE.Mesh
      if (core) {
        const coreMaterial = core.material as THREE.MeshBasicMaterial
        coreMaterial.opacity = 0.5 + Math.sin(time * 10 + i) * 0.4
        core.scale.setScalar(1 + Math.sin(time * 8 + i) * 0.3)
      }
    }

    // Update MASSIVE particle system
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3
      
      // Update particle lifetime
      this.particleLifetimes[i] -= deltaTime * 1.5
      
      if (this.particleLifetimes[i] <= 0) {
        // Respawn particle at random segment position
        const segIndex = Math.floor(Math.random() * this.segments.length)
        const seg = this.segments[segIndex]
        const worldPos = new THREE.Vector3()
        seg.getWorldPosition(worldPos)
        
        this.particlePositions[i3] = worldPos.x
        this.particlePositions[i3 + 1] = worldPos.y
        this.particlePositions[i3 + 2] = worldPos.z
        
        // Random velocity
        this.particleVelocities[i3] = (Math.random() - 0.5) * 8
        this.particleVelocities[i3 + 1] = (Math.random() - 0.5) * 8
        this.particleVelocities[i3 + 2] = (Math.random() - 0.5) * 4
        
        this.particleLifetimes[i] = 1 + Math.random()
        
        // New rainbow color
        const hue = Math.random()
        const useSaturated = Math.random() < 0.8
        const color = new THREE.Color().setHSL(hue, 1.0, useSaturated ? 0.5 + Math.random() * 0.2 : 0.7)
        this.particleColors[i3] = color.r
        this.particleColors[i3 + 1] = color.g
        this.particleColors[i3 + 2] = color.b
      } else {
        // Update particle position
        this.particlePositions[i3] += this.particleVelocities[i3] * deltaTime
        this.particlePositions[i3 + 1] += this.particleVelocities[i3 + 1] * deltaTime
        this.particlePositions[i3 + 2] += this.particleVelocities[i3 + 2] * deltaTime
        
        // Apply gravity/drag
        this.particleVelocities[i3] *= 0.97
        this.particleVelocities[i3 + 1] *= 0.97
        this.particleVelocities[i3 + 2] *= 0.94
      }
    }

    this.particleGeometry.attributes.position.needsUpdate = true
    this.particleGeometry.attributes.color.needsUpdate = true
  }
}
