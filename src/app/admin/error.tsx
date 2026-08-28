"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/error-state";

/** Админы хэсгийн алдаа — хажуугийн цэс хэвээр үлдэнэ */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Админы алдаа:", error);
  }, [error]);

  return (
    <ErrorState
      description="Мэдээллийг ачаалж чадсангүй. Дахин оролдоно уу."
      digest={error.digest}
      reset={reset}
      homeHref="/admin"
      homeLabel="Хяналтын самбар"
    />
  );
}
