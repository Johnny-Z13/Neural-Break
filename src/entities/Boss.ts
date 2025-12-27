import * as THREE from 'three'
import { Enemy } from './Enemy'
import { Player } from './Player'
import { EnemyProjectile } from '../weapons/EnemyProjectile'
import { SceneManager } from '../graphics/SceneManager'
import { AudioManager } from '../audio/AudioManager'

export class Boss extends Enemy {
  private fireTimer: number = 0
  private fireRate: number = 0.4 // Fire every 0.4 seconds - FASTER!
  private projectileSpeed: number = 10 // Faster projectiles
  private projectileDamage: number = 15 // More damage
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
  
  // 💀 DEATH ANIMATION STATE 💀
  private isDying: boolean = false
  private deathTimer: number = 0
  private deathDuration: number = 3.0 // 3 second epic death sequence
  private deathPhase: number = 0
  
  // 🌈 COLOR THROB STATE 🌈
  private colorPhase: number = 0

  constructor(x: number, y: number) {
    super(x, y)
    this.health = 300 // MASSIVE HP - HARD TO KILL!
    this.maxHealth = 300
    this.speed = 0.4 // Slow but menacing
    this.damage = 40 // High collision damage
    this.xpValue = 100 // BIG XP reward!
    this.radius = 3.0 // 2X LARGER!
  }

  initialize(): void {
    // 👹 MASSIVE SCARY BOSS DESIGN - 2X BIGGER! 👹
    
    // Main core body - HUGE octahedron
    const coreGeometry = new THREE.OctahedronGeometry(2.0, 2) // 2X!
    const coreMaterial = new THREE.MeshLambertMaterial({
      color: 0x8B0000, // Dark red
      emissive: 0x440000, // Deep red glow
      transparent: true,
      opacity: 0.95
    })
    this.coreMesh = new THREE.Mesh(coreGeometry, coreMaterial)
    
    // 🌟 WIREFRAME OUTLINE - Vector style! 🌟
    const wireframeGeometry = new THREE.OctahedronGeometry(2.1, 2) // 2X!
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF0000,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    })
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial)
    this.coreMesh.add(wireframe)
    
    // 🔥 INNER FIRE CORE - Pulsing energy! 🔥
    const innerCoreGeometry = new THREE.SphereGeometry(1.2, 16, 16)
    const innerCoreMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF6600,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })
    const innerCore = new THREE.Mesh(innerCoreGeometry, innerCoreMaterial)
    this.coreMesh.add(innerCore)
    
    // Create container mesh
    const containerGeometry = new THREE.SphereGeometry(0.1, 4, 4)
    const containerMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    this.mesh = new THREE.Mesh(containerGeometry, containerMaterial)
    this.mesh.position.copy(this.position)
    this.mesh.add(this.coreMesh)
    
    // 🛡️ ARMOR PLATES - Protective layers! 🛡️ (2X bigger)
    for (let i = 0; i < 8; i++) { // More plates!
      const plateGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.2) // 2X!
      const plateMaterial = new THREE.MeshLambertMaterial({
        color: 0x4B0000,
        emissive: 0x220000,
        transparent: true,
        opacity: 0.9
      })
      const plate = new THREE.Mesh(plateGeometry, plateMaterial)
      
      const angle = (i / 8) * Math.PI * 2
      plate.position.set(
        Math.cos(angle) * 2.6, // 2X!
        Math.sin(angle) * 2.6,
        0
      )
      plate.rotation.z = angle
      
      // Wireframe outline
      const plateWireframe = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.2, 0.2),
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
    
    // ⚡ ENERGY RINGS - Rotating threat indicators! ⚡ (2X bigger)
    for (let i = 0; i < 4; i++) { // More rings!
      const ringRadius = 3.0 + i * 0.6 // 2X!
      const ringGeometry = new THREE.RingGeometry(ringRadius - 0.2, ringRadius, 48)
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
    
    // 🔫 WEAPON TURRETS - Visible gun barrels! 🔫 (2X bigger)
    for (let i = 0; i < 12; i++) { // More turrets!
      const turretGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8) // 2X!
      const turretMaterial = new THREE.MeshLambertMaterial({
        color: 0x660000,
        emissive: 0x330000,
        transparent: true,
        opacity: 0.95
      })
      const turret = new THREE.Mesh(turretGeometry, turretMaterial)
      
      const angle = (i / 12) * Math.PI * 2
      turret.position.set(
        Math.cos(angle) * 2.2, // 2X!
        Math.sin(angle) * 2.2,
        0
      )
      turret.rotation.z = angle + Math.PI / 2
      
      // Glowing tip - BIGGER and BRIGHTER
      const tipGeometry = new THREE.SphereGeometry(0.25, 8, 8) // 2X!
      const tipMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF6600,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending
      })
      const tip = new THREE.Mesh(tipGeometry, tipMaterial)
      tip.position.y = 0.7 // 2X!
      turret.add(tip)
      
      // Add glow ring around tip
      const glowRingGeometry = new THREE.RingGeometry(0.2, 0.35, 16)
      const glowRingMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF4400,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
      const glowRing = new THREE.Mesh(glowRingGeometry, glowRingMaterial)
      glowRing.position.y = 0.7
      turret.add(glowRing)
      
      this.weaponTurrets.push(turret)
      this.mesh.add(turret)
    }
    
    // 💀 DEATH'S HEAD - Scary center! 💀 (2X bigger)
    const skullGeometry = new THREE.SphereGeometry(0.6, 12, 12) // 2X!
    const skullMaterial = new THREE.MeshBasicMaterial({
      color: 0x220000,
      transparent: true,
      opacity: 0.9
    })
    const skull = new THREE.Mesh(skullGeometry, skullMaterial)
    this.coreMesh.add(skull)
    
    // Eye sockets - BIGGER and SCARIER
    for (let i = 0; i < 2; i++) {
      const eyeGeometry = new THREE.SphereGeometry(0.18, 8, 8) // 2X!
      const eyeMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF4400,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending
      })
      const eye = new THREE.Mesh(eyeGeometry, eyeMaterial)
      eye.position.set(i === 0 ? -0.3 : 0.3, 0.2, 0.55) // 2X!
      skull.add(eye)
      
      // Eye glow
      const eyeGlowGeometry = new THREE.SphereGeometry(0.25, 8, 8)
      const eyeGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF0000,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      })
      const eyeGlow = new THREE.Mesh(eyeGlowGeometry, eyeGlowMaterial)
      eye.add(eyeGlow)
    }
  }

  setSceneManager(sceneManager: SceneManager): void {
    this.sceneManager = sceneManager
  }

  setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager
  }

  updateAI(deltaTime: number, player: Player): void {
    // If dying, don't move - just play death animation
    if (this.isDying) {
      this.updateDeathAnimation(deltaTime)
      return
    }
    
    // Slow, menacing approach toward player
    const playerPos = player.getPosition()
    const direction = playerPos.sub(this.position).normalize()
    
    this.velocity = direction.multiplyScalar(this.speed)
    
    // Update firing
    this.fireTimer += deltaTime
    this.phaseTimer += deltaTime
    
    // Change attack phase every 4 seconds (faster!)
    if (this.phaseTimer >= 4.0) {
      this.attackPhase = (this.attackPhase + 1) % 3
      this.phaseTimer = 0
      
      // 🔥 Play phase change sound! 🔥
      if (this.audioManager) {
        this.audioManager.playBossPhaseChangeSound()
      }
    }
    
    // Fire based on phase
    if (this.fireTimer >= this.fireRate) {
      this.fireAtPlayer(player)
      this.fireTimer = 0
    }
  }
  
  // 💀 EPIC BOSS DEATH ANIMATION 💀
  private updateDeathAnimation(deltaTime: number): void {
    this.deathTimer += deltaTime
    const progress = this.deathTimer / this.deathDuration
    
    // Phase 1: Shake violently (0-30%)
    if (progress < 0.3) {
      const shake = (0.3 - progress) * 2
      this.mesh.position.x = this.position.x + (Math.random() - 0.5) * shake
      this.mesh.position.y = this.position.y + (Math.random() - 0.5) * shake
      
      // Flash colors wildly
      const hue = (Date.now() * 0.01) % 1
      const flashColor = new THREE.Color().setHSL(hue, 1.0, 0.5)
      const coreMaterial = this.coreMesh.material as THREE.MeshLambertMaterial
      coreMaterial.color.copy(flashColor)
      coreMaterial.emissive.copy(flashColor).multiplyScalar(0.5)
      
      // Create sparks
      if (this.effectsSystem && Math.random() < 0.3) {
        const sparkPos = this.position.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          0
        ))
        this.effectsSystem.createExplosion(sparkPos, 0.5, flashColor)
      }
    }
    
    // Phase 2: Explode armor plates (30-60%)
    if (progress >= 0.3 && progress < 0.6) {
      const plateProgress = (progress - 0.3) / 0.3
      const platesToExplode = Math.floor(plateProgress * this.armorPlates.length)
      
      for (let i = 0; i < platesToExplode; i++) {
        const plate = this.armorPlates[i]
        if (plate.visible) {
          plate.visible = false
          
          // Explode this plate
          if (this.effectsSystem) {
            const worldPos = new THREE.Vector3()
            plate.getWorldPosition(worldPos)
            const hue = i / this.armorPlates.length
            const color = new THREE.Color().setHSL(hue, 1.0, 0.6)
            this.effectsSystem.createExplosion(worldPos, 1.5, color)
          }
          
          if (this.audioManager) {
            this.audioManager.playExplosionSound()
          }
        }
      }
      
      // Shrink core
      const shrink = 1 - plateProgress * 0.3
      this.coreMesh.scale.setScalar(shrink)
    }
    
    // Phase 3: Core collapse and final explosion (60-100%)
    if (progress >= 0.6) {
      const collapseProgress = (progress - 0.6) / 0.4
      
      // Core shrinks rapidly
      const coreScale = (1 - collapseProgress) * 0.7
      this.coreMesh.scale.setScalar(Math.max(0.1, coreScale))
      
      // Spin faster
      this.coreMesh.rotation.x += deltaTime * 20
      this.coreMesh.rotation.y += deltaTime * 30
      
      // Energy builds up
      const coreMaterial = this.coreMesh.material as THREE.MeshLambertMaterial
      coreMaterial.emissive.setHex(0xFFFFFF)
      
      // Create energy spirals
      if (this.effectsSystem && Math.random() < 0.5) {
        const spiralAngle = Date.now() * 0.01
        const spiralPos = this.position.clone().add(new THREE.Vector3(
          Math.cos(spiralAngle) * (1 - collapseProgress) * 3,
          Math.sin(spiralAngle) * (1 - collapseProgress) * 3,
          0
        ))
        this.effectsSystem.createExplosion(spiralPos, 0.8, new THREE.Color(0xFFFFFF))
      }
    }
    
    // FINAL EXPLOSION
    if (progress >= 1.0) {
      this.executeFinalDeath()
      this.alive = false
    }
  }
  
  private executeFinalDeath(): void {
    if (this.effectsSystem) {
      // MASSIVE central explosion
      this.effectsSystem.createExplosion(this.position, 6.0, new THREE.Color(0xFF0000))
      this.effectsSystem.addDistortionWave(this.position, 5.0)
      
      // Rainbow explosion ring
      for (let i = 0; i < 16; i++) {
        const hue = i / 16
        const angle = (i / 16) * Math.PI * 2
        const color = new THREE.Color().setHSL(hue, 1.0, 0.6)
        const offset = new THREE.Vector3(
          Math.cos(angle) * 3,
          Math.sin(angle) * 3,
          0
        )
        
        // Delayed explosions
        setTimeout(() => {
          if (this.effectsSystem) {
            this.effectsSystem.createExplosion(
              this.position.clone().add(offset),
              2.5,
              color
            )
          }
        }, i * 50)
      }
      
      // Secondary explosion wave
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          if (this.effectsSystem) {
            const randOffset = new THREE.Vector3(
              (Math.random() - 0.5) * 6,
              (Math.random() - 0.5) * 6,
              0
            )
            this.effectsSystem.createExplosion(
              this.position.clone().add(randOffset),
              2.0,
              new THREE.Color().setHSL(Math.random(), 1.0, 0.5)
            )
          }
        }, 200 + i * 100)
      }
      
      this.effectsSystem.createEnemyDeathParticles(
        this.position,
        'Boss',
        new THREE.Color(0xFF0000)
      )
    }
    
    // Clean up projectiles
    if (this.sceneManager) {
      for (const projectile of this.projectiles) {
        this.sceneManager.removeFromScene(projectile.getMesh())
      }
    }
    this.projectiles = []
    
    if (this.audioManager) {
      this.audioManager.playExplosionSound()
    }
  }

  private fireAtPlayer(player: Player): void {
    if (!this.sceneManager) return
    
    // 🔫 Play boss fire sound! 🔫
    if (this.audioManager) {
      this.audioManager.playBossFireSound()
    }
    
    const playerPos = player.getPosition()
    const direction = playerPos.sub(this.position).normalize()
    
    if (this.attackPhase === 0) {
      // Normal fire - 5 bullets in spread (more!)
      for (let i = 0; i < 5; i++) {
        const angleOffset = (i - 2) * 0.15 // Spread
        const cos = Math.cos(angleOffset)
        const sin = Math.sin(angleOffset)
        const bulletDir = new THREE.Vector3(
          direction.x * cos - direction.y * sin,
          direction.x * sin + direction.y * cos,
          0
        ).normalize()
        
        const projectile = new EnemyProjectile(
          this.position.clone().add(bulletDir.clone().multiplyScalar(2.5)), // Fire from edge
          bulletDir,
          this.projectileSpeed,
          this.projectileDamage
        )
        
        // 🔥 MAKE PROJECTILES MORE VISIBLE! 🔥
        this.styleBossProjectile(projectile, 0xFF0000) // Red
        
        if (this.effectsSystem) {
          projectile.setEffectsSystem(this.effectsSystem)
        }
        
        this.projectiles.push(projectile)
        this.sceneManager.addToScene(projectile.getMesh())
      }
    } else if (this.attackPhase === 1) {
      // Rapid fire - 8 bullets in quick succession (more!)
      for (let i = 0; i < 8; i++) {
        const angleOffset = (i - 3.5) * 0.12
        const cos = Math.cos(angleOffset)
        const sin = Math.sin(angleOffset)
        const bulletDir = new THREE.Vector3(
          direction.x * cos - direction.y * sin,
          direction.x * sin + direction.y * cos,
          0
        ).normalize()
        
        const projectile = new EnemyProjectile(
          this.position.clone().add(bulletDir.clone().multiplyScalar(2.5)),
          bulletDir,
          this.projectileSpeed * 1.3,
          this.projectileDamage
        )
        
        // 🔥 ORANGE rapid fire! 🔥
        this.styleBossProjectile(projectile, 0xFF6600)
        
        if (this.effectsSystem) {
          projectile.setEffectsSystem(this.effectsSystem)
        }
        
        this.projectiles.push(projectile)
        this.sceneManager.addToScene(projectile.getMesh())
      }
    } else {
      // Spread fire - 16 bullets in all directions (double!)
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2
        const bulletDir = new THREE.Vector3(
          Math.cos(angle),
          Math.sin(angle),
          0
        )
        
        const projectile = new EnemyProjectile(
          this.position.clone().add(bulletDir.clone().multiplyScalar(2.5)),
          bulletDir,
          this.projectileSpeed * 0.9,
          this.projectileDamage
        )
        
        // 🔥 YELLOW spread fire! 🔥
        this.styleBossProjectile(projectile, 0xFFFF00)
        
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
  
  // 🔥 STYLE BOSS PROJECTILES - Visible but not overwhelming! 🔥
  private styleBossProjectile(projectile: EnemyProjectile, color: number): void {
    const mesh = projectile.getMesh()
    
    // Scale projectile - smaller for better gameplay balance
    mesh.scale.setScalar(1.2)
    
    // Set main color
    const material = mesh.material as THREE.MeshBasicMaterial
    material.color.setHex(color)
    
    // Update glow
    if (mesh.children[0]) {
      const glowMaterial = (mesh.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial
      glowMaterial.color.setHex(color)
      glowMaterial.opacity = 0.6
      // Smaller glow
      mesh.children[0].scale.setScalar(1.2)
    }
    
    // Add trail effect - smaller trail sphere
    const trailGeometry = new THREE.SphereGeometry(0.2, 8, 8)
    const trailMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    })
    const trail = new THREE.Mesh(trailGeometry, trailMaterial)
    trail.position.z = -0.2
    mesh.add(trail)
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
    // Skip if dying - death animation handles visuals
    if (this.isDying) return
    
    const time = Date.now() * 0.001
    this.pulseTime += deltaTime
    this.colorPhase += deltaTime * 0.5 // Color throb speed
    
    // 🌈 COLOR THROBBING - Rainbow pulse! 🌈
    const throbHue = (Math.sin(this.colorPhase) * 0.5 + 0.5) * 0.15 // Red to orange range
    const throbColor = new THREE.Color().setHSL(throbHue, 1.0, 0.4)
    const coreMaterial = this.coreMesh.material as THREE.MeshLambertMaterial
    coreMaterial.color.copy(throbColor)
    coreMaterial.emissive.copy(throbColor).multiplyScalar(0.6)
    
    // 🌪️ ROTATE CORE - Menacing spin! 🌪️
    this.coreMesh.rotation.x += deltaTime * 1.5
    this.coreMesh.rotation.y += deltaTime * 2
    this.coreMesh.rotation.z += deltaTime * 1
    
    // 🔥 ANIMATE INNER CORE - Pulsing fire! 🔥
    const innerCore = this.coreMesh.children[1] as THREE.Mesh
    if (innerCore) {
      const innerMaterial = innerCore.material as THREE.MeshBasicMaterial
      const fireHue = (Math.sin(time * 3) * 0.5 + 0.5) * 0.1 // Red to yellow
      innerMaterial.color.setHSL(fireHue, 1.0, 0.5)
      innerMaterial.opacity = 0.4 + Math.sin(time * 5) * 0.3
      innerCore.scale.setScalar(1 + Math.sin(time * 4) * 0.2)
    }
    
    // 💀 PULSING SCALE - Breathing effect (minimal to avoid growth bug)! 💀
    const pulse = 1 + Math.sin(this.pulseTime * 2) * 0.05
    this.mesh.scale.setScalar(pulse)
    
    // 🛡️ ROTATE ARMOR PLATES - Color cycling! 🛡️
    for (let i = 0; i < this.armorPlates.length; i++) {
      const plate = this.armorPlates[i]
      plate.rotation.z += deltaTime * (0.5 + i * 0.1)
      
      // Rainbow color shift per plate
      const plateHue = (this.colorPhase + i * 0.1) % 1 * 0.2 // Red-orange-yellow
      const plateMaterial = plate.material as THREE.MeshLambertMaterial
      plateMaterial.color.setHSL(plateHue, 0.8, 0.3)
      plateMaterial.emissive.setHSL(plateHue, 1.0, 0.2 + Math.sin(time * 3 + i) * 0.1)
    }
    
    // ⚡ ROTATE ENERGY RINGS - Color cycling threat indicators! ⚡
    for (let i = 0; i < this.energyRings.length; i++) {
      const ring = this.energyRings[i]
      ring.rotation.z += deltaTime * (1 + i * 0.3) * (i % 2 === 0 ? 1 : -1) // Alternate directions
      
      const ringMaterial = ring.material as THREE.MeshBasicMaterial
      const ringHue = (this.colorPhase * 2 + i * 0.15) % 1 * 0.15 // Faster color shift
      ringMaterial.color.setHSL(ringHue, 1.0, 0.5)
      ringMaterial.opacity = 0.4 + Math.sin(time * 4 + i) * 0.4
    }
    
    // 🔫 ANIMATE WEAPON TURRETS - Pulsing and color! 🔫
    for (let i = 0; i < this.weaponTurrets.length; i++) {
      const turret = this.weaponTurrets[i]
      
      // Turrets orbit slightly
      const baseAngle = (i / this.weaponTurrets.length) * Math.PI * 2
      const orbitAngle = baseAngle + time * 0.3
      turret.position.set(
        Math.cos(orbitAngle) * 2.2,
        Math.sin(orbitAngle) * 2.2,
        0
      )
      turret.rotation.z = orbitAngle + Math.PI / 2
      
      // Pulsing tips with color
      const tip = turret.children[0] as THREE.Mesh
      if (tip) {
        const tipMaterial = tip.material as THREE.MeshBasicMaterial
        const tipHue = (time * 0.5 + i * 0.1) % 1 * 0.15
        tipMaterial.color.setHSL(tipHue, 1.0, 0.6)
        tipMaterial.opacity = 0.8 + Math.sin(time * 8 + i) * 0.2
        tip.scale.setScalar(1 + Math.sin(time * 10 + i) * 0.2)
      }
      
      // Glow ring
      const glowRing = turret.children[1] as THREE.Mesh
      if (glowRing) {
        const glowMaterial = glowRing.material as THREE.MeshBasicMaterial
        glowMaterial.opacity = 0.5 + Math.sin(time * 6 + i) * 0.3
        glowRing.rotation.z = time * 3
      }
    }
    
    // 💀 ANIMATE SKULL - Scary pulsing eyes! 💀
    const skull = this.coreMesh.children[2] as THREE.Mesh
    if (skull) {
      // Animate skull with color
      const skullMaterial = skull.material as THREE.MeshBasicMaterial
      skullMaterial.opacity = 0.7 + Math.sin(time * 5) * 0.2
      
      // Blinking eyes with color shift
      for (let i = 0; i < skull.children.length; i++) {
        const eye = skull.children[i] as THREE.Mesh
        if (eye) {
          const eyeMaterial = eye.material as THREE.MeshBasicMaterial
          const eyeHue = (time * 0.3 + i * 0.5) % 1 * 0.1
          eyeMaterial.color.setHSL(eyeHue, 1.0, 0.6)
          eyeMaterial.opacity = 0.7 + Math.sin(time * 4 + i) * 0.3
          
          // Eye glow
          const eyeGlow = eye.children[0] as THREE.Mesh
          if (eyeGlow) {
            const eyeGlowMaterial = eyeGlow.material as THREE.MeshBasicMaterial
            eyeGlowMaterial.opacity = 0.3 + Math.sin(time * 6) * 0.2
            eyeGlow.scale.setScalar(1 + Math.sin(time * 8) * 0.3)
          }
        }
      }
    }
  }

  protected createDeathEffect(): void {
    // 💀 START EPIC DEATH ANIMATION 💀
    this.isDying = true
    this.deathTimer = 0
    this.deathPhase = 0
    
    // Keep alive during death animation
    this.alive = true
    
    // Play death start sound
    if (this.audioManager) {
      this.audioManager.playBossPhaseChangeSound() // Dramatic sound
    }
  }
}

