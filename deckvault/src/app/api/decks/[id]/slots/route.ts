/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: any) {
	const body = await req.json();
	return Response.json({ ok: true, deckId: params.id, slot: body });
}
