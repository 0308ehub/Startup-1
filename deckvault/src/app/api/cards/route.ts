import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const q = searchParams.get("q")?.trim() ?? "";
	const type = searchParams.get("type") ?? undefined;
	const attribute = searchParams.get("attribute") ?? undefined;
	const rarity = searchParams.get("rarity") ?? undefined;
	const setCode = searchParams.get("set") ?? undefined;
	const minPrice = searchParams.get("minPrice");
	const maxPrice = searchParams.get("maxPrice");
	const page = Math.max(1, Number(searchParams.get("page") || 1));
	const take = 24;
	const skip = (page - 1) * take;

	const andFilters: Prisma.CardWhereInput[] = [];
	if (q) {
		andFilters.push({
			OR: [
				{ name: { contains: q, mode: Prisma.QueryMode.insensitive } },
				{ archetype: { contains: q, mode: Prisma.QueryMode.insensitive } },
			],
		});
	}
	if (type) andFilters.push({ type });
	if (attribute) andFilters.push({ attribute });
	if (setCode)
		andFilters.push({
			sets: { some: { setCode: { contains: setCode, mode: Prisma.QueryMode.insensitive } } },
		});
	if (rarity) andFilters.push({ sets: { some: { rarity } } });

	if (minPrice || maxPrice) {
		const prices = await prisma.price.findMany({
			where: {
				value: {
					gte: minPrice ? new Prisma.Decimal(minPrice) : undefined,
					lte: maxPrice ? new Prisma.Decimal(maxPrice) : undefined,
				},
			},
			select: { cardSetId: true },
			distinct: ["cardSetId"],
		});
		const priceFilterSetIds = prices.map((p) => p.cardSetId);
		andFilters.push({ sets: { some: { id: { in: priceFilterSetIds } } } });
	}

	const where: Prisma.CardWhereInput = andFilters.length > 0 ? { AND: andFilters } : {};

	const cards = await prisma.card.findMany({
		where,
		orderBy: { name: "asc" as const },
		skip,
		take,
		include: { sets: true },
	});
	return Response.json({ items: cards });
}