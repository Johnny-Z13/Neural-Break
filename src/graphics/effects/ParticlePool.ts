import * as THREE from 'three'

/**
 * Base particle class for all particle effects
 */
export class Particle {
  active: boolean = false
  position: THREE.Vector3 = new THREE.Vector3()
  velocity: THREE.Vector3 = new THREE.Vector3()
  color: THREE.Color = new THREE.Color()
  life: number = 0
  maxLife: number = 1
  size: number = 1
  opacity: number = 1
  gravity: number = -2

  reset(position: THREE.Vector3, velocity: THREE.Vector3, color: THREE.Color, life: number): void {
    this.active = true
    this.position.copy(position)
    this.velocity.copy(velocity)
    this.color.copy(color)
    this.life = life
    this.maxLife = life
    this.size = 1
    this.opacity = 1
  }

  update(deltaTime: number): void {
    if (!this.active) return
    
    this.life -= deltaTime
    
    if (this.life <= 0) {
      this.active = false
      return
    }
    
    // Update position
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime))
    
    // Apply gravity
    this.velocity.z += this.gravity * deltaTime
    
    // Apply drag
    this.velocity.multiplyScalar(0.98)
    
    // Update opacity based on life
    this.opacity = this.life / this.maxLife
  }
}

/**
 * Base effect class for complex effects
 */
export abstract class Effect {
  protected alive: boolean = true
  protected duration: number
  protected elapsed: number = 0

  constructor(duration: number) {
    this.duration = duration
  }

  abstract update(deltaTime: number): void

  isAlive(): boolean {
    return this.alive && this.elapsed < this.duration
  }
}

/**
 * Particle Pool for efficient particle management
 */
export class ParticlePool {
  private particles: Particle[] = []
  private particleSystem: THREE.Points
  private geometry: THREE.BufferGeometry
  private material: THREE.PointsMaterial
  private positions: Float32Array
  private colors: Float32Array
  private sizes: Float32Array
  private activeCount: number = 0
  private poolSize: number

  constructor(poolSize: number, effectType: string) {
    this.poolSize = poolSize
    
    // Initialize geometry
    this.positions = new Float32Array(poolSize * 3)
    this.colors = new Float32Array(poolSize * 3)
    this.sizes = new Float32Array(poolSize)
    
    this.geometry = new THREE.BufferGeometry()
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3))
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1))
    
    // Create material based on effect type
    // NOTE: Lower opacity (0.5) prevents additive blending from causing white-out
    this.material = new THREE.PointsMaterial({
      size: this.getBaseSize(effectType),
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: false
    })
    
    this.particleSystem = new THREE.Points(this.geometry, this.material)
    
    // Initialize particles
    for (let i = 0; i < poolSize; i++) {
      this.particles.push(new Particle())
    }
  }
  
  private getBaseSize(effectType: string): number {
    switch (effectType) {
      case 'explosion': return 0.3
      case 'spark': return 0.15
      case 'trail': return 0.1
      case 'death': return 0.4
      case 'impact': return 0.2
      case 'electric': return 0.25
      default: return 0.2
    }
  }

  emit(position: THREE.Vector3, velocity: THREE.Vector3, color: THREE.Color, life: number): void {
    // Find inactive particle - limit search to prevent performance issues
    const maxSearch = Math.min(this.poolSize, this.activeCount + 50)
    for (let i = 0; i < maxSearch; i++) {
      if (!this.particles[i].active) {
        this.particles[i].reset(position, velocity, color, life)
        if (i >= this.activeCount) {
          this.activeCount = i + 1
        }
        return // Exit early when found
      }
    }
    // If pool is exhausted, silently fail (don't spawn particle)
  }

  update(deltaTime: number): void {
    let newActiveCount = 0
    
    for (let i = 0; i < this.activeCount; i++) {
      const particle = this.particles[i]
      
      if (particle.active) {
        particle.update(deltaTime)
        
        const i3 = i * 3
        this.positions[i3] = particle.position.x
        this.positions[i3 + 1] = particle.position.y
        this.positions[i3 + 2] = particle.position.z
        
        this.colors[i3] = particle.color.r
        this.colors[i3 + 1] = particle.color.g
        this.colors[i3 + 2] = particle.color.b
        
        this.sizes[i] = particle.size * particle.opacity
        
        newActiveCount = Math.max(newActiveCount, i + 1)
      } else {
        // Hide inactive particles
        this.sizes[i] = 0
      }
    }
    
    this.activeCount = newActiveCount
    
    // Update geometry
    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.color.needsUpdate = true
    this.geometry.attributes.size.needsUpdate = true
    
    // Update draw range for performance
    this.geometry.setDrawRange(0, this.activeCount)
  }

  getParticleSystem(): THREE.Points {
    return this.particleSystem
  }
}

