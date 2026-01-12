/**
 * 🚧 ROGUE SIDE BARRIERS 🚧
 * Vertical energy walls that define the left and right boundaries in Rogue mode
 * Uses the same neon aesthetic as the circular energy barrier
 */
import * as THREE from 'three'

export class RogueSideBarriers {
  private leftWall: THREE.Group
  private rightWall: THREE.Group
  private width: number // Distance from center to each wall
  private height: number = 100 // Height of the walls (will scroll with camera)
  private time: number = 0

  constructor(width: number) {
    this.width = width
    this.leftWall = new THREE.Group()
    this.rightWall = new THREE.Group()

    this.createWall(this.leftWall, -width)
    this.createWall(this.rightWall, width)
  }

  private createWall(wallGroup: THREE.Group, xPosition: number): void {
    // Main vertical line
    const mainLineGeometry = new THREE.PlaneGeometry(0.2, this.height)
    const mainLineMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const mainLine = new THREE.Mesh(mainLineGeometry, mainLineMaterial)
    mainLine.position.x = xPosition
    wallGroup.add(mainLine)

    // Outer glow line
    const glowLineGeometry = new THREE.PlaneGeometry(0.4, this.height)
    const glowLineMaterial = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const glowLine = new THREE.Mesh(glowLineGeometry, glowLineMaterial)
    glowLine.position.x = xPosition
    glowLine.position.z = -0.1
    wallGroup.add(glowLine)

    // Horizontal spokes (like the circular barrier)
    const spokeCount = 20
    for (let i = 0; i < spokeCount; i++) {
      const yPosition = (i / spokeCount) * this.height - this.height / 2
      const spokeLength = 1.5
      const spokeWidth = 0.1
      
      const spokeGeometry = new THREE.PlaneGeometry(spokeLength, spokeWidth)
      const spokeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
      
      const spoke = new THREE.Mesh(spokeGeometry, spokeMaterial)
      spoke.position.set(xPosition, yPosition, 0.01)
      wallGroup.add(spoke)
    }

    wallGroup.position.z = -0.5 // Slightly below entities
  }

  update(deltaTime: number, cameraY: number): void {
    this.time += deltaTime

    // Update wall positions to follow camera
    this.leftWall.position.y = cameraY
    this.rightWall.position.y = cameraY

    // Animate opacity pulse
    const pulse = 0.6 + Math.sin(this.time * 2) * 0.2

    this.leftWall.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshBasicMaterial
        if (index === 0) { // Main line
          material.opacity = pulse * 0.8
        } else if (index === 1) { // Glow line
          material.opacity = pulse * 0.3
        } else { // Spokes
          material.opacity = pulse * 0.3
        }
      }
    })

    this.rightWall.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshBasicMaterial
        if (index === 0) { // Main line
          material.opacity = pulse * 0.8
        } else if (index === 1) { // Glow line
          material.opacity = pulse * 0.3
        } else { // Spokes
          material.opacity = pulse * 0.3
        }
      }
    })
  }

  getLeftWall(): THREE.Group {
    return this.leftWall
  }

  getRightWall(): THREE.Group {
    return this.rightWall
  }

  getWidth(): number {
    return this.width
  }

  // Check if a point is outside the boundaries
  isOutOfBounds(point: THREE.Vector3, playerRadius: number = 0.5): { isOut: boolean; side: 'left' | 'right' | null } {
    // Account for player radius - stop them BEFORE they hit the wall
    const effectiveWidth = this.width - playerRadius
    
    if (point.x < -effectiveWidth) {
      return { isOut: true, side: 'left' }
    } else if (point.x > effectiveWidth) {
      return { isOut: true, side: 'right' }
    }
    return { isOut: false, side: null }
  }

  // Clamp a position to within the boundaries
  clampPosition(point: THREE.Vector3, playerRadius: number = 0.5): THREE.Vector3 {
    // Account for player radius - keep them away from the wall
    const effectiveWidth = this.width - playerRadius
    
    return new THREE.Vector3(
      Math.max(-effectiveWidth, Math.min(effectiveWidth, point.x)),
      point.y,
      point.z
    )
  }

  destroy(): void {
    // Clean up geometries and materials
    const cleanupGroup = (group: THREE.Group) => {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose()
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose())
            } else {
              child.material.dispose()
            }
          }
        }
      })
    }

    cleanupGroup(this.leftWall)
    cleanupGroup(this.rightWall)
  }
}
