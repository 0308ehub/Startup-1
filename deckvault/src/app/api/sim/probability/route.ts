import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
	const { deckId, query } = await req.json();
	const total = 40;
	const inFirst = query?.inFirst ?? 5;
	const atLeast = query?.atLeast ?? 1;
	const success = 1; // placeholder
	return Response.json({ probability: success / (atLeast + inFirst + total) });
}
