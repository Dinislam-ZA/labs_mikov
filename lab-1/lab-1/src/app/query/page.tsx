"use client";

import { runQuery } from "@/app/actions/runQuery";
import Form from "next/form";
import { useRef, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const presetQueries = [
  {
    label: "Суммарный план выпуска по изделиям",
    query: `
  SELECT 
    SHIFR_IZD AS Изделие, 
    SUM(KOLICH) AS Всего_выпущено 
  FROM PLAN_VYP 
  GROUP BY SHIFR_IZD;
      `.trim(),
  },
  {
    label: "Материалы, используемые в изделии I1",
    query: `
  SELECT DISTINCT 
    n.SHIFR_MAT AS Материал
  FROM VKHODIM v
  JOIN NORMY n ON v.SHIFR_DET = n.SHIFR_DET
  WHERE v.SHIFR_IZD = 'I1';
      `.trim(),
  },
  {
    label: "Суммарный расход материалов на изделие I2 (1 шт)",
    query: `
  SELECT 
    n.SHIFR_MAT AS Материал,
    v.KOLICH * n.NORMA_RASX AS Расход_на_изделие
  FROM VKHODIM v
  JOIN NORMY n ON v.SHIFR_DET = n.SHIFR_DET
  WHERE v.SHIFR_IZD = 'I2';
      `.trim(),
  },
  {
    label: "План выпуска по дням с деталями",
    query: `
  SELECT 
    p.DEN AS День,
    p.SHIFR_IZD AS Изделие,
    d.SHIFR_DET AS Деталь,
    d.NAZV_DET AS Название_детали,
    v.KOLICH * p.KOLICH AS Всего_деталей
  FROM PLAN_VYP p
  JOIN VKHODIM v ON p.SHIFR_IZD = v.SHIFR_IZD
  JOIN DETALI d ON v.SHIFR_DET = d.SHIFR_DET
  ORDER BY p.DEN, p.SHIFR_IZD;
      `.trim(),
  },
  {
    label: "Нормы расхода по каждому материалу",
    query: `
  SELECT 
    n.SHIFR_MAT AS Материал,
    m.NAZV_MAT AS Название,
    COUNT(*) AS Количество_деталей,
    SUM(n.NORMA_RASX) AS Суммарная_норма
  FROM NORMY n
  JOIN MATER m ON m.SHIFR_MAT = n.SHIFR_MAT
  GROUP BY n.SHIFR_MAT;
      `.trim(),
  },
];

export default function QueryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const queryParam =
    typeof searchParams.query === "string" ? searchParams.query : "";

  const [query, setQuery] = useState(queryParam);
  const [result, setResult] = useState<
    { rows: any[]; columns: string[] } | { error: string } | null
  >(null);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Выполняем запрос при загрузке страницы, если он был передан
  useEffect(() => {
    if (query) {
      runQuery(query).then((res) => setResult(res));
    }
  }, [query]);

  const handlePresetClick = (presetQuery: string) => {
    setQuery(presetQuery);
    startTransition(() => {
      const encoded = encodeURIComponent(presetQuery);
      router.replace(`/query?query=${encoded}`);
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Выполнить запрос</h1>

      {/* Presets */}
      <div className="mb-4 flex flex-wrap gap-2">
        {presetQueries.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm cursor-pointer"
            onClick={() => handlePresetClick(preset.query)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Форма */}
      <Form action="" ref={formRef} className="mb-6">
        <textarea
          ref={textareaRef}
          name="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={4}
          className="w-full border rounded p-2 font-mono mb-2"
          placeholder="Введите запрос, например: SELECT * FROM PLAN_VYP"
        />
        <button
          type="submit"
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Выполнить
        </button>
      </Form>

      {/* Результаты */}
      {isPending && <p className="text-gray-400">Загрузка...</p>}

      {result && "error" in result && (
        <div className="text-red-600 font-mono whitespace-pre">
          Ошибка: {result.error}
        </div>
      )}

      {result && "rows" in result && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Результат</h2>
          {result.rows.length === 0 ? (
            <p className="text-gray-500">Нет данных</p>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-full border border-gray-300 text-sm">
                <thead>
                  <tr>
                    {result.columns.map((col) => (
                      <th
                        key={col}
                        className="border p-2 bg-gray-100 text-left"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {result.columns.map((col) => (
                        <td key={col} className="border p-2">
                          {String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
