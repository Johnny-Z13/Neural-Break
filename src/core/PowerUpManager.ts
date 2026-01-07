import { PowerUp } from '../entities/PowerUp'
import { PickupManager } from './PickupManager'
import { BALANCE_CONFIG } from '../config/balance.config'

export class PowerUpManager extends PickupManager<PowerUp> {
  protected readonly SPAWNS_PER_LEVEL = BALANCE_CONFIG.PICKUPS.POWER_UP.SPAWNS_PER_LEVEL
  protected readonly SPAWN_INTERVAL_MIN = BALANCE_CONFIG.PICKUPS.POWER_UP.SPAWN_INTERVAL_MIN
  protected readonly SPAWN_INTERVAL_MAX = BALANCE_CONFIG.PICKUPS.POWER_UP.SPAWN_INTERVAL_MAX

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

