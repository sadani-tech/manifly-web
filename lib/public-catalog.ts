import 'server-only';
import type {
  MembershipAddonSummary,
  MembershipPlanSummary,
} from '@/lib/api';

const entitlements = (
  numbers: number,
  chat: number,
  voice: number,
  proactive: number,
) => ({
  'whatsapp.numbers': numbers,
  'whatsapp.chat_actions': chat,
  'whatsapp.voice_seconds': voice,
  'whatsapp.proactive_deliveries': proactive,
});

export const FALLBACK_PLANS: MembershipPlanSummary[] = [
  {
    code: 'free',
    name: 'Free',
    version: 1,
    priceMonthly: 0,
    currency: 'IDR',
    entitlements: entitlements(1, 100, 600, 0),
    pricingNotice: 'Fallback katalog Manifly v1.8.',
  },
  {
    code: 'lite',
    name: 'Lite',
    version: 1,
    priceMonthly: 9900,
    currency: 'IDR',
    entitlements: entitlements(1, 500, 600, 10),
    pricingNotice: 'Fallback katalog Manifly v1.8.',
  },
  {
    code: 'plus',
    name: 'Plus',
    version: 2,
    priceMonthly: 29000,
    currency: 'IDR',
    entitlements: entitlements(2, 2000, 3600, 30),
    pricingNotice: 'Fallback katalog Manifly v1.8.',
  },
  {
    code: 'pro',
    name: 'Pro',
    version: 1,
    priceMonthly: 49000,
    currency: 'IDR',
    entitlements: entitlements(3, 5000, 18000, 150),
    pricingNotice: 'Fallback katalog Manifly v1.8.',
  },
];

export const FALLBACK_ADDONS: MembershipAddonSummary[] = [
  {
    code: 'whatsapp-number',
    name: 'Nomor WhatsApp tambahan',
    version: 1,
    entitlementKey: 'whatsapp.numbers',
    entitlementIncrement: 1,
    priceMonthly: 10000,
    currency: 'IDR',
    platformLimit: 3,
  },
];

export async function getPublicCatalog() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  try {
    const [plansResponse, addonsResponse] = await Promise.all([
      fetch(`${apiUrl}/membership/plans`, { next: { revalidate: 300 } }),
      fetch(`${apiUrl}/membership/addons`, { next: { revalidate: 300 } }),
    ]);
    if (!plansResponse.ok || !addonsResponse.ok) throw new Error('catalog');
    return {
      plans: (await plansResponse.json()) as MembershipPlanSummary[],
      addons: (await addonsResponse.json()) as MembershipAddonSummary[],
      fallback: false,
    };
  } catch {
    return { plans: FALLBACK_PLANS, addons: FALLBACK_ADDONS, fallback: true };
  }
}
