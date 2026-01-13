# 🎮 Menu Navigation Guide

## Overview

**Neural Break** supports **three input methods** for menu navigation:
1. **Keyboard** (Arrow Keys + WASD)
2. **Mouse** (Point and Click)
3. **Gamepad** (Xbox/PlayStation controllers)

All menu screens are fully navigable with any input method!

---

## 🎹 Keyboard Controls

### Universal Keys
| Key | Action |
|-----|--------|
| **Space** / **Enter** | Select / Activate button |
| **Escape** | Back / Exit (where applicable) |

### Navigation Keys

**Vertical Menus** (Start, Pause, Game Over):
- **↑ Arrow Up** / **W** → Move selection up
- **↓ Arrow Down** / **S** → Move selection down

**Horizontal Menus** (Rogue Special Selection):
- **← Arrow Left** / **A** → Move selection left
- **→ Arrow Right** / **D** → Move selection right

---

## 🖱️ Mouse Controls

| Action | Input |
|--------|-------|
| **Hover** | Automatically highlights button |
| **Click** | Activates button |

All buttons respond to mouse hover and click!

---

## 🎮 Gamepad Controls

### D-Pad Navigation
- **D-Pad Up** → Move selection up
- **D-Pad Down** → Move selection down
- **D-Pad Left** → Move selection left
- **D-Pad Right** → Move selection right

### Analog Stick Navigation
- **Left Stick Up/Down** → Vertical navigation
- **Left Stick Left/Right** → Horizontal navigation
- **Deadzone:** 0.5 (50% stick movement required)

### Button Controls
- **A Button** (Xbox) / **✕ Button** (PlayStation) → Select / Activate
- **B Button** (Xbox) / **○ Button** (PlayStation) → Back / Exit (where applicable)

---

## 📱 Screen-Specific Controls

### 1. Start Screen
**Layout:** Vertical button menu

**Buttons:**
1. **ARCADE MODE** - Classic radial gameplay
2. **ROGUE MODE** - Vertical ascent roguelite
3. **TEST MODE** - Sandbox testing
4. **HIGH SCORES** - View leaderboard

**Navigation:**
- **Keyboard:** ↑/↓ or W/S to navigate, Space/Enter to select
- **Mouse:** Hover and click
- **Gamepad:** D-Pad or Left Stick Up/Down, A button to select

---

### 2. Pause Screen
**Layout:** Vertical button menu

**Buttons:**
1. **CONTINUE** - Resume game
2. **END GAME** - Return to main menu

**Navigation:**
- **Keyboard:** ↑/↓ or W/S to navigate, Space/Enter to select
- **Mouse:** Hover and click
- **Gamepad:** D-Pad or Left Stick Up/Down, A button to select

**Exit:**
- **Keyboard:** Escape resumes game
- **Gamepad:** B button resumes game

---

### 3. Rogue Special Selection
**Layout:** Horizontal card selection (3 cards)

**Cards:** Choose 1 of 3 special power-ups

**Navigation:**
- **Keyboard:** ←/→ or A/D to navigate, Space/Enter to select
- **Mouse:** Hover and click
- **Gamepad:** D-Pad or Left Stick Left/Right, A button to select

---

### 4. Game Over Screen
**Layout:** Vertical button menu

**Buttons (High Score):**
1. **SAVE** - Save your high score (if new high score)
2. **RESTART** - Start new game

**Buttons (Normal):**
1. **RESTART** - Start new game

**Special Input:**
- **Name Entry Field** - Click to type your name (if high score)
- **Enter** while in name field → Save score

**Navigation:**
- **Keyboard:** ↑/↓ or W/S or ←/→ or A/D to navigate, Space/Enter to select
- **Mouse:** Click name field to edit, hover and click buttons
- **Gamepad:** D-Pad or Left Stick, A button to select

---

### 5. Leaderboard Screen
**Layout:** Score table + Back button

**Navigation:**
- **Keyboard:** Space/Enter/Escape to return
- **Mouse:** Click "Back to Menu" button
- **Gamepad:** A button or B button to return

---

## 🔧 Technical Details

### Visual Feedback
- **Selected Button:** Scales up (1.08x), brighter, enhanced glow
- **Hover:** Audio cue (hover sound)
- **Activation:** Audio cue (press sound)

### Input Cooldown
- **200ms cooldown** between gamepad/keyboard inputs
- Prevents accidental double-inputs
- Mouse has no cooldown (immediate response)

### Gamepad Support
- **Auto-detects** first connected gamepad (index 0)
- **Polling rate:** 50ms (20 times per second)
- **Standard mapping** (Xbox/PlayStation layout)

### Accessibility
- **Multiple input methods** work simultaneously
- **Audio feedback** on all interactions
- **Large buttons** with clear visual states
- **High contrast** cyberpunk color scheme

---

## 🎯 Best Practices

### For Keyboard Users
- Use **W/A/S/D** for comfortable left-hand navigation
- Use **Arrow Keys** if you prefer right-hand navigation
- **Space** is easier to reach than Enter

### For Gamepad Users
- **D-Pad** gives precise digital input
- **Analog Stick** allows faster sweeping motions
- **Hold stick** briefly to ensure input registers

### For Mouse Users
- **Hover** gives instant preview
- **Click anywhere** on button (generous hit area)
- **Cursor automatically shows** in menus

---

## 🐛 Troubleshooting

### Gamepad Not Working
1. **Connect gamepad** before starting game
2. **Check browser support** (Chrome/Firefox recommended)
3. **Test in browser gamepad tester** (gamepad-tester.com)
4. **Reconnect** gamepad and refresh page

### Keyboard Not Responding
1. **Click game window** to focus
2. **Check browser permissions**
3. **Disable browser extensions** that might intercept keys

### Mouse Clicks Not Working
1. **Check pointer-events** are enabled
2. **Refresh page** if stuck
3. **Try keyboard** as fallback

---

## 🎨 Visual Design

All menus feature:
- **CRT monitor effect** (vignette + scanlines)
- **Neon glow** on selected elements
- **Pixel-perfect shadows**
- **80s arcade aesthetic**
- **Responsive text scaling**

---

**Last Updated:** 2026-01-13  
**Version:** 1.0.0  
**Supported Controllers:** Xbox, PlayStation, Generic HID gamepads
