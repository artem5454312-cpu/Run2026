import { TARGET_RACE_DATE, trainingPlan } from '../data/trainingPlan';
import type { TrainingDay, WorkoutEntry } from '../types';

export const getAllDays = (): TrainingDay[] => trainingPlan.flatMap((week) => week.days);

export const parseDurationToMinutes = (raw: string): number | undefined => {
  const value = raw.trim().replace(',', '.');
  if (!value) return undefined;

  if (value.includes(':')) {
    const parts = value.split(':').map((part) => Number(part));
    if (parts.some((part) => Number.isNaN(part))) return undefined;
    if (parts.length === 2) {
      const [minutes, seconds] = parts;
      return minutes + seconds / 60;
    }
    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      return hours * 60 + minutes + seconds / 60;
    }
    return undefined;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
};

export const formatDuration = (minutes?: number): string => {
  if (!minutes) return '';
  const fullMinutes = Math.floor(minutes);
  const seconds = Math.round((minutes - fullMinutes) * 60);
  return `${fullMinutes}:${seconds.toString().padStart(2, '0')}`;
};

export const formatPace = (pace?: number): string => {
  if (!pace || !Number.isFinite(pace)) return '—';
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}/км`;
};

export const getPace = (entry?: WorkoutEntry): number | undefined => {
  if (!entry?.durationMinutes || !entry.distanceKm || entry.distanceKm <= 0) return undefined;
  return entry.durationMinutes / entry.distanceKm;
};

export const getDaysLeft = (): number => {
  const now = new Date();
  const target = new Date(TARGET_RACE_DATE);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / 86_400_000));
};

export const getProgressStats = (entries: Record<string, WorkoutEntry>) => {
  const allDays = getAllDays();
  const completed = allDays.filter((day) => entries[day.id]?.completed ?? day.defaultCompleted).length;
  const runPaces = allDays
    .map((day) => ({ dayId: day.id, pace: getPace(entries[day.id]) }))
    .filter((item): item is { dayId: string; pace: number } => typeof item.pace === 'number');

  const averagePace = runPaces.length
    ? runPaces.reduce((sum, item) => sum + item.pace, 0) / runPaces.length
    : undefined;

  const firstPace = runPaces[0]?.pace;
  const lastPace = runPaces[runPaces.length - 1]?.pace;
  const trend = firstPace && lastPace ? firstPace - lastPace : undefined;

  return {
    completed,
    total: allDays.length,
    averagePace,
    paceSeries: runPaces.map((item) => item.pace),
    trend
  };
};
