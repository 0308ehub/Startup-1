import DeckEditor from "@/components/DeckEditor";

export default async function DeckBuilderPage() {
	return (
		<div className="p-6">
			<h1 className="text-2xl font-semibold mb-4">Deck Builder</h1>
							<DeckEditor />
		</div>
	);
}
