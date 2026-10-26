"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useDogContext } from "@/context/DogContext";
import { SpaRecord } from "@/types";
import { getSpaRecords, deleteSpaRecord } from "@/services/spaService";
import SpaFormModal from "./SpaFormModal";
import DeleteConfirmModal from "../common/DeleteConfirmModal";
import StarRating from "../common/StarRating";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  Sparkles,
  Plus,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Scissors,
  DollarSign,
  Award
} from "lucide-react";

type SortField = "date" | "cost" | "rating" | "salonOrGroomer";
type SortOrder = "asc" | "desc";

export default function SpaTableView() {
  const { dogs, activeDogId } = useDogContext();
  const [records, setRecords] = useState<SpaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<SpaRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<SpaRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await getSpaRecords(activeDogId === "all" ? undefined : activeDogId);
      setRecords(data);
    } catch (err) {
      console.error("Failed to load spa records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [activeDogId]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const filteredAndSortedRecords = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = records.filter((r) => {
      const matchSearch =
        r.salonOrGroomer.toLowerCase().includes(q) ||
        (r.notes && r.notes.toLowerCase().includes(q)) ||
        r.serviceTypes.some((s) => s.toLowerCase().includes(q));
      return matchSearch;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === "cost") {
        comparison = a.cost - b.cost;
      } else if (sortField === "rating") {
        comparison = a.rating - b.rating;
      } else if (sortField === "salonOrGroomer") {
        comparison = a.salonOrGroomer.localeCompare(b.salonOrGroomer);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [records, search, sortField, sortOrder]);

  // Aggregate stats
  const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
  const avgCost = records.length > 0 ? totalCost / records.length : 0;
  const avgRating = records.length > 0 ? (records.reduce((sum, r) => sum + r.rating, 0) / records.length).toFixed(1) : "0";

  const handleOpenAdd = () => {
    setRecordToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: SpaRecord) => {
    setRecordToEdit(rec);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    try {
      setIsDeleting(true);
      await deleteSpaRecord(recordToDelete.id);
      await fetchRecords();
      setRecordToDelete(null);
    } catch (err) {
      console.error("Failed to delete spa record:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-amber-500" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-amber-500" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-500/10 via-amber-500/5 to-transparent p-6 rounded-3xl border border-purple-200/50 dark:border-purple-900/30">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Spa & Grooming Records</span>
            <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-purple-500 text-white">
              Table View ({filteredAndSortedRecords.length})
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Detailed log of grooming appointments, styling, baths, nail trimming, and salon reviews.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-purple-600/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Log Spa Session</span>
        </button>
      </div>

      {/* KPI Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Total Spa Visits</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-white">{records.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Avg Cost / Visit</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-white">{formatCurrency(avgCost)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Average Rating</p>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-zinc-900 dark:text-white">{avgRating}</span>
              <span className="text-xs text-amber-500">★</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search salon, service (e.g. Bath, Nail), or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Spa Table View */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 uppercase font-semibold">
              <tr>
                <th
                  onClick={() => handleSort("date")}
                  className="px-5 py-3.5 cursor-pointer hover:text-zinc-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    {renderSortIndicator("date")}
                  </div>
                </th>
                <th className="px-5 py-3.5">Dog</th>
                <th className="px-5 py-3.5">Services</th>
                <th
                  onClick={() => handleSort("salonOrGroomer")}
                  className="px-5 py-3.5 cursor-pointer hover:text-zinc-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Groomer / Salon</span>
                    {renderSortIndicator("salonOrGroomer")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("rating")}
                  className="px-5 py-3.5 cursor-pointer hover:text-zinc-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Rating</span>
                    {renderSortIndicator("rating")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("cost")}
                  className="px-5 py-3.5 cursor-pointer hover:text-zinc-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Cost</span>
                    {renderSortIndicator("cost")}
                  </div>
                </th>
                <th className="px-5 py-3.5">Notes</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredAndSortedRecords.length > 0 ? (
                filteredAndSortedRecords.map((r) => {
                  const dog = dogs.find((d) => d.id === r.dogId);
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition"
                    >
                      {/* Date */}
                      <td className="px-5 py-4 whitespace-nowrap font-medium text-zinc-900 dark:text-white">
                        {formatDate(r.date)}
                      </td>

                      {/* Dog */}
                      <td className="px-5 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-300">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold">
                          🐶 {dog?.name || "Dog"}
                        </span>
                      </td>

                      {/* Services */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {r.serviceTypes.map((srv, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-medium"
                            >
                              {srv}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Salon / Groomer */}
                      <td className="px-5 py-4 whitespace-nowrap font-medium text-zinc-800 dark:text-zinc-200">
                        {r.salonOrGroomer}
                      </td>

                      {/* Rating */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StarRating rating={r.rating} size="sm" />
                      </td>

                      {/* Cost */}
                      <td className="px-5 py-4 whitespace-nowrap font-bold text-zinc-900 dark:text-white">
                        {formatCurrency(r.cost)}
                      </td>

                      {/* Notes */}
                      <td className="px-5 py-4 text-xs text-zinc-500 max-w-xs truncate" title={r.notes}>
                        {r.notes || "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRecordToDelete(r)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-zinc-500">
                    <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold">No spa or grooming records found</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {search ? "Try clearing your search filters" : "Click 'Log Spa Session' to add your first grooming visit."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Spa Form Modal */}
      <SpaFormModal
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
        title="Delete Spa Record"
        message={`Delete grooming session at "${recordToDelete?.salonOrGroomer}"?`}
      />
    </div>
  );
}
