import { Game } from './core/Game'
import { OptionsScreen } from './ui/screens/OptionsScreen'

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved fullscreen setting on startup (styling only, no API call)
  const settings = OptionsScreen.loadSettings()
  OptionsScreen.applyFullscreenSetting(settings.fullscreen, false)

  const game = new Game()
  game.initialize()
})
