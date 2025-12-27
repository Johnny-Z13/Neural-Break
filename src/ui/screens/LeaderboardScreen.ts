import { ScoreManager } from '../../core/GameState'
import { AudioManager } from '../../audio/AudioManager'
import { StarfieldManager } from '../../graphics/StarfieldManager'

/**
 * NEURAL BREAK - Leaderboard Screen
 * 80s Arcade / Cyberpunk Aesthetic
 * Uses unified design system CSS variables
 */
export class LeaderboardScreen {
  static async create(
    audioManager: AudioManager | null,
    onBack: () => void
  ): Promise<HTMLElement> {
    // Ensure starfield is running
    StarfieldManager.getInstance().start()

    const leaderboardScreen = document.createElement('div')
    leaderboardScreen.id = 'leaderboardScreen'
    leaderboardScreen.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: transparent;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: var(--font-family, 'Press Start 2P', monospace);
      text-align: center;
      z-index: 1000;
      overflow: hidden;
      image-rendering: pixelated;
      padding: var(--space-md, 1rem);
      box-sizing: border-box;
    `

    leaderboardScreen.innerHTML = `
      <!-- CRT MONITOR OVERLAY -->
      <div class="crt-overlay" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        background: radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(0,0,0,0.4) 100%);
      "></div>
      
      <!-- SCANLINES OVERLAY -->
      <div class="scanlines" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9998;
        background: repeating-linear-gradient(
          0deg,
          rgba(0, 0, 0, 0.15) 0px,
          rgba(0, 0, 0, 0.15) 1px,
          transparent 1px,
          transparent 2px
        );
      "></div>
      
      <!-- MAIN CONTENT -->
      <div class="leaderboard-content" style="position: relative; z-index: 1; width: 95%; max-width: 900px;">
        
        <!-- TITLE -->
        <h1 class="leaderboard-title" style="
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          margin-bottom: var(--space-lg, 1.5rem);
          color: var(--color-yellow, #FFFF00);
          text-shadow: 
            4px 4px 0 var(--color-orange, #FF6600),
            -2px -2px 0 var(--color-magenta, #FF00FF),
            0 0 30px var(--color-yellow, #FFFF00);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          animation: titleFlicker 0.1s infinite;
        ">
          ★ HIGH SCORES ★
        </h1>
        
        <!-- Decorative line -->
        <div style="
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            var(--color-magenta, #FF00FF) 20%, 
            var(--color-cyan, #00FFFF) 40%, 
            var(--color-yellow, #FFFF00) 60%, 
            var(--color-magenta, #FF00FF) 80%, 
            transparent 100%);
          margin-bottom: var(--space-lg, 1.5rem);
          box-shadow: 0 0 15px currentColor;
        "></div>
        
        <!-- SCORES TABLE -->
        <div id="leaderboardScoresList" class="scores-container" style="
          background: var(--color-bg-panel, rgba(0, 0, 0, 0.85));
          border: var(--border-thick, 4px) solid var(--color-cyan, #00FFFF);
          padding: var(--space-md, 1rem);
          box-shadow: 
            0 0 30px var(--color-cyan-glow, rgba(0, 255, 255, 0.4)),
            var(--shadow-pixel, 4px 4px 0) var(--color-cyan-dark, #006666),
            inset 0 0 20px rgba(0, 255, 255, 0.1);
          min-height: 250px;
          max-height: 55vh;
          overflow-y: auto;
        "></div>
        
        <!-- BACK BUTTON -->
        <button id="backButton" class="arcade-button" style="
          margin-top: var(--space-lg, 1.5rem);
          background: var(--color-bg-panel, rgba(0, 0, 0, 0.85));
          border: var(--border-thick, 4px) solid var(--color-red, #FF4444);
          color: var(--color-red, #FF4444);
          font-family: inherit;
          font-size: clamp(0.8rem, 2vw, 1rem);
          font-weight: bold;
          padding: var(--space-sm, 0.8rem) var(--space-lg, 2rem);
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-shadow: 0 0 10px var(--color-red, #FF4444);
          box-shadow: 
            0 0 20px var(--color-red-glow, rgba(255, 68, 68, 0.4)),
            var(--shadow-pixel, 4px 4px 0) var(--color-red-dark, #662222);
          transition: all 0.1s step-end;
        ">
          ◀ BACK TO MENU
        </button>
      </div>
      
      <!-- INSERT COIN TEXT -->
      <div style="
        position: fixed;
        bottom: var(--space-md, 1rem);
        left: 50%;
        transform: translateX(-50%);
        color: var(--color-yellow, #FFFF00);
        font-size: clamp(0.5rem, 1.2vw, 0.7rem);
        text-shadow: 0 0 10px var(--color-yellow, #FFFF00);
        letter-spacing: 0.15em;
        animation: blink 0.8s step-end infinite;
        z-index: 1;
      ">
        ▲ TOP NEURAL HACKERS ▲
      </div>
    `

    // Add styles
    const style = document.createElement('style')
    style.id = 'leaderboard-styles'
    style.textContent = `
      @keyframes titleFlicker {
        0%, 90%, 100% { opacity: 1; }
        95% { opacity: 0.85; }
      }
      
      #backButton:hover {
        background: #330000 !important;
        box-shadow: 
          0 0 30px rgba(255, 68, 68, 0.6),
          4px 4px 0 var(--color-red, #FF4444) !important;
        transform: translate(-2px, -2px);
      }
      
      #backButton:active {
        transform: translate(2px, 2px);
        box-shadow: 
          0 0 15px rgba(255, 68, 68, 0.4),
          0 0 0 var(--color-red-dark, #662222) !important;
      }
      
      #leaderboardScoresList::-webkit-scrollbar {
        width: 10px;
      }
      
      #leaderboardScoresList::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.5);
        border: 2px solid var(--color-cyan-dark, #006666);
      }
      
      #leaderboardScoresList::-webkit-scrollbar-thumb {
        background: var(--color-cyan, #00FFFF);
        border: 2px solid var(--color-cyan-dark, #006666);
      }
      
      #leaderboardScoresList::-webkit-scrollbar-thumb:hover {
        background: #66FFFF;
      }
      
      .score-row {
        transition: all 0.1s step-end;
      }
      
      .score-row:hover {
        background: rgba(0, 255, 255, 0.15) !important;
        transform: translateX(4px);
      }
      
      @media (max-width: 600px) {
        .score-header,
        .score-row {
          grid-template-columns: 40px 1fr 50px 80px 60px !important;
          font-size: 0.5rem !important;
        }
      }
    `
    document.head.appendChild(style)

    // Display high scores - pass the container element directly since it's not in DOM yet
    const scoresContainer = leaderboardScreen.querySelector('#leaderboardScoresList') as HTMLElement
    if (scoresContainer) {
      await LeaderboardScreen.displayHighScoresInElement(scoresContainer)
    }

    // Add back button event listener
    const backButton = leaderboardScreen.querySelector('#backButton') as HTMLButtonElement
    backButton.addEventListener('mouseenter', () => {
      if (audioManager) audioManager.playButtonHoverSound()
    })
    backButton.addEventListener('click', () => {
      if (audioManager) audioManager.playButtonPressSound()
      LeaderboardScreen.cleanup()
      onBack()
    })

    return leaderboardScreen
  }

  private static async displayHighScoresInElement(container: HTMLElement): Promise<void> {
    try {
      const highScores = await ScoreManager.getHighScores()
      
      if (highScores.length === 0) {
        container.innerHTML = `
          <div style="
            text-align: center;
            padding: var(--space-xl, 3rem);
            color: var(--color-cyan, #00FFFF);
            text-shadow: 0 0 10px var(--color-cyan, #00FFFF);
          ">
            <div style="font-size: clamp(0.9rem, 2vw, 1.2rem); margin-bottom: var(--space-md, 1rem);">NO SCORES YET!</div>
            <div style="font-size: clamp(0.5rem, 1.2vw, 0.7rem); color: var(--color-magenta, #FF00FF);">
              BE THE FIRST NEURAL HACKER
            </div>
          </div>
        `
        return
      }

      // Header
      const header = `
        <div class="score-header" style="
          display: grid;
          grid-template-columns: 50px 1fr 60px 100px 80px;
          gap: var(--space-sm, 0.5rem);
          padding: var(--space-sm, 0.8rem) var(--space-xs, 0.5rem);
          border-bottom: 3px solid var(--color-yellow, #FFFF00);
          font-weight: bold;
          color: var(--color-yellow, #FFFF00);
          font-size: clamp(0.5rem, 1.2vw, 0.7rem);
          text-shadow: 0 0 10px var(--color-yellow, #FFFF00);
          background: rgba(255, 255, 0, 0.1);
        ">
          <span>RANK</span>
          <span>NAME</span>
          <span>LVL</span>
          <span>SCORE</span>
          <span>TIME</span>
        </div>
      `

      // Generate score rows
      const rows = highScores.map((entry, index) => {
        let rankColor = '#CCCCCC'
        let rankIcon = `${index + 1}`
        let rowBg = 'transparent'
        let borderLeft = '4px solid transparent'
        
        if (index === 0) {
          rankColor = 'var(--color-gold, #FFD700)'
          rankIcon = '1ST'
          rowBg = 'rgba(255, 215, 0, 0.1)'
          borderLeft = '4px solid var(--color-gold, #FFD700)'
        } else if (index === 1) {
          rankColor = 'var(--color-silver, #C0C0C0)'
          rankIcon = '2ND'
          rowBg = 'rgba(192, 192, 192, 0.08)'
          borderLeft = '4px solid var(--color-silver, #C0C0C0)'
        } else if (index === 2) {
          rankColor = 'var(--color-bronze, #CD7F32)'
          rankIcon = '3RD'
          rowBg = 'rgba(205, 127, 50, 0.08)'
          borderLeft = '4px solid var(--color-bronze, #CD7F32)'
        }

        return `
          <div class="score-row" style="
            display: grid;
            grid-template-columns: 50px 1fr 60px 100px 80px;
            gap: var(--space-sm, 0.5rem);
            padding: var(--space-sm, 0.6rem) var(--space-xs, 0.5rem);
            border-bottom: 1px solid rgba(0, 255, 255, 0.2);
            font-size: clamp(0.5rem, 1.2vw, 0.65rem);
            color: ${rankColor};
            text-shadow: 0 0 8px ${rankColor};
            background: ${rowBg};
            border-left: ${borderLeft};
          ">
            <span style="font-weight: bold;">${rankIcon}</span>
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${entry.name.toUpperCase()}</span>
            <span>${entry.level}</span>
            <span style="font-weight: bold; color: var(--color-green, #00FF00); text-shadow: 0 0 10px var(--color-green, #00FF00);">
              ${ScoreManager.formatScore(entry.score)}
            </span>
            <span style="color: var(--color-cyan, #00FFFF);">${ScoreManager.formatTime(entry.survivedTime)}</span>
          </div>
        `
      }).join('')

      container.innerHTML = header + rows
    } catch (error) {
      console.error('❌ Error displaying high scores:', error)
      container.innerHTML = `
        <div style="
          text-align: center;
          padding: var(--space-lg, 2rem);
          color: var(--color-red, #FF4444);
          text-shadow: 0 0 10px var(--color-red, #FF4444);
        ">
          ERROR LOADING SCORES
        </div>
      `
    }
  }

  static cleanup(): void {
    const styleEl = document.getElementById('leaderboard-styles')
    if (styleEl) {
      styleEl.remove()
    }
  }
}
