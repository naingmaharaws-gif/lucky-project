import { ExpenseRecord, ExpenseCategory } from "@/types";
import { fetchCollection, saveDocument, removeDocument } from "./dataStore";

const COLLECTION = "expense_records";

export const DEFAULT_EXPENSES: ExpenseRecord[] = [
  {
    id: "exp-01",
    dogId: "lucky-dog-01",
    date: "2026-04-02",
    category: "Spa & Grooming",
    amount: 65,
    paymentMethod: "Card",
    vendor: "Bubbles & Barks",
    notes: "Spring grooming and bath",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7
  },
  {
    id: "exp-02",
    dogId: "lucky-dog-01",
    date: "2026-03-25",
    category: "Food & Treats",
    amount: 72,
    paymentMethod: "Card",
    vendor: "Chewy.com",
    notes: "Salmon & Sweet Potato Dry Kibble (30 lbs)",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14
  },
  {
    id: "exp-03",
    dogId: "lucky-dog-01",
    date: "2026-03-15",
    category: "Medical & Vet",
    amount: 85,
    paymentMethod: "Card",
    vendor: "Happy Paws Vet",
    notes: "Annual vaccine booster shots",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20
  },
  {
    id: "exp-04",
    dogId: "lucky-dog-01",
    date: "2026-02-28",
    category: "Food & Treats",
    amount: 68,
    paymentMethod: "Card",
    vendor: "PetSmart",
    notes: "Kibble & dental chews",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 40
  },
  {
    id: "exp-05",
    dogId: "lucky-dog-01",
    date: "2026-02-14",
    category: "Toys & Gear",
    amount: 35,
    paymentMethod: "Digital Wallet",
    vendor: "Amazon",
    notes: "Tough chew rope and squeaky duck toy",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 50
  },
  {
    id: "exp-06",
    dogId: "lucky-dog-01",
    date: "2026-01-18",
    category: "Training",
    amount: 110,
    paymentMethod: "Card",
    vendor: "Canine Academy",
    notes: "Agility & recall session",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 80
  }
];

export async function getExpenses(dogId?: string): Promise<ExpenseRecord[]> {
  const records = await fetchCollection<ExpenseRecord>(COLLECTION, dogId);
  if (records.length === 0 && (!dogId || dogId === "lucky-dog-01")) {
    for (const rec of DEFAULT_EXPENSES) {
      await saveDocument<ExpenseRecord>(COLLECTION, rec.id, rec);
    }
    return DEFAULT_EXPENSES.filter((r) => !dogId || r.dogId === dogId);
  }
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function createExpense(
  data: Omit<ExpenseRecord, "id" | "createdAt">
): Promise<ExpenseRecord> {
  const id = "exp_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const newRecord: ExpenseRecord = {
    ...data,
    id,
    createdAt: Date.now()
  };
  await saveDocument(COLLECTION, id, newRecord);
  return newRecord;
}

export async function updateExpense(
  id: string,
  data: Partial<ExpenseRecord>
): Promise<void> {
  const all = await fetchCollection<ExpenseRecord>(COLLECTION);
  const existing = all.find((r) => r.id === id);
  if (!existing) throw new Error("Expense not found");
  await saveDocument(COLLECTION, id, { ...existing, ...data, id });
}

export async function deleteExpense(id: string): Promise<void> {
  await removeDocument(COLLECTION, id);
}
