import { SIZE_GUIDE } from "@/lib/constants";

/**
 * Размерын заавар — хүснэгт.
 * Утга бүр constants.ts-д байгаа тул засварлахад нэг л газар өөрчилнө.
 */
export function SizeGuide() {
  return (
    <div>
      {/* Жижиг дэлгэцэнд хүснэгт багтахгүй тул ЗӨВХӨН хүснэгт нь хажуу тийш гүйнэ */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-lg border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink">
              {SIZE_GUIDE.columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="label py-3 text-left text-graphite"
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
                      index === 0
                        ? "py-3 font-medium"
                        : "py-3 tabular-nums text-graphite"
                    }
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-graphite">{SIZE_GUIDE.note}</p>
    </div>
  );
}
