import * as THREE from 'three'
import { Enemy } from './Enemy'
import { Player } from './Player'
import { EnemyProjectile } from '../weapons/EnemyProjectile'
import { AudioManager } from '../audio/AudioManager'

export class ScanDrone extends Enemy {
  private scanBeamMesh: THREE.Mesh
  private alertState: boolean = false
  private patrolTarget: THREE.Vector3
  private patrolRadius: number = 3

  private fireTimer: number = 0
  private fireRate: number = 1.5 // Fire every 1.5 seconds when alerted
  private sceneManager: any = null // Will be set by EnemyManager
  private projectiles: any[] = []
  private audioManager: AudioManager | null = null
  
  // 📡 Scan sound timer
  private scanSoundTimer: number = 0
  private scanSoundInterval: number = 2.0

  constructor(x: number, y: number) {
    super(x, y)
    this.health = 4
    this.maxHealth = 4
    this.speed = 1.5
    this.damage = 15 // INCREASED collision damage!
    this.xpValue = 5
    this.radius = 1.1 // 2x larger hitbox (was 0.55)
    this.patrolTarget = new THREE.Vector3(x, y, 0)
  }

  setSceneManager(sceneManager: any): void {
    this.sceneManager = sceneManager
  }
  
  setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager
  }

  getProjectiles(): any[] {
    return this.projectiles
  }

  initialize(): void {
    // ═══════════════════════════════════════════════════════════════
    // 🕹️ 80s VECTOR ART SCAN DRONE - Battlezone/Tron Style! 🕹️
    // ═══════════════════════════════════════════════════════════════
    
    // Create invisible container for the drone
    const containerGeometry = new THREE.CircleGeometry(0.01, 4)
    const containerMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    this.mesh = new THREE.Mesh(containerGeometry, containerMaterial)
    this.mesh.position.copy(this.position)
    
    // ═══ HEXAGONAL BODY - Classic 80s arcade wireframe ═══
    // 2x SIZE!
    const hexRadius = 0.35 * 2.6
    const hexHeight = 0.15 * 2.6
    const hexGeometry = new THREE.CylinderGeometry(hexRadius, hexRadius, hexHeight, 6)
    const hexMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF6600,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    })
    const hexBody = new THREE.Mesh(hexGeometry, hexMaterial)
    hexBody.rotation.x = Math.PI / 2 // Flat orientation
    this.mesh.add(hexBody)
    
    // ═══ HEXAGONAL WIREFRAME OUTLINE - Glowing vector lines ═══
    const hexWireGeometry = new THREE.CylinderGeometry(hexRadius * 1.05, hexRadius * 1.05, hexHeight * 1.1, 6)
    const hexWireMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF8800,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    })
    const hexWireframe = new THREE.Mesh(hexWireGeometry, hexWireMaterial)
    hexWireframe.rotation.x = Math.PI / 2
    this.mesh.add(hexWireframe)
    
    // ═══ ROTATING RADAR DISH - 80s surveillance aesthetic ═══
    const dishGroup = new THREE.Group()
    
    // Dish base ring - 2x SIZE
    const dishRingGeometry = new THREE.RingGeometry(0.12 * 2.6, 0.18 * 2.6, 8)
    const dishRingMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FFFF, // Cyan accent - very 80s!
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
    const dishRing = new THREE.Mesh(dishRingGeometry, dishRingMaterial)
    dishGroup.add(dishRing)
    
    // Radar sweep arm - 2x SIZE
    const sweepGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0.04),
      new THREE.Vector3(1.04, 0, 0.04)
    ])
    const sweepMaterial = new THREE.LineBasicMaterial({
      color: 0x00FF00, // Green sweep line
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    })
    const sweepLine = new THREE.Line(sweepGeometry, sweepMaterial)
    dishGroup.add(sweepLine)
    
    // Radar sweep cone (like classic radar) - 2x SIZE
    const sweepConeShape = new THREE.Shape()
    sweepConeShape.moveTo(0, 0)
    sweepConeShape.lineTo(1.04, 0.2)
    sweepConeShape.lineTo(1.04, -0.2)
    sweepConeShape.lineTo(0, 0)
    const sweepConeGeometry = new THREE.ShapeGeometry(sweepConeShape)
    const sweepConeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FF00,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    })
    const sweepCone = new THREE.Mesh(sweepConeGeometry, sweepConeMaterial)
    sweepCone.position.z = 0.01
    dishGroup.add(sweepCone)
    
    dishGroup.position.z = 0.2 // Above the body (2x)
    this.mesh.add(dishGroup)
    
    // ═══ SCANNING GRID BELOW - Matrix-style scan effect ═══
    const gridGroup = new THREE.Group()
    
    // Horizontal scan lines - 2x SIZE
    for (let i = -2; i <= 2; i++) {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-1.3, i * 0.39, 0),
        new THREE.Vector3(1.3, i * 0.39, 0)
      ])
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xFF4400,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      })
      const line = new THREE.Line(lineGeometry, lineMaterial)
      gridGroup.add(line)
    }
    
    // Vertical scan lines - 2x SIZE
    for (let i = -2; i <= 2; i++) {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i * 0.39, -1.3, 0),
        new THREE.Vector3(i * 0.39, 1.3, 0)
      ])
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xFF4400,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      })
      const line = new THREE.Line(lineGeometry, lineMaterial)
      gridGroup.add(line)
    }
    
    // Scanning beam (sweeps down) - 2x SIZE
    const scanBeamGeometry = new THREE.PlaneGeometry(2.6, 0.2)
    const scanBeamMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF0000,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    })
    this.scanBeamMesh = new THREE.Mesh(scanBeamGeometry, scanBeamMaterial)
    gridGroup.add(this.scanBeamMesh)
    
    gridGroup.position.z = -0.6 // Below the body (2x)
    gridGroup.rotation.x = 0 // Flat
    this.mesh.add(gridGroup)
    
    // ═══ SENSOR EYES - 6 blinking sensors around hexagon ═══
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      
      // Outer ring for each sensor - 2x SIZE
      const sensorRingGeometry = new THREE.RingGeometry(0.104, 0.156, 6)
      const sensorRingMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF8800,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
      const sensorRing = new THREE.Mesh(sensorRingGeometry, sensorRingMaterial)
      sensorRing.position.set(
        Math.cos(angle) * (hexRadius + 0.2),
        Math.sin(angle) * (hexRadius + 0.2),
        0
      )
      this.mesh.add(sensorRing)
      
      // Inner sensor "eye" - 2x SIZE
      const sensorEyeGeometry = new THREE.CircleGeometry(0.078, 6)
      const sensorEyeMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF0000,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      })
      const sensorEye = new THREE.Mesh(sensorEyeGeometry, sensorEyeMaterial)
      sensorEye.position.set(
        Math.cos(angle) * (hexRadius + 0.2),
        Math.sin(angle) * (hexRadius + 0.2),
        0.02
      )
      this.mesh.add(sensorEye)
    }
    
    // ═══ ANTENNA WITH BEACON - Pulsing warning light ═══
    // Antenna stalk - 2x SIZE
    const antennaGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0.26),
      new THREE.Vector3(0, 0, 1.04)
    ])
    const antennaMaterial = new THREE.LineBasicMaterial({
      color: 0x00FFFF,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })
    const antenna = new THREE.Line(antennaGeometry, antennaMaterial)
    this.mesh.add(antenna)
    
    // Beacon tip (pulsing) - 2x SIZE
    const beaconGeometry = new THREE.OctahedronGeometry(0.156, 0)
    const beaconMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF0000,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    })
    const beacon = new THREE.Mesh(beaconGeometry, beaconMaterial)
    beacon.position.z = 1.04
    this.mesh.add(beacon)
    
    // ═══ OUTER DETECTION RING - Rotating wireframe ═══ - 2x SIZE
    const outerRingGeometry = new THREE.RingGeometry(1.43, 1.508, 12)
    const outerRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF6600,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
    const outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial)
    this.mesh.add(outerRing)
    
    // Detection range markers (dashed circle effect) - 2x SIZE
    for (let i = 0; i < 12; i++) {
      const markerAngle = (i / 12) * Math.PI * 2
      const markerGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(markerAngle) * 1.352, Math.sin(markerAngle) * 1.352, 0),
        new THREE.Vector3(Math.cos(markerAngle) * 1.612, Math.sin(markerAngle) * 1.612, 0)
      ])
      const markerMaterial = new THREE.LineBasicMaterial({
        color: 0xFF4400,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      })
      const marker = new THREE.Line(markerGeometry, markerMaterial)
      this.mesh.add(marker)
    }
  }

  updateAI(deltaTime: number, player: Player): void {
    const playerPos = player.getPosition()
    const distanceToPlayer = this.position.distanceTo(playerPos)

    // Check if player is within scan range
    if (distanceToPlayer < 5) {
      // 🚨 Play alert sound when first entering alert state! 🚨
      if (!this.alertState && this.audioManager) {
        this.audioManager.playScanDroneAlertSound()
      }
      this.alertState = true
    }

    if (this.alertState) {
      // Chase player when alerted
      const direction = playerPos.clone().sub(this.position).normalize()
      this.velocity = direction.multiplyScalar(this.speed * 2)
      
      // Increase scan beam intensity
      const beamMaterial = this.scanBeamMesh.material as THREE.MeshBasicMaterial
      beamMaterial.opacity = 0.6
      
      // 🔫 FIRE BULLETS AT PLAYER! 🔫
      this.fireTimer += deltaTime
      if (this.fireTimer >= this.fireRate && this.sceneManager) {
        this.fireAtPlayer(player)
        this.fireTimer = 0
      }
    } else {
      // 📡 Play periodic scan sound while patrolling 📡
      this.scanSoundTimer += deltaTime
      if (this.scanSoundTimer >= this.scanSoundInterval && this.audioManager) {
        this.audioManager.playScanDroneScanSound()
        this.scanSoundTimer = 0
      }
      // Patrol behavior
      const distanceToPatrol = this.position.distanceTo(this.patrolTarget)
      
      if (distanceToPatrol < 0.5) {
        // Choose new patrol target
        this.patrolTarget = new THREE.Vector3(
          this.position.x + (Math.random() - 0.5) * this.patrolRadius * 2,
          this.position.y + (Math.random() - 0.5) * this.patrolRadius * 2,
          0
        )
      }
      
      const direction = this.patrolTarget.clone().sub(this.position).normalize()
      this.velocity = direction.multiplyScalar(this.speed)
    }
    
    // Update projectiles
    this.updateProjectiles(deltaTime)
  }
  
  private fireAtPlayer(player: Player): void {
    const playerPos = player.getPosition()
    const direction = playerPos.clone().sub(this.position).normalize()
    
    // Create projectile - pass Vector3 position, direction, speed, damage
    const projectile = new EnemyProjectile(
      this.position.clone(),
      direction,
      8, // Speed
      8  // Damage
    )
    
    this.projectiles.push(projectile)
    if (this.sceneManager) {
      this.sceneManager.addToScene(projectile.getMesh())
    }
    
    // 🔫 Play fire sound! 🔫
    if (this.audioManager) {
      this.audioManager.playScanDroneFireSound()
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

  // 🧹 CLEANUP PROJECTILES ON DEATH 🧹
  destroy(): void {
    // Remove all projectiles from scene
    for (const projectile of this.projectiles) {
      if (this.sceneManager) {
        this.sceneManager.removeFromScene(projectile.getMesh())
      }
    }
    this.projectiles = []
    
    super.destroy()
  }

  protected updateVisuals(deltaTime: number): void {
    const time = Date.now() * 0.001
    
    // ═══════════════════════════════════════════════════════════════
    // 🕹️ 80s VECTOR ART ANIMATIONS - Battlezone/Tron Style! 🕹️
    // ═══════════════════════════════════════════════════════════════
    
    // Structure: [0]=hexBody, [1]=hexWireframe, [2]=dishGroup, [3]=gridGroup,
    // [4-15]=sensorRings+eyes (6 pairs), [16]=antenna, [17]=beacon, 
    // [18]=outerRing, [19-30]=markers
    
    // 💫 OVERALL PULSE - More intense when alerted! 💫
    const pulseSpeed = this.alertState ? 12 : 4
    const pulse = 1 + Math.sin(time * pulseSpeed) * (this.alertState ? 0.15 : 0.05)
    this.mesh.scale.setScalar(pulse)
    
    // ═══ HEXAGONAL BODY GLOW ═══
    const hexBody = this.mesh.children[0] as THREE.Mesh
    if (hexBody) {
      const hexMaterial = hexBody.material as THREE.MeshBasicMaterial
      hexMaterial.opacity = this.alertState ? 
        0.5 + Math.sin(time * 15) * 0.3 : 
        0.2 + Math.sin(time * 3) * 0.1
      // Change color when alerted
      hexMaterial.color.setHex(this.alertState ? 0xFF0000 : 0xFF6600)
    }
    
    // ═══ WIREFRAME ROTATION ═══
    const hexWireframe = this.mesh.children[1] as THREE.Mesh
    if (hexWireframe) {
      hexWireframe.rotation.z += deltaTime * (this.alertState ? 4 : 1)
      const wireMaterial = hexWireframe.material as THREE.MeshBasicMaterial
      wireMaterial.opacity = this.alertState ? 1.0 : 0.7
    }
    
    // ═══ ROTATING RADAR DISH ═══
    const dishGroup = this.mesh.children[2] as THREE.Group
    if (dishGroup) {
      // Faster rotation when alerted
      dishGroup.rotation.z += deltaTime * (this.alertState ? 8 : 2)
      
      // Pulse the sweep cone
      const sweepCone = dishGroup.children[2] as THREE.Mesh
      if (sweepCone) {
        const sweepMaterial = sweepCone.material as THREE.MeshBasicMaterial
        sweepMaterial.opacity = 0.2 + Math.sin(time * 10) * 0.2
      }
    }
    
    // ═══ SCANNING GRID ANIMATION ═══
    const gridGroup = this.mesh.children[3] as THREE.Group
    if (gridGroup) {
      // Animate horizontal scan lines (children 0-4)
      for (let i = 0; i < 5; i++) {
        const line = gridGroup.children[i] as THREE.Line
        if (line) {
          const lineMaterial = line.material as THREE.LineBasicMaterial
          // Wave effect across lines
          const wave = Math.sin(time * 8 + i * 0.5) * 0.5 + 0.5
          lineMaterial.opacity = this.alertState ? 
            0.5 + wave * 0.5 : 
            0.2 + wave * 0.3
        }
      }
      
      // Animate vertical scan lines (children 5-9)
      for (let i = 5; i < 10; i++) {
        const line = gridGroup.children[i] as THREE.Line
        if (line) {
          const lineMaterial = line.material as THREE.LineBasicMaterial
          const wave = Math.sin(time * 8 + (i - 5) * 0.5) * 0.5 + 0.5
          lineMaterial.opacity = this.alertState ? 
            0.5 + wave * 0.5 : 
            0.2 + wave * 0.3
        }
      }
      
      // Animate scan beam (sweeps up and down)
      if (this.scanBeamMesh) {
        this.scanBeamMesh.position.y = Math.sin(time * (this.alertState ? 6 : 2)) * 0.8
        const beamMaterial = this.scanBeamMesh.material as THREE.MeshBasicMaterial
        beamMaterial.opacity = this.alertState ? 
          0.7 + Math.sin(time * 20) * 0.3 : 
          0.4 + Math.sin(time * 5) * 0.2
        beamMaterial.color.setHex(this.alertState ? 0xFF0000 : 0xFF4400)
      }
    }
    
    // ═══ SENSOR EYES - Blinking pattern ═══
    // Sensors are at indices 4-15 (6 rings + 6 eyes alternating)
    for (let i = 0; i < 6; i++) {
      const ringIndex = 4 + i * 2
      const eyeIndex = 5 + i * 2
      
      const sensorRing = this.mesh.children[ringIndex] as THREE.Mesh
      const sensorEye = this.mesh.children[eyeIndex] as THREE.Mesh
      
      if (sensorRing) {
        const ringMaterial = sensorRing.material as THREE.MeshBasicMaterial
        // Sequential blinking pattern
        const blinkPhase = (time * (this.alertState ? 8 : 3) + i * 0.5) % 1
        ringMaterial.opacity = blinkPhase > 0.5 ? 0.9 : 0.4
      }
      
      if (sensorEye) {
        const eyeMaterial = sensorEye.material as THREE.MeshBasicMaterial
        // Alternating blink with ring
        const blinkPhase = (time * (this.alertState ? 8 : 3) + i * 0.5) % 1
        eyeMaterial.opacity = blinkPhase > 0.5 ? 1.0 : 0.3
        // Red when alerted, orange when patrolling
        eyeMaterial.color.setHex(this.alertState ? 0xFF0000 : 0xFF4400)
        
        // Scale pulse
        sensorEye.scale.setScalar(blinkPhase > 0.5 ? 1.3 : 0.8)
      }
    }
    
    // ═══ ANTENNA BEACON - Warning pulse ═══
    const beacon = this.mesh.children[17] as THREE.Mesh
    if (beacon) {
      // Rotate beacon
      beacon.rotation.z += deltaTime * 5
      beacon.rotation.x += deltaTime * 3
      
      const beaconMaterial = beacon.material as THREE.MeshBasicMaterial
      // Fast strobe when alerted
      const strobeSpeed = this.alertState ? 20 : 5
      beaconMaterial.opacity = 0.5 + Math.sin(time * strobeSpeed) * 0.5
      beaconMaterial.color.setHex(this.alertState ? 0xFF0000 : 0x00FFFF)
      
      // Size pulse
      const beaconPulse = 1 + Math.sin(time * strobeSpeed) * 0.3
      beacon.scale.setScalar(beaconPulse)
    }
    
    // ═══ OUTER DETECTION RING - Rotating ═══
    const outerRing = this.mesh.children[18] as THREE.Mesh
    if (outerRing) {
      outerRing.rotation.z -= deltaTime * (this.alertState ? 3 : 1)
      const ringMaterial = outerRing.material as THREE.MeshBasicMaterial
      ringMaterial.opacity = this.alertState ? 
        0.6 + Math.sin(time * 10) * 0.3 : 
        0.3 + Math.sin(time * 3) * 0.2
      ringMaterial.color.setHex(this.alertState ? 0xFF0000 : 0xFF6600)
    }
    
    // ═══ DETECTION MARKERS - Pulsing ═══
    for (let i = 19; i < Math.min(31, this.mesh.children.length); i++) {
      const marker = this.mesh.children[i] as THREE.Line
      if (marker) {
        const markerMaterial = marker.material as THREE.LineBasicMaterial
        const markerIndex = i - 19
        const pulse = Math.sin(time * 6 + markerIndex * 0.5) * 0.5 + 0.5
        markerMaterial.opacity = this.alertState ? 
          0.5 + pulse * 0.5 : 
          0.3 + pulse * 0.3
      }
    }
  }
}

