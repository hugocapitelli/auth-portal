import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClientFromEnv } from "@eximia/auth/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClientFromEnv(cookieStore, {
    cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
  });
  await supabase.auth.signOut();

  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`);
}
