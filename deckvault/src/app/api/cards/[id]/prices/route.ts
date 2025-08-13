/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: any) {
	const { searchParams } = new URL(req.url);
	const range = searchParams.get("range") === "90d" ? 90 : 30;
	const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000);
	const sets = await prisma.cardSet.findMany({ where: { cardId: params.id }, select: { id: true } });
	const setIds = sets.map((s) => s.id);
	const prices = await prisma.price.findMany({
		where: { cardSetId: { in: setIds }, asOf: { gte: since } },
		orderBy: { asOf: "asc" },
	});
	return Response.json({ items: prices });
}
