"use client";

import React, { useState, useEffect } from "react";
import { useDogContext } from "@/context/DogContext";
import { MedicalRecord, MedicalType } from "@/types";
import { getMedicalRecords, deleteMedicalRecord } from "@/services/medicalService";
import MedicalFormModal from "./MedicalFormModal";
import DeleteConfirmModal from "../common/DeleteConfirmModal";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  HeartPulse,
  Plus,
  Search,
  Calendar,
  AlertCircle,
  Stethoscope,
  Syringe,
  Pill,
  Clock,
  DollarSign,
  Edit2,
  Trash2,
  BellRing
} from "lucide-react";

export default function MedicalView() {
  const { dogs, activeDogId } = useDogContext();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<MedicalRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<MedicalRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await getMedicalRecords(activeDogId === "all" ? undefined : activeDogId);
      setRecords(data);
    } catch (err) {
      console.error("Failed to load medical records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [activeDogId]);

  const handleOpenAdd = () => {
    setRecordToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: MedicalRecord) => {
    setRecordToEdit(rec);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    try {
      setIsDeleting(true);
      await deleteMedicalRecord(recordToDelete.id);
      await fetchRecords();
      setRecordToDelete(null);
    } catch (err) {
      console.error("Failed to delete record:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.clinicOrDoctor.toLowerCase().includes(search.toLowerCase()) ||
      (r.diagnosis && r.diagnosis.toLowerCase().includes(search.toLowerCase())) ||
      (r.treatment && r.treatment.toLowerCase().includes(search.toLowerCase()));

    const matchesType = selectedType === "all" || r.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Upcoming reminders (nextDueDate exists and is in the future)
  const upcomingReminders = records.filter((r) => {
    if (!r.nextDueDate) return false;
    const dueDate = new Date(r.nextDueDate);
    const now = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 60; // within next 60 days
  });

  const getTypeIcon = (type: MedicalType) => {
    switch (type) {
      case "Vaccination":
        return <Syringe className="w-4 h-4 text-emerald-500" />;
      case "Medication":
        return <Pill className="w-4 h-4 text-purple-500" />;
      case "Surgery":
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Stethoscope className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-transparent p-6 rounded-3xl border border-rose-200/50 dark:border-rose-900/30">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Medical Records & Vaccinations</span>
            <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-rose-500 text-white">
              {filteredRecords.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Keep track of vaccines, prescriptions, veterinary visits, and upcoming booster shots.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-rose-500/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medical Record</span>
        </button>
      </div>

      {/* Upcoming Reminders Alert Banner */}
      {upcomingReminders.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
          <BellRing className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0 animate-bounce" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">
              Upcoming Health Due Dates ({upcomingReminders.length})
            </h4>
            <div className="mt-1 flex flex-wrap gap-2">
              {upcomingReminders.map((r) => {
                const dog = dogs.find((d) => d.id === r.dogId);
                return (
                  <div
                    key={r.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-zinc-800 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-medium text-amber-900 dark:text-amber-200"
                  >
                    <span>{dog?.name || "Dog"}:</span>
                    <strong>{r.title}</strong>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      (Due {formatDate(r.nextDueDate!)})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search records, vet, or diagnosis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {["all", "Vaccination", "Vet Visit", "Medication", "Checkup", "Surgery"].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedType === t
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
              }`}
            >
              {t === "all" ? "All Types" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Medical Records List */}
      {filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((r) => {
            const dog = dogs.find((d) => d.id === r.dogId);
            return (
              <div
                key={r.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                        {getTypeIcon(r.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                            {r.type}
                          </span>
                          {dog && (
                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                              🐶 {dog.name}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                          {r.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setRecordToDelete(r)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400 my-3">
                    <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded-xl">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{formatDate(r.date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded-xl">
                      <Stethoscope className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="truncate">{r.clinicOrDoctor}</span>
                    </div>
                    {r.cost !== undefined && (
                      <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded-xl">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {formatCurrency(r.cost)}
                        </span>
                      </div>
                    )}
                    {r.nextDueDate && (
                      <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-xl text-amber-700 dark:text-amber-300">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span className="truncate">Due: {formatDate(r.nextDueDate)}</span>
                      </div>
                    )}
                  </div>

                  {r.diagnosis && (
                    <div className="text-xs text-zinc-700 dark:text-zinc-300 mb-1">
                      <span className="font-semibold text-zinc-500">Diagnosis:</span> {r.diagnosis}
                    </div>
                  )}

                  {r.treatment && (
                    <div className="text-xs text-zinc-700 dark:text-zinc-300 mb-1">
                      <span className="font-semibold text-zinc-500">Treatment:</span> {r.treatment}
                    </div>
                  )}

                  {r.notes && (
                    <p className="text-xs text-zinc-500 italic mt-2 border-t border-zinc-100 dark:border-zinc-800 pt-2">
                      Notes: {r.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8">
          <HeartPulse className="w-12 h-12 text-rose-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-1">
            No medical records found
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
            Record vaccinations, health checkups, treatments, and booster dates.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Record</span>
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      <MedicalFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recordToEdit={recordToEdit}
        onSuccess={fetchRecords}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Delete Medical Record"
        message={`Delete "${recordToDelete?.title}" from medical records?`}
      />
    </div>
  );
}
