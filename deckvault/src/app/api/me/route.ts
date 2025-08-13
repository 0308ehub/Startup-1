import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
	const supabase = await createSupabaseServer();
	const { data } = await supabase.auth.getUser();
	if (!data.user) return new Response("Unauthorized", { status: 401 });
	
	// Get user profile from profiles table
	const { data: profile, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', data.user.id)
		.single();
	
	if (error) {
		return new Response(JSON.stringify({ error: error.message }), { 
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	
	return Response.json(profile);
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


