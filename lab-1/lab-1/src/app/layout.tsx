"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./globals.css";

const tabs = [
  { href: "/", label: "Главная" },
  { href: "/tables", label: "Таблицы" },
  { href: "/tasks", label: "Задания" },
  { href: "/query", label: "Запросы" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (href !== pathname) {
      startTransition(() => {
        router.push(href);
      });
    }
  };

  return (
    <html lang="ru">
      <body className="bg-gray-50 font-sans min-h-screen p-6">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-md">
          <nav className="relative flex space-x-2 mb-6">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;

              return (
                <button
                  key={tab.href}
                  onClick={handleClick(tab.href)}
                  className={`relative px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "text-green-700 font-semibold"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-green-700 rounded-t"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <AnimatePresence mode="wait">
            {isPending ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full min-h-[200px] flex justify-center flex-col items-center"
              >
                <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </body>
    </html>
  );
}
