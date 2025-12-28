import { Shield } from '../entities/Shield'
import { PickupManager } from './PickupManager'
import { ENEMY_CONFIG } from '../config'

export class ShieldManager extends PickupManager<Shield> {
  protected readonly SPAWNS_PER_LEVEL = ENEMY_CONFIG.SHIELD?.SPAWNS_PER_LEVEL || 2
  protected readonly SPAWN_INTERVAL_MIN = ENEMY_CONFIG.SHIELD?.SPAWN_INTERVAL_MIN || 15
  protected readonly SPAWN_INTERVAL_MAX = ENEMY_CONFIG.SHIELD?.SPAWN_INTERVAL_MAX || 25

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

