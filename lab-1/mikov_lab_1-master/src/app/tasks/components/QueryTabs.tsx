"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function QueryTabs({
  tabs,
}: {
  tabs: { key: string; title: string; content: React.ReactNode }[];
}) {
  const [activeKey, setActiveKey] = useState(tabs[0].key);
  const activeTab = tabs.find((t) => t.key === activeKey);

  return (
    <div className="">
      <div className="flex space-x-2 mb-6 bg-gray-100 p-2 rounded">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveKey(tab.key)}
            className={`px-4 py-2 rounded border cursor-pointer ${
              tab.key === activeKey
                ? "bg-green-700 text-white"
                : "bg-white text-gray-700 border-gray-300"
            } transition`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeKey}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
