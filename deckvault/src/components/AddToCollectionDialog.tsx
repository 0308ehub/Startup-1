"use client";
import { useState } from "react";

export default function AddToCollectionDialog({ cardSetId }: { cardSetId: string }) {
	const [qty, setQty] = useState<number>(1);
	async function add() {
		await fetch("/api/collection/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cardSetId, quantity: qty, condition: "NM" }) });
		alert("Added to collection");
	}
	return (
		<div className="flex gap-2">
			<input className="border rounded px-2 py-1 w-20" type="number" value={qty} onChange={(e) => setQty(parseInt(e.target.value || "0"))} />
			<button className="border rounded px-3" onClick={add}>Add</button>
		</div>
	);
}


