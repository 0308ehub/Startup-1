import DeckEditor from "@/components/DeckEditor";

export default async function DeckBuilderPage(props: { params: Promise<{ id: string }> }) {
	const { id } = await props.params;
	return (
		<div className="p-6">
			<h1 className="text-2xl font-semibold mb-4">Deck Builder</h1>
			<DeckEditor deckId={id} />
		</div>
	);
}
