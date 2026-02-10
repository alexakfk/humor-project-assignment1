"use client";

import { useState, useEffect } from "react";
import {
  generateCodeVerifier,
  computeCodeChallenge,
  getAppCallbackUrl,
} from "@/lib/auth";

export default function GatedUI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectUri, setRedirectUri] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setRedirectUri(getAppCallbackUrl());
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  async function handleSignIn() {
    setError(null);
    setLoading(true);
    try {
      const verifier = generateCodeVerifier();
      const code_challenge = await computeCodeChallenge(verifier);
      const state =
        typeof crypto !== "undefined" && crypto.getRandomValues
          ? btoa(
              String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16)))
            )
              .replace(/\+/g, "-")
              .replace(/\//g, "_")
              .replace(/=+$/, "")
          : Math.random().toString(36).slice(2);

      const redirect_to = getAppCallbackUrl();
      if (!redirect_to) throw new Error("App callback URL could not be determined");

      const res = await fetch("/api/auth/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code_challenge,
          state,
          code_verifier: verifier,
          redirect_to, // Where Supabase sends user after auth
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      const { authUrl, redirect_uri_used } = data;
      if (!authUrl) throw new Error("No auth URL returned");
      if (redirect_uri_used) {
        console.info(
          "[OAuth] Add this exact URL in Google Cloud Console → Authorized redirect URIs:",
          redirect_uri_used
        );
      }
      window.location.href = authUrl;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Sign-in failed.";
      setError(message);
      setLoading(false);
    }
  }

  return (
    <div className="gated-ui">
      <div className="gated-ui-card">
        <h2 className="gated-ui-title">Assignment 3</h2>
        <p className="gated-ui-text">
          This route is protected. Sign in with Google to continue.
        </p>
        {error && <p className="error gated-ui-error">{error}</p>}
        <button
          type="button"
          onClick={handleSignIn}
          disabled={loading}
          className="gated-ui-button"
        >
          {loading ? "Redirecting…" : "Sign in with Google"}
        </button>
        {redirectUri && (
          <p className="gated-ui-redirect-hint">
            If you see &quot;redirect_uri_mismatch&quot;, add this{" "}
            <strong>exact</strong> URL in Google Cloud Console → Credentials →
            your OAuth client → Authorized redirect URIs:
            <br />
            <code className="gated-ui-redirect-uri">{redirectUri}</code>
          </p>
        )}
        {redirectUri && (
          <div className="gated-ui-redirect-hint">
            <p>Redirect URI being sent:</p>
            <code className="gated-ui-redirect-uri">{redirectUri}</code>
            {origin && (
              <p>
                Current origin:{" "}
                <code className="gated-ui-redirect-uri">{origin}</code>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
