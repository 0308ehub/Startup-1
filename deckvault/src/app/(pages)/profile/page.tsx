import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ProfilePage() {
	const session = await getServerSession(authOptions);
	return (
		<div className="p-6 space-y-2">
			<h1 className="text-2xl font-semibold">Profile</h1>
			<pre className="text-sm bg-gray-100 p-3 rounded">{JSON.stringify(session, null, 2)}</pre>
		</div>
	);
}


