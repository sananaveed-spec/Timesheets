import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useCallback, useEffect, useState } from 'react';
import { getAccountEmail, isAllowedOrganizationEmail } from './auth/organization';
import { logoutCompletely } from './auth/session';
import { FileUpload } from './components/FileUpload';
import { HighlightReview } from './components/HighlightReview';
import { LoginPage } from './components/LoginPage';
import { UserManager } from './components/UserManager';
import { parseClockifyCsv } from './lib/csvParser';
import {
  getAcceptedHighlights,
  proposeHighlights,
  type HighlightProposal,
} from './lib/highlightRules';
import { generatePdfsZip } from './lib/pdfGenerator';
import { transformToPivot } from './lib/transformer';
import { loadManagedUsers, saveManagedUsers } from './lib/userSettings';
import type { EmployeeCategory, ManagedUser, PivotData } from './types';

function AppContent() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const email = getAccountEmail(accounts[0]);
  const isAllowed = isAllowedOrganizationEmail(email);

  const [file, setFile] = useState<File | null>(null);
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

  useEffect(() => {
    saveManagedUsers(managedUsers);
  }, [managedUsers]);

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      setFile(selectedFile);
      setPivot(null);
      setHighlightProposals([]);
      setError(null);
      setLoading(true);

      parseClockifyCsv(selectedFile).then((result) => {
        setLoading(false);
        if (result.success) {
          const nextPivot = transformToPivot(result.data);
          setPivot(nextPivot);
          setHighlightProposals(proposeHighlights(nextPivot, managedUsers));
        } else {
          setError(result.error);
          setFile(null);
        }
      });
    },
    [managedUsers],
  );

  const handleDownloadZip = useCallback(async () => {
    if (!pivot) return;
    setDownloading(true);
    try {
      const baseName = file?.name?.replace(/\.csv$/i, '') || 'time-reports';
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
  }, [pivot, file, revNumber, managedUsers, highlightProposals]);

  const handleLogout = useCallback(() => {
    void logoutCompletely(instance);
  }, [instance]);

  const handleAddUser = useCallback(
    (name: string, category: EmployeeCategory) => {
      setManagedUsers((currentUsers) => {
        const normalizedName = name.trim().toLowerCase();
        const existingUser = currentUsers.find(
          (user) => user.name.trim().toLowerCase() === normalizedName,
        );

        if (existingUser) {
          return currentUsers.map((user) =>
            user.id === existingUser.id ? { ...user, name, category } : user,
          );
        }

        return [...currentUsers, { id: crypto.randomUUID(), name, category }];
      });
    },
    [],
  );

  const handleRemoveUser = useCallback((id: string) => {
    setManagedUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== id),
    );
  }, []);

  // Re-propose when managed user categories change after a CSV is loaded
  useEffect(() => {
    if (!pivot) return;
    setHighlightProposals((current) => {
      const next = proposeHighlights(pivot, managedUsers);
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
  }, [managedUsers, pivot]);

  if (!isAuthenticated || !isAllowed) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-gray-800">
              Clockify Time Report CSV to PDF Converter
            </h1>
            <p className="text-sm text-gray-600">
              Upload a Clockify Detailed Time Report CSV file, review proposed
              highlights, and download payroll PDFs for each employee.
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
              <FileUpload onFileSelect={handleFileSelect} disabled={loading} />
            </div>

            {loading && (
              <p className="mb-4 text-sm text-blue-600">Processing CSV...</p>
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
                    {file?.name} — {pivot.rows.length} rows ·{' '}
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
                  key={file?.name ?? 'review'}
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
                Upload a Clockify CSV to review highlights and generate PDFs.
              </div>
            )}
          </div>

          <UserManager
            users={managedUsers}
            onAddUser={handleAddUser}
            onRemoveUser={handleRemoveUser}
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
