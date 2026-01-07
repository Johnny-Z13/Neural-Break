import { GameStats, HighScoreEntry, ScoreManager } from '../../core/GameState'
import { AudioManager } from '../../audio/AudioManager'
import { StarfieldManager } from '../../graphics/StarfieldManager'

/**
 * NEURAL BREAK - Game Over Screen
 * 80s Arcade / Cyberpunk Aesthetic
 * Uses unified design system CSS variables
 * Features enlarged, legible stats display
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
      font-family: var(--font-family, 'Press Start 2P', monospace);
      text-align: center;
      z-index: 1000;
      overflow-y: auto;
      image-rendering: pixelated;
      padding: var(--space-md, 1rem);
      box-sizing: border-box;
    `

    gameOverScreen.innerHTML = `
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
      <div class="gameover-content" style="position: relative; z-index: 1; max-width: 900px; width: 100%;">
        
        <!-- GAME OVER TITLE -->
        <div class="title-section" style="animation: gameOverPulse 1s step-end infinite;">
          <h1 style="
            font-size: clamp(2rem, 5vw, 3.5rem);
            margin-bottom: var(--space-xs, 0.3rem);
            color: var(--color-red, #FF0000);
            text-shadow: 
              4px 4px 0 #880000,
              -2px -2px 0 var(--color-orange, #FF6600),
              0 0 40px var(--color-red, #FF0000);
            letter-spacing: 0.15em;
            text-transform: uppercase;
          ">
            GAME OVER
          </h1>
          <p style="
            font-size: clamp(0.6rem, 1.5vw, 0.9rem);
            margin-bottom: var(--space-md, 1rem);
            color: #FF4444;
            text-shadow: 0 0 15px #FF4444;
            letter-spacing: 0.2em;
          ">
            NEURAL LINK SEVERED
          </p>
        </div>
        
        ${isNewHighScore ? `
          <div class="new-highscore-banner" style="
            color: var(--color-yellow, #FFFF00);
            font-size: clamp(1rem, 2.5vw, 1.5rem);
            margin-bottom: var(--space-lg, 1.5rem);
            animation: newHighScore 0.5s step-end infinite;
            text-shadow: 0 0 30px var(--color-yellow, #FFFF00), 4px 4px 0 var(--color-yellow-dark, #886600);
            letter-spacing: 0.1em;
          ">
            ★ NEW HIGH SCORE! ★
          </div>
        ` : ''}
        
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- SCORE BOX - REFINED & POLISHED -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div class="score-box" style="
          background: linear-gradient(180deg, var(--color-bg-panel, rgba(0, 0, 0, 0.96)) 0%, rgba(10, 5, 20, 0.96) 100%);
          border: var(--border-thick, 4px) solid ${isNewHighScore ? 'var(--color-yellow, #FFFF00)' : 'var(--color-cyan, #00FFFF)'};
          padding: var(--space-lg, 1.8rem) var(--space-xl, 2.2rem);
          margin: var(--space-md, 1rem) auto;
          max-width: 720px;
          box-shadow: 
            0 0 35px ${isNewHighScore ? 'var(--color-yellow-glow, rgba(255, 255, 0, 0.45))' : 'var(--color-cyan-glow, rgba(0, 255, 255, 0.45))'},
            inset 0 0 50px ${isNewHighScore ? 'rgba(255, 255, 0, 0.08)' : 'rgba(0, 255, 255, 0.08)'},
            5px 5px 0 ${isNewHighScore ? 'var(--color-yellow-dark, #886600)' : 'var(--color-cyan-dark, #006666)'};
        ">
          <!-- FINAL SCORE HEADER -->
          <h2 style="
            color: var(--color-green, #00FF00);
            margin-bottom: var(--space-sm, 0.8rem);
            font-size: clamp(1.2rem, 2.5vw, 1.8rem);
            text-shadow: 0 0 20px var(--color-green, #00FF00), 3px 3px 0 var(--color-green-dark, #006600);
            letter-spacing: 0.15em;
          ">
            FINAL SCORE
          </h2>
          
          <!-- BIG SCORE NUMBER -->
          <div class="final-score-value" style="
            font-size: clamp(2.5rem, 6vw, 4rem);
            color: var(--color-yellow, #FFFF00);
            text-shadow: 
              0 0 30px var(--color-yellow, #FFFF00), 
              0 0 60px rgba(255, 255, 0, 0.5),
              6px 6px 0 var(--color-yellow-dark, #886600);
            margin-bottom: var(--space-lg, 1.5rem);
            letter-spacing: 0.05em;
          ">
            ${ScoreManager.formatScore(finalScore)}
          </div>
          
          <!-- ═══════════════════════════════════════════════════════════════ -->
          <!-- STATS GRID - REFINED LAYOUT -->
          <!-- ═══════════════════════════════════════════════════════════════ -->
          <div class="stats-grid" style="
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-md, 1.2rem) clamp(1.2rem, 3.5vw, 2.5rem);
            font-size: clamp(0.65rem, 1.5vw, 0.95rem);
            text-align: left;
            padding: var(--space-md, 1.3rem) var(--space-lg, 1.5rem);
            background: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 10, 20, 0.5) 100%);
            border: 2px solid rgba(0, 255, 255, 0.25);
            border-radius: 2px;
            margin-top: var(--space-md, 1.2rem);
            box-shadow: inset 0 0 20px rgba(0, 255, 255, 0.05);
          ">
            <!-- LEFT COLUMN - General Stats -->
            <div class="stats-column" style="display: flex; flex-direction: column; gap: var(--space-sm, 0.8rem);">
              ${GameOverScreen.createStatRow('TIME', ScoreManager.formatTime(stats.survivedTime), 'var(--color-cyan, #00FFFF)', 'var(--color-text, #FFFFFF)')}
              ${GameOverScreen.createStatRow('LEVEL', `${stats.level}`, 'var(--color-cyan, #00FFFF)', 'var(--color-text, #FFFFFF)')}
              ${GameOverScreen.createStatRow('XP', stats.totalXP.toLocaleString(), 'var(--color-cyan, #00FFFF)', 'var(--color-text, #FFFFFF)')}
              ${GameOverScreen.createStatRow('DAMAGE', `${stats.damageTaken}`, 'var(--color-red, #FF4444)', '#FF6666')}
              ${GameOverScreen.createStatRow('MAX COMBO', `${stats.highestCombo}x`, 'var(--color-orange, #FFAA00)', '#FFCC00')}
              ${GameOverScreen.createStatRow('MAX MULTI', `${stats.highestMultiplier.toFixed(1)}x`, 'var(--color-magenta, #FF00FF)', '#FF66FF')}
            </div>
            
            <!-- RIGHT COLUMN - Kill Stats -->
            <div class="stats-column" style="display: flex; flex-direction: column; gap: var(--space-sm, 0.8rem);">
              ${GameOverScreen.createStatRow('TOTAL KILLS', `${stats.enemiesKilled}`, 'var(--color-green, #00FF00)', 'var(--color-green, #00FF00)', true)}
              ${GameOverScreen.createStatRow('DATA MITES', `${stats.dataMinersKilled}`, '#FF6633', '#FFAA66')}
              ${GameOverScreen.createStatRow('SCAN DRONES', `${stats.scanDronesKilled}`, '#FF8844', '#FFBB77')}
              ${GameOverScreen.createStatRow('CHAOS WORMS', `${stats.chaosWormsKilled}`, '#FF66FF', '#FF99FF')}
              ${GameOverScreen.createStatRow('VOID SPHERES', `${stats.voidSpheresKilled}`, '#AA66FF', '#CC99FF')}
              ${GameOverScreen.createStatRow('CRYSTALS', `${stats.crystalSwarmsKilled}`, '#66FFFF', '#99FFFF')}
              ${GameOverScreen.createStatRow('FIZZERS', `${stats.fizzersKilled}`, '#00FF88', '#66FFAA')}
              ${GameOverScreen.createStatRow('UFOS', `${stats.ufosKilled}`, '#88AAFF', '#AACCFF')}
              ${GameOverScreen.createStatRow('BOSSES', `${stats.bossesKilled}`, 'var(--color-red, #FF0000)', '#FF4444')}
            </div>
          </div>
        </div>
        
        ${isNewHighScore ? `
          <!-- NAME INPUT - Larger and more visible -->
          <div class="name-input-section" style="
            margin: var(--space-lg, 1.5rem) 0; 
            display: flex; 
            gap: var(--space-md, 1rem); 
            justify-content: center; 
            align-items: center; 
            flex-wrap: wrap;
          ">
            <input type="text" id="playerNameInput" placeholder="ENTER NAME" maxlength="10" style="
              background: #000000;
              border: var(--border-thick, 4px) solid var(--color-cyan, #00FFFF);
              color: var(--color-cyan, #00FFFF);
              font-family: inherit;
              font-size: clamp(0.8rem, 2vw, 1.1rem);
              padding: var(--space-sm, 0.8rem) var(--space-md, 1.5rem);
              text-transform: uppercase;
              text-align: center;
              width: 200px;
              box-shadow: 0 0 20px var(--color-cyan-glow, rgba(0, 255, 255, 0.4)), 4px 4px 0 var(--color-cyan-dark, #006666);
            ">
            <button id="saveScoreButton" class="arcade-button" style="
              background: #000000;
              border: var(--border-thick, 4px) solid var(--color-green, #00FF00);
              color: var(--color-green, #00FF00);
              font-family: inherit;
              font-size: clamp(0.8rem, 2vw, 1rem);
              padding: var(--space-sm, 0.8rem) var(--space-md, 1.5rem);
              cursor: pointer;
              text-transform: uppercase;
              text-shadow: 0 0 15px var(--color-green, #00FF00);
              box-shadow: 0 0 20px var(--color-green-glow, rgba(0, 255, 0, 0.4)), 4px 4px 0 var(--color-green-dark, #006600);
              transition: all 0.1s step-end;
            ">SAVE</button>
          </div>
        ` : ''}
        
        <!-- RESTART BUTTON - More prominent -->
        <div style="margin-top: var(--space-lg, 1.5rem);">
          <button id="restartButton" class="arcade-button arcade-button-primary" style="
            background: #000000;
            border: 5px solid var(--color-yellow, #FFFF00);
            color: var(--color-yellow, #FFFF00);
            font-family: inherit;
            font-size: clamp(1rem, 2.5vw, 1.4rem);
            padding: var(--space-md, 1.2rem) var(--space-xl, 2.5rem);
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            text-shadow: 0 0 20px var(--color-yellow, #FFFF00);
            box-shadow: 
              0 0 35px var(--color-yellow-glow, rgba(255, 255, 0, 0.5)),
              6px 6px 0 var(--color-yellow-dark, #886600);
            transition: all 0.1s step-end;
          ">
            ▶ PLAY AGAIN
          </button>
        </div>
        
        <!-- HIGH SCORES TABLE - Refined design -->
        <div id="gameOverHighScores" class="highscores-section" style="
          margin-top: var(--space-lg, 1.8rem);
          padding: var(--space-md, 1.3rem) var(--space-lg, 1.5rem);
          background: linear-gradient(180deg, var(--color-bg-panel, rgba(0, 0, 0, 0.9)) 0%, rgba(20, 0, 20, 0.9) 100%);
          border: var(--border-thick, 4px) solid var(--color-magenta, #FF00FF);
          box-shadow: 
            0 0 28px var(--color-magenta-glow, rgba(255, 0, 255, 0.35)), 
            4px 4px 0 var(--color-magenta-dark, #660066),
            inset 0 0 20px rgba(255, 0, 255, 0.08);
          max-width: 520px;
          margin-left: auto;
          margin-right: auto;
        ">
          <h3 style="
            margin-bottom: var(--space-md, 1rem);
            color: var(--color-magenta, #FF00FF);
            font-size: clamp(0.9rem, 2vw, 1.2rem);
            text-shadow: 0 0 15px var(--color-magenta, #FF00FF);
            letter-spacing: 0.1em;
          ">◆ TOP SCORES ◆</h3>
          <div id="gameOverHighScoresList"></div>
        </div>
      </div>
    `

    // Add styles
    const style = document.createElement('style')
    style.id = 'gameover-styles'
    style.textContent = `
      @keyframes gameOverPulse {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.85; }
      }
      
      @keyframes newHighScore {
        0%, 50% { opacity: 1; transform: scale(1); }
        51%, 100% { opacity: 0.9; transform: scale(1.03); }
      }
      
      #restartButton:hover {
        background: #333300 !important;
        box-shadow: 
          0 0 50px rgba(255, 255, 0, 0.7),
          6px 6px 0 var(--color-yellow, #FFFF00) !important;
        transform: translate(-3px, -3px);
      }
      
      #restartButton:active {
        transform: translate(3px, 3px);
        box-shadow: 
          0 0 25px rgba(255, 255, 0, 0.4),
          0 0 0 var(--color-yellow-dark, #886600) !important;
      }
      
      #saveScoreButton:hover {
        background: #003300 !important;
        box-shadow: 
          0 0 30px rgba(0, 255, 0, 0.6),
          4px 4px 0 var(--color-green, #00FF00) !important;
        transform: translate(-2px, -2px);
      }
      
      #playerNameInput:focus {
        outline: none;
        border-color: var(--color-yellow, #FFFF00);
        box-shadow: 0 0 30px rgba(255, 255, 0, 0.6), 4px 4px 0 var(--color-yellow-dark, #886600);
      }
      
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) scale(0.8); }
        20% { opacity: 1; transform: translateX(-50%) scale(1.1); }
        80% { opacity: 1; transform: translateX(-50%) scale(1); }
        100% { opacity: 0; transform: translateX(-50%) scale(0.8); }
      }
      
      /* Responsive adjustments */
      @media (max-width: 600px) {
        .stats-grid {
          grid-template-columns: 1fr !important;
          gap: var(--space-md, 1rem) !important;
        }
        
        .score-box {
          padding: var(--space-md, 1rem) !important;
        }
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
        
        // Get location and format date
        const { LocationService } = await import('../../utils/LocationService')
        const location = await LocationService.getLocation()
        const date = ScoreManager.formatDate()
        
        const entry: HighScoreEntry = {
          name: playerName,
          score: finalScore,
          survivedTime: stats.survivedTime,
          level: stats.level,
          date: date,
          location: location
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
            saveButton.style.borderColor = 'var(--color-green, #00FF00)'
            
            await GameOverScreen.displayHighScores('gameOverHighScoresList')
            
            const successMsg = document.createElement('div')
            successMsg.textContent = `★ ${playerName.toUpperCase()} SAVED ★`
            successMsg.style.cssText = `
              position: fixed;
              top: 20%;
              left: 50%;
              transform: translateX(-50%);
              font-size: clamp(1rem, 2.5vw, 1.5rem);
              color: var(--color-green, #00FF00);
              text-shadow: 0 0 25px var(--color-green, #00FF00), 4px 4px 0 var(--color-green-dark, #006600);
              pointer-events: none;
              z-index: 10001;
              animation: fadeInOut 2s ease-in-out;
              font-family: inherit;
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
            saveButton.style.borderColor = 'var(--color-red, #FF0000)'
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
          saveButton.style.borderColor = 'var(--color-red, #FF0000)'
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

  private static createStatRow(label: string, value: string, labelColor: string, valueColor: string, highlight: boolean = false): string {
    const borderStyle = highlight 
      ? `border-bottom: 2px solid ${labelColor}; padding-bottom: var(--space-xs, 0.5rem); margin-bottom: var(--space-xs, 0.3rem);`
      : `border-bottom: 1px solid rgba(0, 255, 255, 0.18); padding-bottom: var(--space-xs, 0.4rem);`
    const fontWeight = highlight ? 'font-weight: bold;' : ''
    const labelShadow = highlight ? `0 0 8px ${labelColor}, 1px 1px 0 ${labelColor}44` : `0 0 5px ${labelColor}`
    
    return `
      <div style="
        color: ${labelColor}; 
        display: flex; 
        justify-content: space-between; 
        align-items: baseline;
        ${borderStyle}
        ${fontWeight}
        text-shadow: ${labelShadow};
      ">
        <span style="flex-shrink: 0;">${label}:</span>
        <span style="color: ${valueColor}; text-shadow: 0 0 8px ${valueColor}, 0 0 4px ${valueColor}66; margin-left: var(--space-sm, 0.8rem); text-align: right;">${value}</span>
      </div>
    `
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
            padding: var(--space-md, 1rem);
            color: var(--color-magenta, #FF00FF);
            font-size: clamp(0.6rem, 1.5vw, 0.9rem);
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
        let rankGlow = 'rgba(200, 200, 200, 0.3)'
        if (index === 0) { rankColor = 'var(--color-gold, #FFD700)'; rankGlow = 'rgba(255, 215, 0, 0.5)' }
        else if (index === 1) { rankColor = 'var(--color-silver, #C0C0C0)'; rankGlow = 'rgba(192, 192, 192, 0.4)' }
        else if (index === 2) { rankColor = 'var(--color-bronze, #CD7F32)'; rankGlow = 'rgba(205, 127, 50, 0.4)' }

        return `
          <div class="highscore-row" style="
            display: grid;
            grid-template-columns: 40px 1fr 100px;
            gap: var(--space-sm, 0.8rem);
            padding: var(--space-sm, 0.7rem) var(--space-sm, 0.9rem);
            font-size: clamp(0.65rem, 1.5vw, 0.9rem);
            color: ${rankColor};
            text-shadow: 0 0 10px ${rankGlow}, 0 0 4px ${rankColor}44;
            border-bottom: 1px solid rgba(255, 0, 255, 0.22);
            align-items: center;
            transition: all 0.15s ease;
          ">
            <span style="font-weight: bold; text-shadow: 0 0 8px ${rankColor}88;">${index + 1}.</span>
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; text-shadow: 0 0 6px ${rankColor}66;">${entry.name.toUpperCase()}</span>
            <span style="text-align: right; color: var(--color-green, #00FF00); text-shadow: 0 0 12px rgba(0, 255, 0, 0.6), 0 0 6px rgba(0, 255, 0, 0.4); font-weight: bold;">${ScoreManager.formatScore(entry.score)}</span>
          </div>
        `
      }).join('')
    } catch (error) {
      console.error('❌ Error displaying high scores:', error)
      container.innerHTML = '<div style="color: var(--color-red, #FF4444); font-size: clamp(0.6rem, 1.5vw, 0.8rem);">ERROR LOADING SCORES</div>'
    }
  }

  static cleanup(): void {
    const styleEl = document.getElementById('gameover-styles')
    if (styleEl) {
      styleEl.remove()
    }
  }
}
