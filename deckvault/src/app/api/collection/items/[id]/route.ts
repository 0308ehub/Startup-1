/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest, { params }: any) {
	const body = await req.json();
	return Response.json({ ok: true, id: params.id, updates: body });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	await params; // Await to handle the promise but don't use the result
	return new Response(null, { status: 204 });
}
