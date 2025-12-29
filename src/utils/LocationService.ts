/**
 * Location Service - Detects user's country from IP address
 * Falls back to local/offline mode when API is unavailable
 */

export class LocationService {
  private static cachedLocation: string | null = null
  private static readonly CACHE_KEY = 'neural_break_location_cache'
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

  /**
   * Get user's country code (e.g., "UK", "USA", "POL")
   * Uses IP geolocation API when online, falls back to cached or default when offline
   */
  static async getLocation(): Promise<string> {
    // Check cache first
    if (this.cachedLocation) {
      return this.cachedLocation
    }

    // Check localStorage cache
    const cached = this.getCachedLocation()
    if (cached) {
      this.cachedLocation = cached
      return cached
    }

    // Try to fetch from API
    try {
      const location = await this.fetchLocationFromAPI()
      if (location) {
        this.cachedLocation = location
        this.setCachedLocation(location)
        return location
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch location from API:', error)
    }

    // Fallback to default/random location for offline/local testing
    const fallback = this.getFallbackLocation()
    this.cachedLocation = fallback
    this.setCachedLocation(fallback)
    return fallback
  }

  /**
   * Fetch location from IP geolocation API
   * Uses ipapi.co (free tier: 1000 requests/day)
   */
  private static async fetchLocationFromAPI(): Promise<string | null> {
    try {
      // Use ipapi.co - returns country code in ISO 3166-1 alpha-2 format
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      
      // Convert ISO country code to display format
      const countryCode = data.country_code || data.country
      if (!countryCode) {
        return null
      }

      // Map common country codes to display format
      const countryMap: Record<string, string> = {
        'GB': 'UK',
        'US': 'USA',
        'PL': 'POL',
        'DE': 'GER',
        'FR': 'FRA',
        'IT': 'ITA',
        'ES': 'ESP',
        'NL': 'NED',
        'BE': 'BEL',
        'SE': 'SWE',
        'NO': 'NOR',
        'DK': 'DEN',
        'FI': 'FIN',
        'CA': 'CAN',
        'AU': 'AUS',
        'JP': 'JPN',
        'CN': 'CHN',
        'KR': 'KOR',
        'BR': 'BRA',
        'MX': 'MEX',
        'IN': 'IND',
        'RU': 'RUS',
      }

      // Return mapped code or uppercase original if not in map
      return countryMap[countryCode.toUpperCase()] || countryCode.toUpperCase()
    } catch (error) {
      console.warn('⚠️ Location API fetch failed:', error)
      return null
    }
  }

  /**
   * Get fallback location for offline/local testing
   * Returns a random common country code
   */
  private static getFallbackLocation(): string {
    const commonLocations = ['UK', 'USA', 'POL', 'GER', 'FRA', 'CAN', 'AUS']
    // Use a simple hash of current date to get consistent "random" location per day
    const dayHash = Math.floor(Date.now() / (24 * 60 * 60 * 1000))
    return commonLocations[dayHash % commonLocations.length]
  }

  /**
   * Get cached location from localStorage
   */
  private static getCachedLocation(): string | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY)
      if (!cached) {
        return null
      }

      const { location, timestamp } = JSON.parse(cached)
      
      // Check if cache is still valid
      if (Date.now() - timestamp > this.CACHE_DURATION) {
        localStorage.removeItem(this.CACHE_KEY)
        return null
      }

      return location
    } catch (error) {
      console.warn('⚠️ Error reading location cache:', error)
      return null
    }
  }

  /**
   * Cache location in localStorage
   */
  private static setCachedLocation(location: string): void {
    try {
      const cache = {
        location,
        timestamp: Date.now()
      }
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache))
    } catch (error) {
      console.warn('⚠️ Error caching location:', error)
    }
  }

  /**
   * Clear cached location (useful for testing)
   */
  static clearCache(): void {
    this.cachedLocation = null
    try {
      localStorage.removeItem(this.CACHE_KEY)
    } catch (error) {
      // Ignore
    }
  }
}

