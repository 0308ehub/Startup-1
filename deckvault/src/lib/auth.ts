import NextAuth, { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	secret: process.env.AUTH_SECRET,
	session: { strategy: "jwt" },
	providers: [
		EmailProvider({
			server: {
				host: process.env.EMAIL_SERVER_HOST!,
				port: Number(process.env.EMAIL_SERVER_PORT || 587),
				auth: {
					user: process.env.EMAIL_SERVER_USER!,
					pass: process.env.EMAIL_SERVER_PASSWORD!,
				},
			},
			from: process.env.EMAIL_FROM!,
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
	],
	callbacks: {
		async session({ session, token }) {
			if (token?.sub) {
				(session.user as any).id = token.sub;
			}
			return session;
		},
	},
}; 