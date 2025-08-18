import { createSupabaseServer } from "@/lib/supabase/server";

export default async function CardDetailsPage(props: { params: Promise<{ slug: string }> }) {
	const { slug } = await props.params;
	const supabase = await createSupabaseServer();
	
	// Get card data from Supabase
	const { data: card, error } = await supabase
		.from('cards')
		.select(`
			*,
			card_sets (
				*,
				prices (*)
			)
		`)
		.eq('slug', slug)
		.single();

	if (error || !card) {
		return <div className="p-6">Card not found</div>;
	}

	return (
		<div className="p-6 space-y-4">
			<h1 className="text-2xl font-semibold">{card.name}</h1>
			<div className="grid gap-4">
				{card.card_sets?.map((set: any) => (
					<div key={set.id} className="border rounded p-3">
						<div>{set.set_code} • {set.set_name} • {set.rarity}</div>
						<div>Latest: {set.prices?.[0]?.value?.toString?.() ?? "—"}</div>
					</div>
				))}
			</div>
		</div>
	);
}
