import { Loader2 } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";

interface PageLoadingProps {
  label?: string;
  fullScreen?: boolean;
}

/** Shared loading surface for route transitions and the initial PWA boot. */
export const PageLoading: React.FC<PageLoadingProps> = ({
  label = "Memuat halaman...",
  fullScreen = false,
}) => (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    className={cn(
      "app-canvas flex items-center justify-center px-4 py-10",
      fullScreen ? "min-h-screen" : "min-h-[min(620px,calc(100vh-8rem))]",
    )}
  >
    <div className="w-full max-w-sm text-center">
      <div className="mx-auto flex w-fit items-center justify-center rounded-[1.4rem] border border-brand-navy/15 bg-card/90 p-3 shadow-[5px_6px_0_color-mix(in_srgb,var(--brand-navy)_13%,transparent)]">
        <Logo size={46} hideTagline />
      </div>
      <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-kicker">
        Ruang Manifly
      </p>
      <p className="mt-2 text-lg font-black tracking-[-0.02em]">{label}</p>
      <div className="mx-auto mt-5 h-2 w-48 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-2/5 animate-[loading-bar_1.2s_ease-in-out_infinite] rounded-full bg-brand-lime" />
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        <span>Tunggu sebentar...</span>
      </div>
    </div>
  </div>
);
