import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServer();
        
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Signed out successfully' });
    } catch (error) {
        console.error('Sign out error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
