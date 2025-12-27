import * as THREE from 'three'
import { Enemy } from './Enemy'
import { Player } from './Player'
import { EnemyProjectile } from '../weapons/EnemyProjectile'
import { AudioManager } from '../audio/AudioManager'

/**
 * ⚡ FIZZER - CHAOS INCARNATE ⚡
 * A tiny, hyperactive menace that:
 * - Spawns when player achieves high multiplier without taking hits
 * - Moves erratically and unpredictably - like a caffeinated UFO
 * - Small and fast = hard to hit
 * - Fires rapid bursts of bullets
 * - Adds pure chaos to reward skilled players with... more challenge!
 */
export class Fizzer extends Enemy {
  private sceneManager: any = null
  private audioManager: AudioManager | null = null
  private projectiles: EnemyProjectile[] = []
  
  // ⚡ ERRATIC MOVEMENT STATE ⚡
  private erraticTimer: number = 0
  private erraticInterval: number = 0.15 // Change direction every 150ms!
  private currentDirection: THREE.Vector3 = new THREE.Vector3()
  private jitterAmount: number = 0
  private phaseOffset: number = Math.random() * Math.PI * 2
  
  // 🔫 FIRING STATE 🔫
  private fireTimer: number = 0
  private fireRate: number = 0.8 // Fast firing
  private burstCount: number = 0
  private burstTimer: number = 0
  private maxBurst: number = 3
  private burstDelay: number = 0.08
  
  // ✨ VISUAL STATE ✨
  private glowIntensity: number = 0
  private trailParticles: THREE.Points
  private trailPositions: Float32Array
  private trailColors: Float32Array
  private trailIndex: number = 0
  private maxTrailParticles: number = 30

  constructor(x: number, y: number) {
    super(x, y)
    // ⚡ TINY BUT DEADLY! ⚡
    this.health = 3
    this.maxHealth = 3
    this.speed = 8.0 // VERY FAST!
    this.damage = 10
    this.xpValue = 15 // Good reward for hitting this little menace
    this.radius = 0.35 // Small hitbox - hard to hit!
  }

  setSceneManager(sceneManager: any): void {
    this.sceneManager = sceneManager
  }

  setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager
  }

  getProjectiles(): EnemyProjectile[] {
    return this.projectiles
  }

  initialize(): void {
    // Create invisible container
    const containerGeometry = new THREE.CircleGeometry(0.01, 4)
    const containerMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    this.mesh = new THREE.Mesh(containerGeometry, containerMaterial)
    this.mesh.position.copy(this.position)

    // ⚡ MAIN BODY - Tiny glowing orb ⚡
    const coreGeometry = new THREE.SphereGeometry(0.25, 16, 16)
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FF88,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    })
    const core = new THREE.Mesh(coreGeometry, coreMaterial)
    this.mesh.add(core)

    // ⚡ INNER ELECTRIC CORE ⚡
    const innerGeometry = new THREE.IcosahedronGeometry(0.15, 1)
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    })
    const inner = new THREE.Mesh(innerGeometry, innerMaterial)
    this.mesh.add(inner)

    // ⚡ ELECTRIC SPIKES - Random directions ⚡
    for (let i = 0; i < 8; i++) {
      const spikeGeometry = new THREE.ConeGeometry(0.04, 0.2, 4)
      const spikeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00FFFF,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      })
      const spike = new THREE.Mesh(spikeGeometry, spikeMaterial)
      
      // Random direction
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      spike.position.set(
        Math.sin(phi) * Math.cos(theta) * 0.25,
        Math.sin(phi) * Math.sin(theta) * 0.25,
        Math.cos(phi) * 0.25
      )
      spike.lookAt(spike.position.clone().multiplyScalar(2))
      this.mesh.add(spike)
    }

    // ⚡ ORBITING SPARKS ⚡
    for (let i = 0; i < 4; i++) {
      const sparkGeometry = new THREE.OctahedronGeometry(0.06, 0)
      const sparkMaterial = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00FF00 : 0x00FFFF,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      })
      const spark = new THREE.Mesh(sparkGeometry, sparkMaterial)
      spark.userData.orbitOffset = (i / 4) * Math.PI * 2
      spark.userData.orbitRadius = 0.35
      this.mesh.add(spark)
    }

    // ⚡ GLOWING RING ⚡
    const ringGeometry = new THREE.RingGeometry(0.3, 0.35, 16)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FF88,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    this.mesh.add(ring)

    // ⚡ TRAIL PARTICLE SYSTEM ⚡
    this.trailPositions = new Float32Array(this.maxTrailParticles * 3)
    this.trailColors = new Float32Array(this.maxTrailParticles * 3)
    
    for (let i = 0; i < this.maxTrailParticles; i++) {
      const i3 = i * 3
      this.trailPositions[i3] = this.position.x
      this.trailPositions[i3 + 1] = this.position.y
      this.trailPositions[i3 + 2] = 0
      this.trailColors[i3] = 0
      this.trailColors[i3 + 1] = 1
      this.trailColors[i3 + 2] = 0.5
    }
    
    const trailGeometry = new THREE.BufferGeometry()
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(this.trailPositions, 3))
    trailGeometry.setAttribute('color', new THREE.BufferAttribute(this.trailColors, 3))
    
    const trailMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: false
    })
    
    this.trailParticles = new THREE.Points(trailGeometry, trailMaterial)
    this.mesh.add(this.trailParticles)
    
    // Initialize random direction
    this.randomizeDirection()
  }

  private randomizeDirection(): void {
    // Completely random direction change
    const angle = Math.random() * Math.PI * 2
    this.currentDirection.set(
      Math.cos(angle),
      Math.sin(angle),
      0
    )
    this.jitterAmount = 0.5 + Math.random() * 0.5
  }

  updateAI(deltaTime: number, player: Player): void {
    const time = Date.now() * 0.001
    const playerPos = player.getPosition()
    
    // ⚡ ERRATIC MOVEMENT - Change direction frequently! ⚡
    this.erraticTimer += deltaTime
    if (this.erraticTimer >= this.erraticInterval) {
      this.erraticTimer = 0
      this.erraticInterval = 0.1 + Math.random() * 0.15 // Vary the interval too!
      
      // 70% chance to jitter randomly, 30% chance to aim at player
      if (Math.random() < 0.7) {
        this.randomizeDirection()
      } else {
        // Briefly aim at player
        this.currentDirection = playerPos.clone().sub(this.position).normalize()
      }
    }
    
    // Add extra jitter on top of current direction
    const jitterX = (Math.random() - 0.5) * this.jitterAmount
    const jitterY = (Math.random() - 0.5) * this.jitterAmount
    
    // Sinusoidal overlay for extra chaos
    const sinOffset = Math.sin(time * 15 + this.phaseOffset) * 0.5
    const cosOffset = Math.cos(time * 12 + this.phaseOffset) * 0.5
    
    this.velocity.set(
      (this.currentDirection.x + jitterX + sinOffset) * this.speed,
      (this.currentDirection.y + jitterY + cosOffset) * this.speed,
      0
    )
    
    // Clamp to world bounds with bounce
    const worldBound = 26
    if (Math.abs(this.position.x) > worldBound) {
      this.currentDirection.x *= -1
      this.position.x = Math.sign(this.position.x) * worldBound
    }
    if (Math.abs(this.position.y) > worldBound) {
      this.currentDirection.y *= -1
      this.position.y = Math.sign(this.position.y) * worldBound
    }
    
    // 🔫 FIRING LOGIC 🔫
    const distanceToPlayer = this.position.distanceTo(playerPos)
    
    if (distanceToPlayer < 15) { // Only fire when somewhat close
      if (this.burstCount > 0) {
        // In burst mode
        this.burstTimer += deltaTime
        if (this.burstTimer >= this.burstDelay) {
          this.fireAtPlayer(player)
          this.burstTimer = 0
          this.burstCount--
        }
      } else {
        // Check for new burst
        this.fireTimer += deltaTime
        if (this.fireTimer >= this.fireRate) {
          this.burstCount = this.maxBurst
          this.burstTimer = 0
          this.fireTimer = 0
        }
      }
    }
    
    // Update projectiles
    this.updateProjectiles(deltaTime)
  }

  private fireAtPlayer(player: Player): void {
    const playerPos = player.getPosition()
    
    // Add some inaccuracy - fitting for the erratic nature
    const spread = 0.3
    const direction = playerPos.clone().sub(this.position).normalize()
    direction.x += (Math.random() - 0.5) * spread
    direction.y += (Math.random() - 0.5) * spread
    direction.normalize()
    
    const projectile = new EnemyProjectile(
      this.position.clone(),
      direction,
      12, // Fast bullets!
      6   // Lower damage per bullet
    )
    
    this.projectiles.push(projectile)
    if (this.sceneManager) {
      this.sceneManager.addToScene(projectile.getMesh())
    }
    
    // Play zap sound
    if (this.audioManager) {
      this.audioManager.playFizzerZapSound()
    }
  }

  private updateProjectiles(deltaTime: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i]
      projectile.update(deltaTime)
      
      if (!projectile.isAlive()) {
        if (this.sceneManager) {
          this.sceneManager.removeFromScene(projectile.getMesh())
        }
        this.projectiles.splice(i, 1)
      }
    }
  }

  protected updateVisuals(deltaTime: number): void {
    const time = Date.now() * 0.001
    
    // ⚡ RAPID ROTATION ⚡
    this.mesh.rotation.z += deltaTime * 8
    this.mesh.rotation.x = Math.sin(time * 10) * 0.3
    this.mesh.rotation.y = Math.cos(time * 8) * 0.3
    
    // ⚡ SCALE PULSE - Rapid and erratic ⚡
    const pulse = 1 + Math.sin(time * 20) * 0.15 + Math.sin(time * 33) * 0.1
    this.mesh.scale.setScalar(pulse)
    
    // ⚡ UPDATE INNER CORE ⚡
    const inner = this.mesh.children[1] as THREE.Mesh
    if (inner) {
      inner.rotation.x += deltaTime * 15
      inner.rotation.y += deltaTime * 12
      const innerMaterial = inner.material as THREE.MeshBasicMaterial
      innerMaterial.opacity = 0.7 + Math.sin(time * 25) * 0.3
    }
    
    // ⚡ ANIMATE SPIKES ⚡
    for (let i = 2; i < 10; i++) {
      const spike = this.mesh.children[i] as THREE.Mesh
      if (spike && spike.geometry instanceof THREE.ConeGeometry) {
        const spikeMaterial = spike.material as THREE.MeshBasicMaterial
        spikeMaterial.opacity = 0.5 + Math.sin(time * 15 + i) * 0.5
        
        // Extend/retract spikes
        const extension = 1 + Math.sin(time * 20 + i * 0.7) * 0.4
        spike.scale.y = extension
      }
    }
    
    // ⚡ ANIMATE ORBITING SPARKS ⚡
    for (let i = 10; i < 14; i++) {
      const spark = this.mesh.children[i] as THREE.Mesh
      if (spark && spark.userData.orbitOffset !== undefined) {
        const orbitAngle = time * 8 + spark.userData.orbitOffset
        const radius = spark.userData.orbitRadius + Math.sin(time * 15 + i) * 0.1
        spark.position.set(
          Math.cos(orbitAngle) * radius,
          Math.sin(orbitAngle) * radius,
          Math.sin(time * 10 + i) * 0.15
        )
        spark.rotation.z = orbitAngle * 2
      }
    }
    
    // ⚡ ANIMATE RING ⚡
    const ring = this.mesh.children[14] as THREE.Mesh
    if (ring) {
      ring.rotation.x = Math.sin(time * 6) * 0.5
      ring.rotation.y = Math.cos(time * 5) * 0.5
      const ringMaterial = ring.material as THREE.MeshBasicMaterial
      ringMaterial.opacity = 0.4 + Math.sin(time * 12) * 0.3
    }
    
    // ⚡ UPDATE TRAIL ⚡
    const i3 = this.trailIndex * 3
    this.trailPositions[i3] = -this.position.x // Relative to mesh
    this.trailPositions[i3 + 1] = -this.position.y
    this.trailPositions[i3 + 2] = 0
    
    // Fade older particles
    for (let i = 0; i < this.maxTrailParticles; i++) {
      const age = (this.trailIndex - i + this.maxTrailParticles) % this.maxTrailParticles
      const fade = 1 - (age / this.maxTrailParticles)
      const ci = i * 3
      this.trailColors[ci] = fade * 0.2
      this.trailColors[ci + 1] = fade
      this.trailColors[ci + 2] = fade * 0.5
    }
    
    this.trailIndex = (this.trailIndex + 1) % this.maxTrailParticles
    this.trailParticles.geometry.attributes.position.needsUpdate = true
    this.trailParticles.geometry.attributes.color.needsUpdate = true
  }
}

