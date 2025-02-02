// middleware.ts

import { createServerClient } from "next-pocketbase-auth";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const response = NextResponse.next({ request });

    const pb = createServerClient({
        get: (name) => request.cookies.get(name),
        set: (name, value, opts) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, opts);
        },
        delete: (name) => {
            request.cookies.delete(name);
            response.cookies.delete(name);
        },
    });

    try {
        if (pb.authStore.isValid) await pb.collection("users").authRefresh();
    } catch {
        pb.authStore.clear();
    }

    if (request.nextUrl.pathname.startsWith('/api')) {
        return response;
    }

    if (pb.authStore.record) return response;

    if (request.nextUrl.pathname === "/login") return response;

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
};