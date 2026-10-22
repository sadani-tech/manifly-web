"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { exchangeRatesApi } from "@/lib/api";
import type { CurrencyCode } from "@/lib/types";

interface ExchangeRateState {
  /** Rates keyed by currency code, base = IDR (i.e., 1 IDR = rates[code] units) */
  rates: Partial<Record<CurrencyCode, number>>;
  /** When the provider observed these rates (not when we fetched them). */
  observedAt: string | null;
  source: string | null;
  /** Server says the stored rates are older than 24h. */
  stale: boolean;
  lastFetched: number | null; // unix ms timestamp
  loading: boolean;
  error: string | null;
  fetchRates: (force?: boolean) => Promise<void>;
}

/**
 * Client-side refetch window. The authoritative daily refresh is the backend
 * cron (PRD v1.2 CUR-02); this only keeps a long-lived tab from holding on to
 * yesterday's numbers, so it is deliberately shorter than a day.
 */
const REFETCH_AFTER_MS = 6 * 60 * 60 * 1000;

export const useExchangeRateStore = create<ExchangeRateState>()(
  persist(
    (set, get) => ({
      rates: {},
      observedAt: null,
      source: null,
      stale: false,
      lastFetched: null,
      loading: false,
      error: null,
      fetchRates: async (force = false) => {
        const { lastFetched, loading } = get();
        if (loading) return;
        if (
          !force &&
          lastFetched &&
          Date.now() - lastFetched < REFETCH_AFTER_MS
        )
          return;

        set({ loading: true, error: null });
        try {
          // Rates come from Manifly's own API, not a third-party host: the
          // daily fetch, the persisted last-known value used as fallback, and
          // the rates recorded in net-worth snapshots all have to be the same
          // numbers, and the browser must not leak user IPs to an FX provider.
          const table = await exchangeRatesApi.get("IDR");
          set({
            rates: table.rates,
            observedAt: table.observedAt,
            source: table.source,
            stale: table.stale,
            lastFetched: Date.now(),
            loading: false,
            error: null,
          });
        } catch (err) {
          // Keep whatever was persisted; a failed refresh must not wipe the
          // last known rates.
          set({ loading: false, error: (err as Error).message });
        }
      },
    }),
    {
      name: "manifly:exchange-rates",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        rates: s.rates,
        observedAt: s.observedAt,
        source: s.source,
        lastFetched: s.lastFetched,
      }),
    },
  ),
);
