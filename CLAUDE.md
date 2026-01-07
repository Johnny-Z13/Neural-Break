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
│   └── SceneManager.ts    # Three.js scene management
├── ui/                     # User interface
│   ├── UIManager.ts       # HUD management
│   └── GameScreens.ts     # Menu screens
└── audio/                  # Audio system
    └── AudioManager.ts    # Sound management
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

### Game Design Context
Based on comprehensive PRD in `Documents/neural_escape_prd.md` - a 30-minute cyberpunk survival experience with:
- Escalating difficulty from tutorial to brutal finale
- Multiple enemy types with unique behaviors
- Weapon upgrade system
- Speedrun-optimized gameplay
- Professional visual effects with Three.js shaders

When implementing new features, refer to the PRD for detailed specifications on enemy behaviors, weapon systems, and visual effects requirements.