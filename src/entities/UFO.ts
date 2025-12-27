import * as THREE from 'three'
import { Enemy } from './Enemy'
import { Player } from './Player'
import { AudioManager } from '../audio/AudioManager'

/**
 * 🛸 UFO - INTELLIGENT ALIEN CRAFT 🛸
 * A sleek spacecraft piloted by intelligent beings:
 * - Later game enemy (spawns after level 5+)
 * - Moves in organic, curved paths - as if piloted intelligently
 * - Slightly larger than player
 * - Classic flying saucer design with jet trails
 * - Fires laser BEAMS (not bullets) - 10% damage (reduced for testing)
 */
export class UFO extends Enemy {
  private sceneManager: any = null
  private audioManager: AudioManager | null = null
  
  // 🛸 ORGANIC MOVEMENT STATE 🛸
  private targetPoint: THREE.Vector3 = new THREE.Vector3()
  private controlPoint: THREE.Vector3 = new THREE.Vector3() // Bezier control point
  private pathProgress: number = 0
  private pathDuration: number = 3.0 // Time to complete path
  private startPoint: THREE.Vector3 = new THREE.Vector3()
  private orbitAngle: number = 0
  private orbitMode: boolean = false // Sometimes orbits player
  
  // 🔴 LASER BEAM STATE 🔴
  private laserChargeTime: number = 0
  private laserChargeDuration: number = 1.5 // Charge up before firing
  private isCharging: boolean = false
  private isFiring: boolean = false
  private laserDuration: number = 0.8 // How long laser stays active
  private laserTimer: number = 0
  private laserCooldown: number = 4.0 // Time between laser attacks
  private laserCooldownTimer: number = 2.0 // Start partially charged
  private laserBeam: THREE.Mesh | null = null
  private laserTarget: THREE.Vector3 = new THREE.Vector3()
  
  // ✨ VISUAL COMPONENTS ✨
  private jetTrails: THREE.Points[] = []
  private trailPositions: Float32Array[] = []
  private trailIndex: number = 0
  private maxTrailParticles: number = 40
  private domeLights: THREE.Mesh[] = []

  constructor(x: number, y: number) {
    super(x, y)
    // 🛸 STURDY ALIEN CRAFT 🛸
    this.health = 40
    this.maxHealth = 40
    this.speed = 3.5 // Moderate speed - relies on smart movement
    this.damage = 20 // Collision damage
    this.xpValue = 25
    this.radius = 1.2 // Bit larger than player
  }

  setSceneManager(sceneManager: any): void {
    this.sceneManager = sceneManager
  }

  setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager
  }

  initialize(): void {
    // Create container
    const containerGeometry = new THREE.CircleGeometry(0.01, 4)
    const containerMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    this.mesh = new THREE.Mesh(containerGeometry, containerMaterial)
    this.mesh.position.copy(this.position)

    // 🛸 MAIN SAUCER BODY 🛸
    const saucerGeometry = new THREE.CylinderGeometry(1.0, 1.2, 0.3, 24)
    const saucerMaterial = new THREE.MeshBasicMaterial({
      color: 0x445566,
      transparent: true,
      opacity: 0.9
    })
    const saucer = new THREE.Mesh(saucerGeometry, saucerMaterial)
    saucer.rotation.x = Math.PI / 2
    this.mesh.add(saucer)

    // 🛸 SAUCER WIREFRAME OUTLINE 🛸
    const wireframeGeometry = new THREE.CylinderGeometry(1.02, 1.22, 0.32, 24)
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FFFF,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    })
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial)
    wireframe.rotation.x = Math.PI / 2
    this.mesh.add(wireframe)

    // 🛸 COCKPIT DOME 🛸
    const domeGeometry = new THREE.SphereGeometry(0.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2)
    const domeMaterial = new THREE.MeshBasicMaterial({
      color: 0x88AAFF,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    })
    const dome = new THREE.Mesh(domeGeometry, domeMaterial)
    dome.position.z = 0.15
    this.mesh.add(dome)

    // 🛸 DOME WIREFRAME 🛸
    const domeWireGeometry = new THREE.SphereGeometry(0.52, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2)
    const domeWireMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FFFF,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    })
    const domeWire = new THREE.Mesh(domeWireGeometry, domeWireMaterial)
    domeWire.position.z = 0.15
    this.mesh.add(domeWire)

    // 🛸 RUNNING LIGHTS AROUND EDGE 🛸
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const lightGeometry = new THREE.SphereGeometry(0.08, 8, 8)
      const lightMaterial = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0xFF0000 : (i % 3 === 1 ? 0x00FF00 : 0x0088FF),
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      })
      const light = new THREE.Mesh(lightGeometry, lightMaterial)
      light.position.set(
        Math.cos(angle) * 1.1,
        Math.sin(angle) * 1.1,
        0
      )
      this.domeLights.push(light)
      this.mesh.add(light)
    }

    // 🛸 BOTTOM GLOW / TRACTOR BEAM EMITTER 🛸
    const glowGeometry = new THREE.CircleGeometry(0.6, 16)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FF88,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    glow.position.z = -0.2
    this.mesh.add(glow)

    // 🔴 LASER WEAPON (initially hidden) 🔴
    const laserGeometry = new THREE.CylinderGeometry(0.05, 0.08, 20, 8)
    const laserMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF0000,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    })
    this.laserBeam = new THREE.Mesh(laserGeometry, laserMaterial)
    this.laserBeam.visible = false
    this.mesh.add(this.laserBeam)

    // 🔥 JET TRAILS (2 engines) 🔥
    for (let j = 0; j < 2; j++) {
      const positions = new Float32Array(this.maxTrailParticles * 3)
      const colors = new Float32Array(this.maxTrailParticles * 3)
      
      for (let i = 0; i < this.maxTrailParticles; i++) {
        const i3 = i * 3
        positions[i3] = 0
        positions[i3 + 1] = 0
        positions[i3 + 2] = 0
        colors[i3] = 1
        colors[i3 + 1] = 0.5
        colors[i3 + 2] = 0
      }
      
      const trailGeometry = new THREE.BufferGeometry()
      trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      trailGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      
      const trailMaterial = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: false
      })
      
      const trail = new THREE.Points(trailGeometry, trailMaterial)
      this.jetTrails.push(trail)
      this.trailPositions.push(positions)
      this.mesh.add(trail)
    }

    // Initialize first path
    this.generateNewPath()
  }

  private generateNewPath(): void {
    this.startPoint.copy(this.position)
    this.pathProgress = 0
    
    // 30% chance to enter orbit mode around player
    this.orbitMode = Math.random() < 0.3
    
    if (!this.orbitMode) {
      // Generate a curved path with bezier control point
      const angle = Math.random() * Math.PI * 2
      const distance = 8 + Math.random() * 12
      
      this.targetPoint.set(
        this.position.x + Math.cos(angle) * distance,
        this.position.y + Math.sin(angle) * distance,
        0
      )
      
      // Clamp to world bounds
      const worldBound = 25
      this.targetPoint.x = Math.max(-worldBound, Math.min(worldBound, this.targetPoint.x))
      this.targetPoint.y = Math.max(-worldBound, Math.min(worldBound, this.targetPoint.y))
      
      // Control point perpendicular to path for curved motion
      const midPoint = this.startPoint.clone().add(this.targetPoint).multiplyScalar(0.5)
      const perpAngle = angle + Math.PI / 2
      const curveAmount = (Math.random() - 0.5) * 10
      
      this.controlPoint.set(
        midPoint.x + Math.cos(perpAngle) * curveAmount,
        midPoint.y + Math.sin(perpAngle) * curveAmount,
        0
      )
      
      this.pathDuration = 2 + Math.random() * 2
    }
  }

  private quadraticBezier(t: number, p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3): THREE.Vector3 {
    const oneMinusT = 1 - t
    return p0.clone().multiplyScalar(oneMinusT * oneMinusT)
      .add(p1.clone().multiplyScalar(2 * oneMinusT * t))
      .add(p2.clone().multiplyScalar(t * t))
  }

  updateAI(deltaTime: number, player: Player): void {
    const playerPos = player.getPosition()
    const distanceToPlayer = this.position.distanceTo(playerPos)
    
    // 🛸 ORGANIC MOVEMENT 🛸
    if (this.orbitMode) {
      // Orbit around player
      this.orbitAngle += deltaTime * 1.5
      const orbitRadius = 10 + Math.sin(this.orbitAngle * 0.5) * 3
      
      const targetX = playerPos.x + Math.cos(this.orbitAngle) * orbitRadius
      const targetY = playerPos.y + Math.sin(this.orbitAngle) * orbitRadius
      
      const direction = new THREE.Vector3(targetX - this.position.x, targetY - this.position.y, 0)
      direction.normalize()
      
      this.velocity = direction.multiplyScalar(this.speed)
      
      // Exit orbit mode after a while
      if (Math.random() < deltaTime * 0.3) {
        this.orbitMode = false
        this.generateNewPath()
      }
    } else {
      // Follow curved bezier path
      this.pathProgress += deltaTime / this.pathDuration
      
      if (this.pathProgress >= 1) {
        this.generateNewPath()
      } else {
        const targetPos = this.quadraticBezier(
          this.pathProgress,
          this.startPoint,
          this.controlPoint,
          this.targetPoint
        )
        
        const direction = targetPos.clone().sub(this.position)
        if (direction.length() > 0.1) {
          direction.normalize()
          this.velocity = direction.multiplyScalar(this.speed)
        }
      }
    }
    
    // 🔴 LASER ATTACK LOGIC 🔴
    if (!this.isCharging && !this.isFiring) {
      this.laserCooldownTimer += deltaTime
      
      // Start charging when cooldown complete and player is in range
      if (this.laserCooldownTimer >= this.laserCooldown && distanceToPlayer < 18) {
        this.isCharging = true
        this.laserChargeTime = 0
        this.laserTarget.copy(playerPos)
        
        if (this.audioManager) {
          this.audioManager.playUFOChargeSound()
        }
      }
    }
    
    if (this.isCharging) {
      this.laserChargeTime += deltaTime
      // Track player during charge
      this.laserTarget.lerp(playerPos, deltaTime * 2)
      
      if (this.laserChargeTime >= this.laserChargeDuration) {
        // FIRE!
        this.isCharging = false
        this.isFiring = true
        this.laserTimer = 0
        
        if (this.audioManager) {
          this.audioManager.playUFOLaserSound()
        }
      }
    }
    
    if (this.isFiring) {
      this.laserTimer += deltaTime
      
      if (this.laserTimer >= this.laserDuration) {
        this.isFiring = false
        this.laserCooldownTimer = 0
        if (this.laserBeam) {
          this.laserBeam.visible = false
        }
      }
    }
  }

  // 🔴 CHECK IF LASER HITS PLAYER 🔴
  checkLaserHit(player: Player): boolean {
    if (!this.isFiring || !this.laserBeam) return false
    
    const playerPos = player.getPosition()
    const playerRadius = player.getRadius()
    
    // Line-circle intersection check
    const laserStart = this.position.clone()
    const laserEnd = this.laserTarget.clone()
    const laserDir = laserEnd.clone().sub(laserStart).normalize()
    const laserLength = 20
    
    // Project player position onto laser line
    const toPlayer = playerPos.clone().sub(laserStart)
    const projection = toPlayer.dot(laserDir)
    
    if (projection < 0 || projection > laserLength) return false
    
    const closestPoint = laserStart.clone().add(laserDir.multiplyScalar(projection))
    const distance = playerPos.distanceTo(closestPoint)
    
    return distance < playerRadius + 0.2 // Laser has some thickness
  }

  getLaserDamage(): number {
    return 10 // 10% of player health (reduced for testing - TODO: balance pass later)
  }

  isLaserActive(): boolean {
    return this.isFiring
  }

  protected updateVisuals(deltaTime: number): void {
    const time = Date.now() * 0.001
    
    // 🛸 GENTLE HOVER MOTION 🛸
    this.mesh.position.z = Math.sin(time * 2) * 0.1
    
    // 🛸 SLIGHT TILT BASED ON VELOCITY 🛸
    const tiltX = this.velocity.y * 0.05
    const tiltY = -this.velocity.x * 0.05
    this.mesh.rotation.x = THREE.MathUtils.lerp(this.mesh.rotation.x, tiltX, deltaTime * 5)
    this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, tiltY, deltaTime * 5)
    
    // 🛸 RUNNING LIGHTS ANIMATION 🛸
    for (let i = 0; i < this.domeLights.length; i++) {
      const light = this.domeLights[i]
      const material = light.material as THREE.MeshBasicMaterial
      const phase = (time * 3 + i * 0.5) % 1
      material.opacity = 0.3 + phase * 0.7
      
      // Pulse size
      const scale = 0.8 + Math.sin(time * 8 + i) * 0.3
      light.scale.setScalar(scale)
    }
    
    // 🛸 DOME GLOW 🛸
    const dome = this.mesh.children[2] as THREE.Mesh
    if (dome) {
      const domeMaterial = dome.material as THREE.MeshBasicMaterial
      domeMaterial.opacity = 0.5 + Math.sin(time * 3) * 0.2
    }
    
    // 🛸 BOTTOM GLOW 🛸
    const bottomGlow = this.mesh.children[16] as THREE.Mesh
    if (bottomGlow) {
      const glowMaterial = bottomGlow.material as THREE.MeshBasicMaterial
      glowMaterial.opacity = 0.3 + Math.sin(time * 4) * 0.2
      bottomGlow.scale.setScalar(1 + Math.sin(time * 6) * 0.1)
    }
    
    // 🔴 LASER BEAM VISUAL 🔴
    if (this.laserBeam) {
      const laserMaterial = this.laserBeam.material as THREE.MeshBasicMaterial
      
      if (this.isCharging) {
        // Show charging effect
        this.laserBeam.visible = true
        laserMaterial.opacity = (this.laserChargeTime / this.laserChargeDuration) * 0.5
        laserMaterial.color.setHSL(0, 1, 0.3 + (this.laserChargeTime / this.laserChargeDuration) * 0.4)
        
        // Point at target
        const direction = this.laserTarget.clone().sub(this.position)
        this.laserBeam.lookAt(this.laserTarget)
        this.laserBeam.rotateX(Math.PI / 2)
        this.laserBeam.position.set(direction.x * 0.5, direction.y * 0.5, -0.2)
        
        const chargeScale = this.laserChargeTime / this.laserChargeDuration
        this.laserBeam.scale.set(chargeScale * 0.5, 0.5, chargeScale * 0.5)
      } else if (this.isFiring) {
        // Full laser!
        this.laserBeam.visible = true
        const flicker = 0.7 + Math.sin(time * 50) * 0.3
        laserMaterial.opacity = flicker
        laserMaterial.color.setRGB(1, 0.2, 0.2)
        
        const direction = this.laserTarget.clone().sub(this.position)
        this.laserBeam.lookAt(this.laserTarget)
        this.laserBeam.rotateX(Math.PI / 2)
        this.laserBeam.position.set(direction.x * 0.5, direction.y * 0.5, -0.2)
        this.laserBeam.scale.set(1, 1, 1)
      } else {
        this.laserBeam.visible = false
        laserMaterial.opacity = 0
      }
    }
    
    // 🔥 JET TRAILS 🔥
    const trailOffsets = [
      { x: -0.5, y: 0 },
      { x: 0.5, y: 0 }
    ]
    
    for (let j = 0; j < 2; j++) {
      const positions = this.trailPositions[j]
      const i3 = this.trailIndex * 3
      
      // Engine position relative to UFO
      const engineX = trailOffsets[j].x * Math.cos(-this.velocity.x * 0.1)
      const engineY = trailOffsets[j].y
      
      // Trail goes opposite to velocity
      const trailX = -this.velocity.x * 0.02
      const trailY = -this.velocity.y * 0.02
      
      positions[i3] = engineX + trailX
      positions[i3 + 1] = engineY + trailY
      positions[i3 + 2] = -0.3 // Below the ship
      
      // Update colors (fade older particles)
      const colors = this.jetTrails[j].geometry.attributes.color.array as Float32Array
      for (let i = 0; i < this.maxTrailParticles; i++) {
        const age = (this.trailIndex - i + this.maxTrailParticles) % this.maxTrailParticles
        const fade = 1 - (age / this.maxTrailParticles)
        const ci = i * 3
        colors[ci] = fade // Red
        colors[ci + 1] = fade * 0.5 + Math.sin(time * 10 + i) * 0.2 // Orange variation
        colors[ci + 2] = fade * 0.1 // Slight blue
      }
      
      this.jetTrails[j].geometry.attributes.position.needsUpdate = true
      this.jetTrails[j].geometry.attributes.color.needsUpdate = true
    }
    
    this.trailIndex = (this.trailIndex + 1) % this.maxTrailParticles
  }
}

