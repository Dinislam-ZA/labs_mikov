"use client";

import { useState, useTransition } from "react";

export function useQueryAction<T>(action: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isPending, startTransition] = useTransition();

  const run = () => {
    startTransition(async () => {
      const result = await action();
      setData(result);
    });
  };

  return { data, isPending, run };
}
