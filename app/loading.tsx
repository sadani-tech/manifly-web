import { PageLoading } from "@/components/shared/PageLoading";

/** App Router fallback shown immediately while a route is being loaded. */
export default function Loading() {
  return <PageLoading label="Menyiapkan halaman..." />;
}
