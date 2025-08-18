import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { PrismaClient } from '@/src/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServer();
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
                message: 'User already exists',
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
            message: 'User created successfully',
            user: newUser 
        });

    } catch (error) {
        console.error('Error syncing user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
