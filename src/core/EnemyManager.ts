import * as THREE from 'three'
import { Enemy, DataMite, ScanDrone, ChaosWorm, VoidSphere, CrystalShardSwarm, Boss, Fizzer, UFO } from '../entities'
import { Player } from '../entities/Player'
import { SceneManager } from '../graphics/SceneManager'
import { EffectsSystem } from '../graphics/EffectsSystem'
import { LevelManager } from './LevelManager'
import { AudioManager } from '../audio/AudioManager'
import { EnemyProjectile } from '../weapons/EnemyProjectile'
import { DEBUG_MODE } from '../config'

export class EnemyManager {
  private enemies: Enemy[] = []
  private sceneManager: SceneManager
  private player: Player
  private spawnTimer: number = 0
  private scanDroneTimer: number = 0
  private chaosWormTimer: number = 0
  private voidSphereTimer: number = 0
  private crystalSwarmTimer: number = 0
  private bossTimer: number = 0
  private ufoTimer: number = 0
  private effectsSystem: EffectsSystem | null = null
  private levelManager: LevelManager | null = null
  private audioManager: AudioManager | null = null
  
  // ⚡ FIZZER SPAWN CONDITIONS ⚡
  private fizzersSpawnedThisStreak: number = 0
  private maxFizzersPerStreak: number = 3

  initialize(sceneManager: SceneManager, player: Player): void {
    this.sceneManager = sceneManager
    this.player = player
  }

  setLevelManager(levelManager: LevelManager): void {
    this.levelManager = levelManager
  }

  setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager
  }

  update(deltaTime: number, gameTime: number): void {
    // Update spawn timers
    this.spawnTimer += deltaTime
    this.scanDroneTimer += deltaTime
    this.chaosWormTimer += deltaTime
    this.voidSphereTimer += deltaTime
    this.crystalSwarmTimer += deltaTime
    this.bossTimer += deltaTime
    this.ufoTimer += deltaTime

    // Get level-based spawn rates
    if (!this.levelManager) {
      console.error('❌ EnemyManager: levelManager is null! Cannot spawn enemies.')
      return
    }
    
    const levelConfig = this.levelManager.getCurrentLevelConfig()
    
    if (!levelConfig) {
      console.error('❌ EnemyManager: No levelConfig available! levelManager:', !!this.levelManager, 'currentLevel:', this.levelManager.getCurrentLevel())
      return
    }
    
    // Spawn Data Mites - CRITICAL: This should spawn immediately on level 1!
    if (this.spawnTimer >= levelConfig.miteSpawnRate) {
      if (DEBUG_MODE) console.log('✅ Spawning DataMite! Timer:', this.spawnTimer, 'Rate:', levelConfig.miteSpawnRate)
      this.spawnDataMite()
      this.spawnTimer = 0
    } else {
      // Debug: Log spawn progress
      if (DEBUG_MODE && Math.random() < 0.01) { // 1% chance per frame to avoid spam
        console.log('⏳ DataMite spawn progress:', this.spawnTimer.toFixed(2), '/', levelConfig.miteSpawnRate)
      }
    }

    // Spawn Scan Drones
    if (levelConfig.droneSpawnRate !== Infinity && this.scanDroneTimer >= levelConfig.droneSpawnRate) {
      this.spawnScanDrone()
      this.scanDroneTimer = 0
    }

    // Spawn CHAOS WORMS
    if (levelConfig.wormSpawnRate !== Infinity && this.chaosWormTimer >= levelConfig.wormSpawnRate) {
      this.spawnChaosWorm()
      this.chaosWormTimer = 0
    }

    // Spawn VOID SPHERES
    if (levelConfig.voidSpawnRate !== Infinity && this.voidSphereTimer >= levelConfig.voidSpawnRate) {
      this.spawnVoidSphere()
      this.voidSphereTimer = 0
    }

    // Spawn CRYSTAL SHARD SWARMS
    if (levelConfig.crystalSpawnRate !== Infinity && this.crystalSwarmTimer >= levelConfig.crystalSpawnRate) {
      this.spawnCrystalShardSwarm()
      this.crystalSwarmTimer = 0
    }

    // Spawn BOSS
    if (levelConfig.bossSpawnRate !== Infinity && this.bossTimer >= levelConfig.bossSpawnRate) {
      this.spawnBoss()
      this.bossTimer = 0
    }

    // 🛸 Spawn UFO - Later game enemy (level 5+)
    const currentLevel = this.levelManager?.getCurrentLevel() || 1
    if (currentLevel >= 5) {
      const ufoSpawnRate = Math.max(20, 50 - (currentLevel - 5) * 5) // 50s at level 5, down to 20s at level 10
      if (this.ufoTimer >= ufoSpawnRate) {
        this.spawnUFO()
        this.ufoTimer = 0
      }
    }

    // Update all enemies
    for (const enemy of this.enemies) {
      if (enemy.isAlive()) {
        enemy.update(deltaTime, this.player)
      }
    }

    // Remove dead enemies
    this.cleanupDeadEnemies()
  }

  // Legacy time-based methods (kept for fallback compatibility)
  private getMiteSpawnRate(gameTime: number): number {
    // Spawn Data Mites much more frequently - every 0.5 seconds!
    return 0.5
  }

  private getDroneSpawnRate(gameTime: number): number {
    // 1 every 10 seconds, increasing to every 6 seconds
    const minutes = gameTime / 60
    const baseRate = 10
    const scalingFactor = Math.min(minutes / 8, 1)
    return baseRate * (1 - scalingFactor * 0.4) // 10s to 6s
  }

  private getChaosWormSpawnRate(gameTime: number): number {
    // Start spawning after 1 minute, every 25 seconds, scaling to every 15 seconds
    const minutes = gameTime / 60
    if (minutes < 1) return Infinity // Don't spawn until 1 minute in
    
    const baseRate = 25
    const scalingFactor = Math.min((minutes - 1) / 10, 1)
    return baseRate * (1 - scalingFactor * 0.4) // 25s to 15s
  }

  private getVoidSphereSpawnRate(gameTime: number): number {
    // Start spawning after 3 minutes, every 45 seconds, scaling to every 30 seconds
    const minutes = gameTime / 60
    if (minutes < 3) return Infinity // Don't spawn until 3 minutes in
    
    const baseRate = 45
    const scalingFactor = Math.min((minutes - 3) / 15, 1)
    return baseRate * (1 - scalingFactor * 0.33) // 45s to 30s
  }

  private getCrystalSwarmSpawnRate(gameTime: number): number {
    // Start spawning after 2 minutes, every 35 seconds, scaling to every 20 seconds
    const minutes = gameTime / 60
    if (minutes < 2) return Infinity // Don't spawn until 2 minutes in
    
    const baseRate = 35
    const scalingFactor = Math.min((minutes - 2) / 12, 1)
    return baseRate * (1 - scalingFactor * 0.43) // 35s to 20s
  }

  private spawnDataMite(): void {
    try {
      const spawnPos = this.getSpawnPosition()
      if (DEBUG_MODE) console.log('🕷️ Spawning DataMite at position:', spawnPos)
      
      const mite = new DataMite(spawnPos.x, spawnPos.y)
      mite.initialize()
      
      // Connect effects system for trails and death effects
      if (this.effectsSystem) {
        mite.setEffectsSystem(this.effectsSystem)
      }
      
      this.enemies.push(mite)
      const mesh = mite.getMesh()
      
      // Ensure mesh is valid before adding
      if (!mesh) {
        console.error('❌ DataMite mesh is null!')
        this.enemies.pop() // Remove from array if mesh creation failed
        return
      }
      
      if (DEBUG_MODE) console.log('✅ DataMite mesh created:', {
        position: mesh.position.clone(),
        visible: mesh.visible,
        children: mesh.children.length
      })
      
      this.sceneManager.addToScene(mesh)
      
      // 🎵 Play spawn sound (quiet for DataMites - they're small) 🎵
      if (this.audioManager && Math.random() < 0.3) { // Only 30% chance to avoid spam
        this.audioManager.playDataMiteBuzzSound()
      }
      
      if (DEBUG_MODE) console.log('✅ Spawned DataMite, total enemies:', this.enemies.length)
    } catch (error) {
      console.error('❌ Error spawning DataMite:', error)
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      // Remove from array if spawn failed
      if (this.enemies.length > 0 && this.enemies[this.enemies.length - 1] instanceof DataMite) {
        this.enemies.pop()
      }
    }
  }

  private spawnScanDrone(): void {
    const spawnPos = this.getSpawnPosition()
    const drone = new ScanDrone(spawnPos.x, spawnPos.y)
    drone.initialize()
    
    // 🎆 Connect effects system for SUPER JUICY trails and death effects!
    if (this.effectsSystem) {
      drone.setEffectsSystem(this.effectsSystem)
    }
    
    // 🔫 Connect sceneManager so drone can fire bullets!
    drone.setSceneManager(this.sceneManager)
    
    // 🎵 Connect audioManager for sounds!
    if (this.audioManager) {
      drone.setAudioManager(this.audioManager)
    }
    
    this.enemies.push(drone)
    this.sceneManager.addToScene(drone.getMesh())
    
    // 🎵 Play spawn sound! 🎵
    if (this.audioManager) {
      this.audioManager.playEnemySpawnSound('ScanDrone')
    }
  }

  private spawnChaosWorm(): void {
    const spawnPos = this.getSpawnPosition()
    const worm = new ChaosWorm(spawnPos.x, spawnPos.y)
    worm.initialize()
    
    // 🎆 Connect effects system for SUPER JUICY trails and death effects!
    if (this.effectsSystem) {
      worm.setEffectsSystem(this.effectsSystem)
    }
    
    // 🎵 Connect audioManager for death sequence sounds!
    if (this.audioManager) {
      worm.setAudioManager(this.audioManager)
    }
    
    this.enemies.push(worm)
    this.sceneManager.addToScene(worm.getMesh())
    
    // 🎵 Play spawn sound! 🎵
    if (this.audioManager) {
      this.audioManager.playEnemySpawnSound('ChaosWorm')
    }
  }

  private spawnVoidSphere(): void {
    const spawnPos = this.getSpawnPosition()
    const voidSphere = new VoidSphere(spawnPos.x, spawnPos.y)
    voidSphere.initialize()
    
    // 🎆 Connect effects system for SUPER JUICY trails and death effects!
    if (this.effectsSystem) {
      voidSphere.setEffectsSystem(this.effectsSystem)
    }
    
    // 🔫 Connect sceneManager so VoidSphere can fire bullets!
    voidSphere.setSceneManager(this.sceneManager)
    
    // 🎵 Connect audioManager for CYBERPUNK SFX!
    if (this.audioManager) {
      voidSphere.setAudioManager(this.audioManager)
    }
    
    this.enemies.push(voidSphere)
    this.sceneManager.addToScene(voidSphere.getMesh())
    
    // 🎵 Play spawn sound! 🎵
    if (this.audioManager) {
      this.audioManager.playEnemySpawnSound('VoidSphere')
    }
    
    if (DEBUG_MODE) console.log('🌀 MASSIVE VOID SPHERE SPAWNED! 🌀')
  }

  private spawnCrystalShardSwarm(): void {
    const spawnPos = this.getSpawnPosition()
    const crystalSwarm = new CrystalShardSwarm(spawnPos.x, spawnPos.y)
    crystalSwarm.initialize()
    
    // 🎆 Connect effects system for SUPER JUICY trails and death effects!
    if (this.effectsSystem) {
      crystalSwarm.setEffectsSystem(this.effectsSystem)
    }
    
    // 🔫 Connect sceneManager so crystalSwarm can fire bullets!
    crystalSwarm.setSceneManager(this.sceneManager)
    
    // 🎵 Connect audioManager for crystal sounds!
    if (this.audioManager) {
      crystalSwarm.setAudioManager(this.audioManager)
    }
    
    this.enemies.push(crystalSwarm)
    this.sceneManager.addToScene(crystalSwarm.getMesh())
    
    // 🎵 Play spawn sound! 🎵
    if (this.audioManager) {
      this.audioManager.playEnemySpawnSound('CrystalShardSwarm')
    }
  }

  private spawnBoss(): void {
    const spawnPos = this.getSpawnPosition()
    const boss = new Boss(spawnPos.x, spawnPos.y)
    boss.initialize()
    
    // 🎆 Connect systems for boss!
    if (this.effectsSystem) {
      boss.setEffectsSystem(this.effectsSystem)
    }
    if (this.sceneManager) {
      boss.setSceneManager(this.sceneManager)
    }
    if (this.audioManager) {
      boss.setAudioManager(this.audioManager)
    }
    
    this.enemies.push(boss)
    this.sceneManager.addToScene(boss.getMesh())
    
    // 🎵 Play BOSS entrance sound! 🎵
    if (this.audioManager) {
      this.audioManager.playBossEntranceSound()
    }
    
    if (DEBUG_MODE) console.log('👹 BOSS SPAWNED! 👹')
  }

  // ⚡ FIZZER - Spawns when player achieves high multiplier without taking hits ⚡
  spawnFizzer(): void {
    if (this.fizzersSpawnedThisStreak >= this.maxFizzersPerStreak) {
      return // Don't spawn more than max per streak
    }
    
    const spawnPos = this.getSpawnPosition()
    const fizzer = new Fizzer(spawnPos.x, spawnPos.y)
    fizzer.initialize()
    
    if (this.effectsSystem) {
      fizzer.setEffectsSystem(this.effectsSystem)
    }
    if (this.sceneManager) {
      fizzer.setSceneManager(this.sceneManager)
    }
    if (this.audioManager) {
      fizzer.setAudioManager(this.audioManager)
      this.audioManager.playFizzerSpawnSound()
    }
    
    this.enemies.push(fizzer)
    this.sceneManager.addToScene(fizzer.getMesh())
    this.fizzersSpawnedThisStreak++
    
    if (DEBUG_MODE) console.log('⚡ FIZZER SPAWNED! Total this streak:', this.fizzersSpawnedThisStreak, '⚡')
  }

  // Called when player takes damage - reset Fizzer streak counter
  resetFizzerStreak(): void {
    this.fizzersSpawnedThisStreak = 0
  }

  // 🛸 UFO - Later game enemy with organic movement and laser beams 🛸
  private spawnUFO(): void {
    const spawnPos = this.getSpawnPosition()
    const ufo = new UFO(spawnPos.x, spawnPos.y)
    ufo.initialize()
    
    if (this.effectsSystem) {
      ufo.setEffectsSystem(this.effectsSystem)
    }
    if (this.sceneManager) {
      ufo.setSceneManager(this.sceneManager)
    }
    if (this.audioManager) {
      ufo.setAudioManager(this.audioManager)
      this.audioManager.playEnemySpawnSound('UFO')
    }
    
    this.enemies.push(ufo)
    this.sceneManager.addToScene(ufo.getMesh())
    
    if (DEBUG_MODE) console.log('🛸 UFO SPAWNED! 🛸')
  }

  // 🛸 Check UFO laser hits against player 🛸
  checkUFOLaserHits(player: Player): { hit: boolean, damage: number } {
    for (const enemy of this.enemies) {
      if (enemy instanceof UFO && enemy.isAlive() && enemy.isLaserActive()) {
        if (enemy.checkLaserHit(player)) {
          return { hit: true, damage: enemy.getLaserDamage() }
        }
      }
    }
    return { hit: false, damage: 0 }
  }

  private getSpawnPosition(): THREE.Vector3 {
    // Spawn enemies at random positions around screen edges
    const worldBound = 28 // Just inside the walls
    const side = Math.floor(Math.random() * 4) // 0=top, 1=right, 2=bottom, 3=left
    
    let x: number, y: number
    
    switch (side) {
      case 0: // Top edge
        x = (Math.random() - 0.5) * worldBound * 2
        y = worldBound
        break
      case 1: // Right edge
        x = worldBound
        y = (Math.random() - 0.5) * worldBound * 2
        break
      case 2: // Bottom edge
        x = (Math.random() - 0.5) * worldBound * 2
        y = -worldBound
        break
      case 3: // Left edge
        x = -worldBound
        y = (Math.random() - 0.5) * worldBound * 2
        break
      default:
        x = 0
        y = worldBound
    }
    
    return new THREE.Vector3(x, y, 0)
  }

  private cleanupDeadEnemies(): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i]
      if (!enemy.isAlive()) {
        // 🧹 CLEANUP: Call destroy to clean up projectiles before removing! 🧹
        enemy.destroy()
        this.sceneManager.removeFromScene(enemy.getMesh())
        this.enemies.splice(i, 1)
      }
    }
  }

  removeEnemy(enemy: Enemy): void {
    const index = this.enemies.indexOf(enemy)
    if (index !== -1) {
      this.sceneManager.removeFromScene(enemy.getMesh())
      this.enemies.splice(index, 1)
    }
  }

  getEnemies(): Enemy[] {
    return this.enemies
  }

  getEnemyCount(): number {
    return this.enemies.length
  }

  cleanup(): void {
    // 🧹 CLEANUP: Call destroy to clean up all projectiles before removing! 🧹
    for (const enemy of this.enemies) {
      enemy.destroy()
      this.sceneManager.removeFromScene(enemy.getMesh())
    }
    this.enemies = []
    
    // Reset spawn timers
    this.spawnTimer = 0
    this.scanDroneTimer = 0
    this.chaosWormTimer = 0
    this.voidSphereTimer = 0
    this.crystalSwarmTimer = 0
    this.bossTimer = 0
    this.ufoTimer = 0
    this.fizzersSpawnedThisStreak = 0
  }

  getBossProjectiles(): EnemyProjectile[] {
    const allProjectiles: EnemyProjectile[] = []
    for (const enemy of this.enemies) {
      if (enemy instanceof Boss && enemy.isAlive()) {
        allProjectiles.push(...enemy.getProjectiles())
      }
    }
    return allProjectiles
  }
  
  // 🔫 GET ALL ENEMY PROJECTILES (including ScanDrone + VoidSphere + Fizzer + ChaosWorm death bullets!) 🔫
  getAllEnemyProjectiles(): EnemyProjectile[] {
    const allProjectiles: EnemyProjectile[] = []
    for (const enemy of this.enemies) {
      if (enemy.isAlive()) {
        if (enemy instanceof Boss) {
          allProjectiles.push(...enemy.getProjectiles())
        } else if (enemy instanceof ScanDrone) {
          allProjectiles.push(...enemy.getProjectiles())
        } else if (enemy instanceof VoidSphere) {
          allProjectiles.push(...enemy.getProjectiles())
        } else if (enemy instanceof Fizzer) {
          allProjectiles.push(...enemy.getProjectiles())
        }
      }
      // 💥 CHAOS WORM DEATH BULLETS - Include even when dying! 💥
      if (enemy instanceof ChaosWorm) {
        // Include projectiles even during death animation
        allProjectiles.push(...enemy.getProjectiles())
      }
    }
    return allProjectiles
  }
  
  // 🎆 SET EFFECTS SYSTEM FOR SUPER JUICY EFFECTS! 🎆
  setEffectsSystem(effectsSystem: EffectsSystem): void {
    this.effectsSystem = effectsSystem
  }
}