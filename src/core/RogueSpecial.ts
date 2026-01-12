/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎲 ROGUE MODE - SPECIAL MUTATIONS CONFIGURATION 🎲
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This file defines ALL the power-ups (Specials) available in Rogue mode.
 * 
 * ⚙️ BALANCING GUIDE:
 * - Stat multipliers are multiplicative and STACK across layers
 * - Example: Two +20% fire rate upgrades = 1.2 × 1.2 = 1.44 (44% total)
 * - Shield capacity is additive (each +1 adds one shield)
 * - Firing modes are boolean flags that enable additional shot patterns
 * - Behavioural mutations change game rules (not yet fully implemented)
 * 
 * 📊 RECOMMENDED BALANCE VALUES:
 * - Movement Speed: 1.10 to 1.25 (+10% to +25%)
 * - Fire Rate: 1.10 to 1.25 (+10% to +25%)
 * - Projectile Speed: 1.15 to 1.30 (+15% to +30%)
 * - Heat Decay: 1.20 to 1.40 (+20% to +40%)
 * - Combo Decay: 0.70 to 0.85 (30% to 15% slower decay)
 * - Shield Capacity: +1 or +2 per upgrade
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

export enum SpecialType {
  STAT = 'stat',
  FIRING_MODE = 'firing_mode',
  BEHAVIOURAL = 'behavioural'
}

export interface RogueSpecial {
  id: string
  name: string
  description: string
  type: SpecialType
  icon?: string
  
  // Stat mutations (multiplicative, except shieldCapacity which is additive)
  statModifier?: {
    movementSpeed?: number      // Multiplier (e.g., 1.15 = +15% speed)
    fireRate?: number            // Multiplier (e.g., 1.20 = +20% fire rate)
    shieldCapacity?: number      // Additive (e.g., 1 = +1 shield)
    heatDecay?: number           // Multiplier (e.g., 1.25 = 25% faster cooling)
    comboDecay?: number          // Multiplier (e.g., 0.75 = 25% slower decay)
    projectileSpeed?: number     // Multiplier (e.g., 1.20 = +20% projectile speed)
  }
  
  // Firing mode mutations (boolean flags)
  firingMode?: {
    sideFire?: boolean           // Fire at ±90° angles
    rearFire?: boolean           // Fire backward
    spiralShot?: boolean         // Rotational projectile offset
    burstPulse?: boolean         // Rhythmic wave firing
    chargeShot?: boolean         // Hold to release (not yet implemented)
  }
  
  // Behavioural mutations (game rule changes - not yet fully implemented)
  behavioural?: {
    enemiesSplitOnDeath?: boolean
    killsSlowTime?: boolean
    nearMissChargesDamage?: boolean
    movingIncreasesFireRate?: boolean
    comboAffectsAggression?: boolean
    enemiesTakeMoreDamageWhileMoving?: boolean
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📦 SPECIAL POOL - All available power-ups
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Add/remove/modify specials here to balance the game.
 * Each special should have a unique ID.
 */
export const ROGUE_SPECIALS: RogueSpecial[] = [
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 🏃 MOVEMENT SPEED UPGRADES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'speed_boost_small',
    name: 'NEURAL ACCELERATION',
    description: '+15% Movement Speed',
    type: SpecialType.STAT,
    statModifier: { movementSpeed: 1.15 }
  },
  {
    id: 'speed_boost_medium',
    name: 'HYPER VELOCITY',
    description: '+20% Movement Speed',
    type: SpecialType.STAT,
    statModifier: { movementSpeed: 1.20 }
  },
  {
    id: 'speed_boost_large',
    name: 'QUANTUM DASH',
    description: '+25% Movement Speed',
    type: SpecialType.STAT,
    statModifier: { movementSpeed: 1.25 }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 🔫 FIRE RATE UPGRADES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'fire_rate_small',
    name: 'RAPID FIRE',
    description: '+15% Fire Rate',
    type: SpecialType.STAT,
    statModifier: { fireRate: 1.15 }
  },
  {
    id: 'fire_rate_medium',
    name: 'SUSTAINED BARRAGE',
    description: '+20% Fire Rate',
    type: SpecialType.STAT,
    statModifier: { fireRate: 1.20 }
  },
  {
    id: 'fire_rate_large',
    name: 'BULLET STORM',
    description: '+25% Fire Rate',
    type: SpecialType.STAT,
    statModifier: { fireRate: 1.25 }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 🛡️ SHIELD CAPACITY UPGRADES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'shield_capacity_1',
    name: 'FORCE MULTIPLIER',
    description: '+1 Shield Capacity',
    type: SpecialType.STAT,
    statModifier: { shieldCapacity: 1 }
  },
  {
    id: 'shield_capacity_2',
    name: 'REINFORCED HULL',
    description: '+2 Shield Capacity',
    type: SpecialType.STAT,
    statModifier: { shieldCapacity: 2 }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 🌡️ HEAT MANAGEMENT UPGRADES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'heat_decay_small',
    name: 'COOLING SYSTEM',
    description: '+25% Faster Heat Decay',
    type: SpecialType.STAT,
    statModifier: { heatDecay: 1.25 }
  },
  {
    id: 'heat_decay_large',
    name: 'CRYO CORE',
    description: '+40% Faster Heat Decay',
    type: SpecialType.STAT,
    statModifier: { heatDecay: 1.40 }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 COMBO SYSTEM UPGRADES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'combo_decay_small',
    name: 'MOMENTUM',
    description: 'Combo Decays 25% Slower',
    type: SpecialType.STAT,
    statModifier: { comboDecay: 0.75 }
  },
  {
    id: 'combo_decay_large',
    name: 'FLOW STATE',
    description: 'Combo Decays 40% Slower',
    type: SpecialType.STAT,
    statModifier: { comboDecay: 0.60 }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 🚀 PROJECTILE SPEED UPGRADES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'projectile_speed_small',
    name: 'HYPERVELOCITY ROUNDS',
    description: '+20% Projectile Speed',
    type: SpecialType.STAT,
    statModifier: { projectileSpeed: 1.20 }
  },
  {
    id: 'projectile_speed_large',
    name: 'RAILGUN ACCELERATOR',
    description: '+30% Projectile Speed',
    type: SpecialType.STAT,
    statModifier: { projectileSpeed: 1.30 }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 🔥 FIRING MODE MUTATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'side_fire',
    name: 'BROADSIDE CANNONS',
    description: 'Fire at ±90° angles',
    type: SpecialType.FIRING_MODE,
    firingMode: { sideFire: true }
  },
  {
    id: 'rear_fire',
    name: 'REAR GUARD',
    description: 'Enable backward firing',
    type: SpecialType.FIRING_MODE,
    firingMode: { rearFire: true }
  },
  {
    id: 'spiral_shot',
    name: 'SPIRAL STRIKE',
    description: 'Rotational projectile offset',
    type: SpecialType.FIRING_MODE,
    firingMode: { spiralShot: true }
  },
  {
    id: 'burst_pulse',
    name: 'PULSE WAVE',
    description: 'Rhythmic wave firing pattern',
    type: SpecialType.FIRING_MODE,
    firingMode: { burstPulse: true }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 🧬 BEHAVIOURAL MUTATIONS (Not yet fully implemented)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'enemy_split',
    name: 'FRAGMENTATION',
    description: 'Enemies split into micro-units on death',
    type: SpecialType.BEHAVIOURAL,
    behavioural: { enemiesSplitOnDeath: true }
  },
  {
    id: 'kill_slow',
    name: 'TEMPORAL RIFT',
    description: 'Kills briefly slow time',
    type: SpecialType.BEHAVIOURAL,
    behavioural: { killsSlowTime: true }
  },
  {
    id: 'near_miss',
    name: 'DANGER ZONE',
    description: 'Near-miss bullets charge bonus damage',
    type: SpecialType.BEHAVIOURAL,
    behavioural: { nearMissChargesDamage: true }
  },
  {
    id: 'movement_fire',
    name: 'MOMENTUM FIRE',
    description: 'Moving increases fire rate; stopping reduces it',
    type: SpecialType.BEHAVIOURAL,
    behavioural: { movingIncreasesFireRate: true }
  },
  {
    id: 'combo_aggression',
    name: 'FEEDBACK LOOP',
    description: 'Combo multiplier affects enemy aggression',
    type: SpecialType.BEHAVIOURAL,
    behavioural: { comboAffectsAggression: true }
  },
  {
    id: 'moving_damage',
    name: 'KINETIC VULNERABILITY',
    description: 'Enemies take more damage while moving',
    type: SpecialType.BEHAVIOURAL,
    behavioural: { enemiesTakeMoreDamageWhileMoving: true }
  }
]

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎲 HELPER FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Get N random specials from the pool (no duplicates in a single draw)
 * @param count Number of specials to return (default: 3)
 * @param excludeIds Set of special IDs to exclude (prevents offering already-selected specials)
 */
export function getRandomSpecials(count: number = 3, excludeIds: Set<string> = new Set()): RogueSpecial[] {
  // Filter out already-selected specials
  const available = ROGUE_SPECIALS.filter(special => !excludeIds.has(special.id))
  
  // If we've exhausted all specials, allow repeats but log a warning
  if (available.length === 0) {
    console.warn('⚠️ All specials have been selected! Allowing repeats.')
    return getRandomSpecials(count, new Set()) // Get from full pool
  }
  
  // Shuffle and return
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, available.length))
}

/**
 * Get a specific special by ID (useful for testing)
 */
export function getSpecialById(id: string): RogueSpecial | undefined {
  return ROGUE_SPECIALS.find(special => special.id === id)
}

/**
 * Get all specials of a specific type
 */
export function getSpecialsByType(type: SpecialType): RogueSpecial[] {
  return ROGUE_SPECIALS.filter(special => special.type === type)
}
