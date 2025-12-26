import * as THREE from 'three'

export class Projectile {
  private mesh: THREE.Mesh
  private position: THREE.Vector3
  private velocity: THREE.Vector3
  private damage: number
  private lifeTime: number = 3.0 // 3 seconds max life
  private radius: number = 0.05
  private alive: boolean = true

  constructor(startPos: THREE.Vector3, direction: THREE.Vector3, speed: number, damage: number) {
    this.position = startPos.clone()
    this.velocity = direction.normalize().multiplyScalar(speed)
    this.damage = damage
    
    this.createMesh()
  }

  private createMesh(): void {
    // Create glowing projectile
    const geometry = new THREE.SphereGeometry(this.radius, 8, 8)
    const material = new THREE.MeshBasicMaterial({
      color: 0x00FFFF,
      emissive: 0x00FFFF,
      transparent: true,
      opacity: 0.8
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.copy(this.position)

    // Add trail effect
    this.createTrail()
  }

  private createTrail(): void {
    const trailGeometry = new THREE.SphereGeometry(this.radius * 1.5, 6, 6)
    const trailMaterial = new THREE.MeshBasicMaterial({
      color: 0x0066FF,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    })

    const trail = new THREE.Mesh(trailGeometry, trailMaterial)
    this.mesh.add(trail)
  }

  update(deltaTime: number): void {
    if (!this.alive) return

    // Update position
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime))
    this.mesh.position.copy(this.position)

    // Update lifetime
    this.lifeTime -= deltaTime
    if (this.lifeTime <= 0) {
      this.alive = false
    }

    // Fade out as lifetime decreases
    const material = this.mesh.material as THREE.MeshBasicMaterial
    material.opacity = Math.max(0.2, this.lifeTime / 3.0)

    // Visual effects
    this.mesh.rotation.x += deltaTime * 10
    this.mesh.rotation.y += deltaTime * 15
  }

  destroy(): void {
    this.alive = false
  }

  // Collision detection
  isCollidingWith(other: { getPosition(): THREE.Vector3, getRadius(): number }): boolean {
    const distance = this.position.distanceTo(other.getPosition())
    return distance < (this.radius + other.getRadius())
  }

  // Getters
  getMesh(): THREE.Mesh {
    return this.mesh
  }

  getPosition(): THREE.Vector3 {
    return this.position.clone()
  }

  getDamage(): number {
    return this.damage
  }

  getRadius(): number {
    return this.radius
  }

  isAlive(): boolean {
    return this.alive
  }
}
