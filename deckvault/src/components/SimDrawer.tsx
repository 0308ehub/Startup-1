"use client";
import { useState } from "react";

export default function SimDrawer({ deckId }: { deckId: string }) {
	const [seed, setSeed] = useState<string>("1");
	const [hand, setHand] = useState<number[]>([]);
	async function draw() {
		const res = await fetch("/api/sim/draw", { method: "POST", body: JSON.stringify({ deckId, seed }) });
		const data = await res.json();
		setHand(data.openingHand ?? []);
	}
	return (
		<div className="space-y-3">
			<div className="flex gap-2">
				<input className="border rounded px-2 py-1" value={seed} onChange={(e) => setSeed(e.target.value)} />
				<button className="border rounded px-3" onClick={draw}>Draw</button>
			</div>
			<div className="text-sm">Opening hand: {hand.join(", ") || "—"}</div>
		</div>
	);
}


