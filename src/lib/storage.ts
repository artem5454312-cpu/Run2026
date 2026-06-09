import type { ProgressByProfile, UserProfile } from '../types';

const PROFILES_KEY = 'kawaii-run-tracker:profiles:v1';
const SESSION_KEY = 'kawaii-run-tracker:session:v1';
const PROGRESS_KEY = 'kawaii-run-tracker:progress:v1';

const safeParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const storage = {
  getProfiles(): UserProfile[] {
    return safeParse<UserProfile[]>(localStorage.getItem(PROFILES_KEY), []);
  },
  setProfiles(profiles: UserProfile[]) {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  },
  getSession(): string | null {
    return localStorage.getItem(SESSION_KEY);
  },
  setSession(profileId: string) {
    localStorage.setItem(SESSION_KEY, profileId);
  },
  clearSession() {
    localStorage.removeItem(SESSION_KEY);
  },
  getProgress(): ProgressByProfile {
    return safeParse<ProgressByProfile>(localStorage.getItem(PROGRESS_KEY), {});
  },
  setProgress(progress: ProgressByProfile) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }
};

export const createProfile = (name: string, pin: string): UserProfile => ({
  id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: name.trim(),
  pin,
  createdAt: new Date().toISOString()
});
