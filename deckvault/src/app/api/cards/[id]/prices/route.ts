export async function GET(req: Request, { params: _params }: any) {
	const { searchParams } = new URL(req.url);
	const range = searchParams.get("range") === "90d" ? 90 : 30;
	
	// Mock price data for now to avoid Prisma build issues
	const mockPrices = [
		{
			id: "price1",
			cardSetId: "set1",
			source: "TCGPlayer",
			currency: "USD",
			value: 25.99,
			asOf: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "price2",
			cardSetId: "set1",
			source: "TCGPlayer",
			currency: "USD",
			value: 24.50,
			asOf: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "price3",
			cardSetId: "set1",
			source: "TCGPlayer",
			currency: "USD",
			value: 26.75,
			asOf: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
		},
	];
	
	return Response.json({ items: mockPrices });
}
