"use client";

import { useAccountStore } from "@/store/accountStore";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import type { CurrencyCode } from "@/lib/types";

/**
 * Currency the active pocket's ledger is denominated in (v1.6).
 *
 * Pass this as `from` to `useCurrency().fmt` for any pocket-scoped figure.
 * Switching pockets also syncs the display currency, so normally the two
 * match and nothing is converted — but the user can still pick a different
 * display currency afterwards, and then these amounts must be converted and
 * marked "≈" rather than relabelled.
 */
export function useLedgerCurrency(): CurrencyCode {
  const accounts = useAccountStore((state) => state.accounts);
  const activeAccountId = useAccountStore((state) => state.activeAccountId);
  const active = accounts.find((account) => account.id === activeAccountId);
  return (active?.currency as CurrencyCode | undefined) ?? DEFAULT_CURRENCY;
}
