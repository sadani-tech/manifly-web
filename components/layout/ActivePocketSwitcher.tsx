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
    <div className="flex shrink-0 items-center">
      <Select
        aria-label={`Pocket aktif${active ? `: ${active.name}` : ""}`}
        title={active ? `Pocket aktif: ${active.name}` : "Pilih pocket aktif"}
        className="w-11"
        buttonClassName="h-10 w-11 justify-center border-brand-navy/15 bg-card px-0 [&>svg]:ml-0"
        triggerContent={
          <WalletCards className="h-4 w-4 text-brand-navy dark:text-brand-lime" />
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
            <span className="flex min-w-0 items-center gap-1.5">
              {account.role === "viewer" ? (
                <Eye className="h-3.5 w-3.5 shrink-0" />
              ) : null}
              <span className="truncate">{account.name}</span>
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {account.currency}
                {account.ownership === "shared"
                  ? ` · Shared · ${account.role}`
                  : " · Milikmu"}
              </span>
            </span>
          ),
        }))}
      />
    </div>
  );
}
