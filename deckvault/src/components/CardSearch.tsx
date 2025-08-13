"use client";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type CardSummary = {
	id: string;
	name: string;
	type: string;
};

export default function CardSearch() {
	const [q, setQ] = useState("");
	const [items, setItems] = useState<CardSummary[]>([]);
	async function search() {
		const params = new URLSearchParams();
		if (q) params.set("q", q);
		const res = await fetch(`/api/cards?${params.toString()}`);
		const data = (await res.json()) as { items?: CardSummary[] };
		setItems(data.items ?? []);
	}
	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				<Input placeholder="Search cards" value={q} onChange={(e) => setQ(e.target.value)} />
				<Button onClick={search}>Search</Button>
			</div>
			<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
				{items.map((c) => (
					<div key={c.id} className="border rounded p-3">
						<div className="font-medium">{c.name}</div>
						<div className="text-sm text-gray-500">{c.type}</div>
					</div>
				))}
			</div>
		</div>
	);
}


