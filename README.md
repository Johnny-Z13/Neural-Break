# Neural Break

A cyberpunk survival game built with Three.js and TypeScript. Experience 30 minutes of escalating intensity as you battle through waves of digital entities in a neural network environment.

## 🎮 Game Overview

Neural Break is a top-down survival shooter where players must survive for 30 minutes against increasingly difficult waves of enemies. The game features:

- **Cyberpunk Aesthetic**: Immersive digital environment with neural network themes
- **Progressive Difficulty**: Escalating challenge from tutorial to brutal finale
- **Combat System**: Projectile-based weapons with upgrade mechanics
- **Multiple Enemy Types**: DataMites, ScanDrones, ChaosWorms, VoidSpheres, CrystalShardSwarms, Fizzers, UFOs, and Bosses
- **XP Progression**: Level up and improve your neural coherence
- **Speedrun Optimization**: Designed for competitive play and replayability
- **🎮 Full Gamepad Support**: Native Xbox/PlayStation controller support with haptic feedback!

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
git clone <repository-url>
cd neural-break
npm install
```

### Development
```bash
npm run dev
```
Opens the game at `http://localhost:3000` with hot reload enabled.

### Build
```bash
npm run build
```
Creates optimized production build with Three.js chunking.

### Preview
```bash
npm run preview
```
Preview the production build locally.

## 🎯 Controls

### Keyboard
- **WASD / Arrow Keys**: Movement
- **Space**: Fire weapon
- **Shift**: Dash (when available)

### Gamepad (Xbox/PlayStation)
- **Left Stick**: Analog movement
- **D-Pad**: Digital movement
- **A (Xbox) / X (PlayStation)**: Fire weapon
- **B (Xbox) / Circle (PlayStation)**: Dash
- **Right Trigger / Left Trigger**: Fire weapon (alternative)
- **Right Bumper**: Dash (alternative)
- **Vibration**: Haptic feedback for hits, kills, and explosions

## 🏗️ Architecture

### Core Systems

| System | Description |
|--------|-------------|
| **Game** | Central coordinator managing all systems and game state |
| **SceneManager** | Three.js scene, camera, and rendering pipeline |
| **Player** | Player entity with movement, health, and progression |
| **EnemyManager** | Spawning, updating, and managing all enemy entities |
| **LevelManager** | Progressive difficulty scaling and wave management |
| **WeaponSystem** | Projectile-based combat system with upgrades |
| **InputManager** | Keyboard input handling |
| **UIManager** | HUD elements and game interface |
| **AudioManager** | Sound effects and audio feedback |
| **AudioVisualReactiveSystem** | Dynamic visual effects synchronized with audio |
| **EffectsSystem** | Visual effects and particle systems |
| **GameTimer** | 30-minute countdown timer |
| **ScoreManager** | High score tracking and leaderboard management |

### Project Structure

```
src/
├── main.ts                 # Entry point and game initialization
├── config/                 # Configuration modules
│   ├── index.ts           # Centralized config exports
│   ├── balance.config.ts  # ⭐ MASTER BALANCE CONFIG - All gameplay values
│   ├── game.config.ts     # Game-specific configuration
│   ├── enemy.config.ts    # Enemy configuration
│   └── visual.config.ts   # Visual effects configuration
├── core/                   # Core game systems
│   ├── Game.ts            # Main game coordinator
│   ├── GameState.ts       # State management and scoring
│   ├── GameTimer.ts       # Timer system
│   ├── LevelManager.ts    # Difficulty progression
│   ├── InputManager.ts    # Input handling
│   ├── EnemyManager.ts    # Enemy spawning/management
│   ├── PickupManager.ts   # Base class for pickup management
│   ├── PowerUpManager.ts  # Power-up spawning and collection
│   ├── MedPackManager.ts  # Health pack management
│   └── SpeedUpManager.ts  # Speed boost management
├── entities/               # Game entities
│   ├── Player.ts          # Player entity
│   ├── Enemy.ts           # Base enemy class
│   ├── DataMite.ts        # Basic fast enemy
│   ├── ScanDrone.ts       # Surveillance enemy
│   ├── ChaosWorm.ts       # Unpredictable enemy
│   ├── VoidSphere.ts      # Area denial enemy
│   ├── CrystalShardSwarm.ts # Multi-unit enemy
│   ├── Fizzer.ts          # Chaos reward enemy (high multiplier spawn)
│   ├── UFO.ts             # Late-game intelligent craft with laser
│   ├── Boss.ts            # Boss enemy
│   ├── PowerUp.ts         # Power-up pickup
│   ├── MedPack.ts         # Health pickup
│   ├── SpeedUp.ts         # Speed boost pickup
│   └── index.ts           # Entity exports
├── weapons/                # Combat system
│   ├── WeaponSystem.ts    # Weapon management
│   ├── Projectile.ts      # Player projectiles
│   └── EnemyProjectile.ts # Enemy projectiles
├── graphics/               # Rendering and visual effects
│   ├── SceneManager.ts    # Three.js scene management
│   ├── EffectsSystem.ts   # Main effects coordinator
│   ├── AudioVisualReactiveSystem.ts # Audio-reactive visuals
│   └── effects/           # Modular effect systems
│       ├── ParticlePool.ts      # Base particle system
│       ├── ExplosionEffects.ts  # Explosion and impact effects
│       ├── ScreenEffects.ts     # Screen-wide visual effects
│       └── VectorParticles.ts   # Vector-style particles
├── ui/                     # User interface
│   ├── UIManager.ts       # HUD management
│   ├── GameScreens.ts     # Screen coordinator
│   └── screens/           # Individual screen components
│       ├── StartScreen.ts        # Main menu screen
│       ├── LeaderboardScreen.ts  # High score leaderboard
│       ├── GameOverScreen.ts     # Game over screen
│       └── ScreenTransitions.ts  # Transition animations
├── audio/                  # Audio system
│   └── AudioManager.ts    # Sound management
└── data/                   # Data services
    ├── HighScoreService.ts # High score persistence
    └── HIGH_SCORE_SETUP.md # High score setup guide
```

## 🎨 Technical Features

- **Three.js Integration**: Modern WebGL rendering with orthographic camera
- **TypeScript**: Full type safety and modern JavaScript features
- **Entity Component System (ECS)**: Efficient entity management with proper cleanup
- **Collision Detection**: Optimized spatial checking for arena gameplay
- **Performance Optimized**: Entity pooling, particle pooling, and efficient resource management
- **Modular Design**: Clean separation of concerns with system-based architecture
- **Visual Effects**: Comprehensive particle systems, screen effects, and audio-reactive visuals
- **Screen Management**: Modular UI screens with smooth transitions
- **Configuration Management**: Centralized config system for easy tuning
- **High Score System**: LocalStorage and API-based high score tracking
- **TWEEN.js**: Smooth animations and transitions

## 🔧 Development

### Game States
- **START_SCREEN**: Initial menu
- **PLAYING**: Active gameplay
- **GAME_OVER**: End screen with statistics

### Enemy Types
- **DataMite**: Fast, basic enemies with simple movement
- **ScanDrone**: Surveillance units with detection abilities and radar sweep (shoots bullets)
- **ChaosWorm**: Unpredictable movement patterns with segmented body and multi-stage death
- **VoidSphere**: Area denial enemies with void effects and burst-fire projectiles
- **CrystalShardSwarm**: Multi-unit coordinated attacks with crystal formations
- **Fizzer**: ⚡ Tiny electric chaos orb that spawns when player achieves high multiplier (x5/x8/x11) without taking damage - fast, erratic, hard to hit, fires rapid bullet bursts
- **UFO**: 🛸 Intelligent alien craft appearing in late game (level 5+) - organic curved movement patterns, charges and fires laser beams (10% damage - reduced for testing)
- **Boss**: Powerful end-level enemies with unique attack patterns

### Key Design Patterns
- **Entity Management**: All entities follow initialize/update/cleanup pattern
- **Inheritance**: Base classes for common functionality (Enemy, PickupManager)
- **System Communication**: Decoupled systems communicate through the main Game class
- **Resource Cleanup**: Proper disposal prevents memory leaks during restarts
- **Modularization**: Large systems split into focused modules (EffectsSystem, GameScreens)
- **Configuration**: Centralized config with DEBUG_MODE flag for development
- **Component-Based UI**: Screen components with shared transition utilities

## 📋 Game Design

Neural Break is based on a comprehensive Product Requirements Document focusing on:
- Tutorial progression to brutal endgame
- Balanced weapon upgrade systems
- Professional visual effects with Three.js shaders
- Speedrun-optimized gameplay mechanics

## 🛠️ Technologies

- **Three.js**: 3D graphics and WebGL rendering
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and dev server
- **Web Audio API**: Immersive sound design
- **TWEEN.js**: Animation library for smooth transitions
- **LocalStorage API**: Client-side high score persistence

## 📄 License

ISC License

## 🚧 Development Status

Active development - see commit history for latest updates and features.

### Recent Improvements
- ✅ **🐛 FIXED: UFO Spawns Use LevelManager!** - Removed hardcoded spawn rates, configs now work as expected!
- ✅ **🐛 FIXED: Power-Ups Now Spawn!** - Critical bug fix: spawn logic was broken, now working perfectly!
- ✅ **🎁 Generous Power-Up Spawns** - 2x more pickups, regular intervals, fully configurable in balance.config!
- ✅ **🧹 Clean Level Transitions** - Zero enemies persist, invulnerable cleared, power-ups carry over correctly!
- ✅ **🎯 Enemy Hit Feedback** - ALL enemies flash RED + satisfying "ping" sound when hit (but not killed)!
- ✅ **🎆 Level Transition Fireworks** - Staggered enemy deaths (0.1s) create spectacular cascading explosions!
- ✅ **🏆 Consistent Notifications** - "LEVEL COMPLETE" matches INVULNERABLE style, perfectly centered
- ✅ **💥 Enhanced Death Sequences** - ALL enemies trigger death animations during transitions
- ✅ **Objective-Based Level System** - Clear goals, dramatic transitions, satisfying progression
- ✅ **Full Gamepad Support** - Xbox/PlayStation controllers with vibration feedback
- ✅ **Centralized Balance System** - All gameplay values in one config file
- ✅ Modularized UI screens (StartScreen, LeaderboardScreen, GameOverScreen)
- ✅ Refactored EffectsSystem into focused modules
- ✅ Split enemy classes into individual files
- ✅ Created PickupManager base class for shared pickup logic
- ✅ Centralized configuration system
- ✅ Enhanced visual effects with audio-reactive systems
- ✅ Improved code organization and maintainability
- ✅ Added Fizzer enemy - chaos reward for skilled players with high multiplier streaks
- ✅ Added UFO enemy - late-game intelligent craft with devastating laser beam attack
- ✅ Updated threat database on title screen with new enemies
- ✅ Integrated UFO laser collision detection in game loop

## 📝 Code Organization

The codebase follows best practices for maintainability:
- **Separation of Concerns**: Each system has a single responsibility
- **Modular Architecture**: Large files split into focused modules
- **Type Safety**: Full TypeScript coverage with proper interfaces
- **Configuration Management**: Centralized config for easy tuning
- **Debug Mode**: Conditional logging and debug features via DEBUG_MODE flag

---

## ⚖️ Game Balance & Tuning

**All gameplay values are now in ONE file**: `src/config/balance.config.ts`

### Quick Balance Editing

1. Open `src/config/balance.config.ts`
2. Find the section (Player, Enemies, Weapons, Pickups, etc.)
3. Edit values
4. Save - game auto-reloads!

**No more hunting for magic numbers!**

### What You Can Tune

- **Player**: Speed, health, dash, power-ups, shields
- **Weapons**: Damage, fire rate, heat system, projectile speed
- **Enemies**: Health, speed, damage, fire rates, death effects (ALL 8 enemy types)
  - DataMite, ScanDrone, Fizzer, UFO, ChaosWorm, VoidSphere, CrystalSwarm, Boss
- **Pickups**: Spawn rates, heal amounts, magnetism
- **Scoring**: Points, multipliers, bonuses
- **Level Scaling**: Difficulty progression, enemy scaling
- **World**: Size, boundaries, spawn zones
- **Visual Effects**: Screen shake, zoom, particles

### Balance System Architecture

```
┌─────────────────────────────────────────────┐
│   balance.config.ts (Master Config)         │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │ PLAYER • WEAPONS • PICKUPS         │    │
│  │ 8 ENEMY TYPES • SCORING • LEVELS   │    │
│  │ WORLD • FEEDBACK                   │    │
│  └────────────────────────────────────┘    │
└─────────────────┬───────────────────────────┘
                  │ Imported by
         ┌────────┴────────┬────────────┬─────────┐
         │                 │            │         │
    ┌────▼────┐    ┌──────▼─────┐ ┌────▼────┐ ┌─▼──────┐
    │ Player  │    │  Enemies   │ │ Weapons │ │Pickups │
    │  .ts    │    │  (8 types) │ │  .ts    │ │  .ts   │
    └─────────┘    └────────────┘ └─────────┘ └────────┘
         │                 │            │         │
         └─────────────────┴────────────┴─────────┘
                           │
                    ┌──────▼───────┐
                    │   Game Loop  │
                    └──────────────┘
```

**One file controls everything!**

### Documentation

- **`BALANCE_TUNING_GUIDE.md`** - Complete guide to tuning the game
- **`src/config/balance.config.ts`** - Master config file with comments

### Example: Make Game Easier

```typescript
// In balance.config.ts
PLAYER: {
  BASE_HEALTH: 150,        // Was 100
  BASE_SPEED: 7.5,         // Was 6.25
  DASH_COOLDOWN: 2.0,      // Was 3.0
}

WEAPONS: {
  BASE_DAMAGE: 15,         // Was 10
  BASE_FIRE_RATE: 0.1,     // Was 0.15 (faster firing)
}
```

Save and the game instantly updates!
