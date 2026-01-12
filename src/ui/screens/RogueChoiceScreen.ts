import { AudioManager } from '../../audio/AudioManager'
import { RogueSpecial, getRandomSpecials, SpecialType } from '../../core/RogueSpecial'

/**
 * 🎲 ROGUE CHOICE SCREEN - Special Selection Screen
 * 
 * Displays 3 random Specials at the end of each layer.
 * Player must choose 1 to permanently modify their run.
 */
export class RogueChoiceScreen {
  private static selectedButtonIndex: number = 0
  private static gamepadInterval: number | null = null
  private static lastGamepadInput: number = 0
  private static inputCooldown: number = 200 // ms
  private static gamepadDeadzone: number = 0.5
  private static keyboardListener: ((e: KeyboardEvent) => void) | null = null

  static create(
    audioManager: AudioManager | null,
    excludeIds: Set<string>,
    onSelectSpecial: (special: RogueSpecial) => void
  ): HTMLElement {
    // Guard against creating multiple screens
    const existingScreen = document.getElementById('rogueChoiceScreen')
    if (existingScreen) {
      console.warn('⚠️ RogueChoiceScreen already exists, removing old one')
      existingScreen.remove()
      RogueChoiceScreen.cleanup()
    }
    
    const choiceScreen = document.createElement('div')
    choiceScreen.id = 'rogueChoiceScreen'
    choiceScreen.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      color: white;
      font-family: var(--font-family, 'Press Start 2P', monospace);
      text-transform: uppercase;
      backdrop-filter: blur(8px);
      padding: var(--space-md, 1rem);
      box-sizing: border-box;
    `

    // Title
    const title = document.createElement('h1')
    title.textContent = 'NEURAL GATE'
    title.style.cssText = `
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      color: var(--color-purple, #AA00FF);
      text-shadow: 
        0 0 20px var(--color-purple, #AA00FF),
        0 0 40px var(--color-purple, #AA00FF),
        4px 4px 0 var(--color-purple-dark, #660066);
      margin-bottom: var(--space-md, 1rem);
      letter-spacing: 0.2em;
      animation: pulse 2s ease-in-out infinite;
    `
    choiceScreen.appendChild(title)

    // Subtitle
    const subtitle = document.createElement('div')
    subtitle.textContent = 'CHOOSE YOUR MUTATION'
    subtitle.style.cssText = `
      font-size: clamp(0.7rem, 1.5vw, 1rem);
      color: var(--color-cyan, #00FFFF);
      text-shadow: 0 0 10px var(--color-cyan, #00FFFF);
      margin-bottom: var(--space-lg, 2rem);
      letter-spacing: 0.1em;
    `
    choiceScreen.appendChild(subtitle)

    // Get 3 random specials (excluding already-selected ones)
    const specials = getRandomSpecials(3, excludeIds)
    
    // Debug logging
    console.log('🎲 Rogue Choice Screen Created')
    console.log(`   Excluded Specials (${excludeIds.size}):`, Array.from(excludeIds).join(', '))
    console.log(`   Offered Specials: ${specials.map(s => s.id).join(', ')}`)

    // Special cards container
    const cardsContainer = document.createElement('div')
    cardsContainer.style.cssText = `
      display: flex;
      gap: var(--space-md, 1.5rem);
      flex-wrap: wrap;
      justify-content: center;
      max-width: 1200px;
      width: 100%;
      margin-bottom: var(--space-md, 1rem);
    `
    choiceScreen.appendChild(cardsContainer)

    // Create cards for each special
    const cards: HTMLElement[] = []
    specials.forEach((special, index) => {
      const card = this.createSpecialCard(special, index, audioManager, cards, () => {
        if (audioManager) audioManager.playButtonPressSound()
        RogueChoiceScreen.cleanup()
        onSelectSpecial(special)
      })
      cards.push(card)
      cardsContainer.appendChild(card)
    })

    // Instructions
    const instructions = document.createElement('div')
    instructions.textContent = 'ARROW KEYS / WASD / 🎮 TO NAVIGATE • SPACE/ENTER TO SELECT'
    instructions.style.cssText = `
      position: absolute;
      bottom: var(--space-md, 2rem);
      font-size: clamp(0.5rem, 1vw, 0.7rem);
      color: var(--color-yellow, #FFFF00);
      text-shadow: 0 0 8px var(--color-yellow, #FFFF00);
      letter-spacing: 0.1em;
      text-align: center;
    `
    choiceScreen.appendChild(instructions)

    // Add styles
    const style = document.createElement('style')
    style.id = 'rogue-choice-screen-styles'
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      @keyframes cardGlow {
        0%, 100% { box-shadow: 0 0 20px currentColor, 4px 4px 0 currentColor; }
        50% { box-shadow: 0 0 40px currentColor, 6px 6px 0 currentColor; }
      }
    `
    document.head.appendChild(style)

    // Initialize selection
    RogueChoiceScreen.selectedButtonIndex = 0
    RogueChoiceScreen.updateButtonSelection(cards, audioManager, true)

    // Keyboard navigation
    RogueChoiceScreen.keyboardListener = (e: KeyboardEvent) => {
      const key = e.code.toLowerCase()
      
      if (key === 'arrowleft' || key === 'keya') {
        e.preventDefault()
        RogueChoiceScreen.selectedButtonIndex = Math.max(0, RogueChoiceScreen.selectedButtonIndex - 1)
        RogueChoiceScreen.updateButtonSelection(cards, audioManager)
      } else if (key === 'arrowright' || key === 'keyd') {
        e.preventDefault()
        RogueChoiceScreen.selectedButtonIndex = Math.min(cards.length - 1, RogueChoiceScreen.selectedButtonIndex + 1)
        RogueChoiceScreen.updateButtonSelection(cards, audioManager)
      } else if (key === 'space' || key === 'enter') {
        e.preventDefault()
        if (audioManager) audioManager.playButtonPressSound()
        RogueChoiceScreen.cleanup()
        onSelectSpecial(specials[RogueChoiceScreen.selectedButtonIndex])
      }
    }
    
    document.addEventListener('keydown', RogueChoiceScreen.keyboardListener)

    // Gamepad navigation
    RogueChoiceScreen.gamepadInterval = window.setInterval(() => {
      const gamepads = navigator.getGamepads()
      const gamepad = gamepads[0]
      
      if (!gamepad) return
      
      const now = Date.now()
      if (now - RogueChoiceScreen.lastGamepadInput < RogueChoiceScreen.inputCooldown) return
      
      const dpadLeft = gamepad.buttons[14]?.pressed
      const dpadRight = gamepad.buttons[15]?.pressed
      const leftStickX = gamepad.axes[0] || 0
      
      if (dpadLeft || leftStickX < -RogueChoiceScreen.gamepadDeadzone) {
        RogueChoiceScreen.selectedButtonIndex = Math.max(0, RogueChoiceScreen.selectedButtonIndex - 1)
        RogueChoiceScreen.updateButtonSelection(cards, audioManager)
        RogueChoiceScreen.lastGamepadInput = now
      } else if (dpadRight || leftStickX > RogueChoiceScreen.gamepadDeadzone) {
        RogueChoiceScreen.selectedButtonIndex = Math.min(cards.length - 1, RogueChoiceScreen.selectedButtonIndex + 1)
        RogueChoiceScreen.updateButtonSelection(cards, audioManager)
        RogueChoiceScreen.lastGamepadInput = now
      }
      
      const aButton = gamepad.buttons[0]?.pressed
      if (aButton) {
        if (now - RogueChoiceScreen.lastGamepadInput < RogueChoiceScreen.inputCooldown) return
        
        if (audioManager) audioManager.playButtonPressSound()
        RogueChoiceScreen.cleanup()
        onSelectSpecial(specials[RogueChoiceScreen.selectedButtonIndex])
        RogueChoiceScreen.lastGamepadInput = now
      }
    }, 50)

    return choiceScreen
  }

  private static createSpecialCard(
    special: RogueSpecial,
    index: number,
    audioManager: AudioManager | null,
    cards: HTMLElement[],
    onSelect: () => void
  ): HTMLElement {
    const card = document.createElement('div')
    card.className = 'rogue-special-card'
    card.dataset.index = index.toString()
    
    // Color based on type
    let borderColor = '#AA00FF'
    let glowColor = 'rgba(170, 0, 255, 0.4)'
    if (special.type === SpecialType.STAT) {
      borderColor = '#00FFFF'
      glowColor = 'rgba(0, 255, 255, 0.4)'
    } else if (special.type === SpecialType.FIRING_MODE) {
      borderColor = '#FF6600'
      glowColor = 'rgba(255, 102, 0, 0.4)'
    } else if (special.type === SpecialType.BEHAVIOURAL) {
      borderColor = '#00FF00'
      glowColor = 'rgba(0, 255, 0, 0.4)'
    }
    
    card.style.cssText = `
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 0, 30, 0.95) 100%);
      border: var(--border-thick, 4px) solid ${borderColor};
      padding: var(--space-md, 1.5rem);
      min-width: 280px;
      max-width: 350px;
      flex: 1;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 
        0 0 20px ${glowColor},
        var(--shadow-pixel, 4px 4px 0) ${borderColor}44;
    `
    
    // Type badge
    const typeBadge = document.createElement('div')
    typeBadge.textContent = special.type.toUpperCase().replace('_', ' ')
    typeBadge.style.cssText = `
      font-size: clamp(0.5rem, 1vw, 0.7rem);
      color: ${borderColor};
      text-shadow: 0 0 8px ${borderColor};
      margin-bottom: var(--space-sm, 0.8rem);
      letter-spacing: 0.1em;
    `
    card.appendChild(typeBadge)
    
    // Name
    const name = document.createElement('h3')
    name.textContent = special.name
    name.style.cssText = `
      font-size: clamp(0.9rem, 2vw, 1.3rem);
      color: ${borderColor};
      text-shadow: 
        0 0 15px ${borderColor},
        2px 2px 0 ${borderColor}44;
      margin-bottom: var(--space-sm, 0.8rem);
      letter-spacing: 0.1em;
      line-height: 1.4;
    `
    card.appendChild(name)
    
    // Description
    const description = document.createElement('div')
    description.textContent = special.description
    description.style.cssText = `
      font-size: clamp(0.6rem, 1.2vw, 0.8rem);
      color: var(--color-cyan, #00FFFF);
      text-shadow: 0 0 8px var(--color-cyan, #00FFFF);
      line-height: 1.5;
      margin-bottom: var(--space-sm, 0.8rem);
    `
    card.appendChild(description)
    
    // Selection indicator
    const indicator = document.createElement('div')
    indicator.textContent = '▶ SELECT'
    indicator.className = 'selection-indicator'
    indicator.style.cssText = `
      font-size: clamp(0.6rem, 1.2vw, 0.8rem);
      color: var(--color-yellow, #FFFF00);
      text-shadow: 0 0 10px var(--color-yellow, #FFFF00);
      opacity: 0;
      transition: opacity 0.2s;
      text-align: center;
      margin-top: var(--space-sm, 0.8rem);
    `
    card.appendChild(indicator)
    
    // Event listeners
    card.addEventListener('mouseenter', () => {
      RogueChoiceScreen.selectedButtonIndex = index
      // Use the cards array passed to this function (closure)
      // This ensures we always reference the correct cards from this screen instance
      RogueChoiceScreen.updateButtonSelection(cards, audioManager)
    })
    
    card.addEventListener('click', () => {
      if (audioManager) audioManager.playButtonPressSound()
      onSelect()
    })
    
    return card
  }

  private static updateButtonSelection(
    cards: HTMLElement[],
    audioManager: AudioManager | null,
    silent: boolean = false
  ): void {
    cards.forEach((card, index) => {
      const indicator = card.querySelector('.selection-indicator') as HTMLElement
      if (index === RogueChoiceScreen.selectedButtonIndex) {
        card.classList.add('selected')
        if (indicator) indicator.style.opacity = '1'
        card.style.transform = 'translateY(-8px) scale(1.05)'
        card.style.boxShadow = `
          0 0 40px currentColor,
          6px 6px 0 currentColor
        `
        if (!silent && audioManager) {
          audioManager.playButtonHoverSound()
        }
      } else {
        card.classList.remove('selected')
        if (indicator) indicator.style.opacity = '0'
        card.style.transform = 'translateY(0) scale(1)'
        const borderColor = card.style.borderColor || '#AA00FF'
        const glowColor = borderColor + '44'
        card.style.boxShadow = `
          0 0 20px ${glowColor},
          4px 4px 0 ${glowColor}
        `
      }
    })
  }

  static cleanup(): void {
    // Remove styles
    const styleEl = document.getElementById('rogue-choice-screen-styles')
    if (styleEl) {
      styleEl.remove()
    }

    // Clean up keyboard listener
    if (RogueChoiceScreen.keyboardListener) {
      document.removeEventListener('keydown', RogueChoiceScreen.keyboardListener)
      RogueChoiceScreen.keyboardListener = null
    }

    // Clean up gamepad polling
    if (RogueChoiceScreen.gamepadInterval !== null) {
      clearInterval(RogueChoiceScreen.gamepadInterval)
      RogueChoiceScreen.gamepadInterval = null
    }

    // Reset state
    RogueChoiceScreen.selectedButtonIndex = 0
    RogueChoiceScreen.lastGamepadInput = 0
  }
}
