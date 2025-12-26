import * as THREE from 'three'
import { EffectsSystem } from '../graphics/EffectsSystem'

/**
 * Enemy Projectile - Red/orange projectiles fired by enemies
 */
export class EnemyProjectile {
  private mesh: THREE.Mesh
  private position: THREE.Vector3
  private velocity: THREE.Vector3
  private damage: number
  private lifeTime: number = 5.0 // 5 seconds max life
  private radius: number = 0.08 // Slightly larger than player projectiles
  private alive: boolean = true
  private effectsSystem: EffectsSystem | null = null
  private trailTimer: number = 0
  private trailInterval: number = 0.05

  constructor(startPos: THREE.Vector3, direction: THREE.Vector3, speed: number, damage: number) {
    this.position = startPos.clone()
    this.velocity = direction.normalize().multiplyScalar(speed)
    this.damage = damage
    
    this.createMesh()
  }

  private createMesh(): void {
    // 🔴 ENEMY PROJECTILE - RED/ORANGE DANGER COLOR! 🔴
    const geometry = new THREE.SphereGeometry(this.radius, 12, 12)
    const material = new THREE.MeshBasicMaterial({
      color: 0xFF4400, // Red-orange
      emissive: 0xFF2200, // Bright red glow
      transparent: true,
      opacity: 0.95
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.copy(this.position)
    
    // 🔥 OUTER GLOW - Danger aura! 🔥
    const glowGeometry = new THREE.SphereGeometry(this.radius * 1.5, 8, 8)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF0000,
      transparent: true,
      opacity: 0.4,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    this.mesh.add(glow)
  }

  update(deltaTime: number): void {
    if (!this.alive) return

    // Update position
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime))
    this.mesh.position.copy(this.position)

    // Update lifetime
    this.lifeTime -= deltaTime
    if (this.lifeTime <= 0) {
      this.destroy()
    }

    // Create trail effects
    this.updateTrail(deltaTime)

    // Update visuals
    this.updateVisuals(deltaTime)
  }

  private updateTrail(deltaTime: number): void {
    if (!this.effectsSystem) return

    this.trailTimer += deltaTime
    if (this.trailTimer >= this.trailInterval) {
      const trailVelocity = this.velocity.clone().multiplyScalar(-0.2)
      const trailColor = new THREE.Color(0xFF4400)
      this.effectsSystem.createSparkle(this.position, trailVelocity, trailColor, 0.3)
      this.trailTimer = 0
    }
  }

  private updateVisuals(deltaTime: number): void {
    // Rotate projectile
    this.mesh.rotation.x += deltaTime * 5
    this.mesh.rotation.y += deltaTime * 3

    // Pulsing glow
    const pulse = Math.sin(Date.now() * 0.01) * 0.1 + 1
    if (this.mesh.children[0]) {
      const glow = this.mesh.children[0] as THREE.Mesh
      glow.scale.setScalar(pulse)
    }
  }

  destroy(): void {
    this.alive = false
    
    // Create destruction effect
    if (this.effectsSystem) {
      this.effectsSystem.createExplosion(this.position, 0.5, new THREE.Color(0xFF4400))
    }
  }

  isCollidingWith(other: { getPosition(): THREE.Vector3, getRadius(): number }): boolean {
    const distance = this.position.distanceTo(other.getPosition())
    return distance < (this.radius + other.getRadius())
  }

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

  setEffectsSystem(effectsSystem: EffectsSystem): void {
    this.effectsSystem = effectsSystem
  }
}

