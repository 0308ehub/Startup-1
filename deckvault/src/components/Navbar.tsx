import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { createSupabaseServer } from "@/lib/supabase/server";



export default async function Navbar() {
	const supabase = await createSupabaseServer();
	const { data: { user } } = await supabase.auth.getUser();
	
	// Debug logging
	console.log('Navbar - User:', user ? { id: user.id, email: user.email, email_confirmed_at: user.email_confirmed_at } : 'No user');
	
	let displayName = null;
	if (user) {
		// Get username from profiles table or fallback to email
		const { data: profile, error } = await supabase
			.from('profiles')
			.select('username')
			.eq('id', user.id)
			.single();
			
		console.log('Navbar - Profile lookup:', { profile, error: error?.message });
		
		displayName = profile?.username || user.user_metadata?.username || user.email;
		console.log('Navbar - Display name:', displayName);
	}

	return (
		<header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
			<div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between text-[15px] md:text-base">
				<Link href="/" className="font-semibold tracking-tight">DeckVault</Link>
				<nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
					<Link href="/catalog">Catalog</Link>
					<Link href="/dashboard">Dashboard</Link>
					<Link href="/collection">Collection</Link>
					<Link href="/decks">Decks</Link>
				</nav>
				<div className="flex items-center gap-2">
					{displayName ? (
						<div className="flex items-center gap-2">
							<div className="relative group">
								<Link href="/profile">
									<Button variant="secondary" size="sm" className="flex items-center gap-2">
										<span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
											{displayName.charAt(0).toUpperCase()}
										</span>
										<span className="hidden sm:inline">{displayName}</span>
									</Button>
								</Link>
								<div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
									<div className="py-1">
										<Link href="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
											Profile Settings
										</Link>
										<Link href="/collection" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
											My Collection
										</Link>
										<Link href="/decks" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
											My Decks
										</Link>
										<div className="border-t border-slate-100 mt-1">
											<form action="/api/auth/sign-out" method="post">
												<button type="submit" className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50">
													Sign out
												</button>
											</form>
										</div>
									</div>
								</div>
							</div>
						</div>
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


