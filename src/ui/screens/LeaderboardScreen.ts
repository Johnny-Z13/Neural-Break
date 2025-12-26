import { ScoreManager } from '../../core/GameState'
import { AudioManager } from '../../audio/AudioManager'
import { StarfieldManager } from '../../graphics/StarfieldManager'

/**
 * 80s ARCADE-STYLE LEADERBOARD SCREEN
 * Features starfield background, pixel aesthetics, scanlines
 */
export class LeaderboardScreen {
  static async create(
    audioManager: AudioManager | null,
    onBack: () => void
  ): Promise<HTMLElement> {
    // Ensure starfield is running (persists from start screen)
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
      font-family: 'Press Start 2P', 'Courier New', monospace;
      text-align: center;
      z-index: 1000;
      overflow: hidden;
      image-rendering: pixelated;
    `

    leaderboardScreen.innerHTML = `
      <!-- CRT MONITOR OVERLAY -->
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        background: 
          radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(0,0,0,0.4) 100%);
      "></div>
      
      <!-- SCANLINES OVERLAY -->
      <div style="
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
      
      <div style="position: relative; z-index: 1; width: 90%; max-width: 800px;">
        <!-- TITLE -->
        <h1 style="
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          color: #FFFF00;
          text-shadow: 
            4px 4px 0 #FF6600,
            -2px -2px 0 #FF00FF,
            0 0 30px #FFFF00;
          letter-spacing: 0.15em;
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
            #FF00FF 20%, 
            #00FFFF 40%, 
            #FFFF00 60%, 
            #FF00FF 80%, 
            transparent 100%);
          margin-bottom: 1.5rem;
          box-shadow: 0 0 15px currentColor;
        "></div>
        
        <!-- SCORES TABLE -->
        <div id="leaderboardScoresList" style="
          background: rgba(0, 0, 0, 0.85);
          border: 4px solid #00FFFF;
          padding: 1rem;
          box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.4),
            4px 4px 0 #006666,
            inset 0 0 20px rgba(0, 255, 255, 0.1);
          min-height: 300px;
          max-height: 55vh;
          overflow-y: auto;
        "></div>
        
        <!-- BACK BUTTON -->
        <button id="backButton" style="
          margin-top: 1.5rem;
          background: #000000;
          border: 4px solid #FF4444;
          color: #FF4444;
          font-family: 'Press Start 2P', 'Courier New', monospace;
          font-size: 1rem;
          font-weight: bold;
          padding: 0.8rem 2rem;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-shadow: 0 0 10px #FF4444;
          box-shadow: 
            0 0 20px rgba(255, 68, 68, 0.4),
            4px 4px 0 #662222;
          transition: all 0.1s step-end;
        ">
          ◀ BACK TO MENU
        </button>
      </div>
      
      <!-- INSERT COIN TEXT -->
      <div style="
        position: fixed;
        bottom: 1rem;
        left: 50%;
        transform: translateX(-50%);
        color: #FFFF00;
        font-size: 0.7rem;
        text-shadow: 0 0 10px #FFFF00;
        letter-spacing: 0.2em;
        animation: coinBlink 0.8s step-end infinite;
        z-index: 1;
      ">
        ▲ TOP NEURAL HACKERS ▲
      </div>
    `

    // Add 80s pixel-style animations
    const style = document.createElement('style')
    style.id = 'leaderboard-pixel-styles'
    style.textContent = `
      @keyframes titleFlicker {
        0%, 90%, 100% { opacity: 1; }
        95% { opacity: 0.85; }
      }
      
      @keyframes coinBlink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      
      #backButton:hover {
        background: #330000 !important;
        box-shadow: 
          0 0 30px rgba(255, 68, 68, 0.6),
          4px 4px 0 #FF4444 !important;
        transform: translate(-2px, -2px);
      }
      
      #backButton:active {
        transform: translate(2px, 2px);
        box-shadow: 
          0 0 15px rgba(255, 68, 68, 0.4),
          0 0 0 #662222 !important;
      }
      
      #leaderboardScoresList::-webkit-scrollbar {
        width: 10px;
      }
      
      #leaderboardScoresList::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.5);
        border: 2px solid #006666;
      }
      
      #leaderboardScoresList::-webkit-scrollbar-thumb {
        background: #00FFFF;
        border: 2px solid #006666;
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
    `
    document.head.appendChild(style)

    // Display high scores with 80s styling
    await LeaderboardScreen.displayHighScores('leaderboardScoresList')

    // Add back button event listener
    const backButton = leaderboardScreen.querySelector('#backButton') as HTMLButtonElement
    backButton.addEventListener('mouseenter', () => {
      if (audioManager) audioManager.playButtonHoverSound()
    })
    backButton.addEventListener('click', () => {
      if (audioManager) audioManager.playButtonPressSound()
      // Cleanup styles but keep starfield running
      LeaderboardScreen.cleanup()
      onBack()
    })

    return leaderboardScreen
  }

  private static async displayHighScores(containerId: string): Promise<void> {
    const container = document.getElementById(containerId)
    if (!container) {
      console.warn(`❌ High score container '${containerId}' not found!`)
      return
    }

    try {
      const highScores = await ScoreManager.getHighScores()
      
      if (highScores.length === 0) {
        container.innerHTML = `
          <div style="
            text-align: center;
            padding: 3rem;
            color: #00FFFF;
            text-shadow: 0 0 10px #00FFFF;
          ">
            <div style="font-size: 1.2rem; margin-bottom: 1rem;">NO SCORES YET!</div>
            <div style="font-size: 0.7rem; color: #FF00FF;">
              BE THE FIRST NEURAL HACKER
            </div>
          </div>
        `
        return
      }

      // 80s Arcade style header
      const header = `
        <div style="
          display: grid;
          grid-template-columns: 50px 1fr 60px 100px 80px;
          gap: 0.5rem;
          padding: 0.8rem 0.5rem;
          border-bottom: 3px solid #FFFF00;
          font-weight: bold;
          color: #FFFF00;
          font-size: 0.7rem;
          text-shadow: 0 0 10px #FFFF00;
          background: rgba(255, 255, 0, 0.1);
        ">
          <span>RANK</span>
          <span>NAME</span>
          <span>LVL</span>
          <span>SCORE</span>
          <span>TIME</span>
        </div>
      `

      // Generate score rows with 80s styling
      const rows = highScores.map((entry, index) => {
        // Rank styling
        let rankColor = '#CCCCCC'
        let rankIcon = `${index + 1}`
        let rowBg = 'transparent'
        let borderLeft = '4px solid transparent'
        
        if (index === 0) {
          rankColor = '#FFD700'
          rankIcon = '1ST'
          rowBg = 'rgba(255, 215, 0, 0.1)'
          borderLeft = '4px solid #FFD700'
        } else if (index === 1) {
          rankColor = '#C0C0C0'
          rankIcon = '2ND'
          rowBg = 'rgba(192, 192, 192, 0.1)'
          borderLeft = '4px solid #C0C0C0'
        } else if (index === 2) {
          rankColor = '#CD7F32'
          rankIcon = '3RD'
          rowBg = 'rgba(205, 127, 50, 0.1)'
          borderLeft = '4px solid #CD7F32'
        }

        return `
          <div class="score-row" style="
            display: grid;
            grid-template-columns: 50px 1fr 60px 100px 80px;
            gap: 0.5rem;
            padding: 0.6rem 0.5rem;
            border-bottom: 1px solid rgba(0, 255, 255, 0.2);
            font-size: 0.65rem;
            color: ${rankColor};
            text-shadow: 0 0 8px ${rankColor};
            background: ${rowBg};
            border-left: ${borderLeft};
          ">
            <span style="font-weight: bold;">${rankIcon}</span>
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${entry.name.toUpperCase()}</span>
            <span>${entry.level}</span>
            <span style="font-weight: bold; color: #00FF00; text-shadow: 0 0 10px #00FF00;">
              ${ScoreManager.formatScore(entry.score)}
            </span>
            <span style="color: #00FFFF;">${ScoreManager.formatTime(entry.survivedTime)}</span>
          </div>
        `
      }).join('')

      container.innerHTML = header + rows
    } catch (error) {
      console.error('❌ Error displaying high scores:', error)
      container.innerHTML = `
        <div style="
          text-align: center;
          padding: 2rem;
          color: #FF4444;
          text-shadow: 0 0 10px #FF4444;
        ">
          ERROR LOADING SCORES
        </div>
      `
    }
  }

  static cleanup(): void {
    // Remove leaderboard styles
    const styleEl = document.getElementById('leaderboard-pixel-styles')
    if (styleEl) {
      styleEl.remove()
    }
  }
}
