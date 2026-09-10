"use client";

import { useState } from "react";
import { ListChecks } from "lucide-react";
import { cn } from "@/lib/cn";
import { HuskelisteTab } from "./HuskelisteTab";

const TABS = [{ key: "huskeliste", label: "Huskeliste", icon: ListChecks }] as const;

type TabKey = (typeof TABS)[number]["key"];

export function EgneNotaterClient() {
  const [tab, setTab] = useState<TabKey>("huskeliste");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 overflow-x-auto border-b border-line pb-px">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              tab === key
                ? "border-primary text-primary"
                : "border-transparent text-foreground/60 hover:text-foreground"
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === "huskeliste" && <HuskelisteTab />}
    </div>
  );
}
