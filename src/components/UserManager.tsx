import { useMemo, useState } from 'react';
import type { EmployeeCategory, ManagedUser } from '../types';

interface UserManagerProps {
  users: ManagedUser[];
  onAddUser: (name: string, category: EmployeeCategory) => void;
  onRemoveUser: (id: string) => void;
}

const CATEGORY_LABELS: Record<EmployeeCategory, string> = {
  'full-time-salaried': 'Full-time salaried',
  'full-time-hourly': 'Full-time hourly',
  'part-time-hourly': 'Part-time hourly',
};

export function UserManager({
  users,
  onAddUser,
  onRemoveUser,
}: UserManagerProps) {
  const [name, setName] = useState('');
  const [category, setCategory] =
    useState<EmployeeCategory>('full-time-hourly');

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  );

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Manage Users</h2>
          <p className="mt-1 text-sm text-gray-600">
            Add employees and choose the category used by payroll PDF rules.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          {users.length} saved
        </span>
      </div>

      <form
        className="mt-5 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmedName = name.trim();
          if (!trimmedName) return;
          onAddUser(trimmedName, category);
          setName('');
        }}
      >
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Employee name"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500"
        />
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as EmployeeCategory)
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500"
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Add User
          </button>
        </div>
      </form>

      <div className="mt-5 space-y-2">
        {sortedUsers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 px-4 py-5 text-sm text-gray-500">
            No custom users added yet.
          </div>
        ) : (
          sortedUsers.map((user) => (
            <div
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3"
            >
              <div>
                <div className="font-medium text-gray-900">
                  {user.name} - {CATEGORY_LABELS[user.category]}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveUser(user.id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
