export const publicConfig = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(
    /\/$/,
    '',
  ),
  legalEntity:
    process.env.NEXT_PUBLIC_LEGAL_ENTITY_NAME ||
    'PT Sadani Teknologi Indonesia',
  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@manifly.id',
  policyVersion: process.env.NEXT_PUBLIC_POLICY_VERSION || '2026-09-10',
};
