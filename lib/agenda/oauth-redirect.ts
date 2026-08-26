/** URI de callback OAuth — sem puxar `googleapis` no bundle da página. */
export function redirectUriOAuth() {
  const base =
    process.env.APP_URL?.trim().replace(/\/$/, "") ?? "http://localhost:3000";
  return (
    process.env.GOOGLE_CALENDAR_REDIRECT_URI?.trim() ||
    `${base}/api/google-calendar/callback`
  );
}
