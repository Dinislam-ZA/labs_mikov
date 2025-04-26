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

export function DeliveriesBlock({
  data,
}: {
  data: Record<number, Record<string, number>>;
}) {
  const grouped: any[] = [];

  for (let day = 1; day <= 25; day++) {
    const entry: any = { day };
    const dayData = data[day] || {};
    for (const mat of ["M1", "M2", "M3"]) {
      entry[mat] = dayData[mat] ? Number(dayData[mat]) : 0;
    }
    grouped.push(entry);
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-2">
        Задание 2: Поставки материалов
      </h2>
      <p className="mb-4 text-gray-600">
        Поставки материалов рассчитываются на основе оформленных заказов и
        времени их выполнения. Доставка каждого заказа осуществляется через
        определённое количество дней: для материалов M1 и M3 — через 2 дня, для
        M2 — через 1 день. График показывает, сколько материала поступает на
        склад в каждый день симуляции.
      </p>

      <h3 className="text-lg font-bold mb-2">График поставок по материалам</h3>
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

      <h3 className="text-lg font-bold mt-6 mb-2">Таблица поставок</h3>
      <table className="min-w-full border border-gray-300 mb-4">
        <thead>
          <tr>
            <th className="border p-2">День поставки</th>
            <th className="border p-2">Материал</th>
            <th className="border p-2">Количество</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(data).map((deliveryDay) =>
            Object.entries(data[+deliveryDay]).map(([mat, qty]) => (
              <tr key={`${deliveryDay}-${mat}`}>
                <td className="border p-2 text-center">{deliveryDay}</td>
                <td className="border p-2 text-center">{mat}</td>
                <td className="border p-2 text-center">
                  {Number(qty).toFixed(1)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
