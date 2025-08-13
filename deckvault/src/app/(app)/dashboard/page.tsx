import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
	const session = await getServerSession(authOptions);
	if (!session) redirect("/sign-in");
	return (
		<div className="p-6">
			<h1 className="text-2xl font-semibold">Dashboard</h1>
			<p>Welcome, {session.user?.name ?? session.user?.email}</p>
		</div>
	);
} 