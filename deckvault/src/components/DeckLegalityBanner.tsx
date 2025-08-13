import { isDeckLegal } from "@/lib/ygo/legality";

export default function DeckLegalityBanner({ main, extra, side }: { main: number; extra: number; side: number }) {
	const ok = isDeckLegal({ mainCount: main, extraCount: extra, sideCount: side });
	return <div className={`p-2 rounded ${ok ? "bg-green-100" : "bg-red-100"}`}>{ok ? "Deck legal" : "Illegal deck configuration"}</div>;
}


