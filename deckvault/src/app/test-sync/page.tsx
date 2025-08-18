"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function TestSyncPage() {
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function syncUser() {
        setIsLoading(true);
        setMessage("Syncing user...");
        
        try {
            const response = await fetch('/api/auth/sync-existing-users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setMessage(`Success: ${data.message}`);
            } else {
                setMessage(`Error: ${data.error}`);
            }
        } catch (error) {
            setMessage(`Error: ${error}`);
        }
        
        setIsLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-full max-w-md px-6">
                <Card className="shadow-lg">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-2xl font-bold">Test User Sync</CardTitle>
                        <p className="text-slate-600 mt-2">Sync current user with Prisma database</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button 
                            className="w-full" 
                            onClick={syncUser}
                            disabled={isLoading}
                        >
                            {isLoading ? "Syncing..." : "Sync User"}
                        </Button>
                        
                        {message && (
                            <div className={`text-sm p-3 rounded-md ${
                                message.startsWith("Error") 
                                    ? "bg-red-50 text-red-700 border border-red-200" 
                                    : "bg-green-50 text-green-700 border border-green-200"
                            }`}>
                                {message}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
