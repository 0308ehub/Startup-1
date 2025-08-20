import { createBrowserClient, type SupabaseClient } from "@supabase/ssr";

let client: SupabaseClient | null = null;

export function getSupabaseBrowser() {
    if (!client) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) {
            throw new Error("Supabase env missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
        }
        client = createBrowserClient(url, key);
    }
    return client;
}


