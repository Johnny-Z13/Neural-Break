import { Shield } from '../entities/Shield'
import { PickupManager } from './PickupManager'
import { BALANCE_CONFIG } from '../config/balance.config'

export class ShieldManager extends PickupManager<Shield> {
  protected readonly SPAWNS_PER_LEVEL = BALANCE_CONFIG.PICKUPS.SHIELD.SPAWNS_PER_LEVEL
  protected readonly SPAWN_INTERVAL_MIN = BALANCE_CONFIG.PICKUPS.SHIELD.SPAWN_INTERVAL_MIN
  protected readonly SPAWN_INTERVAL_MAX = BALANCE_CONFIG.PICKUPS.SHIELD.SPAWN_INTERVAL_MAX

  protected createPickup(x: number, y: number): Shield {
    return new Shield(x, y)
  }

  getShields(): Shield[] {
    return this.getPickups()
  }

  removeShield(shield: Shield): void {
    this.removePickup(shield)
  }
}

