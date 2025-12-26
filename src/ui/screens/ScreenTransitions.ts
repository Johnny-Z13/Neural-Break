import { SceneManager } from '../../graphics/SceneManager'

/**
 * Utility functions for screen transitions and animations
 */
export class ScreenTransitions {
  static transitionOut(
    currentScreen: HTMLElement | null,
    sceneManager: SceneManager | null,
    onComplete: () => void,
    type: 'fade' | 'zoom' | 'slide' | 'particle' = 'fade'
  ): void {
    if (!currentScreen) {
      onComplete()
      return
    }

    // Trigger camera transition if available
    if (sceneManager) {
      sceneManager.startTransition(type, 0.4)
    }

    // Animate out
    currentScreen.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    
    switch (type) {
      case 'fade':
        currentScreen.style.opacity = '0'
        break
      case 'zoom':
        currentScreen.style.transform = 'scale(1.2)'
        currentScreen.style.opacity = '0'
        break
      case 'slide':
        currentScreen.style.transform = 'translateX(-100%)'
        currentScreen.style.opacity = '0'
        break
      case 'particle':
        currentScreen.style.opacity = '0'
        currentScreen.style.filter = 'blur(10px)'
        break
    }

    setTimeout(() => {
      onComplete()
      if (sceneManager) {
        sceneManager.startTransition(type, 0.4)
      }
    }, 400)
  }

  static animateScreenIn(
    screen: HTMLElement,
    type: 'fade' | 'zoom' | 'slide' = 'fade'
  ): void {
    // Set initial state
    screen.style.opacity = '0'
    screen.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
    
    switch (type) {
      case 'fade':
        screen.style.transform = 'scale(0.95)'
        break
      case 'zoom':
        screen.style.transform = 'scale(0.8)'
        break
      case 'slide':
        screen.style.transform = 'translateX(100%)'
        break
    }

    // Animate in
    requestAnimationFrame(() => {
      screen.style.opacity = '1'
      screen.style.transform = 'scale(1) translateX(0)'
    })

    // 🎬 Animate UI elements with stagger! 🎬
    const buttons = screen.querySelectorAll('button')
    buttons.forEach((button, index) => {
      button.style.opacity = '0'
      button.style.transform = 'translateY(20px)'
      button.style.transition = `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s`
      
      setTimeout(() => {
        button.style.opacity = '1'
        button.style.transform = 'translateY(0)'
      }, 100 + index * 100)
    })

    // Animate text elements
    const headings = screen.querySelectorAll('h1, h2, h3')
    headings.forEach((heading, index) => {
      const el = heading as HTMLElement
      el.style.opacity = '0'
      el.style.transform = 'translateY(-30px) scale(0.9)'
      el.style.transition = `all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.15}s`
      
      setTimeout(() => {
        el.style.opacity = '1'
        el.style.transform = 'translateY(0) scale(1)'
      }, 200 + index * 150)
    })

    // Add floating animation to particles
    const particles = screen.querySelectorAll('.bg-particle')
    particles.forEach((particle, index) => {
      const el = particle as HTMLElement
      el.style.opacity = '0'
      el.style.transition = `opacity 1s ease ${index * 10}ms`
      
      setTimeout(() => {
        el.style.opacity = ''
      }, index * 10)
    })
  }

  static hideCurrentScreen(currentScreen: HTMLElement | null): HTMLElement | null {
    if (currentScreen) {
      // Force remove with multiple methods to ensure it's gone
      currentScreen.style.display = 'none'
      currentScreen.style.visibility = 'hidden'
      currentScreen.style.opacity = '0'
      currentScreen.style.pointerEvents = 'none'
      currentScreen.remove()
      
      // Also remove any lingering screens by ID
      const startScreen = document.getElementById('startScreen')
      if (startScreen) {
        startScreen.remove()
      }
      const leaderboardScreen = document.getElementById('leaderboardScreen')
      if (leaderboardScreen) {
        leaderboardScreen.remove()
      }
      const gameOverScreen = document.getElementById('gameOverScreen')
      if (gameOverScreen) {
        gameOverScreen.remove()
      }
    }
    return null
  }
}

