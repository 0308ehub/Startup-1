export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const query = searchParams.get("q") || "";
	const page = parseInt(searchParams.get("page") || "1");
	const limit = parseInt(searchParams.get("limit") || "20");
	
	// Mock data for now to avoid Prisma build issues
	const mockCards = [
		{
			id: "1",
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
		},
		{
			id: "2",
			name: "Dark Magician",
			slug: "dark-magician",
			type: "Monster",
			attribute: "DARK",
			level: 7,
			archetype: "Dark Magician",
			imageUrl: "https://images.ygoprodeck.com/images/cards/46986414.jpg",
			legalTCG: true,
			legalOCG: true,
			createdAt: new Date().toISOString(),
		},
		{
			id: "3",
			name: "Red-Eyes Black Dragon",
			slug: "red-eyes-black-dragon",
			type: "Monster",
			attribute: "DARK",
			level: 7,
			archetype: "Red-Eyes",
			imageUrl: "https://images.ygoprodeck.com/images/cards/74677422.jpg",
			legalTCG: true,
			legalOCG: true,
			createdAt: new Date().toISOString(),
		},
	];
	
	// Simple search filter
	const filteredCards = mockCards.filter(card => 
		card.name.toLowerCase().includes(query.toLowerCase()) ||
		card.archetype?.toLowerCase().includes(query.toLowerCase())
	);
	
	// Pagination
	const startIndex = (page - 1) * limit;
	const endIndex = startIndex + limit;
	const paginatedCards = filteredCards.slice(startIndex, endIndex);
	
	return Response.json({
		items: paginatedCards,
		total: filteredCards.length,
		page,
		limit,
		totalPages: Math.ceil(filteredCards.length / limit),
	});
}