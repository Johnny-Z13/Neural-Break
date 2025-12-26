/**
 * Game configuration constants
 */

export const GAME_CONFIG = {
  // World bounds
  WORLD_SIZE: 60,
  WORLD_BOUND: 29, // Just inside walls (60/2 - 1)
  
  // Player settings
  PLAYER: {
    BASE_SPEED: 6.25, // Increased 25% from original 5
    BASE_HEALTH: 100,
    MAX_POWER_UP_LEVEL: 10,
    MAX_SPEED_LEVEL: 10,
    SPEED_BOOST_PER_LEVEL: 0.15, // 15% per level
    DASH_SPEED: 30,
    DASH_DURATION: 0.4,
    DASH_COOLDOWN: 3.0,
  },
  
  // Weapon settings
  WEAPON: {
    BASE_FIRE_RATE: 0.2,
    BASE_DAMAGE: 2,
    BASE_PROJECTILE_SPEED: 15,
    BASE_RANGE: 15,
  },
  
  // Combo system
  COMBO: {
    TIMER_DURATION: 3.0, // seconds
    CLUSTER_WINDOW: 0.8, // seconds for cluster detection
  },
  
  // Death animation
  DEATH_ANIMATION: {
    DURATION: 2.0, // seconds
  },
  
  // High score moments
  HIGH_SCORE: {
    COOLDOWN: 2.0, // seconds between high score moments
    MIN_SCORE_INCREASE: 500,
    MIN_COMBO: 10,
  },
} as const

