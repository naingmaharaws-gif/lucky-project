"use client";

import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import StarRating from "../common/StarRating";
import { SpaRecord, SpaServiceType } from "@/types";
import { useDogContext } from "@/context/DogContext";
import { createSpaRecord, updateSpaRecord } from "@/services/spaService";
import { Loader2, Check } from "lucide-react";

interface SpaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit: SpaRecord | null;
  onSuccess: () => void;
}

const AVAILABLE_SERVICES: SpaServiceType[] = [
  "Full Bath",
  "Haircut / Styling",
  "Nail Trimming",
  "Ear Cleaning",
  "Teeth Brushing",
  "De-shedding",
  "Full Grooming Spa"
];

export default function SpaFormModal({
  isOpen,
  onClose,
  recordToEdit,
  onSuccess
}: SpaFormModalProps) {
  const { dogs, activeDogId } = useDogContext();

  const [dogId, setDogId] = useState("");
  const [date, setDate] = useState("");
  const [selectedServices, setSelectedServices] = useState<SpaServiceType[]>(["Full Bath"]);
  const [salonOrGroomer, setSalonOrGroomer] = useState("");
  const [cost, setCost] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (recordToEdit) {
      setDogId(recordToEdit.dogId);
      setDate(recordToEdit.date);
      setSelectedServices(recordToEdit.serviceTypes || ["Full Bath"]);
      setSalonOrGroomer(recordToEdit.salonOrGroomer || "");
      setCost(recordToEdit.cost.toString());
      setRating(recordToEdit.rating || 5);
      setNotes(recordToEdit.notes || "");
    } else {
      setDogId(activeDogId !== "all" ? activeDogId : dogs[0]?.id || "");
      setDate(new Date().toISOString().split("T")[0]);
      setSelectedServices(["Full Bath"]);
      setSalonOrGroomer("");
      setCost("");
      setRating(5);
      setNotes("");
    }
    setErrorMsg("");
  }, [recordToEdit, isOpen, activeDogId, dogs]);

  const toggleService = (srv: SpaServiceType) => {
    if (selectedServices.includes(srv)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s !== srv));
      }
    } else {
      setSelectedServices([...selectedServices, srv]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dogId) {
      setErrorMsg("Please select a dog.");
      return;
    }
    if (!salonOrGroomer.trim()) {
      setErrorMsg("Salon or Groomer name is required.");
      return;
    }
    if (!cost || isNaN(parseFloat(cost))) {
      setErrorMsg("Please enter a valid cost.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const payload = {
        dogId,
        date,
        serviceTypes: selectedServices,
        salonOrGroomer: salonOrGroomer.trim(),
        cost: parseFloat(cost),
        rating,
        notes: notes.trim() || undefined
      };

      if (recordToEdit) {
        await updateSpaRecord(recordToEdit.id, payload);
      } else {
        await createSpaRecord(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving spa record:", err);
      setErrorMsg(err.message || "Failed to save spa record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recordToEdit ? "Edit Spa Session" : "Log Spa & Grooming Session"}
      maxWidth="max-w-2xl"
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
              Date of Spa Visit <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Select Services Performed <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SERVICES.map((srv) => {
                const isSelected = selectedServices.includes(srv);
                return (
                  <button
                    key={srv}
                    type="button"
                    onClick={() => toggleService(srv)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      isSelected
                        ? "bg-amber-500 text-white shadow-sm"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{srv}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Salon or Groomer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={salonOrGroomer}
              onChange={(e) => setSalonOrGroomer(e.target.value)}
              placeholder="e.g. Bubbles & Barks, Pampered Pooches"
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Cost ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="e.g. 65.00"
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Experience Rating
            </label>
            <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <StarRating
                rating={rating}
                interactive={true}
                size="lg"
                onChange={(newRating) => setRating(newRating)}
              />
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {rating} of 5 Stars
              </span>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Grooming Notes & Care
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Trimmed face and paws, sensitive lavender conditioner used, dog behaved well..."
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
              "Update Session"
            ) : (
              "Save Session"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
