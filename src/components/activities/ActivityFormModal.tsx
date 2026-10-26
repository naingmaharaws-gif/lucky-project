"use client";

import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { DailyActivity, ActivityType } from "@/types";
import { useDogContext } from "@/context/DogContext";
import { createDailyActivity, updateDailyActivity } from "@/services/activityService";
import { Loader2 } from "lucide-react";

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit: DailyActivity | null;
  defaultDate?: string;
  onSuccess: () => void;
}

const ACTIVITY_TYPES: { type: ActivityType; emoji: string }[] = [
  { type: "Walk", emoji: "🐾" },
  { type: "Meal", emoji: "🍖" },
  { type: "Potty", emoji: "💧" },
  { type: "Playtime", emoji: "🎾" },
  { type: "Training", emoji: "🎓" },
  { type: "Medication", emoji: "💊" },
  { type: "Sleep / Rest", emoji: "💤" }
];

export default function ActivityFormModal({
  isOpen,
  onClose,
  recordToEdit,
  defaultDate,
  onSuccess
}: ActivityFormModalProps) {
  const { dogs, activeDogId } = useDogContext();

  const [dogId, setDogId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [activityType, setActivityType] = useState<ActivityType>("Walk");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [details, setDetails] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (recordToEdit) {
      setDogId(recordToEdit.dogId);
      setDate(recordToEdit.date);
      setTime(recordToEdit.time);
      setActivityType(recordToEdit.activityType);
      setDurationMinutes(recordToEdit.durationMinutes ? recordToEdit.durationMinutes.toString() : "");
      setDetails(recordToEdit.details || "");
    } else {
      setDogId(activeDogId !== "all" ? activeDogId : dogs[0]?.id || "");
      setDate(defaultDate || new Date().toISOString().split("T")[0]);
      
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      setTime(`${hh}:${mm}`);

      setActivityType("Walk");
      setDurationMinutes("30");
      setDetails("");
    }
    setErrorMsg("");
  }, [recordToEdit, isOpen, activeDogId, dogs, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dogId) {
      setErrorMsg("Please select a dog.");
      return;
    }
    if (!date || !time) {
      setErrorMsg("Date and time are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const payload = {
        dogId,
        date,
        time,
        activityType,
        durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : undefined,
        details: details.trim() || undefined
      };

      if (recordToEdit) {
        await updateDailyActivity(recordToEdit.id, payload);
      } else {
        await createDailyActivity(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving activity:", err);
      setErrorMsg(err.message || "Failed to save activity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recordToEdit ? "Edit Activity Log" : "Log Daily Activity"}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Select Dog <span className="text-red-500">*</span>
            </label>
            <select
              value={dogId}
              onChange={(e) => setDogId(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {dogs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.breed || d.species})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Activity Type <span className="text-red-500">*</span>
            </label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value as ActivityType)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {ACTIVITY_TYPES.map((a) => (
                <option key={a.type} value={a.type}>
                  {a.emoji} {a.type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Time of Day <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Duration (Minutes) (Optional)
            </label>
            <input
              type="number"
              min="1"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="e.g. 30"
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Notes & Details
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Walked 1.5 miles around neighbourhood, had fun greeting another golden retriever..."
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md transition"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : recordToEdit ? (
              "Update Activity"
            ) : (
              "Log Activity"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
