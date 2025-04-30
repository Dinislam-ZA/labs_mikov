"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export function DemandBlock({ data }: { data: any[] }) {
  const grouped = data.reduce((acc: any[], row: any) => {
    const existing = acc.find((e) => e.day === row.day_of_need);
    if (existing) {
      existing[row.SHIFR_MAT] = Number(row.total_needed);
    } else {
      acc.push({
        day: row.day_of_need,
        [row.SHIFR_MAT]: Number(row.total_needed),
      });
    }
    return acc;
  }, []);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-2">
        Задание 1: Потребности в материалах
      </h2>
      <p className="mb-4 text-gray-600">
        Для обеспечения плана выпуска изделий рассчитывается необходимое
        количество материалов на каждый день. Потребность определяется с учётом
        структуры изделий, количества деталей и норм расхода материалов. День
        запуска материала = день выпуска изделия - 3 дня.
      </p>
      <h3 className="text-lg font-bold mb-2">
        График потребностей по материалам
      </h3>
      <LineChart width={700} height={300} data={grouped}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip formatter={(value: number) => value.toFixed(1)} />
        <Legend />
        <Line type="monotone" dataKey="M1" stroke="#8884d8" />
        <Line type="monotone" dataKey="M2" stroke="#82ca9d" />
        <Line type="monotone" dataKey="M3" stroke="#ff7300" />
      </LineChart>

      <h3 className="text-lg font-bold mt-6 mb-2">Таблица потребностей</h3>
      <table className="min-w-full border border-gray-300 mb-4">
        <thead>
          <tr>
            <th className="border p-2">День</th>
            <th className="border p-2">Материал</th>
            <th className="border p-2">Потребность</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td className="border p-2 text-center">{row.day_of_need}</td>
              <td className="border p-2 text-center">{row.SHIFR_MAT}</td>
              <td className="border p-2 text-center">
                {Number(row.total_needed).toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
