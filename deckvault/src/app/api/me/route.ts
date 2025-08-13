import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
	const supabase = await createSupabaseServer();
	const { data } = await supabase.auth.getUser();
	if (!data.user) return new Response("Unauthorized", { status: 401 });
	
	// Return user data from Supabase auth
	return Response.json({
		id: data.user.id,
		email: data.user.email,
		username: data.user.user_metadata?.username,
		imageUrl: data.user.user_metadata?.avatar_url,
		region: data.user.user_metadata?.region,
		createdAt: data.user.created_at,
		updatedAt: data.user.updated_at,
	});
}

export async function PATCH(req: Request) {
	const supabase = await createSupabaseServer();
	const { data } = await supabase.auth.getUser();
	if (!data.user) return new Response("Unauthorized", { status: 401 });
	
	const body = await req.json();
	
	// Update user metadata in Supabase
	const { data: updateData, error } = await supabase.auth.updateUser({
		data: {
			username: body.username,
			region: body.region,
		}
	});
	
	if (error) {
		return new Response(JSON.stringify({ error: error.message }), { 
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	
	return Response.json({
		id: updateData.user?.id,
		email: updateData.user?.email,
		username: updateData.user?.user_metadata?.username,
		imageUrl: updateData.user?.user_metadata?.avatar_url,
		region: updateData.user?.user_metadata?.region,
		createdAt: updateData.user?.created_at,
		updatedAt: updateData.user?.updated_at,
	});
}


