/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";

export async function GET(_: NextRequest, { params }: any) {
	return Response.json({ id: params.id, name: "Example Deck" });
}
