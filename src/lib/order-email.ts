import "server-only";

import { sendEmail } from "@/lib/mailer";
import { signOrderToken } from "@/lib/guest-orders";
import { formatPrice } from "@/lib/utils";

/**
 * ЗАХИАЛГА БАТАЛГААЖУУЛАХ ЗАХИДАЛ.
 *
 * Хоёр зорилготой:
 *   1. Хүнд итгэл өгөх — захиалга үнэхээр бүртгэгдсэнийг харуулна
 *   2. ЗОЧИНД захиалгаа дахин олох цорын ганц зам өгөх — бүртгэлгүй
 *      хүн "миний захиалга" хуудасгүй тул холбоос нь энэ захидалд л
 *      үлдэнэ
 */

type OrderLine = {
  productName: string;
  size: string;
  color: string;
  quantity: number;
  lineTotal: number;
};

export type OrderEmailInput = {
  to: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  district: string;
  addressLine: string;
  note: string | null;
  subtotal: number;
  discount: number;
  /*
    Захиалгын ӨӨРИЙН хүргэлтийн төлбөр — тогтмолоос биш.
    Дэлгүүр үнээ өөрчилсөн ч хуучин захидал зөв дүнгээ хадгална.
  */
  shippingFee: number;
  total: number;
  items: OrderLine[];
  /** Бүртгэлтэй хүнд "миний захиалга" хуудас бий — тэдэнд тамга хэрэггүй */
  isGuest: boolean;
};

function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3100").replace(
    /\/+$/,
    "",
  );
}

/**
 * HTML руу оруулахын өмнө аюултай тэмдэгтийг саармагжуулна.
 *
 * Барааны нэр, хаяг, тэмдэглэл зэрэг нь ХЭРЭГЛЭГЧИЙН бичсэн текст.
 * Шууд залгавал `<` тэмдэгтээр захидлын бүтэц эвдэрч, бүр
 * гадны агуулга оруулах боломж үүснэ.
 */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(input: OrderEmailInput): string {
  const app = getAppUrl();

  /*
    Зочны холбоост тамга залгана — өөр төхөөрөмж дээр ч нээгдэнэ.
    Бүртгэлтэй хүн нэвтэрч ороод харах тул энгийн холбоос хангалттай.
  */
  const token = input.isGuest ? signOrderToken(input.orderNumber) : null;

  const link = token
    ? `${app}/api/order/${input.orderNumber}/open?t=${token}`
    : `${app}/order/${input.orderNumber}`;

  const rows = input.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e8e6e1;font-size:14px;color:#1a1a1a">
            ${esc(item.productName)}<br />
            <span style="font-size:12px;color:#767676">
              ${esc(item.color)} · ${esc(item.size)} · ${item.quantity} ширхэг
            </span>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #e8e6e1;font-size:14px;text-align:right;white-space:nowrap;color:#1a1a1a">
            ${formatPrice(item.lineTotal)}
          </td>
        </tr>`,
    )
    .join("");

  const discountRow =
    input.discount > 0
      ? `<tr>
           <td style="padding:4px 0;font-size:14px;color:#767676">Хямдрал</td>
           <td style="padding:4px 0;font-size:14px;text-align:right;color:#9e2b1e">−${formatPrice(input.discount)}</td>
         </tr>`
      : "";

  const noteRow = input.note
    ? `<p style="font-size:13px;line-height:1.6;color:#767676;margin:8px 0 0">
         Тэмдэглэл: ${esc(input.note)}
       </p>`
    : "";

  return `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1a1a1a">
      <p style="letter-spacing:.2em;font-size:12px;color:#767676;margin:0 0 24px">HANNAH STYLING</p>

      <h1 style="font-size:20px;font-weight:500;margin:0 0 8px">Захиалга хүлээн авлаа</h1>
      <p style="font-size:14px;line-height:1.6;color:#4a4a4a;margin:0 0 24px">
        ${esc(input.customerName)}, баярлалаа. Таны захиалгын дугаар
        <strong>${esc(input.orderNumber)}</strong>.
      </p>

      <table style="width:100%;border-collapse:collapse;margin:0 0 16px">
        <tbody>${rows}</tbody>
      </table>

      <table style="width:100%;border-collapse:collapse;margin:0 0 24px">
        <tbody>
          <tr>
            <td style="padding:4px 0;font-size:14px;color:#767676">Бараа</td>
            <td style="padding:4px 0;font-size:14px;text-align:right">${formatPrice(input.subtotal)}</td>
          </tr>
          ${discountRow}
          <tr>
            <td style="padding:4px 0;font-size:14px;color:#767676">Хүргэлт</td>
            <td style="padding:4px 0;font-size:14px;text-align:right">
              ${input.shippingFee === 0 ? "Үнэгүй" : formatPrice(input.shippingFee)}
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0 0;font-size:15px;font-weight:600;border-top:1px solid #1a1a1a">Нийт</td>
            <td style="padding:12px 0 0;font-size:15px;font-weight:600;text-align:right;border-top:1px solid #1a1a1a">
              ${formatPrice(input.total)}
            </td>
          </tr>
        </tbody>
      </table>

      <p style="font-size:12px;letter-spacing:.1em;color:#767676;margin:0 0 6px">ХҮРГЭЛТИЙН ХАЯГ</p>
      <p style="font-size:14px;line-height:1.6;margin:0">
        ${esc(input.customerName)} · ${esc(input.phone)}<br />
        ${esc(input.district)}${input.addressLine ? `, ${esc(input.addressLine)}` : ""}
      </p>
      ${noteRow}

      <p style="margin:28px 0 0">
        <a href="${link}"
           style="display:inline-block;background:#111110;color:#f2f1ed;text-decoration:none;padding:14px 28px;font-size:12px;letter-spacing:.18em">
          ЗАХИАЛГАА ХАРАХ
        </a>
      </p>

      <p style="font-size:13px;line-height:1.6;color:#767676;margin:24px 0 0">
        ${
          input.isGuest
            ? "Энэ холбоосыг хадгалж үлдээрэй — захиалгаа хянах, төлбөрөө төлөх зам нь энэ."
            : "Захиалгаа профайл дотроосоо ч хянаж болно."
        }<br />
        Асуух зүйл байвал энэ захидалд хариу бичнэ үү.
      </p>
    </div>
  `;
}

/**
 * Захидлыг илгээнэ.
 *
 * ⚠️ Энэ функц ХЭЗЭЭ Ч алдаа шиддэггүй. Захиалга аль хэдийн
 * өгөгдлийн санд орсон байхад имэйл явахгүй байснаас болж хэрэглэгчид
 * "захиалга амжилтгүй" гэж харуулбал тэр нь илүү том алдаа болно.
 * Тиймээс бүтэлгүйтвэл зөвхөн серверийн log-д бичээд өнгөрнө.
 */
export async function sendOrderConfirmation(
  input: OrderEmailInput,
): Promise<void> {
  try {
    const result = await sendEmail(
      input.to,
      `Захиалга ${input.orderNumber} хүлээн авлаа`,
      buildHtml(input),
    );

    if (!result.ok) {
      console.error(`Захиалгын захидал явсангүй (${input.orderNumber})`);
    }
  } catch (error) {
    console.error("Захиалгын захидал:", error);
  }
}
