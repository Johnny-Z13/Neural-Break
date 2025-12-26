export class AudioManager {
  private audioContext: AudioContext | null = null
  private masterVolume: number = 0.3

  initialize(): void {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.warn('Audio not supported:', error)
    }
  }

  private ensureAudioContext(): boolean {
    if (!this.audioContext) {
      return false
    }

    // Resume audio context if suspended (required for user interaction)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }

    return true
  }

  playFireSound(): void {
    if (!this.ensureAudioContext()) return

    try {
      // Create a sharp, high-pitched blip for firing
      const oscillator = this.audioContext!.createOscillator()
      const gainNode = this.audioContext!.createGain()
      
      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext!.destination)
      
      // Configure sound - high pitched blip
      oscillator.frequency.setValueAtTime(800, this.audioContext!.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext!.currentTime + 0.05)
      oscillator.type = 'square'
      
      // Quick attack and decay
      gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.3, this.audioContext!.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.08)
      
      // Play for short duration
      oscillator.start(this.audioContext!.currentTime)
      oscillator.stop(this.audioContext!.currentTime + 0.08)
      
    } catch (error) {
      console.warn('Error playing fire sound:', error)
    }
  }

  playHitSound(): void {
    if (!this.ensureAudioContext()) return

    try {
      // Create a lower, more harsh sound for getting hit
      const oscillator = this.audioContext!.createOscillator()
      const gainNode = this.audioContext!.createGain()
      
      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext!.destination)
      
      // Configure sound - lower pitched, harsh
      oscillator.frequency.setValueAtTime(200, this.audioContext!.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext!.currentTime + 0.1)
      oscillator.type = 'sawtooth'
      
      // Longer, more prominent sound
      gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.5, this.audioContext!.currentTime + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.15)
      
      // Play for longer duration
      oscillator.start(this.audioContext!.currentTime)
      oscillator.stop(this.audioContext!.currentTime + 0.15)
      
    } catch (error) {
      console.warn('Error playing hit sound:', error)
    }
  }

  playEnemyDeathSound(): void {
    if (!this.ensureAudioContext()) return

    try {
      // Create a satisfying enemy death sound
      const oscillator = this.audioContext!.createOscillator()
      const gainNode = this.audioContext!.createGain()
      
      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext!.destination)
      
      // Configure sound - descending pitch
      oscillator.frequency.setValueAtTime(400, this.audioContext!.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext!.currentTime + 0.2)
      oscillator.type = 'triangle'
      
      // Satisfying decay
      gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.2, this.audioContext!.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.2)
      
      oscillator.start(this.audioContext!.currentTime)
      oscillator.stop(this.audioContext!.currentTime + 0.2)
      
    } catch (error) {
      console.warn('Error playing enemy death sound:', error)
    }
  }

  playLevelUpSound(): void {
    if (!this.ensureAudioContext()) return

    try {
      // Create an ascending arpeggio for level up
      const frequencies = [440, 554, 659, 880] // A, C#, E, A octave
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = this.audioContext!.createOscillator()
          const gainNode = this.audioContext!.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(this.audioContext!.destination)
          
          oscillator.frequency.setValueAtTime(freq, this.audioContext!.currentTime)
          oscillator.type = 'sine'
          
          gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime)
          gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.2, this.audioContext!.currentTime + 0.02)
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.3)
          
          oscillator.start(this.audioContext!.currentTime)
          oscillator.stop(this.audioContext!.currentTime + 0.3)
        }, index * 100)
      })
      
    } catch (error) {
      console.warn('Error playing level up sound:', error)
    }
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
  }

  getMasterVolume(): number {
    return this.masterVolume
  }
}
