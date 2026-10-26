"use client";

import React from "react";
import { useDogContext } from "@/context/DogContext";
import { Dog, HeartPulse, Sparkles, PieChart, CalendarCheck, Plus, ChevronDown } from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAddDog: () => void;
}

export default function Navbar({ currentTab, setCurrentTab, onOpenAddDog }: NavbarProps) {
  const { dogs, activeDogId, setActiveDogId } = useDogContext();

  const navItems = [
    { id: "profiles", label: "Dog Profiles", icon: Dog },
    { id: "medical", label: "Medical Records", icon: HeartPulse },
    { id: "spa", label: "Spa & Grooming", icon: Sparkles },
    { id: "expenses", label: "Expenses & Analytics", icon: PieChart },
    { id: "activities", label: "Daily Activities", icon: CalendarCheck },
  ];

  const activeDog = dogs.find((d) => d.id === activeDogId);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <span className="text-xl">🐾</span>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">
                Lucky Activity
              </span>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Dog Wellness & Logs</p>
            </div>
          </div>

          {/* Active Dog Selector & Quick Add */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 border border-zinc-200 dark:border-zinc-800">
              <label htmlFor="dog-selector" className="text-xs font-medium text-zinc-500 dark:text-zinc-400 pl-2 pr-1 flex items-center gap-1.5">
                <span>Dog:</span>
              </label>
              <select
                id="dog-selector"
                value={activeDogId}
                onChange={(e) => setActiveDogId(e.target.value)}
                className="bg-transparent text-sm font-semibold text-zinc-800 dark:text-zinc-200 py-1 pl-1 pr-6 focus:outline-none cursor-pointer appearance-none"
              >
                <option value="all">🐾 All Dogs</option>
                {dogs.map((dog) => (
                  <option key={dog.id} value={dog.id}>
                    🐶 {dog.name} ({dog.breed || dog.species})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2 pointer-events-none" />
            </div>

            <button
              onClick={onOpenAddDog}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Dog</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar py-2 border-t border-zinc-100 dark:border-zinc-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/25"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-500 dark:text-zinc-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
