/**
 * EduLink - Script de validare API keys
 * Rulare: npx tsx scripts/test-api-keys.ts
 */

import { GoogleGenAI } from "@google/genai";

interface TestResult {
  service: string;
  status: "ok" | "missing" | "error";
  message: string;
}

async function testGemini(): Promise<TestResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return {
      service: "Google Gemini (gemini-2.5-flash)",
      status: "missing",
      message: "GEMINI_API_KEY lipseste din .env.local",
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Raspunde doar cu: OK",
    });
    const content = response.text ?? "";

    return {
      service: "Google Gemini (gemini-2.5-flash)",
      status: "ok",
      message: `Conexiune reusita. Raspuns: "${content.trim()}"`,
    };
  } catch (err) {
    return {
      service: "Google Gemini (gemini-2.5-flash)",
      status: "error",
      message: err instanceof Error ? err.message : "Eroare necunoscuta",
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
      message: "GOOGLE_CLIENT_ID sau GOOGLE_CLIENT_SECRET lipsesc din .env.local",
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
      message: `Credentiale configurate. Client ID: ${clientId.slice(0, 12)}...`,
    };
  } catch (err) {
    return {
      service: "Google Calendar API",
      status: "error",
      message: err instanceof Error ? err.message : "Eroare necunoscuta",
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
      message: `Endpoint accesibil (${res.status}) - ${url}`,
    };
  } catch (err) {
    return {
      service: "Supabase",
      status: "error",
      message: err instanceof Error ? err.message : "Eroare necunoscuta",
    };
  }
}

async function main() {
  console.log("EduLink - Validare API Keys\n");

  const results = await Promise.all([
    testSupabase(),
    testGemini(),
    testGoogleCalendar(),
  ]);

  for (const result of results) {
    const icon = result.status === "ok" ? "OK" : result.status === "missing" ? "MISSING" : "ERROR";
    console.log(`[${icon}] ${result.service}`);
    console.log(`   ${result.message}\n`);
  }

  const failed = results.filter((result) => result.status !== "ok");
  if (failed.length > 0) {
    console.log(`Rezultat: ${results.length - failed.length}/${results.length} servicii OK`);
    process.exit(1);
  }

  console.log("Toate serviciile configurate functioneaza!");
}

main();
