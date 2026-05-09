import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const isAdmin = token?.role === "admin" || token?.role === "super admin"


    if (isAdmin) {
        return NextResponse.next();
    }

    try {
        const res = await fetch(`${req.nextUrl.origin}/api/settings`, { cache: 'no-store' });

        if (res.ok) {
            const settings = await res.json();

            if (settings.maintenanceMode) {
                if (!req.nextUrl.pathname.startsWith('/maintenance')) {
                    return NextResponse.redirect(new URL('/maintenance', req.url));
                }
            }
        }
    } catch (error) {
        console.error("Middleware settings fetch failed", error);
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/shop/:path*',
        '/checkout',
        '/cart',
        '/product/:path*',
    ]
}