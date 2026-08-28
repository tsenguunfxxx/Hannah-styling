"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/error-state";

/**
 * Хамгийн дээд түвшний алдааны хамгаалалт.
 * Аль ч хуудсанд баригдаагүй алдаа энд ирнэ.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Хөгжүүлэлтийн үед консолд харуулна.
    // Бодит ажиллагаанд Sentry гэх мэт хэрэгсэл рүү илгээнэ.
    console.error("Хуудасны алдаа:", error);
  }, [error]);

  return <ErrorState digest={error.digest} reset={reset} />;
}
