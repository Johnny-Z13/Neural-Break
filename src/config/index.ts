/**
 * Centralized configuration module
 * All game configuration constants and flags
 */

export const DEBUG_MODE = true // TEMPORARILY ENABLED FOR DEBUGGING

// Re-export all config modules
export * from './game.config'
export * from './enemy.config'
export * from './visual.config'
export * from './balance.config'
export * from './modes.config'  // Game mode-specific settings (Arcade, Rogue, Test)

