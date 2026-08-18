import type { EmployeeCategory, ManagedUser } from '../types';

export const DEFAULT_FULL_TIME_SALARIED = [
  'Joe Prevendar',
  'Abdur Rehman',
  'Eric Pieper',
  'Chandler Hubbard',
  'Aatir Siddiqui',
  'Zulfi Aijaz',
  'Aamir Ali',
  'Muhammad Shaharyar',
] as const;

export const DEFAULT_FULL_TIME_HOURLY = [
  'Justin Ray',
  'Kathy',
  'William Bill Dearsan',
  'Ian Obermann',
  'jose.bravo',
  'Joni Pieper',
  'joshua.pieper',
] as const;

export const DEFAULT_PART_TIME_HOURLY = [
  'Aaron Nevarez',
  'Ashraf Alkiesoum',
  'Gary Bettencourt',
  'Han Luu',
  'Julian Sanchez',
  'mee.vang',
  'Tyler Smith',
  'julian.diaz',
  'luke.contreras',
] as const;

export function normalizeEmployeeName(employeeName: string): string {
  return employeeName.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

export function sameEmployeeName(a: string, b: string): boolean {
  return (
    normalizeEmployeeName(a).toLowerCase() ===
    normalizeEmployeeName(b).toLowerCase()
  );
}

function defaultUserId(name: string): string {
  return `default:${normalizeEmployeeName(name).toLowerCase()}`;
}

export function createDefaultManagedUsers(): ManagedUser[] {
  const users: ManagedUser[] = [
    ...DEFAULT_FULL_TIME_SALARIED.map((name) => ({
      id: defaultUserId(name),
      name,
      category: 'full-time-salaried' as EmployeeCategory,
    })),
    ...DEFAULT_FULL_TIME_HOURLY.map((name) => ({
      id: defaultUserId(name),
      name,
      category: 'full-time-hourly' as EmployeeCategory,
    })),
    ...DEFAULT_PART_TIME_HOURLY.map((name) => ({
      id: defaultUserId(name),
      name,
      category: 'part-time-hourly' as EmployeeCategory,
    })),
  ];

  return users;
}

export function mergeDefaultManagedUsers(
  existingUsers: ManagedUser[],
): ManagedUser[] {
  const merged = [...existingUsers];

  for (const defaultUser of createDefaultManagedUsers()) {
    const alreadyPresent = merged.some((user) =>
      sameEmployeeName(user.name, defaultUser.name),
    );
    if (!alreadyPresent) merged.push(defaultUser);
  }

  return merged;
}

export function alignUsersWithClockify(
  users: ManagedUser[],
  clockifyUsers: Array<{ name: string }>,
): ManagedUser[] {
  let changed = false;
  const nextUsers = users.map((user) => {
    const match = clockifyUsers.find((employee) =>
      sameEmployeeName(employee.name, user.name),
    );
    if (!match || match.name === user.name) return user;
    changed = true;
    return { ...user, name: match.name };
  });
  return changed ? nextUsers : users;
}
