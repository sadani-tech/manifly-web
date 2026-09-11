import Link from 'next/link';
import type {
  MembershipAddonSummary,
  MembershipPlanSummary,
} from '@/lib/api';

const rupiah = (value: number) =>
  value === 0
    ? 'Gratis'
    : new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(value);

export function PricingGrid({
  plans,
  addons,
  fallback,
}: {
  plans: MembershipPlanSummary[];
  addons: MembershipAddonSummary[];
  fallback: boolean;
}) {
  return (
    <div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const paid = plan.priceMonthly > 0;
          const href = paid
            ? `/register?returnTo=${encodeURIComponent(`/settings/membership?plan=${plan.code}`)}`
            : '/register';
          return (
            <article
              key={`${plan.code}-${plan.version}`}
              className={`relative flex flex-col rounded-[1.8rem] border-2 p-6 shadow-[7px_7px_0_rgba(21,21,21,.12)] dark:shadow-[7px_7px_0_rgba(201,244,90,.12)] ${
                plan.code === 'plus'
                  ? 'border-[#151515] bg-brand-lime text-brand-navy'
                  : 'border-black/20 bg-white dark:border-white/15 dark:bg-[#1b1c19]'
              }`}
            >
              {plan.code === 'plus' && (
                <span className="absolute -top-3 right-5 rounded-full bg-[#151515] px-3 py-1 text-xs font-black text-white">
                  Paling pas
                </span>
              )}
              <p className="text-xs font-black uppercase tracking-[.16em] opacity-60">
                v{plan.version}
              </p>
              <h2 className="mt-2 text-2xl font-black">{plan.name}</h2>
              <p className="mt-3 text-2xl font-black">
                {rupiah(plan.priceMonthly)}
                {paid && <span className="text-xs font-semibold">/bulan</span>}
              </p>
              <ul className="my-6 flex-1 space-y-3 text-sm">
                <li>{plan.entitlements['whatsapp.numbers'] ?? 0} nomor WhatsApp</li>
                <li>
                  {(plan.entitlements['whatsapp.chat_actions'] ?? 0).toLocaleString(
                    'id-ID',
                  )}{' '}
                  chat action/bulan
                </li>
                <li>
                  {Math.floor(
                    (plan.entitlements['whatsapp.voice_seconds'] ?? 0) / 60,
                  )}{' '}
                  menit voice note
                </li>
                <li>
                  {(plan.entitlements['whatsapp.proactive_deliveries'] ?? 0).toLocaleString(
                    'id-ID',
                  )}{' '}
                  pesan proaktif
                </li>
              </ul>
              <Link
                href={href}
                className="rounded-xl bg-[#151515] px-4 py-3 text-center text-sm font-black text-white"
              >
                {paid ? `Pilih ${plan.name}` : 'Mulai gratis'}
              </Link>
            </article>
          );
        })}
      </div>
      {addons.map((addon) => (
        <p
          key={`${addon.code}-${addon.version}`}
          className="mx-auto mt-7 max-w-3xl rounded-2xl border border-black/10 bg-white p-4 text-center text-sm dark:border-white/10 dark:bg-white/5"
        >
          Add-on <strong>{addon.name}</strong>: {rupiah(addon.priceMonthly)} per
          unit/bulan. Total nomor tetap maksimal {addon.platformLimit ?? 3}.
        </p>
      ))}
      <p className="mt-4 text-center text-xs opacity-60">
        Auto-renew bulanan. Biaya operasional Meta/provider, bila ada, terpisah
        dari harga membership yang dikonfirmasi.
        {fallback ? ' Katalog fallback v1.8 sedang ditampilkan.' : ''}
      </p>
    </div>
  );
}
