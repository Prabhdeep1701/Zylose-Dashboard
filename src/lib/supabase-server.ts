import { createClient } from "@supabase/supabase-js";

const transientNetworkError = /fetch failed|connect timeout|timed out|ECONNRESET|ENOTFOUND/i;

async function fetchWithReadRetry(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const method = (init?.method || "GET").toUpperCase();
  const attempts = method === "GET" || method === "HEAD" ? 2 : 1;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fetch(input, init);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (attempt === attempts || !transientNetworkError.test(message)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }

  throw new Error("Supabase request failed");
}

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables"
  );
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
  global: { fetch: fetchWithReadRetry },
});
