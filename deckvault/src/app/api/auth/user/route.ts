import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET() {
	try {
		const supabase = await createSupabaseServer();
		const { data: { user }, error } = await supabase.auth.getUser();
		
		if (error) {
			console.error('User error:', error);
			return Response.json({ error: error.message }, { status: 500 });
		}
		
		return Response.json({ user });
	} catch (error) {
		console.error('User route error:', error);
		return Response.json({ error: 'Internal server error' }, { status: 500 });
	}
}
