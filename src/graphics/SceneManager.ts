import * as THREE from 'three'
import { EffectsSystem } from './EffectsSystem'
import { AudioVisualReactiveSystem } from './AudioVisualReactiveSystem'
import { DEBUG_MODE } from '../config'

export class SceneManager {
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private renderer: THREE.WebGLRenderer
  private canvas: HTMLCanvasElement
  private cameraTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
  private cameraLerpSpeed: number = 5.0
  private shakeIntensity: number = 0
  private shakeDuration: number = 0
  private shakeDecay: number = 0.9
  
  // 🎬 MOTION GRAPHICS - Dynamic Camera Zoom! 🎬
  private baseFrustumSize: number = 30 // More zoomed out default
  private currentFrustumSize: number = 30
  private targetFrustumSize: number = 30
  private zoomLerpSpeed: number = 3.0
  private minZoom: number = 24 // Zoomed in 
  private maxZoom: number = 45 // Zoomed out
  private gameplayIntensity: number = 0 // 0-1, affects zoom
  private enemyCount: number = 0
  private comboCount: number = 0
  
  // 🎬 SCREEN TRANSITION STATE 🎬
  private isTransitioning: boolean = false
  private transitionProgress: number = 0
  private transitionDuration: number = 0.8
  private transitionType: 'fade' | 'zoom' | 'slide' | 'particle' = 'fade'
  
  // 🌟 SUPER CRAZY EFFECTS! 🌟
  private backgroundParticles: THREE.Points
  private neuralLines: THREE.Line[] = []
  private dataStreams: THREE.Line[] = []
  private glitchEffect: THREE.Mesh
  private chromaticAberration: number = 0
  private bloomPulse: number = 0
  private timeOffset: number = 0
  
  // 🚀 SUPER JUICY EFFECTS SYSTEM! 🚀
  private effectsSystem: EffectsSystem
  
  // 🎨🎵 AUDIO-VISUAL REACTIVE SYSTEM! 🎵🎨
  private audioVisualSystem: AudioVisualReactiveSystem

  constructor() {
    // Get canvas element - ensure DOM is ready
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement
    if (!this.canvas) {
      console.error('❌ Canvas element not found! Make sure index.html has <canvas id="gameCanvas"></canvas>')
      throw new Error('Canvas element not found')
    }
    if (DEBUG_MODE) console.log('✅ Canvas element found:', this.canvas)
  }

  async initialize(): Promise<void> {
    console.log('🎬 Initializing SceneManager...')
    
    // Create scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x04040e) // Deep purple-blue background (darkened 12%)
    console.log('✅ Scene created')

    // Create orthographic camera for top-down view
    const aspect = window.innerWidth / window.innerHeight
    this.baseFrustumSize = 30 // More zoomed out default
    this.currentFrustumSize = this.baseFrustumSize
    this.targetFrustumSize = this.baseFrustumSize
    this.camera = new THREE.OrthographicCamera(
      this.baseFrustumSize * aspect / -2,
      this.baseFrustumSize * aspect / 2,
      this.baseFrustumSize / 2,
      this.baseFrustumSize / -2,
      0.1,
      1000
    )
    this.camera.position.set(0, 0, 10)
    this.camera.lookAt(0, 0, 0)
    console.log('✅ Camera created:', this.camera.position)

    // Create renderer with CRAZY SETTINGS! 🔥
    try {
      this.renderer = new THREE.WebGLRenderer({ 
        canvas: this.canvas,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      })
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      this.renderer.outputColorSpace = THREE.SRGBColorSpace
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping
      this.renderer.toneMappingExposure = 1.5 // More intense!
      
      // Enable shadows
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      
      console.log('✅ Renderer created and configured:', {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: this.renderer.getPixelRatio()
      })
    } catch (error) {
      console.error('❌ Failed to create WebGL renderer:', error)
      throw error
    }

    // Add cyberpunk lighting
    this.setupLighting()
    console.log('✅ Lighting setup complete')
    
    // Add neural network background
    this.setupBackground()
    console.log('✅ Background setup complete')
    
    // 🔥 Setup SUPER CRAZY EFFECTS! 🔥
    this.setupCrazyEffects()
    console.log('✅ Effects setup complete')
    
    // Initialize SUPER JUICY effects system
    this.effectsSystem = new EffectsSystem(this.scene)
    console.log('✅ EffectsSystem initialized')
    
    // 🎨🎵 Initialize AUDIO-VISUAL REACTIVE SYSTEM! 🎵🎨
    this.audioVisualSystem = new AudioVisualReactiveSystem(this.scene, this.effectsSystem)
    console.log('✅ AudioVisualSystem initialized')
    
    // Register all lights for reactivity
    this.scene.traverse((object) => {
      if (object instanceof THREE.Light) {
        this.audioVisualSystem.registerLight(object)
      }
    })

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize())
    
    // Do an initial render to ensure everything is visible
    this.render()
    console.log('✅ Initial render complete')
    
    // Ensure canvas is visible and on top (but below UI)
    if (this.canvas) {
      this.canvas.style.display = 'block'
      this.canvas.style.visibility = 'visible'
      this.canvas.style.opacity = '1'
      this.canvas.style.zIndex = '1'
      this.canvas.style.position = 'fixed'
      this.canvas.style.top = '0'
      this.canvas.style.left = '0'
      
      const canvasStyle = window.getComputedStyle(this.canvas)
      console.log('📊 Canvas visibility check:', {
        display: canvasStyle.display,
        visibility: canvasStyle.visibility,
        opacity: canvasStyle.opacity,
        width: canvasStyle.width,
        height: canvasStyle.height,
        zIndex: canvasStyle.zIndex
      })
      console.log('✅ SceneManager initialization complete. Scene has', this.scene.children.length, 'objects')
    } else {
      console.error('❌ Canvas element is null!')
    }
  }

  private setupLighting(): void {
    // Ambient light with deep purple tint - MORE INTENSE! 
    const ambientLight = new THREE.AmbientLight(0x170933, 0.35)
    this.scene.add(ambientLight)

    // Main directional light - purple-cyan glow!
    const directionalLight = new THREE.DirectionalLight(0x8844FF, 1.2)
    directionalLight.position.set(0, 0, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    this.scene.add(directionalLight)

    // Add CRAZY atmospheric point lights that MOVE! - Deep purple-blue tones
    const pointLight1 = new THREE.PointLight(0x6622CC, 0.7, 50)
    pointLight1.position.set(10, 10, 2)
    pointLight1.castShadow = true
    this.scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x2244AA, 0.5, 30)
    pointLight2.position.set(-8, -5, 2)
    pointLight2.castShadow = true
    this.scene.add(pointLight2)
    
    // NEW: Pulsing accent lights - magenta and deep blue
    const accentLight1 = new THREE.PointLight(0xCC0088, 0.4, 25)
    accentLight1.position.set(15, -10, 3)
    this.scene.add(accentLight1)
    
    const accentLight2 = new THREE.PointLight(0x4400AA, 0.35, 20)
    accentLight2.position.set(-12, 8, 3)
    this.scene.add(accentLight2)
  }

  private setupBackground(): void {
    // Create bounded world - 9 screen spaces (3x3 grid)
    // Each screen is roughly 20x20 units, so total world is 60x60
    const worldSize = 60
    
    // Create floor grid within bounds - deep purple-blue tones (darkened 12%)
    const gridHelper = new THREE.GridHelper(worldSize, 30, 0x250e46, 0x0e0723)
    gridHelper.rotateX(Math.PI / 2) // Rotate to be horizontal
    gridHelper.position.z = -1
    this.scene.add(gridHelper)

    // Create boundary walls
    this.createBoundaryWalls(worldSize)

    // Add floating data particles within bounds
    this.createDataParticles(worldSize)
    
    // Add neural pathway lines within bounds
    this.createNeuralPathways(worldSize)
  }

  private createBoundaryWalls(worldSize: number): void {
    const halfSize = worldSize / 2
    const wallHeight = 2
    const wallThickness = 0.5
    
    // Wall material - deep purple-blue (darkened 12%)
    const wallMaterial = new THREE.MeshLambertMaterial({
      color: 0x170938,
      emissive: 0x0b041c,
      transparent: true,
      opacity: 0.8
    })

    // Create 4 walls
    const walls = [
      // North wall
      { pos: [0, halfSize, wallHeight/2], size: [worldSize, wallThickness, wallHeight] },
      // South wall  
      { pos: [0, -halfSize, wallHeight/2], size: [worldSize, wallThickness, wallHeight] },
      // East wall
      { pos: [halfSize, 0, wallHeight/2], size: [wallThickness, worldSize, wallHeight] },
      // West wall
      { pos: [-halfSize, 0, wallHeight/2], size: [wallThickness, worldSize, wallHeight] }
    ]

    walls.forEach(wall => {
      const geometry = new THREE.BoxGeometry(wall.size[0], wall.size[1], wall.size[2])
      const mesh = new THREE.Mesh(geometry, wallMaterial)
      mesh.position.set(wall.pos[0], wall.pos[1], wall.pos[2])
      this.scene.add(mesh)
    })
  }

  private createDataParticles(worldSize: number): void {
    const particleCount = 500 // MORE PARTICLES!
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const halfSize = worldSize / 2

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Random positions within world bounds
      positions[i3] = (Math.random() - 0.5) * worldSize * 0.9
      positions[i3 + 1] = (Math.random() - 0.5) * worldSize * 0.9
      positions[i3 + 2] = Math.random() * 5 - 2

      // RAINBOW COLORS! 🌈
      const hue = Math.random()
      const color = new THREE.Color().setHSL(hue, 0.8, 0.7)
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
      
      // Varying sizes
      sizes[i] = Math.random() * 0.2 + 0.05
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: false
    })

    this.backgroundParticles = new THREE.Points(geometry, material)
    this.scene.add(this.backgroundParticles)
  }

  private createNeuralPathways(worldSize: number): void {
    // Create flowing neural pathway lines within bounds - MORE OF THEM!
    const pathwayCount = 12 // Double the pathways!
    const maxRadius = worldSize * 0.4
    
    for (let i = 0; i < pathwayCount; i++) {
      const points: THREE.Vector3[] = []
      const segments = 30 // More segments for smoother curves
      
      for (let j = 0; j <= segments; j++) {
        const t = j / segments
        const angle = (i / pathwayCount) * Math.PI * 2
        const radius = maxRadius * 0.5 + Math.sin(t * Math.PI * 4) * maxRadius * 0.4
        
        points.push(new THREE.Vector3(
          Math.cos(angle + t * 0.8) * radius,
          Math.sin(angle + t * 0.8) * radius,
          Math.sin(t * Math.PI * 6) * 2 // Add Z variation
        ))
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      
      // RAINBOW NEURAL PATHWAYS! 🌈
      const hue = i / pathwayCount
      const color = new THREE.Color().setHSL(hue, 0.8, 0.6)
      
      const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      })
      
      const line = new THREE.Line(geometry, material)
      this.neuralLines.push(line)
      this.scene.add(line)
    }
  }

  // 🔥 SUPER CRAZY EFFECTS METHOD! 🔥
  private setupCrazyEffects(): void {
    // Create data streams flowing across the screen
    this.createDataStreams()
    
    // Create glitch overlay effect
    this.createGlitchEffect()
    
    // Create holographic scanlines
    this.createScanlines()
  }

  private createDataStreams(): void {
    const streamCount = 8
    
    for (let i = 0; i < streamCount; i++) {
      const points: THREE.Vector3[] = []
      const segments = 50
      
      // Create flowing data stream paths
      for (let j = 0; j < segments; j++) {
        const t = j / segments
        const x = -30 + t * 60 // Flow across entire screen
        const y = -20 + (i / streamCount) * 40 + Math.sin(t * Math.PI * 3) * 5
        const z = Math.cos(t * Math.PI * 2) * 1
        
        points.push(new THREE.Vector3(x, y, z))
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const hue = (i / streamCount + 0.5) % 1
      const color = new THREE.Color().setHSL(hue, 1.0, 0.5)
      
      const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      })
      
      const stream = new THREE.Line(geometry, material)
      this.dataStreams.push(stream)
      this.scene.add(stream)
    }
  }

  private createGlitchEffect(): void {
    // Create a subtle glitch overlay
    const geometry = new THREE.PlaneGeometry(100, 100)
    const material = new THREE.MeshBasicMaterial({
      color: 0x00FFFF,
      transparent: true,
      opacity: 0.02,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    })
    
    this.glitchEffect = new THREE.Mesh(geometry, material)
    this.glitchEffect.position.z = -5
    this.scene.add(this.glitchEffect)
  }

  private createScanlines(): void {
    // Create horizontal scanlines for that retro feel - deep purple
    const lineCount = 20
    
    for (let i = 0; i < lineCount; i++) {
      const points = [
        new THREE.Vector3(-50, -25 + (i / lineCount) * 50, 0.1),
        new THREE.Vector3(50, -25 + (i / lineCount) * 50, 0.1)
      ]
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({
        color: 0x1c0738, // darkened 12%
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending
      })
      
      const scanline = new THREE.Line(geometry, material)
      this.scene.add(scanline)
    }
  }

  addToScene(object: THREE.Object3D): void {
    if (!object) {
      console.error('❌ Cannot add null object to scene!')
      return
    }
    
    console.log('➕ Adding object to scene:', {
      type: object.constructor.name,
      position: object.position.clone(),
      visible: object.visible,
      children: object.children.length,
      sceneChildrenBefore: this.scene.children.length
    })
    
    // Ensure object is at z=0 for top-down view
    if (object.position) {
      object.position.z = 0
    }
    
    // Ensure object is visible
    object.visible = true
    
    this.scene.add(object)
    
    console.log('✅ Object added. Scene now has', this.scene.children.length, 'children')
    
    // Verify it was added
    if (!this.scene.children.includes(object)) {
      console.error('❌ WARNING: Object was not added to scene!')
    }
  }

  removeFromScene(object: THREE.Object3D): void {
    this.scene.remove(object)
  }

  update(deltaTime: number): void {
    this.timeOffset += deltaTime
    
    // 🎬 UPDATE SCREEN TRANSITIONS 🎬
    if (this.isTransitioning) {
      this.transitionProgress += deltaTime / this.transitionDuration
      if (this.transitionProgress >= 1) {
        this.transitionProgress = 1
        this.isTransitioning = false
      }
      this.updateTransition(deltaTime)
    }
    
    // 🎬 UPDATE DYNAMIC CAMERA ZOOM 🎬
    this.updateDynamicZoom(deltaTime)
    
    // Update screen shake
    if (this.shakeDuration > 0) {
      this.shakeDuration -= deltaTime
      this.shakeIntensity *= this.shakeDecay
      
      if (this.shakeDuration <= 0) {
        this.shakeIntensity = 0
      }
    }
    
    // Calculate shake offset with EXTRA CHAOS!
    const shakeX = this.shakeIntensity * (Math.random() - 0.5) * 3
    const shakeY = this.shakeIntensity * (Math.random() - 0.5) * 3
    
    // Add chromatic aberration during intense shake
    this.chromaticAberration = this.shakeIntensity * 2
    
    // Smoothly move camera towards target with shake
    this.camera.position.x = THREE.MathUtils.lerp(
      this.camera.position.x, 
      this.cameraTarget.x + shakeX, 
      this.cameraLerpSpeed * deltaTime
    )
    this.camera.position.y = THREE.MathUtils.lerp(
      this.camera.position.y, 
      this.cameraTarget.y + shakeY, 
      this.cameraLerpSpeed * deltaTime
    )
    
    // 🔥 UPDATE ALL THE CRAZY EFFECTS! 🔥
    this.updateCrazyEffects(deltaTime)
    
    // Update SUPER JUICY effects system
    this.effectsSystem.update(deltaTime)
    
    // 🎨🎵 UPDATE AUDIO-VISUAL REACTIVE SYSTEM! 🎵🎨
    this.audioVisualSystem.update(deltaTime)
    
    // Apply screen shake from effects system
    const effectsShake = this.effectsSystem.getScreenShakeAmount()
    if (effectsShake > 0) {
      const effectsShakeX = effectsShake * (Math.random() - 0.5) * 2
      const effectsShakeY = effectsShake * (Math.random() - 0.5) * 2
      this.camera.position.x += effectsShakeX
      this.camera.position.y += effectsShakeY
    }
  }
  
  // 🎨🎵 GET AUDIO-VISUAL SYSTEM - For external access! 🎵🎨
  getAudioVisualSystem(): AudioVisualReactiveSystem {
    return this.audioVisualSystem
  }

  private updateCrazyEffects(deltaTime: number): void {
    const time = this.timeOffset
    
    // 🎨 GET GAMEPLAY INTENSITY - For reactive effects! 🎨
    const intensity = this.audioVisualSystem.getGameplayIntensity()
    const bgColor = this.audioVisualSystem.getCurrentBackgroundColor()
    
    // Animate background particles with AUDIO-REACTIVE movement!
    if (this.backgroundParticles) {
      const positions = this.backgroundParticles.geometry.attributes.position.array as Float32Array
      const colors = this.backgroundParticles.geometry.attributes.color.array as Float32Array
      const particleCount = positions.length / 3
      
      // 🎵 INTENSITY-BOOSTED SWIRLING - More intense when gameplay is hot! 🎵
      const swirlSpeed = 1.0 + intensity * 2.0 // Speed up with intensity
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        
        // Swirling motion - FASTER with intensity!
        positions[i3] += Math.sin(time * 2 * swirlSpeed + i * 0.1) * 0.02 * (1 + intensity)
        positions[i3 + 1] += Math.cos(time * 1.5 * swirlSpeed + i * 0.1) * 0.02 * (1 + intensity)
        positions[i3 + 2] += Math.sin(time * 3 * swirlSpeed + i * 0.05) * 0.01 * (1 + intensity)
        
        // 🎨 COLOR SHIFTING - Reacts to background color! 🎨
        const baseHue = (time * 0.1 + i * 0.01) % 1
        // Blend with background color for reactive effect
        const reactiveColor = new THREE.Color().setHSL(baseHue, 0.8, 0.7)
        reactiveColor.lerp(bgColor, intensity * 0.3) // Blend with background based on intensity
        
        colors[i3] = reactiveColor.r
        colors[i3 + 1] = reactiveColor.g
        colors[i3 + 2] = reactiveColor.b
      }
      
      this.backgroundParticles.geometry.attributes.position.needsUpdate = true
      this.backgroundParticles.geometry.attributes.color.needsUpdate = true
      
      // Rotate the entire particle system - FASTER with intensity!
      this.backgroundParticles.rotation.z += deltaTime * (0.1 + intensity * 0.3)
    }
    
    // 🎨 Animate neural pathways - AUDIO-REACTIVE! 🎨
    for (let i = 0; i < this.neuralLines.length; i++) {
      const line = this.neuralLines[i]
      const material = line.material as THREE.LineBasicMaterial
      
      // 💫 INTENSITY-BOOSTED PULSING - More visible when intense! 💫
      material.opacity = (0.2 + Math.sin(time * 2 + i * 0.5) * 0.3) * (1 + intensity * 0.5)
      
      // 🎨 COLOR SHIFTING - Reacts to background! 🎨
      const baseHue = (time * 0.1 + i * 0.1) % 1
      const reactiveColor = new THREE.Color().setHSL(baseHue, 0.8, 0.6)
      reactiveColor.lerp(bgColor, intensity * 0.4) // Blend with background
      material.color.copy(reactiveColor)
      
      // 🌪️ FASTER ROTATION with intensity! 🌪️
      line.rotation.z += deltaTime * (0.2 + i * 0.05) * (1 + intensity * 1.5)
    }
    
    // 🎵 Animate data streams - AUDIO-REACTIVE! 🎵
    for (let i = 0; i < this.dataStreams.length; i++) {
      const stream = this.dataStreams[i]
      const material = stream.material as THREE.LineBasicMaterial
      
      // 💫 INTENSITY-BOOSTED FLOWING - More visible when intense! 💫
      material.opacity = (0.1 + Math.sin(time * 4 + i * 0.8) * 0.4) * (1 + intensity * 0.6)
      
      // 🎨 COLOR CYCLING - Reacts to background! 🎨
      const baseHue = (time * 0.2 + i * 0.125) % 1
      const reactiveColor = new THREE.Color().setHSL(baseHue, 1.0, 0.5)
      reactiveColor.lerp(bgColor, intensity * 0.3) // Blend with background
      material.color.copy(reactiveColor)
      
      // 🌪️ FASTER MOVEMENT with intensity! 🌪️
      const moveSpeed = 1.0 + intensity * 1.5
      stream.position.x = Math.sin(time * 0.5 * moveSpeed + i) * 2
      stream.position.y = Math.cos(time * 0.3 * moveSpeed + i) * 1
    }
    
    // Animate glitch effect
    if (this.glitchEffect) {
      const material = this.glitchEffect.material as THREE.MeshBasicMaterial
      
      // Random glitch flashes
      if (Math.random() < 0.02) { // 2% chance per frame
        material.opacity = 0.1
        material.color.setHSL(Math.random(), 1.0, 0.5)
      } else {
        material.opacity *= 0.9 // Fade out
      }
      
      // Slight rotation
      this.glitchEffect.rotation.z = Math.sin(time * 5) * 0.01
    }
    
    // Update bloom pulse
    this.bloomPulse = Math.sin(time * 3) * 0.5 + 1
    this.renderer.toneMappingExposure = 1.5 + this.bloomPulse * 0.3
    
    // Update lighting for extra drama
    const lights = this.scene.children.filter(child => child instanceof THREE.PointLight)
    lights.forEach((light, index) => {
      if (light instanceof THREE.PointLight) {
        light.intensity = light.userData.baseIntensity || light.intensity
        light.intensity *= (1 + Math.sin(time * (2 + index) + index) * 0.3)
        
        // Store base intensity for first time
        if (!light.userData.baseIntensity) {
          light.userData.baseIntensity = light.intensity / (1 + Math.sin(time * (2 + index) + index) * 0.3)
        }
      }
    })
  }

  setCameraTarget(position: THREE.Vector3): void {
    this.cameraTarget.set(position.x, position.y, 10) // Keep camera at fixed Z distance
    console.log('📷 Camera target set to:', this.cameraTarget.clone())
  }

  // SUPER JUICY screen shake method with EXTRA EFFECTS! 🔥
  addScreenShake(intensity: number, duration: number): void {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity)
    this.shakeDuration = Math.max(this.shakeDuration, duration)
    
    // Also add to effects system for additional juice
    this.effectsSystem.addScreenShake(intensity, duration)
    
    // Add extra visual effects during intense shakes
    if (intensity > 0.3) {
      // Flash the screen
      if (this.glitchEffect) {
        const material = this.glitchEffect.material as THREE.MeshBasicMaterial
        material.opacity = intensity * 0.3
        material.color.setHSL(Math.random(), 1.0, 0.8)
      }
      
      // Boost lighting intensity
      const lights = this.scene.children.filter(child => child instanceof THREE.PointLight)
      lights.forEach(light => {
        if (light instanceof THREE.PointLight) {
          light.intensity *= (1 + intensity)
        }
      })
      
      // Add chromatic aberration
      this.chromaticAberration += intensity * 3
      
      // Add distortion wave effect
      this.effectsSystem.addDistortionWave(new THREE.Vector3(0, 0, 0), intensity)
    }
  }

  render(): void {
    if (!this.renderer) {
      console.error('❌ Cannot render: renderer is null')
      return
    }
    if (!this.scene) {
      console.error('❌ Cannot render: scene is null')
      return
    }
    if (!this.camera) {
      console.error('❌ Cannot render: camera is null')
      return
    }
    
    // Debug: Log scene info periodically (every 2 seconds)
    if (Math.random() < 0.001) { // More frequent for debugging
      console.log('🎬 Scene render debug:', {
        sceneChildren: this.scene.children.length,
        cameraPosition: this.camera.position.clone(),
        cameraTarget: this.cameraTarget.clone(),
        cameraLeft: this.camera.left,
        cameraRight: this.camera.right,
        cameraTop: this.camera.top,
        cameraBottom: this.camera.bottom,
        cameraNear: this.camera.near,
        cameraFar: this.camera.far
      })
      
      // Count visible objects
      const visibleObjects = this.scene.children.filter(obj => obj.visible)
      console.log('👁️ Visible objects:', visibleObjects.length, 'out of', this.scene.children.length)
      
      // List entity types with positions
      const entityTypes = new Map<string, number>()
      const entityDetails: any[] = []
      this.scene.children.forEach(obj => {
        const type = obj.constructor.name
        entityTypes.set(type, (entityTypes.get(type) || 0) + 1)
        
        // Log details for Mesh objects (entities)
        if (obj instanceof THREE.Mesh) {
          entityDetails.push({
            type: type,
            position: obj.position.clone(),
            visible: obj.visible,
            material: obj.material ? obj.material.constructor.name : 'NO MATERIAL',
            geometry: obj.geometry ? obj.geometry.constructor.name : 'NO GEOMETRY'
          })
        }
      })
      console.log('📊 Scene object types:', Object.fromEntries(entityTypes))
      if (entityDetails.length > 0) {
        console.log('🎯 Entity details:', entityDetails)
      }
    }
    
    try {
      this.renderer.render(this.scene, this.camera)
    } catch (error) {
      console.error('❌ Render error:', error)
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    }
  }

  getCamera(): THREE.OrthographicCamera {
    return this.camera
  }

  getScene(): THREE.Scene {
    return this.scene
  }
  
  // 🎆 GET EFFECTS SYSTEM FOR EXTERNAL ACCESS 🎆
  getEffectsSystem(): EffectsSystem {
    return this.effectsSystem
  }

  // 🚀 GET ZOOM COMPENSATION SCALE - Keeps player ship visually consistent during dynamic zoom! 🚀
  getZoomCompensationScale(): number {
    // When camera zooms out (larger frustum), return larger scale to compensate
    // When camera zooms in (smaller frustum), return smaller scale to compensate
    return this.currentFrustumSize / this.baseFrustumSize
  }

  // 🎬 DYNAMIC ZOOM SYSTEM - Procedural zoom based on gameplay! 🎬
  private updateDynamicZoom(deltaTime: number): void {
    // Calculate gameplay intensity (0-1)
    // Based on: enemy count, combo, audio-visual intensity
    const audioIntensity = this.audioVisualSystem.getGameplayIntensity()
    const enemyIntensity = Math.min(this.enemyCount / 20, 1) // Max at 20 enemies
    const comboIntensity = Math.min(this.comboCount / 15, 1) // Max at 15 combo
    
    // Combined intensity - higher = more zoomed out
    this.gameplayIntensity = Math.max(audioIntensity, enemyIntensity, comboIntensity * 0.7)
    
    // Calculate target zoom - zoom out as intensity increases
    const zoomRange = this.maxZoom - this.minZoom
    this.targetFrustumSize = this.minZoom + (this.gameplayIntensity * zoomRange)
    
    // Smoothly lerp to target zoom
    this.currentFrustumSize = THREE.MathUtils.lerp(
      this.currentFrustumSize,
      this.targetFrustumSize,
      this.zoomLerpSpeed * deltaTime
    )
    
    // Apply zoom to camera
    const aspect = window.innerWidth / window.innerHeight
    this.camera.left = this.currentFrustumSize * aspect / -2
    this.camera.right = this.currentFrustumSize * aspect / 2
    this.camera.top = this.currentFrustumSize / 2
    this.camera.bottom = this.currentFrustumSize / -2
    this.camera.updateProjectionMatrix()
  }

  // 🎬 SET GAMEPLAY DATA FOR ZOOM CALCULATION 🎬
  setGameplayData(enemyCount: number, comboCount: number): void {
    this.enemyCount = enemyCount
    this.comboCount = comboCount
  }

  // 🎬 SCREEN TRANSITION METHODS 🎬
  startTransition(type: 'fade' | 'zoom' | 'slide' | 'particle' = 'fade', duration: number = 0.8): void {
    this.isTransitioning = true
    this.transitionProgress = 0
    this.transitionDuration = duration
    this.transitionType = type
  }

  private updateTransition(deltaTime: number): void {
    const t = this.transitionProgress
    const easeInOut = t < 0.5 
      ? 2 * t * t 
      : 1 - Math.pow(-2 * t + 2, 2) / 2

    switch (this.transitionType) {
      case 'fade':
        // Fade effect via camera exposure
        const fadeAmount = Math.abs(t - 0.5) * 2 // 0 at start/end, 1 at middle
        this.renderer.toneMappingExposure = 1.5 - fadeAmount * 0.8
        break
        
      case 'zoom':
        // Zoom in/out during transition
        const zoomAmount = Math.sin(t * Math.PI) * 0.3
        const tempFrustum = this.currentFrustumSize * (1 - zoomAmount)
        const aspect = window.innerWidth / window.innerHeight
        this.camera.left = tempFrustum * aspect / -2
        this.camera.right = tempFrustum * aspect / 2
        this.camera.top = tempFrustum / 2
        this.camera.bottom = tempFrustum / -2
        this.camera.updateProjectionMatrix()
        break
        
      case 'slide':
        // Slide camera position
        const slideAmount = Math.sin(t * Math.PI) * 5
        this.camera.position.x += slideAmount * deltaTime * 10
        break
        
      case 'particle':
        // Create particle burst during transition
        if (t < 0.1 && Math.random() < 0.3) {
          const burstPos = new THREE.Vector3(
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 40,
            0
          )
          this.effectsSystem.createExplosion(burstPos, 1.0, new THREE.Color().setHSL(Math.random(), 1, 0.7))
        }
        break
    }
  }

  isInTransition(): boolean {
    return this.isTransitioning
  }

  private onWindowResize(): void {
    const aspect = window.innerWidth / window.innerHeight
    
    this.camera.left = this.currentFrustumSize * aspect / -2
    this.camera.right = this.currentFrustumSize * aspect / 2
    this.camera.top = this.currentFrustumSize / 2
    this.camera.bottom = this.currentFrustumSize / -2
    this.camera.updateProjectionMatrix()
    
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}
