// app/actions/warehouse.ts
"use server";
import { db } from "@/lib/db";

export type Movement = {
  day: number;
  SHIFR_MAT: string;
  startingStock: number;
  received: number;
  used: number;
  endingStock: number;
};

export type Order = {
  day_of_order: number;
  SHIFR_MAT: string;
  quantity: number;
};

/**
 * Принимаем начальные остатки (initM1, initM2, initM3) в качестве аргументов
 */
export async function simulateProductionAndWarehouse(
  initM1: number,
  initM2: number,
  initM3: number
) {
  // 1. Расчёт производственных потребностей (З1)
  const productionNeeds = db
    .prepare(
      `
      SELECT
        (p.DEN - 3) AS day_of_need,
        n.SHIFR_MAT,
        SUM(p.KOLICH * v.KOLICH * n.NORMA_RASX) AS total_needed
      FROM PLAN_VYP p
      JOIN VKHODIM v ON p.SHIFR_IZD = v.SHIFR_IZD
      JOIN NORMY n ON v.SHIFR_DET = n.SHIFR_DET
      GROUP BY day_of_need, n.SHIFR_MAT
      HAVING day_of_need >= 1
      ORDER BY day_of_need, n.SHIFR_MAT
    `
    )
    .all();

  // 2. Параметры материалов
  const materials = db
    .prepare(
      `
      SELECT SHIFR_MAT, VREMYA_VYPOL, INTERV_POST
      FROM MATER
    `
    )
    .all();

  // Вспомогательная функция для суммирования потребления
  function forecastConsumption(
    material: string,
    fromDay: number,
    toDay: number
  ): number {
    return productionNeeds
      .filter(
        (p: any) =>
          p.SHIFR_MAT === material &&
          p.day_of_need >= fromDay &&
          p.day_of_need < toDay
      )
      .reduce((sum: number, p: any) => sum + p.total_needed, 0);
  }

  // 3. Симуляция
  // Используем заданные начальные остатки
  const initialStock: Record<string, number> = {
    M1: initM1,
    M2: initM2,
    M3: initM3,
  };
  const stock: Record<string, number> = { ...initialStock };

  // Массив заказов, поставок и движений
  const orders: Order[] = [];
  const deliveries: Record<number, Record<string, number>> = {};
  const movements: Movement[] = [];

  // Симуляция на 25 дней
  for (let day = 1; day <= 25; day++) {
    // 3.1 Приём поставок
    const todaysDeliveries = deliveries[day] || {};
    for (const mat of Object.keys(stock)) {
      if (todaysDeliveries[mat]) {
        stock[mat] += todaysDeliveries[mat];
      }
    }
    const startingSnapshot = { ...stock };

    // 3.2 Формирование заказов (аналогично вашему коду)
    for (const matParam of materials) {
      const { SHIFR_MAT, VREMYA_VYPOL, INTERV_POST } = matParam;
      if (day % INTERV_POST !== 0) continue;

      const nextArrival = day + INTERV_POST + VREMYA_VYPOL;
      const effectiveNextArrival = nextArrival > 25 ? 26 : nextArrival;
      const forecast = forecastConsumption(
        SHIFR_MAT,
        day,
        effectiveNextArrival
      );

      if (stock[SHIFR_MAT] < forecast) {
        const orderQty = forecast - stock[SHIFR_MAT];
        orders.push({
          day_of_order: day,
          SHIFR_MAT,
          quantity: orderQty,
        });
        // Поставка через VREMYA_VYPOL
        const deliveryDay = day + VREMYA_VYPOL;
        if (deliveryDay <= 25) {
          if (!deliveries[deliveryDay]) deliveries[deliveryDay] = {};
          deliveries[deliveryDay][SHIFR_MAT] =
            (deliveries[deliveryDay][SHIFR_MAT] || 0) + orderQty;
        }
      }
    }

    // 3.3 Расход (З1)
    for (const mat of Object.keys(stock)) {
      const consumptionToday = productionNeeds
        .filter((p: any) => p.SHIFR_MAT === mat && p.day_of_need === day)
        .reduce((sum: number, p: any) => sum + p.total_needed, 0);
      const used = consumptionToday;
      stock[mat] -= used;
      movements.push({
        day,
        SHIFR_MAT: mat,
        startingStock: startingSnapshot[mat],
        received: todaysDeliveries[mat] || 0,
        used,
        endingStock: stock[mat],
      });
    }
  }

  return {
    productionNeeds,
    orders,
    deliveries,
    movements,
  };
}
