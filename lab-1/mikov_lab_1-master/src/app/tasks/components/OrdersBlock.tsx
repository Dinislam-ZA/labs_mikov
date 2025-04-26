"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export function OrdersBlock({ data }: { data: any[] }) {
  // Сформируем массив [1..25], где для каждого дня подставим M1, M2, M3 = 0,
  // либо если в data есть заказ.
  const grouped = Array.from({ length: 25 }, (_, i) => {
    const entry: any = { day: i + 1 };
    ["M1", "M2", "M3"].forEach((mat) => {
      const order = data.find(
        (o) => o.day_of_order === i + 1 && o.SHIFR_MAT === mat
      );
      entry[mat] = order ? Number(order.quantity) : 0;
    });
    return entry;
  });

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-2">
        Задание 3: Заказы на материалы
      </h2>
      <p className="mb-4 text-gray-600">
        Заказы оформляются только в разрешённые дни (согласно INTERV_POST).
        Решение о заказе принимается, если текущего запаса недостаточно для
        покрытия потребностей до следующей возможной поставки. Заказ формируется
        ровно на недостающее количество.
      </p>

      <h3 className="text-lg font-bold mb-2">График заказов по материалам</h3>
      <BarChart width={700} height={300} data={grouped}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip formatter={(value: number) => value.toFixed(1)} />
        <Legend />
        <Bar dataKey="M1" stackId="a" fill="#8884d8" />
        <Bar dataKey="M2" stackId="a" fill="#82ca9d" />
        <Bar dataKey="M3" stackId="a" fill="#ff7300" />
      </BarChart>

      <h3 className="text-lg font-bold mt-6 mb-2">Таблица заказов</h3>
      <table className="min-w-full border border-gray-300 mb-4">
        <thead>
          <tr>
            <th className="border p-2">День заказа</th>
            <th className="border p-2">Материал</th>
            <th className="border p-2">Количество</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td className="border p-2 text-center">{row.day_of_order}</td>
              <td className="border p-2 text-center">{row.SHIFR_MAT}</td>
              <td className="border p-2 text-center">
                {Number(row.quantity).toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
