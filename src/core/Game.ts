import * as THREE from 'three'
import { SceneManager } from '../graphics/SceneManager'
import { InputManager } from './InputManager'
import { Player } from '../entities/Player'
import { EnemyManager } from './EnemyManager'
import { WeaponSystem, WeaponType } from '../weapons/WeaponSystem'
import { UIManager } from '../ui/UIManager'
import { GameTimer } from './GameTimer'
import { AudioManager } from '../audio/AudioManager'
import { GameStateType, GameStats, ScoreManager, KILL_POINTS } from './GameState'
import { GameScreens } from '../ui/GameScreens'
import { Enemy, DataMite, ScanDrone, ChaosWorm, VoidSphere, CrystalShardSwarm, Fizzer, UFO, Boss } from '../entities'
import { LevelManager } from './LevelManager'
import { PowerUpManager } from './PowerUpManager'
import { MedPackManager } from './MedPackManager'
import { SpeedUpManager } from './SpeedUpManager'
import { DEBUG_MODE } from '../config'

export class Game {
  private sceneManager: SceneManager
  private inputManager: InputManager
  private player: Player
  private enemyManager: EnemyManager
  private weaponSystem: WeaponSystem
  private powerUpManager: PowerUpManager
  private medPackManager: MedPackManager
  private speedUpManager: SpeedUpManager
  private uiManager: UIManager
  private gameTimer: GameTimer
  private levelManager: LevelManager
  private audioManager: AudioManager
  private isRunning: boolean = false
  private lastTime: number = 0
  
  // 🎮 Game State Management
  private gameState: GameStateType = GameStateType.START_SCREEN
  private gameStats: GameStats = this.createEmptyStats()
  private combo: number = 0
  private comboTimer: number = 0
  private lastDamageTaken: number = 0
  
  // 💀 DEATH ANIMATION STATE 💀
  private isDeathAnimationPlaying: boolean = false
  private deathAnimationTime: number = 0
  private deathAnimationDuration: number = 2.0 // 2 seconds of death animation
  
  // 🎯 ARCADE-STYLE MULTIPLIER SYSTEM! 🎯
  private scoreMultiplier: number = 1
  private multiplierTimer: number = 0
  private multiplierDecayTime: number = 2.0 // Multiplier decays after 2 seconds without kill
  private lastKillTime: number = 0
  private killChainWindow: number = 1.5 // Time window to chain kills for multiplier increase
  private lastMultiplierShown: number = 0 // Prevent spam of multiplier notifications
  
  // Legacy - kept for compatibility
  private recentEnemyDeaths: number[] = []
  private clusterWindow: number = 0.8
  private lastScore: number = 0
  private lastHighScoreMoment: number = 0
  private highScoreMomentCooldown: number = 2.0

  constructor() {
    // Initialize core systems
    this.sceneManager = new SceneManager()
    this.inputManager = new InputManager()
    this.uiManager = new UIManager()
    this.levelManager = new LevelManager()
    this.audioManager = new AudioManager()
    
    // Connect audio manager to UI screens
    GameScreens.setAudioManager(this.audioManager)
    
    // Connect scene manager for transitions
    GameScreens.setSceneManager(this.sceneManager)
    
    // Initialize game entities
    this.player = new Player()
    this.enemyManager = new EnemyManager()
    this.weaponSystem = new WeaponSystem()
    this.powerUpManager = new PowerUpManager()
    this.medPackManager = new MedPackManager()
    this.speedUpManager = new SpeedUpManager()
    
    // Timer will be initialized per-level
    this.gameTimer = new GameTimer(30) // Placeholder, will be updated per level
  }

  private createEmptyStats(): GameStats {
    return {
      score: 0,
      survivedTime: 0,
      level: 1,
      enemiesKilled: 0,
      dataMinersKilled: 0,
      scanDronesKilled: 0,
      chaosWormsKilled: 0,
      voidSpheresKilled: 0,
      crystalSwarmsKilled: 0,
      fizzersKilled: 0,
      ufosKilled: 0,
      bossesKilled: 0,
      damageTaken: 0,
      totalXP: 0,
      highestCombo: 0,
      highestMultiplier: 1
    }
  }

  async initialize(): Promise<void> {
    try {
      if (DEBUG_MODE) console.log('🎮 Game initialization started...')
      
      // Show loading screen initially
      const loadingElement = document.getElementById('loading')
      if (loadingElement) {
        loadingElement.style.display = 'block'
      }

      // Initialize all systems
      if (DEBUG_MODE) console.log('📦 Initializing SceneManager...')
      await this.sceneManager.initialize()
      if (DEBUG_MODE) console.log('✅ SceneManager initialized')
      
      if (DEBUG_MODE) console.log('📦 Initializing InputManager...')
      this.inputManager.initialize()
      if (DEBUG_MODE) console.log('✅ InputManager initialized')
      
      if (DEBUG_MODE) console.log('📦 Initializing UIManager...')
      this.uiManager.initialize()
      if (DEBUG_MODE) console.log('✅ UIManager initialized')
      
      if (DEBUG_MODE) console.log('📦 Initializing AudioManager...')
      this.audioManager.initialize()
      if (DEBUG_MODE) console.log('✅ AudioManager initialized')
      
      // Hide loading screen
      if (loadingElement) {
        loadingElement.style.display = 'none'
      }
      
      // Start the game loop immediately so the scene renders
      // (even if game state is START_SCREEN, we still need to render)
      if (DEBUG_MODE) console.log('🚀 Starting game loop...')
      this.start()
      
      // Show start screen
      if (DEBUG_MODE) console.log('📺 Showing start screen...')
      this.showStartScreen()
      
      if (DEBUG_MODE) console.log('✅ Game initialization complete!')
      
    } catch (error) {
      console.error('❌ Failed to initialize game:', error)
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      // Show error to user
      const loadingElement = document.getElementById('loading')
      if (loadingElement) {
        loadingElement.innerHTML = `
          <div style="color: #FF0000; font-size: 18px;">
            ❌ Initialization Error<br/>
            <div style="font-size: 12px; margin-top: 10px;">${error instanceof Error ? error.message : String(error)}</div>
            <div style="font-size: 10px; margin-top: 10px; opacity: 0.7;">Check console for details</div>
          </div>
        `
      }
      throw error
    }
  }

  private showStartScreen(): void {
    this.gameState = GameStateType.START_SCREEN
    // Stop ambient soundscape on start screen
    this.audioManager.stopAmbientSoundscape()
    GameScreens.showStartScreen(() => this.startNewGame())
  }

  private startNewGame(): void {
    if (DEBUG_MODE) console.log('🎮 startNewGame() called')
    
    // COMPLETE CLEANUP FIRST! 🧹
    this.cleanupGameObjects()
    
    // Small delay to ensure cleanup is complete and old game loop has stopped
    setTimeout(() => {
      // Ensure game loop is stopped before starting new game
      this.isRunning = false
      if (DEBUG_MODE) console.log('🎮 Starting initializeNewGame()...')
      this.initializeNewGame()
    }, 100)
  }

  private initializeNewGame(): void {
    if (DEBUG_MODE) console.log('🎮 Starting new game...')
    
    // Reset game state - CRITICAL: Must be PLAYING for updates to work!
    this.gameState = GameStateType.PLAYING
    if (DEBUG_MODE) console.log('✅ Game state set to PLAYING:', this.gameState)
    this.gameStats = this.createEmptyStats()
    this.combo = 0
    this.comboTimer = 0
    this.scoreMultiplier = 1
    this.multiplierTimer = 0
    this.lastKillTime = 0
    this.lastMultiplierShown = 0
    this.recentEnemyDeaths = []
    this.lastScore = 0
    this.lastHighScoreMoment = 0
    
    // Start ambient soundscape
    this.audioManager.startAmbientSoundscape()
    
    // Reset level manager
    this.levelManager.start()
    
    // Reset player
    if (DEBUG_MODE) console.log('👤 Creating player...')
    this.player = new Player()
    if (DEBUG_MODE) console.log('✅ Player object created')
    
    this.player.initialize(this.audioManager)
    if (DEBUG_MODE) console.log('✅ Player initialized')
    
    const playerMesh = this.player.getMesh()
    if (DEBUG_MODE) console.log('🔍 Player mesh retrieved:', playerMesh)
    
    if (!playerMesh) {
      console.error('❌ CRITICAL: Player mesh is null after initialization!')
      console.error('Player object:', this.player)
      console.error('Player position:', this.player.getPosition())
    } else {
      if (DEBUG_MODE) console.log('✅ Player mesh exists:', {
        position: playerMesh.position.clone(),
        visible: playerMesh.visible,
        type: playerMesh.constructor.name,
        children: playerMesh.children.length,
        material: playerMesh.material ? playerMesh.material.constructor.name : 'NO MATERIAL',
        geometry: playerMesh.geometry ? playerMesh.geometry.constructor.name : 'NO GEOMETRY'
      })
      
      // Force visibility
      playerMesh.visible = true
      playerMesh.position.z = 0
      
      if (DEBUG_MODE) console.log('➕ Adding player mesh to scene...')
      this.sceneManager.addToScene(playerMesh)
      if (DEBUG_MODE) console.log('✅ Player mesh added to scene')
      
      // REMOVED TEST ENTITY - It was blocking the view!
      // The test circle was too large and covering everything
    }
    
    // Set camera to follow player immediately - CRITICAL for visibility!
    const playerPos = this.player.getPosition()
    if (DEBUG_MODE) console.log('📷 Setting camera target to player position:', playerPos)
    this.sceneManager.setCameraTarget(playerPos)
    
    // Force camera to update immediately
    const camera = this.sceneManager.getCamera()
    camera.position.set(playerPos.x, playerPos.y, 10)
    camera.lookAt(playerPos.x, playerPos.y, 0)
    if (DEBUG_MODE) console.log('📷 Camera positioned at:', camera.position.clone(), 'looking at:', playerPos)
    
    // Reset weapon system
    this.weaponSystem = new WeaponSystem()
    this.weaponSystem.initialize(this.player, this.sceneManager, this.audioManager)
    
    // 🎆 CONNECT SUPER JUICY EFFECTS SYSTEM! 🎆
    const effectsSystem = this.sceneManager.getEffectsSystem()
    this.weaponSystem.setEffectsSystem(effectsSystem)
    this.player.setEffectsSystem(effectsSystem) // Connect effects system to player for jet VFX
    
    // 🎬 CONNECT ZOOM COMPENSATION - Keep ship visually consistent during dynamic camera zoom! 🎬
    this.player.setZoomCompensationCallback(() => this.sceneManager.getZoomCompensationScale())
    
    // 🎯 SET UP WEAPON TYPE CHANGE CALLBACK 🎯
    this.weaponSystem.setWeaponTypeChangeCallback((weaponType: WeaponType) => {
      this.uiManager.updateWeaponType(weaponType)
    })
    
    // Initialize weapon type display
    this.uiManager.updateWeaponType(this.weaponSystem.getCurrentWeaponType())
    
    // Reset enemy manager
    this.enemyManager = new EnemyManager()
    this.enemyManager.initialize(this.sceneManager, this.player)
    this.enemyManager.setLevelManager(this.levelManager)
    this.enemyManager.setEffectsSystem(effectsSystem)
    this.enemyManager.setAudioManager(this.audioManager)
    
    // Reset power-up manager
    this.powerUpManager = new PowerUpManager()
    this.powerUpManager.initialize(this.sceneManager, this.player)
    this.powerUpManager.setLevelManager(this.levelManager)
    this.powerUpManager.setEffectsSystem(effectsSystem)
    
    // Reset med pack manager
    this.medPackManager = new MedPackManager()
    this.medPackManager.initialize(this.sceneManager, this.player)
    this.medPackManager.setLevelManager(this.levelManager)
    this.medPackManager.setEffectsSystem(effectsSystem)
    
    // Reset speed-up manager
    this.speedUpManager = new SpeedUpManager()
    this.speedUpManager.initialize(this.sceneManager, this.player)
    this.speedUpManager.setLevelManager(this.levelManager)
    this.speedUpManager.setEffectsSystem(effectsSystem)
    
    // Reset player power-up level and speed level
    this.player.resetPowerUpLevel()
    this.player.resetSpeedUpLevel()
    
    // Initialize level-based timer
    this.initializeLevelTimer()
    
    // Initialize health tracking
    this.lastDamageTaken = this.player.getHealth()
    
    if (DEBUG_MODE) {
      console.log(`✅ New game initialized - Level ${this.levelManager.getCurrentLevel()}/10`)
    }
    
    // CRITICAL: Ensure game loop is running!
    if (DEBUG_MODE) console.log('🎮 Checking game loop state. isRunning:', this.isRunning)
    if (!this.isRunning) {
      if (DEBUG_MODE) console.log('🚀 Game loop not running - starting it now!')
      this.start()
    } else {
      if (DEBUG_MODE) console.log('✅ Game loop already running')
    }
    
    // Force an immediate render to ensure everything is visible
    this.render()
    if (DEBUG_MODE) console.log('🎮 Game initialization complete. Game state:', this.gameState)
  }

  private initializeLevelTimer(): void {
    const levelConfig = this.levelManager.getCurrentLevelConfig()
    this.gameTimer = new GameTimer(levelConfig.duration)
    this.gameTimer.start()
  }

  private cleanupGameObjects(): void {
    if (DEBUG_MODE) console.log('🧹 Starting cleanup...')
    
    // Stop the current game loop
    this.stop()
    if (DEBUG_MODE) console.log('✅ Game loop stopped')
    
    // Clean up existing player
    if (this.player?.getMesh()) {
      if (DEBUG_MODE) console.log('🧹 Removing player from scene...')
      this.sceneManager.removeFromScene(this.player.getMesh())
    }
    
    // Clean up all enemies using proper cleanup method
    if (this.enemyManager?.cleanup) {
      this.enemyManager.cleanup()
    }
    
    // Clean up all power-ups
    if (this.powerUpManager?.cleanup) {
      this.powerUpManager.cleanup()
    }
    
    // Clean up all med packs
    if (this.medPackManager?.cleanup) {
      this.medPackManager.cleanup()
    }
    
    // Clean up all speed-ups
    if (this.speedUpManager?.cleanup) {
      this.speedUpManager.cleanup()
    }
    
    // Clean up all projectiles using proper cleanup method
    if (this.weaponSystem?.cleanup) {
      this.weaponSystem.cleanup()
    }
    
    // Reset game loop state (ensure it's stopped)
    this.isRunning = false
    this.lastTime = 0
    
    // Reset combo, multiplier and stats
    this.combo = 0
    this.comboTimer = 0
    this.scoreMultiplier = 1
    this.multiplierTimer = 0
    this.lastKillTime = 0
    this.lastMultiplierShown = 0
    this.lastDamageTaken = 0
    this.recentEnemyDeaths = []
    this.lastScore = 0
    this.lastHighScoreMoment = 0
  }

  start(): void {
    // Prevent multiple game loops
    if (this.isRunning) {
      console.warn('⚠️ Game loop already running, skipping start')
      return
    }
    
    if (!this.sceneManager) {
      console.error('❌ Cannot start game loop: SceneManager not initialized')
      return
    }
    
    console.log('🎮 Starting game loop...')
    this.isRunning = true
    this.lastTime = performance.now()
    
    // Use requestAnimationFrame to start the loop properly
    requestAnimationFrame(() => this.gameLoop())
    console.log('✅ Game loop started with requestAnimationFrame')
  }

  stop(): void {
    this.isRunning = false
  }

  private gameLoop(): void {
    if (!this.isRunning) {
      console.warn('⚠️ Game loop stopped - isRunning is false')
      return
    }

    try {
      const currentTime = performance.now()
      const deltaTime = (currentTime - this.lastTime) / 1000
      this.lastTime = currentTime

      // Clamp deltaTime to prevent huge jumps
      const clampedDeltaTime = Math.min(deltaTime, 0.1)

      // Update all systems
      this.update(clampedDeltaTime)
      this.render()

      // Continue the loop - ALWAYS continue if isRunning is true
      if (this.isRunning) {
        requestAnimationFrame(() => this.gameLoop())
      }
    } catch (error) {
      console.error('❌ Error in game loop:', error)
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      // Try to continue the loop even if there's an error (only if still running)
      if (this.isRunning) {
        requestAnimationFrame(() => this.gameLoop())
      }
    }
  }

  private update(deltaTime: number): void {
    // 💀 Allow updates during death animation 💀
    if (this.isDeathAnimationPlaying) {
      this.updateDeathAnimation(deltaTime)
      return
    }
    
    // Always update scene manager for background animations and effects
    this.sceneManager.update(deltaTime)
    
    // Only update gameplay if playing
    if (this.gameState !== GameStateType.PLAYING) {
      // Still render even if not playing (so we can see the scene)
      if (Math.random() < 0.01) { // Log occasionally to debug
        console.log('⚠️ Game state is NOT PLAYING:', this.gameState, 'Expected:', GameStateType.PLAYING)
      }
      return
    }
    
    // Update level manager
    this.levelManager.update(deltaTime)
    
    // Update game timer
    this.gameTimer.update(deltaTime)
    
    // Update combo timer
    this.comboTimer -= deltaTime
    if (this.comboTimer <= 0) {
      this.combo = 0
    }
    
    // Clean up old enemy death timestamps (older than cluster window)
    const currentTime = this.levelManager.getTotalElapsedTime()
    this.recentEnemyDeaths = this.recentEnemyDeaths.filter(
      deathTime => currentTime - deathTime < this.clusterWindow
    )
    
    // Check for level completion
    if (this.gameTimer.isExpired()) {
      const levelAdvanced = this.levelManager.checkLevelComplete()
      if (levelAdvanced) {
        const newLevel = this.levelManager.getCurrentLevel()
        if (DEBUG_MODE) console.log(`🎯 Level ${newLevel} started!`)
        this.audioManager.playLevelCompleteSound()
        this.uiManager.showLevelUpNotification(newLevel)
        // Reset power-up manager for new level
        this.powerUpManager.resetForNewLevel()
        // Reset med pack manager for new level
        this.medPackManager.resetForNewLevel()
        // Reset speed-up manager for new level
        this.speedUpManager.resetForNewLevel()
        this.initializeLevelTimer()
      } else if (this.levelManager.isGameComplete()) {
        // All levels completed - victory!
        this.gameOver()
        return
      }
    }
    
    // Timer warning (last 10 seconds)
    const timeRemaining = this.gameTimer.getRemainingTime()
    if (timeRemaining > 0 && timeRemaining <= 10 && Math.floor(timeRemaining) !== Math.floor(timeRemaining + deltaTime)) {
      this.audioManager.playTimerWarningSound()
    }
    
    // Check for game over (player death)
    if (this.player && this.player.isDead() && !this.isDeathAnimationPlaying) {
      this.startDeathAnimation()
      return
    }

    // Update player - CRITICAL: Player must exist and be initialized
    if (this.player && this.player.getMesh()) {
      this.player.update(deltaTime, this.inputManager)
      
      // Track damage taken
      const currentHealth = this.player.getHealth()
      if (currentHealth < this.lastDamageTaken) {
        const damage = this.lastDamageTaken - currentHealth
        this.gameStats.damageTaken += damage
        this.combo = 0 // Reset combo on damage
      }
      this.lastDamageTaken = currentHealth
    }
    
    // Update camera to follow player - CRITICAL: Ensure player exists
    if (this.player && this.player.getMesh()) {
      this.sceneManager.setCameraTarget(this.player.getPosition())
    }
    
    // Pass gameplay data for dynamic zoom
    if (this.enemyManager) {
      this.sceneManager.setGameplayData(
        this.enemyManager.getEnemies().length,
        this.combo
      )
    }
    
    // Update enemies (using level manager instead of raw time)
    if (this.enemyManager) {
      this.enemyManager.update(deltaTime, this.levelManager.getTotalElapsedTime())
    }
    
    // Update power-ups
    if (this.powerUpManager) {
      this.powerUpManager.update(deltaTime)
    }
    
    // Update med packs
    if (this.medPackManager) {
      this.medPackManager.update(deltaTime)
    }
    
    // Update speed-ups
    if (this.speedUpManager) {
      this.speedUpManager.update(deltaTime)
    }
    
    // Update weapons
    if (this.weaponSystem && this.enemyManager) {
      this.weaponSystem.update(deltaTime, this.enemyManager.getEnemies(), this.inputManager)
    }
    
    // Check collisions
    this.checkCollisions()
    
    // Update game stats
    this.updateGameStats()
    
    // Update UI
    if (this.uiManager && this.player && this.gameTimer) {
      this.uiManager.update(this.player, this.gameTimer, this.gameStats, this.combo, this.levelManager)
    }
  }

  private updateGameStats(): void {
    if (!this.levelManager || !this.player) {
      return
    }
    
    this.gameStats.survivedTime = this.levelManager.getTotalElapsedTime()
    this.gameStats.level = this.player.getLevel()
    this.gameStats.totalXP = this.calculateTotalXP()
    this.gameStats.highestCombo = Math.max(this.gameStats.highestCombo, this.combo)
    // Score is now tracked directly via kills - don't recalculate
    
    // Detect high scoring moments
    const currentTime = this.levelManager.getTotalElapsedTime()
    
    // 🎯 MULTIPLIER DECAY LOGIC 🎯
    const timeSinceLastKill = currentTime - this.lastKillTime
    if (timeSinceLastKill > this.multiplierDecayTime && this.scoreMultiplier > 1) {
      // Lost the multiplier!
      if (this.scoreMultiplier >= 3) {
        this.uiManager.showMultiplierLost()
      }
      this.scoreMultiplier = 1
    }
    
    // Clean up old enemy death timestamps (for cluster detection)
    this.recentEnemyDeaths = this.recentEnemyDeaths.filter(
      time => currentTime - time < this.clusterWindow
    )
    
    // High score moment triggers based on multiplier
    const isHighScoreMoment = (
      (this.scoreMultiplier >= 5 && currentTime - this.lastHighScoreMoment > this.highScoreMomentCooldown) ||
      (this.combo >= 10 && currentTime - this.lastHighScoreMoment > this.highScoreMomentCooldown)
    )
    
    if (isHighScoreMoment) {
      this.audioManager.playHighScoreMomentSound(this.gameStats.score, this.combo)
      this.lastHighScoreMoment = currentTime
    }
    
    this.lastScore = this.gameStats.score
  }
  
  // 🎯 CONVERT WORLD POSITION TO SCREEN POSITION 🎯
  private worldToScreen(worldPos: THREE.Vector3): { x: number, y: number } {
    const camera = this.sceneManager.getCamera()
    if (!camera) {
      return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    }
    
    const vector = worldPos.clone().project(camera)
    
    return {
      x: (vector.x * 0.5 + 0.5) * window.innerWidth,
      y: (-vector.y * 0.5 + 0.5) * window.innerHeight
    }
  }

  private calculateTotalXP(): number {
    if (!this.player) {
      return 0
    }
    
    // Calculate total XP earned (current XP + XP from previous levels)
    let totalXP = this.player.getXP()
    for (let i = 1; i < this.player.getLevel(); i++) {
      totalXP += Math.floor(15 * Math.pow(1.3, i - 1))
    }
    return totalXP
  }

  private render(): void {
    // Always render, even if game is paused/not playing (so we can see the scene)
    try {
      if (!this.sceneManager) {
        console.error('❌ Cannot render: sceneManager is null')
        return
      }
      this.sceneManager.render()
    } catch (error) {
      console.error('❌ Render error in game loop:', error)
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    }
  }

  private checkCollisions(): void {
    if (!this.player || !this.enemyManager || !this.weaponSystem) {
      return
    }
    
    const playerPosition = this.player.getPosition()
    const enemies = this.enemyManager.getEnemies()
    
    // Check player-enemy collisions (skip if player is invulnerable during dash)
    if (!this.player.isInvulnerableNow()) {
      for (const enemy of enemies) {
        if (enemy.isAlive() && this.player.isCollidingWith(enemy)) {
          this.player.takeDamage(enemy.getDamage())
          this.audioManager.playHitSound() // Play hit sound when player takes damage
          // JUICY screen shake when player takes damage!
          this.sceneManager.addScreenShake(0.5, 0.2)
          enemy.destroy()
          this.enemyManager.removeEnemy(enemy)
          
          // 💀 RESET MULTIPLIER ON DAMAGE! 💀
          if (this.scoreMultiplier >= 3) {
            this.uiManager.showMultiplierLost()
          }
          this.scoreMultiplier = 1
          this.combo = 0
          
          // ⚡ RESET FIZZER STREAK ⚡
          this.enemyManager.resetFizzerStreak()
        }
      }
    }
    
    // Check enemy projectile-player collisions (Boss + ScanDrone bullets!)
    if (!this.player.isInvulnerableNow()) {
      const enemyProjectiles = this.enemyManager.getAllEnemyProjectiles()
      for (const enemyProjectile of enemyProjectiles) {
        if (enemyProjectile.isAlive() && enemyProjectile.isCollidingWith(this.player)) {
          this.player.takeDamage(enemyProjectile.getDamage())
          this.audioManager.playHitSound()
          this.sceneManager.addScreenShake(0.3, 0.15)
          enemyProjectile.destroy()
          
          // 💀 RESET MULTIPLIER ON DAMAGE! 💀
          if (this.scoreMultiplier >= 3) {
            this.uiManager.showMultiplierLost()
          }
          this.scoreMultiplier = 1
          this.combo = 0
          
          // ⚡ RESET FIZZER STREAK ⚡
          this.enemyManager.resetFizzerStreak()
        }
      }
    }
    
    // 🛸 CHECK UFO LASER HITS 🛸
    if (!this.player.isInvulnerableNow()) {
      const laserHit = this.enemyManager.checkUFOLaserHits(this.player)
      if (laserHit.hit) {
        this.player.takeDamage(laserHit.damage)
        this.audioManager.playHitSound()
        this.sceneManager.addScreenShake(0.6, 0.3) // Big shake for laser
        
        // 💀 RESET MULTIPLIER ON DAMAGE! 💀
        if (this.scoreMultiplier >= 3) {
          this.uiManager.showMultiplierLost()
        }
        this.scoreMultiplier = 1
        this.combo = 0
        
        // ⚡ RESET FIZZER STREAK ⚡
        this.enemyManager.resetFizzerStreak()
      }
    }
    
    // Check weapon-enemy collisions
    const projectiles = this.weaponSystem.getProjectiles()
    for (const projectile of projectiles) {
      for (const enemy of enemies) {
        if (enemy.isAlive() && projectile.isCollidingWith(enemy)) {
          enemy.takeDamage(projectile.getDamage())
          projectile.destroy()
          this.weaponSystem.removeProjectile(projectile)
          
          // 📊 Use shouldTrackKill() instead of !isAlive() to handle death animations! 📊
          // ChaosWorm and Boss temporarily set alive=true during death animation,
          // so we need a separate flag to track if the kill has been counted.
          if (enemy.shouldTrackKill()) {
            // Mark as tracked FIRST to prevent double counting
            enemy.markKillTracked()
            
            // Track enemy kills by type
            this.trackEnemyKill(enemy)
            
            // 🎯 ARCADE MULTIPLIER SYSTEM! 🎯
            const currentTime = this.levelManager.getTotalElapsedTime()
            const timeSinceLastKill = currentTime - this.lastKillTime
            const enemyType = enemy.constructor.name
            
            // Check if kill is within chain window
            if (timeSinceLastKill <= this.killChainWindow && this.lastKillTime > 0) {
              // Increase multiplier!
              const oldMultiplier = this.scoreMultiplier
              this.scoreMultiplier = Math.min(this.scoreMultiplier + 1, 15) // Cap at x15
              
              // Show multiplier increase notification (throttled)
              if (this.scoreMultiplier > oldMultiplier && 
                  currentTime - this.lastMultiplierShown > 0.3) {
                this.uiManager.showMultiplierIncrease(this.scoreMultiplier)
                this.lastMultiplierShown = currentTime
              }
              
              // ⚡ SPAWN FIZZER at high multiplier! ⚡
              // Spawns when player reaches x5, x8, x11 multiplier without taking hits
              if ((this.scoreMultiplier === 5 || this.scoreMultiplier === 8 || this.scoreMultiplier === 11)) {
                this.enemyManager.spawnFizzer()
              }
            }
            
            // 🎯 ADD SCORE WITH MULTIPLIER! 🎯
            const basePoints = ScoreManager.getKillPoints(enemyType)
            const totalPoints = basePoints * this.scoreMultiplier
            this.gameStats.score += totalPoints
            
            // Track highest multiplier
            this.gameStats.highestMultiplier = Math.max(
              this.gameStats.highestMultiplier, 
              this.scoreMultiplier
            )
            
            // 🎮 SHOW ARCADE SCORE POPUP! 🎮
            const screenPos = this.worldToScreen(enemy.getPosition())
            this.uiManager.showKillScore(basePoints, this.scoreMultiplier, screenPos.x, screenPos.y)
            
            // Reset multiplier timer (keeps multiplier alive)
            this.multiplierTimer = this.multiplierDecayTime
            this.lastKillTime = currentTime
            
            // Add combo (legacy)
            this.combo++
            this.comboTimer = 3.0
            
            this.player.addXP(enemy.getXPValue())
            
            // Record enemy death time for cluster detection
            this.recentEnemyDeaths.push(currentTime)
            
            // Check for cluster (multiple deaths in short time)
            const clusterSize = this.recentEnemyDeaths.length
            if (clusterSize >= 2) {
              this.audioManager.playMultiplierSound(clusterSize)
            }
            
            // Play enemy-specific death sound
            this.audioManager.playEnemyDeathSound(enemyType)
            
            // 🎨🎵 AUDIO-VISUAL REACTION - Background color shift on enemy death! 🎵🎨
            const audioVisualSystem = this.sceneManager.getAudioVisualSystem()
            const enemyPosition = enemy.getPosition()
            const deathIntensity = 1.0 + (this.scoreMultiplier * 0.1) // More intense with higher multiplier
            audioVisualSystem.onEnemyDeath(enemyType, enemyPosition, deathIntensity)
            
            // Play combo sound if combo is high enough
            if (this.combo >= 2) {
              this.audioManager.playComboSound(this.combo)
              audioVisualSystem.onCombo(this.combo)
            }
            
            // JUICY screen shake when enemy dies!
            this.sceneManager.addScreenShake(0.3, 0.1)
            this.enemyManager.removeEnemy(enemy)
          }
          break
        }
      }
    }
    
    // Check player-power-up collisions
    const powerUps = this.powerUpManager.getPowerUps()
    for (const powerUp of powerUps) {
      if (powerUp.isAlive() && this.player.isCollidingWith(powerUp)) {
        // Check if already at max BEFORE collection
        const wasAtMax = this.player.isAtMaxPowerUp()
        
        // Get power-up level BEFORE collection to verify
        const oldPowerUpLevel = this.player.getPowerUpLevel()
        
        // Collect power-up (this increments the level)
        const wasCollected = this.player.collectPowerUp()
        
        // Get power-up level AFTER collection to ensure accuracy
        const newPowerUpLevel = this.player.getPowerUpLevel()
        
        // Only proceed if power-up was actually collected (level increased)
        if (wasCollected && newPowerUpLevel > oldPowerUpLevel) {
          // Remove the pickup visually only on successful collection
          powerUp.collect()
          this.powerUpManager.removePowerUp(powerUp)
          // 🎯 CYCLE WEAPON TYPE ON POWER-UP COLLECTION! 🎯
          this.weaponSystem.cycleWeaponType()
          const newWeaponType = this.weaponSystem.getCurrentWeaponType()
          
          // Update UI with new weapon type
          this.uiManager.updateWeaponType(newWeaponType)
          
          // Show weapon type change notification
          this.uiManager.showWeaponTypeChangeNotification(newWeaponType)
          
          // Visual feedback
          this.sceneManager.addScreenShake(0.2, 0.1)
          
          // Show notification with the ACTUAL current power-up level
          this.uiManager.showPowerUpCollected(newPowerUpLevel)
          
          // Audio feedback - unique power-up sound
          this.audioManager.playPowerUpCollectSound()
          
          if (DEBUG_MODE) {
            console.log(`💎 Power-Up collected! Level: ${oldPowerUpLevel} → ${newPowerUpLevel}/10 | Weapon: ${newWeaponType.toUpperCase()}`)
          }
        } else if (wasAtMax) {
          // Show "already at max weapons" notification
          this.uiManager.showAlreadyAtMax('weapons')
          // Still play a sound but maybe a different one
          this.audioManager.playPowerUpCollectSound()
        }
      }
    }
    
    // ⚡ Check player-speed-up collisions ⚡
    const speedUps = this.speedUpManager.getSpeedUps()
    for (const speedUp of speedUps) {
      if (speedUp.isAlive() && this.player.isCollidingWith(speedUp)) {
        // Check if already at max BEFORE collection
        const wasAtMax = this.player.isAtMaxSpeed()
        
        // Get speed-up level BEFORE collection
        const oldSpeedLevel = this.player.getSpeedUpLevel()
        
        // Collect speed-up
        const wasCollected = this.player.collectSpeedUp()
        
        // Get speed-up level AFTER collection
        const newSpeedLevel = this.player.getSpeedUpLevel()
        
        if (wasCollected && newSpeedLevel > oldSpeedLevel) {
          // Remove the pickup visually only on successful collection
          speedUp.collect()
          this.speedUpManager.removeSpeedUp(speedUp)
          // Visual feedback
          this.sceneManager.addScreenShake(0.2, 0.1)
          
          // Show notification with speed level
          this.uiManager.showSpeedUpCollected(newSpeedLevel)
          
          // ⚡ Audio feedback - Speed up sound! ⚡
          this.audioManager.playSpeedUpCollectSound()
          
          if (DEBUG_MODE) {
            console.log(`⚡ Speed-Up collected! Level: ${oldSpeedLevel} → ${newSpeedLevel}/10`)
          }
        } else if (wasAtMax) {
          // Show "already at max speed" notification
          this.uiManager.showAlreadyAtMax('speed')
          // Still play a sound
          this.audioManager.playSpeedUpCollectSound()
        }
      }
    }
    
    // 💚 Check player-med pack collisions 💚
    const medPacks = this.medPackManager.getMedPacks()
    for (const medPack of medPacks) {
      if (medPack.isAlive() && this.player.isCollidingWith(medPack)) {
        // Restore health
        const oldHealth = this.player.getHealth()
        this.player.heal(medPack.getHealthRestore())
        const newHealth = this.player.getHealth()
        
        medPack.collect()
        this.medPackManager.removeMedPack(medPack)
        
        // Visual feedback
        this.sceneManager.addScreenShake(0.15, 0.1)
        
        // 💚 Audio feedback - Healing sound! 💚
        this.audioManager.playMedPackCollectSound()
      }
    }
  }

  private trackEnemyKill(enemy: Enemy): void {
    this.gameStats.enemiesKilled++
    
    // Track specific enemy types
    if (enemy instanceof DataMite) {
      this.gameStats.dataMinersKilled++
    } else if (enemy instanceof ScanDrone) {
      this.gameStats.scanDronesKilled++
    } else if (enemy instanceof ChaosWorm) {
      this.gameStats.chaosWormsKilled++
    } else if (enemy instanceof VoidSphere) {
      this.gameStats.voidSpheresKilled++
    } else if (enemy instanceof CrystalShardSwarm) {
      this.gameStats.crystalSwarmsKilled++
    } else if (enemy instanceof Fizzer) {
      this.gameStats.fizzersKilled++
      if (DEBUG_MODE) console.log('⚡ FIZZER DESTROYED! ⚡')
    } else if (enemy instanceof UFO) {
      this.gameStats.ufosKilled++
      if (DEBUG_MODE) console.log('🛸 UFO DESTROYED! 🛸')
    } else if (enemy instanceof Boss) {
      this.gameStats.bossesKilled++
      if (DEBUG_MODE) console.log('👹 BOSS DEFEATED! 👹')
    }
  }

  // 💀 START DEATH ANIMATION 💀
  private startDeathAnimation(): void {
    if (!this.player) {
      return
    }
    
    this.isDeathAnimationPlaying = true
    this.deathAnimationTime = 0
    
    // Play game over sound immediately
    this.audioManager.playGameOverSound()
    
    // Create dramatic death explosion at player position
    const playerPos = this.player.getPosition()
    const effectsSystem = this.sceneManager.getEffectsSystem()
    
    // Multiple explosion layers for dramatic effect
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        effectsSystem.createExplosion(
          playerPos.clone().add(new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            0
          )),
          2.0 + Math.random() * 1.0,
          new THREE.Color().setHSL(0.0, 1.0, 0.5) // Red explosion
        )
      }, i * 100)
    }
    
    // Screen flash (dark red) - 🔴 REDUCED to prevent white-out
    effectsSystem.addScreenFlash(0.2, new THREE.Color().setHSL(0.0, 1.0, 0.35))
    
    // Screen shake
    this.sceneManager.addScreenShake(1.0, 0.5)
    
    // Final stats update
    this.updateGameStats()
  }
  
  // 💀 UPDATE DEATH ANIMATION 💀
  private updateDeathAnimation(deltaTime: number): void {
    this.deathAnimationTime += deltaTime
    
    // Animate player during death
    if (!this.player) {
      return
    }
    
    const playerMesh = this.player.getMesh()
    if (playerMesh) {
      // Fade out
      const material = playerMesh.material as THREE.MeshLambertMaterial
      const fadeProgress = this.deathAnimationTime / this.deathAnimationDuration
      material.opacity = 0.9 * (1 - fadeProgress)
      
      // Scale down and rotate
      const scale = 1 - fadeProgress * 0.5
      playerMesh.scale.setScalar(scale)
      playerMesh.rotation.z += deltaTime * 10 // Spin during death
      
      // Change color to red
      const redAmount = fadeProgress
      material.emissive.setHex(0xFF0000)
      material.emissiveIntensity = redAmount * 2
    }
    
    // Continue updating scene for visual effects
    this.sceneManager.update(deltaTime)
    
    // Check if animation is complete
    if (this.deathAnimationTime >= this.deathAnimationDuration) {
      this.completeDeathAnimation()
    }
  }
  
  // 💀 COMPLETE DEATH ANIMATION AND GO TO GAME OVER 💀
  private completeDeathAnimation(): void {
    this.isDeathAnimationPlaying = false
    this.gameOver()
  }
  
  private gameOver(): void {
    this.stop()
    this.gameState = GameStateType.GAME_OVER
    
    // Stop ambient soundscape
    this.audioManager.stopAmbientSoundscape()
    
    // Final stats update (already done in startDeathAnimation, but ensure it's current)
    this.updateGameStats()
    
    if (DEBUG_MODE) console.log('Game Over! Final Stats:', this.gameStats)
    
    // Show game over screen with stats
    GameScreens.showGameOverScreen(this.gameStats, () => this.showStartScreen()).catch(err => {
      console.error('Error showing game over screen:', err)
    })
  }
}
