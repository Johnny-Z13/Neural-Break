# Tests

This directory contains test files and utilities for Neural Break.

## Manual Tests

### test_highscore.html
Simple HTML page for manually testing the localStorage high score system.

**How to use:**
1. Open `test_highscore.html` in a browser
2. Use buttons to test save/load/clear operations
3. Verify scores are persisted correctly

## Future Test Setup

Consider adding automated tests with:
- **Vitest** - Unit tests for game logic
- **Playwright** - E2E tests for gameplay
- **Testing Library** - UI component tests

### Recommended Test Coverage
- Collision detection (spatial grid)
- Scoring system (combos, multipliers)
- Enemy spawning logic
- Weapon upgrades
- Level progression
- High score persistence
