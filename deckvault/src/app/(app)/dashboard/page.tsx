import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function DashboardPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Portfolio Value</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-semibold">—</div>
						<p className="text-sm text-slate-600">Connect DB to show live value.</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Recent Price Moves</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-sm text-slate-600">Coming soon.</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}