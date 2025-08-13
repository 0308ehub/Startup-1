export async function POST() {
	const ydk = "#created by DeckVault\n#main\n#extra\n!side\n";
	return new Response(ydk, {
		headers: { "Content-Type": "text/plain", "Content-Disposition": "attachment; filename=deck.ydk" },
	});
}
