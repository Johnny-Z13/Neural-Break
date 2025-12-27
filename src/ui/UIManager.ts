import { Player } from '../entities/Player'
import { GameTimer } from '../core/GameTimer'
import { GameStats } from '../core/GameState'
import { LevelManager } from '../core/LevelManager'

/**
 * UIManager - Unified HUD and Notification System
 * Uses CSS classes from the unified design system in index.html
 */
export class UIManager {
  private healthElement: HTMLElement | null = null
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
  }

  update(player: Player, gameTimer: GameTimer, gameStats?: GameStats, combo?: number, levelManager?: LevelManager): void {
    // 🎮 HEALTH BAR UPDATE 🎮
    const health = player.getHealth()
    const maxHealth = player.getMaxHealth()
    const healthPercentage = health / maxHealth
    
    // Update health bar fill width
    this.healthBarFill.style.width = `${healthPercentage * 100}%`
    this.healthBarText.textContent = `${Math.ceil(health)}/${maxHealth}`
    
    // 🎨 COLOR SCHEME BASED ON HEALTH 🎨
    const healthBar = this.healthBarContainer.parentElement!
    
    if (healthPercentage < 0.25) {
      // 🔴 CRITICAL - RED AND PULSING! 🔴
      this.healthBarFill.style.background = 'linear-gradient(90deg, #FF0000 0%, #FF4400 100%)'
      this.healthBarContainer.style.borderColor = '#FF0000'
      this.healthBarContainer.style.boxShadow = '0 0 15px rgba(255, 0, 0, 0.8)'
      healthBar.classList.add('health-critical')
      
      if (!this.healthPulseAnimation) {
        this.startHealthPulse()
      }
    } else if (healthPercentage < 0.5) {
      // 🟠 LOW - ORANGE! 🟠
      this.healthBarFill.style.background = 'linear-gradient(90deg, #FF6600 0%, #FF8800 100%)'
      this.healthBarContainer.style.borderColor = '#FF6600'
      this.healthBarContainer.style.boxShadow = '0 0 15px rgba(255, 102, 0, 0.6)'
      healthBar.classList.remove('health-critical')
      this.stopHealthPulse()
    } else {
      // 🟢 HEALTHY - GREEN/CYAN! 🟢
      this.healthBarFill.style.background = 'linear-gradient(90deg, #00FF00 0%, #00FFFF 100%)'
      this.healthBarContainer.style.borderColor = '#00FFFF'
      this.healthBarContainer.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.5)'
      healthBar.classList.remove('health-critical')
      this.stopHealthPulse()
    }
    
    // Update old health element if it exists
    if (this.healthElement) {
      this.healthElement.textContent = `${Math.ceil(health)}`
    }

    // Update timer display
    this.timerElement.textContent = gameTimer.getFormattedRemainingTime()
    
    // Change timer color as time runs out
    const timePercentage = gameTimer.getProgressPercentage()
    const timerElement = this.timerElement.parentElement!
    if (timePercentage > 90) {
      timerElement.style.borderColor = '#FF0000'
      timerElement.style.color = '#FF0000'
      timerElement.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5), 3px 3px 0 #660000'
    } else if (timePercentage > 75) {
      timerElement.style.borderColor = '#FF6600'
      timerElement.style.color = '#FF6600'
      timerElement.style.boxShadow = '0 0 20px rgba(255, 102, 0, 0.5), 3px 3px 0 #663300'
    } else {
      timerElement.style.borderColor = '#00FFFF'
      timerElement.style.color = '#00FFFF'
      timerElement.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3), 3px 3px 0 #006666'
    }

    // Update game level display
    if (levelManager) {
      this.gameLevelElement.textContent = `${levelManager.getCurrentLevel()}`
    }
    
    // Update player level and XP display
    this.levelElement.textContent = `${player.getLevel()}`
    this.xpElement.textContent = `${player.getXP()}`
    this.xpNextElement.textContent = `${player.getXPToNext()}`
    
    // Update power-up level display
    const powerUpLevel = player.getPowerUpLevel()
    const validPowerUpLevel = Math.max(0, Math.min(10, powerUpLevel))
    this.powerUpLevelElement.textContent = `${validPowerUpLevel}`
    
    // Power-up level visual feedback
    const powerUpBar = this.powerUpLevelElement.parentElement!.parentElement!
    if (powerUpLevel >= 10) {
      powerUpBar.style.borderColor = '#FFD700'
      powerUpBar.style.color = '#FFD700'
      powerUpBar.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.5), 3px 3px 0 #886600'
    } else if (powerUpLevel >= 5) {
      powerUpBar.style.borderColor = '#00FF00'
      powerUpBar.style.color = '#00FF00'
      powerUpBar.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.3), 3px 3px 0 #006600'
    } else {
      powerUpBar.style.borderColor = '#00FFFF'
      powerUpBar.style.color = '#00FFFF'
      powerUpBar.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3), 3px 3px 0 #006666'
    }

    // XP bar glow effect when close to level up
    const xpPercentage = player.getXP() / player.getXPToNext()
    const levelBar = this.levelElement.parentElement!.parentElement!
    if (xpPercentage > 0.8) {
      levelBar.style.boxShadow = '0 0 30px rgba(0, 255, 0, 0.5), 3px 3px 0 #660066'
    } else {
      levelBar.style.boxShadow = '0 0 20px rgba(255, 0, 255, 0.3), 3px 3px 0 #660066'
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
        
        // Color coding for high combos
        if (combo >= 10) {
          this.comboElement.style.borderColor = '#FFD700'
          this.comboElement.style.color = '#FFD700'
          this.comboElement.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.6), 3px 3px 0 #886600'
          this.comboElement.style.animation = 'pulse 0.5s ease-in-out infinite'
        } else if (combo >= 5) {
          this.comboElement.style.borderColor = '#FF6600'
          this.comboElement.style.color = '#FF6600'
          this.comboElement.style.boxShadow = '0 0 25px rgba(255, 102, 0, 0.5), 3px 3px 0 #663300'
          this.comboElement.style.animation = 'none'
        } else {
          this.comboElement.style.borderColor = '#00FFFF'
          this.comboElement.style.color = '#00FFFF'
          this.comboElement.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3), 3px 3px 0 #006666'
          this.comboElement.style.animation = 'none'
        }
      } else {
        this.comboElement.style.display = 'none'
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // NOTIFICATION SYSTEM - Using unified CSS classes
  // ═══════════════════════════════════════════════════════════════════

  showLevelUpNotification(level?: number): void {
    const notification = this.createNotification(
      level ? `LEVEL ${level} STARTED!` : 'LEVEL UP!',
      'notification-level-up'
    )
    this.showAndRemove(notification, 2000)
  }

  showDamageIndicator(damage: number): void {
    const notification = this.createNotification(
      `-${damage}`,
      'notification-damage'
    )
    this.showAndRemove(notification, 1000)
  }

  showPowerUpCollected(level: number): void {
    const validLevel = Math.max(0, Math.min(10, level))
    const text = validLevel >= 10 ? '⚡ POWER-UP MAXED! ⚡' : `⚡ POWER-UP ${validLevel}/10 ⚡`
    
    const notification = this.createNotification(text, 'notification-powerup')
    
    // Gold color for maxed
    if (validLevel >= 10) {
      notification.style.color = '#FFD700'
      notification.style.textShadow = '0 0 30px rgba(255, 215, 0, 0.8), 3px 3px 0 #886600'
    }
    
    this.showAndRemove(notification, 1500)
  }
  
  showSpeedUpCollected(level: number): void {
    const validLevel = Math.max(0, Math.min(10, level))
    const text = validLevel >= 10 ? '⚡ SPEED MAXED! ⚡' : `⚡ SPEED +${validLevel * 5}% ⚡`
    
    const notification = this.createNotification(text, 'notification-powerup')
    notification.style.color = validLevel >= 10 ? '#FFD700' : '#FFFF00'
    notification.style.textShadow = `0 0 30px ${validLevel >= 10 ? 'rgba(255, 215, 0, 0.8)' : 'rgba(255, 255, 0, 0.6)'}, 3px 3px 0 #886600`
    
    this.showAndRemove(notification, 1500)
  }

  updateWeaponType(weaponType: string): void {
    if (this.weaponTypeValueElement) {
      const upperType = weaponType.toUpperCase()
      this.weaponTypeValueElement.textContent = upperType
      
      // Color based on weapon type
      const colors: Record<string, string> = {
        'bullets': '#FFAA00',
        'lasers': '#FF0066',
        'photons': '#00FFFF'
      }
      this.weaponTypeValueElement.style.color = colors[weaponType.toLowerCase()] || '#FFAA00'
    }
  }
  
  showWeaponTypeChangeNotification(weaponType: string): void {
    const colors: Record<string, string> = {
      'bullets': '#FFAA00',
      'lasers': '#FF0066',
      'photons': '#00FFFF'
    }
    const color = colors[weaponType.toLowerCase()] || '#FFAA00'
    
    const notification = this.createNotification(
      `WEAPON: ${weaponType.toUpperCase()}`,
      'notification-weapon'
    )
    notification.style.color = color
    
    this.showAndRemove(notification, 2000)
  }
  
  // 🎯 ARCADE-STYLE KILL SCORE POPUP 🎯
  showKillScore(points: number, multiplier: number, x: number, y: number): void {
    const notification = document.createElement('div')
    notification.className = 'kill-score-popup'
    
    // Format: "+500 x3" or just "+100" for x1
    const multiplierText = multiplier > 1 ? ` x${multiplier}` : ''
    const totalPoints = points * multiplier
    notification.textContent = `+${totalPoints.toLocaleString()}${multiplierText}`
    
    // Color and size based on multiplier level
    let color = '#00FF00'
    let fontSize = 'clamp(0.8rem, 2vw, 1.2rem)'
    let glowIntensity = 10
    
    if (multiplier >= 10) {
      color = '#FF00FF'
      fontSize = 'clamp(1.4rem, 3vw, 2rem)'
      glowIntensity = 30
    } else if (multiplier >= 7) {
      color = '#FFD700'
      fontSize = 'clamp(1.2rem, 2.5vw, 1.8rem)'
      glowIntensity = 25
    } else if (multiplier >= 5) {
      color = '#FF6600'
      fontSize = 'clamp(1.1rem, 2.3vw, 1.6rem)'
      glowIntensity = 20
    } else if (multiplier >= 3) {
      color = '#FFFF00'
      fontSize = 'clamp(1rem, 2vw, 1.4rem)'
      glowIntensity = 15
    } else if (multiplier >= 2) {
      color = '#00FFFF'
      fontSize = 'clamp(0.9rem, 2vw, 1.3rem)'
      glowIntensity = 12
    }
    
    // Random offset for variety
    const offsetX = (Math.random() - 0.5) * 60
    const offsetY = (Math.random() - 0.5) * 40
    
    notification.style.cssText = `
      left: ${x + offsetX}px;
      top: ${y + offsetY}px;
      font-size: ${fontSize};
      color: ${color};
      text-shadow: 0 0 ${glowIntensity}px ${color}, 0 0 ${glowIntensity * 2}px ${color};
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 1200)
  }
  
  // 🔥 MULTIPLIER INCREASE NOTIFICATION 🔥
  showMultiplierIncrease(multiplier: number): void {
    if (multiplier < 2) return
    
    let text = `x${multiplier} MULTIPLIER!`
    let color = '#00FFFF'
    let fontSize = 'clamp(1.2rem, 3vw, 1.8rem)'
    
    if (multiplier >= 10) {
      color = '#FF00FF'
      fontSize = 'clamp(2rem, 4vw, 3rem)'
      text = `x${multiplier} INSANE!!!`
    } else if (multiplier >= 7) {
      color = '#FFD700'
      fontSize = 'clamp(1.8rem, 3.5vw, 2.5rem)'
      text = `x${multiplier} INCREDIBLE!`
    } else if (multiplier >= 5) {
      color = '#FF6600'
      fontSize = 'clamp(1.5rem, 3vw, 2.2rem)'
      text = `x${multiplier} AMAZING!`
    } else if (multiplier >= 3) {
      color = '#FFFF00'
      fontSize = 'clamp(1.3rem, 2.8vw, 2rem)'
      text = `x${multiplier} GREAT!`
    }
    
    const notification = this.createNotification(text, 'notification-multiplier')
    notification.style.color = color
    notification.style.fontSize = fontSize
    
    this.showAndRemove(notification, 800)
  }
  
  // 💀 MULTIPLIER LOST NOTIFICATION 💀
  showMultiplierLost(): void {
    const notification = this.createNotification(
      'MULTIPLIER LOST!',
      'notification-multiplier-lost'
    )
    this.showAndRemove(notification, 1000)
  }

  // 🚫 ALREADY AT MAX NOTIFICATION 🚫
  showAlreadyAtMax(type: 'weapons' | 'speed'): void {
    const text = type === 'weapons' ? 'ALREADY AT MAX WEAPONS!' : 'ALREADY AT MAX SPEED!'
    const color = type === 'weapons' ? '#00FFFF' : '#FFFF00'
    
    const notification = this.createNotification(text, 'notification-powerup')
    notification.style.color = color
    notification.style.top = '25%'
    
    this.showAndRemove(notification, 1500)
  }

  // ═══════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════

  private createNotification(text: string, className: string): HTMLElement {
    const notification = document.createElement('div')
    notification.className = `game-notification ${className}`
    notification.textContent = text
    return notification
  }

  private showAndRemove(element: HTMLElement, duration: number): void {
    document.body.appendChild(element)
    setTimeout(() => {
      if (document.body.contains(element)) {
        document.body.removeChild(element)
      }
    }, duration)
  }

  // 🔴 HEALTH PULSE ANIMATION 🔴
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
}
