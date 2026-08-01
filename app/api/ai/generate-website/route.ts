import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Sesiunea a expirat. Autentifică-te din nou." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, headline, bio, qr_code_slug")
    .eq("id", user.id)
    .single();

  if (!profile?.qr_code_slug) return NextResponse.json({ error: "Completează profilul înainte de a publica portofoliul." }, { status: 422 });

  const publicPath = `/portofoliu/${profile.qr_code_slug ?? profile.id}`;

  const { error } = await supabase.from("ai_generations").insert({
    profile_id: user.id,
    generation_type: "website_portfolio",
    input_prompt: "Publică template-ul EduLink cu datele confirmate din profil.",
    generated_content: {
      publicPath,
      profile: {
        full_name: profile.full_name,
        headline: profile.headline,
        bio: profile.bio,
      },
      status: "scaffolded",
    },
    ats_score: null,
  });

  if (error) {
    console.error("Portfolio publication audit failed", error);
    return NextResponse.json({ error: "Portofoliul nu a putut fi publicat acum. Încearcă din nou." }, { status: 502 });
  }

  revalidatePath(publicPath);

  return NextResponse.json({
    success: true,
    public_path: publicPath,
  });
}
