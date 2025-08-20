import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET() {
	try {
		const supabase = await createSupabaseServer();
		const { data: { session }, error } = await supabase.auth.getSession();
		
		if (error) {
			console.error('Session error:', error);
			return Response.json({ error: error.message }, { status: 500 });
		}
		
		return Response.json({ session });
	} catch (error) {
		console.error('Session route error:', error);
		return Response.json({ error: 'Internal server error' }, { status: 500 });
	}
}
