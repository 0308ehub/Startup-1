import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
	try {
		const supabase = await createSupabaseServer();
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		
		if (authError || !user) {
			console.log('Authentication error:', authError);
			return new Response("Unauthorized", { status: 401 });
		}
		
		console.log('User authenticated:', user.id);
		
		// Get user profile from profiles table
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', user.id)
			.single();
		
		if (profileError) {
			console.log('Profile not found, creating one for user:', user.id);
			// Create profile if it doesn't exist
			const { data: newProfile, error: createError } = await supabase
				.from('profiles')
				.insert({
					id: user.id,
					username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
					email: user.email || ''
				})
				.select('*')
				.single();
			
			if (createError) {
				console.error('Error creating profile:', createError);
				// Return basic user info even if profile creation fails
				return Response.json({
					id: user.id,
					email: user.email,
					username: user.user_metadata?.username || user.email?.split('@')[0] || 'user'
				});
			}
			
			return Response.json(newProfile);
		}
		
		return Response.json(profile);
	} catch (error) {
		console.error('Error in /api/me:', error);
		return new Response("Internal Server Error", { status: 500 });
	}
}

export async function PATCH(req: Request) {
	const supabase = await createSupabaseServer();
	const { data } = await supabase.auth.getUser();
	if (!data.user) return new Response("Unauthorized", { status: 401 });
	
	const body = await req.json();
	
	// Update user profile in profiles table
	const { data: updateData, error } = await supabase
		.from('profiles')
		.update({
			username: body.username,
			region: body.region,
			updated_at: new Date().toISOString()
		})
		.eq('id', data.user.id)
		.select()
		.single();
	
	if (error) {
		return new Response(JSON.stringify({ error: error.message }), { 
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	
	return Response.json(updateData);
}


