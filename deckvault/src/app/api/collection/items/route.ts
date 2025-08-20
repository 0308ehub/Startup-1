import { NextRequest } from "next/server";
import { createSupabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
	try {
		const supabase = await createSupabaseServer();
		
		// Get the current user
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		
		if (authError || !user) {
			console.error('Authentication error:', authError);
			console.error('User data:', user);
			// Return a more graceful error instead of 401
			return Response.json({ error: 'Authentication required' }, { status: 403 });
		}

		console.log('Authenticated user:', user.id);

		const body = await req.json();
		const { cardId, cardName, cardImage, quantity = 1 } = body;
		
		console.log('Adding card to collection:', { cardId, cardName, quantity });

		// Get or create the user's collection
		const { data: collection, error: collectionError } = await supabase
			.from('collections')
			.select('id')
			.eq('user_id', user.id)
			.single();

		let finalCollection = collection;
		if (collectionError || !collection) {
			console.log('Collection not found, creating new collection for user:', user.id);
			// Try to create collection if it doesn't exist
			const { data: newCollection, error: createError } = await supabase
				.from('collections')
				.insert({ user_id: user.id })
				.select('id')
				.single();

			if (createError || !newCollection) {
				console.error('Error creating collection:', createError);
				return Response.json({ error: 'Failed to create collection' }, { status: 500 });
			}
			finalCollection = newCollection;
			console.log('Created new collection:', finalCollection.id);
		} else {
			console.log('Found existing collection:', finalCollection?.id);
		}

		// Ensure we have a valid collection
		if (!finalCollection) {
			console.error('No collection available after creation/retrieval');
			return Response.json({ error: 'Failed to get or create collection' }, { status: 500 });
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
			console.log('Creating new card with data:', { cardId, cardName, cardImage });
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
				console.error('Error details:', {
					message: insertCardError.message,
					details: insertCardError.details,
					hint: insertCardError.hint,
					code: insertCardError.code
				});
				return Response.json({ 
					error: 'Failed to create card',
					details: insertCardError.message 
				}, { status: 500 });
			}
			card = newCard;
			console.log('Successfully created card:', card.id);
		} else {
			card = existingCard;
			console.log('Using existing card:', card.id);
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
			.eq('collection_id', finalCollection.id)
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

			console.log('Updated existing collection item:', existingItem.id, 'new quantity:', existingItem.quantity + quantity);
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
					collection_id: finalCollection.id,
					card_set_id: cardSet.id,
					quantity: quantity
				})
				.select('id, quantity')
				.single();

			if (insertError) {
				console.error('Error adding card to collection:', insertError);
				return Response.json({ error: 'Failed to add card to collection' }, { status: 500 });
			}

			console.log('Added new collection item:', newItem.id);
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
