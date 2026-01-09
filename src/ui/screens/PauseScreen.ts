import { AudioManager } from '../../audio/AudioManager'

/**
 * 🛑 PAUSE SCREEN - Pause Menu with Continue/End Game options
 */
export class PauseScreen {
  private static selectedButtonIndex: number = 0
  private static gamepadInterval: number | null = null
  private static lastGamepadInput: number = 0
  private static inputCooldown: number = 200 // ms
  private static gamepadDeadzone: number = 0.5
  private static keyboardListener: ((e: KeyboardEvent) => void) | null = null

  static create(
    audioManager: AudioManager | null,
    onContinue: () => void,
    onEndGame: () => void
  ): HTMLElement {
    const pauseScreen = document.createElement('div')
    pauseScreen.id = 'pauseScreen'
    pauseScreen.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      color: white;
      font-family: 'Courier New', monospace;
      text-transform: uppercase;
      backdrop-filter: blur(4px);
    `

    // PAUSED title
    const title = document.createElement('h1')
    title.textContent = '⏸ PAUSED'
    title.style.cssText = `
      font-size: 4rem;
      color: #FFD700;
      text-shadow: 0 0 20px #FFD700, 0 0 40px #FF8800;
      margin-bottom: 3rem;
      letter-spacing: 0.3rem;
      animation: pulse 2s ease-in-out infinite;
    `
    pauseScreen.appendChild(title)

    // Button container
    const buttonContainer = document.createElement('div')
    buttonContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      align-items: center;
    `

    // Continue button
    const continueButton = document.createElement('button')
    continueButton.textContent = '► CONTINUE'
    continueButton.id = 'continueButton'
    continueButton.style.cssText = this.getButtonStyle()
    continueButton.addEventListener('mouseenter', () => {
      PauseScreen.selectedButtonIndex = 0
      PauseScreen.updateButtonSelection([continueButton, endGameButton], audioManager)
    })
    continueButton.addEventListener('click', () => {
      if (audioManager) audioManager.playButtonPressSound()
      PauseScreen.cleanup()
      onContinue()
    })
    buttonContainer.appendChild(continueButton)

    // End Game button
    const endGameButton = document.createElement('button')
    endGameButton.textContent = '✕ END GAME'
    endGameButton.id = 'endGameButton'
    endGameButton.style.cssText = this.getButtonStyle()
    endGameButton.addEventListener('mouseenter', () => {
      PauseScreen.selectedButtonIndex = 1
      PauseScreen.updateButtonSelection([continueButton, endGameButton], audioManager)
    })
    endGameButton.addEventListener('click', () => {
      if (audioManager) audioManager.playButtonPressSound()
      PauseScreen.cleanup()
      onEndGame()
    })
    buttonContainer.appendChild(endGameButton)

    pauseScreen.appendChild(buttonContainer)

    // Bottom instruction text
    const instructions = document.createElement('div')
    instructions.textContent = 'ARROW KEYS / WASD / 🎮 TO NAVIGATE • SPACE/ENTER TO SELECT'
    instructions.style.cssText = `
      position: absolute;
      bottom: 2rem;
      font-size: 0.9rem;
      color: #00FFFF;
      text-shadow: 0 0 10px #00FFFF;
      letter-spacing: 0.1rem;
      opacity: 0.8;
    `
    pauseScreen.appendChild(instructions)

    const buttons = [continueButton, endGameButton]
    PauseScreen.selectedButtonIndex = 0

    // 🎮 KEYBOARD NAVIGATION
    PauseScreen.keyboardListener = (e: KeyboardEvent) => {
      const key = e.code.toLowerCase()
      
      // Navigate up/down
      if (key === 'arrowup' || key === 'keyw') {
        e.preventDefault()
        PauseScreen.selectedButtonIndex = Math.max(0, PauseScreen.selectedButtonIndex - 1)
        PauseScreen.updateButtonSelection(buttons, audioManager)
      } else if (key === 'arrowdown' || key === 'keys') {
        e.preventDefault()
        PauseScreen.selectedButtonIndex = Math.min(buttons.length - 1, PauseScreen.selectedButtonIndex + 1)
        PauseScreen.updateButtonSelection(buttons, audioManager)
      } 
      // Select button
      else if (key === 'space' || key === 'enter') {
        e.preventDefault()
        if (audioManager) audioManager.playButtonPressSound()
        
        if (PauseScreen.selectedButtonIndex === 0) {
          PauseScreen.cleanup()
          onContinue()
        } else if (PauseScreen.selectedButtonIndex === 1) {
          PauseScreen.cleanup()
          onEndGame()
        }
      }
      // ESC to continue
      else if (key === 'escape') {
        e.preventDefault()
        if (audioManager) audioManager.playButtonPressSound()
        PauseScreen.cleanup()
        onContinue()
      }
    }
    
    document.addEventListener('keydown', PauseScreen.keyboardListener)

    // 🎮 GAMEPAD NAVIGATION
    PauseScreen.gamepadInterval = window.setInterval(() => {
      const gamepads = navigator.getGamepads()
      const gamepad = gamepads[0]
      
      if (!gamepad) return
      
      const now = Date.now()
      if (now - PauseScreen.lastGamepadInput < PauseScreen.inputCooldown) return
      
      // D-pad or left stick navigation
      const dpadUp = gamepad.buttons[12]?.pressed
      const dpadDown = gamepad.buttons[13]?.pressed
      const leftStickY = gamepad.axes[1] || 0
      
      if (dpadUp || leftStickY < -PauseScreen.gamepadDeadzone) {
        PauseScreen.selectedButtonIndex = Math.max(0, PauseScreen.selectedButtonIndex - 1)
        PauseScreen.updateButtonSelection(buttons, audioManager)
        PauseScreen.lastGamepadInput = now
      } else if (dpadDown || leftStickY > PauseScreen.gamepadDeadzone) {
        PauseScreen.selectedButtonIndex = Math.min(buttons.length - 1, PauseScreen.selectedButtonIndex + 1)
        PauseScreen.updateButtonSelection(buttons, audioManager)
        PauseScreen.lastGamepadInput = now
      }
      
      // A button (Xbox) / X button (PlayStation) to select
      const aButton = gamepad.buttons[0]?.pressed
      const bButton = gamepad.buttons[1]?.pressed // B/Circle to go back (continue)
      
      if (aButton) {
        if (now - PauseScreen.lastGamepadInput < PauseScreen.inputCooldown) return
        
        if (audioManager) audioManager.playButtonPressSound()
        
        if (PauseScreen.selectedButtonIndex === 0) {
          PauseScreen.cleanup()
          onContinue()
        } else if (PauseScreen.selectedButtonIndex === 1) {
          PauseScreen.cleanup()
          onEndGame()
        }
        
        PauseScreen.lastGamepadInput = now
      } else if (bButton) {
        if (now - PauseScreen.lastGamepadInput < PauseScreen.inputCooldown) return
        
        if (audioManager) audioManager.playButtonPressSound()
        PauseScreen.cleanup()
        onContinue()
        
        PauseScreen.lastGamepadInput = now
      }
    }, 50)

    // Initialize button selection
    PauseScreen.updateButtonSelection(buttons, audioManager, true)

    // 🎵 RESUME AUDIO CONTEXT ON FIRST INTERACTION 🎵
    const resumeAudioOnce = () => {
      if (audioManager) {
        audioManager.resumeAudio().catch(e => console.warn('Audio resume failed:', e))
      }
    }
    
    pauseScreen.addEventListener('click', resumeAudioOnce, { once: true })
    pauseScreen.addEventListener('keydown', resumeAudioOnce, { once: true })
    window.addEventListener('gamepadbuttondown', resumeAudioOnce, { once: true })

    return pauseScreen
  }

  private static getButtonStyle(): string {
    return `
      padding: 1rem 3rem;
      font-size: 1.5rem;
      font-family: 'Courier New', monospace;
      text-transform: uppercase;
      letter-spacing: 0.2rem;
      background: rgba(0, 255, 255, 0.1);
      color: #00FFFF;
      border: 3px solid #00FFFF;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.3), 3px 3px 0 #006666;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 300px;
      text-align: center;
    `
  }

  private static updateButtonSelection(
    buttons: HTMLButtonElement[], 
    audioManager: AudioManager | null,
    silent: boolean = false
  ): void {
    buttons.forEach((button, index) => {
      if (index === PauseScreen.selectedButtonIndex) {
        button.classList.add('selected')
        button.style.background = 'rgba(0, 255, 255, 0.3)'
        button.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.8), 3px 3px 0 #006666'
        button.style.color = '#FFFFFF'
        button.style.transform = 'scale(1.05)'
        
        if (!silent && audioManager) {
          audioManager.playButtonHoverSound()
        }
      } else {
        button.classList.remove('selected')
        button.style.background = 'rgba(0, 255, 255, 0.1)'
        button.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3), 3px 3px 0 #006666'
        button.style.color = '#00FFFF'
        button.style.transform = 'scale(1)'
      }
    })
  }

  static cleanup(): void {
    // Remove keyboard listener
    if (PauseScreen.keyboardListener) {
      document.removeEventListener('keydown', PauseScreen.keyboardListener)
      PauseScreen.keyboardListener = null
    }
    
    // Clear gamepad interval
    if (PauseScreen.gamepadInterval !== null) {
      clearInterval(PauseScreen.gamepadInterval)
      PauseScreen.gamepadInterval = null
    }
    
    // Remove the pause screen from DOM
    const pauseScreen = document.getElementById('pauseScreen')
    if (pauseScreen && pauseScreen.parentNode) {
      pauseScreen.parentNode.removeChild(pauseScreen)
    }
  }
}
