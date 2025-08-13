import { createSupabaseServer } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	const supabase = await createSupabaseServer();
	const { data } = await supabase.auth.getUser();
	if (!data.user?.email) return new Response("Unauthorized", { status: 401 });
	const user = await prisma.user.findUnique({ where: { email: data.user.email } });
	return Response.json(user);
}

export async function PATCH(req: Request) {
	const supabase = await createSupabaseServer();
	const { data } = await supabase.auth.getUser();
	if (!data.user?.email) return new Response("Unauthorized", { status: 401 });
	const body = await req.json();
	const user = await prisma.user.update({
		where: { email: data.user.email },
		data: { username: body.username ?? undefined, region: body.region ?? undefined },
	});
	return Response.json(user);
}


