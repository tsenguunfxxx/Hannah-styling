import { SIZE_GUIDE } from "@/lib/constants";

/**
 * Размерын заавар — хүснэгт.
 * Утга бүр constants.ts-д байгаа тул засварлахад нэг л газар өөрчилнө.
 *
 * ГАР УТСАНД ЗОРИУЛСАН ТЭМДЭГЛЭЛ:
 *
 * Урьд нь хүснэгтэд `min-w-lg` (512px) гэж доод өргөн тавьсан байв.
 * Тэр нь олон баганатай том хүснэгтээс үлдсэн хуучин тохиргоо.
 * Хоёрхон баганатай болсон хойно ч үлдсэн тул 343px өргөнтэй цонхонд
 * хүснэгт халин гарч, "Санамж нас" гарчиг болон доорх тайлбар хоёулаа
 * тасарч харагддаг байлаа.
 *
 * Одоо хүснэгт цонхныхоо өргөнд БАГТАНА. Хоёр багана богинохон утга
 * агуулдаг тул шахагдахгүй.
 */
export function SizeGuide() {
  const lastIndex = SIZE_GUIDE.columns.length - 1;

  return (
    <div className="min-w-0">
      <table className="w-full table-fixed border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink">
            {SIZE_GUIDE.columns.map((column, index) => (
              <th
                key={column}
                scope="col"
                /*
                  Сүүлийн баганыг БАРУУН тийш эгнүүлнэ. Хоёр багана
                  дэлгэцийн хоёр захад тулж, нүд хооронд нь холбоход
                  хялбар болно.
                */
                className={
                  "label py-3 text-graphite " +
                  (index === lastIndex ? "text-right" : "text-left")
                }
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {SIZE_GUIDE.rows.map((row) => (
            <tr key={row[0]} className="border-b border-line">
              {row.map((cell, index) => (
                <td
                  key={index}
                  className={
                    "py-3 tabular-nums " +
                    (index === 0
                      ? "font-medium text-ink"
                      : "text-right text-graphite")
                  }
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-5 text-xs leading-relaxed text-balance text-graphite">
        {SIZE_GUIDE.note}
      </p>
    </div>
  );
}
