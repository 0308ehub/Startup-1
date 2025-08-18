"use client";
import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { username?: string; avatar_url?: string } } | null>(null);
    const [profile, setProfile] = useState<{ id: string; username: string; email: string; region?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [username, setUsername] = useState("");
    const [region, setRegion] = useState("");
    const router = useRouter();

    useEffect(() => {
        async function loadProfile() {
            const supabase = getSupabaseBrowser();
            
            // Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user) {
                router.push('/sign-in');
                return;
            }

            setUser(user);

            // Get profile data
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') {
                console.error('Error loading profile:', profileError);
                setMessage("Error loading profile data");
            } else if (profileData) {
                setProfile(profileData);
                setUsername(profileData.username || "");
                setRegion(profileData.region || "");
            }

            setLoading(false);
        }

        loadProfile();
    }, [router]);

    async function saveProfile() {
        setSaving(true);
        setMessage("");

        const supabase = getSupabaseBrowser();

        try {
            if (!user) {
                setMessage("User not found");
                return;
            }
            
            if (profile) {
                // Update existing profile
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        username,
                        region,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', user.id);

                if (error) {
                    setMessage(`Error updating profile: ${error.message}`);
                } else {
                    setMessage("Profile updated successfully!");
                    setProfile({ ...profile, username, region });
                }
            } else {
                // Create new profile
                const { error } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        username,
                        email: user.email || '',
                        region,
                        avatar_url: user.user_metadata?.avatar_url || null
                    });

                if (error) {
                    setMessage(`Error creating profile: ${error.message}`);
                } else {
                    setMessage("Profile created successfully!");
                    setProfile({ id: user.id, username, email: user.email || '', region });
                }
            }
        } catch (error) {
            setMessage(`Error: ${error}`);
        }

        setSaving(false);
    }

    async function signOut() {
        const supabase = getSupabaseBrowser();
        await supabase.auth.signOut();
        router.push('/');
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Email</label>
                            <Input
                                value={user?.email || ""}
                                disabled
                                className="bg-slate-50"
                            />
                            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">Username</label>
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">Region</label>
                            <Input
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                placeholder="e.g., North America, Europe"
                            />
                        </div>

                        <Button 
                            onClick={saveProfile} 
                            disabled={saving}
                            className="w-full"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>

                        {message && (
                            <div className={`text-sm p-3 rounded-md ${
                                message.includes("Error") 
                                    ? "bg-red-50 text-red-700 border border-red-200" 
                                    : "bg-green-50 text-green-700 border border-green-200"
                            }`}>
                                {message}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Account Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-medium">Danger Zone</h3>
                            <p className="text-sm text-slate-600">
                                These actions cannot be undone.
                            </p>
                        </div>

                        <Button 
                            variant="secondary" 
                            onClick={signOut}
                            className="w-full"
                        >
                            Sign Out
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


