import { createSupabaseServer } from '@/lib/supabase/server';

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
			console.log('Card product_id:', card.product_id, 'for card:', card.name);
			if (card.product_id) {
				productIds.push(parseInt(card.product_id));
			} else {
				console.log('No product_id found for card:', card.name);
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
		console.log('Product IDs for price fetching:', productIds);
		if (productIds.length > 0) {
			try {
				// Import the price API function directly instead of making an HTTP request
				const { tcgPlayerAPI } = await import('@/lib/tcgplayer/api');
				
				const pricesResponse = await tcgPlayerAPI.getProductPrices(productIds);
				console.log('Direct API response:', pricesResponse);
				
				// Process the pricing data similar to the price API route
				if (pricesResponse && pricesResponse.length > 0) {
					// Group results by product ID and extract the best price
					const productGroups = new Map<number, any[]>();
					
					pricesResponse.forEach((result: any) => {
						if (!productGroups.has(result.productId)) {
							productGroups.set(result.productId, []);
						}
						productGroups.get(result.productId)!.push(result);
					});
					
					// Extract the best price for each product
					productGroups.forEach((priceEntries: any[], productId: number) => {
						// Filter out entries with no price data
						const validPrices = priceEntries.filter(entry => 
							entry.lowPrice !== null || 
							entry.midPrice !== null || 
							entry.highPrice !== null || 
							entry.marketPrice !== null
						);
						
						if (validPrices.length > 0) {
							// Priority: lowPrice > directLowPrice > marketPrice > midPrice
							let bestPrice = null;
							
							for (const entry of validPrices) {
								if (entry.lowPrice !== null) {
									if (bestPrice === null || entry.lowPrice < bestPrice) {
										bestPrice = entry.lowPrice;
									}
								} else if (entry.directLowPrice !== null) {
									if (bestPrice === null || entry.directLowPrice < bestPrice) {
										bestPrice = entry.directLowPrice;
									}
								} else if (entry.marketPrice !== null) {
									if (bestPrice === null || entry.marketPrice < bestPrice) {
										bestPrice = entry.marketPrice;
									}
								} else if (entry.midPrice !== null) {
									if (bestPrice === null || entry.midPrice < bestPrice) {
										bestPrice = entry.midPrice;
									}
								}
							}
							
							if (bestPrice !== null) {
								prices[productId] = bestPrice;
							}
						}
					});
					
					console.log('Fetched prices:', prices);
				} else {
					console.error('No pricing data returned');
				}
			} catch (error) {
				console.error('Error fetching prices:', error);
			}
		} else {
			console.log('No product IDs found for price fetching');
		}

		// Update items with current prices
		const itemsWithPrices = transformedItems.map(item => {
			const price = item.cardId ? (prices[parseInt(item.cardId)] || 0) : 0;
			console.log('Final price for', item.cardName, 'with cardId', item.cardId, ':', price);
			return {
				...item,
				price: price
			};
		});

		return Response.json({ items: itemsWithPrices });
	} catch (error) {
		console.error('Error fetching collection:', error);
		return Response.json({ items: [] });
	}
}
