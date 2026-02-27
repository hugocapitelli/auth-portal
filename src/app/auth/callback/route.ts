import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClientFromEnv } from "@eximia/auth/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/apps";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClientFromEnv(cookieStore, {
      cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    });
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
