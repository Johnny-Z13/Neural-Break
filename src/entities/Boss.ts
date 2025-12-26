import * as THREE from 'three'
import { Enemy } from './Enemy'
import { Player } from './Player'
import { EnemyProjectile } from '../weapons/EnemyProjectile'
import { SceneManager } from '../graphics/SceneManager'
import { AudioManager } from '../audio/AudioManager'

export class Boss extends Enemy {
  private fireTimer: number = 0
  private fireRate: number = 0.5 // Fire every 0.5 seconds
  private projectileSpeed: number = 8
  private projectileDamage: number = 10
  private projectiles: EnemyProjectile[] = []
  private sceneManager: SceneManager | null = null // Will be set from outside
  private audioManager: AudioManager | null = null // Will be set from outside
  private armorPlates: THREE.Mesh[] = []
  private coreMesh: THREE.Mesh
  private energyRings: THREE.Mesh[] = []
  private weaponTurrets: THREE.Mesh[] = []
  private pulseTime: number = 0
  private attackPhase: number = 0 // 0 = normal, 1 = rapid fire, 2 = spread
  private phaseTimer: number = 0

  constructor(x: number, y: number) {
    super(x, y)
    this.health = 100 // HIGH HP!
    this.maxHealth = 100
    this.speed = 0.5 // Slow but menacing
    this.damage = 30 // High collision damage
    this.xpValue = 50 // High XP reward
    this.radius = 1.5 // LARGE!
  }

  initialize(): void {
    // 👹 MASSIVE SCARY BOSS DESIGN - Multi-layered threat! 👹
    
    // Main core body - large octahedron
    const coreGeometry = new THREE.OctahedronGeometry(1.0, 2)
    const coreMaterial = new THREE.MeshLambertMaterial({
      color: 0x8B0000, // Dark red
      emissive: 0x440000, // Deep red glow
      transparent: true,
      opacity: 0.95
    })
    this.coreMesh = new THREE.Mesh(coreGeometry, coreMaterial)
    
    // 🌟 WIREFRAME OUTLINE - Vector style! 🌟
    const wireframeGeometry = new THREE.OctahedronGeometry(1.0, 2)
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF0000,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    })
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial)
    this.coreMesh.add(wireframe)
    
    // Create container mesh
    const containerGeometry = new THREE.SphereGeometry(0.1, 4, 4)
    const containerMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    this.mesh = new THREE.Mesh(containerGeometry, containerMaterial)
    this.mesh.position.copy(this.position)
    this.mesh.add(this.coreMesh)
    
    // 🛡️ ARMOR PLATES - Protective layers! 🛡️
    for (let i = 0; i < 6; i++) {
      const plateGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.1)
      const plateMaterial = new THREE.MeshLambertMaterial({
        color: 0x4B0000,
        emissive: 0x220000,
        transparent: true,
        opacity: 0.9
      })
      const plate = new THREE.Mesh(plateGeometry, plateMaterial)
      
      const angle = (i / 6) * Math.PI * 2
      plate.position.set(
        Math.cos(angle) * 1.3,
        Math.sin(angle) * 1.3,
        0
      )
      plate.rotation.z = angle
      
      // Wireframe outline
      const plateWireframe = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.6, 0.1),
        new THREE.MeshBasicMaterial({
          color: 0xFF4400,
          wireframe: true,
          transparent: true,
          opacity: 0.7,
          blending: THREE.AdditiveBlending
        })
      )
      plate.add(plateWireframe)
      
      this.armorPlates.push(plate)
      this.mesh.add(plate)
    }
    
    // ⚡ ENERGY RINGS - Rotating threat indicators! ⚡
    for (let i = 0; i < 3; i++) {
      const ringRadius = 1.5 + i * 0.3
      const ringGeometry = new THREE.RingGeometry(ringRadius - 0.1, ringRadius, 32)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF0000,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.rotation.x = Math.PI / 2
      this.energyRings.push(ring)
      this.mesh.add(ring)
    }
    
    // 🔫 WEAPON TURRETS - Visible gun barrels! 🔫
    for (let i = 0; i < 8; i++) {
      const turretGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.6, 8)
      const turretMaterial = new THREE.MeshLambertMaterial({
        color: 0x660000,
        emissive: 0x330000,
        transparent: true,
        opacity: 0.95
      })
      const turret = new THREE.Mesh(turretGeometry, turretMaterial)
      
      const angle = (i / 8) * Math.PI * 2
      turret.position.set(
        Math.cos(angle) * 1.1,
        Math.sin(angle) * 1.1,
        0
      )
      turret.rotation.z = angle + Math.PI / 2
      
      // Glowing tip
      const tipGeometry = new THREE.SphereGeometry(0.12, 8, 8)
      const tipMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF4400,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      })
      const tip = new THREE.Mesh(tipGeometry, tipMaterial)
      tip.position.y = 0.35
      turret.add(tip)
      
      this.weaponTurrets.push(turret)
      this.mesh.add(turret)
    }
    
    // 💀 DEATH'S HEAD - Scary center! 💀
    const skullGeometry = new THREE.SphereGeometry(0.3, 8, 8)
    const skullMaterial = new THREE.MeshBasicMaterial({
      color: 0x220000,
      transparent: true,
      opacity: 0.9
    })
    const skull = new THREE.Mesh(skullGeometry, skullMaterial)
    this.coreMesh.add(skull)
    
    // Eye sockets
    for (let i = 0; i < 2; i++) {
      const eyeGeometry = new THREE.SphereGeometry(0.08, 6, 6)
      const eyeMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF4400,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending
      })
      const eye = new THREE.Mesh(eyeGeometry, eyeMaterial)
      eye.position.set(i === 0 ? -0.15 : 0.15, 0.1, 0.3)
      skull.add(eye)
    }
  }

  setSceneManager(sceneManager: SceneManager): void {
    this.sceneManager = sceneManager
  }

  setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager
  }

  updateAI(deltaTime: number, player: Player): void {
    // Slow, menacing approach toward player
    const playerPos = player.getPosition()
    const direction = playerPos.sub(this.position).normalize()
    
    this.velocity = direction.multiplyScalar(this.speed)
    
    // Update firing
    this.fireTimer += deltaTime
    this.phaseTimer += deltaTime
    
    // Change attack phase every 5 seconds
    if (this.phaseTimer >= 5.0) {
      this.attackPhase = (this.attackPhase + 1) % 3
      this.phaseTimer = 0
    }
    
    // Fire based on phase
    if (this.fireTimer >= this.fireRate) {
      this.fireAtPlayer(player)
      this.fireTimer = 0
    }
  }

  private fireAtPlayer(player: Player): void {
    if (!this.sceneManager) return
    
    const playerPos = player.getPosition()
    const direction = playerPos.sub(this.position).normalize()
    
    if (this.attackPhase === 0) {
      // Normal fire - 3 bullets in spread
      for (let i = 0; i < 3; i++) {
        const angleOffset = (i - 1) * 0.2 // Spread
        const cos = Math.cos(angleOffset)
        const sin = Math.sin(angleOffset)
        const bulletDir = new THREE.Vector3(
          direction.x * cos - direction.y * sin,
          direction.x * sin + direction.y * cos,
          0
        ).normalize()
        
        const projectile = new EnemyProjectile(
          this.position.clone().add(bulletDir.clone().multiplyScalar(1.2)),
          bulletDir,
          this.projectileSpeed,
          this.projectileDamage
        )
        
        if (this.effectsSystem) {
          projectile.setEffectsSystem(this.effectsSystem)
        }
        
        this.projectiles.push(projectile)
        this.sceneManager.addToScene(projectile.getMesh())
      }
    } else if (this.attackPhase === 1) {
      // Rapid fire - 5 bullets in quick succession
      for (let i = 0; i < 5; i++) {
        const angleOffset = (i - 2) * 0.15
        const cos = Math.cos(angleOffset)
        const sin = Math.sin(angleOffset)
        const bulletDir = new THREE.Vector3(
          direction.x * cos - direction.y * sin,
          direction.x * sin + direction.y * cos,
          0
        ).normalize()
        
        const projectile = new EnemyProjectile(
          this.position.clone().add(bulletDir.clone().multiplyScalar(1.2)),
          bulletDir,
          this.projectileSpeed * 1.2,
          this.projectileDamage
        )
        
        if (this.effectsSystem) {
          projectile.setEffectsSystem(this.effectsSystem)
        }
        
        this.projectiles.push(projectile)
        this.sceneManager.addToScene(projectile.getMesh())
      }
    } else {
      // Spread fire - 8 bullets in all directions
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2
        const bulletDir = new THREE.Vector3(
          Math.cos(angle),
          Math.sin(angle),
          0
        )
        
        const projectile = new EnemyProjectile(
          this.position.clone().add(bulletDir.clone().multiplyScalar(1.2)),
          bulletDir,
          this.projectileSpeed * 0.8,
          this.projectileDamage
        )
        
        if (this.effectsSystem) {
          projectile.setEffectsSystem(this.effectsSystem)
        }
        
        this.projectiles.push(projectile)
        this.sceneManager.addToScene(projectile.getMesh())
      }
    }
    
    // Audio feedback
    if (this.audioManager) {
      this.audioManager.playFireSound()
    }
  }

  getProjectiles(): EnemyProjectile[] {
    return this.projectiles.filter(p => p.isAlive())
  }

  update(deltaTime: number, player: Player): void {
    if (!this.alive) return

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i]
      if (projectile.isAlive()) {
        projectile.update(deltaTime)
      } else {
        if (this.sceneManager) {
          this.sceneManager.removeFromScene(projectile.getMesh())
        }
        this.projectiles.splice(i, 1)
      }
    }

    // Call parent update
    super.update(deltaTime, player)
  }

  protected updateVisuals(deltaTime: number): void {
    const time = Date.now() * 0.001
    this.pulseTime += deltaTime
    
    // 🌪️ ROTATE CORE - Menacing spin! 🌪️
    this.coreMesh.rotation.x += deltaTime * 1.5
    this.coreMesh.rotation.y += deltaTime * 2
    this.coreMesh.rotation.z += deltaTime * 1
    
    // 💀 PULSING SCALE - Breathing effect! 💀
    const pulse = 1 + Math.sin(this.pulseTime * 2) * 0.1
    this.mesh.scale.setScalar(pulse)
    
    // 🛡️ ROTATE ARMOR PLATES - Defensive rotation! 🛡️
    for (let i = 0; i < this.armorPlates.length; i++) {
      const plate = this.armorPlates[i]
      plate.rotation.z += deltaTime * (0.5 + i * 0.1)
      
      const plateMaterial = plate.material as THREE.MeshLambertMaterial
      const intensity = 0.5 + Math.sin(time * 3 + i) * 0.3
      plateMaterial.emissive.setHex(Math.floor(0x220000 * intensity))
    }
    
    // ⚡ ROTATE ENERGY RINGS - Threat indicators! ⚡
    for (let i = 0; i < this.energyRings.length; i++) {
      const ring = this.energyRings[i]
      ring.rotation.z += deltaTime * (1 + i * 0.3)
      
      const ringMaterial = ring.material as THREE.MeshBasicMaterial
      ringMaterial.opacity = 0.4 + Math.sin(time * 4 + i) * 0.4
    }
    
    // 🔫 ROTATE WEAPON TURRETS - Aiming at player! 🔫
    for (let i = 0; i < this.weaponTurrets.length; i++) {
      const turret = this.weaponTurrets[i]
      turret.rotation.z += deltaTime * 0.5
      
      // Pulsing tips
      const tip = turret.children[0] as THREE.Mesh
      if (tip) {
        const tipMaterial = tip.material as THREE.MeshBasicMaterial
        tipMaterial.opacity = 0.7 + Math.sin(time * 8 + i) * 0.3
        tip.scale.setScalar(1 + Math.sin(time * 10 + i) * 0.3)
      }
    }
    
    // 💀 ANIMATE SKULL - Scary eyes! 💀
    const skull = this.coreMesh.children[1] as THREE.Mesh
    if (skull) {
      // Animate skull opacity for pulsing effect
      const skullMaterial = skull.material as THREE.MeshBasicMaterial
      skullMaterial.opacity = 0.7 + Math.sin(time * 5) * 0.2
      
      // Blinking eyes
      for (let i = 0; i < skull.children.length; i++) {
        const eye = skull.children[i] as THREE.Mesh
        if (eye) {
          const eyeMaterial = eye.material as THREE.MeshBasicMaterial
          eyeMaterial.opacity = 0.5 + Math.sin(time * 3 + i) * 0.5
        }
      }
    }
  }

  protected createDeathEffect(): void {
    // 💥 MASSIVE BOSS DEATH EXPLOSION! 💥
    if (this.effectsSystem) {
      const deathColor = new THREE.Color(0xFF0000)
      this.effectsSystem.createExplosion(this.position, 4.0, deathColor) // HUGE explosion!
      this.effectsSystem.addDistortionWave(this.position, 3.0)
      
      // Multiple explosions
      for (let i = 0; i < 5; i++) {
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          0
        )
        setTimeout(() => {
          this.effectsSystem!.createExplosion(
            this.position.clone().add(offset),
            2.0,
            deathColor
          )
        }, i * 100)
      }
      
      this.effectsSystem.createEnemyDeathParticles(this.position, 'Boss', deathColor)
    }
    
    // Clean up projectiles
    if (this.sceneManager) {
      for (const projectile of this.projectiles) {
        this.sceneManager.removeFromScene(projectile.getMesh())
      }
    }
    this.projectiles = []
  }
}

