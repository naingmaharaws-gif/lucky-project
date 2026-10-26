import { DogProfile } from "@/types";
import { fetchCollection, saveDocument, removeDocument } from "./dataStore";

const COLLECTION = "dogs";

export const DEFAULT_DOGS: DogProfile[] = [
  {
    id: "lucky-dog-01",
    name: "Lucky",
    species: "Dog",
    breed: "Golden Retriever",
    dob: "2023-04-12",
    color: "Golden Cream",
    imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80",
    weight: 28.5,
    microchipNo: "985141002345678",
    notes: "Loves tennis balls, swimming, and peanut butter treats. Mild grass pollen allergy in spring.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30
  },
  {
    id: "milo-dog-02",
    name: "Milo",
    species: "Dog",
    breed: "French Bulldog",
    dob: "2024-01-20",
    color: "Fawn & White",
    imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
    weight: 12.0,
    microchipNo: "985141009876543",
    notes: "Very energetic cuddler. Prefers short walks during hot weather.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15
  }
];

export async function getDogs(): Promise<DogProfile[]> {
  const dogs = await fetchCollection<DogProfile>(COLLECTION);
  if (dogs.length === 0) {
    // Seed default dogs if none exist
    for (const d of DEFAULT_DOGS) {
      await saveDocument<DogProfile>(COLLECTION, d.id, d);
    }
    return DEFAULT_DOGS;
  }
  return dogs.sort((a, b) => b.createdAt - a.createdAt);
}

export async function createDog(data: Omit<DogProfile, "id" | "createdAt">): Promise<DogProfile> {
  const id = "dog_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const newDog: DogProfile = {
    ...data,
    id,
    createdAt: Date.now()
  };
  await saveDocument(COLLECTION, id, newDog);
  return newDog;
}

export async function updateDog(id: string, data: Partial<DogProfile>): Promise<void> {
  const dogs = await getDogs();
  const existing = dogs.find((d) => d.id === id);
  if (!existing) throw new Error("Dog not found");
  const updated: DogProfile = {
    ...existing,
    ...data,
    id
  };
  await saveDocument(COLLECTION, id, updated);
}

export async function deleteDog(id: string): Promise<void> {
  await removeDocument(COLLECTION, id);
}
