import { SceneManager } from '../graphics/SceneManager'
import { InputManager } from './InputManager'
import { Player } from '../entities/Player'
import { EnemyManager } from './EnemyManager'
import { WeaponSystem } from '../weapons/WeaponSystem'
import { UIManager } from '../ui/UIManager'
import { GameTimer } from './GameTimer'
import { AudioManager } from '../audio/AudioManager'

export class Game {
  private sceneManager: SceneManager
  private inputManager: InputManager
  private player: Player
  private enemyManager: EnemyManager
  private weaponSystem: WeaponSystem
  private uiManager: UIManager
  private gameTimer: GameTimer
  private audioManager: AudioManager
  private isRunning: boolean = false
  private lastTime: number = 0

  constructor() {
    // Initialize core systems
    this.sceneManager = new SceneManager()
    this.inputManager = new InputManager()
    this.uiManager = new UIManager()
    this.gameTimer = new GameTimer(30 * 60) // 30 minutes in seconds
    this.audioManager = new AudioManager()
    
    // Initialize game entities
    this.player = new Player()
    this.enemyManager = new EnemyManager()
    this.weaponSystem = new WeaponSystem()
  }

  async initialize(): Promise<void> {
    try {
      // Hide loading screen initially
      const loadingElement = document.getElementById('loading')
      if (loadingElement) {
        loadingElement.style.display = 'block'
      }

      // Initialize all systems
      await this.sceneManager.initialize()
      this.inputManager.initialize()
      this.uiManager.initialize()
      this.audioManager.initialize()
      
      // Add player to scene
      this.player.initialize(this.audioManager)
      this.sceneManager.addToScene(this.player.getMesh())
      
      // Initialize weapon system
      this.weaponSystem.initialize(this.player, this.sceneManager, this.audioManager)
      
      // Initialize enemy manager
      this.enemyManager.initialize(this.sceneManager, this.player)
      
      // Start the game timer
      this.gameTimer.start()
      
      // Hide loading screen
      if (loadingElement) {
        loadingElement.style.display = 'none'
      }
      
      // Start the game loop
      this.start()
      
    } catch (error) {
      console.error('Failed to initialize game:', error)
    }
  }

  start(): void {
    this.isRunning = true
    this.lastTime = performance.now()
    this.gameLoop()
  }

  stop(): void {
    this.isRunning = false
  }

  private gameLoop(): void {
    if (!this.isRunning) return

    const currentTime = performance.now()
    const deltaTime = (currentTime - this.lastTime) / 1000
    this.lastTime = currentTime

    // Update all systems
    this.update(deltaTime)
    this.render()

    // Continue the loop
    requestAnimationFrame(() => this.gameLoop())
  }

  private update(deltaTime: number): void {
    // Update game timer
    this.gameTimer.update(deltaTime)
    
    // Check for game over
    if (this.gameTimer.isExpired() || this.player.isDead()) {
      this.gameOver()
      return
    }

    // Update player
    this.player.update(deltaTime, this.inputManager)
    
    // Update camera to follow player
    this.sceneManager.setCameraTarget(this.player.getPosition())
    this.sceneManager.update(deltaTime)
    
    // Update enemies
    this.enemyManager.update(deltaTime, this.gameTimer.getElapsedTime())
    
    // Update weapons
    this.weaponSystem.update(deltaTime, this.enemyManager.getEnemies(), this.inputManager)
    
    // Check collisions
    this.checkCollisions()
    
    // Update UI
    this.uiManager.update(this.player, this.gameTimer)
  }

  private render(): void {
    this.sceneManager.render()
  }

  private checkCollisions(): void {
    const playerPosition = this.player.getPosition()
    const enemies = this.enemyManager.getEnemies()
    
    // Check player-enemy collisions
    for (const enemy of enemies) {
      if (enemy.isAlive() && this.player.isCollidingWith(enemy)) {
        this.player.takeDamage(enemy.getDamage())
        this.audioManager.playHitSound() // Play hit sound when player takes damage
        enemy.destroy()
        this.enemyManager.removeEnemy(enemy)
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
          
          if (!enemy.isAlive()) {
            this.player.addXP(enemy.getXPValue())
            this.audioManager.playEnemyDeathSound() // Play sound when enemy dies
            this.enemyManager.removeEnemy(enemy)
          }
          break
        }
      }
    }
  }

  private gameOver(): void {
    this.stop()
    console.log('Game Over!')
    // TODO: Show game over screen
  }
}
