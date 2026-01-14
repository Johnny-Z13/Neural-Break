/**
 * Vercel Serverless Function - High Score API
 * Stores high scores in Vercel KV (Redis-based key-value store)
 * 
 * Endpoints:
 * - GET /api/highscores?mode=original|rogue - Get high scores for a mode
 * - POST /api/highscores - Save a new high score
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

// Type definitions
interface HighScoreEntry {
  name: string
  score: number
  survivedTime: number
  level: number
  date: string
  location: string
  gameMode: 'original' | 'rogue' | 'test'
  timestamp?: number // For sorting ties
}

const MAX_SCORES_PER_MODE = 10
const MAX_NAME_LENGTH = 20

// In-memory storage for development (replace with Vercel KV in production)
// This will reset on each deployment but works for testing
let inMemoryScores: HighScoreEntry[] = []

/**
 * Validate high score entry
 */
function validateEntry(entry: any): entry is HighScoreEntry {
  if (!entry || typeof entry !== 'object') return false
  
  // Validate name
  if (!entry.name || typeof entry.name !== 'string' || entry.name.trim().length === 0) {
    return false
  }
  if (entry.name.length > MAX_NAME_LENGTH) return false
  
  // Validate score
  if (typeof entry.score !== 'number' || !isFinite(entry.score) || entry.score < 0) {
    return false
  }
  
  // Validate survivedTime
  if (typeof entry.survivedTime !== 'number' || !isFinite(entry.survivedTime) || entry.survivedTime < 0) {
    return false
  }
  
  // Validate level
  if (typeof entry.level !== 'number' || !isFinite(entry.level) || entry.level < 1) {
    return false
  }
  
  // Validate date
  if (!entry.date || typeof entry.date !== 'string') return false
  
  // Validate gameMode
  const validModes = ['original', 'rogue', 'test']
  if (!entry.gameMode || !validModes.includes(entry.gameMode)) {
    return false
  }
  
  return true
}

/**
 * Sanitize entry before saving
 */
function sanitizeEntry(entry: HighScoreEntry): HighScoreEntry {
  return {
    name: entry.name.trim().substring(0, MAX_NAME_LENGTH),
    score: Math.floor(Math.max(0, entry.score)),
    survivedTime: Math.max(0, entry.survivedTime),
    level: Math.max(1, Math.floor(entry.level)),
    date: entry.date || new Date().toLocaleDateString('en-US'),
    location: entry.location || 'ONLINE',
    gameMode: entry.gameMode || 'original',
    timestamp: Date.now()
  }
}

/**
 * Parse date string in MM/DD/YY format for sorting
 */
function parseDate(dateStr: string): Date {
  const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (match) {
    const month = parseInt(match[1], 10) - 1
    const day = parseInt(match[2], 10)
    let year = parseInt(match[3], 10)
    if (year < 100) year += 2000
    return new Date(year, month, day)
  }
  return new Date(dateStr)
}

/**
 * Main handler
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS for browser requests
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  try {
    // GET - Retrieve high scores
    if (req.method === 'GET') {
      const { mode } = req.query
      
      let scores = [...inMemoryScores]
      
      // Filter by mode if specified
      if (mode && typeof mode === 'string') {
        scores = scores.filter(s => s.gameMode === mode)
      }
      
      // Sort by score (desc), then by timestamp (newer first)
      scores.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score
        }
        return (b.timestamp || 0) - (a.timestamp || 0)
      })
      
      return res.status(200).json(scores.slice(0, MAX_SCORES_PER_MODE))
    }
    
    // POST - Save new high score
    if (req.method === 'POST') {
      const entry = req.body
      
      // Validate entry
      if (!validateEntry(entry)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid high score entry' 
        })
      }
      
      // Sanitize entry
      const sanitized = sanitizeEntry(entry)
      
      // Check if this is actually a high score for this mode
      const modeScores = inMemoryScores.filter(s => s.gameMode === sanitized.gameMode)
      if (modeScores.length >= MAX_SCORES_PER_MODE) {
        // Sort to find lowest score
        modeScores.sort((a, b) => a.score - b.score)
        const lowestScore = modeScores[0].score
        
        if (sanitized.score <= lowestScore) {
          return res.status(200).json({ 
            success: false, 
            error: 'Score not high enough for leaderboard' 
          })
        }
      }
      
      // Add new score
      inMemoryScores.push(sanitized)
      
      // Sort all scores
      inMemoryScores.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score
        }
        return (b.timestamp || 0) - (a.timestamp || 0)
      })
      
      // Keep top MAX_SCORES_PER_MODE per game mode
      const originalScores = inMemoryScores
        .filter(s => s.gameMode === 'original')
        .slice(0, MAX_SCORES_PER_MODE)
      const rogueScores = inMemoryScores
        .filter(s => s.gameMode === 'rogue')
        .slice(0, MAX_SCORES_PER_MODE)
      const testScores = inMemoryScores
        .filter(s => s.gameMode === 'test')
        .slice(0, MAX_SCORES_PER_MODE)
      
      inMemoryScores = [...originalScores, ...rogueScores, ...testScores]
      
      return res.status(200).json({ 
        success: true,
        entry: sanitized
      })
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' })
    
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
}
