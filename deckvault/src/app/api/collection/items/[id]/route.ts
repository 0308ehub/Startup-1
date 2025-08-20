/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { createSupabaseServer } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest, { params }: any) {
	const body = await req.json();
	return Response.json({ ok: true, id: params.id, updates: body });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServer();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Deleting collection item:', id, 'for user:', user.id);

    // Delete the collection item
    const { error: deleteError } = await supabase
      .from('collection_items')
      .delete()
      .eq('id', id)
      .eq('collection_id', (await supabase
        .from('collections')
        .select('id')
        .eq('user_id', user.id)
        .single()
      ).data?.id);

    if (deleteError) {
      console.error('Error deleting collection item:', deleteError);
      return Response.json({ 
        error: 'Failed to delete collection item',
        details: deleteError.message 
      }, { status: 500 });
    }

    console.log('Successfully deleted collection item:', id);
    return Response.json({ ok: true });
    
  } catch (error) {
    console.error('Error deleting collection item:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
