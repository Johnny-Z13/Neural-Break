# High Score System Setup Guide

## Current Implementation

The high score system uses a **service abstraction layer** that supports both:
1. **LocalStorage** (current - for development/local play)
2. **API Backend** (ready for production deployment)

## Current Status: LocalStorage Mode

By default, the game uses `LocalStorageHighScoreService` which:
- ✅ Works immediately (no setup needed)
- ✅ Persists scores in browser localStorage
- ⚠️ **Limitations:**
  - Domain-specific (scores don't persist across different hosts)
  - Can be manipulated by users (not secure)
  - Limited to ~5-10MB storage
  - No sync across devices

## Switching to API Mode

When you're ready to deploy with a backend:

### 1. Set Environment Variable

Create a `.env` file in the project root:

```env
VITE_USE_API_HIGHSCORES=true
VITE_API_URL=https://your-api-domain.com/api
```

### 2. Backend API Requirements

Your backend needs to implement these endpoints:

#### GET `/api/highscores`
Returns array of high score entries:
```json
[
  {
    "name": "Player1",
    "score": 12345,
    "survivedTime": 180,
    "level": 5,
    "date": "12/25/2024"
  }
]
```

#### POST `/api/highscores`
Accepts high score entry:
```json
{
  "name": "Player1",
  "score": 12345,
  "survivedTime": 180,
  "level": 5,
  "date": "12/25/2024"
}
```

Returns:
```json
{
  "success": true
}
```

### 3. Security Recommendations

For a secure production system, consider:

1. **Input Validation**
   - Validate score values (prevent impossible scores)
   - Sanitize player names (XSS prevention)
   - Rate limiting (prevent spam)

2. **Score Verification**
   - Validate score calculation server-side
   - Check for suspicious patterns (too high, too fast)
   - Implement anti-cheat measures

3. **Authentication** (Optional)
   - User accounts for persistent leaderboards
   - Session tokens
   - OAuth integration

4. **Database**
   - Use a proper database (PostgreSQL, MongoDB, etc.)
   - Index on score for fast queries
   - Implement pagination for large leaderboards

### 4. Example Backend Implementation

#### Node.js/Express Example:

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// In-memory storage (use database in production)
let highScores = [];

// GET high scores
app.get('/api/highscores', (req, res) => {
  const sorted = highScores.sort((a, b) => b.score - a.score);
  res.json(sorted.slice(0, 10)); // Top 10
});

// POST new high score
app.post('/api/highscores', (req, res) => {
  const entry = req.body;
  
  // Validate entry
  if (!entry.name || typeof entry.score !== 'number' || entry.score < 0) {
    return res.status(400).json({ success: false, error: 'Invalid entry' });
  }
  
  // Add to leaderboard
  highScores.push(entry);
  highScores.sort((a, b) => b.score - a.score);
  highScores = highScores.slice(0, 10); // Keep top 10
  
  res.json({ success: true });
});

app.listen(3000);
```

## Testing

### Test LocalStorage Mode
```typescript
// In browser console
import { ScoreManager } from './src/core/GameState'
await ScoreManager.addTestScore()
```

### Test API Mode
1. Set `VITE_USE_API_HIGHSCORES=true`
2. Start your backend server
3. Play game and check network tab for API calls

## Migration from LocalStorage to API

When switching from localStorage to API:
1. Users' local scores will remain in localStorage
2. New scores will go to API
3. Consider implementing a migration script to upload local scores to API

## File Structure

```
src/data/
  ├── HighScoreService.ts    # Service abstraction & implementations
  └── HIGH_SCORE_SETUP.md    # This file

src/core/
  └── GameState.ts           # ScoreManager (uses HighScoreService)
```

## Troubleshooting

### Scores not saving
- Check browser console for errors
- Verify localStorage is available (not in private/incognito mode)
- Check API endpoint is accessible (if using API mode)

### Scores not displaying
- Check `displayHighScores` is being called
- Verify container element exists in DOM
- Check for JavaScript errors in console

### API errors
- Verify CORS is configured on backend
- Check API endpoint URL is correct
- Verify request/response format matches expected structure

