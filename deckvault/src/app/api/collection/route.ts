export async function GET() {
	try {
		// TODO: Add user authentication when Supabase auth is implemented
		// For now, return empty array - will be implemented with database
		return Response.json({ items: [] });
	} catch (error) {
		console.error('Error fetching collection:', error);
		return Response.json({ items: [] });
	}
}
