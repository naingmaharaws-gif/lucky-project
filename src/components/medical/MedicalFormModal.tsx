"use client";

import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { MedicalRecord, MedicalType } from "@/types";
import { useDogContext } from "@/context/DogContext";
import { createMedicalRecord, updateMedicalRecord } from "@/services/medicalService";
import { Loader2 } from "lucide-react";

interface MedicalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit: MedicalRecord | null;
  onSuccess: () => void;
}

const MEDICAL_TYPES: MedicalType[] = [
  "Vaccination",
  "Vet Visit",
  "Medication",
  "Surgery",
  "Dental",
  "Deworming",
  "Checkup",
  "Other"
];

export default function MedicalFormModal({
  isOpen,
  onClose,
  recordToEdit,
  onSuccess
}: MedicalFormModalProps) {
  const { dogs, activeDogId } = useDogContext();

  const [dogId, setDogId] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<MedicalType>("Vaccination");
  const [title, setTitle] = useState("");
  const [clinicOrDoctor, setClinicOrDoctor] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [cost, setCost] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (recordToEdit) {
      setDogId(recordToEdit.dogId);
      setDate(recordToEdit.date);
      setType(recordToEdit.type);
      setTitle(recordToEdit.title);
      setClinicOrDoctor(recordToEdit.clinicOrDoctor || "");
      setDiagnosis(recordToEdit.diagnosis || "");
      setTreatment(recordToEdit.treatment || "");
      setCost(recordToEdit.cost ? recordToEdit.cost.toString() : "");
      setNextDueDate(recordToEdit.nextDueDate || "");
      setNotes(recordToEdit.notes || "");
    } else {
      setDogId(activeDogId !== "all" ? activeDogId : dogs[0]?.id || "");
      setDate(new Date().toISOString().split("T")[0]);
      setType("Vaccination");
      setTitle("");
      setClinicOrDoctor("");
      setDiagnosis("");
      setTreatment("");
      setCost("");
      setNextDueDate("");
      setNotes("");
    }
    setErrorMsg("");
  }, [recordToEdit, isOpen, activeDogId, dogs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dogId) {
      setErrorMsg("Please select a dog.");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Title/Procedure is required.");
      return;
    }
    if (!date) {
      setErrorMsg("Date is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const payload = {
        dogId,
        date,
        type,
        title: title.trim(),
        clinicOrDoctor: clinicOrDoctor.trim() || "Vet Clinic",
        diagnosis: diagnosis.trim() || undefined,
        treatment: treatment.trim() || undefined,
        cost: cost ? parseFloat(cost) : undefined,
        nextDueDate: nextDueDate || undefined,
        notes: notes.trim() || undefined
      };

      if (recordToEdit) {
        await updateMedicalRecord(recordToEdit.id, payload);
      } else {
        await createMedicalRecord(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving medical record:", err);
      setErrorMsg(err.message || "Failed to save record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recordToEdit ? "Edit Medical Record" : "Add Medical Record"}
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
              Record Type <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MedicalType)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {MEDICAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Title / Procedure / Vaccine Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rabies Booster Shot, Annual Wellness Exam, Ear Drops"
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Date of Treatment <span className="text-red-500">*</span>
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
              Next Due / Booster Date (Optional)
            </label>
            <input
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Clinic or Veterinarian
            </label>
            <input
              type="text"
              value={clinicOrDoctor}
              onChange={(e) => setClinicOrDoctor(e.target.value)}
              placeholder="e.g. Happy Paws Vet Clinic"
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Cost ($) (Optional)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="e.g. 85.00"
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Diagnosis / Findings
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Normal teeth, healthy heartbeat, mild skin irritation"
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Prescription / Treatment Plan
            </label>
            <textarea
              rows={2}
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="e.g. Antibiotic cream 2x daily for 7 days"
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Additional Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Post-visit behavior, side effects, tips..."
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
              "Update Record"
            ) : (
              "Save Record"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
