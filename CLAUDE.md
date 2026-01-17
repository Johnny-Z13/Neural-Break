# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start Development Server:**
```bash
npm run dev
```
Launches Vite dev server on port 3000 with auto-reload

**Build for Production:**
```bash
npm run build
```
Creates optimized production build with Three.js chunking

**Preview Production Build:**
```bash
npm run preview
```

**Run Playwright Tests:**
```bash
npx playwright test
```
Runs end-to-end tests with Playwright across multiple browsers

**Run Playwright Tests in UI Mode:**
```bash
npx playwright test --ui
```
Interactive test runner with debugging capabilities

## Development Configuration

### TypeScript Setup
The project uses TypeScript with strict type checking enabled via `tsconfig.json`:
- **Strict mode**: Full type safety with strict compiler options
- **Module resolution**: Bundler mode for Vite compatibility
- **Target**: ES2020 for modern JavaScript features
- **No emit**: TypeScript is used for type checking only; Vite handles transpilation

### Debug Mode
The `DEBUG_MODE` constant in `src/config/index.ts` automatically adjusts based on environment:

```typescript
export const DEBUG_MODE = !import.meta.env.PROD
```

**Behavior:**
- **Development** (`npm run dev`): `DEBUG_MODE = true` - console logs enabled
- **Production** (`npm run build`): `DEBUG_MODE = false` - console logs disabled

**Usage in code:**
```typescript
if (DEBUG_MODE) {
  console.log('🎮 Debug information here')
}
```

This ensures all debug logging is automatically stripped from production builds, improving performance and reducing bundle size.

### Directory Structure
- **src/**: Source code
- **tests/**: Manual test utilities and future automated tests
- **resources/**: Unused assets archived for potential future use
- **docs/**: Project documentation
- **api/**: Vercel serverless functions

## Project Architecture

### Core Game Structure
Neural Break is a cyberpunk survival game built with Three.js and TypeScript. The main entry point is `src/main.ts` which initializes the `Game` class.

**Key Systems:**
- **Game**: Central coordinator managing all systems and game state
- **SceneManager**: Three.js scene, camera, and rendering pipeline
- **Player**: Player entity with movement, health, and progression
- **EnemyManager**: Spawning, updating, and managing all enemy entities
- **WeaponSystem**: Projectile-based combat system with upgrades
- **InputManager**: Keyboard input handling (WASD movement, Space firing, Shift dash)
- **UIManager**: HUD elements and game interface
- **AudioManager**: Sound effects and audio feedback
- **GameTimer**: 30-minute countdown timer with elapsed time tracking

### Entity System
- **Player**: Neural coherence (health), XP progression, level system
- **Enemies**: Multiple types (DataMite, ScanDrone, ChaosWorm, VoidSphere, CrystalShardSwarm)
- **Projectiles**: Player weapons with collision detection and damage

### Game State Management
Uses `GameStateType` enum:
- START_SCREEN: Initial menu
- PLAYING: Active gameplay
- GAME_OVER: End screen with statistics

### Technical Implementation Details

**Three.js Setup:**
- Orthographic camera for top-down gameplay
- Scene management with add/remove entity methods
- Screen shake effects for combat feedback
- Real-time lighting and post-processing ready

**Game Loop:**
- 60 FPS target with deltaTime-based updates
- Performance monitoring and cleanup systems
- Proper entity pooling for projectiles and enemies

**Collision System:**
- Player-enemy collision for damage
- Projectile-enemy collision for combat
- Efficient spatial checking optimized for arena gameplay

**Progression System:**
- XP-based leveling with scaling requirements
- Combo system with timer-based decay
- Statistics tracking for different enemy types

### File Organization
```
src/
├── main.ts                 # Entry point
├── core/                   # Core game systems
│   ├── Game.ts            # Main game coordinator
│   ├── GameState.ts       # State management and scoring
│   ├── GameTimer.ts       # Timer system
│   ├── InputManager.ts    # Input handling
│   └── EnemyManager.ts    # Enemy spawning/management
├── entities/               # Game entities
│   ├── Player.ts          # Player entity
│   └── Enemy.ts           # Enemy types
├── weapons/                # Combat system
│   ├── WeaponSystem.ts    # Weapon management
│   └── Projectile.ts      # Projectile entities
├── graphics/               # Rendering
│   ├── SceneManager.ts    # Three.js scene management
│   └── StarfieldManager.ts # Animated starfield background
├── ui/                     # User interface
│   ├── UIManager.ts       # HUD management
│   ├── GameScreens.ts     # Screen manager with transitions
│   └── screens/           # Individual screen components
│       ├── StartScreen.ts      # VHS cyberpunk arcade menu
│       ├── LeaderboardScreen.ts # Hall of Fame with Vercel KV
│       ├── GameOverScreen.ts   # End game stats screen
│       ├── PauseScreen.ts      # In-game pause overlay
│       └── ScreenTransitions.ts # Fade/slide/zoom effects
└── audio/                  # Audio system
    └── AudioManager.ts    # Sound management

tests/                      # Playwright E2E tests
└── e2e/                   # End-to-end test suites
```

### Key Design Patterns

**Entity Management:**
All entities follow initialize/update/cleanup pattern with proper Three.js mesh management.

**System Communication:**
Systems communicate through the main Game class rather than direct coupling.

**Resource Cleanup:**
Critical cleanup methods prevent memory leaks during game restarts - always call cleanup() methods before creating new game instances.

**Performance Considerations:**
- Entity pooling for frequently spawned objects
- Efficient collision detection
- Proper disposal of Three.js objects

### UI Design System

**VHS Cyberpunk Arcade Aesthetic:**
Neural Break features a distinctive retro-futuristic UI inspired by 80s arcade cabinets and VHS aesthetics:

**Visual Elements:**
- **Holographic 3D Grids**: CSS perspective-based animated grid backgrounds
- **VHS Effects**: Tracking noise, chromatic aberration, scanlines
- **CRT Scanlines**: Repeating linear gradients for authentic CRT feel
- **Neon Color Palette**: Cyan (#00FFFF), Magenta (#FF00FF), Yellow (#FFFF00)
- **Arcade Cabinet Corners**: Glowing corner brackets with pulse animations
- **Pixel-Perfect Typography**: Press Start 2P font with clamp() responsive sizing

**Screen Transitions:**
- Fade transitions for standard navigation
- Slide transitions for leaderboard
- Zoom transitions for dramatic game over
- Configurable animation timings in ScreenTransitions.ts

**Menu System:**
- Vertical arcade-style list navigation (ARCADE, ROGUE, TEST, HI SCORES)
- Color-coded menu items with individual neon glows
- Keyboard (WASD/Arrows), Gamepad, and mouse support
- Selection indicator with border-left shift effect

**Screen Components:**
- **StartScreen**: Main menu with enemy database, INSERT COIN banner, vertical menu
- **LeaderboardScreen**: Golden theme "HALL OF FAME" with Vercel KV integration
- **GameOverScreen**: Red danger theme with glitch overlay and RGB-split title
- **PauseScreen**: Translucent overlay with dimmed effects, ESC to unpause

**Design Principles:**
- No scrollbars (fixed viewport with overflow: hidden)
- Responsive with clamp() for all font sizes and spacing
- Step-end transitions for arcade authenticity
- Multi-layer glow effects (text-shadow + box-shadow)

**Key Files:**
- `index.html`: Unified design system CSS variables
- `src/ui/screens/*.ts`: Individual screen implementations
- `src/ui/screens/ScreenTransitions.ts`: Animation orchestration

### Cloud Infrastructure

**Vercel KV (Redis) Integration:**
- High score leaderboard persistence
- Play count tracking across sessions
- Environment variables via Vercel CLI
- API routes: `/api/highscores` (GET/POST)

**Setup Commands:**
```bash
vercel link --yes              # Link to Vercel project
vercel env pull .env.local     # Pull environment variables
```

**Environment Variables:**
- `REDIS_URL`: Vercel KV connection string
- `VERCEL_OIDC_TOKEN`: Authentication token

### Testing Strategy

**Playwright End-to-End Testing:**
- Browser automation for UI/UX validation
- Cross-browser testing (Chromium, Firefox, WebKit)
- Visual regression testing capabilities
- Gamepad and keyboard input simulation

**Test Coverage Areas:**
- Menu navigation and transitions
- Game initialization and state management
- Score submission and leaderboard display
- Pause/resume functionality
- Game over flow and restart

**Running Tests:**
```bash
npx playwright test           # Run all tests
npx playwright test --ui      # Interactive mode
npx playwright test --debug   # Debug mode
npx playwright codegen        # Generate test code
```

### Game Design Context
Based on comprehensive PRD in `Documents/neural_escape_prd.md` - a 30-minute cyberpunk survival experience with:
- Escalating difficulty from tutorial to brutal finale
- Multiple enemy types with unique behaviors
- Weapon upgrade system
- Speedrun-optimized gameplay
- Professional visual effects with Three.js shaders
- Retro arcade presentation with modern web technologies

When implementing new features, refer to the PRD for detailed specifications on enemy behaviors, weapon systems, and visual effects requirements.