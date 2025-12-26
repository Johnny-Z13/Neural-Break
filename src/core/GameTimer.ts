export class GameTimer {
  private totalTime: number
  private elapsedTime: number = 0
  private isRunning: boolean = false

  constructor(totalTimeInSeconds: number) {
    this.totalTime = totalTimeInSeconds
  }

  start(): void {
    this.isRunning = true
    this.elapsedTime = 0
  }

  stop(): void {
    this.isRunning = false
  }

  update(deltaTime: number): void {
    if (this.isRunning) {
      this.elapsedTime += deltaTime
    }
  }

  getElapsedTime(): number {
    return this.elapsedTime
  }

  getRemainingTime(): number {
    return Math.max(0, this.totalTime - this.elapsedTime)
  }

  getElapsedMinutes(): number {
    return Math.floor(this.elapsedTime / 60)
  }

  getRemainingMinutes(): number {
    return Math.floor(this.getRemainingTime() / 60)
  }

  getRemainingSeconds(): number {
    return Math.floor(this.getRemainingTime() % 60)
  }

  getFormattedRemainingTime(): string {
    const minutes = this.getRemainingMinutes()
    const seconds = this.getRemainingSeconds()
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  isExpired(): boolean {
    return this.elapsedTime >= this.totalTime
  }

  getProgressPercentage(): number {
    return Math.min(100, (this.elapsedTime / this.totalTime) * 100)
  }
}
