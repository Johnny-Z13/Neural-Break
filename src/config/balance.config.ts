/**
 * ═══════════════════════════════════════════════════════════════════
 * NEURAL BREAK - MASTER BALANCE CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════
 * 
 * This file contains ALL gameplay balance values in one place.
 * Edit these values to tune game difficulty and feel.
 * 
 * 📝 USAGE:
 * - All values are organized by system (Player, Enemies, Weapons, etc.)
 * - Each enemy type has its own section
 * - Comments explain what each value does
 * - Changes here automatically affect the entire game
 * 
 * ⚖️ BALANCE PHILOSOPHY:
 * - Easy to learn, hard to master
 * - Fast-paced arcade action
 * - Risk/reward choices
 * - Escalating difficulty through levels
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

export const BALANCE_CONFIG = {
  // ═══════════════════════════════════════════════════════════════════
  // PLAYER CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════
  PLAYER: {
    // Core Stats
    BASE_SPEED: 6.25,              // Movement speed (units/sec)
    BASE_HEALTH: 100,              // Starting health
    MAX_HEALTH: 100,               // Maximum health
    
    // Dash Ability
    DASH_SPEED: 30,                // Speed during dash
    DASH_DURATION: 0.4,            // How long dash lasts (seconds)
    DASH_COOLDOWN: 3.0,            // Time between dashes (seconds)
    DASH_INVULNERABLE: true,       // Invincible during dash?
    
    // Power-Up System
    MAX_POWER_UP_LEVEL: 10,        // Max weapon power level
    POWER_UP_DAMAGE_MULTIPLIER: 0.5, // Damage increase per level (50%)
    
    // Speed System
    MAX_SPEED_LEVEL: 20,           // Max speed boost level
    SPEED_BOOST_PER_LEVEL: 0.05,   // Speed increase per level (5%)
    
    // Invulnerability Pickup
    INVULNERABLE_DURATION: 5.0,    // How long invulnerability lasts (seconds)
    
    // Shield Pickup
    SHIELD_ABSORBS_ONE_HIT: true,  // Does shield block 1 hit or all damage?
  },

  // ═══════════════════════════════════════════════════════════════════
  // WEAPON SYSTEM
  // ═══════════════════════════════════════════════════════════════════
  WEAPONS: {
    // Base Weapon Stats (Level 0)
    BASE_DAMAGE: 10,               // Base bullet damage
    BASE_FIRE_RATE: 0.15,          // Time between shots (seconds)
    BASE_PROJECTILE_SPEED: 20,     // Bullet speed (units/sec)
    BASE_RANGE: 35,                // Max bullet distance
    
    // Heat System
    HEAT_ENABLED: true,            // Enable weapon overheating?
    HEAT_PER_SHOT: 1,              // Heat added per shot
    HEAT_COOLDOWN_RATE: 75,        // Heat removed per second
    HEAT_MAX: 100,                 // Max heat before overheat
    OVERHEAT_COOLDOWN: 1.0,        // Forced cooldown time (seconds)
    
    // Weapon Types
    BULLETS: {
      DAMAGE_MULTIPLIER: 1.0,      // Standard damage
      FIRE_RATE_MULTIPLIER: 1.0,   // Standard fire rate
      HEAT_MULTIPLIER: 1.0,        // Standard heat
    },
    LASERS: {
      DAMAGE_MULTIPLIER: 1.5,      // 50% more damage
      FIRE_RATE_MULTIPLIER: 0.7,   // 30% slower fire rate
      HEAT_MULTIPLIER: 1.3,        // 30% more heat
    },
    PHOTONS: {
      DAMAGE_MULTIPLIER: 0.8,      // 20% less damage
      FIRE_RATE_MULTIPLIER: 1.5,   // 50% faster fire rate
      HEAT_MULTIPLIER: 0.8,        // 20% less heat
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // ENEMY: DATA MITE (Basic small enemy)
  // ═══════════════════════════════════════════════════════════════════
  DATA_MITE: {
    HEALTH: 1,                     // Dies in 1 hit
    SPEED: 2.0,                    // Movement speed
    DAMAGE: 10,                    // Collision damage to player
    XP_VALUE: 1,                   // XP awarded on kill
    RADIUS: 0.42,                  // Collision radius
    DEATH_DAMAGE: 0,               // No death explosion
    DEATH_RADIUS: 0,               // No area damage
  },

  // ═══════════════════════════════════════════════════════════════════
  // ENEMY: SCAN DRONE (Ranged attacker)
  // ═══════════════════════════════════════════════════════════════════
  SCAN_DRONE: {
    HEALTH: 4,                     // Takes a few hits
    SPEED: 1.5,                    // Moderate speed
    DAMAGE: 15,                    // Collision damage
    XP_VALUE: 5,                   // Better reward
    RADIUS: 1.1,                   // Medium size
    
    // Shooting Behavior
    FIRE_RATE: 2.0,                // Time between shots (seconds)
    BULLET_SPEED: 8.0,             // Projectile speed
    BULLET_DAMAGE: 15,             // Bullet damage
    DETECTION_RANGE: 15,           // Aggro range
    PATROL_RANGE: 8,               // Patrol radius
    
    DEATH_DAMAGE: 0,               // No death explosion
    DEATH_RADIUS: 0,
  },

  // ═══════════════════════════════════════════════════════════════════
  // ENEMY: FIZZER (Fast agile enemy)
  // ═══════════════════════════════════════════════════════════════════
  FIZZER: {
    HEALTH: 3,                     // Low health
    SPEED: 8.0,                    // VERY FAST!
    DAMAGE: 10,                    // Collision damage
    XP_VALUE: 15,                  // Good reward for difficulty
    RADIUS: 0.35,                  // Small = hard to hit
    
    // Shooting Behavior (Burst fire)
    FIRE_RATE: 2.5,                // Time between bursts
    BURST_COUNT: 3,                // Shots per burst
    BURST_DELAY: 0.15,             // Time between burst shots
    BULLET_SPEED: 12.0,            // Fast bullets
    BULLET_DAMAGE: 8,              // Lower individual damage
    
    DEATH_DAMAGE: 15,              // Electric explosion!
    DEATH_RADIUS: 2.0,             // Small explosion radius
  },

  // ═══════════════════════════════════════════════════════════════════
  // ENEMY: UFO (Hit-and-run attacker)
  // ═══════════════════════════════════════════════════════════════════
  UFO: {
    HEALTH: 40,                    // Sturdy craft
    SPEED: 3.5,                    // Fast movement
    DAMAGE: 20,                    // Collision damage
    XP_VALUE: 25,                  // Good reward
    RADIUS: 1.2,                   // Medium size
    
    // Shooting Behavior
    FIRE_RATE: 1.5,                // Time between shots
    BULLET_SPEED: 10.0,            // Projectile speed
    BULLET_DAMAGE: 20,             // Bullet damage
    
    DEATH_DAMAGE: 25,              // Alien tech explosion
    DEATH_RADIUS: 3.0,             // Medium explosion
  },

  // ═══════════════════════════════════════════════════════════════════
  // ENEMY: CHAOS WORM (Segmented boss)
  // ═══════════════════════════════════════════════════════════════════
  CHAOS_WORM: {
    HEALTH: 150,                   // MASSIVE health pool
    SPEED: 2.0,                    // Moderate speed
    DAMAGE: 25,                    // High collision damage
    XP_VALUE: 35,                  // Big reward
    RADIUS: 2.5,                   // Large hitbox
    SEGMENT_COUNT: 12,             // Number of body segments
    
    // Death Animation
    DEATH_DURATION: 2.0,           // How long death takes (seconds)
    BULLETS_PER_SEGMENT: 6,        // Death bullets per segment
    DEATH_BULLET_SPEED: 8,         // Death bullet speed
    DEATH_BULLET_DAMAGE: 15,       // Death bullet damage
    FINAL_NOVA_BULLETS: 16,        // Final burst bullet count
  },

  // ═══════════════════════════════════════════════════════════════════
  // ENEMY: VOID SPHERE (Tank)
  // ═══════════════════════════════════════════════════════════════════
  VOID_SPHERE: {
    HEALTH: 250,                   // HUGE health pool
    SPEED: 0.6,                    // Slow but deadly
    DAMAGE: 50,                    // DEVASTATING collision
    XP_VALUE: 50,                  // Massive reward
    RADIUS: 3.2,                   // Huge hitbox (4x normal)
    
    // Shooting Behavior (Burst)
    FIRE_RATE: 3.0,                // Time between bursts
    BURST_COUNT: 5,                // Shots per burst
    BURST_DELAY: 0.2,              // Time between burst shots
    BULLET_SPEED: 6.0,             // Slow heavy bullets
    BULLET_DAMAGE: 25,             // High damage per bullet
    
    DEATH_DAMAGE: 50,              // MASSIVE implosion
    DEATH_RADIUS: 8.0,             // Huge explosion radius
  },

  // ═══════════════════════════════════════════════════════════════════
  // ENEMY: CRYSTAL SHARD SWARM (Orbital attacker)
  // ═══════════════════════════════════════════════════════════════════
  CRYSTAL_SWARM: {
    HEALTH: 120,                   // High health
    SPEED: 1.8,                    // Fast
    DAMAGE: 40,                    // High collision damage
    XP_VALUE: 45,                  // Big reward
    RADIUS: 4.5,                   // Large orbital radius
    SHARD_COUNT: 6,                // Number of orbiting shards
    ORBIT_SPEED: 1.5,              // Rotation speed
    
    // Shooting Behavior (Burst from shards)
    FIRE_RATE: 2.5,                // Time between bursts
    BURST_COUNT: 3,                // Shots per burst
    BURST_DELAY: 0.15,             // Time between burst shots
    BULLET_SPEED: 10.0,            // Projectile speed
    BULLET_DAMAGE: 15,             // Damage per bullet
    SHARDS_THAT_FIRE: 2,           // How many shards fire at once
    
    DEATH_DAMAGE: 30,              // Crystal explosion
    DEATH_RADIUS: 5.0,             // Large explosion
  },

  // ═══════════════════════════════════════════════════════════════════
  // ENEMY: BOSS (Level boss)
  // ═══════════════════════════════════════════════════════════════════
  BOSS: {
    HEALTH: 250,                   // Boss health
    SPEED: 0.4,                    // Slow but menacing
    DAMAGE: 40,                    // High collision damage
    XP_VALUE: 100,                 // Huge reward
    RADIUS: 4.0,                   // Large ship
    
    // Shooting Behavior (Multi-phase)
    PHASE_1_FIRE_RATE: 1.0,        // Aggressive firing
    PHASE_2_FIRE_RATE: 0.8,        // Faster when damaged
    PHASE_3_FIRE_RATE: 99,         // No firing (ring phase)
    BULLET_SPEED: 8.0,             // Projectile speed
    BULLET_DAMAGE: 25,             // High damage
    
    // Phase Thresholds
    PHASE_2_HEALTH_PCT: 0.66,      // Enter phase 2 at 66% health
    PHASE_3_HEALTH_PCT: 0.33,      // Enter phase 3 at 33% health
    
    // Boss Ring Attack (Phase 3)
    RING_DURATION: 3.0,            // How long ring lasts
    RING_EXPANSION_SPEED: 2.0,     // Ring growth rate
    RING_DAMAGE: 30,               // Damage from touching ring
    
    DEATH_DAMAGE: 75,              // Massive explosion
    DEATH_RADIUS: 12.0,            // Huge explosion radius
  },

  // ═══════════════════════════════════════════════════════════════════
  // PICKUP CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════
  PICKUPS: {
    // Power-Up (Weapon boost)
    POWER_UP: {
      SPAWNS_PER_LEVEL: 3,         // How many spawn per level
      SPAWN_INTERVAL_MIN: 10,      // Min time between spawns (seconds)
      SPAWN_INTERVAL_MAX: 15,      // Max time between spawns
    },
    
    // Speed-Up (Movement boost)
    SPEED_UP: {
      SPAWNS_PER_LEVEL: 2,
      SPAWN_INTERVAL_MIN: 15,
      SPAWN_INTERVAL_MAX: 25,
    },
    
    // Med Pack (Health restore)
    MED_PACK: {
      SPAWNS_PER_LEVEL: 2,
      SPAWN_INTERVAL_MIN: 20,
      SPAWN_INTERVAL_MAX: 30,
      HEALTH_THRESHOLD: 0.8,       // Only spawn if player < 80% health
      HEAL_AMOUNT: 30,             // Health restored
    },
    
    // Shield (One-hit protection)
    SHIELD: {
      SPAWNS_PER_LEVEL: 2,
      SPAWN_INTERVAL_MIN: 20,
      SPAWN_INTERVAL_MAX: 30,
    },
    
    // Invulnerable (Rare god mode)
    INVULNERABLE: {
      SPAWNS_PER_LEVEL: 1,         // Rare spawn
      SPAWN_INTERVAL_MIN: 60,      // Only once per minute minimum
      SPAWN_INTERVAL_MAX: 90,
    },
    
    // Magnetism (All pickups)
    MAGNET_RADIUS: 4.0,            // Distance at which pickup moves to player
    MAGNET_STRENGTH: 12.0,         // Attraction force
    MAX_MAGNET_SPEED: 18.0,        // Max speed when being pulled
  },

  // ═══════════════════════════════════════════════════════════════════
  // SCORING SYSTEM
  // ═══════════════════════════════════════════════════════════════════
  SCORING: {
    // Base Points
    BASE_KILL_POINTS: 100,         // Points per enemy kill
    
    // Multiplier System
    COMBO_TIMER: 3.0,              // Time to maintain combo (seconds)
    KILL_CHAIN_WINDOW: 1.5,        // Time window for multiplier increase
    MULTIPLIER_DECAY_TIME: 2.0,    // Time before multiplier decays
    MAX_MULTIPLIER: 10,            // Maximum score multiplier
    
    // Bonus Points
    LEVEL_COMPLETE_BONUS: 1000,    // Bonus for completing a level
    BOSS_KILL_MULTIPLIER: 2.0,     // Boss kills worth 2x points
    PERFECT_LEVEL_BONUS: 500,      // Bonus for no damage taken
  },

  // ═══════════════════════════════════════════════════════════════════
  // LEVEL PROGRESSION
  // ═══════════════════════════════════════════════════════════════════
  LEVELS: {
    TOTAL_LEVELS: 10,              // Number of levels
    
    // Difficulty Scaling (per level)
    ENEMY_HEALTH_SCALE: 1.1,       // 10% more health per level
    ENEMY_SPEED_SCALE: 1.05,       // 5% faster per level
    ENEMY_DAMAGE_SCALE: 1.1,       // 10% more damage per level
    SPAWN_RATE_SCALE: 0.9,         // 10% faster spawns per level
    
    // Level Duration
    LEVEL_DURATION: 120,           // Seconds per level (2 minutes)
    BOSS_APPEARS_AT: 100,          // Boss spawns at this time (seconds)
  },

  // ═══════════════════════════════════════════════════════════════════
  // WORLD SETTINGS
  // ═══════════════════════════════════════════════════════════════════
  WORLD: {
    SIZE: 60,                      // World diameter
    BOUNDARY_RADIUS: 29,           // Playable area radius
    BOUNDARY_DAMAGE: 10,           // Damage per second outside boundary
    SPAWN_BOUNDARY: 28,            // Enemy spawn radius
    PICKUP_SPAWN_BOUNDARY: 25,     // Pickup spawn radius
    MIN_PLAYER_DISTANCE: 5,        // Min distance from player for spawns
  },

  // ═══════════════════════════════════════════════════════════════════
  // VISUAL & AUDIO FEEDBACK
  // ═══════════════════════════════════════════════════════════════════
  FEEDBACK: {
    // Screen Shake
    SMALL_SHAKE: { intensity: 0.2, duration: 0.1 },
    MEDIUM_SHAKE: { intensity: 0.5, duration: 0.3 },
    LARGE_SHAKE: { intensity: 1.0, duration: 0.5 },
    
    // Camera Zoom
    MIN_ZOOM: 24,                  // Zoomed in (intense action)
    MAX_ZOOM: 45,                  // Zoomed out (many enemies)
    ZOOM_SPEED: 3.0,               // How fast zoom changes
    
    // Particle Effects
    PARTICLE_DENSITY: 1.0,         // Multiplier for particle count (1.0 = normal)
    TRAIL_ENABLED: true,           // Enemy trails on/off
    EXPLOSION_SCALE: 1.0,          // Explosion size multiplier
  },
} as const

// ═══════════════════════════════════════════════════════════════════
// HELPER: Get scaled value for current level
// ═══════════════════════════════════════════════════════════════════
export function getScaledValue(baseValue: number, level: number, scalePerLevel: number): number {
  return baseValue * Math.pow(scalePerLevel, level - 1)
}

// ═══════════════════════════════════════════════════════════════════
// HELPER: Get enemy stats for current level
// ═══════════════════════════════════════════════════════════════════
export function getEnemyStatsForLevel(enemyType: keyof typeof BALANCE_CONFIG, level: number): any {
  const baseStats = BALANCE_CONFIG[enemyType]
  if (!baseStats || typeof baseStats !== 'object') {
    return baseStats
  }
  
  const scaledStats: any = { ...baseStats }
  
  // Scale health, speed, damage for current level
  if ('HEALTH' in scaledStats && typeof scaledStats.HEALTH === 'number') {
    scaledStats.HEALTH = Math.ceil(getScaledValue(
      scaledStats.HEALTH as number,
      level,
      BALANCE_CONFIG.LEVELS.ENEMY_HEALTH_SCALE
    ))
  }
  
  if ('SPEED' in scaledStats && typeof scaledStats.SPEED === 'number') {
    scaledStats.SPEED = getScaledValue(
      scaledStats.SPEED as number,
      level,
      BALANCE_CONFIG.LEVELS.ENEMY_SPEED_SCALE
    )
  }
  
  if ('DAMAGE' in scaledStats && typeof scaledStats.DAMAGE === 'number') {
    scaledStats.DAMAGE = Math.ceil(getScaledValue(
      scaledStats.DAMAGE as number,
      level,
      BALANCE_CONFIG.LEVELS.ENEMY_DAMAGE_SCALE
    ))
  }
  
  return scaledStats
}

