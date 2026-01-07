# 🏆 High Score System - Complete Guide

## System Status: ✅ FULLY FUNCTIONAL

The high score system is **fully implemented and working**. Here's everything you need to know:

## How It Works

### 1. When You Die
1. ✅ Game calculates your final score
2. ✅ Checks if it's a high score (top 10)
3. ✅ If yes, shows **"★ NEW HIGH SCORE! ★"** banner
4. ✅ Prompts you to enter your name
5. ✅ Shows save button

### 2. Entering Your Name
- **Input Field**: Accepts up to 10 characters
- **Auto-fill**: Remembers your last name for convenience
- **Validation**: Name is trimmed and sanitized
- **Default**: If you leave it blank, saves as "ANON"

### 3. Saving Your Score
Click the **"SAVE"** button:
- ✅ Saves to browser localStorage
- ✅ Shows "★ [NAME] SAVED ★" confirmation
- ✅ Updates high scores table immediately
- ✅ Remembers your name for next time

### 4. Viewing High Scores
Two ways to view:

**A) From Game Over Screen:**
- Automatically displays after saving
- Shows top 10 scores

**B) From Main Menu:**
- Click **"HIGH SCORES"** button
- Full leaderboard view
- Shows all columns: RANK, NAME, LVL, SCORE, TIME, LOC, DATE

## High Score Table Features

### Columns Display:
| Column | Description |
|--------|-------------|
| **RANK** | 1ST, 2ND, 3RD, 4-10 |
| **NAME** | Player name (up to 10 chars) |
| **LVL** | Level reached |
| **SCORE** | Final score (formatted with commas) |
| **TIME** | Survival time (MM:SS) |
| **LOC** | Location (country code or LOCAL) |
| **DATE** | Date achieved (MM/DD/YY) |

### Special Styling:
- 🥇 **1st Place**: Gold color, gold border
- 🥈 **2nd Place**: Silver color, silver border
- 🥉 **3rd Place**: Bronze color, bronze border
- **Others**: Gray with cyan accents

## Technical Implementation

### Storage Location
```javascript
localStorage.setItem('neural_break_high_scores', JSON.stringify(scores))
localStorage.setItem('neural_break_last_player_name', 'YOUR_NAME')
```

### Data Structure
```typescript
interface HighScoreEntry {
  name: string           // Player name (max 20 chars, trimmed)
  score: number          // Final score
  survivedTime: number   // Seconds survived
  level: number          // Level reached
  date: string           // MM/DD/YY format
  location: string       // Country code or 'LOCAL'
}
```

### Validation Rules
✅ **Name**: 
- Required (defaults to "ANON")
- 1-20 characters
- Trimmed whitespace
- Uppercase for display

✅ **Score**:
- Must be positive number
- Integer only
- Cannot be Infinity/NaN

✅ **Level**:
- Must be >= 1
- Integer only

✅ **Time**:
- Must be positive number
- In seconds

✅ **Date**:
- Defaults to current date
- MM/DD/YY format

✅ **Location**:
- Defaults to 'LOCAL'
- Retrieved via IP geolocation (optional)

### Sorting Logic
1. **Primary**: Score (highest first)
2. **Tie-breaker**: Date (newest first)

### Maximum Scores
- Stores **top 10** scores only
- Older/lower scores automatically removed

## Files Involved

### Core Service:
```
/src/data/HighScoreService.ts
```
- `LocalStorageHighScoreService` - Current implementation
- `APIHighScoreService` - Future backend support
- `HighScoreServiceFactory` - Service selector

### UI Screens:
```
/src/ui/screens/GameOverScreen.ts
/src/ui/screens/LeaderboardScreen.ts
```

### State Management:
```
/src/core/GameState.ts
```
- `ScoreManager` - Central score management
- `HighScoreEntry` - Type definition

## How to Test

### Method 1: Play the Game
1. Open http://localhost:3000/
2. Start a new game
3. Play and get a score
4. Die (let enemies hit you)
5. Enter your name when prompted
6. Click "SAVE"
7. Check leaderboard from main menu

### Method 2: Manual Testing
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Check `neural_break_high_scores` key
4. Manually add/edit scores

### Method 3: Use Test Page
Open `test_highscore.html` in browser:
- Click "Test Save Score" to add a test entry
- Click "Test Load Scores" to view current scores
- Click "Clear All Scores" to reset

## localStorage Commands

### View Scores (Browser Console):
```javascript
JSON.parse(localStorage.getItem('neural_break_high_scores') || '[]')
```

### Add Test Score:
```javascript
const testScore = {
  name: 'TEST',
  score: 50000,
  survivedTime: 300,
  level: 10,
  date: '1/5/26',
  location: 'LOCAL'
};

const scores = JSON.parse(localStorage.getItem('neural_break_high_scores') || '[]');
scores.push(testScore);
scores.sort((a, b) => b.score - a.score);
localStorage.setItem('neural_break_high_scores', JSON.stringify(scores.slice(0, 10)));
```

### Clear All Scores:
```javascript
localStorage.removeItem('neural_break_high_scores');
localStorage.removeItem('neural_break_last_player_name');
```

## Common Issues & Solutions

### Issue: Scores Not Saving
**Solution:**
1. Check if localStorage is enabled in browser
2. Check browser console for errors
3. Try incognito/private mode
4. Clear site data and try again

### Issue: Score Not Appearing
**Reason:** Your score might not be in the top 10

**Check:**
```javascript
// See all current scores
console.log(JSON.parse(localStorage.getItem('neural_break_high_scores')))
```

### Issue: Input Field Not Appearing
**Reason:** Score is not high enough for top 10

**Test:** Clear scores and try again:
```javascript
localStorage.removeItem('neural_break_high_scores')
```

### Issue: Name Not Saving
**Check:** Name is properly saved in localStorage:
```javascript
localStorage.getItem('neural_break_last_player_name')
```

## Future Enhancements

### Currently Planned:
- 🔮 Backend API integration (APIHighScoreService ready)
- 🔮 Global leaderboards
- 🔮 Social sharing
- 🔮 Score verification/anti-cheat
- 🔮 Multiple leaderboard categories

### To Enable API Backend:
Set environment variable:
```bash
VITE_USE_API_HIGHSCORES=true
VITE_API_URL=https://your-api.com/highscores
```

## Security Notes

⚠️ **Current Implementation (localStorage):**
- Stored locally in browser
- Can be edited via DevTools
- No server verification
- Domain-specific
- Lost if browser data cleared

✅ **For Production:**
- Implement backend API
- Add score verification
- Rate limiting
- CAPTCHA for submissions
- Server-side validation

## Score Calculation

Final score is calculated from:
```typescript
{
  kills: number          // Enemies killed
  pickupsCollected: number
  maxMultiplier: number  // Highest multiplier reached
  survivedTime: number   // Seconds survived
  level: number          // Level reached
  perfectKills: number   // Bonus kills
  score: number          // Running total
}
```

## Feature Checklist

✅ **Working Features:**
- [x] Save high scores to localStorage
- [x] Load and display top 10 scores
- [x] Name input with validation
- [x] Auto-fill last used name
- [x] Sort by score (with date tie-breaker)
- [x] Display rank (1ST, 2ND, 3RD)
- [x] Styled leaderboard (gold/silver/bronze)
- [x] "NEW HIGH SCORE!" banner
- [x] Save confirmation message
- [x] View from game over screen
- [x] View from main menu
- [x] Location detection (IP-based)
- [x] Date formatting
- [x] Time formatting (MM:SS)
- [x] Score formatting (commas)
- [x] Responsive design
- [x] Arcade/Cyberpunk aesthetic

🔮 **Future Features:**
- [ ] Backend API integration
- [ ] Global leaderboards
- [ ] Player avatars
- [ ] Achievement badges
- [ ] Score replay system

---
**Status:** ✅ FULLY FUNCTIONAL  
**Storage:** localStorage (browser-based)  
**Capacity:** Top 10 scores  
**Tested:** January 5, 2026  
**Ready for:** Production use (local storage)

