import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function Home() {
	return (
		<div className="space-y-10">
			<section className="text-center space-y-4 py-10">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Build. Test. Track.</h1>
				<p className="text-slate-600 max-w-2xl mx-auto">DeckVault is your Yu-Gi-Oh! command center — a fast catalog, clean deck builder, and goldfish simulator.</p>
				<div className="flex gap-3 justify-center">
					<Link href="/catalog"><Button variant="secondary">Browse Catalog</Button></Link>
					<Link href="/dashboard"><Button>Open Dashboard</Button></Link>
				</div>
			</section>
			<section className="grid md:grid-cols-3 gap-6">
				<Card>
					<CardContent className="p-6 space-y-2">
						<h3 className="font-semibold">Portfolio</h3>
						<p className="text-sm text-slate-600">Track value and P/L with auto-refreshed prices.</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6 space-y-2">
						<h3 className="font-semibold">Deck Builder</h3>
						<p className="text-sm text-slate-600">MVP legality checks and clean editing UI.</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6 space-y-2">
						<h3 className="font-semibold">Simulator</h3>
						<p className="text-sm text-slate-600">Seedable draws and combo probabilities.</p>
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
