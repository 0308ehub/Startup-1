"use client";
import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export default function TestConnectionPage() {
    const [status, setStatus] = useState("Testing...");
    const [envVars, setEnvVars] = useState<{ url: string; key: string; urlValue: string }>({ url: '', key: '', urlValue: '' });

    useEffect(() => {
        async function testConnection() {
            try {
                // Check environment variables
                const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
                
                setEnvVars({
                    url: url ? "Set" : "Missing",
                    key: key ? "Set" : "Missing",
                    urlValue: url ? url.substring(0, 20) + "..." : "Not set"
                });

                if (!url || !key) {
                    setStatus("❌ Environment variables missing");
                    return;
                }

                // Test Supabase connection
                const supabase = getSupabaseBrowser();
                const { error } = await supabase.auth.getSession();

                if (error) {
                    setStatus(`❌ Connection failed: ${error.message}`);
                } else {
                    setStatus("✅ Supabase connection successful");
                }
            } catch (error) {
                setStatus(`❌ Error: ${error}`);
            }
        }

        testConnection();
    }, []);

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
            
            <div className="space-y-4">
                <div>
                    <h2 className="font-semibold">Environment Variables:</h2>
                    <div className="text-sm space-y-1">
                        <div>URL: {envVars.url}</div>
                        <div>Key: {envVars.key}</div>
                        <div>URL Preview: {envVars.urlValue}</div>
                    </div>
                </div>

                <div>
                    <h2 className="font-semibold">Connection Status:</h2>
                    <div className="text-sm">{status}</div>
                </div>

                <div className="text-xs text-gray-600">
                    <p>If connection fails, check:</p>
                    <ul className="list-disc list-inside mt-1">
                        <li>Environment variables in .env.local</li>
                        <li>Supabase project settings</li>
                        <li>Email authentication is enabled</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
