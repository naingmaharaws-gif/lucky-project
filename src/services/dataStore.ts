import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  where,
  getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Local storage key prefix
const STORAGE_PREFIX = "lucky_activity_";

function getLocalData<T>(collectionName: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + collectionName);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Error reading localStorage:", err);
    return [];
  }
}

function setLocalData<T>(collectionName: string, data: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + collectionName, JSON.stringify(data));
  } catch (err) {
    console.error("Error writing localStorage:", err);
  }
}

export async function fetchCollection<T extends { id: string }>(
  collectionName: string,
  filterDogId?: string
): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    let q = query(colRef);
    if (filterDogId) {
      q = query(colRef, where("dogId", "==", filterDogId));
    }
    const snap = await getDocs(q);
    const items: T[] = [];
    snap.forEach((d) => {
      items.push({ id: d.id, ...(d.data() as any) });
    });

    if (items.length > 0) {
      // Sync local storage cache
      setLocalData(collectionName, items);
      return items;
    }
  } catch (err) {
    console.warn(`Firestore read failed for [${collectionName}], falling back to local storage:`, err);
  }

  // Fallback to local storage
  const local = getLocalData<T>(collectionName);
  if (filterDogId) {
    return local.filter((item: any) => item.dogId === filterDogId);
  }
  return local;
}

export async function saveDocument<T extends { id: string }>(
  collectionName: string,
  id: string,
  data: T
): Promise<void> {
  // Update local storage first
  const current = getLocalData<T>(collectionName);
  const index = current.findIndex((item) => item.id === id);
  if (index >= 0) {
    current[index] = data;
  } else {
    current.unshift(data);
  }
  setLocalData(collectionName, current);

  // Sync with Firestore
  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    console.warn(`Firestore write failed for [${collectionName}/${id}], kept in local cache:`, err);
  }
}

export async function removeDocument<T extends { id: string }>(
  collectionName: string,
  id: string
): Promise<void> {
  // Remove from local storage
  const current = getLocalData<T>(collectionName);
  const updated = current.filter((item) => item.id !== id);
  setLocalData(collectionName, updated);

  // Remove from Firestore
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`Firestore delete failed for [${collectionName}/${id}]:`, err);
  }
}
