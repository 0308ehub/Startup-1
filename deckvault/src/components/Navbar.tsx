import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function Navbar() {
	const supabase = await createSupabaseServer();
	const { data } = await supabase.auth.getUser();
	const displayName = data.user?.user_metadata?.username || data.user?.email;

	return (
		<header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
			<div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
				<Link href="/" className="font-semibold tracking-tight">DeckVault</Link>
				<nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
					<Link href="/catalog">Catalog</Link>
					<Link href="/dashboard">Dashboard</Link>
					<Link href="/collection">Collection</Link>
					<Link href="/decks">Decks</Link>
					<Link href="/market">Market</Link>
				</nav>
				<div className="flex items-center gap-2">
					{displayName ? (
						<>
							<Link href="/profile"><Button variant="secondary" size="sm">{displayName}</Button></Link>
							<form action="/api/auth/sign-out" method="post">
								<Button type="submit" variant="ghost" size="sm">Sign out</Button>
							</form>
						</>
					) : (
						<>
							<Link href="/sign-in"><Button size="sm">Sign in</Button></Link>
							<Link href="/sign-up"><Button variant="secondary" size="sm">Sign up</Button></Link>
						</>
					)}
				</div>
			</div>
		</header>
	);
}


