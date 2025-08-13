/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest, { params }: any) {
	const body = await req.json();
	return Response.json({ ok: true, id: params.id, updates: body });
}

export async function DELETE(_: NextRequest, { params: _params }: any) {
	return new Response(null, { status: 204 });
}
