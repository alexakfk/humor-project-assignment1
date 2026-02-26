"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type GatedUIProps = {
  title?: string;
  description?: string;
};

export default function GatedUI({
  title = "Sign in Required",
  description = "This page is protected. Sign in with Google to continue.",
}: GatedUIProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (authError) throw authError;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No auth URL returned");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Sign-in failed.";
      setError(message);
      setLoading(false);
    }
  }

  return (
    <div className="gated-ui">
      <div className="gated-ui-card">
        <h2 className="gated-ui-title">{title}</h2>
        <p className="gated-ui-text">{description}</p>
        {error && <p className="error gated-ui-error">{error}</p>}
        <button
          type="button"
          onClick={handleSignIn}
          disabled={loading}
          className="gated-ui-button"
        >
          {loading ? "Redirecting…" : "Sign in with Google"}
        </button>
      </div>
    </div>
  );
}
