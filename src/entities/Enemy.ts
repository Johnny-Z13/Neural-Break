import * as THREE from 'three'
import { Player } from './Player'

export abstract class Enemy {
  protected mesh: THREE.Mesh
  protected position: THREE.Vector3
  protected velocity: THREE.Vector3
  protected health: number
  protected maxHealth: number
  protected speed: number
  protected damage: number
  protected xpValue: number
  protected radius: number
  protected alive: boolean = true

  constructor(x: number, y: number) {
    this.position = new THREE.Vector3(x, y, 0)
    this.velocity = new THREE.Vector3(0, 0, 0)
  }

  abstract initialize(): void
  abstract updateAI(deltaTime: number, player: Player): void

  update(deltaTime: number, player: Player): void {
    if (!this.alive) return

    this.updateAI(deltaTime, player)
    
    // Update position
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime))
    this.mesh.position.copy(this.position)

    // Update visual effects
    this.updateVisuals(deltaTime)
  }

  protected updateVisuals(deltaTime: number): void {
    // Default pulsing effect
    const pulse = Math.sin(Date.now() * 0.005) * 0.1 + 1
    this.mesh.scale.setScalar(pulse)
  }

  takeDamage(damage: number): void {
    this.health -= damage
    
    // Visual feedback
    const material = this.mesh.material as THREE.MeshLambertMaterial
    const originalColor = material.color.clone()
    material.color.setHex(0xFFFFFF)
    
    setTimeout(() => {
      material.color.copy(originalColor)
    }, 50)

    if (this.health <= 0) {
      this.alive = false
    }
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

  getHealth(): number {
    return this.health
  }

  getDamage(): number {
    return this.damage
  }

  getXPValue(): number {
    return this.xpValue
  }

  getRadius(): number {
    return this.radius
  }

  isAlive(): boolean {
    return this.alive
  }
}

export class DataMite extends Enemy {
  constructor(x: number, y: number) {
    super(x, y)
    this.health = 1
    this.maxHealth = 1
    this.speed = 2
    this.damage = 5
    this.xpValue = 1
    this.radius = 0.2
  }

  initialize(): void {
    // Small red pixel appearance - made twice as big
    const geometry = new THREE.SphereGeometry(0.2, 8, 8)
    const material = new THREE.MeshLambertMaterial({
      color: 0xFF3300,
      emissive: 0x330000,
      transparent: true,
      opacity: 0.9
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.copy(this.position)
  }

  updateAI(deltaTime: number, player: Player): void {
    // Simple pathfinding toward player
    const playerPos = player.getPosition()
    const direction = playerPos.sub(this.position).normalize()
    
    this.velocity = direction.multiplyScalar(this.speed)
  }

  protected updateVisuals(deltaTime: number): void {
    // Faster pulsing for mites
    const pulse = Math.sin(Date.now() * 0.01) * 0.2 + 1
    this.mesh.scale.setScalar(pulse)
    
    // Slight rotation
    this.mesh.rotation.x += deltaTime * 2
    this.mesh.rotation.y += deltaTime * 3
  }
}

export class ScanDrone extends Enemy {
  private scanBeamMesh: THREE.Mesh
  private alertState: boolean = false
  private patrolTarget: THREE.Vector3
  private patrolRadius: number = 3

  constructor(x: number, y: number) {
    super(x, y)
    this.health = 3
    this.maxHealth = 3
    this.speed = 1.5
    this.damage = 8
    this.xpValue = 3
    this.radius = 0.4
    this.patrolTarget = new THREE.Vector3(x, y, 0)
  }

  initialize(): void {
    // Triangular drone appearance - made twice as big
    const geometry = new THREE.ConeGeometry(0.4, 0.8, 3)
    const material = new THREE.MeshLambertMaterial({
      color: 0xFF6600,
      emissive: 0x331100,
      transparent: true,
      opacity: 0.8
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.copy(this.position)

    // Create scan beam - made bigger to match drone size
    const beamGeometry = new THREE.ConeGeometry(0.1, 3, 8)
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF0000,
      transparent: true,
      opacity: 0.3
    })
    this.scanBeamMesh = new THREE.Mesh(beamGeometry, beamMaterial)
    this.scanBeamMesh.rotation.x = Math.PI / 2
    this.mesh.add(this.scanBeamMesh)
  }

  updateAI(deltaTime: number, player: Player): void {
    const playerPos = player.getPosition()
    const distanceToPlayer = this.position.distanceTo(playerPos)

    // Check if player is within scan range
    if (distanceToPlayer < 4) {
      this.alertState = true
    }

    if (this.alertState) {
      // Chase player when alerted
      const direction = playerPos.sub(this.position).normalize()
      this.velocity = direction.multiplyScalar(this.speed * 2)
      
      // Increase scan beam intensity
      const beamMaterial = this.scanBeamMesh.material as THREE.MeshBasicMaterial
      beamMaterial.opacity = 0.6
    } else {
      // Patrol behavior
      const distanceToPatrol = this.position.distanceTo(this.patrolTarget)
      
      if (distanceToPatrol < 0.5) {
        // Choose new patrol target
        this.patrolTarget = new THREE.Vector3(
          this.position.x + (Math.random() - 0.5) * this.patrolRadius * 2,
          this.position.y + (Math.random() - 0.5) * this.patrolRadius * 2,
          0
        )
      }
      
      const direction = this.patrolTarget.clone().sub(this.position).normalize()
      this.velocity = direction.multiplyScalar(this.speed)
    }
  }

  protected updateVisuals(deltaTime: number): void {
    // Rotate the scanner beam
    this.scanBeamMesh.rotation.z += deltaTime * 2
    
    // Pulse based on alert state
    const pulseSpeed = this.alertState ? 0.02 : 0.005
    const pulse = Math.sin(Date.now() * pulseSpeed) * 0.1 + 1
    this.mesh.scale.setScalar(pulse)
  }
}
