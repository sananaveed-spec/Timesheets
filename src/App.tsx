import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useCallback, useEffect, useState } from 'react';
import { getAccountEmail, isAllowedOrganizationEmail } from './auth/organization';
import { logoutCompletely } from './auth/session';
import { ReportSetup } from './components/ReportSetup';
import { HighlightReview } from './components/HighlightReview';
import { LoginPage } from './components/LoginPage';
import { UserManager } from './components/UserManager';
import { fetchClockifyDetailedRange } from './lib/clockifyApi';
import {
  alignUsersWithClockify,
  sameEmployeeName,
} from './lib/employeeCategories';
import {
  getAcceptedHighlights,
  proposeHighlights,
  type HighlightProposal,
} from './lib/highlightRules';
import { generatePdfsZip } from './lib/pdfGenerator';
import { transformToPivot } from './lib/transformer';
import {
  loadManagedUsers,
  loadMentionUsers,
  saveManagedUsers,
  saveMentionUsers,
} from './lib/userSettings';
import type {
  EmployeeCategory,
  ManagedUser,
  MentionUser,
  PivotData,
} from './types';

function AppContent() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const email = getAccountEmail(accounts[0]);
  const isAllowed = isAllowedOrganizationEmail(email);

  const [sourceLabel, setSourceLabel] = useState<string | null>(null);
  const [pivot, setPivot] = useState<PivotData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [revNumber, setRevNumber] = useState<number>(1);
  const [highlightProposals, setHighlightProposals] = useState<
    HighlightProposal[]
  >([]);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(
    () => loadManagedUsers(),
  );
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>(
    () => loadMentionUsers(),
  );

  useEffect(() => {
    setManagedUsers((currentUsers) =>
      currentUsers.length > 0 ? currentUsers : loadManagedUsers(),
    );
  }, []);

  useEffect(() => {
    saveManagedUsers(managedUsers);
  }, [managedUsers]);

  useEffect(() => {
    saveMentionUsers(mentionUsers);
  }, [mentionUsers]);

  const handleDateRangeFetch = useCallback(
    (startDate: string, endDate: string, employeeNames: string[]) => {
      setSourceLabel(null);
      setPivot(null);
      setHighlightProposals([]);
      setError(null);
      setLoading(true);

      fetchClockifyDetailedRange(startDate, endDate, employeeNames).then(
        (result) => {
          setLoading(false);
          if (result.success) {
            const nextPivot = transformToPivot(result.data);
            setPivot(nextPivot);
            setSourceLabel(result.label);
            setHighlightProposals(
              proposeHighlights(nextPivot, managedUsers, mentionUsers),
            );
          } else {
            setError(result.error);
            setSourceLabel(null);
          }
        },
      );
    },
    [managedUsers, mentionUsers],
  );

  const handleDownloadZip = useCallback(async () => {
    if (!pivot) return;
    setDownloading(true);
    try {
      const baseName =
        sourceLabel?.replace(/\s+/g, '-') || 'clockify-time-reports';
      await generatePdfsZip(
        pivot,
        `${baseName}.zip`,
        revNumber,
        managedUsers,
        getAcceptedHighlights(highlightProposals),
      );
    } finally {
      setDownloading(false);
    }
  }, [pivot, sourceLabel, revNumber, managedUsers, highlightProposals]);

  const handleLogout = useCallback(() => {
    void logoutCompletely(instance);
  }, [instance]);

  const handleAddUsers = useCallback(
    (names: string[], category: EmployeeCategory) => {
      setManagedUsers((currentUsers) => {
        const nextUsers = [...currentUsers];

        for (const name of names) {
          const trimmedName = name.trim();
          if (!trimmedName) continue;
          const existingIndex = nextUsers.findIndex((user) =>
            sameEmployeeName(user.name, trimmedName),
          );

          if (existingIndex >= 0) {
            continue;
          }

          nextUsers.push({
            id: crypto.randomUUID(),
            name: trimmedName,
            category,
          });
        }

        return nextUsers;
      });
    },
    [],
  );

  const handleUpdateUser = useCallback(
    (id: string, category: EmployeeCategory) => {
      setManagedUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === id ? { ...user, category } : user,
        ),
      );
    },
    [],
  );

  const handleSyncClockifyNames = useCallback(
    (clockifyUsers: { name: string }[]) => {
      setManagedUsers((currentUsers) =>
        alignUsersWithClockify(currentUsers, clockifyUsers),
      );
    },
    [],
  );

  const handleRemoveUsers = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setManagedUsers((currentUsers) =>
      currentUsers.filter((user) => !idSet.has(user.id)),
    );
  }, []);

  const handleAddMentions = useCallback((names: string[]) => {
    setMentionUsers((currentUsers) => {
      const nextUsers = [...currentUsers];

      for (const name of names) {
        const trimmedName = name.trim();
        if (!trimmedName) continue;
        if (nextUsers.some((user) => sameEmployeeName(user.name, trimmedName))) {
          continue;
        }
        nextUsers.push({ id: crypto.randomUUID(), name: trimmedName });
      }

      return nextUsers;
    });
  }, []);

  const handleRemoveMentions = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setMentionUsers((currentUsers) =>
      currentUsers.filter((user) => !idSet.has(user.id)),
    );
  }, []);

  // Re-propose when managed user categories or mention names change
  useEffect(() => {
    if (!pivot) return;
    setHighlightProposals((current) => {
      const next = proposeHighlights(pivot, managedUsers, mentionUsers);
      // Preserve Accept/Edit/Delete decisions where ids still match
      const prevById = new Map(current.map((p) => [p.id, p]));
      return next.map((p) => {
        const prev = prevById.get(p.id);
        if (!prev) return p;
        return {
          ...p,
          status: prev.status,
          comment: prev.status === 'accepted' ? prev.comment : p.comment,
        };
      });
    });
  }, [managedUsers, mentionUsers, pivot]);

  if (!isAuthenticated || !isAllowed) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-gray-800">
              Clockify Time Report to PDF Converter
            </h1>
            <p className="text-sm text-gray-600">
              Pull a Clockify Detailed Time Report by date range and employee,
              review proposed highlights, and download payroll PDFs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white px-4 py-2 text-sm text-gray-700 shadow-sm ring-1 ring-gray-200">
              {accounts[0]?.name ?? email}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div className="mb-6 max-w-xl">
              <ReportSetup onFetch={handleDateRangeFetch} disabled={loading} />
            </div>

            {loading && (
              <p className="mb-4 text-sm text-blue-600">
                Fetching Clockify detailed entries...
              </p>
            )}

            {error && (
              <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {pivot ? (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {sourceLabel} — {pivot.rows.length} rows ·{' '}
                    {highlightProposals.length} proposed highlights
                  </span>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    Rev No.:
                    <input
                      type="number"
                      min={1}
                      value={revNumber}
                      onChange={(event) =>
                        setRevNumber(
                          Math.max(1, parseInt(event.target.value, 10) || 1),
                        )
                      }
                      className="w-16 rounded border border-gray-300 px-2 py-1 text-gray-800"
                    />
                  </label>
                </div>

                <HighlightReview
                  key={sourceLabel ?? 'review'}
                  proposals={highlightProposals}
                  onChange={setHighlightProposals}
                  onDownload={() => {
                    void handleDownloadZip();
                  }}
                  downloading={downloading}
                />
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-sm text-gray-500">
                Select a date range, choose employees, then click Next to pull
                Clockify data and review highlights.
              </div>
            )}
          </div>

          <UserManager
            users={managedUsers}
            mentionUsers={mentionUsers}
            onAddUsers={handleAddUsers}
            onUpdateUser={handleUpdateUser}
            onSyncClockifyNames={handleSyncClockifyNames}
            onRemoveUsers={handleRemoveUsers}
            onAddMentions={handleAddMentions}
            onRemoveMentions={handleRemoveMentions}
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
