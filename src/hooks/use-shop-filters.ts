"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Filter-ийн төлөвийг URL дээр удирдах hook.
 * Бүх filter компонент үүнийг ашиглана — логик нэг газар л бичигдэнэ.
 */
export function useShopFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  /** URL-ийг өөрчлөөд шинэ хаяг руу зөөлөн шилжинэ */
  function apply(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);

    // Filter өөрчлөгдвөл эхний хуудас руу буцна
    params.delete("page");

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  /** Олон утгатай filter (размер, өнгө) — дарвал нэмнэ, дахин дарвал хасна */
  function toggleValue(key: string, value: string) {
    apply((params) => {
      const current = params.getAll(key);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      params.delete(key);
      next.forEach((v) => params.append(key, v));
    });
  }

  /** Ганц утгатай filter (ангилал, эрэмбэ). Ижил утга дарвал арилна. */
  function setValue(key: string, value: string | null) {
    apply((params) => {
      if (!value || params.get(key) === value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
  }

  /** Тийм/үгүй filter (үлдэгдэлтэй, хямдралтай) */
  function toggleFlag(key: string) {
    apply((params) => {
      if (params.get(key) === "true") params.delete(key);
      else params.set(key, "true");
    });
  }

  /** Үнийн завсар */
  function setPriceRange(min: string, max: string) {
    apply((params) => {
      if (min) params.set("minPrice", min);
      else params.delete("minPrice");

      if (max) params.set("maxPrice", max);
      else params.delete("maxPrice");
    });
  }

  /** Хайлтын үгээс бусад бүх filter-ийг арилгана */
  function clearAll() {
    apply((params) => {
      const q = params.get("q");
      const sort = params.get("sort");

      [...params.keys()].forEach((key) => params.delete(key));

      if (q) params.set("q", q);
      if (sort) params.set("sort", sort);
    });
  }

  /** Хуудас солих — энд page-ийг устгахгүй */
  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return {
    searchParams,
    isPending,
    toggleValue,
    setValue,
    toggleFlag,
    setPriceRange,
    clearAll,
    goToPage,
  };
}
