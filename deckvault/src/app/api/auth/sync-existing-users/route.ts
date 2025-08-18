import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { PrismaClient } from '@/src/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServer();
        
        // Get all users from Supabase auth (this is a simplified approach)
        // In production, you might want to use Supabase's admin API
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user already exists in Prisma database
        const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
        });

        if (existingUser) {
            return NextResponse.json({ 
                message: 'User already exists in Prisma database',
                user: existingUser 
            });
        }

        // Create new user in Prisma database
        const newUser = await prisma.user.create({
            data: {
                email: user.email!,
                username: user.user_metadata?.username || null,
                imageUrl: user.user_metadata?.avatar_url || null,
            }
        });

        return NextResponse.json({ 
            message: 'User created successfully in Prisma database',
            user: newUser 
        });

    } catch (error) {
        console.error('Error syncing existing user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
