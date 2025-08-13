import Link from "next/link";

export default function Home() {
	return (
		<div className="min-h-screen flex items-center justify-center p-8">
			<div className="space-y-4 text-center">
				<h1 className="text-3xl font-bold">DeckVault</h1>
				<p className="text-gray-600">Yu-Gi-Oh! Portfolio, Deck Builder, Tester, and Marketplace</p>
				<div className="flex gap-3 justify-center">
					<Link href="/sign-in" className="border rounded px-4 py-2">Sign in</Link>
					<Link href="/dashboard" className="border rounded px-4 py-2">Go to dashboard</Link>
				</div>
			</div>
		</div>
	);
}
