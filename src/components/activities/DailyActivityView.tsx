"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useDogContext } from "@/context/DogContext";
import { DailyActivity, ActivityType } from "@/types";
import {
  getDailyActivities,
  createDailyActivity,
  deleteDailyActivity
} from "@/services/activityService";
import ActivityFormModal from "./ActivityFormModal";
import DeleteConfirmModal from "../common/DeleteConfirmModal";
import { formatDate } from "@/lib/utils";
import {
  CalendarCheck,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Footprints,
  Utensils,
  Sparkles,
  Gamepad2,
  GraduationCap,
  Pill,
  Moon,
  Edit2,
  Trash2
} from "lucide-react";

export default function DailyActivityView() {
  const { dogs, activeDogId } = useDogContext();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [todayStr, setTodayStr] = useState<string>("");
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<DailyActivity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<DailyActivity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setTodayStr(today);
    setSelectedDate((prev) => (prev ? prev : today));
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await getDailyActivities(
        activeDogId === "all" ? undefined : activeDogId,
        selectedDate
      );
      setActivities(data);
    } catch (err) {
      console.error("Failed to load daily activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [activeDogId, selectedDate]);

  // Date navigation
  const shiftDay = (days: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    setSelectedDate(cur.toISOString().split("T")[0]);
  };

  const isToday = selectedDate === todayStr;

  // Quick logging button action
  const handleQuickLog = async (type: ActivityType, defaultDuration?: number, note = "") => {
    const targetDogId = activeDogId !== "all" ? activeDogId : dogs[0]?.id;
    if (!targetDogId) {
      alert("Please create or select a dog first.");
      return;
    }

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");

    try {
      await createDailyActivity({
        dogId: targetDogId,
        date: selectedDate,
        time: `${hh}:${mm}`,
        activityType: type,
        durationMinutes: defaultDuration,
        details: note || `Quick logged ${type}`
      });
      await fetchActivities();
    } catch (err) {
      console.error("Quick log failed:", err);
    }
  };

  const handleOpenAdd = () => {
    setActivityToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (act: DailyActivity) => {
    setActivityToEdit(act);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!activityToDelete) return;
    try {
      setIsDeleting(true);
      await deleteDailyActivity(activityToDelete.id);
      await fetchActivities();
      setActivityToDelete(null);
    } catch (err) {
      console.error("Failed to delete activity:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Day Stats
  const totalWalkMinutes = useMemo(() => {
    return activities
      .filter((a) => a.activityType === "Walk")
      .reduce((sum, a) => sum + (a.durationMinutes || 0), 0);
  }, [activities]);

  const totalMeals = useMemo(() => {
    return activities.filter((a) => a.activityType === "Meal").length;
  }, [activities]);

  const totalPotty = useMemo(() => {
    return activities.filter((a) => a.activityType === "Potty").length;
  }, [activities]);

  const filteredActivities = activities.filter((a) => {
    if (filterType === "all") return true;
    return a.activityType === filterType;
  });

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "Walk":
        return <Footprints className="w-4 h-4 text-emerald-500" />;
      case "Meal":
        return <Utensils className="w-4 h-4 text-amber-500" />;
      case "Potty":
        return <Sparkles className="w-4 h-4 text-sky-500" />;
      case "Playtime":
        return <Gamepad2 className="w-4 h-4 text-indigo-500" />;
      case "Training":
        return <GraduationCap className="w-4 h-4 text-purple-500" />;
      case "Medication":
        return <Pill className="w-4 h-4 text-rose-500" />;
      case "Sleep / Rest":
        return <Moon className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent p-6 rounded-3xl border border-amber-200/50 dark:border-amber-900/30">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Daily Activity Tracker</span>
            <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-amber-500 text-white">
              {activities.length} Logs
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Log walks, meals, potty breaks, playtime, and track daily canine habits.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-amber-500/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Log</span>
        </button>
      </div>

      {/* Date Navigation & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => shiftDay(-1)}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-sm font-bold text-zinc-900 dark:text-white bg-transparent border-0 focus:outline-none cursor-pointer"
          />

          <button
            onClick={() => shiftDay(1)}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200 transition"
            >
              Today
            </button>
          )}
        </div>

        {/* Daily Summary Counters */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Footprints className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-bold">{totalWalkMinutes} mins</span> walk
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Utensils className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-bold">{totalMeals}</span> meals
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span className="font-bold">{totalPotty}</span> potty
          </div>
        </div>
      </div>

      {/* 1-Click Quick Log Bar */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <p className="text-xs font-semibold text-zinc-500 mb-2">⚡ 1-Click Quick Log:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickLog("Walk", 30, "30-minute walk")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition"
          >
            <span>🐾</span>
            <span>Walk 30m</span>
          </button>

          <button
            onClick={() => handleQuickLog("Meal", 10, "Fed regular meal")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition"
          >
            <span>🍖</span>
            <span>Meal</span>
          </button>

          <button
            onClick={() => handleQuickLog("Potty", 5, "Routine potty break")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition"
          >
            <span>💧</span>
            <span>Potty Break</span>
          </button>

          <button
            onClick={() => handleQuickLog("Playtime", 20, "Playtime fetch/tug")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition"
          >
            <span>🎾</span>
            <span>Play 20m</span>
          </button>

          <button
            onClick={() => handleQuickLog("Medication", undefined, "Given routine meds/supplement")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition"
          >
            <span>💊</span>
            <span>Medication</span>
          </button>
        </div>
      </div>

      {/* Activity Timeline Stream */}
      <div className="space-y-3">
        {filteredActivities.length > 0 ? (
          <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
            {filteredActivities.map((a) => {
              const dog = dogs.find((d) => d.id === a.dogId);
              return (
                <div
                  key={a.id}
                  className="relative group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 transition hover:shadow-md flex items-start justify-between gap-3"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] top-4 w-6 h-6 rounded-full bg-white dark:bg-zinc-900 border-2 border-amber-500 flex items-center justify-center text-xs">
                    •
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 mt-0.5">
                      {getActivityIcon(a.activityType)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                          {a.activityType}
                        </span>
                        {dog && (
                          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            • {dog.name}
                          </span>
                        )}
                        {a.durationMinutes && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                            {a.durationMinutes} mins
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{a.time}</span>
                      </div>

                      {a.details && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-2">
                          {a.details}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(a)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActivityToDelete(a)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8">
            <CalendarCheck className="w-12 h-12 text-amber-500 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              No activities logged for {formatDate(selectedDate)}
            </p>
            <p className="text-xs text-zinc-400 mt-1 mb-4">
              Use the 1-Click Quick Log buttons above or log a custom activity.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Activity</span>
            </button>
          </div>
        )}
      </div>

      {/* Activity Form Modal */}
      <ActivityFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recordToEdit={activityToEdit}
        defaultDate={selectedDate}
        onSuccess={fetchActivities}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!activityToDelete}
        onClose={() => setActivityToDelete(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Delete Activity Log"
        message={`Delete "${activityToDelete?.activityType}" at ${activityToDelete?.time}?`}
      />
    </div>
  );
}
