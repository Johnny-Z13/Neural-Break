/**
 * Vercel Serverless Function - High Score API
 * Stores high scores in Vercel KV (Redis-based key-value store)
 * 
 * ⚠️ IMPORTANT: For persistence, you must:
 * 1. Run: vercel kv create neural-break-scores
 * 2. Run: npm install @vercel/kv
 * 3. Link your project: vercel link
 * 4. Pull env vars: vercel env pull
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
const KV_KEY = 'neural_break_highscores'

// ═══════════════════════════════════════════════════════════════════
// STORAGE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Check if Vercel KV is available (production)
 */
function isKVAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

/**
 * Get scores from Vercel KV
 */
async function getScoresFromKV(): Promise<HighScoreEntry[]> {
  if (!isKVAvailable()) {
    return []
  }
  
  try {
    const response = await fetch(
      `${process.env.KV_REST_API_URL}/get/${KV_KEY}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
        },
      }
    )
    
    if (!response.ok) {
      console.log('KV GET response not OK:', response.status)
      return []
    }
    
    const data = await response.json()
    
    // Vercel KV returns { result: <value> }
    if (data.result) {
      // If result is a string, parse it
      if (typeof data.result === 'string') {
        return JSON.parse(data.result)
      }
      // If result is already an array, return it
      if (Array.isArray(data.result)) {
        return data.result
      }
    }
    
    return []
  } catch (error) {
    console.error('Error getting scores from KV:', error)
    return []
  }
}

/**
 * Save scores to Vercel KV
 */
async function saveScoresToKV(scores: HighScoreEntry[]): Promise<boolean> {
  if (!isKVAvailable()) {
    console.warn('⚠️ Vercel KV not available - scores will not persist!')
    return false
  }
  
  try {
    const response = await fetch(
      `${process.env.KV_REST_API_URL}/set/${KV_KEY}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scores),
      }
    )
    
    if (!response.ok) {
      console.error('KV SET response not OK:', response.status)
      return false
    }
    
    console.log('✅ Scores saved to Vercel KV')
    return true
  } catch (error) {
    console.error('Error saving scores to KV:', error)
    return false
  }
}

// ═══════════════════════════════════════════════════════════════════
// FALLBACK: In-memory storage (for development/testing only)
// ⚠️ WARNING: This resets on every deployment and cold start!
// ═══════════════════════════════════════════════════════════════════
let inMemoryScores: HighScoreEntry[] = []

/**
 * Get all scores (tries KV first, falls back to memory)
 */
async function getAllScores(): Promise<HighScoreEntry[]> {
  if (isKVAvailable()) {
    const kvScores = await getScoresFromKV()
    if (kvScores.length > 0 || inMemoryScores.length === 0) {
      return kvScores
    }
  }
  return inMemoryScores
}

/**
 * Save all scores (saves to KV if available, always updates memory)
 */
async function saveAllScores(scores: HighScoreEntry[]): Promise<boolean> {
  inMemoryScores = scores
  
  if (isKVAvailable()) {
    return await saveScoresToKV(scores)
  }
  
  console.warn('⚠️ Vercel KV not configured - using in-memory storage (will reset!)')
  return true
}

// ═══════════════════════════════════════════════════════════════════
// VALIDATION & SANITIZATION
// ═══════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════

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
  
  // Log storage mode for debugging
  console.log(`📊 High Score API - KV Available: ${isKVAvailable()}`)
  
  try {
    // GET - Retrieve high scores
    if (req.method === 'GET') {
      const { mode } = req.query
      
      let scores = await getAllScores()
      
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
      
      // Get current scores
      let allScores = await getAllScores()
      
      // Check if this is actually a high score for this mode
      const modeScores = allScores.filter(s => s.gameMode === sanitized.gameMode)
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
      allScores.push(sanitized)
      
      // Sort all scores
      allScores.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score
        }
        return (b.timestamp || 0) - (a.timestamp || 0)
      })
      
      // Keep top MAX_SCORES_PER_MODE per game mode
      const originalScores = allScores
        .filter(s => s.gameMode === 'original')
        .slice(0, MAX_SCORES_PER_MODE)
      const rogueScores = allScores
        .filter(s => s.gameMode === 'rogue')
        .slice(0, MAX_SCORES_PER_MODE)
      const testScores = allScores
        .filter(s => s.gameMode === 'test')
        .slice(0, MAX_SCORES_PER_MODE)
      
      const trimmedScores = [...originalScores, ...rogueScores, ...testScores]
      
      // Save to storage
      const saved = await saveAllScores(trimmedScores)
      
      return res.status(200).json({ 
        success: saved,
        entry: sanitized,
        persistent: isKVAvailable()
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
