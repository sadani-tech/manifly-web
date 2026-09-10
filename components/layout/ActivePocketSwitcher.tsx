"use client";

import { Eye, WalletCards } from "lucide-react";
import { Select } from "@/components/ui/select";
import { useAccountStore } from "@/store/accountStore";
import { useTransactionStore } from "@/store/transactionStore";

export function ActivePocketSwitcher() {
  const accounts = useAccountStore((state) => state.accounts);
  const activeAccountId = useAccountStore((state) => state.activeAccountId);
  const loading = useAccountStore((state) => state.loading);
  const setActiveAccount = useAccountStore((state) => state.setActiveAccount);
  const available = accounts.filter((account) => !account.archivedAt);
  const active = available.find((account) => account.id === activeAccountId);

  return (
    <div className="flex min-w-0 shrink-0 items-center">
      <Select
        aria-label={`Pocket aktif${active ? `: ${active.name}` : ""}`}
        title={active ? `Pocket aktif: ${active.name}` : "Pilih pocket aktif"}
        className="w-11 sm:w-44 lg:w-52"
        buttonClassName="h-10 w-full justify-center border-brand-navy/15 bg-card px-0 sm:justify-start sm:px-2.5 [&>svg]:ml-0 sm:[&>svg]:ml-2"
        menuMinWidth={260}
        triggerContent={
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-lime/45 text-brand-navy dark:bg-brand-lime/15 dark:text-brand-lime">
              <WalletCards className="h-4 w-4" />
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block text-[9px] font-bold uppercase leading-none tracking-[0.12em] text-muted-foreground">
                Pocket aktif
              </span>
              <span className="mt-1 block truncate text-xs font-semibold leading-none text-foreground">
                {loading ? "Memuat pocket…" : active?.name ?? "Pilih pocket"}
              </span>
            </span>
          </span>
        }
        value={activeAccountId ?? ""}
        disabled={loading || available.length === 0}
        placeholder={loading ? "Memuat pocket…" : "Pilih pocket"}
        onValueChange={(accountId) => {
          void setActiveAccount(accountId)
            .then(() => {
              useTransactionStore
                .getState()
                .setFilters({ accountId: undefined });
            })
            .catch(() => {});
        }}
        options={available.map((account) => ({
          value: account.id,
          label: (
            <span className="flex min-w-0 items-center gap-2">
              {account.role === "viewer" ? (
                <Eye className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : null}
              <span className="min-w-0">
                <span className="block truncate font-semibold">
                  {account.name}
                </span>
                <span className="block truncate text-[10px] font-normal text-muted-foreground">
                  {account.currency}
                  {account.ownership === "shared"
                    ? ` · Shared · ${account.role}`
                    : " · Milikmu"}
                </span>
              </span>
            </span>
          ),
        }))}
      />
    </div>
  );
}
