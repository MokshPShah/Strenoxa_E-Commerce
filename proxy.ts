import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    // Check if the current user is an admin
    const isAdmin = token?.role === "admin" || token?.role === "super admin";

    // --- 1. EXISTING AUTH PROTECTIONS ---

    // Prevent logged-in users from seeing the login/register pages
    if (token && (pathname === "/login" || pathname === "/register")) {
        if (isAdmin) {
            return NextResponse.redirect(new URL("/admin", req.url));
        } else {
            return NextResponse.redirect(new URL("/", req.url)); // Normal users go to home
        }
    }

    // Block non-admins from admin routes
    if (pathname.startsWith("/admin") && !isAdmin) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    // Block unauthenticated users from the user dashboard
    if (pathname.startsWith("/dashboard") && !token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // --- 2. MAINTENANCE MODE SHIELD ---
    // Rule: Admins bypass the shield. We also leave /login and /maintenance accessible.
    if (!isAdmin && pathname !== '/maintenance' && pathname !== '/login') {
        try {
            // Fetch live settings from your public API
            const res = await fetch(`${req.nextUrl.origin}/api/settings`, { cache: 'no-store' });

            if (res.ok) {
                const settings = await res.json();

                // If Maintenance is ON, redirect the user
                if (settings.maintenanceMode) {
                    return NextResponse.redirect(new URL('/maintenance', req.url));
                }
            }
        } catch (error) {
            // If the fetch fails, fail gracefully so the site doesn't crash
            console.error("Proxy settings fetch failed:", error);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};