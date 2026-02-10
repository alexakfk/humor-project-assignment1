import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ code?: string; state?: string }> };

/**
 * Google redirects here with ?code=...&state=....
 * We immediately redirect to the API route so the OAuth code exchange
 * happens entirely on the server (GET /api/auth/callback).
 */
export default async function AuthCallbackPage({ searchParams }: Props) {
  const params = await searchParams;
  const code = params?.code;
  const state = params?.state;

  if (!code || !state) {
    redirect("/assignment-3?error=missing_params");
  }

  const q = new URLSearchParams({ code, state });
  redirect(`/api/auth/callback?${q.toString()}`);
}
