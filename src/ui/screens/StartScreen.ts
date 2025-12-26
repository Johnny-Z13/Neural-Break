import { AudioManager } from '../../audio/AudioManager'
import { StarfieldManager } from '../../graphics/StarfieldManager'

/**
 * 80s ARCADE-STYLE START SCREEN
 * Features flying starfield attract mode, pixel aesthetics, scanlines
 */
export class StartScreen {
  static create(
    audioManager: AudioManager | null,
    onStartGame: () => void,
    onShowLeaderboard: () => void
  ): HTMLElement {
    // Start the shared starfield background (persists between menu screens)
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
      justify-content: center;
      align-items: center;
      font-family: 'Courier New', monospace;
      text-align: center;
      z-index: 1000;
      overflow: hidden;
      pointer-events: auto;
      image-rendering: pixelated;
    `

    startScreen.innerHTML = `
      <!-- CRT MONITOR OVERLAY -->
      <div id="crtOverlay" style="
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
      
      <!-- MAIN TITLE -->
      <div class="pixel-container" style="position: relative; z-index: 1; margin-bottom: 1rem;">
        <h1 class="pixel-title" style="
          font-size: 4rem;
          font-weight: bold;
          letter-spacing: 0.3em;
          margin: 0;
          text-transform: uppercase;
          color: #00FFFF;
          text-shadow: 
            4px 4px 0 #FF00FF,
            -2px -2px 0 #FFFF00,
            0 0 30px #00FFFF,
            0 0 60px #00FFFF;
          animation: titleFlicker 0.1s infinite, titleGlow 2s ease-in-out infinite alternate;
        ">
          NEURAL BREAK
        </h1>
        
        <!-- Pixel glitch decoration -->
        <div style="
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 4px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            #FF00FF 20%, 
            #00FFFF 40%, 
            #FFFF00 60%, 
            #FF00FF 80%, 
            transparent 100%);
          box-shadow: 0 0 20px currentColor;
        "></div>
        <div style="
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 4px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            #FFFF00 20%, 
            #FF00FF 40%, 
            #00FFFF 60%, 
            #FFFF00 80%, 
            transparent 100%);
          box-shadow: 0 0 20px currentColor;
        "></div>
      </div>
      
      <!-- SUBTITLE -->
      <p class="pixel-subtitle" style="
        font-size: 1.2rem;
        margin-bottom: 2rem;
        color: #FF00FF;
        letter-spacing: 0.4em;
        text-transform: uppercase;
        text-shadow: 2px 2px 0 #00FFFF, 0 0 20px #FF00FF;
        animation: subtitlePulse 3s ease-in-out infinite;
      ">
        ESCAPE THE DIGITAL REALM
      </p>
      
      <!-- INSERT COIN / PRESS START -->
      <div class="blink-text" style="
        font-size: 1.8rem;
        color: #FFFF00;
        text-shadow: 0 0 20px #FFFF00, 2px 2px 0 #FF6600;
        letter-spacing: 0.2em;
        margin-bottom: 2rem;
        animation: coinBlink 0.8s step-end infinite;
      ">
        ▶ PRESS START ◀
      </div>
      
      <!-- BUTTONS -->
      <div style="position: relative; z-index: 1; display: flex; flex-direction: column; gap: 1rem;">
        <button id="startButton" class="pixel-button" style="
          background: #000000;
          border: 4px solid #00FFFF;
          color: #00FFFF;
          font-family: 'Courier New', monospace;
          font-size: 1.4rem;
          font-weight: bold;
          padding: 1rem 2.5rem;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          text-shadow: 0 0 10px #00FFFF;
          box-shadow: 
            0 0 20px rgba(0, 255, 255, 0.5),
            inset 0 0 20px rgba(0, 255, 255, 0.1),
            4px 4px 0 #006666;
          transition: all 0.1s step-end;
          position: relative;
          overflow: hidden;
        ">
          <span style="position: relative; z-index: 1;">★ START GAME ★</span>
        </button>
        
        <button id="leaderboardButton" class="pixel-button" style="
          background: #000000;
          border: 4px solid #FF00FF;
          color: #FF00FF;
          font-family: 'Courier New', monospace;
          font-size: 1rem;
          font-weight: bold;
          padding: 0.7rem 2rem;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-shadow: 0 0 10px #FF00FF;
          box-shadow: 
            0 0 15px rgba(255, 0, 255, 0.4),
            4px 4px 0 #660066;
          transition: all 0.1s step-end;
        ">
          ◆ HIGH SCORES ◆
        </button>
      </div>
      
      <!-- ENEMY BESTIARY - 80s PIXEL STYLE -->
      <div class="pixel-panel" style="
        position: relative;
        z-index: 1;
        margin-top: 2rem;
        background: rgba(0, 0, 0, 0.8);
        border: 4px solid #00FFFF;
        padding: 1rem 1.5rem;
        max-width: 600px;
        box-shadow: 
          0 0 30px rgba(0, 255, 255, 0.3),
          4px 4px 0 #006666,
          inset 0 0 20px rgba(0, 255, 255, 0.1);
      ">
        <h3 style="
          font-size: 1rem;
          margin-bottom: 0.8rem;
          color: #FFFF00;
          text-shadow: 2px 2px 0 #886600, 0 0 15px #FFFF00;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        ">⚠ THREAT DATABASE ⚠</h3>
        
        <div style="
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.8rem;
        ">
          <!-- DataMite -->
          <div class="enemy-card" style="
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem;
            background: rgba(255, 68, 0, 0.1);
            border: 2px solid #FF4400;
            box-shadow: 2px 2px 0 #662200;
          ">
            <div style="
              width: 24px;
              height: 24px;
              background: #FF4400;
              box-shadow: 0 0 10px #FF4400;
              animation: pixelPulse 0.5s step-end infinite;
            "></div>
            <span style="color: #FF6633; font-size: 0.7rem; font-weight: bold; text-transform: uppercase;">Data Mite</span>
          </div>
          
          <!-- ScanDrone -->
          <div class="enemy-card" style="
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem;
            background: rgba(255, 102, 0, 0.1);
            border: 2px solid #FF6600;
            box-shadow: 2px 2px 0 #663300;
          ">
            <div style="
              width: 24px;
              height: 24px;
              position: relative;
            ">
              <div style="
                position: absolute;
                width: 100%;
                height: 100%;
                background: #FF6600;
                clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
                box-shadow: 0 0 10px #FF8800;
              "></div>
              <div style="
                position: absolute;
                width: 6px;
                height: 6px;
                background: #00FF00;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                animation: scanBlink 0.3s step-end infinite;
              "></div>
            </div>
            <span style="color: #FF8844; font-size: 0.7rem; font-weight: bold; text-transform: uppercase;">Scan Drone</span>
          </div>
          
          <!-- ChaosWorm -->
          <div class="enemy-card" style="
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem;
            background: rgba(255, 0, 255, 0.1);
            border: 2px solid #FF00FF;
            box-shadow: 2px 2px 0 #660066;
          ">
            <div style="display: flex; gap: 2px;">
              <div style="width: 8px; height: 8px; background: #FF00FF; animation: wormWiggle 0.2s step-end infinite;"></div>
              <div style="width: 7px; height: 7px; background: #CC00CC; animation: wormWiggle 0.2s step-end infinite 0.05s;"></div>
              <div style="width: 6px; height: 6px; background: #9900FF; animation: wormWiggle 0.2s step-end infinite 0.1s;"></div>
            </div>
            <span style="color: #FF66FF; font-size: 0.7rem; font-weight: bold; text-transform: uppercase;">Chaos Worm</span>
          </div>
          
          <!-- VoidSphere -->
          <div class="enemy-card" style="
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem;
            background: rgba(128, 0, 255, 0.1);
            border: 2px solid #8800FF;
            box-shadow: 2px 2px 0 #440088;
          ">
            <div style="
              width: 24px;
              height: 24px;
              background: radial-gradient(circle, #000000 40%, #8800FF 100%);
              border: 2px solid #AA00FF;
              box-shadow: 0 0 15px #8800FF;
            "></div>
            <span style="color: #AA66FF; font-size: 0.7rem; font-weight: bold; text-transform: uppercase;">Void Sphere</span>
          </div>
          
          <!-- CrystalSwarm -->
          <div class="enemy-card" style="
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem;
            background: rgba(0, 255, 255, 0.1);
            border: 2px solid #00FFFF;
            box-shadow: 2px 2px 0 #006666;
          ">
            <div style="position: relative; width: 24px; height: 24px;">
              <div style="position: absolute; top: 0; left: 8px; width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 10px solid #00FFFF;"></div>
              <div style="position: absolute; top: 6px; left: 0; width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 8px solid #FF00FF;"></div>
              <div style="position: absolute; top: 6px; right: 0; width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 8px solid #FFFF00;"></div>
            </div>
            <span style="color: #66FFFF; font-size: 0.7rem; font-weight: bold; text-transform: uppercase;">Crystal Swarm</span>
          </div>
          
          <!-- Boss -->
          <div class="enemy-card" style="
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem;
            background: rgba(255, 0, 0, 0.2);
            border: 2px solid #FF0000;
            box-shadow: 2px 2px 0 #660000;
            animation: bossWarning 0.5s step-end infinite;
          ">
            <div style="
              width: 24px;
              height: 24px;
              background: linear-gradient(135deg, #FF0000 0%, #880000 100%);
              clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
              box-shadow: 0 0 15px #FF0000;
            "></div>
            <span style="color: #FF4444; font-size: 0.7rem; font-weight: bold; text-transform: uppercase;">★ BOSS ★</span>
          </div>
        </div>
      </div>
      
      <!-- CONTROLS - 80s PIXEL STYLE -->
      <div class="pixel-panel" style="
        position: fixed;
        bottom: 1rem;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 1.5rem;
        padding: 0.8rem 1.2rem;
        background: rgba(0, 0, 0, 0.9);
        border: 4px solid #00FFFF;
        box-shadow: 
          0 0 20px rgba(0, 255, 255, 0.3),
          4px 4px 0 #006666;
        z-index: 1;
      ">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.2rem;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;">
            <div></div>
            <div class="key-cap">W</div>
            <div></div>
            <div class="key-cap">A</div>
            <div class="key-cap">S</div>
            <div class="key-cap">D</div>
          </div>
          <span style="color: #00FFFF; font-size: 0.6rem; text-shadow: 0 0 5px #00FFFF; text-transform: uppercase;">Move</span>
        </div>
        
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.2rem;">
          <div class="key-cap" style="width: 60px; border-color: #FF6600; color: #FF6600; box-shadow: 0 0 8px rgba(255, 102, 0, 0.5), 2px 2px 0 #663300;">SPACE</div>
          <span style="color: #FF6600; font-size: 0.6rem; text-shadow: 0 0 5px #FF6600; text-transform: uppercase;">Fire</span>
        </div>
        
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.2rem;">
          <div class="key-cap" style="width: 50px; border-color: #00FF00; color: #00FF00; box-shadow: 0 0 8px rgba(0, 255, 0, 0.5), 2px 2px 0 #006600;">SHIFT</div>
          <span style="color: #00FF00; font-size: 0.6rem; text-shadow: 0 0 5px #00FF00; text-transform: uppercase;">Dash</span>
        </div>
      </div>
      
      <!-- CREDITS / COPYRIGHT -->
      <div style="
        position: fixed;
        bottom: 0.3rem;
        right: 0.5rem;
        color: #666666;
        font-size: 0.6rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        z-index: 1;
      ">
        © 2025 NEURAL SYSTEMS
      </div>
      
      <!-- HIGH SCORE DISPLAY -->
      <div style="
        position: fixed;
        top: 1rem;
        right: 1rem;
        color: #FFFF00;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        text-shadow: 2px 2px 0 #886600, 0 0 10px #FFFF00;
        z-index: 1;
        text-align: right;
      ">
        <div style="color: #FF00FF; font-size: 0.7rem; margin-bottom: 0.2rem;">HIGH SCORE</div>
        <div id="topScore" style="font-size: 1.2rem;">000000</div>
      </div>
    `

    // Add 80s pixel-style animations
    const style = document.createElement('style')
    style.id = 'pixel-arcade-styles'
    style.textContent = `
      @keyframes titleFlicker {
        0%, 90%, 100% { opacity: 1; }
        95% { opacity: 0.8; }
      }
      
      @keyframes titleGlow {
        0% { filter: brightness(1) drop-shadow(0 0 20px #00FFFF); }
        100% { filter: brightness(1.2) drop-shadow(0 0 40px #00FFFF); }
      }
      
      @keyframes subtitlePulse {
        0%, 100% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.02); }
      }
      
      @keyframes coinBlink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      
      @keyframes pixelPulse {
        0%, 50% { transform: scale(1); }
        51%, 100% { transform: scale(0.9); }
      }
      
      @keyframes scanBlink {
        0%, 50% { background: #00FF00; }
        51%, 100% { background: #FF0000; }
      }
      
      @keyframes wormWiggle {
        0%, 50% { transform: translateY(0); }
        51%, 100% { transform: translateY(-2px); }
      }
      
      @keyframes bossWarning {
        0%, 50% { border-color: #FF0000; }
        51%, 100% { border-color: #FFFF00; }
      }
      
      .key-cap {
        width: 22px;
        height: 22px;
        background: #111111;
        border: 2px solid #00FFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #00FFFF;
        font-size: 0.6rem;
        font-weight: bold;
        box-shadow: 0 0 8px rgba(0, 255, 255, 0.5), 2px 2px 0 #006666;
      }
      
      #startButton:hover {
        background: #003333 !important;
        box-shadow: 
          0 0 40px rgba(0, 255, 255, 0.8),
          inset 0 0 30px rgba(0, 255, 255, 0.2),
          4px 4px 0 #00FFFF !important;
        transform: translate(-2px, -2px);
      }
      
      #startButton:active {
        transform: translate(2px, 2px);
        box-shadow: 
          0 0 20px rgba(0, 255, 255, 0.6),
          inset 0 0 20px rgba(0, 255, 255, 0.1),
          0 0 0 #006666 !important;
      }
      
      #leaderboardButton:hover {
        background: #330033 !important;
        box-shadow: 
          0 0 30px rgba(255, 0, 255, 0.6),
          4px 4px 0 #FF00FF !important;
        transform: translate(-2px, -2px);
      }
      
      #leaderboardButton:active {
        transform: translate(2px, 2px);
        box-shadow: 
          0 0 15px rgba(255, 0, 255, 0.4),
          0 0 0 #660066 !important;
      }
      
      .enemy-card:hover {
        transform: translate(-2px, -2px);
        filter: brightness(1.3);
      }
      
      /* RGB color cycling for that authentic 80s feel */
      @keyframes rgbCycle {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
      }
      
      /* Chromatic aberration effect on title hover */
      .pixel-title:hover {
        animation: titleFlicker 0.05s infinite, chromatic 0.1s infinite;
      }
      
      @keyframes chromatic {
        0% { text-shadow: 4px 4px 0 #FF00FF, -2px -2px 0 #00FFFF, 0 0 30px #00FFFF; }
        25% { text-shadow: -4px 4px 0 #00FFFF, 2px -2px 0 #FFFF00, 0 0 30px #FF00FF; }
        50% { text-shadow: 4px -4px 0 #FFFF00, -2px 2px 0 #FF00FF, 0 0 30px #FFFF00; }
        75% { text-shadow: -4px -4px 0 #FF00FF, 2px 2px 0 #00FFFF, 0 0 30px #00FFFF; }
        100% { text-shadow: 4px 4px 0 #00FFFF, -2px -2px 0 #FFFF00, 0 0 30px #FF00FF; }
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
      // Stop starfield before starting game (keeps it for leaderboard navigation)
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

  /**
   * Stop the starfield (call when entering gameplay)
   */
  static stopStarfield(): void {
    StarfieldManager.getInstance().stop()
  }

  /**
   * Cleanup styles only (starfield persists between menu screens)
   */
  static cleanup(): void {
    // Remove pixel arcade styles
    const styleEl = document.getElementById('pixel-arcade-styles')
    if (styleEl) {
      styleEl.remove()
    }
  }
}
