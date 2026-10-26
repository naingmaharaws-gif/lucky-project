import { MedicalRecord } from "@/types";
import { fetchCollection, saveDocument, removeDocument } from "./dataStore";

const COLLECTION = "medical_records";

export const DEFAULT_MEDICAL: MedicalRecord[] = [
  {
    id: "med-01",
    dogId: "lucky-dog-01",
    date: "2026-03-15",
    type: "Vaccination",
    title: "Annual DHPP & Rabies Booster",
    clinicOrDoctor: "Happy Paws Veterinary Clinic",
    diagnosis: "Healthy condition, no adverse reactions.",
    treatment: "Administered Rabies 3-Yr Booster and DHPP.",
    cost: 85,
    nextDueDate: "2027-03-15",
    notes: "Given liver treat after shot. Very brave boy!",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20
  },
  {
    id: "med-02",
    dogId: "lucky-dog-01",
    date: "2026-02-10",
    type: "Checkup",
    title: "Routine Dental & Weight Evaluation",
    clinicOrDoctor: "Dr. Sarah Adams",
    diagnosis: "Minor plaque on upper molars.",
    treatment: "Recommended daily dental chew and enzymic toothpaste.",
    cost: 50,
    nextDueDate: "2026-08-10",
    notes: "Weight stable at 28.5 kg.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45
  }
];

export async function getMedicalRecords(dogId?: string): Promise<MedicalRecord[]> {
  const records = await fetchCollection<MedicalRecord>(COLLECTION, dogId);
  if (records.length === 0 && (!dogId || dogId === "lucky-dog-01")) {
    for (const rec of DEFAULT_MEDICAL) {
      await saveDocument<MedicalRecord>(COLLECTION, rec.id, rec);
    }
    return DEFAULT_MEDICAL.filter((r) => !dogId || r.dogId === dogId);
  }
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function createMedicalRecord(
  data: Omit<MedicalRecord, "id" | "createdAt">
): Promise<MedicalRecord> {
  const id = "med_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const newRecord: MedicalRecord = {
    ...data,
    id,
    createdAt: Date.now()
  };
  await saveDocument(COLLECTION, id, newRecord);
  return newRecord;
}

export async function updateMedicalRecord(
  id: string,
  data: Partial<MedicalRecord>
): Promise<void> {
  const all = await fetchCollection<MedicalRecord>(COLLECTION);
  const existing = all.find((r) => r.id === id);
  if (!existing) throw new Error("Record not found");
  await saveDocument(COLLECTION, id, { ...existing, ...data, id });
}

export async function deleteMedicalRecord(id: string): Promise<void> {
  await removeDocument(COLLECTION, id);
}
