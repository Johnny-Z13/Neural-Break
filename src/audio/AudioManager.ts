/**
 * 🎵 NEURAL BREAK AUDIO SYSTEM 🎵
 * Procedural sci-fi audio - Aphex Twin / Autechre vibes
 * Optimized for reliability + distinct sound effects
 */

export class AudioManager {
  private audioContext: AudioContext | null = null
  private masterVolume: number = 0.5
  private masterGainNode: GainNode | null = null
  private sfxGainNode: GainNode | null = null  // Separate gain for sound effects
  private ambientGainNode: GainNode | null = null  // Separate gain for ambient
  
  // Ambient soundscape
  private ambientNodes: AudioNode[] = []
  private ambientTimeouts: number[] = []  // Track setTimeout IDs for cleanup
  private isAmbientPlaying: boolean = false
  
  // Audio context state
  private isInitialized: boolean = false
  private pendingSounds: (() => void)[] = []

  initialize(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Create master gain node
      this.masterGainNode = this.audioContext.createGain()
      this.masterGainNode.gain.value = this.masterVolume
      this.masterGainNode.connect(this.audioContext.destination)
      
      // Create separate gain nodes for SFX and Ambient
      this.sfxGainNode = this.audioContext.createGain()
      this.sfxGainNode.gain.value = 1.0  // SFX at full volume relative to master
      this.sfxGainNode.connect(this.masterGainNode)
      
      this.ambientGainNode = this.audioContext.createGain()
      this.ambientGainNode.gain.value = 0.35  // Ambient quieter so SFX punch through
      this.ambientGainNode.connect(this.masterGainNode)
      
      this.isInitialized = true
      console.log('🎵 AudioManager initialized')
      
      // Play any pending sounds
      this.flushPendingSounds()
      
    } catch (error) {
      console.warn('🔇 Audio not supported:', error)
    }
  }

  /**
   * Ensure audio context is running - handles browser autoplay policies
   */
  private async ensureAudioReady(): Promise<boolean> {
    if (!this.audioContext || !this.masterGainNode || !this.sfxGainNode) {
      return false
    }

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume()
        console.log('🎵 AudioContext resumed')
      } catch (e) {
        console.warn('🔇 Could not resume audio context:', e)
        return false
      }
    }

    return this.audioContext.state === 'running'
  }

  /**
   * Queue a sound to play, handling async audio context
   */
  private queueSound(soundFn: () => void): void {
    if (!this.isInitialized) {
      this.pendingSounds.push(soundFn)
      return
    }
    
    this.ensureAudioReady().then(ready => {
      if (ready) {
        try {
          soundFn()
        } catch (e) {
          console.warn('🔇 Sound playback error:', e)
        }
      }
    })
  }

  private flushPendingSounds(): void {
    const sounds = [...this.pendingSounds]
    this.pendingSounds = []
    sounds.forEach(fn => this.queueSound(fn))
  }

  // ============================================
  // 🔫 WEAPON SOUNDS - Punchy, distinct
  // ============================================

  /**
   * 🔫 Fire Sound - Sharp digital blip with sci-fi character
   */
  playFireSound(): void {
    // Default to no power scaling
    this.playPowerScaledFireSound(0, 'bullets')
  }
  
  /**
   * 🔫🔥 POWER-SCALED FIRE SOUND - Gets BIGGER and more DRAMATIC at higher power levels! 🔥🔫
   */
  playPowerScaledFireSound(powerLevel: number, weaponType: string): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      const variation = Math.random()
      
      // 🔥 Power scaling factors 🔥
      const powerScale = 1 + powerLevel * 0.15 // Overall intensity
      const durationScale = 1 + powerLevel * 0.08 // Sound lasts longer
      const layerCount = 1 + Math.floor(powerLevel / 3) // More layers at high power
      
      // 🎯 Weapon-type specific base frequencies and characteristics
      let baseFreq: number
      let oscType: OscillatorType
      let filterType: BiquadFilterType = 'bandpass'
      
      switch (weaponType) {
        case 'lasers':
          baseFreq = 1200 + variation * 300 // Higher pitched
          oscType = 'sawtooth' // Harsher sound
          break
        case 'photons':
          baseFreq = 600 + variation * 200 // Mid-range
          oscType = 'sine' // Cleaner sound
          filterType = 'highpass'
          break
        default: // bullets
          baseFreq = 800 + variation * 400
          oscType = 'square'
      }
      
      // 🔥 MAIN PULSE - scales with power! 🔥
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      
      // Frequency drops more dramatically at higher power
      osc.frequency.setValueAtTime(baseFreq * powerScale, now)
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.08 * durationScale)
      osc.type = oscType
      
      filter.type = filterType
      filter.frequency.setValueAtTime(baseFreq * powerScale, now)
      filter.Q.value = 4 + powerLevel * 0.5
      
      // Louder and punchier at higher power
      const mainGain = 0.6 + powerLevel * 0.04
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(Math.min(mainGain, 0.9), now + 0.005)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08 * durationScale)
      
      osc.connect(filter)
      filter.connect(gain)
      gain.connect(this.sfxGainNode!)
      
      osc.start(now)
      osc.stop(now + 0.1 * durationScale)
      
      // 🔥 SUB-BASS THUMP - DEEPER and HEAVIER at high power! 🔥
      const sub = ctx.createOscillator()
      const subGain = ctx.createGain()
      
      // Lower bass at higher power
      const subFreq = 80 - powerLevel * 4 // Goes down to 40Hz at max power
      sub.frequency.setValueAtTime(subFreq, now)
      sub.frequency.exponentialRampToValueAtTime(subFreq * 0.4, now + 0.05 * durationScale)
      sub.type = 'sine'
      
      const subVol = 0.3 + powerLevel * 0.06
      subGain.gain.setValueAtTime(0, now)
      subGain.gain.linearRampToValueAtTime(Math.min(subVol, 0.7), now + 0.002)
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06 * durationScale)
      
      sub.connect(subGain)
      subGain.connect(this.sfxGainNode!)
      
      sub.start(now)
      sub.stop(now + 0.08 * durationScale)
      
      // 💥 EXTRA HARMONIC LAYERS AT HIGH POWER! 💥
      for (let i = 0; i < layerCount; i++) {
        if (i === 0) continue // Skip first layer (main already plays)
        
        const harmonic = ctx.createOscillator()
        const harmonicGain = ctx.createGain()
        const harmonicFilter = ctx.createBiquadFilter()
        
        const delay = i * 0.008
        const harmonicFreq = baseFreq * (1 + i * 0.5) + Math.random() * 100
        
        harmonic.frequency.setValueAtTime(harmonicFreq, now + delay)
        harmonic.frequency.exponentialRampToValueAtTime(harmonicFreq * 0.3, now + delay + 0.06 * durationScale)
        harmonic.type = ['square', 'sawtooth', 'triangle'][i % 3] as OscillatorType
        
        harmonicFilter.type = 'bandpass'
        harmonicFilter.frequency.setValueAtTime(harmonicFreq, now + delay)
        harmonicFilter.Q.value = 6
        
        const harmonicVol = (0.25 - i * 0.04) + powerLevel * 0.02
        harmonicGain.gain.setValueAtTime(0, now + delay)
        harmonicGain.gain.linearRampToValueAtTime(Math.max(harmonicVol, 0.1), now + delay + 0.003)
        harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.05 * durationScale)
        
        harmonic.connect(harmonicFilter)
        harmonicFilter.connect(harmonicGain)
        harmonicGain.connect(this.sfxGainNode!)
        
        harmonic.start(now + delay)
        harmonic.stop(now + delay + 0.07 * durationScale)
      }
      
      // ⚡ CRACKLE/DISTORTION at power level 7+ ⚡
      if (powerLevel >= 7) {
        const noise = ctx.createBufferSource()
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate)
        const noiseData = noiseBuffer.getChannelData(0)
        
        for (let i = 0; i < noiseData.length; i++) {
          noiseData[i] = (Math.random() * 2 - 1) * 0.5 * Math.pow(1 - i / noiseData.length, 2)
        }
        
        noise.buffer = noiseBuffer
        
        const noiseGain = ctx.createGain()
        const noiseFilter = ctx.createBiquadFilter()
        noiseFilter.type = 'highpass'
        noiseFilter.frequency.value = 3000
        
        noiseGain.gain.setValueAtTime(0, now)
        noiseGain.gain.linearRampToValueAtTime(0.15, now + 0.002)
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
        
        noise.connect(noiseFilter)
        noiseFilter.connect(noiseGain)
        noiseGain.connect(this.sfxGainNode!)
        
        noise.start(now)
        noise.stop(now + 0.05)
      }
    })
  }

  /**
   * 💥 Hit Sound - Player takes damage - harsh, alarming
   */
  playHitSound(): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      
      // Distorted noise burst
      const noise = ctx.createBufferSource()
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate)
      const noiseData = noiseBuffer.getChannelData(0)
      
      for (let i = 0; i < noiseData.length; i++) {
        // Bitcrushed noise for digital harshness
        const val = (Math.random() * 2 - 1)
        noiseData[i] = Math.round(val * 4) / 4 * Math.pow(1 - i / noiseData.length, 1.5)
      }
      
      noise.buffer = noiseBuffer
      
      // Low impact thump
      const impact = ctx.createOscillator()
      const impactGain = ctx.createGain()
      
      impact.frequency.setValueAtTime(100, now)
      impact.frequency.exponentialRampToValueAtTime(30, now + 0.15)
      impact.type = 'sine'
      
      impactGain.gain.setValueAtTime(0, now)
      impactGain.gain.linearRampToValueAtTime(0.7, now + 0.01)
      impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
      
      // High alarming tone
      const alarm = ctx.createOscillator()
      const alarmGain = ctx.createGain()
      const alarmFilter = ctx.createBiquadFilter()
      
      alarm.frequency.setValueAtTime(1500, now)
      alarm.frequency.exponentialRampToValueAtTime(400, now + 0.1)
      alarm.type = 'square'
      
      alarmFilter.type = 'highpass'
      alarmFilter.frequency.value = 500
      
      alarmGain.gain.setValueAtTime(0, now)
      alarmGain.gain.linearRampToValueAtTime(0.4, now + 0.005)
      alarmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
      
      // Noise through filter
      const noiseGain = ctx.createGain()
      const noiseFilter = ctx.createBiquadFilter()
      noiseFilter.type = 'bandpass'
      noiseFilter.frequency.value = 2000
      noiseFilter.Q.value = 2
      
      noiseGain.gain.setValueAtTime(0, now)
      noiseGain.gain.linearRampToValueAtTime(0.5, now + 0.01)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
      
      // Connect
      noise.connect(noiseFilter)
      noiseFilter.connect(noiseGain)
      noiseGain.connect(this.sfxGainNode!)
      
      impact.connect(impactGain)
      impactGain.connect(this.sfxGainNode!)
      
      alarm.connect(alarmFilter)
      alarmFilter.connect(alarmGain)
      alarmGain.connect(this.sfxGainNode!)
      
      noise.start(now)
      noise.stop(now + 0.15)
      impact.start(now)
      impact.stop(now + 0.2)
      alarm.start(now)
      alarm.stop(now + 0.12)
    })
  }

  // ============================================
  // 💀 ENEMY DEATH SOUNDS - Varied per type
  // ============================================

  playEnemyDeathSound(enemyType?: string): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      
      switch (enemyType) {
        case 'DataMite':
          this.playDataMiteDeathInternal(ctx, now)
          break
        case 'ScanDrone':
          this.playScanDroneDeathInternal(ctx, now)
          break
        case 'ChaosWorm':
          this.playChaosWormDeathInternal(ctx, now)
          break
        case 'VoidSphere':
          this.playVoidSphereDeathInternal(ctx, now)
          break
        case 'CrystalShardSwarm':
          this.playCrystalSwarmDeathInternal(ctx, now)
          break
        default:
          this.playGenericDeathInternal(ctx, now)
      }
    })
  }

  private playDataMiteDeathInternal(ctx: AudioContext, now: number): void {
    // Quick digital pop
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.frequency.setValueAtTime(1200, now)
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.08)
    osc.type = 'square'
    
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.5, now + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    
    osc.connect(gain)
    gain.connect(this.sfxGainNode!)
    
    osc.start(now)
    osc.stop(now + 0.1)
  }

  private playScanDroneDeathInternal(ctx: AudioContext, now: number): void {
    // Electric zap with descending whistle
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    const gain2 = ctx.createGain()
    
    osc1.frequency.setValueAtTime(800, now)
    osc1.frequency.exponentialRampToValueAtTime(100, now + 0.2)
    osc1.type = 'sawtooth'
    
    osc2.frequency.setValueAtTime(1600, now)
    osc2.frequency.exponentialRampToValueAtTime(200, now + 0.15)
    osc2.type = 'square'
    
    gain1.gain.setValueAtTime(0, now)
    gain1.gain.linearRampToValueAtTime(0.4, now + 0.01)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    
    gain2.gain.setValueAtTime(0, now)
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.005)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
    
    osc1.connect(gain1)
    osc2.connect(gain2)
    gain1.connect(this.sfxGainNode!)
    gain2.connect(this.sfxGainNode!)
    
    osc1.start(now)
    osc1.stop(now + 0.22)
    osc2.start(now)
    osc2.stop(now + 0.15)
  }

  private playChaosWormDeathInternal(ctx: AudioContext, now: number): void {
    // Multi-layered chaotic explosion
    for (let i = 0; i < 4; i++) {
      const delay = i * 0.025
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      const freq = 300 - i * 40 + Math.random() * 80
      osc.frequency.setValueAtTime(freq, now + delay)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.25, now + delay + 0.25)
      osc.type = ['sine', 'square', 'sawtooth', 'triangle'][i] as OscillatorType
      
      gain.gain.setValueAtTime(0, now + delay)
      gain.gain.linearRampToValueAtTime(0.35 - i * 0.06, now + delay + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.28)
      
      osc.connect(gain)
      gain.connect(this.sfxGainNode!)
      
      osc.start(now + delay)
      osc.stop(now + delay + 0.3)
    }
  }

  private playVoidSphereDeathInternal(ctx: AudioContext, now: number): void {
    // Deep resonant implosion
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    const gain2 = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    
    osc1.frequency.setValueAtTime(50, now)
    osc1.frequency.exponentialRampToValueAtTime(20, now + 0.4)
    osc1.type = 'sine'
    
    osc2.frequency.setValueAtTime(100, now)
    osc2.frequency.exponentialRampToValueAtTime(35, now + 0.35)
    osc2.type = 'triangle'
    
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(150, now)
    filter.frequency.exponentialRampToValueAtTime(40, now + 0.4)
    
    gain1.gain.setValueAtTime(0, now)
    gain1.gain.linearRampToValueAtTime(0.6, now + 0.03)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
    
    gain2.gain.setValueAtTime(0, now)
    gain2.gain.linearRampToValueAtTime(0.4, now + 0.02)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
    
    osc1.connect(gain1)
    osc2.connect(gain2)
    gain1.connect(filter)
    gain2.connect(filter)
    filter.connect(this.sfxGainNode!)
    
    osc1.start(now)
    osc1.stop(now + 0.45)
    osc2.start(now)
    osc2.stop(now + 0.4)
  }

  private playCrystalSwarmDeathInternal(ctx: AudioContext, now: number): void {
    // Shattering glass harmonics
    for (let i = 0; i < 6; i++) {
      const delay = i * 0.015
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      
      const freq = 1000 + i * 250 + Math.random() * 200
      osc.frequency.setValueAtTime(freq, now + delay)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + delay + 0.2)
      osc.type = 'sine'
      
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(freq, now + delay)
      filter.Q.value = 12
      
      gain.gain.setValueAtTime(0, now + delay)
      gain.gain.linearRampToValueAtTime(0.3, now + delay + 0.003)
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.22)
      
      osc.connect(gain)
      gain.connect(filter)
      filter.connect(this.sfxGainNode!)
      
      osc.start(now + delay)
      osc.stop(now + delay + 0.25)
    }
  }

  private playGenericDeathInternal(ctx: AudioContext, now: number): void {
    // Simple descending pop
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.frequency.setValueAtTime(600, now)
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.15)
    osc.type = 'triangle'
    
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.4, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
    
    osc.connect(gain)
    gain.connect(this.sfxGainNode!)
    
    osc.start(now)
    osc.stop(now + 0.2)
  }

  // ============================================
  // 🎮 GAMEPLAY SOUNDS
  // ============================================

  /**
   * ⚡ Level Up Sound - Triumphant ascending arpeggio
   */
  playLevelUpSound(): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      
      const frequencies = [440, 554, 659, 880, 1108]
      
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        
        const startTime = now + i * 0.07
        
        osc.frequency.setValueAtTime(freq, startTime)
        osc.type = 'sine'
        
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(0.4, startTime + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35)
        
        osc.connect(gain)
        gain.connect(this.sfxGainNode!)
        
        osc.start(startTime)
        osc.stop(startTime + 0.4)
      })
    })
  }

  /**
   * 🚀 Dash Sound - Whooshing burst
   */
  playDashSound(): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      
      // Swoosh with noise
      const noise = ctx.createBufferSource()
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate)
      const noiseData = noiseBuffer.getChannelData(0)
      
      for (let i = 0; i < noiseData.length; i++) {
        const env = Math.sin(Math.PI * i / noiseData.length)
        noiseData[i] = (Math.random() * 2 - 1) * env * 0.5
      }
      
      noise.buffer = noiseBuffer
      
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(500, now)
      filter.frequency.exponentialRampToValueAtTime(2000, now + 0.1)
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.2)
      filter.Q.value = 2
      
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.5, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
      
      // Rising tone
      const osc = ctx.createOscillator()
      const oscGain = ctx.createGain()
      
      osc.frequency.setValueAtTime(200, now)
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.1)
      osc.type = 'sawtooth'
      
      oscGain.gain.setValueAtTime(0, now)
      oscGain.gain.linearRampToValueAtTime(0.25, now + 0.01)
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
      
      noise.connect(filter)
      filter.connect(gain)
      gain.connect(this.sfxGainNode!)
      
      osc.connect(oscGain)
      oscGain.connect(this.sfxGainNode!)
      
      noise.start(now)
      noise.stop(now + 0.2)
      osc.start(now)
      osc.stop(now + 0.15)
    })
  }

  /**
   * 🔥 Combo Sound - Intensity scales with combo
   */
  playComboSound(combo: number): void {
    if (combo < 2) return
    
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      const intensity = Math.min(combo / 10, 1)
      
      const baseFreq = 400 + combo * 40
      const layers = Math.min(Math.floor(combo / 3), 4)
      
      for (let i = 0; i < layers; i++) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        
        osc.frequency.setValueAtTime(baseFreq + i * 80, now)
        osc.frequency.exponentialRampToValueAtTime((baseFreq + i * 80) * 1.3, now + 0.1)
        osc.type = ['sine', 'square', 'sawtooth'][i % 3] as OscillatorType
        
        const vol = (0.25 + intensity * 0.2) / layers
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(vol, now + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
        
        osc.connect(gain)
        gain.connect(this.sfxGainNode!)
        
        osc.start(now)
        osc.stop(now + 0.15)
      }
    })
  }

  /**
   * 💎 Power-Up Collect - Sparkly ascending notes
   */
  playPowerUpCollectSound(): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      
      const frequencies = [523, 659, 784, 1046, 1318]
      
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        
        const startTime = now + i * 0.05
        
        osc.frequency.setValueAtTime(freq, startTime)
        osc.frequency.exponentialRampToValueAtTime(freq * 1.2, startTime + 0.08)
        osc.type = 'sine'
        
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(0.35, startTime + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12)
        
        osc.connect(gain)
        gain.connect(this.sfxGainNode!)
        
        osc.start(startTime)
        osc.stop(startTime + 0.15)
      })
    })
  }

  /**
   * ⏰ Timer Warning - Urgent beeps
   */
  playTimerWarningSound(): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      
      for (let i = 0; i < 2; i++) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        
        const startTime = now + i * 0.12
        
        osc.frequency.setValueAtTime(900, startTime)
        osc.frequency.exponentialRampToValueAtTime(1100, startTime + 0.04)
        osc.type = 'square'
        
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(0.45, startTime + 0.005)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08)
        
        osc.connect(gain)
        gain.connect(this.sfxGainNode!)
        
        osc.start(startTime)
        osc.stop(startTime + 0.1)
      }
    })
  }

  /**
   * 🎯 Level Complete - Triumphant chord
   */
  playLevelCompleteSound(): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      
      const chord = [440, 554, 659, 880]
      
      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        
        const startTime = now + i * 0.08
        
        osc.frequency.setValueAtTime(freq, startTime)
        osc.type = 'sine'
        
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(0.35, startTime + 0.04)
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.25)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45)
        
        osc.connect(gain)
        gain.connect(this.sfxGainNode!)
        
        osc.start(startTime)
        osc.stop(startTime + 0.5)
      })
    })
  }

  /**
   * 🎯 Multiplier Sound - Cluster kills
   */
  playMultiplierSound(clusterSize: number): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      const intensity = Math.min(clusterSize / 5, 1)
      
      const baseFreq = 500 + clusterSize * 80
      const layers = Math.min(clusterSize, 5)
      
      for (let i = 0; i < layers; i++) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        
        const delay = i * 0.04
        const freq = baseFreq + i * 120
        
        osc.frequency.setValueAtTime(freq, now + delay)
        osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + delay + 0.18)
        osc.type = ['sine', 'square', 'sawtooth'][i % 3] as OscillatorType
        
        const vol = (0.3 + intensity * 0.25) / layers
        gain.gain.setValueAtTime(0, now + delay)
        gain.gain.linearRampToValueAtTime(vol, now + delay + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25)
        
        osc.connect(gain)
        gain.connect(this.sfxGainNode!)
        
        osc.start(now + delay)
        osc.stop(now + delay + 0.28)
      }
    })
  }

  /**
   * 🏆 High Score Moment - Subtle celebration
   */
  playHighScoreMomentSound(score: number, combo: number): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      
      const intensity = Math.min(Math.max(score / 10000, combo / 20), 1)
      
      const chord = [440, 554, 659]
      
      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        
        const startTime = now + i * 0.05
        
        osc.frequency.setValueAtTime(freq, startTime)
        osc.type = 'sine'
        
        const vol = 0.12 + intensity * 0.08
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3)
        
        osc.connect(gain)
        gain.connect(this.sfxGainNode!)
        
        osc.start(startTime)
        osc.stop(startTime + 0.35)
      })
    })
  }

  /**
   * 💀 Game Over - Dramatic descending doom
   */
  playGameOverSound(): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      
      // Low doom tone
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      const gain2 = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      
      osc1.frequency.setValueAtTime(200, now)
      osc1.frequency.exponentialRampToValueAtTime(60, now + 0.5)
      osc1.type = 'sawtooth'
      
      osc2.frequency.setValueAtTime(100, now)
      osc2.frequency.exponentialRampToValueAtTime(30, now + 0.5)
      osc2.type = 'triangle'
      
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(300, now)
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.5)
      
      gain1.gain.setValueAtTime(0, now)
      gain1.gain.linearRampToValueAtTime(0.55, now + 0.08)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
      
      gain2.gain.setValueAtTime(0, now)
      gain2.gain.linearRampToValueAtTime(0.4, now + 0.08)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
      
      osc1.connect(gain1)
      osc2.connect(gain2)
      gain1.connect(filter)
      gain2.connect(filter)
      filter.connect(this.sfxGainNode!)
      
      osc1.start(now)
      osc1.stop(now + 0.6)
      osc2.start(now)
      osc2.stop(now + 0.6)
    })
  }

  // ============================================
  // 🎮 UI SOUNDS
  // ============================================

  playButtonPressSound(): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.frequency.setValueAtTime(800, now)
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.02)
      osc.type = 'square'
      
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.35, now + 0.002)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
      
      osc.connect(gain)
      gain.connect(this.sfxGainNode!)
      
      osc.start(now)
      osc.stop(now + 0.05)
    })
  }

  playButtonHoverSound(): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.frequency.setValueAtTime(600, now)
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.04)
      osc.type = 'sine'
      
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.15, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
      
      osc.connect(gain)
      gain.connect(this.sfxGainNode!)
      
      osc.start(now)
      osc.stop(now + 0.08)
    })
  }

  // ============================================
  // 🐛 CHAOS WORM SOUNDS - Rainbow Destruction! 🐛
  // ============================================

  /**
   * 💀 Chaos Worm Death Start - Ominous rumble as death begins
   */
  playChaosWormDeathStartSound(): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      
      // 🌑 DEEP RUMBLE 🌑
      const rumble = ctx.createOscillator()
      const rumbleGain = ctx.createGain()
      
      rumble.frequency.setValueAtTime(40, now)
      rumble.frequency.linearRampToValueAtTime(60, now + 0.5)
      rumble.type = 'sine'
      
      rumbleGain.gain.setValueAtTime(0, now)
      rumbleGain.gain.linearRampToValueAtTime(0.5, now + 0.2)
      rumbleGain.gain.linearRampToValueAtTime(0.3, now + 0.6)
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0)
      
      rumble.connect(rumbleGain)
      rumbleGain.connect(this.sfxGainNode!)
      
      rumble.start(now)
      rumble.stop(now + 1.1)
      
      // ⚡ DISTORTION CRACKLE ⚡
      const noise = ctx.createBufferSource()
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate)
      const noiseData = noiseBuffer.getChannelData(0)
      
      for (let i = 0; i < noiseData.length; i++) {
        const t = i / noiseData.length
        noiseData[i] = (Math.random() * 2 - 1) * (0.3 + t * 0.4) * Math.sin(t * Math.PI)
      }
      
      noise.buffer = noiseBuffer
      
      const noiseFilter = ctx.createBiquadFilter()
      noiseFilter.type = 'bandpass'
      noiseFilter.frequency.value = 200
      noiseFilter.Q.value = 3
      
      const noiseGain = ctx.createGain()
      noiseGain.gain.setValueAtTime(0, now)
      noiseGain.gain.linearRampToValueAtTime(0.25, now + 0.3)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8)
      
      noise.connect(noiseFilter)
      noiseFilter.connect(noiseGain)
      noiseGain.connect(this.sfxGainNode!)
      
      noise.start(now)
      noise.stop(now + 0.8)
    })
  }

  /**
   * 💥 Chaos Worm Segment Explode - Each segment pops with rainbow energy
   */
  playChaosWormSegmentExplodeSound(segmentIndex: number, totalSegments: number): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      
      // Higher pitch for segments closer to head
      const pitchMultiplier = 0.5 + (segmentIndex / totalSegments) * 1.5
      
      // 💥 POP EXPLOSION 💥
      const pop = ctx.createOscillator()
      const popGain = ctx.createGain()
      const popFilter = ctx.createBiquadFilter()
      
      pop.frequency.setValueAtTime(200 * pitchMultiplier, now)
      pop.frequency.exponentialRampToValueAtTime(60, now + 0.15)
      pop.type = 'sawtooth'
      
      popFilter.type = 'lowpass'
      popFilter.frequency.setValueAtTime(800 * pitchMultiplier, now)
      popFilter.frequency.exponentialRampToValueAtTime(100, now + 0.15)
      
      popGain.gain.setValueAtTime(0, now)
      popGain.gain.linearRampToValueAtTime(0.4, now + 0.01)
      popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
      
      pop.connect(popFilter)
      popFilter.connect(popGain)
      popGain.connect(this.sfxGainNode!)
      
      pop.start(now)
      pop.stop(now + 0.2)
      
      // 🌈 HARMONIC SHIMMER 🌈
      const shimmer = ctx.createOscillator()
      const shimmerGain = ctx.createGain()
      
      shimmer.frequency.setValueAtTime(400 * pitchMultiplier, now)
      shimmer.frequency.exponentialRampToValueAtTime(800 * pitchMultiplier, now + 0.1)
      shimmer.type = 'sine'
      
      shimmerGain.gain.setValueAtTime(0, now)
      shimmerGain.gain.linearRampToValueAtTime(0.2, now + 0.02)
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
      
      shimmer.connect(shimmerGain)
      shimmerGain.connect(this.sfxGainNode!)
      
      shimmer.start(now)
      shimmer.stop(now + 0.15)
    })
  }

  /**
   * 🌟 Chaos Worm Final Death - Massive rainbow explosion
   */
  playChaosWormFinalDeathSound(): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      
      // 💀 MASSIVE IMPACT 💀
      const impact = ctx.createOscillator()
      const impactGain = ctx.createGain()
      
      impact.frequency.setValueAtTime(80, now)
      impact.frequency.exponentialRampToValueAtTime(20, now + 0.5)
      impact.type = 'sine'
      
      impactGain.gain.setValueAtTime(0, now)
      impactGain.gain.linearRampToValueAtTime(0.7, now + 0.02)
      impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
      
      impact.connect(impactGain)
      impactGain.connect(this.sfxGainNode!)
      
      impact.start(now)
      impact.stop(now + 0.65)
      
      // 🌈 RAINBOW HARMONICS CASCADE 🌈
      for (let i = 0; i < 6; i++) {
        const delay = i * 0.03
        const harmonic = ctx.createOscillator()
        const harmonicGain = ctx.createGain()
        
        const freq = 150 + i * 100
        harmonic.frequency.setValueAtTime(freq, now + delay)
        harmonic.frequency.exponentialRampToValueAtTime(freq * 2, now + delay + 0.15)
        harmonic.type = 'sine'
        
        harmonicGain.gain.setValueAtTime(0, now + delay)
        harmonicGain.gain.linearRampToValueAtTime(0.2, now + delay + 0.02)
        harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25)
        
        harmonic.connect(harmonicGain)
        harmonicGain.connect(this.sfxGainNode!)
        
        harmonic.start(now + delay)
        harmonic.stop(now + delay + 0.3)
      }
      
      // ⚡ EXPLOSION NOISE ⚡
      const noise = ctx.createBufferSource()
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate)
      const noiseData = noiseBuffer.getChannelData(0)
      
      for (let i = 0; i < noiseData.length; i++) {
        const t = i / noiseData.length
        noiseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 1.5) * 0.8
      }
      
      noise.buffer = noiseBuffer
      
      const noiseFilter = ctx.createBiquadFilter()
      noiseFilter.type = 'lowpass'
      noiseFilter.frequency.setValueAtTime(2000, now)
      noiseFilter.frequency.exponentialRampToValueAtTime(200, now + 0.4)
      
      const noiseGain = ctx.createGain()
      noiseGain.gain.setValueAtTime(0, now)
      noiseGain.gain.linearRampToValueAtTime(0.5, now + 0.02)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
      
      noise.connect(noiseFilter)
      noiseFilter.connect(noiseGain)
      noiseGain.connect(this.sfxGainNode!)
      
      noise.start(now)
      noise.stop(now + 0.45)
    })
  }

  // ============================================
  // 💎 CRYSTAL SHARD SWARM SOUNDS - Prismatic Fury! 💎
  // ============================================

  /**
   * 💎 Crystal Hum - Ambient resonance
   */
  playCrystalHumSound(): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      
      // 🔮 CRYSTAL RESONANCE 🔮
      for (let i = 0; i < 3; i++) {
        const hum = ctx.createOscillator()
        const humGain = ctx.createGain()
        
        const baseFreq = 300 + i * 200
        hum.frequency.setValueAtTime(baseFreq, now)
        hum.frequency.setValueAtTime(baseFreq * 1.02, now + 0.1)
        hum.frequency.setValueAtTime(baseFreq, now + 0.2)
        hum.type = 'sine'
        
        humGain.gain.setValueAtTime(0, now)
        humGain.gain.linearRampToValueAtTime(0.08, now + 0.05)
        humGain.gain.linearRampToValueAtTime(0.06, now + 0.15)
        humGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
        
        hum.connect(humGain)
        humGain.connect(this.sfxGainNode!)
        
        hum.start(now)
        hum.stop(now + 0.4)
      }
      
      // ✨ SHIMMER ✨
      const shimmer = ctx.createOscillator()
      const shimmerGain = ctx.createGain()
      
      shimmer.frequency.setValueAtTime(2000, now)
      shimmer.frequency.exponentialRampToValueAtTime(1500, now + 0.2)
      shimmer.type = 'sine'
      
      shimmerGain.gain.setValueAtTime(0, now)
      shimmerGain.gain.linearRampToValueAtTime(0.05, now + 0.03)
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      
      shimmer.connect(shimmerGain)
      shimmerGain.connect(this.sfxGainNode!)
      
      shimmer.start(now)
      shimmer.stop(now + 0.3)
    })
  }

  /**
   * ⚡ Crystal Charge - Building energy before shard burst
   */
  playCrystalChargeSound(): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      
      // 🔋 ASCENDING CRYSTALLINE WHINE 🔋
      const charge = ctx.createOscillator()
      const chargeGain = ctx.createGain()
      const chargeFilter = ctx.createBiquadFilter()
      
      charge.frequency.setValueAtTime(400, now)
      charge.frequency.exponentialRampToValueAtTime(2000, now + 0.2)
      charge.type = 'sine'
      
      chargeFilter.type = 'bandpass'
      chargeFilter.frequency.setValueAtTime(500, now)
      chargeFilter.frequency.exponentialRampToValueAtTime(2500, now + 0.2)
      chargeFilter.Q.value = 8
      
      chargeGain.gain.setValueAtTime(0, now)
      chargeGain.gain.linearRampToValueAtTime(0.3, now + 0.15)
      chargeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      
      charge.connect(chargeFilter)
      chargeFilter.connect(chargeGain)
      chargeGain.connect(this.sfxGainNode!)
      
      charge.start(now)
      charge.stop(now + 0.3)
      
      // 💎 PRISMATIC HARMONICS 💎
      for (let i = 0; i < 4; i++) {
        const harmonic = ctx.createOscillator()
        const harmonicGain = ctx.createGain()
        const delay = i * 0.03
        
        harmonic.frequency.setValueAtTime(600 + i * 300, now + delay)
        harmonic.frequency.exponentialRampToValueAtTime(1200 + i * 400, now + delay + 0.15)
        harmonic.type = 'triangle'
        
        harmonicGain.gain.setValueAtTime(0, now + delay)
        harmonicGain.gain.linearRampToValueAtTime(0.12, now + delay + 0.02)
        harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18)
        
        harmonic.connect(harmonicGain)
        harmonicGain.connect(this.sfxGainNode!)
        
        harmonic.start(now + delay)
        harmonic.stop(now + delay + 0.2)
      }
    })
  }

  /**
   * 🔫 Crystal Fire - Sharp crystalline projectile launch
   */
  playCrystalFireSound(): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      
      // 💎 CRYSTAL SHATTER LAUNCH 💎
      const main = ctx.createOscillator()
      const mainGain = ctx.createGain()
      const mainFilter = ctx.createBiquadFilter()
      
      main.frequency.setValueAtTime(1500, now)
      main.frequency.exponentialRampToValueAtTime(600, now + 0.08)
      main.type = 'triangle'
      
      mainFilter.type = 'highpass'
      mainFilter.frequency.value = 400
      mainFilter.Q.value = 2
      
      mainGain.gain.setValueAtTime(0, now)
      mainGain.gain.linearRampToValueAtTime(0.35, now + 0.005)
      mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
      
      main.connect(mainFilter)
      mainFilter.connect(mainGain)
      mainGain.connect(this.sfxGainNode!)
      
      main.start(now)
      main.stop(now + 0.12)
      
      // ✨ GLASS-LIKE TINKLE ✨
      for (let i = 0; i < 3; i++) {
        const tinkle = ctx.createOscillator()
        const tinkleGain = ctx.createGain()
        const delay = i * 0.015
        
        const freq = 1800 + i * 400 + Math.random() * 200
        tinkle.frequency.setValueAtTime(freq, now + delay)
        tinkle.frequency.exponentialRampToValueAtTime(freq * 0.7, now + delay + 0.06)
        tinkle.type = 'sine'
        
        tinkleGain.gain.setValueAtTime(0, now + delay)
        tinkleGain.gain.linearRampToValueAtTime(0.15, now + delay + 0.003)
        tinkleGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08)
        
        tinkle.connect(tinkleGain)
        tinkleGain.connect(this.sfxGainNode!)
        
        tinkle.start(now + delay)
        tinkle.stop(now + delay + 0.1)
      }
      
      // ⚡ ENERGY CRACKLE ⚡
      const crackle = ctx.createBufferSource()
      const crackleBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate)
      const crackleData = crackleBuffer.getChannelData(0)
      
      for (let i = 0; i < crackleData.length; i++) {
        crackleData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / crackleData.length, 2) * 0.5
      }
      
      crackle.buffer = crackleBuffer
      
      const crackleFilter = ctx.createBiquadFilter()
      crackleFilter.type = 'highpass'
      crackleFilter.frequency.value = 2000
      
      const crackleGain = ctx.createGain()
      crackleGain.gain.setValueAtTime(0, now)
      crackleGain.gain.linearRampToValueAtTime(0.2, now + 0.005)
      crackleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
      
      crackle.connect(crackleFilter)
      crackleFilter.connect(crackleGain)
      crackleGain.connect(this.sfxGainNode!)
      
      crackle.start(now)
      crackle.stop(now + 0.06)
    })
  }

  // ============================================
  // 🌀 VOID SPHERE SOUNDS - Cyberpunk Horror! 🌀
  // ============================================

  /**
   * 💫 Void Sphere Ambient Pulse - Deep, ominous cyberpunk throb
   */
  playVoidSpherePulseSound(): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      
      // 🌑 DEEP SUB-BASS THROB 🌑
      const sub = ctx.createOscillator()
      const subGain = ctx.createGain()
      const subFilter = ctx.createBiquadFilter()
      
      sub.frequency.setValueAtTime(35, now)
      sub.frequency.exponentialRampToValueAtTime(25, now + 0.3)
      sub.type = 'sine'
      
      subFilter.type = 'lowpass'
      subFilter.frequency.value = 80
      
      subGain.gain.setValueAtTime(0, now)
      subGain.gain.linearRampToValueAtTime(0.35, now + 0.05)
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
      
      sub.connect(subFilter)
      subFilter.connect(subGain)
      subGain.connect(this.sfxGainNode!)
      
      sub.start(now)
      sub.stop(now + 0.45)
      
      // ⚡ CYBERPUNK DIGITAL SHIMMER ⚡
      for (let i = 0; i < 3; i++) {
        const shimmer = ctx.createOscillator()
        const shimmerGain = ctx.createGain()
        const delay = i * 0.08
        
        const freq = 800 + i * 400 + Math.random() * 200
        shimmer.frequency.setValueAtTime(freq, now + delay)
        shimmer.frequency.exponentialRampToValueAtTime(freq * 0.5, now + delay + 0.2)
        shimmer.type = 'sine'
        
        shimmerGain.gain.setValueAtTime(0, now + delay)
        shimmerGain.gain.linearRampToValueAtTime(0.08, now + delay + 0.02)
        shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25)
        
        shimmer.connect(shimmerGain)
        shimmerGain.connect(this.sfxGainNode!)
        
        shimmer.start(now + delay)
        shimmer.stop(now + delay + 0.3)
      }
      
      // 🔮 ETHEREAL VOID WHISPER 🔮
      const noise = ctx.createBufferSource()
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate)
      const noiseData = noiseBuffer.getChannelData(0)
      
      for (let i = 0; i < noiseData.length; i++) {
        // Filtered, ethereal noise
        const env = Math.sin(Math.PI * i / noiseData.length)
        noiseData[i] = (Math.random() * 2 - 1) * env * 0.3
      }
      
      noise.buffer = noiseBuffer
      
      const noiseFilter = ctx.createBiquadFilter()
      noiseFilter.type = 'bandpass'
      noiseFilter.frequency.setValueAtTime(2000, now)
      noiseFilter.frequency.exponentialRampToValueAtTime(500, now + 0.3)
      noiseFilter.Q.value = 8
      
      const noiseGain = ctx.createGain()
      noiseGain.gain.setValueAtTime(0, now)
      noiseGain.gain.linearRampToValueAtTime(0.1, now + 0.05)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
      
      noise.connect(noiseFilter)
      noiseFilter.connect(noiseGain)
      noiseGain.connect(this.sfxGainNode!)
      
      noise.start(now)
      noise.stop(now + 0.35)
    })
  }

  /**
   * ⚡ Void Sphere Charge Sound - Building energy before burst fire
   */
  playVoidSphereChargeSound(): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      
      // 🔋 ASCENDING CHARGE WHINE 🔋
      const charge = ctx.createOscillator()
      const chargeGain = ctx.createGain()
      const chargeFilter = ctx.createBiquadFilter()
      
      charge.frequency.setValueAtTime(150, now)
      charge.frequency.exponentialRampToValueAtTime(1200, now + 0.25)
      charge.type = 'sawtooth'
      
      chargeFilter.type = 'bandpass'
      chargeFilter.frequency.setValueAtTime(200, now)
      chargeFilter.frequency.exponentialRampToValueAtTime(1500, now + 0.25)
      chargeFilter.Q.value = 6
      
      chargeGain.gain.setValueAtTime(0, now)
      chargeGain.gain.linearRampToValueAtTime(0.4, now + 0.2)
      chargeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
      
      charge.connect(chargeFilter)
      chargeFilter.connect(chargeGain)
      chargeGain.connect(this.sfxGainNode!)
      
      charge.start(now)
      charge.stop(now + 0.35)
      
      // ⚡ ELECTRICAL CRACKLE ⚡
      const crackle = ctx.createOscillator()
      const crackleGain = ctx.createGain()
      
      crackle.frequency.setValueAtTime(60, now)
      crackle.type = 'square'
      
      // Fast AM modulation for crackle effect
      const crackleAM = ctx.createOscillator()
      const crackleAMGain = ctx.createGain()
      crackleAM.frequency.value = 40
      crackleAMGain.gain.value = 0.5
      
      crackleGain.gain.setValueAtTime(0, now)
      crackleGain.gain.linearRampToValueAtTime(0.25, now + 0.1)
      crackleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
      
      crackleAM.connect(crackleAMGain)
      crackleAMGain.connect(crackleGain.gain)
      crackle.connect(crackleGain)
      crackleGain.connect(this.sfxGainNode!)
      
      crackle.start(now)
      crackleAM.start(now)
      crackle.stop(now + 0.35)
      crackleAM.stop(now + 0.35)
      
      // 🌀 VOID HARMONIC SWEEP 🌀
      for (let i = 0; i < 4; i++) {
        const harmonic = ctx.createOscillator()
        const harmonicGain = ctx.createGain()
        const delay = i * 0.04
        
        harmonic.frequency.setValueAtTime(300 + i * 150, now + delay)
        harmonic.frequency.exponentialRampToValueAtTime(1800 + i * 200, now + delay + 0.2)
        harmonic.type = 'sine'
        
        harmonicGain.gain.setValueAtTime(0, now + delay)
        harmonicGain.gain.linearRampToValueAtTime(0.12 - i * 0.02, now + delay + 0.03)
        harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.22)
        
        harmonic.connect(harmonicGain)
        harmonicGain.connect(this.sfxGainNode!)
        
        harmonic.start(now + delay)
        harmonic.stop(now + delay + 0.25)
      }
    })
  }

  /**
   * 🔫 Void Sphere Fire Sound - Sinister cyberpunk projectile
   */
  playVoidSphereFireSound(): void {
    this.queueSound(() => {
      const ctx = this.audioContext!
      const now = ctx.currentTime
      
      // 💀 DARK MATTER LAUNCH 💀
      const main = ctx.createOscillator()
      const mainGain = ctx.createGain()
      const mainFilter = ctx.createBiquadFilter()
      
      main.frequency.setValueAtTime(600, now)
      main.frequency.exponentialRampToValueAtTime(150, now + 0.1)
      main.type = 'sawtooth'
      
      mainFilter.type = 'lowpass'
      mainFilter.frequency.setValueAtTime(1200, now)
      mainFilter.frequency.exponentialRampToValueAtTime(300, now + 0.1)
      mainFilter.Q.value = 4
      
      mainGain.gain.setValueAtTime(0, now)
      mainGain.gain.linearRampToValueAtTime(0.45, now + 0.005)
      mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
      
      main.connect(mainFilter)
      mainFilter.connect(mainGain)
      mainGain.connect(this.sfxGainNode!)
      
      main.start(now)
      main.stop(now + 0.15)
      
      // 🌀 VOID WHOOSH 🌀
      const whoosh = ctx.createBufferSource()
      const whooshBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate)
      const whooshData = whooshBuffer.getChannelData(0)
      
      for (let i = 0; i < whooshData.length; i++) {
        const t = i / whooshData.length
        const env = Math.pow(1 - t, 1.5)
        whooshData[i] = (Math.random() * 2 - 1) * env * 0.6
      }
      
      whoosh.buffer = whooshBuffer
      
      const whooshFilter = ctx.createBiquadFilter()
      whooshFilter.type = 'bandpass'
      whooshFilter.frequency.setValueAtTime(800, now)
      whooshFilter.frequency.exponentialRampToValueAtTime(200, now + 0.1)
      whooshFilter.Q.value = 2
      
      const whooshGain = ctx.createGain()
      whooshGain.gain.setValueAtTime(0, now)
      whooshGain.gain.linearRampToValueAtTime(0.3, now + 0.01)
      whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
      
      whoosh.connect(whooshFilter)
      whooshFilter.connect(whooshGain)
      whooshGain.connect(this.sfxGainNode!)
      
      whoosh.start(now)
      whoosh.stop(now + 0.12)
      
      // ⚡ DIGITAL SPIT ⚡
      const spit = ctx.createOscillator()
      const spitGain = ctx.createGain()
      
      spit.frequency.setValueAtTime(1800, now)
      spit.frequency.exponentialRampToValueAtTime(400, now + 0.04)
      spit.type = 'square'
      
      spitGain.gain.setValueAtTime(0, now)
      spitGain.gain.linearRampToValueAtTime(0.2, now + 0.002)
      spitGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
      
      spit.connect(spitGain)
      spitGain.connect(this.sfxGainNode!)
      
      spit.start(now)
      spit.stop(now + 0.06)
      
      // 🔮 HARMONIC TAIL 🔮
      const tail = ctx.createOscillator()
      const tailGain = ctx.createGain()
      
      tail.frequency.setValueAtTime(200, now + 0.02)
      tail.frequency.exponentialRampToValueAtTime(80, now + 0.15)
      tail.type = 'triangle'
      
      tailGain.gain.setValueAtTime(0, now + 0.02)
      tailGain.gain.linearRampToValueAtTime(0.15, now + 0.04)
      tailGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
      
      tail.connect(tailGain)
      tailGain.connect(this.sfxGainNode!)
      
      tail.start(now + 0.02)
      tail.stop(now + 0.2)
    })
  }

  // ============================================
  // 🎵 AMBIENT SOUNDSCAPE - Streamlined Aphex Twin vibes
  // ============================================

  startAmbientSoundscape(): void {
    this.ensureAudioReady().then(ready => {
      if (!ready || this.isAmbientPlaying) return
      
      this.isAmbientPlaying = true
      
      // Core ambient layers - LESS IS MORE
      this.createAmbientDrone()
      this.createEvolvingPads()
      this.createSubtleGlitches()
      this.createRhythmicPulse()
    })
  }

  /**
   * 🌑 Core Drone - Foundation layer
   */
  private createAmbientDrone(): void {
    if (!this.audioContext || !this.ambientGainNode) return
    
    // Two-layer drone
    for (let i = 0; i < 2; i++) {
      const osc = this.audioContext.createOscillator()
      const gain = this.audioContext.createGain()
      const filter = this.audioContext.createBiquadFilter()
      
      const baseFreq = 55 + i * 30
      osc.frequency.value = baseFreq
      osc.type = i === 0 ? 'sine' : 'triangle'
      
      // Slow LFO modulation
      const lfo = this.audioContext.createOscillator()
      const lfoGain = this.audioContext.createGain()
      lfo.frequency.value = 0.03 + Math.random() * 0.02
      lfoGain.gain.value = 3 + i * 2
      
      filter.type = 'lowpass'
      filter.frequency.value = 120 + i * 40
      filter.Q.value = 0.5
      
      gain.gain.value = 0.12 - i * 0.03
      
      lfo.connect(lfoGain)
      lfoGain.connect(osc.frequency)
      
      osc.connect(gain)
      gain.connect(filter)
      filter.connect(this.ambientGainNode)
      
      osc.start()
      lfo.start()
      
      this.ambientNodes.push(osc, lfo)
    }
  }

  /**
   * 🎹 Evolving Pads - Slow morphing textures
   */
  private createEvolvingPads(): void {
    if (!this.audioContext || !this.ambientGainNode) return
    
    for (let layer = 0; layer < 2; layer++) {
      const osc1 = this.audioContext.createOscillator()
      const osc2 = this.audioContext.createOscillator()
      const gain1 = this.audioContext.createGain()
      const gain2 = this.audioContext.createGain()
      const filter = this.audioContext.createBiquadFilter()
      
      const baseFreq = 80 + layer * 45
      osc1.frequency.value = baseFreq
      osc1.type = 'sine'
      
      osc2.frequency.value = baseFreq * 1.5
      osc2.type = 'triangle'
      
      // Slow modulation
      const lfo = this.audioContext.createOscillator()
      const lfoGain = this.audioContext.createGain()
      lfo.frequency.value = 0.02 + Math.random() * 0.03
      lfoGain.gain.value = 5 + layer * 3
      
      filter.type = 'lowpass'
      filter.frequency.value = 200 + layer * 60
      filter.Q.value = 0.7
      
      gain1.gain.value = 0.08 - layer * 0.02
      gain2.gain.value = 0.05 - layer * 0.015
      
      lfo.connect(lfoGain)
      lfoGain.connect(osc1.frequency)
      lfoGain.connect(filter.frequency)
      
      osc1.connect(gain1)
      osc2.connect(gain2)
      gain1.connect(filter)
      gain2.connect(filter)
      filter.connect(this.ambientGainNode)
      
      osc1.start()
      osc2.start()
      lfo.start()
      
      this.ambientNodes.push(osc1, osc2, lfo)
    }
  }

  /**
   * ⚡ Subtle Glitches - Occasional digital artifacts
   */
  private createSubtleGlitches(): void {
    if (!this.audioContext || !this.ambientGainNode) return
    
    const scheduleGlitch = () => {
      if (!this.isAmbientPlaying || !this.audioContext) return
      
      const ctx = this.audioContext
      const now = ctx.currentTime
      
      if (Math.random() > 0.6) {
        // Digital chirp
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        
        const freq = 400 + Math.random() * 800
        osc.frequency.setValueAtTime(freq, now)
        osc.frequency.exponentialRampToValueAtTime(freq * (0.5 + Math.random()), now + 0.05)
        osc.type = 'square'
        
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(0.06, now + 0.005)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
        
        osc.connect(gain)
        gain.connect(this.ambientGainNode!)
        
        osc.start(now)
        osc.stop(now + 0.08)
      }
      
      const nextDelay = 1500 + Math.random() * 3000
      const timeoutId = window.setTimeout(() => scheduleGlitch(), nextDelay)
      this.ambientTimeouts.push(timeoutId)
    }
    
    scheduleGlitch()
  }

  /**
   * 🥁 Rhythmic Pulse - Subtle beat foundation
   */
  private createRhythmicPulse(): void {
    if (!this.audioContext || !this.ambientGainNode) return
    
    const schedulePulse = () => {
      if (!this.isAmbientPlaying || !this.audioContext) return
      
      const ctx = this.audioContext
      const now = ctx.currentTime
      
      if (Math.random() > 0.3) {
        // Sub kick
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const filter = ctx.createBiquadFilter()
        
        osc.frequency.setValueAtTime(60, now)
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.12)
        osc.type = 'sine'
        
        filter.type = 'lowpass'
        filter.frequency.value = 100
        
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(0.15, now + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
        
        osc.connect(gain)
        gain.connect(filter)
        filter.connect(this.ambientGainNode!)
        
        osc.start(now)
        osc.stop(now + 0.18)
      }
      
      // Variable timing for Aphex-style groove
      const nextDelay = 400 + Math.random() * 800
      const timeoutId = window.setTimeout(() => schedulePulse(), nextDelay)
      this.ambientTimeouts.push(timeoutId)
    }
    
    schedulePulse()
  }

  stopAmbientSoundscape(): void {
    this.isAmbientPlaying = false
    
    // Stop all ambient oscillators
    this.ambientNodes.forEach(node => {
      try {
        if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
          node.stop()
        }
      } catch (e) {
        // Already stopped
      }
    })
    this.ambientNodes = []
    
    // Clear all timeouts
    this.ambientTimeouts.forEach(id => window.clearTimeout(id))
    this.ambientTimeouts = []
  }

  // ============================================
  // VOLUME CONTROL
  // ============================================

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = this.masterVolume
    }
  }

  getMasterVolume(): number {
    return this.masterVolume
  }
}
