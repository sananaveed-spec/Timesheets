import type { ManagedUser, MentionUser } from '../types';
import { mergeDefaultManagedUsers } from './employeeCategories';

const STORAGE_KEY = 'clockify-converter-managed-users';
const MENTION_STORAGE_KEY = 'clockify-converter-mention-users';

function readStoredList<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadManagedUsers(): ManagedUser[] {
  const stored = readStoredList<ManagedUser>(STORAGE_KEY).filter(
    (user) =>
      typeof user?.id === 'string' &&
      typeof user?.name === 'string' &&
      typeof user?.category === 'string',
  );

  if (stored.length > 0) return stored;
  return mergeDefaultManagedUsers([]);
}

export function saveManagedUsers(users: ManagedUser[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function loadMentionUsers(): MentionUser[] {
  return readStoredList<MentionUser>(MENTION_STORAGE_KEY);
}

export function saveMentionUsers(users: MentionUser[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MENTION_STORAGE_KEY, JSON.stringify(users));
}
