import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import ListingsTable from "@/components/ListingsTable";
import { Button } from "@/components/ui/Button";

export default function MarketPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
				<Button size="sm" variant="secondary">List a Card</Button>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Active Listings</CardTitle>
				</CardHeader>
				<CardContent>
					<ListingsTable />
				</CardContent>
			</Card>
		</div>
	);
}