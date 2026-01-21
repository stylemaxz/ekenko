/**
 * Extracts latitude and longitude from various Google Maps URL formats
 * Now uses server-side API to avoid CORS issues
 */

export interface Coordinates {
    lat: number;
    lng: number;
}

/**
 * Extracts coordinates from a Google Maps URL via API
 * @param url - The Google Maps URL
 * @returns Promise<Coordinates | null>
 */
export async function extractCoordinatesFromUrl(
    url: string,
    apiKey?: string // No longer needed but kept for backward compatibility
): Promise<Coordinates | null> {
    if (!url) return null;

    try {
        // Call our server-side API to extract coordinates
        const response = await fetch('/api/extract-coordinates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Failed to extract coordinates:', error);
            return null;
        }

        const coords = await response.json();

        if (isValidCoordinates(coords)) {
            return coords;
        }

        return null;
    } catch (error) {
        console.error('Error extracting coordinates from URL:', error);
        return null;
    }
}

/**
 * Validates if coordinates are valid
 */
export function isValidCoordinates(coords: Coordinates | null): coords is Coordinates {
    if (!coords) return false;

    const { lat, lng } = coords;

    // Latitude must be between -90 and 90
    // Longitude must be between -180 and 180
    return (
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
    );
}
