import { NextRequest } from "next/server";

export async function GET() {
	return Response.json({ items: [] });
}

export async function POST(req: NextRequest) {
	const body = await req.json();
	return Response.json({ ok: true, deck: body });
}
