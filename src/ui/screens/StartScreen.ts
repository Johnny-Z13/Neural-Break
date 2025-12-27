import { AudioManager } from '../../audio/AudioManager'
import { StarfieldManager } from '../../graphics/StarfieldManager'

/**
 * NEURAL BREAK - Start Screen
 * 80s Arcade / Cyberpunk Aesthetic
 * Uses unified design system CSS variables
 */
export class StartScreen {
  static create(
    audioManager: AudioManager | null,
    onStartGame: () => void,
    onShowLeaderboard: () => void
  ): HTMLElement {
    // Start the shared starfield background
    StarfieldManager.getInstance().start()

    const startScreen = document.createElement('div')
    startScreen.id = 'startScreen'
    startScreen.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: transparent;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      font-family: var(--font-family, 'Press Start 2P', monospace);
      text-align: center;
      z-index: 1000;
      overflow-y: auto;
      pointer-events: auto;
      image-rendering: pixelated;
      padding: var(--space-md, 1rem);
      padding-top: clamp(1rem, 3vh, 2rem);
      padding-bottom: 100px;
      box-sizing: border-box;
    `

    startScreen.innerHTML = `
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
      <div class="start-content" style="position: relative; z-index: 1; max-width: 950px; width: 100%;">
        
        <!-- MAIN TITLE -->
        <div class="title-container" style="margin-bottom: var(--space-md, 1rem);">
          <h1 class="game-title" style="
            font-size: clamp(1.8rem, 5vw, 3.5rem);
            font-weight: bold;
            letter-spacing: 0.2em;
            margin: 0;
            text-transform: uppercase;
            color: var(--color-cyan, #00FFFF);
            text-shadow: 
              4px 4px 0 var(--color-magenta, #FF00FF),
              -2px -2px 0 var(--color-yellow, #FFFF00),
              0 0 30px var(--color-cyan, #00FFFF),
              0 0 60px var(--color-cyan, #00FFFF);
            animation: titleFlicker 0.1s infinite, titleGlow 2s ease-in-out infinite alternate;
          ">
            NEURAL BREAK
          </h1>
          
          <!-- Decorative lines -->
          <div style="
            margin: var(--space-xs, 0.3rem) auto;
            width: 80%;
            height: 4px;
            background: linear-gradient(90deg, 
              transparent 0%, 
              var(--color-magenta, #FF00FF) 20%, 
              var(--color-cyan, #00FFFF) 40%, 
              var(--color-yellow, #FFFF00) 60%, 
              var(--color-magenta, #FF00FF) 80%, 
              transparent 100%);
            box-shadow: 0 0 20px currentColor;
          "></div>
        </div>
        
        <!-- SUBTITLE -->
        <p class="subtitle" style="
          font-size: clamp(0.6rem, 1.5vw, 1rem);
          margin-bottom: var(--space-md, 1rem);
          color: var(--color-magenta, #FF00FF);
          letter-spacing: 0.3em;
          text-transform: uppercase;
          text-shadow: 2px 2px 0 var(--color-cyan, #00FFFF), 0 0 20px var(--color-magenta, #FF00FF);
          animation: subtitlePulse 3s ease-in-out infinite;
        ">
          ESCAPE THE DIGITAL REALM
        </p>
        
        <!-- INSERT COIN / PRESS START -->
        <div class="press-start" style="
          font-size: clamp(0.9rem, 2.5vw, 1.5rem);
          color: var(--color-yellow, #FFFF00);
          text-shadow: 0 0 20px var(--color-yellow, #FFFF00), 2px 2px 0 var(--color-orange, #FF6600);
          letter-spacing: 0.15em;
          margin-bottom: var(--space-md, 1rem);
          animation: blink 0.8s step-end infinite;
        ">
          ▶ PRESS START ◀
        </div>
        
        <!-- BUTTONS -->
        <div class="button-container" style="display: flex; flex-direction: column; gap: var(--space-sm, 0.8rem); align-items: center; margin-bottom: var(--space-lg, 1.5rem);">
          <button id="startButton" class="arcade-button arcade-button-primary" style="
            background: var(--color-bg-panel, rgba(0, 0, 0, 0.85));
            border: var(--border-thick, 4px) solid var(--color-cyan, #00FFFF);
            color: var(--color-cyan, #00FFFF);
            font-family: inherit;
            font-size: clamp(0.9rem, 2vw, 1.2rem);
            font-weight: bold;
            padding: var(--space-sm, 0.8rem) var(--space-lg, 1.5rem);
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            text-shadow: 0 0 10px var(--color-cyan, #00FFFF);
            box-shadow: 
              0 0 20px var(--color-cyan-glow, rgba(0, 255, 255, 0.5)),
              inset 0 0 20px rgba(0, 255, 255, 0.1),
              var(--shadow-pixel, 4px 4px 0) var(--color-cyan-dark, #006666);
            transition: all 0.1s step-end;
          ">
            ★ START GAME ★
          </button>
          
          <button id="leaderboardButton" class="arcade-button arcade-button-secondary" style="
            background: var(--color-bg-panel, rgba(0, 0, 0, 0.85));
            border: var(--border-thick, 4px) solid var(--color-magenta, #FF00FF);
            color: var(--color-magenta, #FF00FF);
            font-family: inherit;
            font-size: clamp(0.7rem, 1.5vw, 0.9rem);
            font-weight: bold;
            padding: var(--space-xs, 0.5rem) var(--space-md, 1rem);
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            text-shadow: 0 0 10px var(--color-magenta, #FF00FF);
            box-shadow: 
              0 0 15px var(--color-magenta-glow, rgba(255, 0, 255, 0.4)),
              var(--shadow-pixel, 4px 4px 0) var(--color-magenta-dark, #660066);
            transition: all 0.1s step-end;
          ">
            ◆ HIGH SCORES ◆
          </button>
        </div>
        
        <!-- ═══════════════════════════════════════════════════════════════════ -->
        <!-- ENEMY DATABASE - ENLARGED WITH ENEMY VISUALS -->
        <!-- ═══════════════════════════════════════════════════════════════════ -->
        <div class="threat-database" style="
          background: var(--color-bg-panel, rgba(0, 0, 0, 0.9));
          border: var(--border-thick, 4px) solid var(--color-red, #FF0000);
          padding: var(--space-lg, 1.5rem);
          max-width: 900px;
          margin: 0 auto;
          box-shadow: 
            0 0 40px rgba(255, 0, 0, 0.4),
            inset 0 0 30px rgba(255, 0, 0, 0.1),
            var(--shadow-pixel, 6px 6px 0) #660000;
        ">
          <h3 style="
            font-size: clamp(1rem, 2vw, 1.4rem);
            margin-bottom: var(--space-lg, 1.5rem);
            color: var(--color-red, #FF0000);
            text-shadow: 
              3px 3px 0 #880000, 
              0 0 20px var(--color-red, #FF0000),
              0 0 40px rgba(255, 0, 0, 0.5);
            letter-spacing: 0.2em;
            text-transform: uppercase;
            animation: dangerPulse 1s ease-in-out infinite;
          ">⚠ THREAT DATABASE ⚠</h3>
          
          <div class="enemy-grid" style="
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: var(--space-md, 1rem);
          ">
            ${StartScreen.createEnemyCard('DATA MITE', 'datamite', '#FF4400', 100)}
            ${StartScreen.createEnemyCard('SCAN DRONE', 'scandrone', '#FF8800', 250)}
            ${StartScreen.createEnemyCard('CHAOS WORM', 'chaosworm', '#FF00FF', 500)}
            ${StartScreen.createEnemyCard('CRYSTAL SWARM', 'crystalswarm', '#00FFFF', 750)}
            ${StartScreen.createEnemyCard('VOID SPHERE', 'voidsphere', '#AA00FF', 1000)}
            ${StartScreen.createEnemyCard('FIZZER', 'fizzer', '#00FF88', 200)}
            ${StartScreen.createEnemyCard('UFO', 'ufo', '#88AAFF', 1500)}
            ${StartScreen.createEnemyCard('BOSS', 'boss', '#FF0000', 5000, true)}
          </div>
        </div>
      </div>
      
      <!-- CONTROLS LEGEND -->
      <div class="controls-legend" style="
        position: fixed;
        bottom: var(--space-md, 1rem);
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: var(--space-lg, 1.5rem);
        padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
        background: var(--color-bg-panel, rgba(0, 0, 0, 0.9));
        border: var(--border-thick, 4px) solid var(--color-cyan, #00FFFF);
        box-shadow: 
          0 0 20px var(--color-cyan-glow, rgba(0, 255, 255, 0.3)),
          var(--shadow-pixel, 4px 4px 0) var(--color-cyan-dark, #006666);
        z-index: 1;
        flex-wrap: wrap;
        justify-content: center;
      ">
        <div class="control-item" style="display: flex; flex-direction: column; align-items: center; gap: 0.2rem;">
          <div style="display: flex; gap: 2px;">
            <span class="key-cap">W</span>
            <span class="key-cap">A</span>
            <span class="key-cap">S</span>
            <span class="key-cap">D</span>
          </div>
          <span style="color: var(--color-cyan, #00FFFF); font-size: clamp(0.4rem, 1vw, 0.6rem); text-shadow: 0 0 5px var(--color-cyan, #00FFFF);">MOVE</span>
        </div>
        
        <div class="control-item" style="display: flex; flex-direction: column; align-items: center; gap: 0.2rem;">
          <span class="key-cap key-space" style="border-color: var(--color-orange, #FF6600); color: var(--color-orange, #FF6600);">SPACE</span>
          <span style="color: var(--color-orange, #FF6600); font-size: clamp(0.4rem, 1vw, 0.6rem); text-shadow: 0 0 5px var(--color-orange, #FF6600);">FIRE</span>
        </div>
        
        <div class="control-item" style="display: flex; flex-direction: column; align-items: center; gap: 0.2rem;">
          <span class="key-cap key-shift" style="border-color: var(--color-green, #00FF00); color: var(--color-green, #00FF00);">SHIFT</span>
          <span style="color: var(--color-green, #00FF00); font-size: clamp(0.4rem, 1vw, 0.6rem); text-shadow: 0 0 5px var(--color-green, #00FF00);">DASH</span>
        </div>
      </div>
      
      <!-- COPYRIGHT -->
      <div style="
        position: fixed;
        bottom: 0.3rem;
        right: 0.5rem;
        color: #666666;
        font-size: clamp(0.4rem, 0.8vw, 0.6rem);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        z-index: 1;
      ">
        © 2025 NEURAL SYSTEMS
      </div>
      
      <!-- HIGH SCORE DISPLAY -->
      <div class="high-score-display" style="
        position: fixed;
        top: var(--space-md, 1rem);
        right: var(--space-md, 1rem);
        color: var(--color-yellow, #FFFF00);
        font-size: clamp(0.6rem, 1.2vw, 0.9rem);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        text-shadow: 2px 2px 0 var(--color-yellow-dark, #886600), 0 0 10px var(--color-yellow, #FFFF00);
        z-index: 1;
        text-align: right;
      ">
        <div style="color: var(--color-magenta, #FF00FF); font-size: clamp(0.5rem, 1vw, 0.7rem); margin-bottom: 0.2rem;">HIGH SCORE</div>
        <div id="topScore" style="font-size: clamp(0.8rem, 1.5vw, 1.2rem);">000000</div>
      </div>
    `

    // Add styles
    const style = document.createElement('style')
    style.id = 'start-screen-styles'
    style.textContent = `
      @keyframes titleFlicker {
        0%, 90%, 100% { opacity: 1; }
        95% { opacity: 0.85; }
      }
      
      @keyframes titleGlow {
        0% { filter: brightness(1) drop-shadow(0 0 20px var(--color-cyan, #00FFFF)); }
        100% { filter: brightness(1.2) drop-shadow(0 0 40px var(--color-cyan, #00FFFF)); }
      }
      
      @keyframes subtitlePulse {
        0%, 100% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.02); }
      }
      
      @keyframes dangerPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      @keyframes enemyFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      
      @keyframes enemyGlow {
        0%, 100% { filter: drop-shadow(0 0 5px currentColor); }
        50% { filter: drop-shadow(0 0 15px currentColor); }
      }
      
      @keyframes wormWiggle {
        0%, 100% { transform: rotate(-3deg); }
        50% { transform: rotate(3deg); }
      }
      
      @keyframes orbitRing {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes crystalSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes bossWarning {
        0%, 50% { border-color: #FF0000; box-shadow: 0 0 20px rgba(255, 0, 0, 0.6), 3px 3px 0 #660000; }
        51%, 100% { border-color: #FFFF00; box-shadow: 0 0 20px rgba(255, 255, 0, 0.6), 3px 3px 0 #666600; }
      }
      
      .key-cap {
        min-width: 24px;
        height: 24px;
        padding: 0 4px;
        background: #111111;
        border: 2px solid var(--color-cyan, #00FFFF);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--color-cyan, #00FFFF);
        font-size: clamp(0.5rem, 1vw, 0.7rem);
        font-weight: bold;
        box-shadow: 0 0 8px rgba(0, 255, 255, 0.5), 2px 2px 0 var(--color-cyan-dark, #006666);
      }
      
      .key-space { width: 60px; }
      .key-shift { width: 50px; }
      
      #startButton:hover {
        background: #003333 !important;
        box-shadow: 
          0 0 40px rgba(0, 255, 255, 0.8),
          inset 0 0 30px rgba(0, 255, 255, 0.2),
          4px 4px 0 var(--color-cyan, #00FFFF) !important;
        transform: translate(-2px, -2px);
      }
      
      #startButton:active {
        transform: translate(2px, 2px);
        box-shadow: 
          0 0 20px rgba(0, 255, 255, 0.6),
          inset 0 0 20px rgba(0, 255, 255, 0.1),
          0 0 0 var(--color-cyan-dark, #006666) !important;
      }
      
      #leaderboardButton:hover {
        background: #330033 !important;
        box-shadow: 
          0 0 30px rgba(255, 0, 255, 0.6),
          4px 4px 0 var(--color-magenta, #FF00FF) !important;
        transform: translate(-2px, -2px);
      }
      
      #leaderboardButton:active {
        transform: translate(2px, 2px);
        box-shadow: 
          0 0 15px rgba(255, 0, 255, 0.4),
          0 0 0 var(--color-magenta-dark, #660066) !important;
      }
      
      .enemy-card {
        transition: all 0.2s ease;
        cursor: default;
      }
      
      .enemy-card:hover {
        transform: translateY(-5px) scale(1.02);
        z-index: 10;
      }
      
      .enemy-card:hover .enemy-visual {
        animation-duration: 0.5s;
      }
      
      @media (max-width: 1024px) {
        .enemy-grid {
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 0.75rem !important;
        }
      }
      
      @media (max-width: 768px) {
        .controls-legend {
          flex-direction: row !important;
          gap: 0.8rem !important;
          padding: 0.4rem 0.6rem !important;
        }
        
        .enemy-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 0.6rem !important;
        }
        
        .threat-database {
          padding: 0.75rem !important;
        }
      }
      
      @media (max-width: 480px) {
        .enemy-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 0.5rem !important;
        }
        
        .enemy-card {
          padding: 0.5rem !important;
        }
        
        .enemy-visual {
          width: 40px !important;
          height: 40px !important;
        }
      }
    `
    document.head.appendChild(style)

    // Add event listeners
    const startButton = startScreen.querySelector('#startButton') as HTMLButtonElement
    startButton.addEventListener('mouseenter', () => {
      if (audioManager) audioManager.playButtonHoverSound()
    })
    startButton.addEventListener('click', () => {
      if (audioManager) audioManager.playButtonPressSound()
      StartScreen.stopStarfield()
      StartScreen.cleanup()
      setTimeout(() => {
        onStartGame()
      }, 50)
    })

    const leaderboardButton = startScreen.querySelector('#leaderboardButton') as HTMLButtonElement
    leaderboardButton.addEventListener('mouseenter', () => {
      if (audioManager) audioManager.playButtonHoverSound()
    })
    leaderboardButton.addEventListener('click', () => {
      if (audioManager) audioManager.playButtonPressSound()
      onShowLeaderboard()
    })

    return startScreen
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ENEMY CARD GENERATOR - With visual representation
  // ═══════════════════════════════════════════════════════════════════════════
  private static createEnemyCard(name: string, type: string, color: string, points: number, isBoss: boolean = false): string {
    const enemyVisual = StartScreen.getEnemyVisual(type)
    const cardAnimation = isBoss ? 'animation: bossWarning 0.5s step-end infinite;' : ''
    const sizeClass = isBoss ? 'boss-card' : ''
    
    return `
      <div class="enemy-card ${sizeClass}" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm, 0.5rem);
        padding: var(--space-md, 1rem);
        background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(20,10,30,0.9) 100%);
        border: 3px solid ${color};
        border-radius: 4px;
        box-shadow: 
          0 0 20px ${color}66,
          inset 0 0 15px ${color}22,
          3px 3px 0 ${color}44;
        ${cardAnimation}
      ">
        <!-- ENEMY VISUAL -->
        <div class="enemy-visual" style="
          width: clamp(50px, 8vw, 70px);
          height: clamp(50px, 8vw, 70px);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: enemyFloat 2s ease-in-out infinite;
        ">
          ${enemyVisual}
        </div>
        
        <!-- ENEMY NAME -->
        <div style="
          color: ${color};
          font-size: clamp(0.55rem, 1.2vw, 0.75rem);
          font-weight: bold;
          text-transform: uppercase;
          text-shadow: 0 0 10px ${color}, 2px 2px 0 ${color}44;
          letter-spacing: 0.1em;
        ">${name}</div>
        
        <!-- POINTS VALUE -->
        <div style="
          color: var(--color-yellow, #FFFF00);
          font-size: clamp(0.5rem, 1vw, 0.65rem);
          text-shadow: 0 0 8px var(--color-yellow, #FFFF00);
        ">${points.toLocaleString()} PTS</div>
      </div>
    `
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SVG ENEMY VISUALS - Detailed representations
  // ═══════════════════════════════════════════════════════════════════════════
  private static getEnemyVisual(type: string): string {
    switch (type) {
      case 'datamite':
        // Orange sphere with wireframe ring and glowing core
        return `
          <svg viewBox="0 0 60 60" width="100%" height="100%">
            <defs>
              <radialGradient id="miteGrad" cx="40%" cy="40%">
                <stop offset="0%" stop-color="#FFAA00"/>
                <stop offset="100%" stop-color="#FF4400"/>
              </radialGradient>
              <filter id="miteGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <!-- Outer ring -->
            <circle cx="30" cy="30" r="25" fill="none" stroke="#FF6600" stroke-width="2" opacity="0.6" style="animation: orbitRing 3s linear infinite;"/>
            <!-- Main body -->
            <circle cx="30" cy="30" r="18" fill="url(#miteGrad)" filter="url(#miteGlow)"/>
            <!-- Inner core -->
            <circle cx="30" cy="30" r="8" fill="#FFFFFF" opacity="0.9"/>
            <!-- Eye/sensor -->
            <circle cx="30" cy="26" r="4" fill="#000000"/>
            <circle cx="31" cy="25" r="1.5" fill="#FFFFFF"/>
          </svg>
        `
      
      case 'scandrone':
        // Hexagonal drone with radar sweep
        return `
          <svg viewBox="0 0 60 60" width="100%" height="100%">
            <defs>
              <linearGradient id="droneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FFAA00"/>
                <stop offset="100%" stop-color="#FF6600"/>
              </linearGradient>
              <filter id="droneGlow">
                <feGaussianBlur stdDeviation="2"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <!-- Hexagon body -->
            <polygon points="30,5 52,17 52,43 30,55 8,43 8,17" fill="url(#droneGrad)" stroke="#FFCC00" stroke-width="2" filter="url(#droneGlow)"/>
            <!-- Radar circle -->
            <circle cx="30" cy="30" r="12" fill="none" stroke="#00FFFF" stroke-width="2"/>
            <!-- Radar sweep -->
            <g style="transform-origin: 30px 30px; animation: orbitRing 1.5s linear infinite;">
              <line x1="30" y1="30" x2="30" y2="18" stroke="#00FF00" stroke-width="3" opacity="0.9"/>
            </g>
            <!-- Center eye -->
            <circle cx="30" cy="30" r="5" fill="#00FFFF"/>
            <circle cx="30" cy="30" r="2" fill="#FFFFFF"/>
          </svg>
        `
      
      case 'chaosworm':
        // Segmented rainbow worm
        return `
          <svg viewBox="0 0 60 60" width="100%" height="100%" style="animation: wormWiggle 0.5s ease-in-out infinite;">
            <defs>
              <filter id="wormGlow">
                <feGaussianBlur stdDeviation="1.5"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <!-- Tail segments -->
            <rect x="2" y="26" width="8" height="8" rx="2" fill="#8800FF" transform="rotate(-10 6 30)" filter="url(#wormGlow)"/>
            <rect x="11" y="25" width="9" height="9" rx="2" fill="#0088FF" transform="rotate(-5 15 30)" filter="url(#wormGlow)"/>
            <rect x="21" y="24" width="10" height="10" rx="2" fill="#00FF00" transform="rotate(0 26 30)" filter="url(#wormGlow)"/>
            <rect x="32" y="23" width="11" height="11" rx="2" fill="#FFFF00" transform="rotate(5 37 30)" filter="url(#wormGlow)"/>
            <!-- Head -->
            <rect x="44" y="22" width="13" height="13" rx="3" fill="#FF0000" transform="rotate(10 50 30)" filter="url(#wormGlow)"/>
            <!-- Eyes -->
            <circle cx="51" cy="26" r="3" fill="#FFFFFF"/>
            <circle cx="51" cy="26" r="1.5" fill="#000000"/>
            <!-- Fangs -->
            <polygon points="56,30 58,35 54,35" fill="#FFFFFF"/>
          </svg>
        `
      
      case 'voidsphere':
        // Dark sphere with purple orbital rings
        return `
          <svg viewBox="0 0 60 60" width="100%" height="100%">
            <defs>
              <radialGradient id="voidGrad" cx="50%" cy="50%">
                <stop offset="0%" stop-color="#220044"/>
                <stop offset="100%" stop-color="#000000"/>
              </radialGradient>
              <filter id="voidGlow">
                <feGaussianBlur stdDeviation="3"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <!-- Outer ring 1 -->
            <ellipse cx="30" cy="30" rx="27" ry="10" fill="none" stroke="#AA00FF" stroke-width="2" opacity="0.6" style="animation: orbitRing 3s linear infinite;"/>
            <!-- Outer ring 2 -->
            <ellipse cx="30" cy="30" rx="10" ry="27" fill="none" stroke="#FF00FF" stroke-width="1.5" opacity="0.5" style="animation: orbitRing 2s linear infinite reverse;"/>
            <!-- Main void sphere -->
            <circle cx="30" cy="30" r="16" fill="url(#voidGrad)" stroke="#8800FF" stroke-width="2" filter="url(#voidGlow)"/>
            <!-- Inner void -->
            <circle cx="30" cy="30" r="8" fill="#000000"/>
            <!-- Energy points -->
            <circle cx="44" cy="30" r="3" fill="#FF00FF" opacity="0.8" style="animation: enemyGlow 0.5s ease-in-out infinite;"/>
            <circle cx="16" cy="30" r="3" fill="#FF00FF" opacity="0.8" style="animation: enemyGlow 0.5s ease-in-out infinite 0.25s;"/>
          </svg>
        `
      
      case 'crystalswarm':
        // Multiple crystals orbiting a core
        return `
          <svg viewBox="0 0 60 60" width="100%" height="100%">
            <defs>
              <linearGradient id="crystalGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#00FFFF"/>
                <stop offset="100%" stop-color="#0088AA"/>
              </linearGradient>
              <linearGradient id="crystalGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FF00FF"/>
                <stop offset="100%" stop-color="#AA0088"/>
              </linearGradient>
              <filter id="crystalGlow">
                <feGaussianBlur stdDeviation="2"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <!-- Center core -->
            <polygon points="30,22 38,30 30,38 22,30" fill="#00FFFF" filter="url(#crystalGlow)"/>
            <!-- Orbiting crystals -->
            <g style="transform-origin: 30px 30px; animation: crystalSpin 4s linear infinite;">
              <polygon points="30,5 34,12 26,12" fill="url(#crystalGrad1)" filter="url(#crystalGlow)"/>
              <polygon points="50,30 43,34 43,26" fill="url(#crystalGrad2)" filter="url(#crystalGlow)"/>
              <polygon points="30,55 26,48 34,48" fill="#FFFF00" filter="url(#crystalGlow)"/>
              <polygon points="10,30 17,26 17,34" fill="#00FF88" filter="url(#crystalGlow)"/>
            </g>
            <!-- Lightning connections -->
            <line x1="30" y1="22" x2="30" y2="12" stroke="#00FFFF" stroke-width="1" opacity="0.6" style="animation: enemyGlow 0.2s step-end infinite;"/>
            <line x1="38" y1="30" x2="43" y2="30" stroke="#00FFFF" stroke-width="1" opacity="0.6" style="animation: enemyGlow 0.2s step-end infinite 0.1s;"/>
          </svg>
        `
      
      case 'fizzer':
        // Electric chaos orb with crackling spikes
        return `
          <svg viewBox="0 0 60 60" width="100%" height="100%">
            <defs>
              <radialGradient id="fizzerGrad" cx="40%" cy="40%">
                <stop offset="0%" stop-color="#FFFFFF"/>
                <stop offset="50%" stop-color="#00FF88"/>
                <stop offset="100%" stop-color="#00AA44"/>
              </radialGradient>
              <filter id="fizzerGlow">
                <feGaussianBlur stdDeviation="3"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <!-- Erratic ring -->
            <circle cx="30" cy="30" r="22" fill="none" stroke="#00FF88" stroke-width="1.5" opacity="0.5" stroke-dasharray="3 5" style="animation: orbitRing 0.5s linear infinite;"/>
            <!-- Main glowing core -->
            <circle cx="30" cy="30" r="12" fill="url(#fizzerGrad)" filter="url(#fizzerGlow)"/>
            <!-- Inner white hot core -->
            <circle cx="30" cy="30" r="5" fill="#FFFFFF" opacity="0.95" style="animation: enemyGlow 0.1s step-end infinite;"/>
            <!-- Electric spikes radiating out -->
            <line x1="30" y1="5" x2="30" y2="15" stroke="#00FFFF" stroke-width="2" opacity="0.9" style="animation: enemyGlow 0.15s step-end infinite;"/>
            <line x1="30" y1="45" x2="30" y2="55" stroke="#00FFFF" stroke-width="2" opacity="0.9" style="animation: enemyGlow 0.15s step-end infinite 0.05s;"/>
            <line x1="5" y1="30" x2="15" y2="30" stroke="#00FFFF" stroke-width="2" opacity="0.9" style="animation: enemyGlow 0.15s step-end infinite 0.1s;"/>
            <line x1="45" y1="30" x2="55" y2="30" stroke="#00FFFF" stroke-width="2" opacity="0.9" style="animation: enemyGlow 0.15s step-end infinite 0.15s;"/>
            <!-- Diagonal spikes -->
            <line x1="10" y1="10" x2="18" y2="18" stroke="#00FF00" stroke-width="1.5" opacity="0.8"/>
            <line x1="50" y1="10" x2="42" y2="18" stroke="#00FF00" stroke-width="1.5" opacity="0.8"/>
            <line x1="10" y1="50" x2="18" y2="42" stroke="#00FF00" stroke-width="1.5" opacity="0.8"/>
            <line x1="50" y1="50" x2="42" y2="42" stroke="#00FF00" stroke-width="1.5" opacity="0.8"/>
            <!-- Orbiting sparks -->
            <circle cx="30" cy="8" r="3" fill="#00FF00" style="animation: orbitRing 0.3s linear infinite;"/>
            <circle cx="8" cy="30" r="2.5" fill="#00FFFF" style="animation: orbitRing 0.4s linear infinite reverse;"/>
            <circle cx="52" cy="30" r="2" fill="#FFFFFF" opacity="0.9"/>
            <circle cx="30" cy="52" r="2.5" fill="#00FF88"/>
          </svg>
        `
      
      case 'ufo':
        // Classic flying saucer with dome and running lights
        return `
          <svg viewBox="0 0 60 60" width="100%" height="100%">
            <defs>
              <linearGradient id="ufoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#778899"/>
                <stop offset="50%" stop-color="#445566"/>
                <stop offset="100%" stop-color="#334455"/>
              </linearGradient>
              <radialGradient id="ufoDomeGrad" cx="40%" cy="30%">
                <stop offset="0%" stop-color="#AADDFF"/>
                <stop offset="100%" stop-color="#4488CC"/>
              </radialGradient>
              <filter id="ufoGlow">
                <feGaussianBlur stdDeviation="2"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <!-- Main saucer body -->
            <ellipse cx="30" cy="35" rx="25" ry="8" fill="url(#ufoGrad)" stroke="#66AACC" stroke-width="2"/>
            <!-- Saucer wireframe overlay -->
            <ellipse cx="30" cy="35" rx="26" ry="9" fill="none" stroke="#00FFFF" stroke-width="1" opacity="0.4"/>
            <!-- Cockpit dome -->
            <ellipse cx="30" cy="30" rx="12" ry="10" fill="url(#ufoDomeGrad)" filter="url(#ufoGlow)"/>
            <ellipse cx="30" cy="30" rx="13" ry="11" fill="none" stroke="#00FFFF" stroke-width="1" opacity="0.6"/>
            <!-- Running lights around edge -->
            <circle cx="6" cy="35" r="2.5" fill="#FF0000" style="animation: enemyGlow 0.5s ease-in-out infinite;"/>
            <circle cx="14" cy="38" r="2" fill="#00FF00" style="animation: enemyGlow 0.5s ease-in-out infinite 0.1s;"/>
            <circle cx="23" cy="40" r="2" fill="#0088FF" style="animation: enemyGlow 0.5s ease-in-out infinite 0.2s;"/>
            <circle cx="37" cy="40" r="2" fill="#FF0000" style="animation: enemyGlow 0.5s ease-in-out infinite 0.3s;"/>
            <circle cx="46" cy="38" r="2" fill="#00FF00" style="animation: enemyGlow 0.5s ease-in-out infinite 0.4s;"/>
            <circle cx="54" cy="35" r="2.5" fill="#0088FF" style="animation: enemyGlow 0.5s ease-in-out infinite 0.5s;"/>
            <!-- Bottom glow/tractor beam -->
            <ellipse cx="30" cy="42" rx="8" ry="4" fill="#00FF88" opacity="0.4" style="animation: enemyGlow 1s ease-in-out infinite;"/>
            <!-- Laser charging indicator -->
            <line x1="30" y1="42" x2="30" y2="55" stroke="#FF0000" stroke-width="3" opacity="0.6" stroke-dasharray="2 2" style="animation: enemyGlow 0.3s step-end infinite;"/>
          </svg>
        `
      
      case 'boss':
        // Large armored boss with energy core
        return `
          <svg viewBox="0 0 60 60" width="100%" height="100%">
            <defs>
              <linearGradient id="bossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FF0000"/>
                <stop offset="50%" stop-color="#880000"/>
                <stop offset="100%" stop-color="#440000"/>
              </linearGradient>
              <filter id="bossGlow">
                <feGaussianBlur stdDeviation="3"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <!-- Outer energy ring -->
            <circle cx="30" cy="30" r="28" fill="none" stroke="#FF6600" stroke-width="2" opacity="0.5" style="animation: orbitRing 2s linear infinite;"/>
            <!-- Main body (octahedron shape) -->
            <polygon points="30,5 55,30 30,55 5,30" fill="url(#bossGrad)" stroke="#FF4400" stroke-width="3" filter="url(#bossGlow)"/>
            <!-- Armor plates -->
            <rect x="26" y="2" width="8" height="6" fill="#4B0000" stroke="#FF4400" stroke-width="1"/>
            <rect x="26" y="52" width="8" height="6" fill="#4B0000" stroke="#FF4400" stroke-width="1"/>
            <rect x="2" y="27" width="6" height="8" fill="#4B0000" stroke="#FF4400" stroke-width="1"/>
            <rect x="52" y="27" width="6" height="8" fill="#4B0000" stroke="#FF4400" stroke-width="1"/>
            <!-- Center core -->
            <polygon points="30,18 42,30 30,42 18,30" fill="#FF0000" opacity="0.9"/>
            <circle cx="30" cy="30" r="6" fill="#FFFF00" style="animation: enemyGlow 0.3s ease-in-out infinite;"/>
            <!-- Turret points -->
            <circle cx="30" cy="8" r="3" fill="#FFFF00" opacity="0.8"/>
            <circle cx="30" cy="52" r="3" fill="#FFFF00" opacity="0.8"/>
            <circle cx="8" cy="30" r="3" fill="#FFFF00" opacity="0.8"/>
            <circle cx="52" cy="30" r="3" fill="#FFFF00" opacity="0.8"/>
          </svg>
        `
      
      default:
        return `<div style="width: 40px; height: 40px; background: ${type}; border-radius: 50%;"></div>`
    }
  }

  static stopStarfield(): void {
    StarfieldManager.getInstance().stop()
  }

  static cleanup(): void {
    const styleEl = document.getElementById('start-screen-styles')
    if (styleEl) {
      styleEl.remove()
    }
  }
}
