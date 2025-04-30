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

export function MovementsBlock({ data }: { data: any[] }) {
  // Для графика остатков соберём массив [1..25],
  // где M1, M2, M3 = endingStock, если есть запись
  const grouped = Array.from({ length: 25 }, (_, i) => {
    const day = i + 1;
    const entry: any = { day };
    ["M1", "M2", "M3"].forEach((mat) => {
      const row = data.find((d) => d.day === day && d.SHIFR_MAT === mat);
      entry[mat] = row ? Number(row.endingStock) : 0;
    });
    return entry;
  });

  console.log({ grouped });

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-2">
        Задание 4: Движение материалов на складе
      </h2>
      <p className="mb-4 text-gray-600">
        В этом разделе показано движение материалов: остатки, поступления и
        списания на каждый день. На графике можно проследить, как изменяются
        запасы каждого материала со временем.
      </p>

      <h3 className="text-lg font-bold mb-2">
        График остатков материалов на складе
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

      <h3 className="text-lg font-bold mt-6 mb-2">
        Таблица движения материалов
      </h3>
      <table className="min-w-full border border-gray-300 mb-4">
        <thead>
          <tr>
            <th className="border p-2">День</th>
            <th className="border p-2">Материал</th>
            <th className="border p-2">Начало дня</th>
            <th className="border p-2">Поступило</th>
            <th className="border p-2">Израсходовано</th>
            <th className="border p-2">Остаток</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td className="border p-2 text-center">{row.day}</td>
              <td className="border p-2 text-center">{row.SHIFR_MAT}</td>
              <td className="border p-2 text-center">
                {Number(row.startingStock).toFixed(1)}
              </td>
              <td className="border p-2 text-center">
                {Number(row.received).toFixed(1)}
              </td>
              <td className="border p-2 text-center">
                {Number(row.used).toFixed(1)}
              </td>
              <td className="border p-2 text-center">
                {Number(row.endingStock).toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
