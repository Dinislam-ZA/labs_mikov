"use client";

import { useEffect, useState, useTransition } from "react";
import { getAllTables } from "@/app/actions/getTables";
import { motion, AnimatePresence } from "framer-motion";

export default function TablesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<{ [key: string]: any[] }>({});
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    startTransition(async () => {
      const res = await getAllTables();
      setData(res);
    });
  }, []);

  const tablesToShow = selectedTable
    ? { [selectedTable]: data[selectedTable] }
    : data;

  const toggleExpand = (table: string) => {
    setExpanded((prev) => ({ ...prev, [table]: !prev[table] }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Таблицы</h2>

      <div className="mb-6">
        <label className="block mb-2 text-gray-700 font-medium">
          Выберите таблицу:
        </label>
        <select
          className="border rounded px-4 py-2 w-full max-w-sm"
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
        >
          <option value="">Все таблицы</option>
          {Object.keys(data).map((table) => (
            <option key={table} value={table}>
              {table}
            </option>
          ))}
        </select>
      </div>

      <AnimatePresence>
        {Object.entries(tablesToShow).map(([tableName, rows]) => {
          const showAll = expanded[tableName];
          const visibleRows = showAll ? rows : rows.slice(0, 3);

          return (
            <motion.div
              key={tableName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="mb-12"
            >
              <h3 className="text-xl font-semibold mb-2 ">
                Таблица &quot;
                <span className="text-green-700">{tableName}</span>&quot;
              </h3>
              <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-sm border-collapse">
                  <thead className="bg-gray-200">
                    <tr>
                      {rows.length > 0 &&
                        Object.keys(rows[0]).map((col) => (
                          <th
                            key={col}
                            className="px-3 py-2 border font-semibold"
                          >
                            {col}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row, idx) => (
                      <tr key={idx} className="even:bg-gray-50">
                        {Object.values(row).map((val, i) => (
                          <td
                            key={i}
                            className="px-3 py-2 border whitespace-nowrap"
                          >
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rows.length > 3 && (
                <button
                  onClick={() => toggleExpand(tableName)}
                  className="mt-2 text-sm text-green-700 hover:underline cursor-pointer"
                >
                  {showAll ? "Скрыть" : "Показать полностью"}
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {isPending && (
        <div className="text-center mt-6 text-gray-500 animate-pulse">
          Загрузка таблиц...
        </div>
      )}
    </div>
  );
}
