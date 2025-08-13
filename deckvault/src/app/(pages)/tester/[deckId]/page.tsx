import SimDrawer from "@/components/SimDrawer";

export default async function TesterPage(props: { params: Promise<{ deckId: string }> }) {
	const { deckId } = await props.params;
	return (
		<div className="p-6">
			<h1 className="text-2xl font-semibold mb-4">Tester</h1>
			<SimDrawer deckId={deckId} />
		</div>
	);
}
