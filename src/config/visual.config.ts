/**
 * Visual effects configuration constants
 */

export const VISUAL_CONFIG = {
  // Camera settings
  CAMERA: {
    BASE_FRUSTUM_SIZE: 22,
    MIN_ZOOM: 16.5,
    MAX_ZOOM: 38.5,
    ZOOM_LERP_SPEED: 3.0,
    CAMERA_LERP_SPEED: 5.0,
  },
  
  // Screen effects
  SCREEN: {
    SHAKE_DECAY: 0.9,
  },
  
  // Background particles
  BACKGROUND: {
    PARTICLE_COUNT: 500,
  },
  
  // Neural pathways
  NEURAL_PATHWAYS: {
    LINE_COUNT: 30,
  },
} as const

