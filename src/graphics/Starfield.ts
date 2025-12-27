/**
 * 80s Arcade-Style Flying Starfield with ATTRACT MODE
 * Features: Flying stars, wandering demo enemies, procedural effects
 */
export class Starfield {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private stars: Star[] = []
  private demoEnemies: DemoEnemy[] = []
  private effects: BackgroundEffect[] = []
  private numStars = 150
  private numEnemies = 8
  private centerX = 0
  private centerY = 0
  private speed = 2
  private animationId: number | null = null
  private isRunning = false
  private time = 0

  constructor() {
    this.canvas = document.createElement('canvas')
    this.canvas.id = 'starfieldCanvas'
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 0;
      pointer-events: none;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    `
    this.ctx = this.canvas.getContext('2d')!
    
    this.handleResize = this.handleResize.bind(this)
    window.addEventListener('resize', this.handleResize)
  }

  private handleResize(): void {
    const pixelScale = 2
    this.canvas.width = Math.floor(window.innerWidth / pixelScale)
    this.canvas.height = Math.floor(window.innerHeight / pixelScale)
    this.centerX = this.canvas.width / 2
    this.centerY = this.canvas.height / 2
    this.ctx.imageSmoothingEnabled = false
  }

  private initStars(): void {
    this.stars = []
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push(this.createStar())
    }
  }

  private initDemoEnemies(): void {
    this.demoEnemies = []
    const enemyTypes: EnemyType[] = ['datamite', 'scandrone', 'chaosworm', 'voidsphere', 'crystal', 'fizzer', 'ufo']
    
    for (let i = 0; i < this.numEnemies; i++) {
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)]
      this.demoEnemies.push(this.createDemoEnemy(type))
    }
  }

  private createStar(): Star {
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * 0.1
    
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      z: Math.random() * 1000 + 500,
      prevX: 0,
      prevY: 0,
      color: this.getStarColor(Math.random())
    }
  }

  private createDemoEnemy(type: EnemyType): DemoEnemy {
    const margin = 50
    return {
      x: margin + Math.random() * (this.canvas.width - margin * 2),
      y: margin + Math.random() * (this.canvas.height - margin * 2),
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      type,
      phase: Math.random() * Math.PI * 2,
      size: 8 + Math.random() * 6,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      // Worm segments
      segments: type === 'chaosworm' ? this.createWormSegments() : [],
      trailTimer: 0
    }
  }

  private createWormSegments(): WormSegment[] {
    const segments: WormSegment[] = []
    for (let i = 0; i < 5; i++) {
      segments.push({ x: 0, y: 0, size: 8 - i })
    }
    return segments
  }

  private getStarColor(seed: number): string {
    if (seed < 0.6) return '#FFFFFF'
    if (seed < 0.75) return '#00FFFF'
    if (seed < 0.85) return '#FF00FF'
    if (seed < 0.92) return '#FFFF00'
    if (seed < 0.96) return '#00FF00'
    return '#FF6600'
  }

  private updateStar(star: Star): void {
    star.prevX = star.x
    star.prevY = star.y
    star.z -= this.speed * 10
    
    if (star.z <= 1) {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * 0.3
      star.x = Math.cos(angle) * distance
      star.y = Math.sin(angle) * distance
      star.z = 1000
      star.prevX = star.x
      star.prevY = star.y
      star.color = this.getStarColor(Math.random())
    }
  }

  private updateDemoEnemy(enemy: DemoEnemy, deltaTime: number): void {
    enemy.phase += deltaTime * 3
    enemy.rotation += enemy.rotationSpeed
    enemy.trailTimer += deltaTime
    
    // Wander behavior with slight homing toward center
    const centerPullX = (this.centerX - enemy.x) * 0.0005
    const centerPullY = (this.centerY - enemy.y) * 0.0005
    
    enemy.vx += centerPullX + (Math.random() - 0.5) * 0.1
    enemy.vy += centerPullY + (Math.random() - 0.5) * 0.1
    
    // Speed limit
    const speed = Math.sqrt(enemy.vx * enemy.vx + enemy.vy * enemy.vy)
    const maxSpeed = enemy.type === 'chaosworm' ? 1.5 : 1.0
    if (speed > maxSpeed) {
      enemy.vx = (enemy.vx / speed) * maxSpeed
      enemy.vy = (enemy.vy / speed) * maxSpeed
    }
    
    enemy.x += enemy.vx
    enemy.y += enemy.vy
    
    // Bounce off edges
    const margin = 20
    if (enemy.x < margin) { enemy.x = margin; enemy.vx = Math.abs(enemy.vx) }
    if (enemy.x > this.canvas.width - margin) { enemy.x = this.canvas.width - margin; enemy.vx = -Math.abs(enemy.vx) }
    if (enemy.y < margin) { enemy.y = margin; enemy.vy = Math.abs(enemy.vy) }
    if (enemy.y > this.canvas.height - margin) { enemy.y = this.canvas.height - margin; enemy.vy = -Math.abs(enemy.vy) }
    
    // Update worm segments
    if (enemy.type === 'chaosworm' && enemy.segments.length > 0) {
      let prevX = enemy.x
      let prevY = enemy.y
      for (const segment of enemy.segments) {
        const dx = prevX - segment.x
        const dy = prevY - segment.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > 6) {
          segment.x += dx * 0.3
          segment.y += dy * 0.3
        }
        prevX = segment.x
        prevY = segment.y
      }
    }
    
    // Spawn trail effects
    if (enemy.trailTimer > 0.1) {
      enemy.trailTimer = 0
      this.spawnTrailEffect(enemy)
    }
  }

  private spawnTrailEffect(enemy: DemoEnemy): void {
    let color: string
    switch (enemy.type) {
      case 'datamite': color = '#FF4400'; break
      case 'scandrone': color = '#FF6600'; break
      case 'chaosworm': color = `hsl(${Math.random() * 360}, 100%, 50%)`; break
      case 'voidsphere': color = '#8800FF'; break
      case 'crystal': color = '#00FFFF'; break
      case 'fizzer': color = '#00FF88'; break
      case 'ufo': color = '#88AAFF'; break
      default: color = '#FF4400'
    }
    
    this.effects.push({
      x: enemy.x + (Math.random() - 0.5) * 10,
      y: enemy.y + (Math.random() - 0.5) * 10,
      vx: -enemy.vx * 0.3 + (Math.random() - 0.5) * 0.5,
      vy: -enemy.vy * 0.3 + (Math.random() - 0.5) * 0.5,
      life: 1.0,
      maxLife: 1.0,
      size: 2 + Math.random() * 2,
      color,
      type: 'particle'
    })
  }

  private spawnRandomEffect(): void {
    // Randomly spawn background effects
    if (Math.random() < 0.02) {
      const effectTypes: EffectType[] = ['sparkle', 'pulse', 'energy']
      const type = effectTypes[Math.floor(Math.random() * effectTypes.length)]
      
      this.effects.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: 1.0,
        maxLife: 1.0 + Math.random() * 2,
        size: 3 + Math.random() * 5,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        type
      })
    }
  }

  private updateEffects(deltaTime: number): void {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const effect = this.effects[i]
      effect.x += effect.vx
      effect.y += effect.vy
      effect.life -= deltaTime / effect.maxLife
      
      if (effect.life <= 0) {
        this.effects.splice(i, 1)
      }
    }
  }

  private drawStar(star: Star): void {
    const scale = 500 / star.z
    const x = this.centerX + star.x * scale * this.canvas.width
    const y = this.centerY + star.y * scale * this.canvas.height
    
    const prevScale = 500 / (star.z + this.speed * 10)
    const prevX = this.centerX + star.prevX * prevScale * this.canvas.width
    const prevY = this.centerY + star.prevY * prevScale * this.canvas.height
    
    if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) return

    const size = Math.max(1, Math.min(4, (1000 - star.z) / 200))
    const brightness = Math.min(1, (1000 - star.z) / 600)
    
    this.ctx.save()
    this.ctx.globalAlpha = brightness
    
    if (star.z < 800) {
      this.ctx.strokeStyle = star.color
      this.ctx.lineWidth = Math.max(1, size * 0.5)
      this.ctx.beginPath()
      this.ctx.moveTo(prevX, prevY)
      this.ctx.lineTo(x, y)
      this.ctx.stroke()
    }
    
    this.ctx.fillStyle = star.color
    const pixelSize = Math.ceil(size)
    this.ctx.fillRect(
      Math.floor(x - pixelSize / 2),
      Math.floor(y - pixelSize / 2),
      pixelSize,
      pixelSize
    )
    
    this.ctx.restore()
  }

  private drawDemoEnemy(enemy: DemoEnemy): void {
    this.ctx.save()
    
    switch (enemy.type) {
      case 'datamite':
        this.drawDataMite(enemy)
        break
      case 'scandrone':
        this.drawScanDrone(enemy)
        break
      case 'chaosworm':
        this.drawChaosWorm(enemy)
        break
      case 'voidsphere':
        this.drawVoidSphere(enemy)
        break
      case 'crystal':
        this.drawCrystal(enemy)
        break
      case 'fizzer':
        this.drawFizzer(enemy)
        break
      case 'ufo':
        this.drawUFO(enemy)
        break
    }
    
    this.ctx.restore()
  }

  private drawDataMite(enemy: DemoEnemy): void {
    const pulse = 0.8 + Math.sin(enemy.phase) * 0.2
    const size = enemy.size * pulse
    
    // Glow
    this.ctx.globalAlpha = 0.3
    this.ctx.fillStyle = '#FF4400'
    this.ctx.beginPath()
    this.ctx.arc(enemy.x, enemy.y, size * 1.5, 0, Math.PI * 2)
    this.ctx.fill()
    
    // Core
    this.ctx.globalAlpha = 0.9
    this.ctx.fillStyle = '#FF6600'
    this.ctx.beginPath()
    this.ctx.arc(enemy.x, enemy.y, size, 0, Math.PI * 2)
    this.ctx.fill()
    
    // Inner
    this.ctx.fillStyle = '#FFAA00'
    this.ctx.beginPath()
    this.ctx.arc(enemy.x, enemy.y, size * 0.5, 0, Math.PI * 2)
    this.ctx.fill()
  }

  private drawScanDrone(enemy: DemoEnemy): void {
    const size = enemy.size
    
    // Rotating radar sweep
    this.ctx.save()
    this.ctx.translate(enemy.x, enemy.y)
    this.ctx.rotate(enemy.rotation * 3)
    
    // Radar beam
    this.ctx.globalAlpha = 0.4
    this.ctx.fillStyle = '#00FF00'
    this.ctx.beginPath()
    this.ctx.moveTo(0, 0)
    this.ctx.arc(0, 0, size * 2, 0, Math.PI / 4)
    this.ctx.closePath()
    this.ctx.fill()
    
    this.ctx.restore()
    
    // Hexagonal body
    this.ctx.globalAlpha = 0.9
    this.ctx.fillStyle = '#FF6600'
    this.ctx.save()
    this.ctx.translate(enemy.x, enemy.y)
    this.ctx.rotate(enemy.rotation)
    this.ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6
      const px = Math.cos(angle) * size
      const py = Math.sin(angle) * size
      if (i === 0) this.ctx.moveTo(px, py)
      else this.ctx.lineTo(px, py)
    }
    this.ctx.closePath()
    this.ctx.fill()
    this.ctx.restore()
    
    // Eye
    const blink = Math.sin(enemy.phase * 2) > 0.5
    this.ctx.fillStyle = blink ? '#00FF00' : '#FF0000'
    this.ctx.beginPath()
    this.ctx.arc(enemy.x, enemy.y, size * 0.3, 0, Math.PI * 2)
    this.ctx.fill()
  }

  private drawChaosWorm(enemy: DemoEnemy): void {
    // Draw segments first (tail)
    for (let i = enemy.segments.length - 1; i >= 0; i--) {
      const segment = enemy.segments[i]
      const hue = (this.time * 100 + i * 40) % 360
      this.ctx.globalAlpha = 0.8
      this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
      this.ctx.beginPath()
      this.ctx.arc(segment.x, segment.y, segment.size, 0, Math.PI * 2)
      this.ctx.fill()
    }
    
    // Head
    const hue = (this.time * 100) % 360
    this.ctx.globalAlpha = 1.0
    this.ctx.fillStyle = `hsl(${hue}, 100%, 60%)`
    this.ctx.beginPath()
    this.ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2)
    this.ctx.fill()
    
    // Eyes
    this.ctx.fillStyle = '#FFFFFF'
    const eyeOffset = enemy.size * 0.3
    this.ctx.beginPath()
    this.ctx.arc(enemy.x - eyeOffset, enemy.y - eyeOffset, 2, 0, Math.PI * 2)
    this.ctx.arc(enemy.x + eyeOffset, enemy.y - eyeOffset, 2, 0, Math.PI * 2)
    this.ctx.fill()
  }

  private drawVoidSphere(enemy: DemoEnemy): void {
    const pulse = 0.8 + Math.sin(enemy.phase * 0.5) * 0.2
    const size = enemy.size * pulse
    
    // Outer energy ring
    this.ctx.globalAlpha = 0.4
    this.ctx.strokeStyle = '#AA00FF'
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    this.ctx.arc(enemy.x, enemy.y, size * 1.8, 0, Math.PI * 2)
    this.ctx.stroke()
    
    // Void core (dark center)
    this.ctx.globalAlpha = 1.0
    this.ctx.fillStyle = '#220044'
    this.ctx.beginPath()
    this.ctx.arc(enemy.x, enemy.y, size, 0, Math.PI * 2)
    this.ctx.fill()
    
    // Purple glow edge
    this.ctx.globalAlpha = 0.8
    this.ctx.strokeStyle = '#8800FF'
    this.ctx.lineWidth = 3
    this.ctx.beginPath()
    this.ctx.arc(enemy.x, enemy.y, size, 0, Math.PI * 2)
    this.ctx.stroke()
    
    // Swirling energy
    this.ctx.save()
    this.ctx.translate(enemy.x, enemy.y)
    this.ctx.rotate(enemy.rotation * 2)
    this.ctx.globalAlpha = 0.5
    this.ctx.strokeStyle = '#FF00FF'
    this.ctx.lineWidth = 1
    for (let i = 0; i < 3; i++) {
      this.ctx.beginPath()
      const startAngle = (Math.PI * 2 * i) / 3
      this.ctx.arc(0, 0, size * 0.6, startAngle, startAngle + Math.PI / 2)
      this.ctx.stroke()
    }
    this.ctx.restore()
  }

  private drawCrystal(enemy: DemoEnemy): void {
    const size = enemy.size
    
    // Draw multiple crystal shards
    for (let i = 0; i < 4; i++) {
      const angle = enemy.rotation + (Math.PI * 2 * i) / 4
      const dist = size * 0.5
      const sx = enemy.x + Math.cos(angle) * dist
      const sy = enemy.y + Math.sin(angle) * dist
      const shardSize = size * 0.6
      
      const hue = (180 + i * 60 + Math.sin(enemy.phase) * 30) % 360
      
      this.ctx.save()
      this.ctx.translate(sx, sy)
      this.ctx.rotate(angle + enemy.phase * 0.5)
      
      // Crystal shard (diamond shape)
      this.ctx.globalAlpha = 0.9
      this.ctx.fillStyle = `hsl(${hue}, 100%, 60%)`
      this.ctx.beginPath()
      this.ctx.moveTo(0, -shardSize)
      this.ctx.lineTo(shardSize * 0.4, 0)
      this.ctx.lineTo(0, shardSize * 0.6)
      this.ctx.lineTo(-shardSize * 0.4, 0)
      this.ctx.closePath()
      this.ctx.fill()
      
      // Glow
      this.ctx.globalAlpha = 0.4
      this.ctx.strokeStyle = `hsl(${hue}, 100%, 80%)`
      this.ctx.lineWidth = 2
      this.ctx.stroke()
      
      this.ctx.restore()
    }
  }

  private drawFizzer(enemy: DemoEnemy): void {
    const size = enemy.size * 0.7 // Small!
    const pulse = 0.7 + Math.sin(enemy.phase * 5) * 0.3
    
    // Electric glow
    this.ctx.globalAlpha = 0.4
    const gradient = this.ctx.createRadialGradient(enemy.x, enemy.y, 0, enemy.x, enemy.y, size * 2)
    gradient.addColorStop(0, '#00FF88')
    gradient.addColorStop(1, 'transparent')
    this.ctx.fillStyle = gradient
    this.ctx.beginPath()
    this.ctx.arc(enemy.x, enemy.y, size * 2, 0, Math.PI * 2)
    this.ctx.fill()
    
    // Core
    this.ctx.globalAlpha = 0.95
    this.ctx.fillStyle = '#FFFFFF'
    this.ctx.beginPath()
    this.ctx.arc(enemy.x, enemy.y, size * pulse * 0.5, 0, Math.PI * 2)
    this.ctx.fill()
    
    // Outer shell
    this.ctx.fillStyle = '#00FF88'
    this.ctx.beginPath()
    this.ctx.arc(enemy.x, enemy.y, size * pulse, 0, Math.PI * 2)
    this.ctx.fill()
    
    // Electric spikes - random positions!
    this.ctx.strokeStyle = '#00FFFF'
    this.ctx.lineWidth = 2
    this.ctx.globalAlpha = 0.8 + Math.sin(enemy.phase * 10) * 0.2
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6 + Math.sin(this.time * 20 + i) * 0.5
      const length = size * (1 + Math.sin(this.time * 15 + i * 2) * 0.5)
      this.ctx.beginPath()
      this.ctx.moveTo(enemy.x, enemy.y)
      this.ctx.lineTo(
        enemy.x + Math.cos(angle) * length,
        enemy.y + Math.sin(angle) * length
      )
      this.ctx.stroke()
    }
  }

  private drawUFO(enemy: DemoEnemy): void {
    const size = enemy.size * 1.2 // Bigger
    
    this.ctx.save()
    this.ctx.translate(enemy.x, enemy.y)
    this.ctx.rotate(enemy.rotation * 0.1) // Slight tilt
    
    // Jet trails
    this.ctx.globalAlpha = 0.6
    const gradient = this.ctx.createLinearGradient(0, 0, 0, size)
    gradient.addColorStop(0, '#FF6600')
    gradient.addColorStop(1, 'transparent')
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(-size * 0.3 - 1, size * 0.2, 3, size * 0.5 + Math.sin(this.time * 10) * 2)
    this.ctx.fillRect(size * 0.3 - 1, size * 0.2, 3, size * 0.5 + Math.sin(this.time * 10 + 1) * 2)
    
    // Saucer body
    this.ctx.globalAlpha = 0.9
    this.ctx.fillStyle = '#556677'
    this.ctx.beginPath()
    this.ctx.ellipse(0, 0, size, size * 0.3, 0, 0, Math.PI * 2)
    this.ctx.fill()
    
    // Saucer edge highlight
    this.ctx.strokeStyle = '#88AAFF'
    this.ctx.lineWidth = 2
    this.ctx.stroke()
    
    // Cockpit dome
    this.ctx.fillStyle = '#88AAFF'
    this.ctx.globalAlpha = 0.8
    this.ctx.beginPath()
    this.ctx.ellipse(0, -size * 0.15, size * 0.4, size * 0.25, 0, Math.PI, 0)
    this.ctx.fill()
    
    // Running lights
    const lightPhase = Math.floor(this.time * 6) % 3
    for (let i = 0; i < 3; i++) {
      const angle = (Math.PI * 2 * i) / 3 + Math.PI / 2
      const lx = Math.cos(angle) * size * 0.7
      const ly = Math.sin(angle) * size * 0.15
      
      const colors = ['#FF0000', '#00FF00', '#0088FF']
      this.ctx.globalAlpha = i === lightPhase ? 1 : 0.3
      this.ctx.fillStyle = colors[i]
      this.ctx.beginPath()
      this.ctx.arc(lx, ly, 2, 0, Math.PI * 2)
      this.ctx.fill()
    }
    
    // Bottom glow / laser charging
    this.ctx.globalAlpha = 0.3 + Math.sin(this.time * 2) * 0.2
    this.ctx.fillStyle = '#00FF88'
    this.ctx.beginPath()
    this.ctx.arc(0, size * 0.15, size * 0.3, 0, Math.PI * 2)
    this.ctx.fill()
    
    this.ctx.restore()
  }

  private drawEffect(effect: BackgroundEffect): void {
    this.ctx.save()
    this.ctx.globalAlpha = effect.life
    
    switch (effect.type) {
      case 'particle':
        this.ctx.fillStyle = effect.color
        this.ctx.fillRect(
          effect.x - effect.size / 2,
          effect.y - effect.size / 2,
          effect.size * effect.life,
          effect.size * effect.life
        )
        break
        
      case 'sparkle':
        this.ctx.fillStyle = effect.color
        this.ctx.beginPath()
        this.ctx.arc(effect.x, effect.y, effect.size * effect.life, 0, Math.PI * 2)
        this.ctx.fill()
        // Cross sparkle
        this.ctx.strokeStyle = effect.color
        this.ctx.lineWidth = 1
        const sparkleSize = effect.size * 2 * effect.life
        this.ctx.beginPath()
        this.ctx.moveTo(effect.x - sparkleSize, effect.y)
        this.ctx.lineTo(effect.x + sparkleSize, effect.y)
        this.ctx.moveTo(effect.x, effect.y - sparkleSize)
        this.ctx.lineTo(effect.x, effect.y + sparkleSize)
        this.ctx.stroke()
        break
        
      case 'pulse':
        this.ctx.strokeStyle = effect.color
        this.ctx.lineWidth = 2
        const pulseSize = effect.size * (1 + (1 - effect.life) * 3)
        this.ctx.beginPath()
        this.ctx.arc(effect.x, effect.y, pulseSize, 0, Math.PI * 2)
        this.ctx.stroke()
        break
        
      case 'energy':
        this.ctx.strokeStyle = effect.color
        this.ctx.lineWidth = 1
        for (let i = 0; i < 3; i++) {
          const angle = (this.time * 5 + i * Math.PI * 2 / 3)
          const dist = effect.size * (1 + (1 - effect.life) * 2)
          this.ctx.beginPath()
          this.ctx.arc(effect.x, effect.y, dist, angle, angle + Math.PI / 3)
          this.ctx.stroke()
        }
        break
    }
    
    this.ctx.restore()
  }

  private drawGrid(): void {
    this.ctx.save()
    this.ctx.globalAlpha = 0.06
    this.ctx.strokeStyle = '#00FFFF'
    this.ctx.lineWidth = 1
    
    const horizonY = this.canvas.height * 0.5
    const gridLines = 20
    
    for (let i = 0; i <= gridLines; i++) {
      const progress = i / gridLines
      const y = horizonY + (this.canvas.height - horizonY) * Math.pow(progress, 1.5)
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.canvas.width, y)
      this.ctx.stroke()
    }
    
    const vanishX = this.centerX
    for (let i = -10; i <= 10; i++) {
      const bottomX = vanishX + i * (this.canvas.width / 10)
      this.ctx.beginPath()
      this.ctx.moveTo(vanishX, horizonY)
      this.ctx.lineTo(bottomX, this.canvas.height)
      this.ctx.stroke()
    }
    
    this.ctx.restore()
  }

  private drawScanlines(): void {
    this.ctx.save()
    this.ctx.globalAlpha = 0.12
    this.ctx.fillStyle = '#000000'
    
    for (let y = 0; y < this.canvas.height; y += 2) {
      this.ctx.fillRect(0, y, this.canvas.width, 1)
    }
    
    this.ctx.restore()
  }

  private drawNebulae(): void {
    // Procedural nebula clouds
    this.ctx.save()
    
    for (let i = 0; i < 3; i++) {
      const nebulaX = this.centerX + Math.sin(this.time * 0.1 + i * 2) * this.canvas.width * 0.3
      const nebulaY = this.centerY + Math.cos(this.time * 0.08 + i * 2) * this.canvas.height * 0.2
      const size = 80 + Math.sin(this.time * 0.2 + i) * 20
      
      const gradient = this.ctx.createRadialGradient(
        nebulaX, nebulaY, 0,
        nebulaX, nebulaY, size
      )
      
      const hue = (i * 120 + this.time * 10) % 360
      gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.08)`)
      gradient.addColorStop(0.5, `hsla(${hue + 30}, 100%, 40%, 0.04)`)
      gradient.addColorStop(1, 'transparent')
      
      this.ctx.fillStyle = gradient
      this.ctx.beginPath()
      this.ctx.arc(nebulaX, nebulaY, size, 0, Math.PI * 2)
      this.ctx.fill()
    }
    
    this.ctx.restore()
  }

  private draw(deltaTime: number): void {
    // Clear with deep space blue
    this.ctx.fillStyle = '#000011'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    
    // Draw layers back to front
    this.drawGrid()
    this.drawNebulae()
    
    // Update and draw stars
    for (const star of this.stars) {
      this.updateStar(star)
      this.drawStar(star)
    }
    
    // Update and draw effects (behind enemies)
    this.updateEffects(deltaTime)
    for (const effect of this.effects) {
      this.drawEffect(effect)
    }
    
    // Update and draw demo enemies
    for (const enemy of this.demoEnemies) {
      this.updateDemoEnemy(enemy, deltaTime)
      this.drawDemoEnemy(enemy)
    }
    
    // Spawn random effects
    this.spawnRandomEffect()
    
    // Scanlines on top
    this.drawScanlines()
  }

  private lastTime = 0
  private frameCount = 0
  
  private animate = (currentTime: number): void => {
    if (!this.isRunning) return
    
    // Skip first frame to get proper deltaTime
    if (this.frameCount === 0) {
      this.lastTime = currentTime
      this.frameCount++
      this.animationId = requestAnimationFrame(this.animate)
      return
    }
    
    const deltaTime = (currentTime - this.lastTime) / 1000
    this.lastTime = currentTime
    
    // Clamp deltaTime to prevent issues (skip if too large or negative)
    if (deltaTime <= 0 || deltaTime > 0.5) {
      this.animationId = requestAnimationFrame(this.animate)
      return
    }
    
    this.time += deltaTime
    
    try {
      this.draw(deltaTime)
    } catch (e) {
      console.error('Starfield draw error:', e)
    }
    
    this.animationId = requestAnimationFrame(this.animate)
  }

  start(): void {
    // Always stop first to ensure clean state
    this.stop()
    
    // Initialize
    this.handleResize()
    
    // Safety check - ensure canvas has dimensions
    if (this.canvas.width === 0 || this.canvas.height === 0) {
      this.canvas.width = Math.max(400, Math.floor(window.innerWidth / 2))
      this.canvas.height = Math.max(300, Math.floor(window.innerHeight / 2))
      this.centerX = this.canvas.width / 2
      this.centerY = this.canvas.height / 2
    }
    
    this.initStars()
    this.initDemoEnemies()
    this.effects = []
    this.isRunning = true
    this.lastTime = 0
    this.frameCount = 0
    this.time = 0
    
    // Add canvas to DOM
    document.body.insertBefore(this.canvas, document.body.firstChild)
    
    // Start animation loop
    this.animationId = requestAnimationFrame(this.animate)
  }

  stop(): void {
    this.isRunning = false
    this.frameCount = 0
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    
    // Remove canvas from DOM if present
    const existingCanvas = document.getElementById('starfieldCanvas')
    if (existingCanvas && existingCanvas.parentNode) {
      existingCanvas.parentNode.removeChild(existingCanvas)
    }
  }

  setSpeed(speed: number): void {
    this.speed = Math.max(0.5, Math.min(10, speed))
  }

  destroy(): void {
    this.stop()
    window.removeEventListener('resize', this.handleResize)
  }
}

// Types
interface Star {
  x: number
  y: number
  z: number
  prevX: number
  prevY: number
  color: string
}

type EnemyType = 'datamite' | 'scandrone' | 'chaosworm' | 'voidsphere' | 'crystal' | 'fizzer' | 'ufo'

interface WormSegment {
  x: number
  y: number
  size: number
}

interface DemoEnemy {
  x: number
  y: number
  vx: number
  vy: number
  type: EnemyType
  phase: number
  size: number
  rotation: number
  rotationSpeed: number
  segments: WormSegment[]
  trailTimer: number
}

type EffectType = 'particle' | 'sparkle' | 'pulse' | 'energy'

interface BackgroundEffect {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  type: EffectType
}
