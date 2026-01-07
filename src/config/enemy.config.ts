/**
 * Enemy configuration constants
 */

export const ENEMY_CONFIG = {
  // Spawn position bounds
  SPAWN_WORLD_BOUND: 28, // Just inside the walls
  
  // Pickup spawn settings
  PICKUP: {
    WORLD_BOUND: 25,
    MIN_DISTANCE_FROM_PLAYER: 5,
    SPAWN_ATTEMPTS: 20,
  },
  
  // Power-up spawn settings
  POWER_UP: {
    SPAWNS_PER_LEVEL: 3,
    SPAWN_INTERVAL_MIN: 10, // seconds
    SPAWN_INTERVAL_MAX: 15, // seconds
  },
  
  // Med pack spawn settings
  MED_PACK: {
    SPAWNS_PER_LEVEL: 2,
    SPAWN_INTERVAL_MIN: 20, // seconds
    SPAWN_INTERVAL_MAX: 30, // seconds
    HEALTH_THRESHOLD: 0.8, // Only spawn if player health < 80%
  },
  
  // Speed-up spawn settings
  SPEED_UP: {
    SPAWNS_PER_LEVEL: 2,
    SPAWN_INTERVAL_MIN: 15, // seconds
    SPAWN_INTERVAL_MAX: 25, // seconds
  },
  
  // Shield spawn settings
  SHIELD: {
    SPAWNS_PER_LEVEL: 2,
    SPAWN_INTERVAL_MIN: 20, // seconds
    SPAWN_INTERVAL_MAX: 30, // seconds
  },
} as const

