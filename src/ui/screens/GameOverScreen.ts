import { GameStats, HighScoreEntry, ScoreManager } from '../../core/GameState'
import { AudioManager } from '../../audio/AudioManager'
import { StarfieldManager } from '../../graphics/StarfieldManager'

/**
 * 80s ARCADE-STYLE GAME OVER SCREEN
 * Features starfield background, pixel aesthetics, scanlines
 */
export class GameOverScreen {
  static async create(
    stats: GameStats,
    audioManager: AudioManager | null,
    onRestart: () => void
  ): Promise<HTMLElement> {
    // Start the starfield for menu consistency
    StarfieldManager.getInstance().start()
    
    const finalScore = ScoreManager.calculateScore(stats)
    const isNewHighScore = await ScoreManager.isHighScore(finalScore)
    
    const gameOverScreen = document.createElement('div')
    gameOverScreen.id = 'gameOverScreen'
    gameOverScreen.style.cssText = `
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
      overflow-y: auto;
      image-rendering: pixelated;
    `

    gameOverScreen.innerHTML = `
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
      
      <!-- MAIN CONTENT -->
      <div style="position: relative; z-index: 1; max-width: 700px; padding: 1rem;">
        <!-- GAME OVER TITLE -->
        <div style="animation: gameOverPulse 1s step-end infinite;">
          <h1 style="
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            color: #FF0000;
            text-shadow: 
              4px 4px 0 #880000,
              -2px -2px 0 #FF6600,
              0 0 30px #FF0000;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          ">
            GAME OVER
          </h1>
          <p style="
            font-size: 0.8rem;
            margin-bottom: 1.5rem;
            color: #FF4444;
            text-shadow: 0 0 10px #FF4444;
          ">
            NEURAL LINK SEVERED
          </p>
        </div>
        
        ${isNewHighScore ? `
          <div style="
            color: #FFFF00;
            font-size: 1.2rem;
            margin-bottom: 1rem;
            animation: newHighScore 0.5s step-end infinite;
            text-shadow: 0 0 20px #FFFF00, 4px 4px 0 #886600;
          ">
            ★ NEW HIGH SCORE! ★
          </div>
        ` : ''}
        
        <!-- SCORE BOX -->
        <div style="
          background: rgba(0, 0, 0, 0.85);
          border: 4px solid ${isNewHighScore ? '#FFFF00' : '#00FFFF'};
          padding: 1.5rem;
          margin: 1rem 0;
          box-shadow: 
            0 0 30px rgba(${isNewHighScore ? '255, 255, 0' : '0, 255, 255'}, 0.4),
            4px 4px 0 ${isNewHighScore ? '#886600' : '#006666'};
        ">
          <h2 style="
            color: #00FF00;
            margin-bottom: 1rem;
            font-size: 1.5rem;
            text-shadow: 0 0 15px #00FF00;
          ">
            FINAL SCORE
          </h2>
          <div style="
            font-size: 2rem;
            color: #FFFF00;
            text-shadow: 0 0 20px #FFFF00, 4px 4px 0 #886600;
            margin-bottom: 1rem;
          ">
            ${ScoreManager.formatScore(finalScore)}
          </div>
          
          <!-- STATS GRID -->
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.8rem;
            font-size: 0.6rem;
            text-align: left;
            color: #00FFFF;
          ">
            <div>
              <div>TIME: <span style="color: #FFFFFF;">${ScoreManager.formatTime(stats.survivedTime)}</span></div>
              <div>LEVEL: <span style="color: #FFFFFF;">${stats.level}</span></div>
              <div>XP: <span style="color: #FFFFFF;">${stats.totalXP.toLocaleString()}</span></div>
              <div>DAMAGE: <span style="color: #FF4444;">${stats.damageTaken}</span></div>
            </div>
            <div>
              <div>KILLS: <span style="color: #FFFFFF;">${stats.enemiesKilled}</span></div>
              <div style="color: #FF6633;">MITES: <span style="color: #FFFFFF;">${stats.dataMinersKilled}</span></div>
              <div style="color: #FF8844;">DRONES: <span style="color: #FFFFFF;">${stats.scanDronesKilled}</span></div>
              <div style="color: #FF66FF;">WORMS: <span style="color: #FFFFFF;">${stats.chaosWormsKilled}</span></div>
              <div style="color: #AA66FF;">VOIDS: <span style="color: #FFFFFF;">${stats.voidSpheresKilled}</span></div>
              <div style="color: #66FFFF;">CRYSTALS: <span style="color: #FFFFFF;">${stats.crystalSwarmsKilled}</span></div>
              <div style="color: #FF0000;">BOSSES: <span style="color: #FFFFFF;">${stats.bossesKilled}</span></div>
            </div>
          </div>
        </div>
        
        ${isNewHighScore ? `
          <!-- NAME INPUT -->
          <div style="margin: 1rem 0; display: flex; gap: 0.5rem; justify-content: center; align-items: center; flex-wrap: wrap;">
            <input type="text" id="playerNameInput" placeholder="NAME" maxlength="10" style="
              background: #000000;
              border: 3px solid #00FFFF;
              color: #00FFFF;
              font-family: 'Press Start 2P', 'Courier New', monospace;
              font-size: 0.8rem;
              padding: 0.6rem 1rem;
              text-transform: uppercase;
              text-align: center;
              width: 150px;
              box-shadow: 0 0 15px rgba(0, 255, 255, 0.3), 3px 3px 0 #006666;
            ">
            <button id="saveScoreButton" style="
              background: #000000;
              border: 3px solid #00FF00;
              color: #00FF00;
              font-family: 'Press Start 2P', 'Courier New', monospace;
              font-size: 0.7rem;
              padding: 0.6rem 1rem;
              cursor: pointer;
              text-transform: uppercase;
              text-shadow: 0 0 10px #00FF00;
              box-shadow: 0 0 15px rgba(0, 255, 0, 0.3), 3px 3px 0 #006600;
              transition: all 0.1s step-end;
            ">SAVE</button>
          </div>
        ` : ''}
        
        <!-- RESTART BUTTON -->
        <div style="margin-top: 1rem;">
          <button id="restartButton" style="
            background: #000000;
            border: 4px solid #FFFF00;
            color: #FFFF00;
            font-family: 'Press Start 2P', 'Courier New', monospace;
            font-size: 1rem;
            padding: 1rem 2rem;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            text-shadow: 0 0 15px #FFFF00;
            box-shadow: 
              0 0 25px rgba(255, 255, 0, 0.4),
              4px 4px 0 #886600;
            transition: all 0.1s step-end;
          ">
            ▶ PLAY AGAIN
          </button>
        </div>
        
        <!-- HIGH SCORES TABLE -->
        <div id="gameOverHighScores" style="
          margin-top: 1.5rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.8);
          border: 3px solid #FF00FF;
          box-shadow: 0 0 20px rgba(255, 0, 255, 0.3), 3px 3px 0 #660066;
        ">
          <h3 style="
            margin-bottom: 0.8rem;
            color: #FF00FF;
            font-size: 0.8rem;
            text-shadow: 0 0 10px #FF00FF;
          ">◆ TOP SCORES ◆</h3>
          <div id="gameOverHighScoresList"></div>
        </div>
      </div>
      
      <!-- CREDIT TEXT -->
      <div style="
        position: fixed;
        bottom: 0.5rem;
        left: 50%;
        transform: translateX(-50%);
        color: #666666;
        font-size: 0.5rem;
        z-index: 1;
      ">
        INSERT COIN TO CONTINUE
      </div>
    `

    // Add 80s pixel-style animations
    const style = document.createElement('style')
    style.id = 'gameover-pixel-styles'
    style.textContent = `
      @keyframes gameOverPulse {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.8; }
      }
      
      @keyframes newHighScore {
        0%, 50% { opacity: 1; transform: scale(1); }
        51%, 100% { opacity: 0.8; transform: scale(1.02); }
      }
      
      #restartButton:hover {
        background: #333300 !important;
        box-shadow: 
          0 0 40px rgba(255, 255, 0, 0.6),
          4px 4px 0 #FFFF00 !important;
        transform: translate(-2px, -2px);
      }
      
      #restartButton:active {
        transform: translate(2px, 2px);
        box-shadow: 
          0 0 20px rgba(255, 255, 0, 0.4),
          0 0 0 #886600 !important;
      }
      
      #saveScoreButton:hover {
        background: #003300 !important;
        box-shadow: 
          0 0 20px rgba(0, 255, 0, 0.5),
          3px 3px 0 #00FF00 !important;
        transform: translate(-1px, -1px);
      }
      
      #playerNameInput:focus {
        outline: none;
        border-color: #FFFF00;
        box-shadow: 0 0 20px rgba(255, 255, 0, 0.5), 3px 3px 0 #886600;
      }
      
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) scale(0.8); }
        20% { opacity: 1; transform: translateX(-50%) scale(1.1); }
        80% { opacity: 1; transform: translateX(-50%) scale(1); }
        100% { opacity: 0; transform: translateX(-50%) scale(0.8); }
      }
    `
    document.head.appendChild(style)

    // Display high scores
    await GameOverScreen.displayHighScores('gameOverHighScoresList')

    // Handle high score saving
    if (isNewHighScore) {
      const nameInput = gameOverScreen.querySelector('#playerNameInput') as HTMLInputElement
      const saveButton = gameOverScreen.querySelector('#saveScoreButton') as HTMLButtonElement
      
      const lastName = ScoreManager.getLastPlayerName()
      if (lastName) {
        nameInput.value = lastName
        nameInput.select()
      }
      
      nameInput.focus()
      
      const saveScore = async () => {
        const playerName = nameInput.value.trim() || 'ANON'
        const entry: HighScoreEntry = {
          name: playerName,
          score: finalScore,
          survivedTime: stats.survivedTime,
          level: stats.level,
          date: new Date().toLocaleDateString()
        }
        
        nameInput.disabled = true
        saveButton.disabled = true
        saveButton.textContent = '...'
        saveButton.style.opacity = '0.7'
        
        try {
          const saved = await ScoreManager.saveHighScore(entry)
          
          if (saved) {
            saveButton.textContent = 'OK!'
            saveButton.style.background = '#003300'
            saveButton.style.borderColor = '#00FF00'
            
            await GameOverScreen.displayHighScores('gameOverHighScoresList')
            
            const successMsg = document.createElement('div')
            successMsg.textContent = `★ ${playerName.toUpperCase()} SAVED ★`
            successMsg.style.cssText = `
              position: fixed;
              top: 20%;
              left: 50%;
              transform: translateX(-50%);
              font-size: 1.2rem;
              color: #00FF00;
              text-shadow: 0 0 20px #00FF00, 4px 4px 0 #006600;
              pointer-events: none;
              z-index: 10001;
              animation: fadeInOut 2s ease-in-out;
              font-family: 'Press Start 2P', monospace;
            `
            gameOverScreen.appendChild(successMsg)
            
            setTimeout(() => {
              if (nameInput.parentElement) {
                nameInput.parentElement.style.opacity = '0'
                nameInput.parentElement.style.transition = 'opacity 0.3s step-end'
                setTimeout(() => {
                  nameInput.parentElement?.remove()
                }, 300)
              }
              successMsg.remove()
            }, 2000)
          } else {
            saveButton.textContent = 'FAIL'
            saveButton.style.background = '#330000'
            saveButton.style.borderColor = '#FF0000'
            saveButton.disabled = false
            nameInput.disabled = false
            saveButton.style.opacity = '1'
            
            setTimeout(() => {
              saveButton.textContent = 'SAVE'
              saveButton.style.background = ''
              saveButton.style.borderColor = ''
            }, 2000)
          }
        } catch (error) {
          console.error('❌ Error saving high score:', error)
          saveButton.textContent = 'ERR'
          saveButton.style.background = '#330000'
          saveButton.style.borderColor = '#FF0000'
          saveButton.disabled = false
          nameInput.disabled = false
          saveButton.style.opacity = '1'
        }
      }
      
      saveButton.addEventListener('mouseenter', () => {
        if (audioManager) audioManager.playButtonHoverSound()
      })
      saveButton.addEventListener('click', () => {
        if (audioManager) audioManager.playButtonPressSound()
        saveScore()
      })
      nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          if (audioManager) audioManager.playButtonPressSound()
          saveScore()
        }
      })
    }

    // Handle restart with audio
    const restartButton = gameOverScreen.querySelector('#restartButton') as HTMLButtonElement
    restartButton.addEventListener('mouseenter', () => {
      if (audioManager) audioManager.playButtonHoverSound()
    })
    restartButton.addEventListener('click', () => {
      if (audioManager) audioManager.playButtonPressSound()
      GameOverScreen.cleanup()
      onRestart()
    })

    return gameOverScreen
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
            padding: 1rem;
            color: #FF00FF;
            font-size: 0.6rem;
          ">
            NO SCORES YET
          </div>
        `
        return
      }

      // Only show top 5 on game over screen
      const topScores = highScores.slice(0, 5)
      
      container.innerHTML = topScores.map((entry, index) => {
        let rankColor = '#CCCCCC'
        if (index === 0) rankColor = '#FFD700'
        else if (index === 1) rankColor = '#C0C0C0'
        else if (index === 2) rankColor = '#CD7F32'

        return `
          <div style="
            display: grid;
            grid-template-columns: 30px 1fr 80px;
            gap: 0.5rem;
            padding: 0.4rem;
            font-size: 0.55rem;
            color: ${rankColor};
            text-shadow: 0 0 5px ${rankColor};
            border-bottom: 1px solid rgba(255, 0, 255, 0.2);
          ">
            <span>${index + 1}.</span>
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${entry.name.toUpperCase()}</span>
            <span style="text-align: right; color: #00FF00;">${ScoreManager.formatScore(entry.score)}</span>
          </div>
        `
      }).join('')
    } catch (error) {
      console.error('❌ Error displaying high scores:', error)
      container.innerHTML = '<div style="color: #FF4444; font-size: 0.6rem;">ERROR</div>'
    }
  }

  static cleanup(): void {
    const styleEl = document.getElementById('gameover-pixel-styles')
    if (styleEl) {
      styleEl.remove()
    }
  }
}
