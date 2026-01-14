import * as THREE from 'three'

export class Invulnerable {
  private mesh!: THREE.Mesh
  private position: THREE.Vector3
  private rotationSpeed: number = 2.0
  private pulseTime: number = 0
  private alive: boolean = true
  private floatOffset: number = 0

  constructor(x: number, y: number) {
    this.position = new THREE.Vector3(x, y, 0)
    this.initialize()
  }

  private initialize(): void {
    // 🌟 INVULNERABLE PICKUP - RICH EMERALD star with rotating rings! 🌟
    const group = new THREE.Group()
    
    // === MAIN STAR - Rich emerald glowing core ===
    const starShape = this.createStarShape(0.5, 0.25, 5)
    const starGeometry = new THREE.ShapeGeometry(starShape)
    const starMaterial = new THREE.MeshBasicMaterial({
      color: 0x22FF44, // RICH EMERALD
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    })
    const star = new THREE.Mesh(starGeometry, starMaterial)
    group.add(star)
    
    // === INNER GLOW - Bright emerald-white center ===
    const innerGlowGeometry = new THREE.CircleGeometry(0.2, 16)
    const innerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xAAFFBB, // LIGHT EMERALD WHITE
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    })
    const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial)
    innerGlow.position.z = 0.01
    group.add(innerGlow)
    
    // === OUTER RING 1 - Rotating slowly ===
    const ring1Geometry = new THREE.RingGeometry(0.6, 0.7, 32)
    const ring1Material = new THREE.MeshBasicMaterial({
      color: 0x22DD44, // RICH EMERALD
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
    const ring1 = new THREE.Mesh(ring1Geometry, ring1Material)
    ring1.position.z = 0.02
    group.add(ring1)
    
    // === OUTER RING 2 - Counter-rotating ===
    const ring2Geometry = new THREE.RingGeometry(0.75, 0.82, 32)
    const ring2Material = new THREE.MeshBasicMaterial({
      color: 0x55FF77, // BRIGHT EMERALD
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
    const ring2 = new THREE.Mesh(ring2Geometry, ring2Material)
    ring2.position.z = 0.03
    group.add(ring2)
    
    // === PARTICLE RING - Small dots orbiting ===
    const particleCount = 12
    const particleGeometry = new THREE.CircleGeometry(0.08, 8)
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0x77FF99, // LIGHT EMERALD particles
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    })
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone())
      const angle = (i / particleCount) * Math.PI * 2
      particle.position.set(
        Math.cos(angle) * 0.9,
        Math.sin(angle) * 0.9,
        0.04
      )
      group.add(particle)
    }
    
    // === OUTER GLOW - Large soft halo ===
    const outerGlowGeometry = new THREE.CircleGeometry(1.2, 32)
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x33EE55, // BRIGHT EMERALD halo
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    })
    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial)
    outerGlow.position.z = -0.01
    group.add(outerGlow)
    
    // Create mesh from group
    this.mesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial())
    this.mesh.add(group)
    this.mesh.position.copy(this.position)
  }
  
  private createStarShape(outerRadius: number, innerRadius: number, points: number): THREE.Shape {
    const shape = new THREE.Shape()
    
    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      
      if (i === 0) {
        shape.moveTo(x, y)
      } else {
        shape.lineTo(x, y)
      }
    }
    
    shape.closePath()
    return shape
  }

  update(deltaTime: number): void {
    if (!this.alive) return
    
    this.pulseTime += deltaTime
    this.floatOffset += deltaTime
    
    // === FLOATING MOTION - Bob up and down ===
    const floatAmount = Math.sin(this.floatOffset * 2) * 0.15
    this.mesh.position.y = this.position.y + floatAmount
    
    // === ANIMATE MAIN STAR - Rotate and pulse ===
    const star = this.mesh.children[0].children[0] as THREE.Mesh
    if (star) {
      star.rotation.z += deltaTime * this.rotationSpeed
      const pulse = 1 + Math.sin(this.pulseTime * 5) * 0.2
      star.scale.setScalar(pulse)
      
      const material = star.material as THREE.MeshBasicMaterial
      material.opacity = 0.8 + Math.sin(this.pulseTime * 6) * 0.2
    }
    
    // === ANIMATE INNER GLOW - Pulsing bright center ===
    const innerGlow = this.mesh.children[0].children[1] as THREE.Mesh
    if (innerGlow) {
      const glowPulse = 1 + Math.sin(this.pulseTime * 8) * 0.4
      innerGlow.scale.setScalar(glowPulse)
      
      const material = innerGlow.material as THREE.MeshBasicMaterial
      material.opacity = 0.6 + Math.sin(this.pulseTime * 10) * 0.3
    }
    
    // === ANIMATE RING 1 - Slow rotation ===
    const ring1 = this.mesh.children[0].children[2] as THREE.Mesh
    if (ring1) {
      ring1.rotation.z += deltaTime * 1.5
      
      const material = ring1.material as THREE.MeshBasicMaterial
      material.opacity = 0.5 + Math.sin(this.pulseTime * 4) * 0.2
    }
    
    // === ANIMATE RING 2 - Counter-rotate faster ===
    const ring2 = this.mesh.children[0].children[3] as THREE.Mesh
    if (ring2) {
      ring2.rotation.z -= deltaTime * 2.5
      
      const material = ring2.material as THREE.MeshBasicMaterial
      material.opacity = 0.4 + Math.sin(this.pulseTime * 5) * 0.2
    }
    
    // === ANIMATE PARTICLE RING - Orbit around center ===
    for (let i = 4; i < 16; i++) { // 12 particles (indices 4-15)
      const particle = this.mesh.children[0].children[i] as THREE.Mesh
      if (particle) {
        const angle = ((i - 4) / 12) * Math.PI * 2 + this.pulseTime * 3
        particle.position.x = Math.cos(angle) * 0.9
        particle.position.y = Math.sin(angle) * 0.9
        
        const material = particle.material as THREE.MeshBasicMaterial
        material.opacity = 0.6 + Math.sin(this.pulseTime * 8 + i) * 0.3
      }
    }
    
    // === ANIMATE OUTER GLOW - Breathing effect ===
    const outerGlow = this.mesh.children[0].children[16] as THREE.Mesh
    if (outerGlow) {
      const glowScale = 1 + Math.sin(this.pulseTime * 3) * 0.3
      outerGlow.scale.setScalar(glowScale)
      
      const material = outerGlow.material as THREE.MeshBasicMaterial
      material.opacity = 0.15 + Math.sin(this.pulseTime * 4) * 0.1
    }
  }

  destroy(): void {
    this.alive = false
    // Dispose geometries and materials
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose())
        } else {
          child.material.dispose()
        }
      }
    })
  }

  // Getters
  getMesh(): THREE.Mesh {
    return this.mesh
  }

  getPosition(): THREE.Vector3 {
    return this.position.clone()
  }

  isAlive(): boolean {
    return this.alive
  }

  setAlive(alive: boolean): void {
    this.alive = alive
  }

  getRadius(): number {
    return 0.8 // Collision radius
  }
}

