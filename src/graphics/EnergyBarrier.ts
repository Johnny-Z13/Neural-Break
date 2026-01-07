import * as THREE from 'three'

/**
 * EnergyBarrier - Circular energy barrier with neon line art style
 * Provides a visual representation of the game world bounds
 */
export class EnergyBarrier {
  private group: THREE.Group
  private rings: THREE.Mesh[] = []
  private spokes: THREE.Mesh[] = []
  private radius: number
  private time: number = 0

  constructor(radius: number) {
    this.radius = radius
    this.group = new THREE.Group()

    // 🌟 CREATE NEON RINGS 🌟
    // We'll create multiple concentric rings for a "layered" neon effect
    this.createRing(radius, 0x00ffff, 0.8, 0.1)      // Main outer cyan ring (thinner)
    this.createRing(radius - 0.2, 0x00ffff, 0.4, 0.05)  // Thinner cyan ring
    this.createRing(radius + 0.3, 0xff00ff, 0.3, 0.1)  // Outer magenta glow ring
    
    // 🌟 CREATE GLITCH RING 🌟
    this.createGlitchRing(radius)
    
    // 🌟 CREATE VECTOR SPOKES 🌟
    this.createSpokes(radius)

    this.group.position.z = -0.5 // Slightly below entities
  }

  private createGlitchRing(radius: number): void {
    const geometry = new THREE.TorusGeometry(radius + 0.5, 0.02, 8, 100)
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    })
    const ring = new THREE.Mesh(geometry, material)
    this.rings.push(ring)
    this.group.add(ring)
  }

  private createRing(radius: number, color: number, opacity: number, width: number): void {
    const geometry = new THREE.RingGeometry(radius, radius + width, 128)
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: opacity,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    
    const ring = new THREE.Mesh(geometry, material)
    this.rings.push(ring)
    this.group.add(ring)
  }

  private createSpokes(radius: number): void {
    const spokeCount = 32
    for (let i = 0; i < spokeCount; i++) {
      const angle = (i / spokeCount) * Math.PI * 2
      const spokeWidth = 0.1
      const spokeLength = 1.5
      
      const geometry = new THREE.PlaneGeometry(spokeWidth, spokeLength)
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
      
      const spoke = new THREE.Mesh(geometry, material)
      
      // Position spoke on the ring edge
      spoke.position.set(
        Math.cos(angle) * (radius + spokeLength / 2),
        Math.sin(angle) * (radius + spokeLength / 2),
        0.01
      )
      
      // Rotate spoke to point outwards
      spoke.rotation.z = angle + Math.PI / 2
      
      this.spokes.push(spoke)
      this.group.add(spoke)
    }
  }

  update(deltaTime: number): void {
    this.time += deltaTime
    
    // 💫 ANIMATE RINGS 💫
    this.rings.forEach((ring, index) => {
      // Pulse opacity
      const material = ring.material as THREE.MeshBasicMaterial
      const pulseSpeed = 2 + index
      material.opacity = (0.3 + Math.sin(this.time * pulseSpeed) * 0.2) * (index === 0 ? 1 : 0.5)
      
      // Rotate rings in opposite directions
      ring.rotation.z += deltaTime * (0.1 * (index % 2 === 0 ? 1 : -1))
      
      // Subtle scale pulse
      const scalePulse = 1 + Math.sin(this.time * 1.5 + index) * 0.01
      ring.scale.setScalar(scalePulse)
    })
    
    // 💫 ANIMATE SPOKES 💫
    this.spokes.forEach((spoke, index) => {
      const material = spoke.material as THREE.MeshBasicMaterial
      
      // Sequential "loading" pulse effect
      const sequentialPulse = Math.sin(this.time * 4 - index * 0.5) * 0.5 + 0.5
      material.opacity = 0.1 + sequentialPulse * 0.4
      
      // Length modulation
      const lengthMod = 1 + sequentialPulse * 0.5
      spoke.scale.y = lengthMod
    })
    
    // Rotate the entire group slowly
    this.group.rotation.z += deltaTime * 0.05
  }

  getMesh(): THREE.Object3D {
    return this.group
  }

  getRadius(): number {
    return this.radius
  }
}
