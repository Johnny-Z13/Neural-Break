/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎮 GAME MODE CONFIGURATIONS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Central configuration for all game mode settings.
 * Edit this file to adjust mode-specific behavior.
 * 
 * MODES:
 * - ARCADE: Classic objective-based gameplay (centered player, circular boundary)
 * - ROGUE:  Vertical ascent roguelite (player at bottom, side barriers, scrolling)
 * - TEST:   Development mode (arcade with invincibility)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// 🌌 STARFIELD SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export const STARFIELD_CONFIG = {
  /**
   * ARCADE MODE - Subtle ambient drift
   * Stars drift slowly in random directions
   */
  ARCADE: {
    horizontalDriftMin: -0.2,
    horizontalDriftMax: 0.2,
    verticalDriftMin: -0.2,
    verticalDriftMax: 0.2,
    description: 'Subtle ambient drift in all directions'
  },
  
  /**
   * ROGUE MODE - Downward flow (SCRAMBLE-style)
   * Creates illusion of upward movement
   */
  ROGUE: {
    horizontalDriftMin: -0.3,
    horizontalDriftMax: 0.3,
    verticalSpeedMin: -2.5,   // Negative = downward
    verticalSpeedMax: -4.5,   // Faster downward flow
    description: 'Fast downward flow creating upward movement illusion'
  },
  
  /**
   * TEST MODE - Same as Arcade
   */
  TEST: {
    horizontalDriftMin: -0.2,
    horizontalDriftMax: 0.2,
    verticalDriftMin: -0.2,
    verticalDriftMax: 0.2,
    description: 'Same as Arcade mode'
  }
} as const

// ═══════════════════════════════════════════════════════════════════════════
// 📷 CAMERA SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export const CAMERA_CONFIG = {
  /**
   * ARCADE MODE - Centered player
   */
  ARCADE: {
    verticalOffset: 0,        // Player centered on screen
    followSmoothing: 5.0,     // Camera lerp speed
    description: 'Player centered on screen'
  },
  
  /**
   * ROGUE MODE - Bullet hell style (player at bottom)
   */
  ROGUE: {
    verticalOffset: 12,       // Camera 12 units above player (player at bottom)
    followSmoothing: 8.0,     // Faster camera response
    scrollSpeed: 3.0,         // Constant upward scroll (units/sec)
    description: 'Player at bottom of screen, bullet-hell style'
  },
  
  /**
   * TEST MODE - Same as Arcade
   */
  TEST: {
    verticalOffset: 0,
    followSmoothing: 5.0,
    description: 'Same as Arcade mode'
  }
} as const

// ═══════════════════════════════════════════════════════════════════════════
// 🚧 BOUNDARY SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export const BOUNDARY_CONFIG = {
  /**
   * ARCADE MODE - Circular arena
   */
  ARCADE: {
    type: 'circular' as const,
    radius: 29.5,             // Circular boundary radius
    description: 'Circular energy barrier arena'
  },
  
  /**
   * ROGUE MODE - Vertical corridor with side walls
   */
  ROGUE: {
    type: 'corridor' as const,
    widthMultiplier: 0.8,     // 80% of screen width
    description: 'Vertical corridor with side barriers'
  },
  
  /**
   * TEST MODE - Same as Arcade
   */
  TEST: {
    type: 'circular' as const,
    radius: 29.5,
    description: 'Same as Arcade mode'
  }
} as const

// ═══════════════════════════════════════════════════════════════════════════
// 👾 ENEMY SPAWN SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export const ENEMY_SPAWN_CONFIG = {
  /**
   * ARCADE MODE - Spawn around circular edge
   */
  ARCADE: {
    mode: 'circular' as const,
    spawnRadius: 31.5,        // Just outside boundary
    description: 'Enemies spawn around circular boundary edge'
  },
  
  /**
   * ROGUE MODE - Spawn above player (SCRAMBLE-style)
   */
  ROGUE: {
    mode: 'vertical' as const,
    spawnHeightMin: 20,       // Minimum units above player
    spawnHeightVariance: 5,   // Additional random height
    horizontalSpread: 20,     // Horizontal spawn spread
    description: 'Enemies spawn above player, descending'
  },
  
  /**
   * TEST MODE - Same as Arcade
   */
  TEST: {
    mode: 'circular' as const,
    spawnRadius: 31.5,
    description: 'Same as Arcade mode'
  }
} as const

// ═══════════════════════════════════════════════════════════════════════════
// 🎁 PICKUP SPAWN SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export const PICKUP_SPAWN_CONFIG = {
  /**
   * ARCADE MODE - Random within arena
   */
  ARCADE: {
    mode: 'circular' as const,
    spawnRadius: 28,          // Within boundary
    minDistanceFromPlayer: 5,
    description: 'Pickups spawn randomly within arena'
  },
  
  /**
   * ROGUE MODE - Spawn above player in corridor
   */
  ROGUE: {
    mode: 'vertical' as const,
    spawnHeightMin: 8,        // Minimum units above player
    spawnHeightMax: 18,       // Maximum units above player
    safeMargin: 2,            // Distance from side barriers
    description: 'Pickups spawn above player within corridor'
  },
  
  /**
   * TEST MODE - Same as Arcade
   */
  TEST: {
    mode: 'circular' as const,
    spawnRadius: 28,
    minDistanceFromPlayer: 5,
    description: 'Same as Arcade mode'
  }
} as const

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 LEVEL/PROGRESSION SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export const PROGRESSION_CONFIG = {
  /**
   * ARCADE MODE - Objective-based levels
   */
  ARCADE: {
    usesObjectives: true,     // Kill X enemies to advance
    usesLevelProgression: true,
    startingLevel: 1,
    levelLabel: 'Level',
    description: 'Complete objectives to advance levels'
  },
  
  /**
   * ROGUE MODE - Wormhole exit layers
   */
  ROGUE: {
    usesObjectives: false,    // No kill objectives
    usesLevelProgression: false,
    startingLevel: 998,       // Special Rogue level ID
    levelLabel: 'Layer',
    wormholeDistance: 180,    // Units to wormhole exit (~60 seconds at 3 units/sec)
    hasSpecialChoices: true,  // Power-up choices between layers
    description: 'Reach wormhole exit to advance layers'
  },
  
  /**
   * TEST MODE - Same as Arcade but invincible
   */
  TEST: {
    usesObjectives: true,
    usesLevelProgression: true,
    startingLevel: 1,
    levelLabel: 'Level',
    playerInvincible: true,
    description: 'Arcade mode with invincibility for testing'
  }
} as const

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 VISUAL SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export const VISUAL_MODE_CONFIG = {
  /**
   * ARCADE MODE
   */
  ARCADE: {
    showCircularBoundary: true,
    showSideBarriers: false,
    showWormholeExit: false,
    backgroundColor: '#000011',
    description: 'Classic arcade visuals'
  },
  
  /**
   * ROGUE MODE
   */
  ROGUE: {
    showCircularBoundary: false,
    showSideBarriers: true,
    showWormholeExit: true,
    backgroundColor: '#000008',  // Slightly darker for more contrast
    description: 'Vertical shooter visuals'
  },
  
  /**
   * TEST MODE
   */
  TEST: {
    showCircularBoundary: true,
    showSideBarriers: false,
    showWormholeExit: false,
    backgroundColor: '#000011',
    description: 'Same as Arcade mode'
  }
} as const
