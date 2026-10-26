import { DailyActivity, ActivityType } from "@/types";
import { fetchCollection, saveDocument, removeDocument } from "./dataStore";

const COLLECTION = "daily_activities";

export const DEFAULT_ACTIVITIES: DailyActivity[] = [
  {
    id: "act-01",
    dogId: "lucky-dog-01",
    date: new Date().toISOString().split("T")[0],
    time: "08:00",
    activityType: "Meal",
    durationMinutes: 10,
    details: "1.5 cups salmon dry kibble + bone broth topper",
    createdAt: Date.now() - 1000 * 60 * 60 * 4
  },
  {
    id: "act-02",
    dogId: "lucky-dog-01",
    date: new Date().toISOString().split("T")[0],
    time: "08:30",
    activityType: "Walk",
    durationMinutes: 35,
    details: "Morning stroll in the park, played fetch with tennis ball",
    createdAt: Date.now() - 1000 * 60 * 60 * 3
  },
  {
    id: "act-03",
    dogId: "lucky-dog-01",
    date: new Date().toISOString().split("T")[0],
    time: "09:15",
    activityType: "Potty",
    durationMinutes: 5,
    details: "Normal routine pee & poop",
    createdAt: Date.now() - 1000 * 60 * 60 * 2
  },
  {
    id: "act-04",
    dogId: "lucky-dog-01",
    date: new Date().toISOString().split("T")[0],
    time: "12:00",
    activityType: "Playtime",
    durationMinutes: 20,
    details: "Tug-of-war in the backyard with favorite rope toy",
    createdAt: Date.now() - 1000 * 60 * 30
  }
];

export async function getDailyActivities(dogId?: string, date?: string): Promise<DailyActivity[]> {
  const records = await fetchCollection<DailyActivity>(COLLECTION, dogId);
  if (records.length === 0 && (!dogId || dogId === "lucky-dog-01")) {
    for (const rec of DEFAULT_ACTIVITIES) {
      await saveDocument<DailyActivity>(COLLECTION, rec.id, rec);
    }
    return DEFAULT_ACTIVITIES.filter((r) => {
      if (dogId && r.dogId !== dogId) return false;
      if (date && r.date !== date) return false;
      return true;
    });
  }
  
  return records
    .filter((r) => {
      if (dogId && r.dogId !== dogId) return false;
      if (date && r.date !== date) return false;
      return true;
    })
    .sort((a, b) => {
      // Sort newest date & time first
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.time.localeCompare(a.time);
    });
}

export async function createDailyActivity(
  data: Omit<DailyActivity, "id" | "createdAt">
): Promise<DailyActivity> {
  const id = "act_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const newActivity: DailyActivity = {
    ...data,
    id,
    createdAt: Date.now()
  };
  await saveDocument(COLLECTION, id, newActivity);
  return newActivity;
}

export async function updateDailyActivity(
  id: string,
  data: Partial<DailyActivity>
): Promise<void> {
  const all = await fetchCollection<DailyActivity>(COLLECTION);
  const existing = all.find((r) => r.id === id);
  if (!existing) throw new Error("Activity not found");
  await saveDocument(COLLECTION, id, { ...existing, ...data, id });
}

export async function deleteDailyActivity(id: string): Promise<void> {
  await removeDocument(COLLECTION, id);
}
