/**
 * 🎵 Music Manager - Background Music & Stem System 🎵
 * Handles MP3 playback, crossfading, ducking, and multi-stem dynamic music
 */

interface MusicTrack {
  audio: HTMLAudioElement
  gainNode: GainNode
  name: string
}

interface MusicStem {
  audio: HTMLAudioElement
  gainNode: GainNode
  trackName: string
  stemName: string
}

export class MusicManager {
  private audioContext: AudioContext
  private masterGainNode: GainNode
  private tracks: Map<string, MusicTrack> = new Map()
  private stems: Map<string, Map<string, MusicStem>> = new Map() // trackName -> stemName -> stem
  private currentTrack: MusicTrack | null = null
  private crossfadeDuration = 2.0
  private duckAmount = 0.3
  private baseVolume = 0.6

  constructor(audioContext: AudioContext, masterGain: GainNode) {
    this.audioContext = audioContext
    
    // Create music-specific gain node
    this.masterGainNode = audioContext.createGain()
    this.masterGainNode.gain.value = this.baseVolume
    this.masterGainNode.connect(masterGain)
  }

  /**
   * Load a music track from URL
   */
  async loadTrack(name: string, url: string): Promise<void> {
    try {
      const audio = new Audio(url)
      audio.loop = true
      audio.preload = 'auto'
      audio.crossOrigin = 'anonymous' // For Web Audio API access

      // Create gain node for this track
      const gainNode = this.audioContext.createGain()
      gainNode.gain.value = 0 // Start silent
      gainNode.connect(this.masterGainNode)

      // Connect audio element to Web Audio API
      const source = this.audioContext.createMediaElementSource(audio)
      source.connect(gainNode)

      this.tracks.set(name, { audio, gainNode, name })
      console.log(`🎵 Loaded music track: ${name}`)
    } catch (error) {
      console.warn(`🔇 Failed to load music track ${name}:`, error)
    }
  }

  /**
   * Load a stem (music layer) for a track
   */
  async loadStem(trackName: string, stemName: string, url: string): Promise<void> {
    try {
      const audio = new Audio(url)
      audio.loop = true
      audio.preload = 'auto'
      audio.crossOrigin = 'anonymous'

      const gainNode = this.audioContext.createGain()
      gainNode.gain.value = 0 // Start silent
      gainNode.connect(this.masterGainNode)

      const source = this.audioContext.createMediaElementSource(audio)
      source.connect(gainNode)

      if (!this.stems.has(trackName)) {
        this.stems.set(trackName, new Map())
      }

      this.stems.get(trackName)!.set(stemName, {
        audio,
        gainNode,
        trackName,
        stemName
      })

      console.log(`🎵 Loaded stem: ${trackName}/${stemName}`)
    } catch (error) {
      console.warn(`🔇 Failed to load stem ${trackName}/${stemName}:`, error)
    }
  }

  /**
   * Play a track with optional fade-in
   */
  async play(trackName: string, fadeIn: boolean = true): Promise<void> {
    const track = this.tracks.get(trackName)
    if (!track) {
      console.warn(`🔇 Track not found: ${trackName}`)
      return
    }

    // If another track is playing, crossfade
    if (this.currentTrack && this.currentTrack !== track) {
      await this.crossfade(track)
      return
    }

    // Start fresh
    this.currentTrack = track
    
    try {
      await track.audio.play()
      
      if (fadeIn) {
        const now = this.audioContext.currentTime
        track.gainNode.gain.setValueAtTime(0, now)
        track.gainNode.gain.linearRampToValueAtTime(1.0, now + this.crossfadeDuration)
      } else {
        track.gainNode.gain.value = 1.0
      }

      // Start stems if they exist
      const trackStems = this.stems.get(trackName)
      if (trackStems) {
        for (const stem of trackStems.values()) {
          await stem.audio.play()
          // Stems start at 0 volume by default
        }
      }
    } catch (error) {
      console.warn(`🔇 Failed to play track ${trackName}:`, error)
    }
  }

  /**
   * Crossfade between current track and new track
   */
  private async crossfade(newTrack: MusicTrack): Promise<void> {
    const now = this.audioContext.currentTime
    const duration = this.crossfadeDuration

    // Fade out current track
    if (this.currentTrack) {
      const oldTrack = this.currentTrack
      oldTrack.gainNode.gain.linearRampToValueAtTime(0, now + duration)

      // Fade out its stems
      const oldStems = this.stems.get(oldTrack.name)
      if (oldStems) {
        for (const stem of oldStems.values()) {
          stem.gainNode.gain.linearRampToValueAtTime(0, now + duration)
        }
      }

      // Stop after fade completes
      setTimeout(() => {
        oldTrack.audio.pause()
        if (oldStems) {
          for (const stem of oldStems.values()) {
            stem.audio.pause()
          }
        }
      }, duration * 1000)
    }

    // Fade in new track
    this.currentTrack = newTrack
    try {
      await newTrack.audio.play()
      newTrack.gainNode.gain.setValueAtTime(0, now)
      newTrack.gainNode.gain.linearRampToValueAtTime(1.0, now + duration)

      // Start new track's stems (at 0 volume)
      const newStems = this.stems.get(newTrack.name)
      if (newStems) {
        for (const stem of newStems.values()) {
          await stem.audio.play()
        }
      }
    } catch (error) {
      console.warn(`🔇 Failed to crossfade to ${newTrack.name}:`, error)
    }
  }

  /**
   * Stop current track with fade-out
   */
  stop(fadeOut: boolean = true): void {
    if (!this.currentTrack) return

    const now = this.audioContext.currentTime
    const duration = fadeOut ? this.crossfadeDuration : 0

    // Fade out track
    if (fadeOut) {
      this.currentTrack.gainNode.gain.linearRampToValueAtTime(0, now + duration)
    } else {
      this.currentTrack.gainNode.gain.value = 0
    }

    // Fade out stems
    const trackStems = this.stems.get(this.currentTrack.name)
    if (trackStems) {
      for (const stem of trackStems.values()) {
        if (fadeOut) {
          stem.gainNode.gain.linearRampToValueAtTime(0, now + duration)
        } else {
          stem.gainNode.gain.value = 0
        }
      }
    }

    // Stop playback after fade
    const track = this.currentTrack
    setTimeout(() => {
      track.audio.pause()
      if (trackStems) {
        for (const stem of trackStems.values()) {
          stem.audio.pause()
        }
      }
    }, duration * 1000)

    this.currentTrack = null
  }

  /**
   * Control volume of a specific stem (for dynamic music)
   */
  setStemVolume(stemName: string, volume: number, fadeDuration: number = 1.0): void {
    if (!this.currentTrack) return

    const trackStems = this.stems.get(this.currentTrack.name)
    if (!trackStems) return

    const stem = trackStems.get(stemName)
    if (!stem) {
      console.warn(`🔇 Stem not found: ${this.currentTrack.name}/${stemName}`)
      return
    }

    const now = this.audioContext.currentTime
    stem.gainNode.gain.linearRampToValueAtTime(volume, now + fadeDuration)
  }

  /**
   * Duck music (reduce volume temporarily for important SFX)
   */
  duck(duration: number = 0.5, amount: number = this.duckAmount): void {
    const now = this.audioContext.currentTime
    const currentVolume = this.masterGainNode.gain.value

    // Quick duck down
    this.masterGainNode.gain.linearRampToValueAtTime(amount, now + 0.05)
    
    // Fade back up
    this.masterGainNode.gain.linearRampToValueAtTime(currentVolume, now + duration)
  }

  /**
   * Set master music volume
   */
  setVolume(volume: number, fadeDuration: number = 0.5): void {
    this.baseVolume = Math.max(0, Math.min(1, volume))
    const now = this.audioContext.currentTime
    this.masterGainNode.gain.linearRampToValueAtTime(this.baseVolume, now + fadeDuration)
  }

  /**
   * Get current track name
   */
  getCurrentTrack(): string | null {
    return this.currentTrack?.name || null
  }

  /**
   * Check if music is playing
   */
  isPlaying(): boolean {
    return this.currentTrack !== null && !this.currentTrack.audio.paused
  }

  /**
   * Pause/Resume
   */
  pause(): void {
    if (!this.currentTrack) return
    this.currentTrack.audio.pause()
    
    const trackStems = this.stems.get(this.currentTrack.name)
    if (trackStems) {
      for (const stem of trackStems.values()) {
        stem.audio.pause()
      }
    }
  }

  resume(): void {
    if (!this.currentTrack) return
    this.currentTrack.audio.play()
    
    const trackStems = this.stems.get(this.currentTrack.name)
    if (trackStems) {
      for (const stem of trackStems.values()) {
        stem.audio.play()
      }
    }
  }

  /**
   * Cleanup - stop all music and release resources
   */
  destroy(): void {
    this.stop(false)
    
    for (const track of this.tracks.values()) {
      track.audio.pause()
      track.audio.src = ''
    }
    
    for (const stemMap of this.stems.values()) {
      for (const stem of stemMap.values()) {
        stem.audio.pause()
        stem.audio.src = ''
      }
    }
    
    this.tracks.clear()
    this.stems.clear()
  }
}

