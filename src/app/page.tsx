"use client";

import React, { useState, Suspense } from "react";
import { DogProvider, useDogContext } from "@/context/DogContext";
import Navbar from "@/components/Navbar";
import ProfileView from "@/components/profiles/ProfileView";
import MedicalView from "@/components/medical/MedicalView";
import SpaTableView from "@/components/spa/SpaTableView";
import ExpenseChartView from "@/components/expenses/ExpenseChartView";
import DailyActivityView from "@/components/activities/DailyActivityView";
import DogFormModal from "@/components/profiles/DogFormModal";

function MainContent() {
  const [currentTab, setCurrentTab] = useState<string>("profiles");
  const [isAddDogOpen, setIsAddDogOpen] = useState(false);
  const { refreshDogs } = useDogContext();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAddDog={() => setIsAddDogOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === "profiles" && <ProfileView />}
        {currentTab === "medical" && <MedicalView />}
        {currentTab === "spa" && <SpaTableView />}
        {currentTab === "expenses" && <ExpenseChartView />}
        {currentTab === "activities" && <DailyActivityView />}
      </main>

      {/* Global Quick Add Dog Modal */}
      <DogFormModal
        isOpen={isAddDogOpen}
        onClose={() => setIsAddDogOpen(false)}
        dogToEdit={null}
        onSuccess={refreshDogs}
      />

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500">
        <p>🐾 <strong>Lucky Activity</strong> — Dog Activity & Wellness Tracker • Powered by Next.js & Firebase</p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <DogProvider>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm font-semibold text-zinc-500">Loading Lucky Activity...</div>}>
        <MainContent />
      </Suspense>
    </DogProvider>
  );
}
