"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronDown, Loader2, Plus, SquarePen, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SingleImageUploader } from "@/components/admin/single-image-uploader";
import { slugify } from "@/lib/utils";
import { categorySchema, type CategoryInput } from "@/schemas/product.schema";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/actions/admin/category.action";
import type { AdminCategoryNode } from "@/lib/queries/admin/category.query";

/** Жагсаалтад ба маягтад хэрэглэх нэгдсэн хэлбэр */
type CategoryRow = AdminCategoryNode | AdminCategoryNode["children"][number];

/**
 * Ангилал удирдах.
 *
 * Ангилал цөөхөн (10-20) тул хуудаслалт, хайлт шаардлагагүй.
 * Бүгдийг нэг дэлгэцэнд модны хэлбэрээр харуулна.
 */
export function CategoryManager({
  categories,
}: {
  categories: AdminCategoryNode[];
}) {
  // null = цонх хаалттай, "new" = шинэ, объект = засварлах
  const [editing, setEditing] = useState<CategoryRow | "new" | null>(null);

  // Дэд ангилал өөр дэд ангилалд харьяалагдахгүй — зөвхөн эцгүүд сонголтод
  const parentOptions = categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button className="label h-11" onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          Шинэ ангилал
        </Button>
      </div>

      <div className="border border-line">
        {categories.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-graphite">
            Ангилал алга. Эхнийхээ үүсгэнэ үү.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {categories.map((parent) => (
              <li key={parent.id}>
                <CategoryRowView category={parent} onEdit={setEditing} />

                {parent.children.length > 0 && (
                  <ul className="divide-y divide-line border-t border-line bg-sand/30">
                    {parent.children.map((child) => (
                      <li key={child.id}>
                        <CategoryRowView
                          category={child}
                          onEdit={setEditing}
                          nested
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/*
        key солигдоход маягт дахин mount хийгдэнэ.
        Үгүй бол өөр ангилал засах гэхэд өмнөхийн утга үлдэнэ.
      */}
      <CategoryFormDialog
        key={editing === "new" ? "new" : (editing?.id ?? "closed")}
        editing={editing}
        parentOptions={parentOptions}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

/** Жагсаалтын нэг мөр */
function CategoryRowView({
  category,
  onEdit,
  nested = false,
}: {
  category: CategoryRow;
  onEdit: (category: CategoryRow) => void;
  nested?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Base UI-ийн AlertDialogAction цонхыг өөрөө хаадаггүй
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCategoryAction(category.id);
      setConfirmOpen(false);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Ангилал устлаа.");
      router.refresh();
    });
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-3 px-4 py-3 ${nested ? "pl-10" : ""}`}
    >
      {/*
        Жижиг урьдчилан харах. Зураггүй ангилал нүүр хуудсан дээр
        хоосон саарал нүх болж харагддаг тул алийг нь бөглөх ёстойг
        админ жагсаалтаас шууд харна.
      */}
      <div className="relative aspect-4/5 w-9 shrink-0 overflow-hidden border border-line bg-sand">
        {category.image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={category.image}
            alt=""
            className="size-full object-cover"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm">
          {category.name}
          {!category.isActive && (
            <span className="label ml-2 border border-sale px-1.5 py-0.5 text-sale">
              Нуугдсан
            </span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-graphite">
          /{category.slug} · {category._count.products} бараа
          {category._count.children > 0 &&
            ` · ${category._count.children} дэд ангилал`}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`${category.name} засах`}
          onClick={() => onEdit(category)}
          className="grid size-8 place-items-center border border-line text-graphite transition-colors hover:border-ink hover:text-ink"
        >
          <SquarePen className="size-3.5" />
        </button>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogTrigger
            render={
              <button
                type="button"
                aria-label={`${category.name} устгах`}
                disabled={isPending}
                className="grid size-8 place-items-center border border-line text-graphite transition-colors hover:border-sale hover:text-sale disabled:opacity-40"
              />
            }
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ангиллыг устгах уу?</AlertDialogTitle>
              <AlertDialogDescription>
                &laquo;{category.name}&raquo; устана. Бараатай эсвэл дэд
                ангилалтай бол устгах боломжгүй.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Болих</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Тийм, устга
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

/** Нэмэх/засах цонх */
function CategoryFormDialog({
  editing,
  parentOptions,
  onClose,
}: {
  editing: CategoryRow | "new" | null;
  parentOptions: { id: string; name: string }[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isNew = editing === "new";
  const category = isNew || editing === null ? null : editing;

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    // key-ээр дахин mount хийдэг тул defaultValues шинэчлэгдэнэ
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      image: category?.image ?? "",
      parentId: category?.parentId ?? "",
      sortOrder: category?.sortOrder ?? 0,
      isActive: category?.isActive ?? true,
    },
  });

  function onSubmit(values: CategoryInput) {
    startTransition(async () => {
      const result = category
        ? await updateCategoryAction(category.id, values)
        : await createCategoryAction(values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(category ? "Ангилал хадгалагдлаа." : "Ангилал нэмэгдлээ.");
      onClose();
      router.refresh();
    });
  }

  return (
    <Dialog open={editing !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-label">
            {category ? "Ангилал засах" : "Шинэ ангилал"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label text-graphite">Нэр</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Гадуур хувцас"
                      {...field}
                      onChange={(event) => {
                        field.onChange(event);
                        // Шинэ ангилалд slug автоматаар
                        if (!category) {
                          form.setValue("slug", slugify(event.target.value), {
                            shouldValidate: true,
                          });
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label text-graphite">Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="gaduur-khuvtsas" {...field} />
                  </FormControl>
                  <FormDescription>
                    Хаяг: /shop?category={field.value || "..."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label text-graphite">
                    Эцэг ангилал
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <select
                        {...field}
                        value={field.value ?? ""}
                        className="h-11 w-full appearance-none border border-line bg-transparent px-3 pr-9 text-sm outline-none focus-visible:border-ink"
                      >
                        <option value="">— Дээд түвшний ангилал —</option>
                        {parentOptions
                          // Ангилал өөрийгөө эцэг болгож болохгүй
                          .filter((option) => option.id !== category?.id)
                          .map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-graphite" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label text-graphite">Тайлбар</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label text-graphite">Зураг</FormLabel>
                  <FormControl>
                    {/*
                      Өмнө нь энд зөвхөн хаяг бичих талбар байсан —
                      админ зургаа хаа нэгтээ байршуулаад хаягийг нь
                      хуулж авчрах шаардлагатай байв. Одоо компьютерээсээ
                      шууд сонгоно.

                      Zod-д `image` нь хоосон мөр эсвэл хаяг. Талбар
                      цэвэрлэгдэхэд `null` ирдэг тул хоосон мөр рүү
                      хөрвүүлж, маягтын утга тогтвортой байлгана.
                    */}
                    <SingleImageUploader
                      value={field.value || null}
                      onChange={(url) => field.onChange(url ?? "")}
                    />
                  </FormControl>
                  <FormDescription>
                    Нүүр хуудасны ангиллын хэсэгт харагдана. Босоо
                    (4:5) зураг хамгийн тохиромжтой.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-end gap-6">
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem className="w-32">
                    <FormLabel className="label text-graphite">Эрэмбэ</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={field.value}
                        onChange={(event) =>
                          field.onChange(Number(event.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 pb-3">
                    <input
                      id="category-active"
                      type="checkbox"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                      className="size-4 accent-ink"
                    />
                    <label
                      htmlFor="category-active"
                      className="label cursor-pointer text-graphite"
                    >
                      Идэвхтэй
                    </label>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending} className="label h-11">
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Хадгалах
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="label h-11"
              >
                Болих
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
