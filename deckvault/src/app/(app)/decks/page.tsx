import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function DecksPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold tracking-tight">Decks</h1>
				<Link href="/decks/new"><Button size="sm">New Deck</Button></Link>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>My Decks</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-sm text-slate-600">No decks yet. Create your first deck.</div>
				</CardContent>
			</Card>
		</div>
	);
}