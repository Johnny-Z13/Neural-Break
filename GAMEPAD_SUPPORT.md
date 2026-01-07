# 🎮 GAMEPAD SUPPORT

**Neural Break** now features full native gamepad support for Xbox and PlayStation controllers!

---

## ✨ Features

### Supported Controllers
- ✅ Xbox One / Xbox Series X|S controllers
- ✅ PlayStation 4 / PlayStation 5 DualShock/DualSense controllers
- ✅ Generic USB/Bluetooth gamepads
- ✅ Steam Deck built-in controls

### Input Support
- **Analog Movement** - Left stick with deadzone
- **Digital Movement** - D-pad alternative
- **Multiple Fire Buttons** - A/X, triggers
- **Multiple Dash Buttons** - B/Circle, right bumper
- **Haptic Feedback** - Controller vibration

---

## 🎯 Button Mapping

### Xbox Controller

| Button | Action |
|--------|--------|
| **Left Stick** | Analog movement (smooth 360° control) |
| **D-Pad** | Digital movement (8-way) |
| **A Button** | Fire weapon |
| **B Button** | Dash |
| **Right Trigger (RT)** | Fire weapon (alternative) |
| **Left Trigger (LT)** | Fire weapon (alternative) |
| **Right Bumper (RB)** | Dash (alternative) |

### PlayStation Controller

| Button | Action |
|--------|--------|
| **Left Stick** | Analog movement (smooth 360° control) |
| **D-Pad** | Digital movement (8-way) |
| **X Button (Cross)** | Fire weapon |
| **Circle Button** | Dash |
| **R2 Trigger** | Fire weapon (alternative) |
| **L2 Trigger** | Fire weapon (alternative) |
| **R1 Bumper** | Dash (alternative) |

---

## 🎮 How to Use

### Connection

1. **Wired**: Plug controller into USB port
2. **Bluetooth**: Pair controller with your computer
3. **Launch Game**: Open Neural Break in browser
4. **Auto-Detect**: Game automatically detects controller

**You'll see a console message when connected:**
```
🎮 Gamepad connected: Xbox Controller (XInput STANDARD GAMEPAD)
```

### Playing

- Simply use the controller - no configuration needed!
- Seamlessly switch between keyboard and gamepad
- Both inputs work simultaneously

---

## 💫 Vibration Feedback

The game provides haptic feedback for:

| Event | Vibration |
|-------|-----------|
| **Enemy Kill** | Light pulse (50ms, 20% intensity) |
| **Hit by Projectile** | Medium rumble (100ms, 50% intensity) |
| **Collision with Enemy** | Heavy impact (200ms, 80% intensity) |
| **Laser Beam Hit** | Explosive shake (300ms, 100% intensity) |

### Disable Vibration

If you prefer no vibration, the browser/OS controls this:
- **Windows**: Xbox Accessories app
- **PlayStation**: DualSense settings
- **Browser**: Some browsers allow vibration control

---

## 🔧 Technical Details

### Analog Stick Precision

- **Deadzone**: 15% (prevents drift)
- **Full Range**: Smooth 0-100% input
- **No Acceleration**: Direct 1:1 mapping

### Button Detection

- **Instant Response**: No input lag
- **Press & Hold**: Works for continuous fire
- **Multiple Inputs**: D-pad + analog work together

### Compatibility

Works in modern browsers with Gamepad API:
- ✅ Chrome 21+
- ✅ Firefox 29+
- ✅ Edge 12+
- ✅ Safari 10.1+

---

## ⚙️ Configuration

### Default Settings

```typescript
// src/core/InputManager.ts
deadzone: 0.15            // 15% analog stick deadzone
triggerThreshold: 0.5     // 50% trigger press threshold
```

### Customization

To adjust settings, edit `src/core/InputManager.ts`:

**Change Deadzone:**
```typescript
private deadzone: number = 0.20  // Increase to 20%
```

**Change Trigger Sensitivity:**
```typescript
private triggerThreshold: number = 0.3  // Hair trigger at 30%
```

---

## 🐛 Troubleshooting

### Controller Not Detected

1. **Check Connection**: Ensure USB/Bluetooth is working
2. **Refresh Page**: Reload the game
3. **Press Button**: Press any button to wake controller
4. **Check Console**: Look for "Gamepad connected" message

### Buttons Not Working

1. **Test in Browser**: Visit [HTML5 Gamepad Tester](https://html5gamepad.com)
2. **Check Mapping**: Different controllers may have different mappings
3. **Update Drivers**: Ensure controller drivers are current

### Vibration Not Working

- Check if browser supports vibration (Chrome/Edge best)
- Some controllers don't support web vibration
- Battery may be too low for vibration

### Input Lag

- Use wired connection for lowest latency
- Close other browser tabs
- Disable browser extensions

---

## 📊 Button Layout Reference

### Standard Gamepad (API Mapping)

```
Button Index | Xbox        | PlayStation | Action
-------------|-------------|-------------|--------
0            | A           | X (Cross)   | Fire
1            | B           | Circle      | Dash
2            | X           | Square      | (unused)
3            | Y           | Triangle    | (unused)
4            | LB          | L1          | (unused)
5            | RB          | R1          | Dash (alt)
6            | LT          | L2          | Fire (alt)
7            | RT          | R2          | Fire (alt)
8            | Back/View   | Share       | (unused)
9            | Start/Menu  | Options     | (unused)
10           | L-Stick     | L-Stick     | (unused)
11           | R-Stick     | R-Stick     | (unused)
12           | D-Up        | D-Up        | Move Up
13           | D-Down      | D-Down      | Move Down
14           | D-Left      | D-Left      | Move Left
15           | D-Right     | D-Right     | Move Right
```

### Analog Axes

```
Axis Index | Control      | Range
-----------|--------------|-------
0          | Left Stick X | -1 to +1 (Left to Right)
1          | Left Stick Y | -1 to +1 (Up to Down)
2          | Right Stick X| -1 to +1 (Left to Right)
3          | Right Stick Y| -1 to +1 (Up to Down)
```

---

## 💡 Tips & Tricks

### Best Practices

1. **Use Analog Stick** for precise movement
2. **Hold Fire Button** for continuous shooting
3. **Use Triggers** for comfortable firing
4. **Try Different Buttons** - find what feels best

### Hybrid Play

- Use **gamepad for movement**
- Use **mouse for precise aiming** (if supported)
- Switch inputs seamlessly mid-game

### Competitive Play

- **Wired connection** = lowest latency (~1ms)
- **Wireless** = slight delay (~8-15ms)
- **Practice** with your preferred layout

---

## 🎨 Advanced Features

### Input Method Detection

The game tracks which input you're using:
- Automatically detects keyboard vs gamepad
- Future UI could show context-sensitive prompts

### Future Enhancements

Potential additions:
- [ ] Custom button remapping
- [ ] Sensitivity adjustment in-game
- [ ] Right stick aiming
- [ ] Multiple gamepad support (co-op)
- [ ] Gamepad UI prompts (show button icons)

---

## 📝 Developer Notes

### Implementation

Gamepad support is implemented in `src/core/InputManager.ts`:

- **Event-based detection**: Gamepad connect/disconnect
- **Polling updates**: State polled every frame
- **Unified API**: Same interface as keyboard
- **No dependencies**: Native browser Gamepad API

### Adding Vibration

To add vibration to new events:

```typescript
// Light feedback
this.inputManager.vibrateLight()

// Medium feedback
this.inputManager.vibrateMedium()

// Heavy feedback
this.inputManager.vibrateHeavy()

// Explosion feedback
this.inputManager.vibrateExplosion()

// Custom vibration
this.inputManager.vibrate(
  duration: 100,        // ms
  weakMagnitude: 0.5,   // 0-1
  strongMagnitude: 0.8  // 0-1
)
```

---

## 🌟 Feedback

**Enjoying gamepad support?**

The implementation focuses on:
- ✅ Zero-config setup
- ✅ Industry-standard mapping
- ✅ Responsive controls
- ✅ Satisfying haptic feedback

---

**Happy gaming! 🎮**

