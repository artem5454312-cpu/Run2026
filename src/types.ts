export type ViewName = 'home' | 'plan' | 'profiles' | 'admin';

export type UserProfile = {
  id: string;
  name: string;
  pin: string;
  createdAt: string;
};

export type WorkoutEntry = {
  completed: boolean;
  distanceKm?: number;
  durationMinutes?: number;
  note?: string;
  updatedAt: string;
};

export type ProgressByProfile = Record<string, Record<string, WorkoutEntry>>;

export type TrainingDay = {
  id: string;
  weekday: string;
  title: string;
  subtitle?: string;
  tasks: string[];
  important?: boolean;
  raceDay?: boolean;
  runDay?: boolean;
  defaultCompleted?: boolean;
};

export type TrainingWeek = {
  id: string;
  label: string;
  description: string;
  days: TrainingDay[];
};
