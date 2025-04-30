import { DemandBlock } from "./DemandBlock";
import { OrdersBlock } from "./OrdersBlock";
import { DeliveriesBlock } from "./DeliveriesBlock";
import { MovementsBlock } from "./MovementsBlock";
import { SqlQueriesBlock } from "./SqlQueriesBlock";
import QueryTabs from "./QueryTabs";
import { simulateProductionAndWarehouse } from "@/app/actions/warehouse";
import QueryForm from "./QueryForm";

export default async function QueryTable({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const initM1 = Number(searchParams.m1 ?? 5000);
  const initM2 = Number(searchParams.m2 ?? 5000);
  const initM3 = Number(searchParams.m3 ?? 5000);

  const { productionNeeds, orders, deliveries, movements } =
    await simulateProductionAndWarehouse(initM1, initM2, initM3);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Настройка и результаты</h1>
      <p className="mb-4 text-gray-600">
        Укажите начальные остатки (M1, M2, M3) на складе и нажмите
        &quot;Пересчитать&quot;
      </p>

      <QueryForm initM1={initM1} initM2={initM2} initM3={initM3} />

      <QueryTabs
        tabs={[
          {
            key: "z1",
            title: "З1. Потребности",
            content: <DemandBlock data={productionNeeds} />,
          },
          {
            key: "z2",
            title: "З2. Поставки",
            content: <DeliveriesBlock data={deliveries} />,
          },
          {
            key: "z3",
            title: "З3. Заказы",
            content: <OrdersBlock data={orders} />,
          },
          {
            key: "z4",
            title: "З4. Движение склада",
            content: <MovementsBlock data={movements} />,
          },
          {
            key: "sql",
            title: "SQL-запросы",
            content: <SqlQueriesBlock />,
          },
        ]}
      />
    </div>
  );
}
