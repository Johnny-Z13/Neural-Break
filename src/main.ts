import { Game } from './core/Game'

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game()
  game.initialize()
})
