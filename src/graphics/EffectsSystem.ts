import * as THREE from 'three'
import { ParticlePool, Particle, Effect } from './effects/ParticlePool'
import { VectorParticlePool, VectorParticle } from './effects/VectorParticles'
import { ScreenEffects } from './effects/ScreenEffects'
import { ExplosionEffects } from './effects/ExplosionEffects'

// 🌟✨ FLAMBOYANT VFX SYSTEM - SHOWING MY FLARE! ✨🌟
// A truly EXTRAVAGANT particle system with maximum visual flair!
export class EffectsSystem {
  private scene: THREE.Scene
  private particlePools: Map<string, ParticlePool> = new Map()
  private vectorParticlePool: VectorParticlePool | null = null
  private activeEffects: Effect[] = []
  private screenEffects: ScreenEffects
  private explosionEffects: ExplosionEffects
  
  // 🎆 NEW FLAMBOYANT PARTICLE POOLS! 🎆
  private nebulaPool: NebulaParticlePool | null = null
  private plasmaPool: PlasmaParticlePool | null = null
  private energyWavePool: EnergyWavePool | null = null
  private stardustPool: StardustPool | null = null
  private auroraPool: AuroraPool | null = null
  
  private timeOffset: number = 0

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.screenEffects = new ScreenEffects(scene)
    this.initializeParticlePools()
    // Initialize explosion effects after pools are created
    // Note: specialized pools are passed by reference, so they'll be available when used
    this.explosionEffects = new ExplosionEffects(
      this.particlePools,
      this.vectorParticlePool,
      this.screenEffects,
      {
        nebulaPool: this.nebulaPool,
        plasmaPool: this.plasmaPool,
        stardustPool: this.stardustPool
      }
    )
  }

  private initializeScreenEffects_DEPRECATED(): void {
    // Screen flash overlay - ENHANCED! (Now uses saturated colors instead of pure white)
    const flashGeometry = new THREE.PlaneGeometry(200, 200)
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF6622, // Saturated orange instead of white to prevent whiteouts
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    })
    this.screenFlashMesh = new THREE.Mesh(flashGeometry, flashMaterial)
    this.screenFlashMesh.position.z = 5
    this.scene.add(this.screenFlashMesh)

    // Distortion field for impact effects - ENHANCED!
    const distortGeometry = new THREE.PlaneGeometry(100, 100, 32, 32)
    const distortMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FFFF,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      wireframe: true
    })
    this.distortionMesh = new THREE.Mesh(distortGeometry, distortMaterial)
    this.distortionMesh.position.z = -1
    this.scene.add(this.distortionMesh)
    
    // 🌟 BLOOM BURST MESH - For dramatic energy releases! 🌟
    const bloomGeometry = new THREE.CircleGeometry(50, 64)
    const bloomMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF4488, // Saturated magenta instead of white to prevent whiteouts
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    })
    this.bloomBurstMesh = new THREE.Mesh(bloomGeometry, bloomMaterial)
    this.bloomBurstMesh.position.z = 4
    this.scene.add(this.bloomBurstMesh)
    
    // 🌈 CHROMATIC ABERRATION MESH - For trippy color separation! 🌈
    const chromaGeometry = new THREE.PlaneGeometry(200, 200)
    const chromaMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF00FF,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    })
    this.chromaticMesh = new THREE.Mesh(chromaGeometry, chromaMaterial)
    this.chromaticMesh.position.z = 6
    this.scene.add(this.chromaticMesh)
    
    // 💫 ENERGY RIPPLE MESHES - For shockwave effects! 💫
    for (let i = 0; i < 5; i++) {
      const rippleGeometry = new THREE.RingGeometry(0.1, 1, 32)
      const rippleMaterial = new THREE.MeshBasicMaterial({
        color: 0x00FFFF,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      })
      const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial)
      ripple.position.z = 3
      ripple.visible = false
      this.energyRippleMeshes.push(ripple)
      this.scene.add(ripple)
    }
    
    // 💥 SHOCKWAVE MESHES - For impact effects! 💥
    for (let i = 0; i < 3; i++) {
      const shockGeometry = new THREE.RingGeometry(0.1, 2, 64)
      const shockMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF6600,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      })
      const shockwave = new THREE.Mesh(shockGeometry, shockMaterial)
      shockwave.position.z = 2
      shockwave.visible = false
      this.shockwaveMeshes.push(shockwave)
      this.scene.add(shockwave)
    }
  }

  private initializeParticlePools(): void {
    // Create different particle pools - ENHANCED FOR FLAMBOYANCE!
    this.particlePools.set('explosion', new ParticlePool(400, 'explosion'))
    this.particlePools.set('spark', new ParticlePool(600, 'spark'))
    this.particlePools.set('trail', new ParticlePool(800, 'trail'))
    this.particlePools.set('death', new ParticlePool(350, 'death'))
    this.particlePools.set('impact', new ParticlePool(300, 'impact'))
    this.particlePools.set('electric', new ParticlePool(400, 'electric'))
    
    // Vector-style particles (Asteroids style)
    this.vectorParticlePool = new VectorParticlePool(500, 'vector')
    
    // 🎆 NEW FLAMBOYANT PARTICLE SYSTEMS! 🎆
    this.nebulaPool = new NebulaParticlePool(200, 'nebula')
    this.plasmaPool = new PlasmaParticlePool(300, 'plasma')
    this.energyWavePool = new EnergyWavePool(150, 'energyWave')
    this.stardustPool = new StardustPool(400, 'stardust')
    this.auroraPool = new AuroraPool(250, 'aurora')
    
    // Add all particle systems to scene
    this.particlePools.forEach(pool => {
      this.scene.add(pool.getParticleSystem())
    })
    
    // Add vector particle system to scene
    this.scene.add(this.vectorParticlePool.getParticleSystem())
    
    // Add flamboyant particle systems to scene
    this.scene.add(this.nebulaPool.getParticleSystem())
    this.scene.add(this.plasmaPool.getParticleSystem())
    this.scene.add(this.energyWavePool.getParticleSystem())
    this.scene.add(this.stardustPool.getParticleSystem())
    this.scene.add(this.auroraPool.getParticleSystem())
  }

  // 💥💥💥 FLAMBOYANT EXPLOSION EFFECTS - MAXIMUM FLARE! 💥💥💥
  createExplosion(position: THREE.Vector3, intensity: number = 1.0, color?: THREE.Color): void {
    this.explosionEffects.createExplosion(position, intensity, color)
  }

  // Legacy method - delegates to ExplosionEffects (kept for backward compat)
  createExplosion_LEGACY(position: THREE.Vector3, intensity: number = 1.0, color?: THREE.Color): void {
    const particleCount = Math.floor(50 * intensity)
    const explosionPool = this.particlePools.get('explosion')!
    
    // 🌟 REGULAR POINT PARTICLES - 85% saturated, 15% bright to prevent white-out 🌟
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5
      const speed = (3 + Math.random() * 6) * intensity
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        (Math.random() - 0.5) * 3 * intensity
      )
      
      const useSaturated = Math.random() < 0.85
      const particleColor = color || new THREE.Color().setHSL(
        Math.random() * 0.15 + 0.05,
        1.0,
        useSaturated ? 0.4 + Math.random() * 0.12 : 0.55
      )
      
      explosionPool.emit(position, velocity, particleColor, 1.2 + Math.random() * 0.8)
    }
    
    // 🎆 VECTOR-STYLE PARTICLES - 85% saturated, 15% bright 🎆
    if (this.vectorParticlePool) {
      const vectorCount = Math.floor(30 * intensity)
      for (let i = 0; i < vectorCount; i++) {
        const angle = (Math.PI * 2 * i) / vectorCount + Math.random() * 0.5
        const speed = (5 + Math.random() * 7) * intensity
        const velocity = new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          (Math.random() - 0.5) * 3 * intensity
        )
        
        const useSaturated = Math.random() < 0.85
        const vectorColor = color || new THREE.Color().setHSL(
          Math.random() * 0.15 + 0.05,
          1.0,
          useSaturated ? 0.45 + Math.random() * 0.12 : 0.58
        )
        
        const shapeType = Math.floor(Math.random() * 3)
        this.vectorParticlePool.emit(position, velocity, vectorColor, 1.5 + Math.random() * 1.0, shapeType)
      }
    }
    
    // 🌌 NEBULA PARTICLES - Swirling cosmic clouds 🌌
    if (this.nebulaPool && intensity > 0.8) {
      const nebulaCount = Math.floor(15 * intensity)
      for (let i = 0; i < nebulaCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = (1 + Math.random() * 2) * intensity
        const velocity = new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          (Math.random() - 0.5) * 1
        )
        const nebulaColor = color || new THREE.Color().setHSL(
          Math.random() * 0.3 + 0.5,
          0.7,
          0.5 // Darker nebula
        )
        this.nebulaPool.emit(position, velocity, nebulaColor, 2.0 + Math.random() * 1.0)
      }
    }
    
    // ⚡ PLASMA PARTICLES - 85% saturated, 15% bright ⚡
    if (this.plasmaPool && intensity > 1.0) {
      const plasmaCount = Math.floor(20 * intensity)
      for (let i = 0; i < plasmaCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = (2 + Math.random() * 4) * intensity
        const velocity = new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          (Math.random() - 0.5) * 2
        )
        const useSaturated = Math.random() < 0.85
        const plasmaColor = color || new THREE.Color().setHSL(
          0.6 + Math.random() * 0.2,
          1.0,
          useSaturated ? 0.45 + Math.random() * 0.12 : 0.58
        )
        this.plasmaPool.emit(position, velocity, plasmaColor, 1.5 + Math.random() * 0.8)
      }
    }
    
    // ✨ STARDUST PARTICLES - 85% saturated, 15% bright ✨
    if (this.stardustPool) {
      const stardustCount = Math.floor(25 * intensity)
      for (let i = 0; i < stardustCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = (1 + Math.random() * 3) * intensity
        const velocity = new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          (Math.random() - 0.5) * 1.5
        )
        const useSaturated = Math.random() < 0.85
        const stardustColor = new THREE.Color().setHSL(
          Math.random(),
          1.0,
          useSaturated ? 0.4 + Math.random() * 0.12 : 0.55
        )
        this.stardustPool.emit(position, velocity, stardustColor, 1.0 + Math.random() * 0.5)
      }
    }
    
    // 💥 SHOCKWAVE EFFECT! 💥
    this.createShockwave(position, intensity)
    
    // 🌊 ENERGY RIPPLE! 🌊
    this.createEnergyRipple(position, intensity)
    
    // Screen shake - REDUCED!
    this.addScreenShake(0.25 * intensity, 0.4)
    
    // Screen flash - 🔴 REDUCED to prevent white-out
    const flashColor = color || new THREE.Color().setHSL(0.08, 1.0, 0.35) // Dark orange
    this.addScreenFlash(0.2 * intensity, flashColor)
    
    // 🌈 BLOOM BURST! 🌈
    if (intensity > 1.2) {
      this.createBloomBurst(position, intensity)
    }
    
    // Add slow motion effect for big explosions
    if (intensity > 1.5) {
      this.addSlowMotion(0.3, 0.2)
    }
  }

  // ⚡ ELECTRIC DEATH EFFECT ⚡ - With saturated colors
  createElectricDeath(position: THREE.Vector3, enemyType: string): void {
    this.explosionEffects.createElectricDeath(position, enemyType)
  }

  // Legacy method - 85% saturated, 15% bright to prevent white-out
  createElectricDeath_LEGACY(position: THREE.Vector3, enemyType: string): void {
    const electricPool = this.particlePools.get('electric')!
    const sparkPool = this.particlePools.get('spark')!
    
    // Main electric burst - 85% saturated, 15% bright
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 3
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        (Math.random() - 0.5) * 1
      )
      
      const useSaturated = Math.random() < 0.85
      const electricColor = new THREE.Color().setHSL(0.6, 1.0, useSaturated ? 0.45 : 0.55)
      electricPool.emit(position, velocity, electricColor, 0.8)
    }
    
    // Secondary sparks - 85% saturated, 15% bright
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 1 + Math.random() * 5
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        (Math.random() - 0.5) * 2
      )
      
      const useSaturated = Math.random() < 0.85
      const sparkColor = new THREE.Color().setHSL(0.15, 1.0, useSaturated ? 0.45 : 0.55)
      sparkPool.emit(position, velocity, sparkColor, 0.6)
    }
    
    // VECTOR-STYLE ELECTRIC LINES - 85% saturated, 15% bright
    if (this.vectorParticlePool) {
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 3 + Math.random() * 4
        const velocity = new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          (Math.random() - 0.5) * 1.5
        )
        
        const useSaturated = Math.random() < 0.85
        const vectorColor = new THREE.Color().setHSL(0.6, 1.0, useSaturated ? 0.5 : 0.58)
        this.vectorParticlePool.emit(position, velocity, vectorColor, 1.0, 1)
      }
    }
    
    // 🔴 REDUCED flash - dark cyan instead of bright
    this.addScreenFlash(0.15, new THREE.Color().setHSL(0.55, 1.0, 0.35))
    this.addScreenShake(0.15, 0.2)
  }

  // 🌟 ENEMY TRAILS 🌟
  createEnemyTrail(position: THREE.Vector3, velocity: THREE.Vector3, enemyType: string): void {
    const trailPool = this.particlePools.get('trail')!
    
    let trailColor: THREE.Color
    let particleCount: number
    
    switch (enemyType) {
      case 'DataMite':
        trailColor = new THREE.Color().setHSL(0.0, 0.8, 0.6) // Red trail
        particleCount = 2
        break
      case 'ChaosWorm':
        trailColor = new THREE.Color().setHSL(Math.random(), 0.9, 0.7) // Rainbow trail
        particleCount = 5
        break
      case 'VoidSphere':
        trailColor = new THREE.Color().setHSL(0.8, 1.0, 0.4) // Purple trail
        particleCount = 3
        break
      case 'CrystalShardSwarm':
        trailColor = new THREE.Color().setHSL(0.5, 1.0, 0.8) // Cyan trail
        particleCount = 4
        break
      default:
        trailColor = new THREE.Color().setHSL(0.1, 0.7, 0.5)
        particleCount = 2
    }
    
    for (let i = 0; i < particleCount; i++) {
      const trailVelocity = velocity.clone().multiplyScalar(-0.3 + Math.random() * 0.2)
      trailVelocity.add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.3
      ))
      
      trailPool.emit(position, trailVelocity, trailColor, 0.4)
    }
  }

  // 💀💀💀 FLAMBOYANT ENEMY DEATH PARTICLES - MAXIMUM FLARE! 💀💀💀
  createEnemyDeathParticles(position: THREE.Vector3, enemyType: string, color?: THREE.Color): void {
    this.explosionEffects.createEnemyDeathParticles(position, enemyType, color)
  }

  // Legacy method
  createEnemyDeathParticles_LEGACY(position: THREE.Vector3, enemyType: string, color?: THREE.Color): void {
    const deathPool = this.particlePools.get('death')!
    const sparkPool = this.particlePools.get('spark')!
    
    // Determine particle color based on enemy type
    let particleColor: THREE.Color
    if (color) {
      particleColor = color
    } else {
      switch (enemyType) {
        case 'DataMite':
          particleColor = new THREE.Color().setHSL(0.0, 0.9, 0.6) // Red
          break
        case 'ScanDrone':
          particleColor = new THREE.Color().setHSL(0.1, 0.9, 0.7) // Orange
          break
        case 'ChaosWorm':
          particleColor = new THREE.Color().setHSL(Math.random(), 0.9, 0.7) // Rainbow
          break
        case 'VoidSphere':
          particleColor = new THREE.Color().setHSL(0.8, 1.0, 0.4) // Purple
          break
        case 'CrystalShardSwarm':
          particleColor = new THREE.Color().setHSL(0.5, 1.0, 0.8) // Cyan
          break
        default:
          particleColor = new THREE.Color().setHSL(0.0, 0.8, 0.6) // Default red
      }
    }
    
    // 🌟 ENHANCED DEATH PARTICLES - MORE OF THEM! 🌟
    const particleCount = 60
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5
      const speed = 2 + Math.random() * 5
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        (Math.random() - 0.5) * 2
      )
      
      deathPool.emit(position, velocity, particleColor, 1.0 + Math.random() * 0.6)
    }
    
    // ✨ ENHANCED SPARK PARTICLES! ✨ - With saturated colors
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 1 + Math.random() * 4
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        (Math.random() - 0.5) * 2
      )
      
      // Use saturated color instead of multiplying brightness
      const sparkColor = particleColor.clone()
      const hsl = { h: 0, s: 0, l: 0 }
      sparkColor.getHSL(hsl)
      // 75% saturated, 25% bright
      const useSaturated = Math.random() < 0.75
      sparkColor.setHSL(hsl.h, 1.0, useSaturated ? 0.55 + Math.random() * 0.15 : 0.75)
      sparkPool.emit(position, velocity, sparkColor, 0.6 + Math.random() * 0.4)
    }
    
    // 🎆 VECTOR-STYLE DEATH PARTICLES! 🎆 - With saturated colors
    if (this.vectorParticlePool) {
      const vectorCount = 25
      for (let i = 0; i < vectorCount; i++) {
        const angle = (Math.PI * 2 * i) / vectorCount + Math.random() * 0.5
        const speed = 4 + Math.random() * 5
        const velocity = new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          (Math.random() - 0.5) * 2
        )
        
        // Use saturated version of particle color instead of ultra bright
        const vectorColor = particleColor.clone()
        const hsl = { h: 0, s: 0, l: 0 }
        vectorColor.getHSL(hsl)
        // 75% saturated, 25% bright
        const useSaturated = Math.random() < 0.75
        vectorColor.setHSL(hsl.h, 1.0, useSaturated ? 0.55 + Math.random() * 0.15 : 0.75)
        
        const shapeType = Math.floor(Math.random() * 3)
        this.vectorParticlePool.emit(position, velocity, vectorColor, 1.2 + Math.random() * 0.8, shapeType)
      }
    }
    
    // 🌌 ADD NEBULA PARTICLES FOR DRAMATIC EFFECTS! 🌌
    if (this.nebulaPool) {
      const nebulaCount = 20
      for (let i = 0; i < nebulaCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 1 + Math.random() * 3
        const velocity = new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          (Math.random() - 0.5) * 1
        )
        const nebulaColor = particleColor.clone()
        const hsl = { h: 0, s: 0, l: 0 }
        particleColor.getHSL(hsl)
        nebulaColor.setHSL(hsl.h, 0.7, 0.6)
        this.nebulaPool.emit(position, velocity, nebulaColor, 2.0 + Math.random() * 1.0)
      }
    }
    
    // ✨ ADD STARDUST FOR MAGIC! ✨ - With saturated colors
    if (this.stardustPool) {
      const stardustCount = 30
      for (let i = 0; i < stardustCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 1 + Math.random() * 3
        const velocity = new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          (Math.random() - 0.5) * 1.5
        )
        // 75% saturated, 25% bright
        const useSaturated = Math.random() < 0.75
        const stardustColor = new THREE.Color().setHSL(
          Math.random(), // Full rainbow!
          1.0, // Full saturation
          useSaturated ? 0.5 + Math.random() * 0.15 : 0.7 // Reduced brightness
        )
        this.stardustPool.emit(position, velocity, stardustColor, 1.0 + Math.random() * 0.5)
      }
    }
  }

  // 💫 WEAPON IMPACT EFFECTS 💫 - With saturated colors
  createWeaponImpact(position: THREE.Vector3, normal?: THREE.Vector3): void {
    this.explosionEffects.createWeaponImpact(position, normal)
  }

  // Legacy method
  createWeaponImpact_LEGACY(position: THREE.Vector3, normal?: THREE.Vector3): void {
    const impactPool = this.particlePools.get('impact')!
    const sparkPool = this.particlePools.get('spark')!
    
    // Impact sparks - 75% saturated, 25% bright
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 1.5 + Math.random() * 2.5
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        Math.random() * 1
      )
      
      const useSaturated = Math.random() < 0.75
      const sparkColor = new THREE.Color().setHSL(0.15, 1.0, useSaturated ? 0.55 : 0.75)
      sparkPool.emit(position, velocity, sparkColor, 0.3)
    }
    
    // Impact flash - saturated colors
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.5 + Math.random() * 1
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        0
      )
      
      const useSaturated = Math.random() < 0.75
      const flashColor = new THREE.Color().setHSL(0.55, 1.0, useSaturated ? 0.5 : 0.65)
      impactPool.emit(position, velocity, flashColor, 0.2)
    }
    
    this.addScreenShake(0.1, 0.1)
  }

  // ✨ SPARKLE PARTICLES (for power-ups and effects) ✨
  createSparkle(position: THREE.Vector3, velocity: THREE.Vector3, color: THREE.Color, life: number = 0.5): void {
    const sparkPool = this.particlePools.get('spark')!
    sparkPool.emit(position, velocity, color, life)
  }

  // 🚀 JET VFX - Vector-style jet particles for dash/thrust effects 🚀
  createJetVector(position: THREE.Vector3, velocity: THREE.Vector3, color: THREE.Color, life: number = 0.6, shapeType: number = 1): void {
    if (this.vectorParticlePool) {
      this.vectorParticlePool.emit(position, velocity, color, life, shapeType)
    }
  }

  // 🔥 PROJECTILE TRAIL 🔥 - With saturated colors
  createProjectileTrail(position: THREE.Vector3, velocity: THREE.Vector3): void {
    // Use default power level 0 for backwards compatibility
    this.createPowerScaledProjectileTrail(position, velocity, 0, 'bullets')
  }
  
  // 🔥 PERFORMANCE-OPTIMIZED PROJECTILE TRAIL 🔥
  // Capped particle counts to maintain smooth FPS during rapid fire
  createPowerScaledProjectileTrail(position: THREE.Vector3, velocity: THREE.Vector3, powerLevel: number, weaponType: string): void {
    const trailPool = this.particlePools.get('trail')!
    
    // 🎯 FIXED particle count - no scaling to prevent FPS drops
    // Visual intensity comes from color/opacity, not particle spam
    const particleCount = 2
    
    // 🎨 Weapon-type specific colors
    let baseHue: number
    switch (weaponType) {
      case 'lasers':
        baseHue = 0.95 // Red/pink
        break
      case 'photons':
        baseHue = 0.55 // Cyan/blue
        break
      default: // bullets
        baseHue = 0.1 // Orange/yellow
    }
    
    // Trail particles - fixed count, power affects color intensity only
    for (let i = 0; i < particleCount; i++) {
      const trailVelocity = velocity.clone().multiplyScalar(-0.1 - Math.random() * 0.1)
      const spread = 0.25
      trailVelocity.add(new THREE.Vector3(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread * 0.5
      ))
      
      const hueVariation = baseHue + (Math.random() - 0.5) * 0.1
      // Higher power = brighter trail color (visual impact without more particles)
      const lightness = 0.5 + powerLevel * 0.02
      const trailColor = new THREE.Color().setHSL(hueVariation, 1.0, lightness)
      const life = 0.35 + Math.random() * 0.15
      trailPool.emit(position, trailVelocity, trailColor, life)
    }
    
    // VECTOR-STYLE TRAIL - Only ONE vector particle, always
    if (this.vectorParticlePool && Math.random() < 0.5) { // 50% chance for variety
      const trailVectorVelocity = velocity.clone().multiplyScalar(-0.15)
      trailVectorVelocity.add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.15,
        0
      ))
      
      const lightness = 0.55 + powerLevel * 0.02
      const vectorColor = new THREE.Color().setHSL(baseHue, 1.0, lightness)
      this.vectorParticlePool.emit(position, trailVectorVelocity, vectorColor, 0.4, 1)
    }
    
    // REMOVED: Stardust and plasma trail particles to maintain FPS
    // These effects are reserved for explosions and death effects only
  }

  // 📺 SCREEN EFFECTS 📺 - With reduced white to prevent whiteouts
  addScreenFlash(intensity: number, color: THREE.Color): void {
    this.screenEffects.addScreenFlash(intensity, color)
  }

  // Legacy method
  addScreenFlash_LEGACY(intensity: number, color: THREE.Color): void {
    const flashMaterial = this.screenFlashMesh.material as THREE.MeshBasicMaterial
    
    // Clamp intensity to prevent whiteouts
    const clampedIntensity = Math.min(intensity, 0.5)
    
    // If color is too close to white, saturate it
    const hsl = { h: 0, s: 0, l: 0 }
    color.getHSL(hsl)
    if (hsl.l > 0.8) {
      // Push toward saturated color (reduce lightness, increase saturation)
      flashMaterial.color.setHSL(hsl.h, 1.0, 0.6)
    } else {
      flashMaterial.color.copy(color)
    }
    
    flashMaterial.opacity = clampedIntensity
    
    new TWEEN.Tween(flashMaterial)
      .to({ opacity: 0 }, 150)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start()
  }

  addScreenShake(intensity: number, duration: number): void {
    this.screenEffects.addScreenShake(intensity, duration)
  }

  // Legacy method
  addScreenShake_LEGACY(intensity: number, duration: number): void {
    this.screenShakeAmount = Math.max(this.screenShakeAmount, intensity)
    
    // 🌈 ADD CHROMATIC ABERRATION FOR INTENSE SHAKES! 🌈
    if (intensity > 0.3) {
      this.chromaticAberrationAmount = Math.max(this.chromaticAberrationAmount, intensity * 2)
    }
    
    new TWEEN.Tween(this)
      .to({ screenShakeAmount: 0 }, duration * 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start()
  }

  addSlowMotion(factor: number, duration: number): void {
    this.screenEffects.addSlowMotion(factor, duration)
  }

  // Legacy method
  addSlowMotion_LEGACY(factor: number, duration: number): void {
    this.slowMotionFactor = factor
    
    new TWEEN.Tween(this)
      .to({ slowMotionFactor: 1.0 }, duration * 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start()
  }

  addDistortionWave(center: THREE.Vector3, intensity: number): void {
    this.screenEffects.addDistortionWave(center, intensity)
  }

  // Legacy method
  addDistortionWave_LEGACY(center: THREE.Vector3, intensity: number): void {
    const distortMaterial = this.distortionMesh.material as THREE.MeshBasicMaterial
    this.distortionMesh.position.copy(center)
    distortMaterial.opacity = intensity * 0.5
    
    // Animate wave expansion
    this.distortionMesh.scale.setScalar(0.1)
    
    new TWEEN.Tween(this.distortionMesh.scale)
      .to({ x: 3, y: 3, z: 1 }, 500)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start()
    
    new TWEEN.Tween(distortMaterial)
      .to({ opacity: 0 }, 500)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start()
  }

  // 💥 SHOCKWAVE EFFECT - Expanding energy rings! 💥
  createShockwave(position: THREE.Vector3, intensity: number): void {
    this.screenEffects.createShockwave(position, intensity)
  }

  // Legacy method
  createShockwave_LEGACY(position: THREE.Vector3, intensity: number): void {
    let availableShockwave: THREE.Mesh | undefined
    for (let i = 0; i < this.shockwaveMeshes.length; i++) {
      if (!this.shockwaveMeshes[i].visible) {
        availableShockwave = this.shockwaveMeshes[i]
        break
      }
    }
    if (!availableShockwave) return
    
    availableShockwave.position.copy(position)
    availableShockwave.position.z = 2
    availableShockwave.visible = true
    availableShockwave.scale.setScalar(0.1)
    
    const material = availableShockwave.material as THREE.MeshBasicMaterial
    material.opacity = 0.8 * intensity
    
    // Animate expansion
    new TWEEN.Tween(availableShockwave.scale)
      .to({ x: 10 * intensity, y: 10 * intensity, z: 1 }, 500)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start()
    
    new TWEEN.Tween(material)
      .to({ opacity: 0 }, 500)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onComplete(() => {
        availableShockwave.visible = false
      })
      .start()
  }
  
  // 🌊 ENERGY RIPPLE - Concentric energy waves! 🌊
  createEnergyRipple(position: THREE.Vector3, intensity: number): void {
    this.screenEffects.createEnergyRipple(position, intensity)
  }

  // Legacy method
  createEnergyRipple_LEGACY(position: THREE.Vector3, intensity: number): void {
    let availableRipple: THREE.Mesh | undefined
    for (let i = 0; i < this.energyRippleMeshes.length; i++) {
      if (!this.energyRippleMeshes[i].visible) {
        availableRipple = this.energyRippleMeshes[i]
        break
      }
    }
    if (!availableRipple) return
    
    availableRipple.position.copy(position)
    availableRipple.position.z = 3
    availableRipple.visible = true
    availableRipple.scale.setScalar(0.1)
    
    const material = availableRipple.material as THREE.MeshBasicMaterial
    const hue = Math.random()
    material.color.setHSL(hue, 1.0, 0.7)
    material.opacity = 0.6 * intensity
    
    // Animate expansion
    new TWEEN.Tween(availableRipple.scale)
      .to({ x: 8 * intensity, y: 8 * intensity, z: 1 }, 600)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start()
    
    new TWEEN.Tween(material)
      .to({ opacity: 0 }, 600)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onComplete(() => {
        availableRipple.visible = false
      })
      .start()
  }
  
  // 🌈 BLOOM BURST - Dramatic energy release with saturated colors! 🌈
  createBloomBurst(position: THREE.Vector3, intensity: number): void {
    this.screenEffects.createBloomBurst(position, intensity)
  }

  // Legacy method
  createBloomBurst_LEGACY(position: THREE.Vector3, intensity: number): void {
    // This method is kept for reference but should not be called
    // Implementation moved to ScreenEffects
  }
  
  // 🌌 AURORA EFFECT - Flowing energy streams with saturated colors! 🌌
  createAurora(position: THREE.Vector3, direction: THREE.Vector3, intensity: number): void {
    if (!this.auroraPool) return
    
    const auroraCount = Math.floor(30 * intensity)
    for (let i = 0; i < auroraCount; i++) {
      const angle = (Math.PI * 2 * i) / auroraCount + Math.random() * 0.3
      const speed = (2 + Math.random() * 4) * intensity
      const velocity = direction.clone().multiplyScalar(speed)
      velocity.add(new THREE.Vector3(
        Math.cos(angle) * speed * 0.3,
        Math.sin(angle) * speed * 0.3,
        (Math.random() - 0.5) * 1
      ))
      
      // 75% saturated, 25% bright
      const useSaturated = Math.random() < 0.75
      const auroraColor = new THREE.Color().setHSL(
        0.6 + Math.random() * 0.2, // Cyan-green range
        1.0,
        useSaturated ? 0.5 + Math.random() * 0.1 : 0.65
      )
      this.auroraPool.emit(position, velocity, auroraColor, 2.0 + Math.random() * 1.0)
    }
  }
  
  // ⚡ ENERGY WAVE - Traveling energy pulse with saturated colors! ⚡
  createEnergyWave(startPos: THREE.Vector3, endPos: THREE.Vector3, intensity: number): void {
    if (!this.energyWavePool) return
    
    const direction = endPos.clone().sub(startPos).normalize()
    const distance = startPos.distanceTo(endPos)
    const waveCount = Math.floor(distance * 2 * intensity)
    
    for (let i = 0; i < waveCount; i++) {
      const t = i / waveCount
      const position = startPos.clone().lerp(endPos, t)
      const velocity = direction.clone().multiplyScalar(5 + Math.random() * 3)
      
      // 75% saturated, 25% bright
      const useSaturated = Math.random() < 0.75
      const waveColor = new THREE.Color().setHSL(
        0.55 + Math.random() * 0.1, // Cyan range
        1.0,
        useSaturated ? 0.55 + Math.random() * 0.1 : 0.75
      )
      this.energyWavePool.emit(position, velocity, waveColor, 1.0 + Math.random() * 0.5)
    }
  }

  // Update system - ENHANCED WITH FLAMBOYANT EFFECTS!
  update(deltaTime: number): void {
    this.timeOffset += deltaTime
    
    // Apply slow motion to deltaTime
    const adjustedDeltaTime = deltaTime * this.screenEffects.getSlowMotionFactor()
    
    // Update all particle pools
    this.particlePools.forEach(pool => {
      pool.update(adjustedDeltaTime)
    })
    
    // Update vector particle pool
    if (this.vectorParticlePool) {
      this.vectorParticlePool.update(adjustedDeltaTime)
    }
    
    // 🎆 UPDATE FLAMBOYANT PARTICLE SYSTEMS! 🎆
    if (this.nebulaPool) {
      this.nebulaPool.update(adjustedDeltaTime)
    }
    if (this.plasmaPool) {
      this.plasmaPool.update(adjustedDeltaTime)
    }
    if (this.energyWavePool) {
      this.energyWavePool.update(adjustedDeltaTime)
    }
    if (this.stardustPool) {
      this.stardustPool.update(adjustedDeltaTime)
    }
    if (this.auroraPool) {
      this.auroraPool.update(adjustedDeltaTime)
    }
    
    // Update screen effects (includes TWEEN updates and chromatic aberration)
    this.screenEffects.update(deltaTime)
    
    // Update active effects
    this.activeEffects = this.activeEffects.filter(effect => {
      effect.update(adjustedDeltaTime)
      return effect.isAlive()
    })
  }

  getScreenShakeAmount(): number {
    return this.screenEffects.getScreenShakeAmount()
  }

  getSlowMotionFactor(): number {
    return this.screenEffects.getSlowMotionFactor()
  }

  // 🧹 CLEANUP - Clear all particles and effects for fresh start! 🧹
  cleanup(): void {
    // Deactivate all particles in all pools
    this.particlePools.forEach(pool => {
      const particles = (pool as any).particles
      if (particles) {
        particles.forEach((particle: any) => {
          particle.active = false
          particle.life = 0
        })
      }
    })
    
    // Deactivate vector particles
    if (this.vectorParticlePool) {
      const particles = (this.vectorParticlePool as any).particles
      if (particles) {
        particles.forEach((particle: any) => {
          particle.active = false
          particle.life = 0
        })
      }
    }
    
    // Deactivate specialized particle pools
    if (this.nebulaPool) {
      const particles = (this.nebulaPool as any).particles
      if (particles) {
        particles.forEach((particle: any) => {
          particle.active = false
          particle.life = 0
        })
      }
    }
    
    if (this.plasmaPool) {
      const particles = (this.plasmaPool as any).particles
      if (particles) {
        particles.forEach((particle: any) => {
          particle.active = false
          particle.life = 0
        })
      }
    }
    
    if (this.energyWavePool) {
      const particles = (this.energyWavePool as any).particles
      if (particles) {
        particles.forEach((particle: any) => {
          particle.active = false
          particle.life = 0
        })
      }
    }
    
    if (this.stardustPool) {
      const particles = (this.stardustPool as any).particles
      if (particles) {
        particles.forEach((particle: any) => {
          particle.active = false
          particle.life = 0
        })
      }
    }
    
    if (this.auroraPool) {
      const particles = (this.auroraPool as any).particles
      if (particles) {
        particles.forEach((particle: any) => {
          particle.active = false
          particle.life = 0
        })
      }
    }
    
    // Clear active effects
    this.activeEffects = []
    
    // Clear screen effects
    if (this.screenEffects && (this.screenEffects as any).cleanup) {
      (this.screenEffects as any).cleanup()
    }
  }
}

// NOTE: ParticlePool, Particle, Effect, VectorParticlePool, and VectorParticle
// are now imported from './effects/ParticlePool' and './effects/VectorParticles'
// The duplicate definitions below have been removed to avoid conflicts.

// 🌌 NEBULA PARTICLE POOL - Swirling cosmic clouds! 🌌
class NebulaParticlePool {
  private particles: NebulaParticle[] = []
  private particleSystem: THREE.Points
  private geometry: THREE.BufferGeometry
  private material: THREE.PointsMaterial
  private positions: Float32Array
  private colors: Float32Array
  private sizes: Float32Array
  private activeCount: number = 0
  private poolSize: number

  constructor(poolSize: number, effectType: string) {
    this.poolSize = poolSize
    
    this.positions = new Float32Array(poolSize * 3)
    this.colors = new Float32Array(poolSize * 3)
    this.sizes = new Float32Array(poolSize)
    
    this.geometry = new THREE.BufferGeometry()
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3))
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1))
    
    this.material = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: false
    })
    
    this.particleSystem = new THREE.Points(this.geometry, this.material)
    
    for (let i = 0; i < poolSize; i++) {
      this.particles.push(new NebulaParticle())
    }
  }

  emit(position: THREE.Vector3, velocity: THREE.Vector3, color: THREE.Color, life: number): void {
    const maxSearch = Math.min(this.poolSize, this.activeCount + 50)
    for (let i = 0; i < maxSearch; i++) {
      if (!this.particles[i].active) {
        this.particles[i].reset(position, velocity, color, life)
        if (i >= this.activeCount) {
          this.activeCount = i + 1
        }
        return
      }
    }
  }

  update(deltaTime: number): void {
    let newActiveCount = 0
    
    for (let i = 0; i < this.activeCount; i++) {
      const particle = this.particles[i]
      const i3 = i * 3
      
      if (particle.active) {
        particle.update(deltaTime)
        
        this.positions[i3] = particle.position.x
        this.positions[i3 + 1] = particle.position.y
        this.positions[i3 + 2] = particle.position.z
        
        this.colors[i3] = particle.color.r
        this.colors[i3 + 1] = particle.color.g
        this.colors[i3 + 2] = particle.color.b
        
        this.sizes[i] = particle.size * particle.opacity * (1.5 + Math.sin(particle.swirlPhase) * 0.5)
        
        newActiveCount = Math.max(newActiveCount, i + 1)
      } else {
        this.sizes[i] = 0
      }
    }
    
    this.activeCount = newActiveCount
    
    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.color.needsUpdate = true
    this.geometry.attributes.size.needsUpdate = true
    this.geometry.setDrawRange(0, this.activeCount)
  }

  getParticleSystem(): THREE.Points {
    return this.particleSystem
  }
}

class NebulaParticle extends Particle {
  swirlPhase: number = 0
  swirlSpeed: number = 0

  reset(position: THREE.Vector3, velocity: THREE.Vector3, color: THREE.Color, life: number): void {
    super.reset(position, velocity, color, life)
    this.swirlPhase = Math.random() * Math.PI * 2
    this.swirlSpeed = 2 + Math.random() * 3
    this.size = 0.5 + Math.random() * 0.5
  }

  update(deltaTime: number): void {
    super.update(deltaTime)
    this.swirlPhase += this.swirlSpeed * deltaTime
    
    // Swirling motion
    const swirlRadius = 0.3
    this.position.x += Math.cos(this.swirlPhase) * swirlRadius * deltaTime
    this.position.y += Math.sin(this.swirlPhase) * swirlRadius * deltaTime
  }
}

// ⚡ PLASMA PARTICLE POOL - Electric energy bursts! ⚡
class PlasmaParticlePool {
  private particles: PlasmaParticle[] = []
  private particleSystem: THREE.Points
  private geometry: THREE.BufferGeometry
  private material: THREE.PointsMaterial
  private positions: Float32Array
  private colors: Float32Array
  private sizes: Float32Array
  private activeCount: number = 0
  private poolSize: number

  constructor(poolSize: number, effectType: string) {
    this.poolSize = poolSize
    
    this.positions = new Float32Array(poolSize * 3)
    this.colors = new Float32Array(poolSize * 3)
    this.sizes = new Float32Array(poolSize)
    
    this.geometry = new THREE.BufferGeometry()
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3))
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1))
    
    this.material = new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: false
    })
    
    this.particleSystem = new THREE.Points(this.geometry, this.material)
    
    for (let i = 0; i < poolSize; i++) {
      this.particles.push(new PlasmaParticle())
    }
  }

  emit(position: THREE.Vector3, velocity: THREE.Vector3, color: THREE.Color, life: number): void {
    const maxSearch = Math.min(this.poolSize, this.activeCount + 50)
    for (let i = 0; i < maxSearch; i++) {
      if (!this.particles[i].active) {
        this.particles[i].reset(position, velocity, color, life)
        if (i >= this.activeCount) {
          this.activeCount = i + 1
        }
        return
      }
    }
  }

  update(deltaTime: number): void {
    let newActiveCount = 0
    
    for (let i = 0; i < this.activeCount; i++) {
      const particle = this.particles[i]
      const i3 = i * 3
      
      if (particle.active) {
        particle.update(deltaTime)
        
        this.positions[i3] = particle.position.x
        this.positions[i3 + 1] = particle.position.y
        this.positions[i3 + 2] = particle.position.z
        
        // Pulsing color intensity
        const pulse = 0.7 + Math.sin(particle.pulsePhase) * 0.3
        this.colors[i3] = particle.color.r * pulse
        this.colors[i3 + 1] = particle.color.g * pulse
        this.colors[i3 + 2] = particle.color.b * pulse
        
        this.sizes[i] = particle.size * particle.opacity * (1.0 + Math.sin(particle.pulsePhase) * 0.5)
        
        newActiveCount = Math.max(newActiveCount, i + 1)
      } else {
        this.sizes[i] = 0
      }
    }
    
    this.activeCount = newActiveCount
    
    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.color.needsUpdate = true
    this.geometry.attributes.size.needsUpdate = true
    this.geometry.setDrawRange(0, this.activeCount)
  }

  getParticleSystem(): THREE.Points {
    return this.particleSystem
  }
}

class PlasmaParticle extends Particle {
  pulsePhase: number = 0
  pulseSpeed: number = 0

  reset(position: THREE.Vector3, velocity: THREE.Vector3, color: THREE.Color, life: number): void {
    super.reset(position, velocity, color, life)
    this.pulsePhase = Math.random() * Math.PI * 2
    this.pulseSpeed = 10 + Math.random() * 15
    this.size = 0.3 + Math.random() * 0.3
  }

  update(deltaTime: number): void {
    super.update(deltaTime)
    this.pulsePhase += this.pulseSpeed * deltaTime
  }
}

// 🌊 ENERGY WAVE POOL - Traveling energy pulses! 🌊
class EnergyWavePool {
  private particles: EnergyWaveParticle[] = []
  private particleSystem: THREE.Points
  private geometry: THREE.BufferGeometry
  private material: THREE.PointsMaterial
  private positions: Float32Array
  private colors: Float32Array
  private sizes: Float32Array
  private activeCount: number = 0
  private poolSize: number

  constructor(poolSize: number, effectType: string) {
    this.poolSize = poolSize
    
    this.positions = new Float32Array(poolSize * 3)
    this.colors = new Float32Array(poolSize * 3)
    this.sizes = new Float32Array(poolSize)
    
    this.geometry = new THREE.BufferGeometry()
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3))
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1))
    
    this.material = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: false
    })
    
    this.particleSystem = new THREE.Points(this.geometry, this.material)
    
    for (let i = 0; i < poolSize; i++) {
      this.particles.push(new EnergyWaveParticle())
    }
  }

  emit(position: THREE.Vector3, velocity: THREE.Vector3, color: THREE.Color, life: number): void {
    const maxSearch = Math.min(this.poolSize, this.activeCount + 50)
    for (let i = 0; i < maxSearch; i++) {
      if (!this.particles[i].active) {
        this.particles[i].reset(position, velocity, color, life)
        if (i >= this.activeCount) {
          this.activeCount = i + 1
        }
        return
      }
    }
  }

  update(deltaTime: number): void {
    let newActiveCount = 0
    
    for (let i = 0; i < this.activeCount; i++) {
      const particle = this.particles[i]
      const i3 = i * 3
      
      if (particle.active) {
        particle.update(deltaTime)
        
        this.positions[i3] = particle.position.x
        this.positions[i3 + 1] = particle.position.y
        this.positions[i3 + 2] = particle.position.z
        
        this.colors[i3] = particle.color.r
        this.colors[i3 + 1] = particle.color.g
        this.colors[i3 + 2] = particle.color.b
        
        this.sizes[i] = particle.size * particle.opacity * (1.0 + Math.sin(particle.wavePhase) * 0.3)
        
        newActiveCount = Math.max(newActiveCount, i + 1)
      } else {
        this.sizes[i] = 0
      }
    }
    
    this.activeCount = newActiveCount
    
    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.color.needsUpdate = true
    this.geometry.attributes.size.needsUpdate = true
    this.geometry.setDrawRange(0, this.activeCount)
  }

  getParticleSystem(): THREE.Points {
    return this.particleSystem
  }
}

class EnergyWaveParticle extends Particle {
  wavePhase: number = 0
  waveSpeed: number = 0

  reset(position: THREE.Vector3, velocity: THREE.Vector3, color: THREE.Color, life: number): void {
    super.reset(position, velocity, color, life)
    this.wavePhase = Math.random() * Math.PI * 2
    this.waveSpeed = 8 + Math.random() * 10
    this.size = 0.4 + Math.random() * 0.4
  }

  update(deltaTime: number): void {
    super.update(deltaTime)
    this.wavePhase += this.waveSpeed * deltaTime
  }
}

// ✨ STARDUST POOL - Sparkly magic particles! ✨
class StardustPool {
  private particles: StardustParticle[] = []
  private particleSystem: THREE.Points
  private geometry: THREE.BufferGeometry
  private material: THREE.PointsMaterial
  private positions: Float32Array
  private colors: Float32Array
  private sizes: Float32Array
  private activeCount: number = 0
  private poolSize: number

  constructor(poolSize: number, effectType: string) {
    this.poolSize = poolSize
    
    this.positions = new Float32Array(poolSize * 3)
    this.colors = new Float32Array(poolSize * 3)
    this.sizes = new Float32Array(poolSize)
    
    this.geometry = new THREE.BufferGeometry()
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3))
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1))
    
    this.material = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: false
    })
    
    this.particleSystem = new THREE.Points(this.geometry, this.material)
    
    for (let i = 0; i < poolSize; i++) {
      this.particles.push(new StardustParticle())
    }
  }

  emit(position: THREE.Vector3, velocity: THREE.Vector3, color: THREE.Color, life: number): void {
    const maxSearch = Math.min(this.poolSize, this.activeCount + 50)
    for (let i = 0; i < maxSearch; i++) {
      if (!this.particles[i].active) {
        this.particles[i].reset(position, velocity, color, life)
        if (i >= this.activeCount) {
          this.activeCount = i + 1
        }
        return
      }
    }
  }

  update(deltaTime: number): void {
    let newActiveCount = 0
    
    for (let i = 0; i < this.activeCount; i++) {
      const particle = this.particles[i]
      const i3 = i * 3
      
      if (particle.active) {
        particle.update(deltaTime)
        
        this.positions[i3] = particle.position.x
        this.positions[i3 + 1] = particle.position.y
        this.positions[i3 + 2] = particle.position.z
        
        // Twinkling effect
        const twinkle = 0.5 + Math.sin(particle.twinklePhase) * 0.5
        this.colors[i3] = particle.color.r * twinkle
        this.colors[i3 + 1] = particle.color.g * twinkle
        this.colors[i3 + 2] = particle.color.b * twinkle
        
        this.sizes[i] = particle.size * particle.opacity * twinkle
        
        newActiveCount = Math.max(newActiveCount, i + 1)
      } else {
        this.sizes[i] = 0
      }
    }
    
    this.activeCount = newActiveCount
    
    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.color.needsUpdate = true
    this.geometry.attributes.size.needsUpdate = true
    this.geometry.setDrawRange(0, this.activeCount)
  }

  getParticleSystem(): THREE.Points {
    return this.particleSystem
  }
}

class StardustParticle extends Particle {
  twinklePhase: number = 0
  twinkleSpeed: number = 0

  reset(position: THREE.Vector3, velocity: THREE.Vector3, color: THREE.Color, life: number): void {
    super.reset(position, velocity, color, life)
    this.twinklePhase = Math.random() * Math.PI * 2
    this.twinkleSpeed = 5 + Math.random() * 10
    this.size = 0.15 + Math.random() * 0.15
  }

  update(deltaTime: number): void {
    super.update(deltaTime)
    this.twinklePhase += this.twinkleSpeed * deltaTime
  }
}

// 🌌 AURORA POOL - Flowing energy streams! 🌌
class AuroraPool {
  private particles: AuroraParticle[] = []
  private particleSystem: THREE.Points
  private geometry: THREE.BufferGeometry
  private material: THREE.PointsMaterial
  private positions: Float32Array
  private colors: Float32Array
  private sizes: Float32Array
  private activeCount: number = 0
  private poolSize: number

  constructor(poolSize: number, effectType: string) {
    this.poolSize = poolSize
    
    this.positions = new Float32Array(poolSize * 3)
    this.colors = new Float32Array(poolSize * 3)
    this.sizes = new Float32Array(poolSize)
    
    this.geometry = new THREE.BufferGeometry()
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3))
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1))
    
    this.material = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: false
    })
    
    this.particleSystem = new THREE.Points(this.geometry, this.material)
    
    for (let i = 0; i < poolSize; i++) {
      this.particles.push(new AuroraParticle())
    }
  }

  emit(position: THREE.Vector3, velocity: THREE.Vector3, color: THREE.Color, life: number): void {
    const maxSearch = Math.min(this.poolSize, this.activeCount + 50)
    for (let i = 0; i < maxSearch; i++) {
      if (!this.particles[i].active) {
        this.particles[i].reset(position, velocity, color, life)
        if (i >= this.activeCount) {
          this.activeCount = i + 1
        }
        return
      }
    }
  }

  update(deltaTime: number): void {
    let newActiveCount = 0
    
    for (let i = 0; i < this.activeCount; i++) {
      const particle = this.particles[i]
      const i3 = i * 3
      
      if (particle.active) {
        particle.update(deltaTime)
        
        this.positions[i3] = particle.position.x
        this.positions[i3 + 1] = particle.position.y
        this.positions[i3 + 2] = particle.position.z
        
        // Flowing color shift
        const flow = 0.6 + Math.sin(particle.flowPhase) * 0.4
        this.colors[i3] = particle.color.r * flow
        this.colors[i3 + 1] = particle.color.g * flow
        this.colors[i3 + 2] = particle.color.b * flow
        
        this.sizes[i] = particle.size * particle.opacity * flow
        
        newActiveCount = Math.max(newActiveCount, i + 1)
      } else {
        this.sizes[i] = 0
      }
    }
    
    this.activeCount = newActiveCount
    
    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.color.needsUpdate = true
    this.geometry.attributes.size.needsUpdate = true
    this.geometry.setDrawRange(0, this.activeCount)
  }

  getParticleSystem(): THREE.Points {
    return this.particleSystem
  }
}

class AuroraParticle extends Particle {
  flowPhase: number = 0
  flowSpeed: number = 0

  reset(position: THREE.Vector3, velocity: THREE.Vector3, color: THREE.Color, life: number): void {
    super.reset(position, velocity, color, life)
    this.flowPhase = Math.random() * Math.PI * 2
    this.flowSpeed = 3 + Math.random() * 5
    this.size = 0.4 + Math.random() * 0.3
  }

  update(deltaTime: number): void {
    super.update(deltaTime)
    this.flowPhase += this.flowSpeed * deltaTime
  }
}