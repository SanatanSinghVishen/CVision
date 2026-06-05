import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
  /** If set, the tab bar becomes sticky at this top offset (in px). */
  stickyOffset?: number;
}

export function Tabs({ tabs, defaultTab, className, stickyOffset }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const isSticky = stickyOffset !== undefined;

  return (
    <div className={cn("w-full flex flex-col", className)}>
      <div
        className={cn(
          "flex space-x-1 border-b border-[#27272A] mb-6 overflow-x-auto no-scrollbar",
          isSticky && "sticky z-30 bg-[#0A0A0F]/90 backdrop-blur-xl -mx-1 px-1"
        )}
        style={isSticky ? { top: `${stickyOffset}px` } : undefined}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap outline-none",
              activeTab === tab.id
                ? "text-[#F8F9FC]"
                : "text-[#6B7280] hover:text-[#A1A1AA]"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366F1]"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
      <div className="relative w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {tabs.find((t) => t.id === activeTab)?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

