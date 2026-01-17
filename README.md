# 🎮 Neural Break

A cyberpunk survival shooter built with Three.js and TypeScript. Battle through 30 minutes of escalating intensity in a neural network environment.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/neural-break)

---

## 🚀 Quick Start

```bash
# Clone and install
git clone <repository-url>
cd neural-break
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
npm install -g vercel
vercel
```

**First time deploying?** See [📖 Deployment Guide](#-deployment)

---

## ✨ Features

### 🎮 Game Modes
- **Original Mode**: Classic 30-minute survival arcade
- **Rogue Mode**: Procedural progression with special abilities

### 🏆 Global Leaderboards
- Separate top 10 for each game mode
- Online persistence (Vercel deployment)
- Real-time competition

### 🎯 Combat & Progression
- 8 unique enemy types (DataMite, ScanDrone, ChaosWorm, VoidSphere, Crystal Swarm, Fizzer, UFO, Boss)
- Weapon upgrades and power-ups
- Arcade-style multiplier system
- Objective-based level progression

### 🕹️ Full Controller Support
- Xbox and PlayStation controllers
- Haptic feedback
- Menu navigation with gamepad
- Smooth analog movement

---

## 🎯 Controls

### Keyboard
| Action | Keys |
|--------|------|
| Move | `WASD` or Arrow Keys |
| Fire | `Space` |
| Dash | `Shift` |
| Pause | `Escape` |

### Gamepad (Xbox/PlayStation)
| Action | Button |
|--------|--------|
| Move | Left Stick / D-Pad |
| Fire | `A` / `X` or Triggers |
| Dash | `B` / `Circle` or RB |
| Pause | `Start` |

**All menus** support keyboard, mouse, and gamepad navigation!

---

## 📁 Project Structure

```
src/
├── config/              # ⭐ All gameplay values in balance.config.ts
├── core/                # Game systems (Game, Managers, State)
├── entities/            # Player, enemies, pickups
├── weapons/             # Combat system
├── graphics/            # Rendering, effects, particles
├── ui/                  # Screens and HUD
├── audio/               # Sound system
├── data/                # High score persistence
└── utils/               # Helper utilities

api/                     # Serverless functions (Vercel)
└── highscores.ts        # Global leaderboard API
```

---

## 🔧 Development

### Game Balance

**All gameplay values in one file**: `src/config/balance.config.ts`

```typescript
// Easy to tune - just edit and save!
PLAYER: {
  BASE_HEALTH: 100,
  BASE_SPEED: 6.25,
  DASH_COOLDOWN: 3.0,
}

WEAPONS: {
  BASE_DAMAGE: 10,
  BASE_FIRE_RATE: 0.15,
}
```

**See**: [`BALANCE_TUNING_GUIDE.md`](BALANCE_TUNING_GUIDE.md)

### Adding Game Modes

Want to add a new mode? See [`HOW_TO_ADD_NEW_GAME_MODES.md`](HOW_TO_ADD_NEW_GAME_MODES.md)

### Code Architecture

- **Modular Systems**: Each system has single responsibility
- **TypeScript**: Full type safety
- **Spatial Grid**: Optimized O(neighbors) collision detection
- **Entity Pooling**: Efficient memory management
- **Centralized Config**: Easy balance tuning

---

## 🌐 Deployment

### Quick Deploy to Vercel

```bash
# 1. Install dependencies
npm install

# 2. Deploy
vercel

# 3. Set environment variable
# In Vercel Dashboard: Settings → Environment Variables
# Add: VITE_USE_API_HIGHSCORES = true

# 4. Go to production
vercel --prod
```

### Features After Deployment

✅ **Global Leaderboards**: All players see same scores  
✅ **Automatic Fallback**: Uses localStorage if API fails  
✅ **Mode Separation**: Original and Rogue have own top 10  
✅ **Free Hosting**: Vercel free tier is perfect for indie games  

### Storage Options

**Current**: In-memory (resets on deployment) - great for testing  
**Upgrade**: Vercel KV (permanent storage) - see deployment guide

**See**: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for complete guide

---

## 📚 Documentation

### 🚀 Start Here
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Setup guide for new developers
- **[README.md](README.md)** - This file - project overview

### 🎮 For Players
- [`docs/CONTROLS.md`](docs/CONTROLS.md) - Complete controls reference
- [`docs/HIGH_SCORES.md`](docs/HIGH_SCORES.md) - Leaderboard system guide

### 💻 For Developers
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) - Deploy to Vercel with online scores
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - System architecture and patterns
- [`BALANCE_TUNING_GUIDE.md`](BALANCE_TUNING_GUIDE.md) - Edit gameplay values
- [`BALANCE_QUICK_REFERENCE.md`](BALANCE_QUICK_REFERENCE.md) - Quick balance reference
- [`HOW_TO_ADD_NEW_GAME_MODES.md`](HOW_TO_ADD_NEW_GAME_MODES.md) - Extend the game
- [`LEVEL_SYSTEM.md`](LEVEL_SYSTEM.md) - Level progression details

### 📝 Reference
- [`CHANGELOG.md`](CHANGELOG.md) - Version history
- [`CLAUDE.md`](CLAUDE.md) - AI assistant collaboration notes
- `src/config/balance.config.ts` - Master config file (commented)

---

## 🛠️ Technologies

| Tech | Purpose |
|------|---------|
| **Three.js** | WebGL rendering |
| **TypeScript** | Type-safe development |
| **Vite** | Fast dev server & builds |
| **Vercel** | Serverless deployment |
| **TWEEN.js** | Smooth animations |
| **Web Audio API** | Sound system |

---

## 🎨 Recent Updates

### January 2026 - Online Leaderboards 🌐
- ✅ Global high scores via Vercel API
- ✅ Separate leaderboards per game mode
- ✅ Automatic environment detection
- ✅ Smart localStorage fallback

### January 2026 - Code Cleanup 🧹
- ✅ Removed ~700 lines of legacy code
- ✅ Consolidated particle pools
- ✅ Extracted modular systems
- ✅ Optimized collision detection

**Full changelog**: See [`CHANGELOG.md`](CHANGELOG.md)

---

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

ISC License - see LICENSE file

---

## 🆘 Support

**Issues?** Check the docs first:
- Build problems → [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- Balance questions → [`BALANCE_TUNING_GUIDE.md`](BALANCE_TUNING_GUIDE.md)
- Architecture questions → [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

**Still stuck?** Open an issue with:
- What you tried
- Error messages
- Environment (Node version, OS)

---

## 🎯 Development Roadmap

- [ ] Progressive Web App support
- [ ] More Rogue mode abilities
- [ ] Social features (share scores)
- [ ] Achievements system
- [ ] Mobile controls

---

**Made with ❤️ using Three.js and TypeScript**
