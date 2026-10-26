export interface DogProfile {
  id: string;
  name: string;
  species: string; // default: "Dog"
  breed?: string;
  dob: string; // YYYY-MM-DD
  color: string;
  imageUrl?: string;
  weight?: number; // in kg
  microchipNo?: string;
  notes?: string;
  createdAt: number;
}

export type MedicalType = 
  | 'Vaccination' 
  | 'Vet Visit' 
  | 'Medication' 
  | 'Surgery' 
  | 'Dental' 
  | 'Deworming' 
  | 'Checkup'
  | 'Other';

export interface MedicalRecord {
  id: string;
  dogId: string;
  date: string; // YYYY-MM-DD
  type: MedicalType;
  title: string;
  clinicOrDoctor: string;
  diagnosis?: string;
  treatment?: string;
  cost?: number;
  nextDueDate?: string; // Follow-up / booster reminder
  notes?: string;
  createdAt: number;
}

export type SpaServiceType = 
  | 'Full Bath' 
  | 'Haircut / Styling' 
  | 'Nail Trimming' 
  | 'Ear Cleaning' 
  | 'Teeth Brushing' 
  | 'De-shedding' 
  | 'Full Grooming Spa';

export interface SpaRecord {
  id: string;
  dogId: string;
  date: string; // YYYY-MM-DD
  serviceTypes: SpaServiceType[];
  salonOrGroomer: string;
  cost: number;
  rating: number; // 1 to 5
  notes?: string;
  createdAt: number;
}

export type ExpenseCategory = 
  | 'Food & Treats' 
  | 'Medical & Vet' 
  | 'Spa & Grooming' 
  | 'Toys & Gear' 
  | 'Training' 
  | 'Insurance' 
  | 'Other';

export interface ExpenseRecord {
  id: string;
  dogId: string;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  amount: number;
  paymentMethod?: 'Cash' | 'Card' | 'Digital Wallet' | 'Other';
  vendor?: string;
  notes?: string;
  createdAt: number;
}

export type ActivityType = 
  | 'Walk' 
  | 'Meal' 
  | 'Potty' 
  | 'Playtime' 
  | 'Training' 
  | 'Medication' 
  | 'Sleep / Rest';

export interface DailyActivity {
  id: string;
  dogId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  activityType: ActivityType;
  durationMinutes?: number;
  details?: string;
  createdAt: number;
}
