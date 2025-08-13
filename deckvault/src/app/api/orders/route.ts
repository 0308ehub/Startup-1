import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
	const body = await req.json();
	return Response.json({ ok: true, order: body });
}

export async function GET() {
	return Response.json({ items: [] });
}
