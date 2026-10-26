"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useDogContext } from "@/context/DogContext";
import { ExpenseRecord, ExpenseCategory } from "@/types";
import { getExpenses, deleteExpense } from "@/services/expenseService";
import ExpenseFormModal from "./ExpenseFormModal";
import DeleteConfirmModal from "../common/DeleteConfirmModal";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  DollarSign,
  Plus,
  Search,
  TrendingUp,
  CreditCard,
  Tag,
  Edit2,
  Trash2,
  PieChart as PieIcon,
  BarChart3
} from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Treats": "#10B981",    // emerald
  "Medical & Vet": "#F43F5E",    // rose
  "Spa & Grooming": "#8B5CF6",   // purple
  "Toys & Gear": "#F59E0B",      // amber
  "Training": "#3B82F6",         // blue
  "Insurance": "#06B6D4",        // cyan
  "Other": "#64748B"             // slate
};

export default function ExpenseChartView() {
  const { dogs, activeDogId } = useDogContext();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<ExpenseRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<ExpenseRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExpenseData = async () => {
    try {
      setLoading(true);
      const data = await getExpenses(activeDogId === "all" ? undefined : activeDogId);
      setExpenses(data);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseData();
  }, [activeDogId]);

  // Aggregate Category Distribution for Donut Chart
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: CATEGORY_COLORS[name] || "#94A3B8"
    }));
  }, [expenses]);

  // Aggregate Monthly Trends for Bar Chart (last 6 months)
  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      // YYYY-MM
      const monthKey = e.date.substring(0, 7);
      map[monthKey] = (map[monthKey] || 0) + e.amount;
    });

    // Sort chronologically
    return Object.keys(map)
      .sort()
      .map((key) => {
        const [year, month] = key.split("-");
        const monthName = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString(
          "en-US",
          { month: "short", year: "2-digit" }
        );
        return {
          month: monthName,
          amount: Math.round(map[key] * 100) / 100
        };
      });
  }, [expenses]);

  // Summary Metrics
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const topCategory = useMemo(() => {
    if (categoryData.length === 0) return "N/A";
    const sorted = [...categoryData].sort((a, b) => b.value - a.value);
    return `${sorted[0].name} (${formatCurrency(sorted[0].value)})`;
  }, [categoryData]);

  // Filtered Expense Records for Table
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        e.category.toLowerCase().includes(search.toLowerCase()) ||
        (e.vendor && e.vendor.toLowerCase().includes(search.toLowerCase())) ||
        (e.notes && e.notes.toLowerCase().includes(search.toLowerCase()));

      const matchCategory = categoryFilter === "all" || e.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [expenses, search, categoryFilter]);

  const handleOpenAdd = () => {
    setRecordToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: ExpenseRecord) => {
    setRecordToEdit(rec);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    try {
      setIsDeleting(true);
      await deleteExpense(recordToDelete.id);
      await fetchExpenseData();
      setRecordToDelete(null);
    } catch (err) {
      console.error("Failed to delete expense:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-6 rounded-3xl border border-emerald-200/50 dark:border-emerald-900/30">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Expense Tracking</span>
            <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
              Chart View
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Analyze canine expenditures, monthly spending trends, and breakdown by care category.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-emerald-600/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Total Dog Expenses</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-white">
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Total Entries</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-white">
              {expenses.length} Records
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Tag className="w-6 h-6" />
          </div>
          <div className="truncate">
            <p className="text-xs text-zinc-500 font-medium">Top Category</p>
            <p className="text-base font-bold text-zinc-900 dark:text-white truncate">
              {topCategory}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spend Bar Chart */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Monthly Spending Trend ($)</span>
            </h3>
          </div>

          <div className="h-64 w-full">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: any) => [`$${value}`, "Amount"]}
                    contentStyle={{
                      backgroundColor: "rgba(24, 24, 27, 0.9)",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                  />
                  <Bar dataKey="amount" fill="#10B981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                No expense data for monthly chart
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              <span>Category Distribution</span>
            </h3>
          </div>

          <div className="h-64 w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`$${value}`, "Spent"]}
                    contentStyle={{
                      backgroundColor: "rgba(24, 24, 27, 0.9)",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-zinc-600 dark:text-zinc-400">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                No expense data for category chart
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter & Expense Transactions Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search vendor, category, or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                categoryFilter === "all"
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
              }`}
            >
              All Categories
            </button>
            {Object.keys(CATEGORY_COLORS).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  categoryFilter === cat
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Expense List Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Dog</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Vendor</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Notes</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((e) => {
                    const dog = dogs.find((d) => d.id === e.dogId);
                    return (
                      <tr key={e.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                        <td className="px-5 py-4 whitespace-nowrap font-medium text-zinc-900 dark:text-white">
                          {formatDate(e.date)}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-300">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold">
                            🐶 {dog?.name || "Dog"}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                            style={{
                              backgroundColor: `${CATEGORY_COLORS[e.category] || "#64748B"}20`,
                              color: CATEGORY_COLORS[e.category] || "#64748B"
                            }}
                          >
                            {e.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-medium text-zinc-800 dark:text-zinc-200">
                          {e.vendor || "—"}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-xs text-zinc-500">
                          {e.paymentMethod || "Card"}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-bold text-zinc-900 dark:text-white">
                          {formatCurrency(e.amount)}
                        </td>
                        <td className="px-5 py-4 text-xs text-zinc-500 max-w-xs truncate" title={e.notes}>
                          {e.notes || "—"}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(e)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setRecordToDelete(e)}
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
                      <DollarSign className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-semibold">No expense records found</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Add pet food, medical bills, spa grooming, and toys to see charts populate.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal CRUD */}
      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recordToEdit={recordToEdit}
        onSuccess={fetchExpenseData}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Delete Expense"
        message={`Delete expense of ${formatCurrency(recordToDelete?.amount || 0)} (${recordToDelete?.category})?`}
      />
    </div>
  );
}
