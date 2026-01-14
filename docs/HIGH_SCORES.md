# 🏆 High Score System

Complete guide to leaderboards in Neural Break.

---

## Overview

Neural Break features **two separate global leaderboards**:
- **Original Mode** - Classic arcade survival
- **Rogue Mode** - Roguelike progression

Each mode maintains its own **Top 10** high scores.

---

## How It Works

### Scoring a High Score

1. **Play the game** in Original or Rogue mode
2. **Game Over** screen appears
3. If your score is in top 10, you see: **"★ NEW HIGH SCORE! ★"**
4. **Enter your name** (3 letters, arcade style)
5. **Save** - Score is added to leaderboard
6. See your rank!

### Name Entry

**Arcade-Style Input:**
- Each letter shown with up/down to change
- Navigate left/right between letters
- Classic 3-letter format (e.g., ACE, MAX, JON)

**Controls:**
- **Keyboard**: `↑`/`↓` change letter, `→` next letter, `Enter` submit
- **Gamepad**: D-Pad change letter, `→` next, `A` submit

**Features:**
- ✅ Remembers your last name
- ✅ Auto-filled for convenience
- ✅ A-Z and 0-9 supported
- ✅ Same style for both modes

---

## Viewing Leaderboards

### From Main Menu

1. Click **"HIGH SCORES"**
2. Default view: **Original Mode** leaderboard
3. Click **"SWITCH TO ROGUE MODE"** to toggle
4. See full top 10 with stats

### From Game Over Screen

- Top 5 for **current mode only**
- Automatically shown after game
- Updates after saving score

---

## Leaderboard Details

### Information Shown

| Column | Description |
|--------|-------------|
| **RANK** | Position (1ST, 2ND, 3RD, 4-10) |
| **NAME** | Player name (3 letters) |
| **LVL** | Level reached |
| **SCORE** | Final score |
| **TIME** | Survival time (HH:MM:SS) |
| **LOC** | Location (ONLINE, city name) |
| **DATE** | Date achieved |

### Rank Colors

- **1st Place** - 🥇 Gold
- **2nd Place** - 🥈 Silver
- **3rd Place** - 🥉 Bronze
- **4-10** - Gray

---

## Mode Toggle

### How to Switch Modes

**On Leaderboard Screen:**

**Mouse:**
- Click "SWITCH TO ROGUE MODE" / "SWITCH TO ARCADE MODE"

**Keyboard:**
- `Tab` - Toggle modes
- `←` / `→` arrows - Toggle
- `A` / `D` keys - Toggle

**Gamepad:**
- `LB` / `RB` (Shoulder buttons)
- D-Pad `←` / `→`

**Visual Feedback:**
- Title changes: "ARCADE HIGH SCORES" ↔ "ROGUE HIGH SCORES"
- Colors change: Yellow theme ↔ Magenta theme
- Button text updates

---

## Online vs Local Scores

### Local Development

**Storage:** Browser localStorage  
**Visibility:** Only you (per browser/device)  
**Persistence:** Until browser data cleared  
**Best for:** Testing, offline play  

### Vercel Deployment

**Storage:** Global API endpoint  
**Visibility:** All players worldwide 🌐  
**Persistence:** In-memory (resets on deploy) or KV (permanent)  
**Best for:** Competition, leaderboards  

**The game automatically detects the environment!**

---

## Qualifying for Leaderboard

### Requirements

✅ Complete a full game (no quitting early)  
✅ Score higher than 10th place (if board is full)  
✅ Enter a valid name  

### What Counts

✅ All enemy kills  
✅ Multiplier bonuses  
✅ Combo bonuses  
✅ Survival time bonuses  
✅ Level completion bonuses  

### What Doesn't Count

❌ Test mode scores (not shown)  
❌ Paused time  
❌ Cheated scores (validation in place)  

---

## Score Calculation

### Base Score

- **Enemy Kills**: Points per enemy type
  - DataMite: 100 pts
  - ScanDrone: 200 pts
  - ChaosWorm: 300 pts
  - VoidSphere: 250 pts
  - Crystal Swarm: 150 pts each
  - Fizzer: 500 pts (bonus enemy!)
  - UFO: 400 pts
  - Boss: 1000 pts

### Multiplier System

**Builds with consecutive kills:**
- No hits taken → Multiplier increases
- Hit taken → Multiplier resets to 1x

**Maximum:** 10x multiplier

**Score Calculation:**
```
Kill Score = Base Points × Current Multiplier
```

### Combo Bonuses

**Quick consecutive kills:**
- 3+ kills within 1 second = Combo!
- Each combo kill adds bonus
- Higher combos = bigger bonuses

### Survival Bonus

**Time-based scoring:**
- +100 pts per 10 seconds survived
- Encourages aggressive play
- Rewards risky strategies

### Level Bonuses

**Completing objectives:**
- Level 1-3: +500 pts each
- Level 4-6: +1000 pts each
- Level 7-9: +2000 pts each
- Level 10+: +5000 pts each

---

## Leaderboard Strategy

### Maximize Your Score

**Multiplier Management:**
- Don't get hit!
- Chain kills rapidly
- Use dash to avoid damage
- Collect shields before boss fights

**Combo Chains:**
- Group enemies together
- Use explosive attacks
- Clear swarms quickly
- Plan enemy routes

**Risk vs Reward:**
- Fizzers are worth it (500 pts + high multiplier)
- Don't chase low-value targets
- Sometimes retreat to maintain streak

**Level Strategy:**
- Complete objectives fast for time bonus
- Farm enemies in safe areas
- Save power-ups for bosses
- Don't waste time on stragglers

---

## Tie-Breaking

If two scores are equal:
1. **Higher Level** wins
2. If level equal: **Longer Survival Time** wins
3. If time equal: **Newer Entry** wins

---

## Data Privacy

### What's Stored

✅ Name (3 letters only)  
✅ Score, level, time  
✅ Date played  
✅ General location (city)  
✅ Game mode  

### What's NOT Stored

❌ Email or personal info  
❌ IP address  
❌ Precise GPS location  
❌ Browser fingerprint  

**Location:** Uses browser's geolocation API (city-level only), with your permission. Shows "ONLINE" if location disabled.

---

## Leaderboard Etiquette

### Do:
✅ Use appropriate names  
✅ Play fair  
✅ Celebrate good scores  
✅ Learn from top players  

### Don't:
❌ Use offensive names  
❌ Spam submissions  
❌ Cheat or exploit  
❌ Submit fake scores  

---

## Troubleshooting

### Score Not Saving

**Check:**
1. Completed full game (didn't quit early)
2. Score high enough for top 10
3. Entered valid name
4. Internet connection (if online)

**Try:**
- Refresh page and play again
- Check browser console for errors
- Verify localStorage not disabled

### Different Scores on Different Devices

**Cause:** Using localStorage (local mode)

**Solution:** Deploy to Vercel for global scores

### Scores Reset After Deployment

**Cause:** Using in-memory storage

**Solution:** Upgrade to Vercel KV for permanent storage

See: [`DEPLOYMENT.md`](DEPLOYMENT.md)

---

## Future Features

**Planned:**
- [ ] Monthly leaderboards
- [ ] Weekly challenges
- [ ] Friend leaderboards
- [ ] Achievement tracking
- [ ] Score replays
- [ ] Social sharing

---

## Tips for High Scores

### Original Mode

**Focus on:**
- Maintaining multiplier
- Level speed completion
- Enemy priority (Fizzers > UFOs > Bosses)
- Power-up efficiency

**Avoid:**
- Getting hit early (breaks streak)
- Wasting time on low-value enemies
- Ignoring power-ups
- Poor positioning

### Rogue Mode

**Focus on:**
- Synergistic ability builds
- Long-term scaling
- Risk management
- Efficient layer completion

**Avoid:**
- Weak ability combos
- Taking unnecessary damage
- Rushing layers
- Ignoring meta-progression

---

## Records to Beat

**Challenge yourself!**

**Original Mode Goals:**
- 🥉 Bronze: 50,000 pts
- 🥈 Silver: 100,000 pts
- 🥇 Gold: 200,000 pts
- 🏆 Legend: 500,000 pts

**Rogue Mode Goals:**
- 🥉 Bronze: 3 layers
- 🥈 Silver: 5 layers
- 🥇 Gold: 10 layers
- 🏆 Legend: 15+ layers

---

**Climb the leaderboards and prove you're the best Neural Hacker!** 🎮🏆🌐
