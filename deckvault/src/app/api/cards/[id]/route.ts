/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(_: NextRequest, { params }: any) {
	const card = await prisma.card.findUnique({
		where: { id: params.id },
		include: { sets: true },
	});
	if (!card) return new Response("Not found", { status: 404 });
	return Response.json(card);
}
