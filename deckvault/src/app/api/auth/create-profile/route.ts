import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function POST() {
    try {
        const supabase = await createSupabaseServer();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if profile already exists
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (existingProfile) {
            return NextResponse.json({ 
                message: 'Profile already exists',
                profile: existingProfile 
            });
        }

        // Create profile
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
                email: user.email!,
                avatar_url: user.user_metadata?.avatar_url || null,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating profile:', insertError);
            return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
        }

        return NextResponse.json({ 
            message: 'Profile created successfully',
            profile: newProfile 
        });

    } catch (error) {
        console.error('Error creating profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
