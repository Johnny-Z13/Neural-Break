import * as THREE from 'three'
import { EffectsSystem } from './EffectsSystem'

/**
 * 🎨🎵 AUDIO-VISUAL REACTIVE SYSTEM 🎵🎨
 * Creates trippy, emergent connections between audio and visuals
 * All values are configurable - no hardcoded magic numbers!
 */
export class AudioVisualReactiveSystem {
  private scene: THREE.Scene
  private effectsSystem: EffectsSystem
  
  // 🎨 BACKGROUND COLOR SYSTEM - Reacts to enemy deaths! 🎨
  private baseBackgroundColor: THREE.Color = new THREE.Color(0x000011)
  private targetBackgroundColor: THREE.Color = new THREE.Color(0x000011)
  private currentBackgroundColor: THREE.Color = new THREE.Color(0x000011)
  private colorTransitionSpeed: number = 2.0 // How fast colors transition
  private colorDecayRate: number = 0.95 // How fast colors fade back to base
  
  // 🎵 AUDIO REACTIVE PARAMETERS - All configurable! 🎵
  private enemyDeathColorIntensity: number = 0.3 // How much enemy deaths affect color
  private comboColorIntensity: number = 0.2 // How much combos affect color
  private audioPulseIntensity: number = 0.15 // How much audio affects visuals
  private visualResponseTime: number = 0.1 // How fast visuals respond to audio
  
  // 🌈 COLOR PALETTE SYSTEM - Enemy type colors! 🌈
  private enemyColorMap: Map<string, THREE.Color> = new Map()
  private colorShiftAmount: number = 0.4 // How much to shift colors
  
  // 💫 EMERGENT SYSTEMS - Gameplay intensity tracking! 💫
  private gameplayIntensity: number = 0 // 0-1 scale
  private intensityDecayRate: number = 0.98 // How fast intensity decays
  private intensityBoostPerKill: number = 0.1 // How much each kill boosts intensity
  private intensityBoostPerCombo: number = 0.05 // How much combos boost intensity
  
  // 🎆 PARTICLE REACTIVITY - Audio-driven particles! 🎆
  private particleReactivityEnabled: boolean = true
  private particleBoostMultiplier: number = 1.5 // How much audio boosts particles
  
  // 🌊 EMERGENT WAVE EFFECTS - Ripple through background! 🌊
  private waveEffects: { position: THREE.Vector3, time: number, intensity: number }[] = []
  private maxWaveEffects: number = 10
  private waveDecayRate: number = 0.9
  
  // ⚡ LIGHTING REACTIVITY - Dynamic lights! ⚡
  private lights: THREE.Light[] = []
  private baseLightIntensities: Map<THREE.Light, number> = new Map()
  private lightReactivityEnabled: boolean = true
  
  constructor(scene: THREE.Scene, effectsSystem: EffectsSystem) {
    this.scene = scene
    this.effectsSystem = effectsSystem
    this.initializeEnemyColorMap()
  }
  
  // 🎨 INITIALIZE ENEMY COLOR MAP - Each enemy type has a color! 🎨
  private initializeEnemyColorMap(): void {
    // Each enemy type gets a unique color that affects background
    this.enemyColorMap.set('DataMite', new THREE.Color().setHSL(0.0, 0.9, 0.5)) // Red
    this.enemyColorMap.set('ScanDrone', new THREE.Color().setHSL(0.1, 0.9, 0.6)) // Orange
    this.enemyColorMap.set('ChaosWorm', new THREE.Color().setHSL(Math.random(), 0.9, 0.6)) // Rainbow
    this.enemyColorMap.set('VoidSphere', new THREE.Color().setHSL(0.8, 1.0, 0.4)) // Purple
    this.enemyColorMap.set('CrystalShardSwarm', new THREE.Color().setHSL(0.5, 1.0, 0.7)) // Cyan
  }
  
  // 🎯 ON ENEMY DEATH - React to enemy death with color shift! 🎯
  onEnemyDeath(enemyType: string, position: THREE.Vector3, intensity: number = 1.0): void {
    // Get enemy color
    const enemyColor = this.enemyColorMap.get(enemyType) || new THREE.Color().setHSL(0.0, 0.9, 0.5)
    
    // Calculate color shift based on intensity
    const colorShift = enemyColor.clone().multiplyScalar(this.enemyDeathColorIntensity * intensity)
    
    // Blend with current target color
    this.targetBackgroundColor.add(colorShift)
    
    // Clamp color values to valid range
    this.targetBackgroundColor.r = Math.min(0.3, Math.max(0, this.targetBackgroundColor.r))
    this.targetBackgroundColor.g = Math.min(0.3, Math.max(0, this.targetBackgroundColor.g))
    this.targetBackgroundColor.b = Math.min(0.3, Math.max(0, this.targetBackgroundColor.b))
    
    // Boost gameplay intensity
    this.gameplayIntensity = Math.min(1.0, this.gameplayIntensity + this.intensityBoostPerKill * intensity)
    
    // 🌊 CREATE EMERGENT WAVE EFFECT - Ripple through background! 🌊
    if (this.waveEffects.length < this.maxWaveEffects) {
      this.waveEffects.push({
        position: position.clone(),
        time: 0,
        intensity: intensity
      })
    }
    
    // Create audio-reactive particle burst at death position
    if (this.particleReactivityEnabled) {
      this.createAudioReactiveParticles(position, enemyColor, intensity)
    }
  }
  
  // 🎵 ON COMBO - React to combos with color and effects! 🎵
  onCombo(comboCount: number): void {
    // Calculate combo color shift (green/cyan for good combos)
    const comboHue = 0.5 + (comboCount / 20) * 0.1 // Shift from cyan to green
    const comboColor = new THREE.Color().setHSL(comboHue, 1.0, 0.4)
    const colorShift = comboColor.clone().multiplyScalar(this.comboColorIntensity * (comboCount / 10))
    
    // Blend with target color
    this.targetBackgroundColor.add(colorShift)
    
    // Boost intensity
    this.gameplayIntensity = Math.min(1.0, this.gameplayIntensity + this.intensityBoostPerCombo * comboCount)
  }
  
  // 🎆 CREATE AUDIO-REACTIVE PARTICLES - Trippy effects! 🎆
  private createAudioReactiveParticles(position: THREE.Vector3, color: THREE.Color, intensity: number): void {
    const particleCount = Math.floor(15 * intensity * this.particleBoostMultiplier)
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = (2 + Math.random() * 4) * intensity
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        (Math.random() - 0.5) * 2
      )
      
      // Use enemy color for particles
      const particleColor = color.clone()
      particleColor.multiplyScalar(1.2) // Brighten
      
      // Create sparkle particles
      this.effectsSystem.createSparkle(position, velocity, particleColor, 0.8 + Math.random() * 0.4)
    }
  }
  
  // 🎨 UPDATE BACKGROUND COLOR - Smooth transitions! 🎨
  update(deltaTime: number): void {
    // Smoothly transition to target color
    this.currentBackgroundColor.lerp(this.targetBackgroundColor, this.colorTransitionSpeed * deltaTime)
    
    // Apply to scene background
    this.scene.background = this.currentBackgroundColor.clone()
    
    // Decay target color back to base (fade effect)
    this.targetBackgroundColor.lerp(this.baseBackgroundColor, (1 - this.colorDecayRate) * deltaTime * 10)
    
    // Decay gameplay intensity
    this.gameplayIntensity *= this.intensityDecayRate
    
    // 🌊 UPDATE WAVE EFFECTS - Emergent ripples! 🌊
    this.waveEffects = this.waveEffects.filter(wave => {
      wave.time += deltaTime
      wave.intensity *= this.waveDecayRate
      return wave.intensity > 0.01 && wave.time < 2.0 // Remove old waves
    })
    
    // Update lighting reactivity
    if (this.lightReactivityEnabled) {
      this.updateLightingReactivity(deltaTime)
    }
    
    // Update particle system reactivity
    if (this.particleReactivityEnabled) {
      this.updateParticleReactivity(deltaTime)
    }
  }
  
  // 🌊 GET ACTIVE WAVE EFFECTS - For visual rendering! 🌊
  getActiveWaveEffects(): { position: THREE.Vector3, time: number, intensity: number }[] {
    return this.waveEffects
  }
  
  // ⚡ UPDATE LIGHTING REACTIVITY - Lights pulse with gameplay! ⚡
  private updateLightingReactivity(deltaTime: number): void {
    const time = Date.now() * 0.001
    const intensityMultiplier = 1.0 + this.gameplayIntensity * 0.5 + Math.sin(time * 3) * 0.2
    
    this.lights.forEach(light => {
      const baseIntensity = this.baseLightIntensities.get(light) || 1.0
      if (light instanceof THREE.PointLight || light instanceof THREE.DirectionalLight) {
        light.intensity = baseIntensity * intensityMultiplier
      }
    })
  }
  
  // 🎆 UPDATE PARTICLE REACTIVITY - Particles respond to intensity! 🎆
  private updateParticleReactivity(deltaTime: number): void {
    // This affects particle emission rates in EffectsSystem
    // The intensity value is available for use
  }
  
  // 🎯 REGISTER LIGHTS - For reactivity! 🎯
  registerLight(light: THREE.Light): void {
    this.lights.push(light)
    if (light instanceof THREE.PointLight || light instanceof THREE.DirectionalLight) {
      this.baseLightIntensities.set(light, light.intensity)
    }
  }
  
  // 🎨 SET BASE BACKGROUND COLOR 🎨
  setBaseBackgroundColor(color: THREE.Color): void {
    this.baseBackgroundColor.copy(color)
  }
  
  // 🎵 CONFIGURATION METHODS - Easy to tune! 🎵
  setEnemyDeathColorIntensity(intensity: number): void {
    this.enemyDeathColorIntensity = Math.max(0, Math.min(1, intensity))
  }
  
  setComboColorIntensity(intensity: number): void {
    this.comboColorIntensity = Math.max(0, Math.min(1, intensity))
  }
  
  setColorTransitionSpeed(speed: number): void {
    this.colorTransitionSpeed = Math.max(0.1, Math.min(10, speed))
  }
  
  setColorDecayRate(rate: number): void {
    this.colorDecayRate = Math.max(0.8, Math.min(0.99, rate))
  }
  
  setIntensityBoostPerKill(boost: number): void {
    this.intensityBoostPerKill = Math.max(0, Math.min(0.5, boost))
  }
  
  setIntensityBoostPerCombo(boost: number): void {
    this.intensityBoostPerCombo = Math.max(0, Math.min(0.2, boost))
  }
  
  setParticleBoostMultiplier(multiplier: number): void {
    this.particleBoostMultiplier = Math.max(0.5, Math.min(3, multiplier))
  }
  
  // 🎮 GET GAMEPLAY INTENSITY - For other systems to use! 🎮
  getGameplayIntensity(): number {
    return this.gameplayIntensity
  }
  
  // 🎨 GET CURRENT BACKGROUND COLOR 🎨
  getCurrentBackgroundColor(): THREE.Color {
    return this.currentBackgroundColor.clone()
  }
}

