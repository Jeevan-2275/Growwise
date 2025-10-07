import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Export the GET and POST handlers for NextAuth
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);