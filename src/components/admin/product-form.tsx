"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageUploader } from "@/components/admin/image-uploader";
import { VariantEditor } from "@/components/admin/variant-editor";
import { slugify } from "@/lib/utils";
import { productSchema, type ProductInput } from "@/schemas/product.schema";
import {
  createProductAction,
  updateProductAction,
} from "@/actions/admin/product.action";
import type { CategoryOption } from "@/lib/queries/admin/product.query";

/**
 * Бараа нэмэх / засах маягт.
 *
 * `productId` байвал ЗАСВАРЛАХ, байхгүй бол ШИНЭЭР үүсгэх горим.
 * Хоёр горимд ижил маягт ашигласнаар код давхардахгүй.
 */
export function ProductForm({
  categories,
  productId,
  defaultValues,
}: {
  categories: CategoryOption[];
  productId?: string;
  defaultValues?: Partial<ProductInput>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEdit = Boolean(productId);

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      details: "",
      basePrice: 0,
      discountPrice: null,
      categoryId: categories[0]?.id ?? "",
      isActive: true,
      isFeatured: false,
      images: [],
      variants: [],
      ...defaultValues,
    },
  });

  function onSubmit(values: ProductInput) {
    startTransition(async () => {
      const result = productId
        ? await updateProductAction(productId, values)
        : await createProductAction(values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(isEdit ? "Бараа хадгалагдлаа." : "Шинэ бараа нэмэгдлээ.");
      router.push("/admin/products");
      // Жагсаалт хуучин өгөгдөлтэй үлдэхээс сэргийлнэ
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        {/* --- ҮНДСЭН МЭДЭЭЛЭЛ --- */}
        <Section title="Үндсэн мэдээлэл">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label text-graphite">Нэр</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Premium Oversized Hoodie"
                      {...field}
                      onChange={(event) => {
                        field.onChange(event);

                        // Шинэ бараа үүсгэж байхад slug-ийг автоматаар бөглөнө.
                        // Засварлаж байхад ХОЛБОХГҮЙ — slug өөрчлөгдвөл
                        // хуучин хаяг руу орсон хүн 404 харна.
                        if (!isEdit) {
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
                    <Input placeholder="premium-oversized-hoodie" {...field} />
                  </FormControl>
                  <FormDescription>
                    Хаяг: /product/{field.value || "..."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label text-graphite">Ангилал</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <select
                        {...field}
                        className="h-11 w-full appearance-none border border-line bg-transparent px-3 pr-9 text-sm outline-none focus-visible:border-ink"
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.label}
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

            <div className="flex items-end gap-6">
              <CheckboxField
                control={form.control}
                name="isActive"
                label="Дэлгүүрт харагдана"
              />
              <CheckboxField
                control={form.control}
                name="isFeatured"
                label="Онцлох бараа"
              />
            </div>

            {/*
              "Богино тайлбар" талбарыг ХАССАН.

              Тэр бичиг дэлгүүрийн хуудсан дээр хаана ч харагддаггүй
              байсан — зөвхөн хайлтын системд зориулсан тайлбар байв.
              Админаас нэг ч удаа харагдахгүй зүйлийг бөглөх нь
              илүүц тул авч хаяв.

              Талбарыг л хассан болохоос ӨГӨГДЛИЙГ устгаагүй: хуучин
              бараануудын тайлбар байрандаа үлдэж, засварлахад
              (`defaultValues`) хамт дамжсаар байна. Шинэ бараанд
              хоосон үлдэх бөгөөд хайлтын тайлбарыг "Дэлгэрэнгүй"
              хэсгээс авна — доорх product/[slug]/page.tsx-г үзнэ үү.
            */}

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel className="label text-graphite">
                    Дэлгэрэнгүй
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder={"Материал: 100% хөвөн\nАрчилгаа: 30°C"}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Мөр бүр тусдаа харагдана. Заавал биш.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Section>

        {/* --- ҮНЭ --- */}
        <Section title="Үнэ">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label text-graphite">
                    Үндсэн үнэ (₮)
                  </FormLabel>
                  <FormControl>
                    {/*
                      type="number" талбар үргэлж ТЕКСТ буцаадаг.
                      Number()-ээр хөрвүүлж байж схемийн z.number() таарна.
                    */}
                    <Input
                      type="number"
                      min={0}
                      placeholder="199000"
                      {...field}
                      value={field.value === 0 ? "" : field.value}
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
              name="discountPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label text-graphite">
                    Хямдралтай үнэ (₮)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Хямдралгүй бол хоосон"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value ? Number(event.target.value) : null,
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Оруулбал дэлгүүрт хуучин үнэ зураастай харагдана.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Section>

        {/* --- ЗУРАГ --- */}
        <Section title="Зураг">
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <ImageUploader value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        {/* --- РАЗМЕР, ӨНГӨ --- */}
        <Section title="Размер ба өнгө">
          <FormField
            control={form.control}
            name="variants"
            render={({ field }) => (
              <FormItem>
                <VariantEditor value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        {/* --- ХАДГАЛАХ --- */}
        <div className="sticky bottom-0 flex flex-wrap gap-3 border-t border-line bg-bone py-4">
          <Button type="submit" disabled={isPending} className="label h-12 px-8">
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Хадгалах" : "Бараа нэмэх"}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => router.push("/admin/products")}
            className="label h-12 px-6"
          >
            Болих
          </Button>
        </div>
      </form>
    </Form>
  );
}

/** Маягтын нэг хэсэг */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="label border-b border-line pb-3">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Тийм/үгүй сонголт */
function CheckboxField({
  control,
  name,
  label,
}: {
  control: ReturnType<typeof useForm<ProductInput>>["control"];
  name: "isActive" | "isFeatured";
  label: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center gap-2">
          <input
            id={name}
            type="checkbox"
            checked={field.value}
            onChange={(event) => field.onChange(event.target.checked)}
            className="size-4 accent-ink"
          />
          <label htmlFor={name} className="label cursor-pointer text-graphite">
            {label}
          </label>
        </FormItem>
      )}
    />
  );
}
