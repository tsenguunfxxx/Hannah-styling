"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Хайлтын цонх.
 * Энд зөвхөн утга цуглуулж /search хуудас руу илгээнэ.
 * Хайлтын жинхэнэ логик PHASE 6-д тэр хуудсан дээр бичигдэнэ.
 */
export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;

    setOpen(false);
    setQuery("");
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button type="button" aria-label="Хайх" className="p-1 hover:opacity-60" />
        }
      >
        <Search className="size-[18px]" strokeWidth={1.5} />
      </DialogTrigger>

      <DialogContent className="top-24 max-w-xl translate-y-0">
        <DialogTitle className="label text-graphite">Хайлт</DialogTitle>
        <DialogDescription className="sr-only">
          Барааны нэр эсвэл ангилалаар хайна
        </DialogDescription>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Барааны нэр, ангилал..."
            className="h-11"
          />
          <Button type="submit" size="lg" className="label">
            Хайх
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
