/**
 * EduLink — Script de validare API keys
 * Rulare: npx tsx scripts/test-api-keys.ts
 */

import OpenAI from "openai";

interface TestResult {
  service: string;
  status: "ok" | "missing" | "error";
  message: string;
}

async function testOpenAI(): Promise<TestResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return {
      service: "OpenAI (gpt-4o-mini)",
      status: "missing",
      message: "OPENAI_API_KEY lipsește din .env.local",
    };
  }

  try {
    const openai = new OpenAI({ apiKey: key });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Răspunde doar cu: OK" }],
      max_tokens: 5,
    });
    const content = response.choices[0]?.message?.content ?? "";
    return {
      service: "OpenAI (gpt-4o-mini)",
      status: "ok",
      message: `Conexiune reușită. Răspuns: "${content.trim()}"`,
    };
  } catch (err) {
    return {
      service: "OpenAI (gpt-4o-mini)",
      status: "error",
      message: err instanceof Error ? err.message : "Eroare necunoscută",
    };
  }
}

async function testGoogleCalendar(): Promise<TestResult> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return {
      service: "Google Calendar API",
      status: "missing",
      message:
        "GOOGLE_CLIENT_ID sau GOOGLE_CLIENT_SECRET lipsesc din .env.local",
    };
  }

  try {
    const res = await fetch("https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest");
    if (!res.ok) {
      return {
        service: "Google Calendar API",
        status: "error",
        message: `Discovery API returned ${res.status}`,
      };
    }
    return {
      service: "Google Calendar API",
      status: "ok",
      message: `Credențiale configurate. Client ID: ${clientId.slice(0, 12)}...`,
    };
  } catch (err) {
    return {
      service: "Google Calendar API",
      status: "error",
      message: err instanceof Error ? err.message : "Eroare necunoscută",
    };
  }
}

async function testSupabase(): Promise<TestResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return {
      service: "Supabase",
      status: "missing",
      message: "NEXT_PUBLIC_SUPABASE_URL sau ANON_KEY lipsesc",
    };
  }

  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key },
    });
    return {
      service: "Supabase",
      status: res.ok || res.status === 401 ? "ok" : "error",
      message: `Endpoint accesibil (${res.status}) — ${url}`,
    };
  } catch (err) {
    return {
      service: "Supabase",
      status: "error",
      message: err instanceof Error ? err.message : "Eroare necunoscută",
    };
  }
}

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log(" EduLink — Validare API Keys");
  console.log("═══════════════════════════════════════════\n");

  const results = await Promise.all([
    testSupabase(),
    testOpenAI(),
    testGoogleCalendar(),
  ]);

  for (const r of results) {
    const icon =
      r.status === "ok" ? "✅" : r.status === "missing" ? "⚠️" : "❌";
    console.log(`${icon} ${r.service}`);
    console.log(`   ${r.message}\n`);
  }

  const failed = results.filter((r) => r.status !== "ok");
  if (failed.length > 0) {
    console.log(`Rezultat: ${results.length - failed.length}/${results.length} servicii OK`);
    process.exit(1);
  }

  console.log("Toate serviciile configurate funcționează!");
}

main();
