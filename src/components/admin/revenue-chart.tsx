import { formatPrice } from "@/lib/utils";
import type { RevenuePoint } from "@/lib/queries/admin/stats.query";

/**
 * Сүүлийн 14 хоногийн орлогын багана график.
 *
 * Гадны график сан ашиглаагүй — энгийн div-үүдийн өндрийг хувиар
 * тохируулсан. Ингэснээр хуудас хөнгөн, JavaScript огт хэрэггүй.
 */
export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  // Хамгийн өндөр багана 100% болно. Бүгд 0 бол хуваахаас сэргийлж 1 авна.
  const max = Math.max(...data.map((d) => d.total), 1);
  const total = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="border border-line p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="label text-graphite">Сүүлийн 14 хоног</h2>
        <p className="font-display text-lg tabular-nums">
          {formatPrice(total)}
        </p>
      </div>

      {total === 0 ? (
        <p className="mt-8 text-sm text-graphite">
          Энэ хугацаанд захиалга бүртгэгдээгүй байна.
        </p>
      ) : (
        <div className="mt-6 flex h-40 items-end gap-1.5">
          {data.map((point) => {
            const heightPercent = (point.total / max) * 100;

            return (
              <div
                key={point.date}
                className="group relative flex h-full flex-1 flex-col justify-end"
                title={`${formatDay(point.date)} — ${formatPrice(point.total)}`}
              >
                <div
                  className="w-full bg-ink transition-opacity group-hover:opacity-70"
                  // Захиалгагүй өдөр ч нимгэн зураас болж харагдана
                  style={{ height: `${Math.max(heightPercent, 1.5)}%` }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Эхний ба сүүлийн өдрийн шошго */}
      {data.length > 0 && (
        <div className="label mt-3 flex justify-between text-graphite">
          <span>{formatDay(data[0].date)}</span>
          <span>{formatDay(data[data.length - 1].date)}</span>
        </div>
      )}
    </div>
  );
}

/** "2026-08-26" → "08/26" */
function formatDay(key: string): string {
  const [, month, day] = key.split("-");
  return `${month}/${day}`;
}
