/**
 * ZIP Code to City/State Mapper
 * Simple lookup for common demo/test ZIP codes
 * For production, would integrate with USPS or Google Places API
 */

export type LocationInfo = {
  zip: string;
  city: string;
  state: string;
};

// Common US city ZIP codes for demo/testing
const ZIP_CODE_MAP: Record<string, LocationInfo> = {
  // Chicago, IL
  '60616': { zip: '60616', city: 'Chicago', state: 'IL' },
  '60601': { zip: '60601', city: 'Chicago', state: 'IL' },
  '60610': { zip: '60610', city: 'Chicago', state: 'IL' },
  '60611': { zip: '60611', city: 'Chicago', state: 'IL' },

  // New York, NY
  '10001': { zip: '10001', city: 'New York', state: 'NY' },
  '10002': { zip: '10002', city: 'New York', state: 'NY' },
  '10003': { zip: '10003', city: 'New York', state: 'NY' },
  '10009': { zip: '10009', city: 'New York', state: 'NY' },

  // Los Angeles, CA
  '90001': { zip: '90001', city: 'Los Angeles', state: 'CA' },
  '90002': { zip: '90002', city: 'Los Angeles', state: 'CA' },
  '90003': { zip: '90003', city: 'Los Angeles', state: 'CA' },
  '90210': { zip: '90210', city: 'Beverly Hills', state: 'CA' },

  // San Francisco, CA
  '94102': { zip: '94102', city: 'San Francisco', state: 'CA' },
  '94103': { zip: '94103', city: 'San Francisco', state: 'CA' },
  '94104': { zip: '94104', city: 'San Francisco', state: 'CA' },

  // Boston, MA
  '02101': { zip: '02101', city: 'Boston', state: 'MA' },
  '02102': { zip: '02102', city: 'Boston', state: 'MA' },
  '02103': { zip: '02103', city: 'Boston', state: 'MA' },

  // Seattle, WA
  '98101': { zip: '98101', city: 'Seattle', state: 'WA' },
  '98102': { zip: '98102', city: 'Seattle', state: 'WA' },
  '98103': { zip: '98103', city: 'Seattle', state: 'WA' },

  // Miami, FL
  '33101': { zip: '33101', city: 'Miami', state: 'FL' },
  '33102': { zip: '33102', city: 'Miami', state: 'FL' },
  '33128': { zip: '33128', city: 'Miami', state: 'FL' },

  // Denver, CO
  '80201': { zip: '80201', city: 'Denver', state: 'CO' },
  '80202': { zip: '80202', city: 'Denver', state: 'CO' },
  '80203': { zip: '80203', city: 'Denver', state: 'CO' },

  // Phoenix, AZ
  '85001': { zip: '85001', city: 'Phoenix', state: 'AZ' },
  '85002': { zip: '85002', city: 'Phoenix', state: 'AZ' },
  '85003': { zip: '85003', city: 'Phoenix', state: 'AZ' },

  // Dallas, TX
  '75201': { zip: '75201', city: 'Dallas', state: 'TX' },
  '75202': { zip: '75202', city: 'Dallas', state: 'TX' },
  '75203': { zip: '75203', city: 'Dallas', state: 'TX' },
};

/**
 * Resolve ZIP code to city/state
 * @param zip - ZIP code to lookup
 * @returns LocationInfo if found, null otherwise
 */
export function resolveZipCode(zip: string): LocationInfo | null {
  const trimmedZip = zip.trim();
  return ZIP_CODE_MAP[trimmedZip] || null;
}

/**
 * Format location for display
 * @param location - Location object with zip, city, state
 * @returns Formatted string like "Chicago, IL 60616" or "ZIP Code: 60616"
 */
export function formatLocation(location: {
  zip?: string;
  city?: string;
  state?: string;
}): string {
  if (!location) return '';

  // If we have city and state, format as "City, State ZIP"
  if (location.city && location.state && location.zip) {
    return `${location.city}, ${location.state} ${location.zip}`;
  }
  
  // If we have city and state but no ZIP
  if (location.city && location.state) {
    return `${location.city}, ${location.state}`;
  }
  
  // If we only have ZIP code, show it with label
  if (location.zip) {
    return `ZIP Code: ${location.zip}`;
  }

  return '';
}
