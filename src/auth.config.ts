import type { NextAuthConfig } from "next-auth";
import { Role } from "@prisma/client";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const role = auth?.user?.role;

            const isOnLogin = nextUrl.pathname.startsWith("/login");
            const isOnDashboardKoni = nextUrl.pathname.startsWith("/dashboard/koni");
            const isOnDashboardCabor = nextUrl.pathname.startsWith("/dashboard/cabor");
            const isOnDashboardClub = nextUrl.pathname.startsWith("/dashboard/club");

            // Redirect logic for protected routes based on Role
            if (isOnDashboardKoni) {
                if (isLoggedIn && role === "ADMIN_KONI") return true;
                return false; // Redirect to login
            }

            if (isOnDashboardCabor) {
                if (isLoggedIn && role === "ADMIN_CABOR") return true;
                return false;
            }

            if (isOnDashboardClub) {
                if (isLoggedIn && role === "ADMIN_CLUB") return true;
                return false;
            }
            2
            // Redirect logic for Login page (if already logged in)
            if (isOnLogin && isLoggedIn) {
                if (role === "ADMIN_KONI") return Response.redirect(new URL("/dashboard/koni", nextUrl));
                if (role === "ADMIN_CABOR") return Response.redirect(new URL("/dashboard/cabor", nextUrl));
                if (role === "ADMIN_CLUB") return Response.redirect(new URL("/dashboard/club", nextUrl));
            }

            return true;
        },
        jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token.role && session.user) {
                session.user.role = token.role as Role;
            }
            return session;
        }
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
