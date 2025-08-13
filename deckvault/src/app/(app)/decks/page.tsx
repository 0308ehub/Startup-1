import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function DecksPage() {
	const session = await getServerSession(authOptions);
	if (!session) redirect("/sign-in");
	return (
		<div className="p-6">
			<h1 className="text-2xl font-semibold">Decks</h1>
			<p>Coming soon.</p>
		</div>
	);
} 