import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "DeckVault",
	description: "Yu-Gi-Oh! Portfolio, Deck Builder, Tester, and Marketplace",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="light">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`} suppressHydrationWarning>
				<Navbar />
				<main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
				<Analytics />
			</body>
		</html>
	);
}
