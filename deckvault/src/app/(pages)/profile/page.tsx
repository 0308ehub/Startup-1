"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export default function ProfilePage() {
	const [username, setUsername] = useState("");
	const [region, setRegion] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			const res = await fetch("/api/me");
			if (res.ok) {
				const u = await res.json();
				setUsername(u?.username ?? "");
				setRegion(u?.region ?? "");
			}
			setLoading(false);
		})();
	}, []);

    async function save() {
        await fetch("/api/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, region }) });
        const supabase = getSupabaseBrowser();
        await supabase.auth.updateUser({ data: { username } });
        alert("Saved");
    }

	if (loading) return <div className="p-6">Loading…</div>;

	return (
		<div className="p-6 space-y-4 max-w-md">
			<h1 className="text-2xl font-semibold">Profile</h1>
			<div className="space-y-2">
				<label className="block text-sm">Username</label>
				<input className="w-full border rounded px-3 py-2" value={username} onChange={(e) => setUsername(e.target.value)} />
			</div>
			<div className="space-y-2">
				<label className="block text-sm">Region</label>
				<input className="w-full border rounded px-3 py-2" value={region} onChange={(e) => setRegion(e.target.value)} />
			</div>
			<button className="border rounded px-4 py-2" onClick={save}>Save</button>
		</div>
	);
}


