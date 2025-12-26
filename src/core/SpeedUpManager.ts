import { SpeedUp } from '../entities/SpeedUp'
import { PickupManager } from './PickupManager'
import { ENEMY_CONFIG } from '../config'

export class SpeedUpManager extends PickupManager<SpeedUp> {
  protected readonly SPAWNS_PER_LEVEL = ENEMY_CONFIG.SPEED_UP.SPAWNS_PER_LEVEL
  protected readonly SPAWN_INTERVAL_MIN = ENEMY_CONFIG.SPEED_UP.SPAWN_INTERVAL_MIN
  protected readonly SPAWN_INTERVAL_MAX = ENEMY_CONFIG.SPEED_UP.SPAWN_INTERVAL_MAX

  protected createPickup(x: number, y: number): SpeedUp {
    return new SpeedUp(x, y)
  }

  getSpeedUps(): SpeedUp[] {
    return this.getPickups()
  }

  removeSpeedUp(speedUp: SpeedUp): void {
    this.removePickup(speedUp)
  }
}


