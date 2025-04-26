"use client";

export function SqlQueriesBlock() {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mt-8 mb-2">Используемые SQL запросы</h2>

      <h3 className="text-xl font-bold mt-4">
        Запрос для З1 – Потребность (Запуск материалов):
      </h3>
      <pre className="bg-gray-100 p-3 rounded my-2 whitespace-pre-wrap">
        {`SELECT
  (p.DEN - 3) AS day_of_need,
  n.SHIFR_MAT,
  SUM(p.KOLICH * v.KOLICH * n.NORMA_RASX) AS total_needed
FROM PLAN_VYP p
JOIN VKHODIM v ON p.SHIRF_IZD = v.SHIRF_IZD
JOIN NORMY n ON v.SHIRF_DET = n.SHIRF_DET
GROUP BY day_of_need, n.SHIFR_MAT
HAVING day_of_need >= 1
ORDER BY day_of_need, n.SHIFR_MAT;`}
      </pre>

      <h3 className="text-xl font-bold mt-4">
        Запрос для получения параметров материалов:
      </h3>
      <pre className="bg-gray-100 p-3 rounded my-2 whitespace-pre-wrap">
        {`SELECT SHIFR_MAT, VREMYA_VYPOL, INTERV_POST
FROM MATER;`}
      </pre>
    </div>
  );
}
