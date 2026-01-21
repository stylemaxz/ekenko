import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to resolve Google Maps short URLs and extract coordinates
 * This avoids CORS issues by making the request server-side
 */
export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        // Pattern 1: @lat,lng,zoom format
        const atPattern = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const atMatch = url.match(atPattern);
        if (atMatch) {
            return NextResponse.json({
                lat: parseFloat(atMatch[1]),
                lng: parseFloat(atMatch[2]),
            });
        }

        // Pattern 2: q=lat,lng format
        const qPattern = /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const qMatch = url.match(qPattern);
        if (qMatch) {
            return NextResponse.json({
                lat: parseFloat(qMatch[1]),
                lng: parseFloat(qMatch[2]),
            });
        }

        // Pattern 3: place/ format with coordinates
        const placePattern = /place\/(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const placeMatch = url.match(placePattern);
        if (placeMatch) {
            return NextResponse.json({
                lat: parseFloat(placeMatch[1]),
                lng: parseFloat(placeMatch[2]),
            });
        }

        // Pattern 4: Short URL - resolve server-side to avoid CORS
        if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')) {
            try {
                // Fetch the URL server-side and follow redirects
                const response = await fetch(url, {
                    method: 'GET',
                    redirect: 'follow',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; GoogleMapsBot/1.0)',
                    },
                });

                const finalUrl = response.url;

                // Try to extract coordinates from the resolved URL
                const atMatch2 = finalUrl.match(atPattern);
                if (atMatch2) {
                    return NextResponse.json({
                        lat: parseFloat(atMatch2[1]),
                        lng: parseFloat(atMatch2[2]),
                    });
                }

                const qMatch2 = finalUrl.match(qPattern);
                if (qMatch2) {
                    return NextResponse.json({
                        lat: parseFloat(qMatch2[1]),
                        lng: parseFloat(qMatch2[2]),
                    });
                }

                const placeMatch2 = finalUrl.match(placePattern);
                if (placeMatch2) {
                    return NextResponse.json({
                        lat: parseFloat(placeMatch2[1]),
                        lng: parseFloat(placeMatch2[2]),
                    });
                }
            } catch (error) {
                console.error('Error resolving short URL:', error);
                return NextResponse.json(
                    { error: 'Failed to resolve short URL' },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Could not extract coordinates from URL' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error in extract-coordinates API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
