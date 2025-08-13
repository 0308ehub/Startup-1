import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function CollectionPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold tracking-tight">My Collection</h1>
			<Card>
				<CardHeader>
					<CardTitle>Cards</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between mb-4">
						<div className="text-sm text-slate-600">Manage your owned card sets and quantities.</div>
						<Button variant="secondary" size="sm">Import CSV</Button>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="text-left text-slate-600">
									<th className="py-2 pr-4">Set</th>
									<th className="py-2 pr-4">Rarity</th>
									<th className="py-2 pr-4">Qty</th>
									<th className="py-2 pr-4">Latest</th>
									<th className="py-2 pr-4">Actions</th>
								</tr>
							</thead>
							<tbody>
								<tr className="border-t">
									<td className="py-3 pr-4">—</td>
									<td className="py-3 pr-4">—</td>
									<td className="py-3 pr-4">—</td>
									<td className="py-3 pr-4">—</td>
									<td className="py-3 pr-4">
										<Button variant="ghost" size="sm">Edit</Button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}