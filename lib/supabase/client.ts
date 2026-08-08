import { createBrowserClient } from "@supabase/ssr";

import { SUPABASE_PROJECT_REF } from "@/lib/supabase/project";
import type { Database } from "@/types/database";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      `Missing Supabase env for Personal Calendar (${SUPABASE_PROJECT_REF}). Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.`,
    );
  }

  return createBrowserClient<Database>(url, key);
}
