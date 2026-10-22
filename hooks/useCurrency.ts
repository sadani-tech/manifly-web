"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useUIStore } from "@/store/uiStore";
import { useExchangeRateStore } from "@/store/exchangeRateStore";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/constants";
import { formatCurrency, formatSignedAmount } from "@/lib/utils";
import type { CurrencyCode, CurrencyConfig } from "@/lib/types";

interface Resolved {
  value: number;
  config: CurrencyConfig;
  /** Value was converted at a stored rate, so it must be shown with "≈". */
  approx: boolean;
}

/**
 * Formats money in the user's chosen display currency (PRD v1.2 CUR-03).
 *
 * Ledger amounts are stored in their pocket's currency (v1.6), so every
 * caller that knows the source currency should pass `from`. When it differs
 * from the display currency the value is converted at the stored daily rate
 * and marked "≈". When no rate is available the amount is rendered in its own
 * currency instead — showing an unconverted number under a foreign symbol
 * would misstate it.
 */
export function useCurrency() {
  const currency = useUIStore((s) => s.currency);
  const setCurrency = useUIStore((s) => s.setCurrency);
  const rates = useExchangeRateStore((s) => s.rates);
  const rateObservedAt = useExchangeRateStore((s) => s.observedAt);
  const rateStale = useExchangeRateStore((s) => s.stale);
  const rateSource = useExchangeRateStore((s) => s.source);
  const fetchRates = useExchangeRateStore((s) => s.fetchRates);

  // No-op when the cached rates are still fresh.
  useEffect(() => {
    void fetchRates();
  }, [fetchRates]);

  const config = CURRENCIES[currency];

  /** Units of `code` per 1 IDR, or null when we have no rate for it. */
  const unitsPerIdr = useCallback(
    (code: CurrencyCode): number | null =>
      code === "IDR" ? 1 : (rates[code] ?? null),
    [rates],
  );

  const resolve = useCallback(
    (value: number, from?: CurrencyCode): Resolved => {
      const source = from ?? DEFAULT_CURRENCY;
      if (source === currency) return { value, config, approx: false };

      const perSource = unitsPerIdr(source);
      const perTarget = unitsPerIdr(currency);
      if (perSource === null || perTarget === null)
        return { value, config: CURRENCIES[source], approx: false };

      return {
        value: (value / perSource) * perTarget,
        config,
        approx: true,
      };
    },
    [currency, config, unitsPerIdr],
  );

  const convert = useCallback(
    (value: number, from?: CurrencyCode) => resolve(value, from).value,
    [resolve],
  );

  const fmt = useMemo(
    () =>
      (
        value: number,
        opts?: { compact?: boolean; from?: CurrencyCode },
      ): string => {
        const resolved = resolve(value, opts?.from);
        return formatCurrency(resolved.value, {
          compact: opts?.compact,
          currency: resolved.config,
          approx: resolved.approx,
        });
      },
    [resolve],
  );

  const fmtSigned = useMemo(
    () =>
      (
        amount: number,
        type: "income" | "expense",
        from?: CurrencyCode,
      ): string => {
        const resolved = resolve(amount, from);
        return formatSignedAmount(
          resolved.value,
          type,
          resolved.config,
          resolved.approx,
        );
      },
    [resolve],
  );

  const switchTo = (code: CurrencyCode) => setCurrency(code);

  return {
    currency,
    config,
    setCurrency: switchTo,
    fmt,
    fmtSigned,
    convert,
    /** Provenance for the "≈" values, so a page can disclose the rate age. */
    rateObservedAt,
    rateSource,
    rateStale,
  };
}
