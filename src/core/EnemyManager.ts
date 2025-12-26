import * as THREE from 'three'
import { Enemy, DataMite, ScanDrone } from '../entities/Enemy'
import { Player } from '../entities/Player'
import { SceneManager } from '../graphics/SceneManager'

export class EnemyManager {
  private enemies: Enemy[] = []
  private sceneManager: SceneManager
  private player: Player
  private spawnTimer: number = 0
  private scanDroneTimer: number = 0

  initialize(sceneManager: SceneManager, player: Player): void {
    this.sceneManager = sceneManager
    this.player = player
  }

  update(deltaTime: number, gameTime: number): void {
    // Update spawn timers
    this.spawnTimer += deltaTime
    this.scanDroneTimer += deltaTime

    // Spawn Data Mites
    const miteSpawnRate = this.getMiteSpawnRate(gameTime)
    if (this.spawnTimer >= miteSpawnRate) {
      this.spawnDataMite()
      this.spawnTimer = 0
    }

    // Spawn Scan Drones
    const droneSpawnRate = this.getDroneSpawnRate(gameTime)
    if (this.scanDroneTimer >= droneSpawnRate) {
      this.spawnScanDrone()
      this.scanDroneTimer = 0
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

  private getMiteSpawnRate(gameTime: number): number {
    // Spawn Data Mites every 3 seconds
    return 3.0
  }

  private getDroneSpawnRate(gameTime: number): number {
    // 1 every 10 seconds, increasing to every 6 seconds
    const minutes = gameTime / 60
    const baseRate = 10
    const scalingFactor = Math.min(minutes / 8, 1)
    return baseRate * (1 - scalingFactor * 0.4) // 10s to 6s
  }

  private spawnDataMite(): void {
    const spawnPos = this.getSpawnPosition()
    const mite = new DataMite(spawnPos.x, spawnPos.y)
    mite.initialize()
    
    this.enemies.push(mite)
    this.sceneManager.addToScene(mite.getMesh())
  }

  private spawnScanDrone(): void {
    const spawnPos = this.getSpawnPosition()
    const drone = new ScanDrone(spawnPos.x, spawnPos.y)
    drone.initialize()
    
    this.enemies.push(drone)
    this.sceneManager.addToScene(drone.getMesh())
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
}
