"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Crown, LogOut, UserCircle } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { BrandMark } from "@/components/shared/Logo";
import { ActivePocketSwitcher } from "@/components/layout/ActivePocketSwitcher";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { useTransactionStore } from "@/store/transactionStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useAccountStore } from "@/store/accountStore";

function titleForPath(pathname: string): string {
  const match = NAV_ITEMS.find(
    (i) => pathname === i.href || pathname.startsWith(`${i.href}/`),
  );
  return match?.label ?? "Manifly";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const title = titleForPath(pathname);
  const { user, logout } = useAuthStore();
  const clearTx = useTransactionStore((s) => s.clearAll);
  const clearCat = useCategoryStore((s) => s.clearAll);
  const clearAccounts = useAccountStore((s) => s.clearAll);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const closeOnPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !profileButtonRef.current?.contains(target) &&
        !profileMenuRef.current?.contains(target)
      ) {
        setProfileOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        profileButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOnPointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileOpen]);

  const handleLogout = () => {
    setProfileOpen(false);
    clearTx();
    clearCat();
    clearAccounts();
    logout();
    router.replace("/login");
  };

  return (
    <header className="glass-surface sticky top-0 z-20 flex h-[4.75rem] items-center justify-between gap-2 border-b border-brand-navy/10 px-4 sm:gap-4 sm:px-6 md:px-8 xl:px-10">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <BrandMark size={36} decorative className="md:hidden" />
        <div className="min-w-0">
          <p className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/45 sm:block">
            Manifly space
          </p>
          <h1 className="truncate text-base font-bold tracking-[-0.02em] sm:text-lg">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <ActivePocketSwitcher />
        <ThemeToggle />
        {user && (
          <div className="relative ml-1 border-l border-border/80 pl-2 sm:pl-3">
            <button
              ref={profileButtonRef}
              type="button"
              aria-label={`Menu profil ${user.name}`}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((current) => !current)}
              className="focus-ring group flex items-center gap-2 rounded-xl p-0.5 pr-1 transition-colors hover:bg-muted"
            >
              <div className="neo-sticker flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-lime text-xs font-black text-brand-navy transition-transform group-hover:-rotate-3 group-hover:scale-105">
                {getInitials(user.name)}
              </div>
              <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                {user.name}
              </span>
              <ChevronDown
                className={`hidden h-3.5 w-3.5 text-muted-foreground transition-transform sm:block ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {profileOpen && (
              <div
                ref={profileMenuRef}
                role="menu"
                aria-label="Menu profil"
                className="glass-surface absolute right-0 top-[calc(100%+0.6rem)] z-[100] w-52 rounded-2xl border p-1.5 shadow-[0_18px_50px_rgba(0,0,0,.2)]"
              >
                <div className="border-b px-3 py-2.5">
                  <p className="truncate text-sm font-bold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <Link
                  role="menuitem"
                  href="/settings/profile"
                  onClick={() => setProfileOpen(false)}
                  className="focus-ring mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-muted"
                >
                  <UserCircle className="h-4 w-4" /> Profile
                </Link>
                <Link
                  role="menuitem"
                  href="/settings/membership"
                  onClick={() => setProfileOpen(false)}
                  className="focus-ring flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-muted"
                >
                  <Crown className="h-4 w-4" /> Membership
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="focus-ring flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
