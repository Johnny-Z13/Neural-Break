import * as THREE from 'three'

export class SceneManager {
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private renderer: THREE.WebGLRenderer
  private canvas: HTMLCanvasElement
  private cameraTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
  private cameraLerpSpeed: number = 5.0

  constructor() {
    // Get canvas element
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement
    if (!this.canvas) {
      throw new Error('Canvas element not found')
    }
  }

  async initialize(): Promise<void> {
    // Create scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x000011) // Dark blue background

    // Create orthographic camera for top-down view
    const aspect = window.innerWidth / window.innerHeight
    const frustumSize = 20
    this.camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    )
    this.camera.position.set(0, 0, 10)
    this.camera.lookAt(0, 0, 0)

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas,
      antialias: true,
      alpha: false
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2

    // Add cyberpunk lighting
    this.setupLighting()
    
    // Add neural network background
    this.setupBackground()

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize())
  }

  private setupLighting(): void {
    // Ambient light with cyan tint
    const ambientLight = new THREE.AmbientLight(0x004466, 0.3)
    this.scene.add(ambientLight)

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0x00FFFF, 1)
    directionalLight.position.set(0, 0, 5)
    this.scene.add(directionalLight)

    // Add some atmospheric point lights
    const pointLight1 = new THREE.PointLight(0x00FFFF, 0.5, 50)
    pointLight1.position.set(10, 10, 2)
    this.scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x0066FF, 0.3, 30)
    pointLight2.position.set(-8, -5, 2)
    this.scene.add(pointLight2)
  }

  private setupBackground(): void {
    // Create bounded world - 9 screen spaces (3x3 grid)
    // Each screen is roughly 20x20 units, so total world is 60x60
    const worldSize = 60
    
    // Create floor grid within bounds
    const gridHelper = new THREE.GridHelper(worldSize, 30, 0x003366, 0x001133)
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
    
    // Wall material
    const wallMaterial = new THREE.MeshLambertMaterial({
      color: 0x003366,
      emissive: 0x001122,
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
    const particleCount = 200
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const halfSize = worldSize / 2

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Random positions within world bounds
      positions[i3] = (Math.random() - 0.5) * worldSize * 0.9
      positions[i3 + 1] = (Math.random() - 0.5) * worldSize * 0.9
      positions[i3 + 2] = Math.random() * 5 - 2

      // Cyan color variations
      colors[i3] = 0 // R
      colors[i3 + 1] = Math.random() * 0.5 + 0.5 // G
      colors[i3 + 2] = 1 // B
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })

    const particles = new THREE.Points(geometry, material)
    this.scene.add(particles)

    // Animate particles
    const animateParticles = () => {
      const positions = particles.geometry.attributes.position.array as Float32Array
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        positions[i3] += Math.sin(Date.now() * 0.001 + i) * 0.01
        positions[i3 + 1] += Math.cos(Date.now() * 0.001 + i) * 0.01
      }
      
      particles.geometry.attributes.position.needsUpdate = true
      requestAnimationFrame(animateParticles)
    }
    animateParticles()
  }

  private createNeuralPathways(worldSize: number): void {
    // Create flowing neural pathway lines within bounds
    const pathwayCount = 6
    const maxRadius = worldSize * 0.3
    
    for (let i = 0; i < pathwayCount; i++) {
      const points = []
      const segments = 20
      
      for (let j = 0; j <= segments; j++) {
        const t = j / segments
        const angle = (i / pathwayCount) * Math.PI * 2
        const radius = maxRadius * 0.5 + Math.sin(t * Math.PI * 3) * maxRadius * 0.3
        
        points.push(new THREE.Vector3(
          Math.cos(angle + t * 0.5) * radius,
          Math.sin(angle + t * 0.5) * radius,
          0
        ))
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({
        color: 0x00FFFF,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
      })
      
      const line = new THREE.Line(geometry, material)
      this.scene.add(line)
    }
  }

  addToScene(object: THREE.Object3D): void {
    this.scene.add(object)
  }

  removeFromScene(object: THREE.Object3D): void {
    this.scene.remove(object)
  }

  update(deltaTime: number): void {
    // Smoothly move camera towards target
    this.camera.position.x = THREE.MathUtils.lerp(
      this.camera.position.x, 
      this.cameraTarget.x, 
      this.cameraLerpSpeed * deltaTime
    )
    this.camera.position.y = THREE.MathUtils.lerp(
      this.camera.position.y, 
      this.cameraTarget.y, 
      this.cameraLerpSpeed * deltaTime
    )
  }

  setCameraTarget(position: THREE.Vector3): void {
    this.cameraTarget.copy(position)
    this.cameraTarget.z = 10 // Keep camera at fixed Z distance
  }

  render(): void {
    this.renderer.render(this.scene, this.camera)
  }

  getCamera(): THREE.OrthographicCamera {
    return this.camera
  }

  getScene(): THREE.Scene {
    return this.scene
  }

  private onWindowResize(): void {
    const aspect = window.innerWidth / window.innerHeight
    const frustumSize = 20
    
    this.camera.left = frustumSize * aspect / -2
    this.camera.right = frustumSize * aspect / 2
    this.camera.top = frustumSize / 2
    this.camera.bottom = frustumSize / -2
    this.camera.updateProjectionMatrix()
    
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}
