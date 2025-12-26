import * as THREE from 'three'
import { Enemy } from './Enemy'
import { Player } from './Player'
import { EnemyProjectile } from '../weapons/EnemyProjectile'
import { AudioManager } from '../audio/AudioManager'

/**
 * 🌀 VOID SPHERE - MASSIVE COSMIC HORROR 🌀
 * A terrifying 4x sized dark matter entity that:
 * - Needs a LOT of bullets to destroy
 * - Emits void projectiles with cyberpunk sound effects
 * - Pulses with ominous energy
 */
export class VoidSphere extends Enemy {
  private voidRings: THREE.Mesh[] = []
  private distortionField: THREE.Mesh
  private gravityWaves: THREE.Points
  private waveGeometry: THREE.BufferGeometry
  private wavePositions: Float32Array
  private ringCount: number = 7 // More rings for bigger sphere
  private pulseTime: number = 0
  
  // 🔫 PROJECTILE SYSTEM 🔫
  private sceneManager: any = null
  private projectiles: EnemyProjectile[] = []
  private fireTimer: number = 0
  private fireRate: number = 0.8 // Fire faster than ScanDrone!
  private burstCount: number = 0
  private burstTimer: number = 0
  private maxBurst: number = 5 // Fire 5 bullets in a burst
  private burstDelay: number = 0.12 // Time between burst shots
  private audioManager: AudioManager | null = null
  
  // 💫 AMBIENT PULSE SOUND TIMER 💫
  private ambientPulseTimer: number = 0
  private ambientPulseInterval: number = 2.0

  constructor(x: number, y: number) {
    super(x, y)
    // 🔥 MASSIVE HEALTH - NEEDS LOTS OF BULLETS! 🔥
    this.health = 250
    this.maxHealth = 250
    this.speed = 0.6 // Slower because it's huge
    this.damage = 50 // DEVASTATING collision damage!
    this.xpValue = 50 // Big reward for killing this beast
    this.radius = 3.2 // 4x bigger radius (was 0.8)
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
    // 🌀 CREATE MASSIVE CENTRAL VOID SPHERE - 4X SIZE! 🌀
    const coreGeometry = new THREE.SphereGeometry(2.4, 32, 32) // 4x (was 0.6)
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.98
    })
    this.mesh = new THREE.Mesh(coreGeometry, coreMaterial)
    this.mesh.position.copy(this.position)
    
    // 💀 INNER VOID CORE - Pulsing darkness 💀
    const innerCoreGeometry = new THREE.SphereGeometry(1.8, 24, 24)
    const innerCoreMaterial = new THREE.MeshBasicMaterial({
      color: 0x110022,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })
    const innerCore = new THREE.Mesh(innerCoreGeometry, innerCoreMaterial)
    this.mesh.add(innerCore)

    // 🎮 ASTEROIDS-STYLE SWIRLING VOID RINGS - 4X BIGGER! 🎮
    for (let i = 0; i < this.ringCount; i++) {
      const ringRadius = 3.2 + i * 1.2 // 4x (was 0.8 + i * 0.3)
      const ringGeometry = new THREE.TorusGeometry(ringRadius, 0.2, 12, 48) // 4x thickness
      const ringColor = new THREE.Color().setHSL(0.8 + i * 0.03, 1.0, 0.3 + i * 0.08)
      
      // Main ring
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: ringColor,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
      
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.rotation.x = Math.random() * Math.PI
      ring.rotation.y = Math.random() * Math.PI
      ring.rotation.z = Math.random() * Math.PI
      
      // 🌟 WIREFRAME OUTLINE - Vector style! 🌟
      const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: ringColor,
        wireframe: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      })
      const wireframe = new THREE.Mesh(ringGeometry, wireframeMaterial)
      wireframe.rotation.copy(ring.rotation)
      ring.add(wireframe)
      
      // 💫 ENERGY PARTICLES - Orbiting around ring! 💫
      for (let j = 0; j < 12; j++) { // More particles
        const particleGeometry = new THREE.SphereGeometry(0.12, 8, 8) // 4x (was 0.03)
        const particleMaterial = new THREE.MeshBasicMaterial({
          color: ringColor,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending
        })
        const particle = new THREE.Mesh(particleGeometry, particleMaterial)
        const angle = (j / 12) * Math.PI * 2
        particle.position.set(
          Math.cos(angle) * ringRadius,
          Math.sin(angle) * ringRadius,
          0
        )
        ring.add(particle)
      }
      
      this.voidRings.push(ring)
      this.mesh.add(ring)
    }
    
    // ⚡ ENERGY TENDRILS - Reaching out! ⚡
    for (let i = 0; i < 8; i++) {
      const tendrilGeometry = new THREE.CylinderGeometry(0.08, 0.25, 4, 8)
      const tendrilMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.75, 1.0, 0.5),
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      })
      const tendril = new THREE.Mesh(tendrilGeometry, tendrilMaterial)
      const angle = (i / 8) * Math.PI * 2
      tendril.position.set(
        Math.cos(angle) * 2.8,
        Math.sin(angle) * 2.8,
        0
      )
      tendril.rotation.z = angle + Math.PI / 2
      this.mesh.add(tendril)
    }

    // Create MASSIVE distortion field effect
    const distortGeometry = new THREE.SphereGeometry(6, 48, 48) // 4x (was 1.5)
    const distortMaterial = new THREE.MeshBasicMaterial({
      color: 0x660088,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    })
    this.distortionField = new THREE.Mesh(distortGeometry, distortMaterial)
    this.mesh.add(this.distortionField)
    
    // 🔮 SECONDARY DISTORTION SHELL 🔮
    const outerDistortGeometry = new THREE.SphereGeometry(8, 32, 32)
    const outerDistortMaterial = new THREE.MeshBasicMaterial({
      color: 0x440066,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    })
    const outerDistortion = new THREE.Mesh(outerDistortGeometry, outerDistortMaterial)
    this.mesh.add(outerDistortion)

    // Create MASSIVE gravity wave particles
    const waveCount = 300 // More particles
    this.wavePositions = new Float32Array(waveCount * 3)
    const waveColors = new Float32Array(waveCount * 3)

    for (let i = 0; i < waveCount; i++) {
      const i3 = i * 3
      const angle = (i / waveCount) * Math.PI * 2
      const radius = 8 + Math.random() * 12 // 4x (was 2 + random * 3)
      
      this.wavePositions[i3] = Math.cos(angle) * radius
      this.wavePositions[i3 + 1] = Math.sin(angle) * radius
      this.wavePositions[i3 + 2] = (Math.random() - 0.5) * 8 // 4x depth
      
      // Purple/pink/cyan colors - cyberpunk palette!
      const hue = 0.75 + Math.random() * 0.15
      const color = new THREE.Color().setHSL(hue, 1.0, 0.5 + Math.random() * 0.3)
      waveColors[i3] = color.r
      waveColors[i3 + 1] = color.g
      waveColors[i3 + 2] = color.b
    }

    this.waveGeometry = new THREE.BufferGeometry()
    this.waveGeometry.setAttribute('position', new THREE.BufferAttribute(this.wavePositions, 3))
    this.waveGeometry.setAttribute('color', new THREE.BufferAttribute(waveColors, 3))

    const waveMaterial = new THREE.PointsMaterial({
      size: 0.4, // 4x (was 0.1)
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })

    this.gravityWaves = new THREE.Points(this.waveGeometry, waveMaterial)
    this.mesh.add(this.gravityWaves)
    
    // 🔥 EMISSION PORTS - Where bullets come from! 🔥
    for (let i = 0; i < 6; i++) {
      const portAngle = (i / 6) * Math.PI * 2
      const portGeometry = new THREE.RingGeometry(0.3, 0.5, 8)
      const portMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF00FF,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
      const port = new THREE.Mesh(portGeometry, portMaterial)
      port.position.set(
        Math.cos(portAngle) * 2.5,
        Math.sin(portAngle) * 2.5,
        0
      )
      port.lookAt(0, 0, 0)
      this.mesh.add(port)
    }
  }

  updateAI(deltaTime: number, player: Player): void {
    // Slow, menacing approach
    const playerPos = player.getPosition()
    const direction = playerPos.sub(this.position).normalize()
    
    // Pulsing movement speed
    this.pulseTime += deltaTime
    const speedMultiplier = 1 + Math.sin(this.pulseTime * 2) * 0.5
    
    this.velocity = direction.multiplyScalar(this.speed * speedMultiplier)
    
    // 🔫 FIRE VOID BULLETS! 🔫
    this.updateFiring(deltaTime, player)
    
    // Update existing projectiles
    this.updateProjectiles(deltaTime)
    
    // 💫 AMBIENT PULSE SOUND 💫
    this.ambientPulseTimer += deltaTime
    if (this.ambientPulseTimer >= this.ambientPulseInterval) {
      if (this.audioManager) {
        this.audioManager.playVoidSpherePulseSound()
      }
      this.ambientPulseTimer = 0
    }
  }
  
  private updateFiring(deltaTime: number, player: Player): void {
    if (!this.sceneManager) return
    
    // Handle burst firing
    if (this.burstCount > 0) {
      this.burstTimer += deltaTime
      if (this.burstTimer >= this.burstDelay) {
        this.fireVoidBullet(player)
        this.burstTimer = 0
        this.burstCount--
      }
    } else {
      // Wait for next burst
      this.fireTimer += deltaTime
      if (this.fireTimer >= this.fireRate) {
        this.burstCount = this.maxBurst
        this.burstTimer = 0
        this.fireTimer = 0
        
        // 🎵 PLAY VOID CHARGE SOUND! 🎵
        if (this.audioManager) {
          this.audioManager.playVoidSphereChargeSound()
        }
      }
    }
  }
  
  private fireVoidBullet(player: Player): void {
    const playerPos = player.getPosition()
    
    // Fire from random emission port around the sphere
    const portAngle = Math.random() * Math.PI * 2
    const firePos = this.position.clone().add(new THREE.Vector3(
      Math.cos(portAngle) * 2.5,
      Math.sin(portAngle) * 2.5,
      0
    ))
    
    // Direction towards player with slight spread
    const baseDirection = playerPos.clone().sub(firePos).normalize()
    const spread = 0.15
    const spreadDirection = new THREE.Vector3(
      baseDirection.x + (Math.random() - 0.5) * spread,
      baseDirection.y + (Math.random() - 0.5) * spread,
      0
    ).normalize()
    
    const projectile = new EnemyProjectile(
      firePos,
      spreadDirection,
      10, // Speed - fast!
      15  // Damage - hurts!
    )
    
    // Set custom color for void projectiles
    const mesh = projectile.getMesh()
    const material = mesh.material as THREE.MeshBasicMaterial
    material.color.setHex(0xFF00FF) // Magenta void color
    
    // Update glow color too
    if (mesh.children[0]) {
      const glowMaterial = (mesh.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial
      glowMaterial.color.setHex(0x8800FF) // Purple glow
    }
    
    this.projectiles.push(projectile)
    this.sceneManager.addToScene(projectile.getMesh())
    
    // 🎵 PLAY VOID FIRE SOUND! 🎵
    if (this.audioManager) {
      this.audioManager.playVoidSphereFireSound()
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

    // 🌪️ ROTATE VOID RINGS - Enhanced with wireframe! 🌪️
    for (let i = 0; i < this.voidRings.length; i++) {
      const ring = this.voidRings[i]
      ring.rotation.x += deltaTime * (0.8 + i * 0.2)
      ring.rotation.y += deltaTime * (0.4 + i * 0.15)
      ring.rotation.z += deltaTime * (0.6 + i * 0.08)
      
      // 💫 PULSING OPACITY - More dramatic! 💫
      const material = ring.material as THREE.MeshBasicMaterial
      material.opacity = 0.5 + Math.sin(time * 4 + i) * 0.4
      
      // 🌟 ANIMATE WIREFRAME - Rotating outline! 🌟
      const wireframe = ring.children[0] as THREE.Mesh
      if (wireframe) {
        wireframe.rotation.copy(ring.rotation)
        const wireframeMaterial = wireframe.material as THREE.MeshBasicMaterial
        wireframeMaterial.opacity = 0.7 + Math.sin(time * 5 + i) * 0.3
      }
      
      // ⚡ ANIMATE ENERGY PARTICLES - Orbiting! ⚡
      for (let j = 1; j < ring.children.length; j++) {
        const particle = ring.children[j] as THREE.Mesh
        if (particle) {
          const angle = ((j - 1) / 12) * Math.PI * 2 + time * (1.5 + i * 0.3)
          const ringRadius = 3.2 + i * 1.2
          particle.position.set(
            Math.cos(angle) * ringRadius,
            Math.sin(angle) * ringRadius,
            Math.sin(time * 3 + j) * 0.4
          )
          const particleMaterial = particle.material as THREE.MeshBasicMaterial
          particleMaterial.opacity = 0.6 + Math.sin(time * 8 + j) * 0.4
        }
      }
    }
    
    // ⚡ ANIMATE ENERGY TENDRILS ⚡
    const tendrilStartIndex = this.ringCount + 1 // After inner core and rings
    for (let i = 0; i < 8; i++) {
      const tendrilIndex = tendrilStartIndex + i
      const tendril = this.mesh.children[tendrilIndex] as THREE.Mesh
      if (tendril && tendril.geometry instanceof THREE.CylinderGeometry) {
        const angle = (i / 8) * Math.PI * 2 + time * 0.5
        const reach = 2.8 + Math.sin(time * 3 + i) * 0.8
        tendril.position.set(
          Math.cos(angle) * reach,
          Math.sin(angle) * reach,
          Math.sin(time * 2 + i * 0.5) * 0.5
        )
        tendril.rotation.z = angle + Math.PI / 2 + Math.sin(time * 4 + i) * 0.3
        
        const tendrilMaterial = tendril.material as THREE.MeshBasicMaterial
        tendrilMaterial.opacity = 0.4 + Math.sin(time * 6 + i) * 0.3
      }
    }

    // Distortion field breathing effect
    const breathe = 1 + Math.sin(time * 2) * 0.3
    this.distortionField.scale.setScalar(breathe)
    
    const distortMaterial = this.distortionField.material as THREE.MeshBasicMaterial
    distortMaterial.opacity = 0.1 + Math.sin(time * 4) * 0.1

    // Animate gravity waves spiraling inward
    for (let i = 0; i < this.wavePositions.length / 3; i++) {
      const i3 = i * 3
      const angle = time * 1.5 + (i / (this.wavePositions.length / 3)) * Math.PI * 2
      const radius = 12 - (time * 0.5 + i * 0.01) % 12
      
      this.wavePositions[i3] = Math.cos(angle) * radius
      this.wavePositions[i3 + 1] = Math.sin(angle) * radius
      this.wavePositions[i3 + 2] = Math.sin(time * 3 + i * 0.1) * 2
    }

    this.waveGeometry.attributes.position.needsUpdate = true

    // Core void pulsing - BIGGER pulse for massive sphere
    const corePulse = 1 + Math.sin(time * 4) * 0.15
    this.mesh.scale.setScalar(corePulse)
    
    // 🔮 INNER CORE ANIMATION 🔮
    const innerCore = this.mesh.children[0] as THREE.Mesh
    if (innerCore) {
      const innerMaterial = innerCore.material as THREE.MeshBasicMaterial
      innerMaterial.opacity = 0.6 + Math.sin(time * 6) * 0.3
      innerCore.rotation.x += deltaTime * 0.5
      innerCore.rotation.y += deltaTime * 0.3
    }
    
    // 🔥 ANIMATE EMISSION PORTS 🔥
    const portStartIndex = this.mesh.children.length - 6
    for (let i = 0; i < 6; i++) {
      const port = this.mesh.children[portStartIndex + i] as THREE.Mesh
      if (port && port.geometry instanceof THREE.RingGeometry) {
        const portMaterial = port.material as THREE.MeshBasicMaterial
        // Pulse when charging
        const chargeIntensity = this.burstCount > 0 ? 1.0 : 0.5 + Math.sin(time * 8 + i) * 0.3
        portMaterial.opacity = chargeIntensity
        
        // Rotate ports
        port.rotation.z += deltaTime * 3
      }
    }
  }
  
  // Override destroy to cleanup projectiles
  destroy(): void {
    // Cleanup projectiles
    for (const projectile of this.projectiles) {
      if (this.sceneManager) {
        this.sceneManager.removeFromScene(projectile.getMesh())
      }
    }
    this.projectiles = []
    
    super.destroy()
  }
}
