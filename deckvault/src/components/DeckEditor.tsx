"use client";
import { useState } from "react";

export default function DeckEditor({ deckId: _deckId }: { deckId: string }) {
	const [main, setMain] = useState<number>(40);
	const [extra, setExtra] = useState<number>(0);
	const [side, setSide] = useState<number>(0);
	const totalOk = main >= 40 && main <= 60 && extra <= 15 && side <= 15;
	return (
		<div className="space-y-3">
			<div className="grid grid-cols-3 gap-3">
				<div className="border rounded p-3">
					<div className="font-medium mb-2">Main</div>
					<input className="border rounded px-2 py-1 w-full" type="number" value={main} onChange={(e) => setMain(parseInt(e.target.value || "0"))} />
				</div>
				<div className="border rounded p-3">
					<div className="font-medium mb-2">Extra</div>
					<input className="border rounded px-2 py-1 w-full" type="number" value={extra} onChange={(e) => setExtra(parseInt(e.target.value || "0"))} />
				</div>
				<div className="border rounded p-3">
					<div className="font-medium mb-2">Side</div>
					<input className="border rounded px-2 py-1 w-full" type="number" value={side} onChange={(e) => setSide(parseInt(e.target.value || "0"))} />
				</div>
			</div>
			<div className={`p-2 rounded ${totalOk ? "bg-green-100" : "bg-red-100"}`}>
				{totalOk ? "Deck is legal (MVP rules)" : "Illegal deck configuration"}
			</div>
		</div>
	);
}


