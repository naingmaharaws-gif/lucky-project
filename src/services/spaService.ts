import { SpaRecord } from "@/types";
import { fetchCollection, saveDocument, removeDocument } from "./dataStore";

const COLLECTION = "spa_records";

export const DEFAULT_SPA: SpaRecord[] = [
  {
    id: "spa-01",
    dogId: "lucky-dog-01",
    date: "2026-04-02",
    serviceTypes: ["Full Bath", "De-shedding", "Nail Trimming"],
    salonOrGroomer: "Bubbles & Barks Grooming Salon",
    cost: 65,
    rating: 5,
    notes: "Used hypoallergenic oatmeal shampoo. Coat is super fluffy and shiny!",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7
  },
  {
    id: "spa-02",
    dogId: "lucky-dog-01",
    date: "2026-03-05",
    serviceTypes: ["Full Grooming Spa", "Ear Cleaning", "Teeth Brushing"],
    salonOrGroomer: "Pampered Pooches Studio",
    cost: 80,
    rating: 5,
    notes: "Very gentle with ears. Trimmed paw pads neatly.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 35
  },
  {
    id: "spa-03",
    dogId: "lucky-dog-01",
    date: "2026-02-01",
    serviceTypes: ["Nail Trimming", "Full Bath"],
    salonOrGroomer: "Petco Grooming Hub",
    cost: 45,
    rating: 4,
    notes: "Quick express service. Great job on nails.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 65
  }
];

export async function getSpaRecords(dogId?: string): Promise<SpaRecord[]> {
  const records = await fetchCollection<SpaRecord>(COLLECTION, dogId);
  if (records.length === 0 && (!dogId || dogId === "lucky-dog-01")) {
    for (const rec of DEFAULT_SPA) {
      await saveDocument<SpaRecord>(COLLECTION, rec.id, rec);
    }
    return DEFAULT_SPA.filter((r) => !dogId || r.dogId === dogId);
  }
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function createSpaRecord(
  data: Omit<SpaRecord, "id" | "createdAt">
): Promise<SpaRecord> {
  const id = "spa_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const newRecord: SpaRecord = {
    ...data,
    id,
    createdAt: Date.now()
  };
  await saveDocument(COLLECTION, id, newRecord);
  return newRecord;
}

export async function updateSpaRecord(
  id: string,
  data: Partial<SpaRecord>
): Promise<void> {
  const all = await fetchCollection<SpaRecord>(COLLECTION);
  const existing = all.find((r) => r.id === id);
  if (!existing) throw new Error("Spa record not found");
  await saveDocument(COLLECTION, id, { ...existing, ...data, id });
}

export async function deleteSpaRecord(id: string): Promise<void> {
  await removeDocument(COLLECTION, id);
}
