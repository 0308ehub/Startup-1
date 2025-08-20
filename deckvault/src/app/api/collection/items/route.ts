import { NextRequest } from "next/server";
import { createSupabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
	try {
		const supabase = await createSupabaseServer();
		
		// Get the current user
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		
		if (authError || !user) {
			return Response.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();
		const { cardId, cardName, cardImage, quantity = 1 } = body;

		// Get the user's collection
		const { data: collection, error: collectionError } = await supabase
			.from('collections')
			.select('id')
			.eq('user_id', user.id)
			.single();

		if (collectionError || !collection) {
			return Response.json({ error: 'Collection not found' }, { status: 404 });
		}

		// First, check if the card exists in our cards table
		let card;
		const { data: existingCard, error: cardError } = await supabase
			.from('cards')
			.select('id')
			.eq('product_id', cardId)
			.single();

		// If card doesn't exist, create it
		if (cardError || !existingCard) {
			const { data: newCard, error: insertCardError } = await supabase
				.from('cards')
				.insert({
					product_id: cardId,
					clean_name: cardName,
					image_url: cardImage,
					name: cardName
				})
				.select('id')
				.single();

			if (insertCardError) {
				console.error('Error creating card:', insertCardError);
				return Response.json({ error: 'Failed to create card' }, { status: 500 });
			}
			card = newCard;
		} else {
			card = existingCard;
		}

		// Create a default card set for the card (if it doesn't exist)
		let cardSet;
		const { data: existingCardSet, error: cardSetError } = await supabase
			.from('card_sets')
			.select('id')
			.eq('card_id', card.id)
			.eq('set_code', 'DEFAULT')
			.single();

		// If card set doesn't exist, create it
		if (cardSetError || !existingCardSet) {
			const { data: newCardSet, error: insertCardSetError } = await supabase
				.from('card_sets')
				.insert({
					card_id: card.id,
					set_code: 'DEFAULT',
					set_name: 'Default Set',
					rarity: 'Common',
					sku: `${cardId}_DEFAULT`
				})
				.select('id')
				.single();

			if (insertCardSetError) {
				console.error('Error creating card set:', insertCardSetError);
				return Response.json({ error: 'Failed to create card set' }, { status: 500 });
			}
			cardSet = newCardSet;
		} else {
			cardSet = existingCardSet;
		}

		// Check if the card is already in the collection
		const { data: existingItem } = await supabase
			.from('collection_items')
			.select('id, quantity')
			.eq('collection_id', collection.id)
			.eq('card_set_id', cardSet.id)
			.single();

		if (existingItem) {
			// Update quantity if card already exists
			const { error: updateError } = await supabase
				.from('collection_items')
				.update({ quantity: existingItem.quantity + quantity })
				.eq('id', existingItem.id);

			if (updateError) {
				console.error('Error updating collection item:', updateError);
				return Response.json({ error: 'Failed to update collection' }, { status: 500 });
			}

			return Response.json({ 
				ok: true, 
				item: { ...existingItem, quantity: existingItem.quantity + quantity },
				action: 'updated'
			});
		} else {
			// Add new card to collection
			const { data: newItem, error: insertError } = await supabase
				.from('collection_items')
				.insert({
					collection_id: collection.id,
					card_set_id: cardSet.id,
					quantity: quantity
				})
				.select('id, quantity')
				.single();

			if (insertError) {
				console.error('Error adding card to collection:', insertError);
				return Response.json({ error: 'Failed to add card to collection' }, { status: 500 });
			}

			return Response.json({ 
				ok: true, 
				item: newItem,
				action: 'added'
			});
		}
	} catch (error) {
		console.error('Error adding card to collection:', error);
		return Response.json({ error: 'Internal server error' }, { status: 500 });
	}
}
