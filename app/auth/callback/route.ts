import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type PendingCookie = { name: string; value: string; options: CookieOptions };
type ProfileRedirectData = {
  role: "student" | "company" | "institution" | "admin" | null;
  onboarding_completed: boolean | null;
};

function isInternalPath(value: string | null): value is string {
  return Boolean(value?.startsWith("/") && !value.startsWith("//"));
}

function dashboardPath(profile: ProfileRedirectData, requestedNext: string | null) {
  if (!profile.onboarding_completed) return "/onboarding";

  if (isInternalPath(requestedNext) && requestedNext !== "/dashboard") return requestedNext;
  if (profile.role === "student") return "/feed";
  if (profile.role === "company") return "/dashboard/company";
  if (profile.role === "institution") return "/dashboard/institution";
  return "/onboarding";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const requestedNext = searchParams.get("next");
  const pendingCookies: PendingCookie[] = [];
  const pendingHeaders: Record<string, string> = {};

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies, headers) => {
          pendingCookies.push(...cookies);
          Object.assign(pendingHeaders, headers);
        },
      },
    }
  );

  const redirect = (path: string) => {
    const response = NextResponse.redirect(`${origin}${path}`);
    pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
    Object.entries(pendingHeaders).forEach(([name, value]) => response.headers.set(name, value));
    return response;
  };

  const result = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type === "signup"
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "signup" })
      : null;

  if (!result?.error && result?.data.user) {
    const user = result.data.user;
    const metadata = user.user_metadata;
    const firstName = typeof metadata.first_name === "string" ? metadata.first_name : null;
    const lastName = typeof metadata.last_name === "string" ? metadata.last_name : null;
    const fullName = typeof metadata.full_name === "string" && metadata.full_name.trim()
      ? metadata.full_name.trim()
      : [firstName, lastName].filter(Boolean).join(" ") || user.email?.split("@")[0] || "Utilizator EduLink";

    const { data: profile, error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email ?? "",
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
    }, { onConflict: "id" }).select("role, onboarding_completed").single<ProfileRedirectData>();

    if (!profileError && profile) return redirect(dashboardPath(profile, requestedNext));
  }

  return redirect("/auth/confirm-email?error=auth_callback_failed");
}
