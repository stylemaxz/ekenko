
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        // 1. Find user by username
        const user = await prisma.employee.findUnique({
            where: { username },
        });

        if (!user || !user.password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // 2. Verify password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // 3. Create JWT Token (Session)
        const token = await signJWT({
            userId: user.id,
            username: user.username,
            role: user.role,
            name: user.name,
        });

        // 4. Set Cookie
        const cookieStore = await cookies();
        cookieStore.set('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });

        // 5. Return success and user info (excluding password)
        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json({
            success: true,
            user: userWithoutPassword,
            redirectUrl: user.role === 'manager' ? '/admin/dashboard' : '/sale/dashboard'
        });

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
