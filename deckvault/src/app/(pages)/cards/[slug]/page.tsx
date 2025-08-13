import { prisma } from "@/lib/prisma";

export default async function CardDetailsPage(props: { params: Promise<{ slug: string }> }) {
	const { slug } = await props.params;
	const card = await prisma.card.findUnique({
		where: { slug },
		include: { sets: { include: { prices: { orderBy: { asOf: "desc" }, take: 1 } } } },
	});
	if (!card) return <div className="p-6">Not found</div>;
	return (
		<div className="p-6 space-y-4">
			<h1 className="text-2xl font-semibold">{card.name}</h1>
			<div className="grid gap-4">
				{card.sets.map((s) => (
					<div key={s.id} className="border rounded p-3">
						<div>{s.setCode} • {s.setName} • {s.rarity}</div>
						<div>Latest: {s.prices[0]?.value?.toString?.() ?? "—"}</div>
					</div>
				))}
			</div>
		</div>
	);
}
