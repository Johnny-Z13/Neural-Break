/**
 * 🎨 POST-PROCESSING SETTINGS STORAGE 🎨
 *
 * Manages persistent storage of post-processing configuration
 *
 * SIMPLIFIED ARCHITECTURE:
 * - OptionsScreen.postProcessRendering = master ON/OFF switch
 * - This config = individual effect settings (when rendering is ON)
 */

const POST_PROCESS_SETTINGS_KEY = 'neural-break-postprocess-settings'

export interface PostProcessConfig {
  // Individual effect toggles and parameters
  bloom: {
    enabled: boolean
    intensity: number
    threshold: number
    smoothing: number
  }
  chromaticAberration: {
    enabled: boolean
    intensity: number
  }
  vignette: {
    enabled: boolean
    offset: number
    darkness: number
  }
  scanlines: {
    enabled: boolean
    density: number // How many lines (higher = more lines)
  }
  glitch: {
    enabled: boolean // Whether glitch CAN trigger on damage
  }
}

// Default settings - performant cyberpunk aesthetic
export const DEFAULT_POST_PROCESS_CONFIG: PostProcessConfig = {
  bloom: {
    enabled: true, // Neon glow - essential for cyberpunk look
    intensity: 0.5,
    threshold: 0.8,
    smoothing: 0.3
  },
  chromaticAberration: {
    enabled: false, // OFF by default - subtle effect, can enable if wanted
    intensity: 0.001
  },
  vignette: {
    enabled: true, // Focus attention to center
    offset: 0.4,
    darkness: 0.35
  },
  scanlines: {
    enabled: true, // CRT arcade monitor look - ON by default
    density: 1.5 // Subtle but visible
  },
  glitch: {
    enabled: true // Damage effect - ON by default
  }
}

export class PostProcessSettings {
  /**
   * Load post-processing settings from localStorage
   */
  static load(): PostProcessConfig {
    try {
      const saved = localStorage.getItem(POST_PROCESS_SETTINGS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Merge with defaults to ensure all properties exist
        return {
          bloom: { ...DEFAULT_POST_PROCESS_CONFIG.bloom, ...parsed.bloom },
          chromaticAberration: { ...DEFAULT_POST_PROCESS_CONFIG.chromaticAberration, ...parsed.chromaticAberration },
          vignette: { ...DEFAULT_POST_PROCESS_CONFIG.vignette, ...parsed.vignette },
          scanlines: { ...DEFAULT_POST_PROCESS_CONFIG.scanlines, ...parsed.scanlines },
          glitch: { ...DEFAULT_POST_PROCESS_CONFIG.glitch, ...parsed.glitch }
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not load post-processing settings:', e)
    }
    return { ...DEFAULT_POST_PROCESS_CONFIG }
  }

  /**
   * Save post-processing settings to localStorage
   */
  static save(config: PostProcessConfig): void {
    try {
      localStorage.setItem(POST_PROCESS_SETTINGS_KEY, JSON.stringify(config))
      console.log('💾 Post-processing settings saved')
    } catch (e) {
      console.warn('⚠️ Could not save post-processing settings:', e)
    }
  }

  /**
   * Reset to defaults
   */
  static reset(): PostProcessConfig {
    const defaults = { ...DEFAULT_POST_PROCESS_CONFIG }
    PostProcessSettings.save(defaults)
    return defaults
  }

  /**
   * Check if debug controls should be shown
   */
  static isDebugControlsEnabled(): boolean {
    try {
      const value = localStorage.getItem('neural-break-postprocess-debug')
      return value === 'true'
    } catch (e) {
      return false
    }
  }

  /**
   * Enable/disable debug controls
   */
  static setDebugControlsEnabled(enabled: boolean): void {
    try {
      localStorage.setItem('neural-break-postprocess-debug', enabled ? 'true' : 'false')
    } catch (e) {
      console.warn('⚠️ Could not save debug controls setting:', e)
    }
  }
}
