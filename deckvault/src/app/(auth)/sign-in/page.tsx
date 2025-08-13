"use client";
import { signIn } from "next-auth/react";

export default function SignInPage() {
	return (
		<div className="min-h-screen flex items-center justify-center p-8">
			<div className="max-w-sm w-full space-y-4">
				<h1 className="text-2xl font-semibold">Sign in</h1>
				<button className="w-full border rounded px-4 py-2" onClick={() => signIn("google")}>Sign in with Google</button>
				<button className="w-full border rounded px-4 py-2" onClick={() => signIn("email")}>Sign in with Email</button>
			</div>
		</div>
	);
} 