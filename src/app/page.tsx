import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClientFromEnv } from "@eximia/auth/server";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createServerClientFromEnv(cookieStore, {
    cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/apps");
  } else {
    redirect("/login");
  }
}
