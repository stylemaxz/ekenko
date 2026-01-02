
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key-change-it-in-prod';
const key = new TextEncoder().encode(SECRET_KEY);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Definite Public Paths (Always Allow)
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/api/auth') ||
        pathname === '/favicon.ico' ||
        pathname.match(/\.(png|jpg|jpeg|gif|svg|css|js)$/)
    ) {
        return NextResponse.next();
    }

    // 2. Check Token
    const token = request.cookies.get('accessToken')?.value;
    let userPayload: any = null;

    if (token) {
        try {
            const { payload } = await jwtVerify(token, key);
            userPayload = payload;
        } catch (error) {
            // Invalid token -> Ignore it (treat as logged out)
        }
    }

    // 3. Login Page Logic
    if (pathname === '/login') {
        if (userPayload) {
            // Already logged in? Go to dashboard
            const targetUrl = userPayload.role === 'manager' ? '/admin/dashboard' : '/sale/dashboard';
            return NextResponse.redirect(new URL(targetUrl, request.url));
        }
        // Not logged in? Allow access to login page
        return NextResponse.next();
    }

    // 4. Protect All Other Routes
    if (!userPayload) {
        // No token -> Redirect to login
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 5. Role-Based Access Control (RBAC)
    // At this point, User IS logged in

    // Block Sales from Admin Area
    if (pathname.startsWith('/admin') && userPayload.role !== 'manager') {
        return NextResponse.redirect(new URL('/sale/dashboard', request.url));
    }

    // 6. Handle Root Path
    if (pathname === '/') {
        const targetUrl = userPayload.role === 'manager' ? '/admin/dashboard' : '/sale/dashboard';
        return NextResponse.redirect(new URL(targetUrl, request.url));
    }

    // Allow access to authorized routes
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
