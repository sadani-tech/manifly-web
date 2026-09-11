import { cn } from "@/lib/utils";

/**
 * Manifly brand mark — the winged-banknote sticker.
 *
 * Rendered from `public/brand/manifly-mark.png` (transparent, so it drops
 * onto any surface). Regenerate the source assets with `npm run brand`.
 *
 * Use `<BrandMark />` on its own where space is tight (nav rails, avatars,
 * mobile headers) and `<Logo />` when the wordmark should read too.
 */

interface BrandMarkProps {
  /** Rendered size in px (square). Defaults to 40. */
  size?: number;
  className?: string;
  /**
   * When decorative (a text "Manifly" sits next to it) keep this false so
   * screen readers don't announce it twice.
   */
  decorative?: boolean;
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 40,
  className,
  decorative = false,
}) => (
  // eslint-disable-next-line @next/next/no-img-element -- static brand asset, no layout shift at fixed size
  <img
    src="/brand/manifly-mark.png"
    alt={decorative ? "" : "Manifly"}
    aria-hidden={decorative || undefined}
    width={size}
    height={size}
    draggable={false}
    className={cn("shrink-0 select-none object-contain", className)}
    style={{ width: size, height: size }}
  />
);

interface LogoProps {
  /** Mark size in px. The wordmark scales with the surrounding text. */
  size?: number;
  className?: string;
  /** Hide the tagline line (shown by default). */
  hideTagline?: boolean;
  /** Tailwind text-color utility for the wordmark. Defaults to `text-foreground`. */
  tone?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 40,
  className,
  hideTagline = false,
  tone = "text-foreground",
}) => (
  <span className={cn("flex items-center gap-3", className)}>
    <BrandMark size={size} decorative />
    <span className="flex flex-col leading-none">
      <span
        className={cn(
          "text-[15px] font-bold tracking-[-0.02em]",
          tone,
        )}
      >
        Manifly
      </span>
      {!hideTagline && (
        <span
          className={cn(
            "mt-1 text-[10px] font-medium uppercase tracking-[0.14em] opacity-60",
            tone,
          )}
        >
          Biar uang nggak asal terbang.
        </span>
      )}
    </span>
  </span>
);
