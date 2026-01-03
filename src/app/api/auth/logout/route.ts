import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = await cookies();

        // Delete the access token cookie
        cookieStore.delete('accessToken');

        return NextResponse.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error: any) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
