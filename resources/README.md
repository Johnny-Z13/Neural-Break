# Resources

This directory contains assets and data files that are not currently used in the game but may be useful for future features.

## Unused Files

### unused/Quotes.json
**Source:** "All the ways I tell myself I love you" by Henny Flynn
**Content:** 28 self-love affirmations
**Status:** Not currently implemented in game

**Potential Uses:**
- Loading screen quotes
- Pause menu inspirational messages
- Game over screen positive affirmations
- Random tooltip system
- Easter egg content

**How to Implement:**
```typescript
import quotes from '../resources/unused/Quotes.json'

// Get random quote
const randomQuote = quotes.items[Math.floor(Math.random() * quotes.items.length)]
console.log(randomQuote.text)
```

**Decision Required:**
- Implement as a feature (loading screens, menus, etc.)
- Delete if not needed
- Keep archived for future consideration

---

## Why This Directory Exists

During codebase cleanup, we found files that:
1. Aren't referenced in the code
2. Might have future value
3. Shouldn't clutter the root directory

Rather than delete potentially useful content, we archive it here with documentation.
