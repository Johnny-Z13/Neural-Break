export class InputManager {
  private keys: Set<string> = new Set()
  private mousePosition = { x: 0, y: 0 }
  private isMouseDown = false

  initialize(): void {
    // Keyboard events
    document.addEventListener('keydown', (e) => this.onKeyDown(e))
    document.addEventListener('keyup', (e) => this.onKeyUp(e))
    
    // Mouse events
    document.addEventListener('mousemove', (e) => this.onMouseMove(e))
    document.addEventListener('mousedown', (e) => this.onMouseDown(e))
    document.addEventListener('mouseup', (e) => this.onMouseUp(e))
    
    // Prevent context menu on right click
    document.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  private onKeyDown(event: KeyboardEvent): void {
    this.keys.add(event.code.toLowerCase())
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.keys.delete(event.code.toLowerCase())
  }

  private onMouseMove(event: MouseEvent): void {
    this.mousePosition.x = event.clientX
    this.mousePosition.y = event.clientY
  }

  private onMouseDown(event: MouseEvent): void {
    this.isMouseDown = true
  }

  private onMouseUp(event: MouseEvent): void {
    this.isMouseDown = false
  }

  // Movement input methods
  isMovingUp(): boolean {
    return this.keys.has('keyw')
  }

  isMovingDown(): boolean {
    return this.keys.has('keys')
  }

  isMovingLeft(): boolean {
    return this.keys.has('keya')
  }

  isMovingRight(): boolean {
    return this.keys.has('keyd')
  }

  isDashing(): boolean {
    return this.keys.has('shiftleft') || this.keys.has('shiftright')
  }

  isFiring(): boolean {
    return this.keys.has('space')
  }

  // Get movement vector
  getMovementVector(): { x: number, y: number } {
    let x = 0
    let y = 0

    if (this.isMovingLeft()) x -= 1
    if (this.isMovingRight()) x += 1
    if (this.isMovingDown()) y -= 1
    if (this.isMovingUp()) y += 1

    // Normalize diagonal movement
    if (x !== 0 && y !== 0) {
      const length = Math.sqrt(x * x + y * y)
      x /= length
      y /= length
    }

    return { x, y }
  }

  getMousePosition(): { x: number, y: number } {
    return { ...this.mousePosition }
  }

  isMousePressed(): boolean {
    return this.isMouseDown
  }
}
