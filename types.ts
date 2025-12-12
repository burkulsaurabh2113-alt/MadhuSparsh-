
export type Language = 'en' | 'mr' | 'hi' | 'gu' | 'pa';

export enum Section {
  HOME = 'HOME',
  DIABETIC_DIET = 'DIABETIC_DIET',
  PRE_DIABETIC_DIET = 'PRE_DIABETIC_DIET',
  GDM_DIET = 'GDM_DIET',
  PATIENT_DATA = 'PATIENT_DATA',
  EXERCISE = 'EXERCISE',
  DAILY_NUTRIENTS = 'DAILY_NUTRIENTS',
  PEDIATRIC_DIET = 'PEDIATRIC_DIET'
}

export type Hba1cLevel = '6.5-7' | '7-8.5' | '8.5-10' | '>10';
export type DietType = 'Veg' | 'NonVeg';
export type ExerciseType = 'None' | '30minCardio';
export type Trimester = '1' | '2' | '3' | '1_OVERT';

// Pediatric Types
export type PediatricAgeGroup = '0-6m' | '6-12m' | '1-3y' | '4-6y' | '7-9y';
export type InfantSubGroup = '6-8m' | '9-12m';
export type Gender = 'Boy' | 'Girl';

// Macro Calculator Types
export type ActivityLevel = 'Sedentary' | 'Moderate' | 'Active';

export interface DailyMeal {
  Breakfast: string;
  Lunch: string;
  Dinner: string;
  MidMorning?: string; // Added for kids/frequent meals
  EveningSnack?: string;
}

export interface WeeklyPlan {
  Sunday: DailyMeal;
  Monday: DailyMeal;
  Tuesday: DailyMeal;
  Wednesday: DailyMeal;
  Thursday: DailyMeal;
  Friday: DailyMeal;
  Saturday: DailyMeal;
}

export interface DietChart {
  title: string;
  macros: string;
  summary?: string;
  weekly: WeeklyPlan;
  guidelines?: string[]; // Added for specific text guidelines
}

export interface Patient {
  id: string;
  name: string;
  age: string;
  weight: string;
  history: string; // Known Case Of / History
  diagnosis: string;
  bloodGlucose: {
    rbs: string;
    pp: string;
    hba1c: string;
    date: string;
  };
  medication: {
    old: string;
    new: string;
    dosage: string; // Keep for general notes if needed
  };
  followUpDate: string;
  dateAdded: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
