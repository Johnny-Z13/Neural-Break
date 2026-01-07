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
  
  // 🎯 SPAWNING CONTROL (for transitions)
  private spawningPaused: boolean = false
  
  // 🔷 SPATIAL GRID FOR COLLISION DETECTION 🔷
  private spatialGrid: Map<string, Enemy[]> = new Map()
  private gridCellSize: number = 4.0 // Cell size for spatial partitioning
  private separationForce: number = 8.0 // Force multiplier for separation
  private separationRadius: number = 2.5 // Distance at which separation starts

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
    // Skip spawning if paused (during transitions)
    if (!this.spawningPaused) {
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

    // 🛸 Spawn UFO - Uses levelConfig spawn rate (no more hardcoded magic numbers!)
    if (levelConfig.ufoSpawnRate !== Infinity && this.ufoTimer >= levelConfig.ufoSpawnRate) {
      this.spawnUFO()
      this.ufoTimer = 0
    }
    } // End of spawning pause check

    // Update all enemies (AI first)
    for (const enemy of this.enemies) {
      if (enemy.isAlive()) {
        enemy.update(deltaTime, this.player)
      }
    }

    // Resolve enemy-enemy collisions using spatial grid
    this.resolveEnemyCollisions(deltaTime)

    // Remove dead enemies
    this.cleanupDeadEnemies()
  }
  
  // 🔷 SPATIAL GRID UTILITIES 🔷
  private getGridKey(x: number, y: number): string {
    const gridX = Math.floor(x / this.gridCellSize)
    const gridY = Math.floor(y / this.gridCellSize)
    return `${gridX},${gridY}`
  }
  
  private populateSpatialGrid(): void {
    this.spatialGrid.clear()
    
    for (const enemy of this.enemies) {
      if (!enemy.isAlive()) continue
      
      const pos = enemy.getPosition()
      const key = this.getGridKey(pos.x, pos.y)
      
      if (!this.spatialGrid.has(key)) {
        this.spatialGrid.set(key, [])
      }
      this.spatialGrid.get(key)!.push(enemy)
    }
  }
  
  private getNeighborsInRadius(enemy: Enemy, radius: number): Enemy[] {
    const neighbors: Enemy[] = []
    const pos = enemy.getPosition()
    const searchRadius = Math.ceil(radius / this.gridCellSize)
    
    const centerKey = this.getGridKey(pos.x, pos.y)
    const [centerX, centerY] = centerKey.split(',').map(Number)
    
    // Check surrounding grid cells
    for (let dx = -searchRadius; dx <= searchRadius; dx++) {
      for (let dy = -searchRadius; dy <= searchRadius; dy++) {
        const key = `${centerX + dx},${centerY + dy}`
        const cellEnemies = this.spatialGrid.get(key)
        
        if (cellEnemies) {
          for (const other of cellEnemies) {
            if (other !== enemy && other.isAlive()) {
              const distance = pos.distanceTo(other.getPosition())
              if (distance <= radius) {
                neighbors.push(other)
              }
            }
          }
        }
      }
    }
    
    return neighbors
  }
  
  // 🔷 SEPARATION LOGIC - Soft collision resolution 🔷
  private resolveEnemyCollisions(deltaTime: number): void {
    // Only process if we have enemies
    if (this.enemies.length < 2) return
    
    // Populate spatial grid for efficient neighbor lookup
    this.populateSpatialGrid()
    
    // Apply separation forces to all enemies
    for (const enemy of this.enemies) {
      if (!enemy.isAlive()) continue
      
      const neighbors = this.getNeighborsInRadius(enemy, this.separationRadius)
      
      if (neighbors.length === 0) continue
      
      // Calculate separation force
      const separation = new THREE.Vector3(0, 0, 0)
      const pos = enemy.getPosition()
      
      for (const neighbor of neighbors) {
        const neighborPos = neighbor.getPosition()
        const direction = pos.clone().sub(neighborPos)
        const distance = direction.length()
        
        if (distance < 0.01) {
          // Avoid division by zero - add random offset
          direction.set(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            0
          ).normalize()
        } else {
          direction.normalize()
        }
        
        // Inverse distance weighting - closer enemies push harder
        const overlap = Math.max(0, enemy.getRadius() + neighbor.getRadius() - distance)
        const force = overlap / (enemy.getRadius() + neighbor.getRadius())
        
        separation.add(direction.multiplyScalar(force))
      }
      
      // Apply separation force to velocity (soft, arcade-friendly)
      if (separation.length() > 0.01) {
        separation.normalize()
        
        // Blend separation with existing velocity (85% original, 15% separation)
        // This keeps the arcade feel while preventing stacking
        const currentVel = enemy.getVelocity()
        const separationStrength = Math.min(1.0, separation.length() * 2.0) // Clamp separation strength
        const blendedVel = currentVel.clone().multiplyScalar(0.85)
          .add(separation.multiplyScalar(this.separationForce * separationStrength * 0.15))
        
        // Preserve speed magnitude to maintain arcade feel
        const originalSpeed = currentVel.length()
        if (originalSpeed > 0.01) {
          blendedVel.normalize().multiplyScalar(originalSpeed)
        }
        
        enemy.setVelocity(blendedVel)
      }
    }
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
      
      // Connect audio manager for hit sounds
      if (this.audioManager) {
        mite.setAudioManager(this.audioManager)
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
    
    // 🔊 Connect audio manager for hit sounds!
    if (this.audioManager) {
      drone.setAudioManager(this.audioManager)
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
    
    // 🔊 Connect audio manager for hit sounds!
    if (this.audioManager) {
      worm.setAudioManager(this.audioManager)
    }
    
    // 🎵 Connect audioManager for death sequence sounds!
    if (this.audioManager) {
      worm.setAudioManager(this.audioManager)
    }
    
    // 💥 Connect sceneManager for death projectiles!
    worm.setSceneManager(this.sceneManager)
    
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
    
    // 🔊 Connect audio manager for hit sounds!
    if (this.audioManager) {
      voidSphere.setAudioManager(this.audioManager)
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
    
    // 🔊 Connect audio manager for hit sounds!
    if (this.audioManager) {
      crystalSwarm.setAudioManager(this.audioManager)
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
    
    // 🔊 Connect audio manager for hit sounds!
    if (this.audioManager) {
      boss.setAudioManager(this.audioManager)
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
    
    // 🔊 Connect audio manager for hit sounds!
    if (this.audioManager) {
      fizzer.setAudioManager(this.audioManager)
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
    
    // 🔊 Connect audio manager for hit sounds!
    if (this.audioManager) {
      ufo.setAudioManager(this.audioManager)
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
    // 🔘 CIRCULAR SPAWN LOGIC 🔘
    // Spawn enemies at random positions around the circular edge
    const boundaryRadius = 29.5
    const angle = Math.random() * Math.PI * 2
    
    const x = Math.cos(angle) * (boundaryRadius + 2) // Spawn slightly outside
    const y = Math.sin(angle) * (boundaryRadius + 2)
    
    return new THREE.Vector3(x, y, 0)
  }

  private cleanupDeadEnemies(): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i]
      if (!enemy.isAlive()) {
        // 💥 CHAIN REACTION - Apply death damage to nearby enemies! 💥
        this.applyDeathDamageToNearby(enemy)
        
        // 🧹 CLEANUP: Call destroy to clean up projectiles before removing! 🧹
        enemy.destroy()
        this.sceneManager.removeFromScene(enemy.getMesh())
        this.enemies.splice(i, 1)
      }
    }
  }
  
  // 💥 CHAIN REACTION SYSTEM - Enemies damage nearby enemies when they die! 💥
  private applyDeathDamageToNearby(dyingEnemy: Enemy): void {
    const dyingPos = dyingEnemy.getPosition()
    const damageRadius = dyingEnemy.getDeathDamageRadius()
    const damageAmount = dyingEnemy.getDeathDamageAmount()
    
    // Check all other alive enemies
    for (const enemy of this.enemies) {
      if (enemy === dyingEnemy || !enemy.isAlive()) continue
      
      const enemyPos = enemy.getPosition()
      const distance = dyingPos.distanceTo(enemyPos)
      
      // If within damage radius, apply damage
      if (distance <= damageRadius) {
        // Apply damage with falloff based on distance
        const damageMultiplier = 1.0 - (distance / damageRadius) * 0.5 // 50-100% damage based on distance
        const finalDamage = Math.floor(damageAmount * damageMultiplier)
        
        if (DEBUG_MODE) {
          console.log(`💥 Chain damage: ${finalDamage} to ${enemy.constructor.name} at distance ${distance.toFixed(2)}`)
        }
        
        enemy.takeDamage(finalDamage)
        
        // Visual feedback - small explosion/shockwave effect
        if (this.effectsSystem) {
          const chainColor = new THREE.Color(0xFF8800) // Orange for chain damage
          this.effectsSystem.createExplosion(enemyPos, 0.8, chainColor)
          
          // Add a few sparkles
          for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2
            const velocity = new THREE.Vector3(
              Math.cos(angle) * 1.5,
              Math.sin(angle) * 1.5,
              (Math.random() - 0.5) * 0.5
            )
            this.effectsSystem.createSparkle(enemyPos, velocity, chainColor, 0.3)
          }
        }
      }
    }
  }
  
  // 💥 CHAOS WORM SEGMENT DEATH DAMAGE - Called for each exploding segment! 💥
  applySegmentDeathDamage(segmentPos: THREE.Vector3, damageRadius: number, damageAmount: number): void {
    // Check all alive enemies
    for (const enemy of this.enemies) {
      if (!enemy.isAlive()) continue
      
      const enemyPos = enemy.getPosition()
      const distance = segmentPos.distanceTo(enemyPos)
      
      // If within damage radius, apply damage
      if (distance <= damageRadius) {
        // Apply damage with falloff based on distance
        const damageMultiplier = 1.0 - (distance / damageRadius) * 0.5 // 50-100% damage based on distance
        const finalDamage = Math.floor(damageAmount * damageMultiplier)
        
        if (DEBUG_MODE) {
          console.log(`🐛 Worm segment chain damage: ${finalDamage} to ${enemy.constructor.name} at distance ${distance.toFixed(2)}`)
        }
        
        enemy.takeDamage(finalDamage)
        
        // Visual feedback - rainbow-colored explosion for worm segments
        if (this.effectsSystem) {
          const hue = Math.random() // Random rainbow color
          const chainColor = new THREE.Color().setHSL(hue, 1.0, 0.6)
          this.effectsSystem.createExplosion(enemyPos, 0.8, chainColor)
          
          // Add a few sparkles
          for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2
            const velocity = new THREE.Vector3(
              Math.cos(angle) * 1.5,
              Math.sin(angle) * 1.5,
              (Math.random() - 0.5) * 0.5
            )
            this.effectsSystem.createSparkle(enemyPos, velocity, chainColor, 0.3)
          }
        }
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

  clearAllEnemies(): void {
    // 💥 Clear all enemies immediately (for level transitions)
    for (const enemy of this.enemies) {
      enemy.destroy()
      this.sceneManager.removeFromScene(enemy.getMesh())
    }
    this.enemies = []
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
  
  // 🔫 GET ALL ENEMY PROJECTILES (including ScanDrone + VoidSphere + Fizzer + ChaosWorm!) 🔫
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
        } else if (enemy instanceof ChaosWorm) {
          allProjectiles.push(...enemy.getProjectiles())
        }
      } else {
        // 🔴 Include Fizzer + ChaosWorm projectiles even after death - let them finish trajectory! 🔴
        if (enemy instanceof Fizzer) {
          allProjectiles.push(...enemy.getProjectiles())
        } else if (enemy instanceof ChaosWorm) {
          allProjectiles.push(...enemy.getProjectiles())
        }
      }
    }
    return allProjectiles
  }
  
  // 🎆 SET EFFECTS SYSTEM FOR SUPER JUICY EFFECTS! 🎆
  setEffectsSystem(effectsSystem: EffectsSystem): void {
    this.effectsSystem = effectsSystem
  }

  // 🎯 SPAWNING CONTROL (for level transitions)
  pauseSpawning(): void {
    this.spawningPaused = true
    if (DEBUG_MODE) console.log('⏸️ Enemy spawning paused')
  }

  resumeSpawning(): void {
    this.spawningPaused = false
    if (DEBUG_MODE) console.log('▶️ Enemy spawning resumed')
  }
}