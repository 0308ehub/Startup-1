import { PrismaClient } from "@/generated/prisma";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const MONSTER_TYPES = ["Monster", "Effect", "Fusion", "Synchro", "Xyz", "Link"];
const ATTRIBUTES = ["DARK", "LIGHT", "FIRE", "WATER", "EARTH", "WIND", "DIVINE"];
const RARITIES = ["Common", "Rare", "Super Rare", "Ultra Rare", "Secret Rare"];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function slugify(name: string): string {
	return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
	console.log("Seeding mock cards...");
	const numCards = 400;
	for (let i = 0; i < numCards; i++) {
		const name = `Card ${i + 1}`;
		const card = await prisma.card.create({
			data: {
				name,
				slug: slugify(name) + "-" + i,
				type: pick(MONSTER_TYPES),
				attribute: Math.random() < 0.7 ? pick(ATTRIBUTES) : null,
				level: Math.random() < 0.6 ? Math.ceil(Math.random() * 12) : null,
				archetype: Math.random() < 0.4 ? `Archetype ${Math.ceil(Math.random() * 20)}` : null,
				imageUrl: null,
				legalTCG: true,
				legalOCG: true,
			},
		});
		const numSets = 1 + Math.floor(Math.random() * 3);
		for (let s = 0; s < numSets; s++) {
			const setCode = `SET-${String(i + 1).padStart(3, "0")}-${s + 1}`;
			const setName = `Set ${Math.ceil(Math.random() * 50)}`;
			const sku = `${setCode}-${randomUUID().slice(0, 8)}`;
			const cardSet = await prisma.cardSet.create({
				data: {
					cardId: card.id,
					setCode,
					setName,
					rarity: pick(RARITIES),
					edition: Math.random() < 0.5 ? "1st" : "Unlimited",
					sku,
				},
			});
			// 30 days of prices via random walk
			const days = 30;
			let price = parseFloat((1 + Math.random() * 20).toFixed(2));
			const now = new Date();
			const data = [] as any[];
			for (let d = days - 1; d >= 0; d--) {
				price = Math.max(0.05, price * (1 + (Math.random() - 0.5) * 0.1));
				const asOf = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
				data.push({
					cardSetId: cardSet.id,
					source: "MOCK",
					currency: "USD",
					value: price.toFixed(2),
					asOf,
				});
			}
			await prisma.price.createMany({ data });
		}
	}
	console.log("Seed complete");
}

main().finally(async () => {
	await prisma.$disconnect();
});
