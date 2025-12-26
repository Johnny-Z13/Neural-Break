import { MedPack } from '../entities/MedPack'
import { PickupManager } from './PickupManager'
import { ENEMY_CONFIG } from '../config'

export class MedPackManager extends PickupManager<MedPack> {
  protected readonly SPAWNS_PER_LEVEL = ENEMY_CONFIG.MED_PACK.SPAWNS_PER_LEVEL
  protected readonly SPAWN_INTERVAL_MIN = ENEMY_CONFIG.MED_PACK.SPAWN_INTERVAL_MIN
  protected readonly SPAWN_INTERVAL_MAX = ENEMY_CONFIG.MED_PACK.SPAWN_INTERVAL_MAX

  protected createPickup(x: number, y: number): MedPack {
    return new MedPack(x, y)
  }

  protected shouldSpawn(timeSinceLastSpawn: number, randomInterval: number, targetSpawns: number): boolean {
    // Only spawn if player health is below threshold
    const playerHealthPercent = this.player.getHealth() / this.player.getMaxHealth()
    return playerHealthPercent < ENEMY_CONFIG.MED_PACK.HEALTH_THRESHOLD &&
           timeSinceLastSpawn >= randomInterval && 
           this.spawnsThisLevel < targetSpawns
  }

  getMedPacks(): MedPack[] {
    return this.getPickups()
  }

  removeMedPack(medPack: MedPack): void {
    this.removePickup(medPack)
  }
}

