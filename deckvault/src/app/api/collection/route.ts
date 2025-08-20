import { createSupabaseServer } from '@/lib/supabase/server';
import { tcgPlayerAPI } from '@/lib/tcgplayer/api';

export async function GET() {
	try {
		const supabase = await createSupabaseServer();
		
		// Get the current user
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		
		if (authError || !user) {
			return Response.json({ items: [] });
		}

		// Get the user's collection
		const { data: collection, error: collectionError } = await supabase
			.from('collections')
			.select('id')
			.eq('user_id', user.id)
			.single();

		if (collectionError || !collection) {
			return Response.json({ items: [] });
		}

		// Get collection items
		const { data: items, error: itemsError } = await supabase
			.from('collection_items')
			.select(`
				id,
				quantity,
				condition,
				purchase_price,
				created_at,
				card_set_id
			`)
			.eq('collection_id', collection.id);

		if (itemsError) {
			console.error('Error fetching collection items:', itemsError);
			return Response.json({ items: [] });
		}

		// Get card details for each item
		const transformedItems = [];
		const productIds: number[] = [];
		
		for (const item of items || []) {
			// Get card set details
			const { data: cardSet, error: cardSetError } = await supabase
				.from('card_sets')
				.select(`
					id,
					set_code,
					set_name,
					rarity,
					edition,
					card_id
				`)
				.eq('id', item.card_set_id)
				.single();

			if (cardSetError || !cardSet) {
				continue;
			}

			// Get card details
			const { data: card, error: cardError } = await supabase
				.from('cards')
				.select(`
					id,
					product_id,
					clean_name,
					image_url,
					name,
					type,
					attribute,
					level,
					archetype
				`)
				.eq('id', cardSet.card_id)
				.single();

			if (cardError || !card) {
				continue;
			}

			// Collect product IDs for price fetching
			if (card.product_id) {
				productIds.push(parseInt(card.product_id));
			}

			transformedItems.push({
				id: item.id,
				cardId: card.product_id,
				cardName: card.clean_name || card.name,
				cardImage: card.image_url,
				setCode: cardSet.set_code,
				cardNumber: cardSet.set_code,
				rarity: cardSet.rarity,
				language: 'EN', // Default to English
				quantity: item.quantity,
				price: 0, // Will be updated with current prices
				lastUpdated: item.created_at,
				cardType: card.type,
				level: card.level,
				attribute: card.attribute,
				race: card.archetype
			});
		}

		// Fetch current prices for all cards
		let prices: { [key: number]: number } = {};
		if (productIds.length > 0) {
			try {
				const pricesResponse = await tcgPlayerAPI.getPrices(productIds);
				if (pricesResponse.success) {
					prices = pricesResponse.data;
				}
			} catch (error) {
				console.error('Error fetching prices:', error);
			}
		}

		// Update items with current prices
		const itemsWithPrices = transformedItems.map(item => ({
			...item,
			price: item.cardId ? (prices[parseInt(item.cardId)] || 0) : 0
		}));

		return Response.json({ items: itemsWithPrices });
	} catch (error) {
		console.error('Error fetching collection:', error);
		return Response.json({ items: [] });
	}
}
