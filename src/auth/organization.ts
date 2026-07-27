export const allowedEmailDomain = (
  import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN ??
  import.meta.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN ??
  'epsfresno.com'
).toLowerCase();

export function getAccountEmail(
  account: { username?: string } | undefined,
): string {
  return (account?.username ?? '').trim().toLowerCase();
}

export function isAllowedOrganizationEmail(email: string): boolean {
  if (!email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return domain === allowedEmailDomain;
}
