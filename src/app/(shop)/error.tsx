"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/error-state";

/**
 * Дэлгүүрийн хэсгийн алдаа.
 * Navbar, Footer хэвээр үлдэж, зөвхөн доторх агуулга солигдоно —
 * хэрэглэгч цэсээ ашиглан үргэлжлүүлж чадна.
 */
export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Дэлгүүрийн алдаа:", error);
  }, [error]);

  return (
    <div className="container-shop">
      <ErrorState
        description="Хуудсыг ачаалж чадсангүй. Дахин оролдох эсвэл дэлгүүр рүү буцна уу."
        digest={error.digest}
        reset={reset}
        homeHref="/shop"
        homeLabel="Дэлгүүр рүү"
      />
    </div>
  );
}
