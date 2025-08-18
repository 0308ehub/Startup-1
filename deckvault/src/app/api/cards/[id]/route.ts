export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
	const resolvedParams = await params;
	// Mock data for now - will be replaced with Supabase queries
	const mockCard = {
		id: resolvedParams.id, // Use the params.id
		name: "Blue-Eyes White Dragon",
		slug: "blue-eyes-white-dragon",
		type: "Monster",
		attribute: "LIGHT",
		level: 8,
		archetype: "Blue-Eyes",
		imageUrl: "https://images.ygoprodeck.com/images/cards/89631139.jpg",
		legalTCG: true,
		legalOCG: true,
		createdAt: new Date().toISOString(),
		sets: [
			{
				id: "set1",
				setCode: "LOB-001",
				setName: "Legend of Blue Eyes White Dragon",
				rarity: "Ultra Rare",
				edition: "1st Edition",
				sku: "LOB-001-UR-1ST",
			},
			{
				id: "set2",
				setCode: "LOB-001",
				setName: "Legend of Blue Eyes White Dragon",
				rarity: "Ultra Rare",
				edition: "Unlimited",
				sku: "LOB-001-UR-UNL",
			},
		],
	};
	
	return Response.json(mockCard);
}
