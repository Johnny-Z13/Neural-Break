import { Player } from '../entities/Player'
import { GameTimer } from '../core/GameTimer'

export class UIManager {
  private healthElement: HTMLElement
  private timerElement: HTMLElement
  private levelElement: HTMLElement
  private xpElement: HTMLElement
  private xpNextElement: HTMLElement

  initialize(): void {
    // Get UI elements
    this.healthElement = document.getElementById('health')!
    this.timerElement = document.getElementById('timeRemaining')!
    this.levelElement = document.getElementById('currentLevel')!
    this.xpElement = document.getElementById('xp')!
    this.xpNextElement = document.getElementById('xpNext')!

    if (!this.healthElement || !this.timerElement || !this.levelElement || !this.xpElement || !this.xpNextElement) {
      console.error('UI elements not found')
    }
  }

  update(player: Player, gameTimer: GameTimer): void {
    // Update health display
    const health = player.getHealth()
    const maxHealth = player.getMaxHealth()
    this.healthElement.textContent = `${health}`
    
    // Change color based on health percentage
    const healthPercentage = health / maxHealth
    const healthBar = this.healthElement.parentElement!
    if (healthPercentage < 0.25) {
      healthBar.style.borderColor = '#FF0000'
      healthBar.style.color = '#FF0000'
    } else if (healthPercentage < 0.5) {
      healthBar.style.borderColor = '#FF6600'
      healthBar.style.color = '#FF6600'
    } else {
      healthBar.style.borderColor = '#00FFFF'
      healthBar.style.color = '#00FFFF'
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

    // Update level and XP display
    this.levelElement.textContent = `${player.getLevel()}`
    this.xpElement.textContent = `${player.getXP()}`
    this.xpNextElement.textContent = `${player.getXPToNext()}`

    // Add glow effect when close to level up
    const xpPercentage = player.getXP() / player.getXPToNext()
    const levelBar = this.levelElement.parentElement!
    if (xpPercentage > 0.8) {
      levelBar.style.boxShadow = '0 0 30px rgba(0, 255, 0, 0.5)'
    } else {
      levelBar.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)'
    }
  }

  showLevelUpNotification(): void {
    // Create temporary level up notification
    const notification = document.createElement('div')
    notification.textContent = 'LEVEL UP!'
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
}
