import { Player } from '../entities/Player'
import { GameTimer } from '../core/GameTimer'
import { GameStats } from '../core/GameState'
import { LevelManager } from '../core/LevelManager'

export class UIManager {
  private healthElement: HTMLElement | null = null // Optional - doesn't exist in HTML
  private healthBarFill: HTMLElement
  private healthBarText: HTMLElement
  private healthBarContainer: HTMLElement
  private timerElement: HTMLElement
  private gameLevelElement: HTMLElement
  private levelElement: HTMLElement
  private xpElement: HTMLElement
  private xpNextElement: HTMLElement
  private scoreElement: HTMLElement
  private comboElement: HTMLElement
  private comboCountElement: HTMLElement
  private powerUpLevelElement: HTMLElement
  private weaponTypeElement: HTMLElement
  private weaponTypeValueElement: HTMLElement
  private healthPulseAnimation: number | null = null

  initialize(): void {
    // Get UI elements
    // Note: 'health' element doesn't exist in HTML, so we make it optional
    this.healthElement = document.getElementById('health') || null
    this.healthBarFill = document.getElementById('healthBarFill')!
    this.healthBarText = document.getElementById('healthBarText')!
    this.healthBarContainer = document.getElementById('healthBarContainer')!
    this.timerElement = document.getElementById('timeRemaining')!
    this.gameLevelElement = document.getElementById('gameLevel')!
    this.levelElement = document.getElementById('currentLevel')!
    this.xpElement = document.getElementById('xp')!
    this.xpNextElement = document.getElementById('xpNext')!
    this.scoreElement = document.getElementById('currentScore')!
    this.comboElement = document.getElementById('combo')!
    this.comboCountElement = document.getElementById('comboCount')!
    this.powerUpLevelElement = document.getElementById('powerUpLevel')!
    this.weaponTypeElement = document.getElementById('weaponType')!
    this.weaponTypeValueElement = document.getElementById('weaponTypeValue')!

    if (!this.healthBarFill || !this.healthBarText || !this.healthBarContainer || 
        !this.timerElement || !this.gameLevelElement || !this.levelElement || 
        !this.xpElement || !this.xpNextElement || !this.scoreElement || 
        !this.comboElement || !this.comboCountElement || !this.powerUpLevelElement ||
        !this.weaponTypeElement || !this.weaponTypeValueElement) {
      console.error('❌ Critical UI elements not found! Game may not function properly.')
      throw new Error('Required UI elements are missing from the DOM')
    }
    
    // 🎯 ADD ARCADE SCORE ANIMATION STYLES 🎯
    this.addArcadeScoreStyles()
  }
  
  private addArcadeScoreStyles(): void {
    // Check if styles already exist
    if (document.getElementById('arcade-score-styles')) return
    
    const style = document.createElement('style')
    style.id = 'arcade-score-styles'
    style.textContent = `
      @keyframes killScoreFloat {
        0% { 
          opacity: 1; 
          transform: translateY(0) scale(1);
        }
        50% {
          opacity: 1;
          transform: translateY(-30px) scale(1.1);
        }
        100% { 
          opacity: 0; 
          transform: translateY(-60px) scale(0.8);
        }
      }
      
      @keyframes multiplierPop {
        0% { 
          opacity: 0; 
          transform: translate(-50%, -50%) scale(0.3);
        }
        30% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1.3);
        }
        50% {
          transform: translate(-50%, -50%) scale(1);
        }
        100% { 
          opacity: 0; 
          transform: translate(-50%, -50%) scale(1.5);
        }
      }
      
      @keyframes multiplierLost {
        0% { 
          opacity: 1; 
          transform: translate(-50%, -50%) scale(1);
        }
        20% {
          transform: translate(-50%, -50%) scale(1.2) rotate(-5deg);
        }
        40% {
          transform: translate(-50%, -50%) scale(1.1) rotate(5deg);
        }
        100% { 
          opacity: 0; 
          transform: translate(-50%, -50%) scale(0.5) translateY(50px);
        }
      }
    `
    document.head.appendChild(style)
  }

  update(player: Player, gameTimer: GameTimer, gameStats?: GameStats, combo?: number, levelManager?: LevelManager): void {
    // 🎮 RETRO-STYLE HEALTH BAR UPDATE! 🎮
    const health = player.getHealth()
    const maxHealth = player.getMaxHealth()
    const healthPercentage = health / maxHealth
    
    // Update health bar fill width
    this.healthBarFill.style.width = `${healthPercentage * 100}%`
    this.healthBarText.textContent = `${Math.ceil(health)}/${maxHealth}`
    
    // 🎨 RETRO COLOR SCHEME BASED ON HEALTH! 🎨
    let barColor: string
    let borderColor: string
    let shadowColor: string
    
    if (healthPercentage < 0.25) {
      // 🔴 CRITICAL - RED AND PULSING! 🔴
      barColor = 'linear-gradient(90deg, #FF0000 0%, #FF4400 100%)'
      borderColor = '#FF0000'
      shadowColor = 'rgba(255, 0, 0, 0.8)'
      
      // Add CSS class for pulsing animation
      this.healthBarContainer.classList.add('health-critical')
      
      // Start pulsing animation if not already running
      if (!this.healthPulseAnimation) {
        this.startHealthPulse()
      }
    } else if (healthPercentage < 0.5) {
      // Remove critical class
      this.healthBarContainer.classList.remove('health-critical')
      this.stopHealthPulse()
      // 🟠 LOW - ORANGE! 🟠
      barColor = 'linear-gradient(90deg, #FF6600 0%, #FF8800 100%)'
      borderColor = '#FF6600'
      shadowColor = 'rgba(255, 102, 0, 0.6)'
      this.stopHealthPulse()
    } else {
      // 🟢 HEALTHY - GREEN/CYAN! 🟢
      barColor = 'linear-gradient(90deg, #00FF00 0%, #00FFFF 100%)'
      borderColor = '#00FFFF'
      shadowColor = 'rgba(0, 255, 255, 0.5)'
      
      // Remove critical class
      this.healthBarContainer.classList.remove('health-critical')
      this.stopHealthPulse()
    }
    
    // Apply colors
    this.healthBarFill.style.background = barColor
    this.healthBarFill.style.boxShadow = `0 0 10px ${shadowColor}`
    this.healthBarContainer.style.borderColor = borderColor
    this.healthBarContainer.style.boxShadow = `0 0 10px ${shadowColor}`
    
    // Update old health element if it exists (for backwards compatibility)
    if (this.healthElement) {
      this.healthElement.textContent = `${Math.ceil(health)}`
    }

    // Update timer display
    this.timerElement.textContent = gameTimer.getFormattedRemainingTime()
    
    // Change timer color as time runs out
    const timePercentage = gameTimer.getProgressPercentage()
    const timerBar = this.timerElement.parentElement!
    if (timePercentage > 90) {
      timerBar.style.borderColor = '#FF0000'
      timerBar.style.color = '#FF0000'
    } else if (timePercentage > 75) {
      timerBar.style.borderColor = '#FF6600'
      timerBar.style.color = '#FF6600'
    } else {
      timerBar.style.borderColor = '#00FFFF'
      timerBar.style.color = '#00FFFF'
    }

    // Update game level display
    if (levelManager) {
      this.gameLevelElement.textContent = `${levelManager.getCurrentLevel()}`
    }
    
    // Update player level and XP display
    this.levelElement.textContent = `${player.getLevel()}`
    this.xpElement.textContent = `${player.getXP()}`
    this.xpNextElement.textContent = `${player.getXPToNext()}`
    
    // Update power-up level display - ensure it matches player's actual level
    const powerUpLevel = player.getPowerUpLevel()
    const validPowerUpLevel = Math.max(0, Math.min(10, powerUpLevel)) // Clamp to 0-10
    this.powerUpLevelElement.textContent = `${validPowerUpLevel}`
    
    // Add visual feedback for power-up level
    const powerUpBar = this.powerUpLevelElement.parentElement!
    if (powerUpLevel >= 10) {
      powerUpBar.style.borderColor = '#FFD700'
      powerUpBar.style.color = '#FFD700'
      powerUpBar.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.5)'
    } else if (powerUpLevel >= 5) {
      powerUpBar.style.borderColor = '#00FF00'
      powerUpBar.style.color = '#00FF00'
      powerUpBar.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.3)'
    } else if (powerUpLevel > 0) {
      powerUpBar.style.borderColor = '#00FFFF'
      powerUpBar.style.color = '#00FFFF'
      powerUpBar.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.2)'
    } else {
      powerUpBar.style.borderColor = '#00FFFF'
      powerUpBar.style.color = '#00FFFF'
      powerUpBar.style.boxShadow = 'none'
    }

    // Add glow effect when close to level up
    const xpPercentage = player.getXP() / player.getXPToNext()
    const levelBar = this.levelElement.parentElement!
    if (xpPercentage > 0.8) {
      levelBar.style.boxShadow = '0 0 30px rgba(0, 255, 0, 0.5)'
    } else {
      levelBar.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)'
    }

    // Update score display
    if (gameStats) {
      this.scoreElement.textContent = gameStats.score.toLocaleString()
    }

    // Update combo display
    if (combo !== undefined) {
      if (combo > 1) {
        this.comboElement.style.display = 'block'
        this.comboCountElement.textContent = `${combo}`
        
        // Add special effects for high combos
        if (combo >= 10) {
          this.comboElement.style.color = '#FFD700'
          this.comboElement.style.textShadow = '0 0 20px #FFD700'
          this.comboElement.style.animation = 'pulse 0.5s ease-in-out infinite alternate'
        } else if (combo >= 5) {
          this.comboElement.style.color = '#FF6600'
          this.comboElement.style.textShadow = '0 0 15px #FF6600'
          this.comboElement.style.animation = 'none'
        } else {
          this.comboElement.style.color = '#00FFFF'
          this.comboElement.style.textShadow = '0 0 10px #00FFFF'
          this.comboElement.style.animation = 'none'
        }
      } else {
        this.comboElement.style.display = 'none'
      }
    }
  }

  showLevelUpNotification(level?: number): void {
    // Create temporary level up notification
    const notification = document.createElement('div')
    notification.textContent = level ? `LEVEL ${level} STARTED!` : 'LEVEL UP!'
    notification.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 36px;
      color: #00FF00;
      text-shadow: 0 0 20px #00FF00;
      pointer-events: none;
      z-index: 1000;
      animation: fadeInOut 2s ease-in-out;
    `

    // Add CSS animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      }
    `
    document.head.appendChild(style)

    document.body.appendChild(notification)
    
    setTimeout(() => {
      document.body.removeChild(notification)
      document.head.removeChild(style)
    }, 2000)
  }

  showDamageIndicator(damage: number): void {
    // Create damage indicator
    const indicator = document.createElement('div')
    indicator.textContent = `-${damage}`
    indicator.style.cssText = `
      position: absolute;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
      font-size: 24px;
      color: #FF0000;
      text-shadow: 0 0 10px #FF0000;
      pointer-events: none;
      z-index: 1000;
      animation: damageFloat 1s ease-out;
    `

    // Add CSS animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes damageFloat {
        0% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-50px); }
      }
    `
    document.head.appendChild(style)

    document.body.appendChild(indicator)
    
    setTimeout(() => {
      document.body.removeChild(indicator)
      document.head.removeChild(style)
    }, 1000)
  }

  // 🔴 HEALTH PULSE ANIMATION - When health is critical! 🔴
  private startHealthPulse(): void {
    if (this.healthPulseAnimation) return
    
    const pulse = () => {
      const intensity = 0.5 + Math.sin(Date.now() * 0.01) * 0.5
      this.healthBarContainer.style.boxShadow = `0 0 ${10 + intensity * 20}px rgba(255, 0, 0, ${0.6 + intensity * 0.4})`
      this.healthBarContainer.style.borderColor = `rgba(255, 0, 0, ${0.8 + intensity * 0.2})`
      this.healthBarFill.style.boxShadow = `0 0 ${5 + intensity * 15}px rgba(255, 0, 0, ${0.8 + intensity * 0.2})`
      
      this.healthPulseAnimation = requestAnimationFrame(pulse)
    }
    
    this.healthPulseAnimation = requestAnimationFrame(pulse)
  }
  
  private stopHealthPulse(): void {
    if (this.healthPulseAnimation) {
      cancelAnimationFrame(this.healthPulseAnimation)
      this.healthPulseAnimation = null
    }
  }

  // 🎯 UPDATE WEAPON TYPE DISPLAY 🎯
  updateWeaponType(weaponType: string): void {
    if (this.weaponTypeValueElement) {
      const upperType = weaponType.toUpperCase()
      this.weaponTypeValueElement.textContent = upperType
      
      // Color based on weapon type
      switch (weaponType.toLowerCase()) {
        case 'bullets':
          this.weaponTypeValueElement.style.color = '#FFAA00'
          break
        case 'lasers':
          this.weaponTypeValueElement.style.color = '#FF0066'
          break
        case 'photons':
          this.weaponTypeValueElement.style.color = '#00FFFF'
          break
        default:
          this.weaponTypeValueElement.style.color = '#FFAA00'
      }
    }
  }
  
  // 🎯 SHOW WEAPON TYPE CHANGE NOTIFICATION 🎯
  showWeaponTypeChangeNotification(weaponType: string): void {
    const notification = document.createElement('div')
    notification.textContent = `WEAPON: ${weaponType.toUpperCase()}`
    notification.style.cssText = `
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 32px;
      font-weight: bold;
      text-shadow: 0 0 20px currentColor;
      pointer-events: none;
      z-index: 1000;
      animation: weaponFadeInOut 2s ease-in-out;
    `
    
    // Color based on weapon type
    switch (weaponType.toLowerCase()) {
      case 'bullets':
        notification.style.color = '#FFAA00'
        break
      case 'lasers':
        notification.style.color = '#FF0066'
        break
      case 'photons':
        notification.style.color = '#00FFFF'
        break
      default:
        notification.style.color = '#FFAA00'
    }
    
    // Add CSS animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes weaponFadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      }
    `
    document.head.appendChild(style)
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }, 2000)
  }

  showPowerUpCollected(level: number): void {
    // Ensure level is valid (0-10)
    const validLevel = Math.max(0, Math.min(10, level))
    
    // Create power-up collected notification
    const notification = document.createElement('div')
    notification.textContent = validLevel >= 10 ? 'POWER-UP MAXED!' : `POWER-UP ${validLevel}/10`
    notification.style.cssText = `
      position: absolute;
      top: 30%;
      left: 50%;
      transform: translateX(-50%);
      font-size: 28px;
      color: ${validLevel >= 10 ? '#FFD700' : '#00FFFF'};
      text-shadow: 0 0 20px ${validLevel >= 10 ? '#FFD700' : '#00FFFF'};
      pointer-events: none;
      z-index: 1000;
      animation: powerUpFloat 1.5s ease-out;
    `

    // Add CSS animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes powerUpFloat {
        0% { opacity: 0; transform: translateX(-50%) translateY(0) scale(0.5); }
        20% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.2); }
        80% { opacity: 1; transform: translateX(-50%) translateY(-30px) scale(1); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-60px) scale(0.8); }
      }
    `
    document.head.appendChild(style)

    document.body.appendChild(notification)
    
    setTimeout(() => {
      document.body.removeChild(notification)
      document.head.removeChild(style)
    }, 1500)
  }
  
  // ⚡ SPEED-UP COLLECTED NOTIFICATION ⚡
  showSpeedUpCollected(level: number): void {
    // Ensure level is valid (0-10)
    const validLevel = Math.max(0, Math.min(10, level))
    
    // Create speed-up collected notification
    const notification = document.createElement('div')
    notification.textContent = validLevel >= 10 ? 'SPEED MAXED!' : `SPEED +${validLevel * 5}%`
    notification.style.cssText = `
      position: absolute;
      top: 35%;
      left: 50%;
      transform: translateX(-50%);
      font-size: 28px;
      color: ${validLevel >= 10 ? '#FFD700' : '#FFFF00'};
      text-shadow: 0 0 20px ${validLevel >= 10 ? '#FFD700' : '#FFAA00'};
      pointer-events: none;
      z-index: 1000;
      animation: speedUpFloat 1.5s ease-out;
    `

    // Add CSS animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes speedUpFloat {
        0% { opacity: 0; transform: translateX(-50%) translateY(0) scale(0.5); }
        20% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.2); }
        80% { opacity: 1; transform: translateX(-50%) translateY(-30px) scale(1); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-60px) scale(0.8); }
      }
    `
    document.head.appendChild(style)

    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }, 1500)
  }
  
  // 🎯 ARCADE-STYLE KILL SCORE POPUP! 🎯
  showKillScore(points: number, multiplier: number, x: number, y: number): void {
    const notification = document.createElement('div')
    
    // Format: "+500 x3" or just "+100" for x1
    const multiplierText = multiplier > 1 ? ` x${multiplier}` : ''
    const totalPoints = points * multiplier
    notification.textContent = `+${totalPoints.toLocaleString()}${multiplierText}`
    
    // Color based on multiplier level
    let color = '#00FF00' // Green for x1
    let fontSize = 20
    let glowIntensity = 10
    
    if (multiplier >= 10) {
      color = '#FF00FF' // Magenta for x10+
      fontSize = 36
      glowIntensity = 30
    } else if (multiplier >= 7) {
      color = '#FFD700' // Gold for x7+
      fontSize = 32
      glowIntensity = 25
    } else if (multiplier >= 5) {
      color = '#FF6600' // Orange for x5+
      fontSize = 28
      glowIntensity = 20
    } else if (multiplier >= 3) {
      color = '#FFFF00' // Yellow for x3+
      fontSize = 24
      glowIntensity = 15
    } else if (multiplier >= 2) {
      color = '#00FFFF' // Cyan for x2
      fontSize = 22
      glowIntensity = 12
    }
    
    // Random offset for variety
    const offsetX = (Math.random() - 0.5) * 60
    const offsetY = (Math.random() - 0.5) * 40
    
    notification.style.cssText = `
      position: absolute;
      left: ${x + offsetX}px;
      top: ${y + offsetY}px;
      font-size: ${fontSize}px;
      font-weight: bold;
      font-family: 'Press Start 2P', 'Courier New', monospace;
      color: ${color};
      text-shadow: 0 0 ${glowIntensity}px ${color}, 0 0 ${glowIntensity * 2}px ${color};
      pointer-events: none;
      z-index: 2000;
      animation: killScoreFloat 1.2s ease-out forwards;
      white-space: nowrap;
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 1200)
  }
  
  // 🔥 MULTIPLIER INCREASE NOTIFICATION! 🔥
  showMultiplierIncrease(multiplier: number): void {
    // Only show for significant multipliers
    if (multiplier < 2) return
    
    const notification = document.createElement('div')
    notification.textContent = `x${multiplier} MULTIPLIER!`
    
    // Color and size based on multiplier
    let color = '#00FFFF'
    let fontSize = 28
    
    if (multiplier >= 10) {
      color = '#FF00FF'
      fontSize = 48
      notification.textContent = `x${multiplier} INSANE!!!`
    } else if (multiplier >= 7) {
      color = '#FFD700'
      fontSize = 42
      notification.textContent = `x${multiplier} INCREDIBLE!`
    } else if (multiplier >= 5) {
      color = '#FF6600'
      fontSize = 36
      notification.textContent = `x${multiplier} AMAZING!`
    } else if (multiplier >= 3) {
      color = '#FFFF00'
      fontSize = 32
      notification.textContent = `x${multiplier} GREAT!`
    }
    
    notification.style.cssText = `
      position: absolute;
      top: 45%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: ${fontSize}px;
      font-weight: bold;
      font-family: 'Press Start 2P', 'Courier New', monospace;
      color: ${color};
      text-shadow: 0 0 20px ${color}, 0 0 40px ${color};
      pointer-events: none;
      z-index: 2001;
      animation: multiplierPop 0.8s ease-out forwards;
      white-space: nowrap;
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 800)
  }
  
  // 💀 MULTIPLIER LOST NOTIFICATION! 💀
  showMultiplierLost(): void {
    const notification = document.createElement('div')
    notification.textContent = 'MULTIPLIER LOST!'
    
    notification.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 24px;
      font-weight: bold;
      font-family: 'Press Start 2P', 'Courier New', monospace;
      color: #FF0000;
      text-shadow: 0 0 15px #FF0000;
      pointer-events: none;
      z-index: 2001;
      animation: multiplierLost 1s ease-out forwards;
      white-space: nowrap;
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 1000)
  }

  // 🚫 ALREADY AT MAX NOTIFICATION 🚫
  showAlreadyAtMax(type: 'weapons' | 'speed'): void {
    const notification = document.createElement('div')
    notification.textContent = type === 'weapons' ? 'ALREADY AT MAX WEAPONS!' : 'ALREADY AT MAX SPEED!'
    
    const color = type === 'weapons' ? '#00FFFF' : '#FFFF00'
    
    notification.style.cssText = `
      position: absolute;
      top: 25%;
      left: 50%;
      transform: translateX(-50%);
      font-size: 24px;
      color: ${color};
      text-shadow: 0 0 15px ${color};
      pointer-events: none;
      z-index: 1000;
      opacity: 0.9;
      animation: maxNotification 1.5s ease-out;
    `

    // Add CSS animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes maxNotification {
        0% { opacity: 0; transform: translateX(-50%) scale(0.8); }
        20% { opacity: 1; transform: translateX(-50%) scale(1.1); }
        30% { transform: translateX(-50%) scale(1); }
        70% { opacity: 1; }
        100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
      }
    `
    document.head.appendChild(style)

    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }, 1500)
  }
}
