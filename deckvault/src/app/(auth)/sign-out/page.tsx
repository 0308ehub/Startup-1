"use client";
import { signOut } from "next-auth/react";

export default function SignOutPage() {
	return (
		<div className="min-h-screen flex items-center justify-center p-8">
			<div className="max-w-sm w-full space-y-4">
				<h1 className="text-2xl font-semibold">Sign out</h1>
				<button className="w-full border rounded px-4 py-2" onClick={() => signOut({ callbackUrl: "/" })}>
					Sign out
				</button>
			</div>
		</div>
	);
} 