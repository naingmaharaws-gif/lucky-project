"use client";

import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { ExpenseRecord, ExpenseCategory } from "@/types";
import { useDogContext } from "@/context/DogContext";
import { createExpense, updateExpense } from "@/services/expenseService";
import { Loader2 } from "lucide-react";

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit: ExpenseRecord | null;
  onSuccess: () => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food & Treats",
  "Medical & Vet",
  "Spa & Grooming",
  "Toys & Gear",
  "Training",
  "Insurance",
  "Other"
];

export default function ExpenseFormModal({
  isOpen,
  onClose,
  recordToEdit,
  onSuccess
}: ExpenseFormModalProps) {
  const { dogs, activeDogId } = useDogContext();

  const [dogId, setDogId] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Food & Treats");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Card" | "Cash" | "Digital Wallet" | "Other">("Card");
  const [vendor, setVendor] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (recordToEdit) {
      setDogId(recordToEdit.dogId);
      setDate(recordToEdit.date);
      setCategory(recordToEdit.category);
      setAmount(recordToEdit.amount.toString());
      setPaymentMethod(recordToEdit.paymentMethod || "Card");
      setVendor(recordToEdit.vendor || "");
      setNotes(recordToEdit.notes || "");
    } else {
      setDogId(activeDogId !== "all" ? activeDogId : dogs[0]?.id || "");
      setDate(new Date().toISOString().split("T")[0]);
      setCategory("Food & Treats");
      setAmount("");
      setPaymentMethod("Card");
      setVendor("");
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
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setErrorMsg("Please enter a valid expense amount.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const payload = {
        dogId,
        date,
        category,
        amount: parseFloat(amount),
        paymentMethod,
        vendor: vendor.trim() || undefined,
        notes: notes.trim() || undefined
      };

      if (recordToEdit) {
        await updateExpense(recordToEdit.id, payload);
      } else {
        await createExpense(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving expense:", err);
      setErrorMsg(err.message || "Failed to save expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recordToEdit ? "Edit Expense" : "Record Pet Expense"}
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
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Amount ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 45.00"
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
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
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="Card">Credit / Debit Card</option>
              <option value="Cash">Cash</option>
              <option value="Digital Wallet">Digital Wallet (Apple Pay / GPay)</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Vendor / Merchant
            </label>
            <input
              type="text"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="e.g. Chewy, Petco, Amazon"
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Monthly dry food 30lb bag, flea preventatives..."
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
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md transition"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : recordToEdit ? (
              "Update Expense"
            ) : (
              "Save Expense"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
