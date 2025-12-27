import * as THREE from 'three'
import { Enemy } from './Enemy'
import { Player } from './Player'
import { EnemyProjectile } from '../weapons/EnemyProjectile'
import { AudioManager } from '../audio/AudioManager'

/**
 * 💎 CRYSTAL SHARD SWARM - MASSIVE PRISMATIC STORM 💎
 * A terrifying 3x sized crystal entity that:
 * - Orbits with deadly razor-sharp shards
 * - Fires crystal projectiles at the player
 * - Creates mesmerizing lightning effects
 * - Needs A LOT of bullets to destroy
 */
export class CrystalShardSwarm extends Enemy {
  private shards: THREE.Mesh[] = []
  private shardCount: number = 18 // More shards!
  private orbitRadius: number = 4.0 // Compact orbit
  private orbitSpeed: number = 0
  private lightningEffects: THREE.Line[] = []
  
  // 🔫 PROJECTILE SYSTEM 🔫
  private sceneManager: any = null
  private projectiles: EnemyProjectile[] = []
  private fireTimer: number = 0
  private fireRate: number = 1.2 // Fire every 1.2 seconds
  private burstCount: number = 0
  private burstTimer: number = 0
  private maxBurst: number = 3 // Fire 3 shards per burst
  private burstDelay: number = 0.15
  private audioManager: AudioManager | null = null
  
  // 💎 AMBIENT CRYSTAL HUM 💎
  private humTimer: number = 0
  private humInterval: number = 1.5
  
  // 🔴 HIT FLASH STATE 🔴
  private isFlashing: boolean = false
  private flashTimer: number = 0
  private flashDuration: number = 0.15 // 150ms flash
  private originalShardColors: THREE.Color[] = []

  constructor(x: number, y: number) {
    super(x, y)
    // 🔥 MASSIVE HEALTH - NEEDS LOTS OF BULLETS! 🔥
    this.health = 120
    this.maxHealth = 120
    this.speed = 1.8 // Fast
    this.damage = 40 // Collision damage
    this.xpValue = 45 // Big reward
    this.radius = 4.5 // Hitbox matches orbit radius
    this.orbitSpeed = Math.random() * 1.5 + 0.8
    this.trailInterval = 0.1 // Slower trail for performance (parent default is 0.05)
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
    // Create invisible center
    const centerGeometry = new THREE.SphereGeometry(0.3, 8, 8)
    const centerMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00FFFF,
      transparent: true, 
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    })
    this.mesh = new THREE.Mesh(centerGeometry, centerMaterial)
    this.mesh.position.copy(this.position)
    
    // 💎 CRYSTAL CORE - Pulsing center 💎
    const coreGeometry = new THREE.OctahedronGeometry(0.8, 2)
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FFFF,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })
    const core = new THREE.Mesh(coreGeometry, coreMaterial)
    this.mesh.add(core)
    
    // Core wireframe
    const coreWireGeometry = new THREE.OctahedronGeometry(0.85, 2)
    const coreWireMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FFFF,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    })
    const coreWire = new THREE.Mesh(coreWireGeometry, coreWireMaterial)
    this.mesh.add(coreWire)

    // 🎮 ASTEROIDS-STYLE CRYSTAL SHARDS 🎮
    for (let i = 0; i < this.shardCount; i++) {
      // Sharp crystal geometry - compact
      const shardGeometry = new THREE.ConeGeometry(0.3, 1.8, 6)
      
      // Prismatic colors
      const hue = (i / this.shardCount + Math.random() * 0.1) % 1
      const color = new THREE.Color().setHSL(hue, 1.0, 0.7)
      
      const shardMaterial = new THREE.MeshLambertMaterial({
        color: color,
        emissive: color.clone().multiplyScalar(0.5),
        transparent: true,
        opacity: 0.9
      })

      const shard = new THREE.Mesh(shardGeometry, shardMaterial)
      
      // 🌟 WIREFRAME OUTLINE - Classic vector style! 🌟
      const wireframeGeometry = new THREE.ConeGeometry(0.32, 1.85, 6)
      const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
      })
      const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial)
      shard.add(wireframe)
      
      // 💫 ENERGY AURA - Glowing tip! 💫
      const tipGeometry = new THREE.SphereGeometry(0.24, 8, 8)
      const tipMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      })
      const tip = new THREE.Mesh(tipGeometry, tipMaterial)
      tip.position.y = 0.9
      shard.add(tip)
      
      // ⚡ INNER CRYSTAL GLOW ⚡
      const innerGeometry = new THREE.ConeGeometry(0.15, 1.2, 6)
      const innerMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      })
      const inner = new THREE.Mesh(innerGeometry, innerMaterial)
      shard.add(inner)
      
      // Position in orbit
      const angle = (i / this.shardCount) * Math.PI * 2
      shard.position.set(
        Math.cos(angle) * this.orbitRadius,
        Math.sin(angle) * this.orbitRadius,
        0
      )
      
      // Point outward
      shard.rotation.z = angle + Math.PI / 2
      
      this.shards.push(shard)
      this.mesh.add(shard)
    }

    // Create MASSIVE lightning effects between shards
    for (let i = 0; i < this.shardCount; i++) {
      const points: THREE.Vector3[] = []
      const nextIndex = (i + 1) % this.shardCount
      
      // Create jagged lightning path
      const start = this.shards[i].position.clone()
      const end = this.shards[nextIndex].position.clone()
      
      points.push(start)
      
      // Add more random points for longer lightning
      for (let j = 1; j < 6; j++) { // More segments
        const t = j / 6
        const midPoint = start.clone().lerp(end, t)
        midPoint.add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.6
        ))
        points.push(midPoint)
      }
      
      points.push(end)
      
      const lightningGeometry = new THREE.BufferGeometry().setFromPoints(points)
      const lightningMaterial = new THREE.LineBasicMaterial({
        color: 0x00FFFF,
        transparent: true,
        opacity: 0.8,
        linewidth: 2
      })
      
      const lightning = new THREE.Line(lightningGeometry, lightningMaterial)
      this.lightningEffects.push(lightning)
      this.mesh.add(lightning)
    }
    
    // 🔮 OUTER ENERGY RINGS 🔮
    for (let i = 0; i < 3; i++) {
      const ringRadius = this.orbitRadius + 0.5 + i * 0.4
      const ringGeometry = new THREE.RingGeometry(ringRadius - 0.1, ringRadius, 32)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.5 + i * 0.1, 1.0, 0.7),
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.rotation.x = Math.PI / 2
      this.mesh.add(ring)
    }
  }

  updateAI(deltaTime: number, player: Player): void {
    // Erratic movement toward player
    const playerPos = player.getPosition()
    const direction = playerPos.sub(this.position).normalize()
    
    // Add some chaos to movement
    const chaos = new THREE.Vector3(
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 3,
      0
    )
    
    this.velocity = direction.multiplyScalar(this.speed)
      .add(chaos.multiplyScalar(0.4))
    
    // 🔫 FIRE CRYSTAL SHARDS! 🔫
    this.updateFiring(deltaTime, player)
    
    // Update existing projectiles
    this.updateProjectiles(deltaTime)
    
    // 💎 AMBIENT CRYSTAL HUM 💎
    this.humTimer += deltaTime
    if (this.humTimer >= this.humInterval) {
      if (this.audioManager) {
        this.audioManager.playCrystalHumSound()
      }
      this.humTimer = 0
    }
  }
  
  private updateFiring(deltaTime: number, player: Player): void {
    if (!this.sceneManager) return
    
    // Handle burst firing
    if (this.burstCount > 0) {
      this.burstTimer += deltaTime
      if (this.burstTimer >= this.burstDelay) {
        this.fireCrystalShard(player)
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
        
        // 🎵 PLAY CRYSTAL CHARGE SOUND! 🎵
        if (this.audioManager) {
          this.audioManager.playCrystalChargeSound()
        }
      }
    }
  }
  
  private fireCrystalShard(player: Player): void {
    const playerPos = player.getPosition()
    
    // Fire from a random shard
    const shardIndex = Math.floor(Math.random() * this.shards.length)
    const shard = this.shards[shardIndex]
    const worldPos = new THREE.Vector3()
    shard.getWorldPosition(worldPos)
    
    // Direction towards player
    const direction = playerPos.clone().sub(worldPos).normalize()
    
    const projectile = new EnemyProjectile(
      worldPos,
      direction,
      12, // Fast!
      12  // Damage
    )
    
    // Set custom color for crystal projectiles - cyan/prismatic
    const mesh = projectile.getMesh()
    const material = mesh.material as THREE.MeshBasicMaterial
    const hue = Math.random() * 0.3 + 0.45 // Cyan to green range
    material.color.setHSL(hue, 1.0, 0.6)
    
    // Update glow color too
    if (mesh.children[0]) {
      const glowMaterial = (mesh.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial
      glowMaterial.color.setHSL(hue, 1.0, 0.8)
    }
    
    this.projectiles.push(projectile)
    this.sceneManager.addToScene(projectile.getMesh())
    
    // 🎵 PLAY CRYSTAL FIRE SOUND! 🎵
    if (this.audioManager) {
      this.audioManager.playCrystalFireSound()
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

  // 🔴 OVERRIDE TAKE DAMAGE - Flash red, don't scale container! 🔴
  takeDamage(damage: number): void {
    this.health -= damage
    
    // Flash all shards and core RED
    if (!this.isFlashing) {
      this.isFlashing = true
      this.flashTimer = 0
      
      // Store original colors and set to RED
      this.originalShardColors = []
      for (const shard of this.shards) {
        const material = shard.material as THREE.MeshLambertMaterial
        this.originalShardColors.push(material.color.clone())
        
        // Set to bright RED
        material.color.setRGB(1, 0, 0)
        material.emissive.setRGB(1, 0, 0)
      }
      
      // Flash core red too
      const core = this.mesh.children[0] as THREE.Mesh
      if (core) {
        const coreMaterial = core.material as THREE.MeshBasicMaterial
        coreMaterial.color.setRGB(1, 0, 0)
      }
      
      // Flash lightning red
      for (const lightning of this.lightningEffects) {
        const lightningMaterial = lightning.material as THREE.LineBasicMaterial
        lightningMaterial.color.setRGB(1, 0, 0)
      }
    }

    if (this.health <= 0) {
      this.alive = false
      this.createDeathEffect()
    }
  }

  protected updateVisuals(deltaTime: number): void {
    const time = Date.now() * 0.001
    
    // 🛡️ SAFEGUARD: Ensure container mesh never scales (prevents size growth bug)
    this.mesh.scale.setScalar(1)
    
    // 🔴 Handle hit flash 🔴
    if (this.isFlashing) {
      this.flashTimer += deltaTime
      if (this.flashTimer >= this.flashDuration) {
        // Restore original colors
        this.isFlashing = false
        for (let i = 0; i < this.shards.length; i++) {
          const shard = this.shards[i]
          const material = shard.material as THREE.MeshLambertMaterial
          if (this.originalShardColors[i]) {
            material.color.copy(this.originalShardColors[i])
            material.emissive.copy(this.originalShardColors[i]).multiplyScalar(0.5)
          }
        }
        
        // Restore core color
        const core = this.mesh.children[0] as THREE.Mesh
        if (core) {
          const coreMaterial = core.material as THREE.MeshBasicMaterial
          coreMaterial.color.setHex(0x00FFFF)
        }
        
        // Restore lightning color (will be updated by animation anyway)
        for (const lightning of this.lightningEffects) {
          const lightningMaterial = lightning.material as THREE.LineBasicMaterial
          lightningMaterial.color.setHex(0x00FFFF)
        }
      }
    }

    // Orbit shards around center
    for (let i = 0; i < this.shards.length; i++) {
      const shard = this.shards[i]
      const baseAngle = (i / this.shardCount) * Math.PI * 2
      const angle = baseAngle + time * this.orbitSpeed
      
      // Varying orbit radius for more chaos - small variation
      const radius = this.orbitRadius + Math.sin(time * 3 + i) * 0.5
      
      shard.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        Math.sin(time * 4 + i * 0.5) * 0.3
      )
      
      // Point outward and spin
      shard.rotation.z = angle + Math.PI / 2 + time * 4
      shard.rotation.x = time * 2.5 + i
      
      // Color shifting (skip if flashing red)
      if (!this.isFlashing) {
        const material = shard.material as THREE.MeshLambertMaterial
        const hue = (time * 0.25 + i * 0.08) % 1
        const color = new THREE.Color().setHSL(hue, 1.0, 0.7)
        material.color.copy(color)
        material.emissive.copy(color).multiplyScalar(0.5)
      }
      
      // Scale pulsing - minimal to prevent growth
      const scale = 1 + Math.sin(time * 6 + i) * 0.1
      shard.scale.setScalar(scale)
    }

    // 🌈 UPDATE MASSIVE LIGHTNING EFFECTS 🌈
    for (let i = 0; i < this.lightningEffects.length; i++) {
      const lightning = this.lightningEffects[i]
      const material = lightning.material as THREE.LineBasicMaterial
      
      // Update lightning path to connect shards
      const nextIndex = (i + 1) % this.shardCount
      const start = this.shards[i].position.clone()
      const end = this.shards[nextIndex].position.clone()
      
      const points: THREE.Vector3[] = [start]
      for (let j = 1; j < 6; j++) {
        const t = j / 6
        const midPoint = start.clone().lerp(end, t)
        midPoint.add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.6
        ))
        points.push(midPoint)
      }
      points.push(end)
      
      lightning.geometry.setFromPoints(points)
      
      // 💫 FLICKERING LIGHTNING - More intense! 💫
      material.opacity = 0.5 + Math.sin(time * 25 + i * 2) * 0.5
      
      // 🌈 COLOR SHIFTING - Rainbow effect! (skip if flashing red) 🌈
      if (!this.isFlashing) {
        const hue = (time * 0.6 + i * 0.08) % 1
        material.color.setHSL(hue, 1.0, 0.7)
      }
    }
    
    // ✨ ANIMATE SHARD DETAILS ✨
    for (let i = 0; i < this.shards.length; i++) {
      const shard = this.shards[i]
      
      // Wireframe
      const wireframe = shard.children[0] as THREE.Mesh
      if (wireframe) {
        wireframe.rotation.copy(shard.rotation)
        const wireframeMaterial = wireframe.material as THREE.MeshBasicMaterial
        wireframeMaterial.opacity = 0.7 + Math.sin(time * 12 + i) * 0.3
      }
      
      // 💫 ANIMATE ENERGY TIPS 💫
      const tip = shard.children[1] as THREE.Mesh
      if (tip) {
        const tipMaterial = tip.material as THREE.MeshBasicMaterial
        tipMaterial.opacity = 0.6 + Math.sin(time * 15 + i) * 0.4
        tip.scale.setScalar(1 + Math.sin(time * 10 + i) * 0.15)
      }
      
      // Inner glow
      const inner = shard.children[2] as THREE.Mesh
      if (inner) {
        const innerMaterial = inner.material as THREE.MeshBasicMaterial
        innerMaterial.opacity = 0.3 + Math.sin(time * 20 + i) * 0.2
      }
    }
    
    // Animate core (skip color update if flashing red)
    const core = this.mesh.children[0] as THREE.Mesh
    if (core) {
      core.rotation.x = time * 2
      core.rotation.y = time * 1.5
      const coreMaterial = core.material as THREE.MeshBasicMaterial
      if (!this.isFlashing) {
        coreMaterial.opacity = 0.4 + Math.sin(time * 8) * 0.3
      }
      // Minimal core scaling to prevent growth
      const coreScale = 1 + Math.sin(time * 6) * 0.05
      core.scale.setScalar(coreScale)
    }
    
    // Animate core wireframe
    const coreWire = this.mesh.children[1] as THREE.Mesh
    if (coreWire) {
      coreWire.rotation.x = -time * 2.5
      coreWire.rotation.y = -time * 2
    }
    
    // Animate outer rings
    const ringStartIndex = this.shardCount + this.lightningEffects.length + 2
    for (let i = 0; i < 3; i++) {
      const ring = this.mesh.children[ringStartIndex + i] as THREE.Mesh
      if (ring && ring.geometry instanceof THREE.RingGeometry) {
        ring.rotation.z = time * (0.5 + i * 0.3) * (i % 2 === 0 ? 1 : -1)
        const ringMaterial = ring.material as THREE.MeshBasicMaterial
        ringMaterial.opacity = 0.2 + Math.sin(time * 4 + i) * 0.15
      }
    }

    // NO whole-mesh scaling - prevents size growth bug!
    // Mesh scale locked to 1 at start of updateVisuals
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
