import { NextRequest } from "next/server";

function mulberry32(a: number) {
	return function () {
		let t = (a += 0x6d2b79f5);
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export async function POST(req: NextRequest) {
	const { seed } = await req.json();
	const rng = mulberry32(Number(seed ?? 1));
	const deck = Array.from({ length: 40 }, (_, i) => i + 1);
	deck.sort(() => rng() - 0.5);
	const openingHand = deck.slice(0, 5);
	return Response.json({ openingHand, order: deck });
}
