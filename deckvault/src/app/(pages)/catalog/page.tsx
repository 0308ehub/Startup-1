import CardSearch from "@/components/CardSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function CatalogPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold tracking-tight">Catalog</h1>
			<Card>
				<CardHeader>
					<CardTitle>Search</CardTitle>
				</CardHeader>
				<CardContent>
					<CardSearch />
				</CardContent>
			</Card>
		</div>
	);
}
