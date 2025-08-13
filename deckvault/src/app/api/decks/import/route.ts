import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
	const text = await req.text();
	return Response.json({ ok: true, imported: text.length });
}
