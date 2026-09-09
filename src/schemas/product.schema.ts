import { z } from "zod";
import { ALLOWED_IMAGE_HOSTS } from "@/lib/constants";

/**
 * Админы бараа, ангиллын маягтын шалгалт.
 *
 * ЧУХАЛ: Энэ схемийг маягт (client) БОЛОН Server Action хоёулаа ашиглана.
 * Тиймээс дүрэм нэг л газар бичигдэж, хоёр тал зөрөх боломжгүй.
 */

/** Зургийн хаяг зөвшөөрөгдсөн хостынх мөн эсэх */
function isAllowedImageHost(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return ALLOWED_IMAGE_HOSTS.some((allowed) => host === allowed);
  } catch {
    return false;
  }
}

/** Барааны зураг */
export const productImageSchema = z.object({
  url: z
    .url({ message: "Зургийн хаяг буруу байна." })
    // next.config.ts-д бүртгэгдээгүй хостоос зураг татагдахгүй тул
    // энд зогсоовол дэлгүүр дээр "хоосон зураг" гарахгүй
    .refine(isAllowedImageHost, {
      message: `Зөвхөн ${ALLOWED_IMAGE_HOSTS.join(", ")} хостын зураг зөвшөөрнө.`,
    }),
  /** Cloudinary-гаас устгахад хэрэгтэй */
  publicId: z.string().nullable().optional(),
  alt: z.string().max(120).nullable().optional(),
});

/** Өнгө + размерын хослол */
export const productVariantSchema = z.object({
  /** Байгаа variant засаж байвал id ирнэ */
  id: z.string().optional(),

  size: z
    .string()
    .trim()
    .min(1, { message: "Размер хоосон байна." })
    .max(10, { message: "Размер хэт урт байна." }),

  color: z
    .string()
    .trim()
    .min(1, { message: "Өнгөний нэр хоосон байна." })
    .max(30),

  colorHex: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, { message: "Өнгө #000000 хэлбэртэй байна." }),

  stock: z
    .number({ message: "Үлдэгдэл тоо байх ёстой." })
    .int({ message: "Үлдэгдэл бүхэл тоо байна." })
    .min(0, { message: "Үлдэгдэл сөрөг байж болохгүй." }),

  sku: z.string().trim().max(40).nullable().optional(),

  /** Хоосон бол барааны үндсэн үнийг ашиглана */
  price: z
    .number()
    .int()
    .positive({ message: "Үнэ эерэг тоо байна." })
    .nullable()
    .optional(),
});

export const productSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: "Барааны нэр хамгийн багадаа 2 тэмдэгт." })
      .max(120, { message: "Нэр хэт урт байна." }),

    slug: z
      .string()
      .trim()
      .min(2, { message: "Slug хоосон байна." })
      .max(140)
      // URL-д ашиглагдах тул зөвхөн жижиг үсэг, тоо, зураас
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: "Slug зөвхөн жижиг үсэг, тоо, зураас агуулна.",
      }),

    /*
      Хайлтын системд зориулсан тайлбар. Админы маягтаас хассан тул
      ЗААВАЛ биш — шинэ бараанд хоосон ирнэ. Хуучин бараанууд өөрсдийн
      бичгээ хадгалсаар байгаа учир талбарыг устгаагүй.
    */
    description: z.string().trim().max(500),

    details: z.string().trim().max(2000).nullable().optional(),

    basePrice: z
      .number({ message: "Үнэ тоо байх ёстой." })
      .int({ message: "Үнэ бүхэл тоо байна." })
      .positive({ message: "Үнэ 0-ээс их байна." }),

    discountPrice: z
      .number()
      .int()
      .positive({ message: "Хямдралтай үнэ 0-ээс их байна." })
      .nullable()
      .optional(),

    categoryId: z.string().min(1, { message: "Ангиллаа сонгоно уу." }),

    isActive: z.boolean(),
    isFeatured: z.boolean(),

    images: z
      .array(productImageSchema)
      .min(1, { message: "Хамгийн багадаа 1 зураг оруулна уу." })
      .max(8, { message: "Хамгийн ихдээ 8 зураг." }),

    variants: z
      .array(productVariantSchema)
      .min(1, { message: "Хамгийн багадаа 1 размер/өнгө нэмнэ үү." })
      .max(60, { message: "Хэт олон хослол байна." }),
  })
  // Хямдралтай үнэ үндсэн үнээс их байвал утгагүй
  .refine(
    (data) => !data.discountPrice || data.discountPrice < data.basePrice,
    {
      message: "Хямдралтай үнэ үндсэн үнээс бага байх ёстой.",
      path: ["discountPrice"],
    },
  )
  // Нэг бараанд "Black / M" ганц л удаа байна (database-ийн @@unique-тэй ижил)
  .refine(
    (data) => {
      const keys = data.variants.map(
        (v) => `${v.size.toLowerCase()}|${v.color.toLowerCase()}`,
      );
      return new Set(keys).size === keys.length;
    },
    {
      message: "Ижил размер, өнгөний хослол давхардсан байна.",
      path: ["variants"],
    },
  );

export type ProductInput = z.infer<typeof productSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;

/** Ангилал */
export const categorySchema = z.object({
  name: z.string().trim().min(2, { message: "Ангиллын нэр хэт богино." }).max(60),

  slug: z
    .string()
    .trim()
    .min(2, { message: "Slug хоосон байна." })
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug зөвхөн жижиг үсэг, тоо, зураас агуулна.",
    }),

  description: z.string().trim().max(300).nullable().optional(),
  image: z.union([z.literal(""), z.url({ message: "Зургийн хаяг буруу." })]).nullable().optional(),

  /** Хоосон бол дээд түвшний ангилал */
  parentId: z.string().nullable().optional(),

  sortOrder: z.number().int().min(0).max(999),
  isActive: z.boolean(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
