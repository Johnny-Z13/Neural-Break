import { PowerUp } from '../entities/PowerUp'
import { PickupManager } from './PickupManager'
import { ENEMY_CONFIG } from '../config'

export class PowerUpManager extends PickupManager<PowerUp> {
  protected readonly SPAWNS_PER_LEVEL = ENEMY_CONFIG.POWER_UP.SPAWNS_PER_LEVEL
  protected readonly SPAWN_INTERVAL_MIN = ENEMY_CONFIG.POWER_UP.SPAWN_INTERVAL_MIN
  protected readonly SPAWN_INTERVAL_MAX = ENEMY_CONFIG.POWER_UP.SPAWN_INTERVAL_MAX

  protected createPickup(x: number, y: number): PowerUp {
    return new PowerUp(x, y)
  }

  getPowerUps(): PowerUp[] {
    return this.getPickups()
  }

  removePowerUp(powerUp: PowerUp): void {
    this.removePickup(powerUp)
  }
}

