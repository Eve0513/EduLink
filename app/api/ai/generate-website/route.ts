import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, headline, bio, qr_code_slug")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profil negăsit" }, { status: 404 });
  }

  const publicPath = `/portofoliu/${profile.qr_code_slug ?? profile.id}`;

  await supabase.from("ai_generations").insert({
    profile_id: user.id,
    generation_type: "portfolio_website",
    input_prompt: "Generate public EduLink portfolio shell from verified profile data.",
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

  return NextResponse.json({
    success: true,
    public_path: publicPath,
  });
}
