import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Upload, RotateCcw, Trash2 } from "lucide-react";
import { TEST_IDS } from "../../shared/testIds";
import PageHeader from "../../components/layout/PageHeader";
import EmptyState from "../../components/feedback/EmptyState";
import Modal from "../../components/feedback/Modal";
import FileUpload from "../../components/forms/FileUpload";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { useDefects } from "../../hooks/useDefects";
import { useProjects } from "../../hooks/useProjects";
import { useTestPlans } from "../../hooks/useTestPlans";
import { useTestRuns } from "../../hooks/useTestRuns";
import { useUsers } from "../../hooks/useUsers";

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { refresh: refreshDefects } = useDefects();
  const { refresh: refreshProjects } = useProjects();
  const { refresh: refreshTestPlans } = useTestPlans();
  const { refresh: refreshTestRuns } = useTestRuns();
  const { refresh: refreshUsers } = useUsers();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resetModal, setResetModal] = useState(false);
  const [clearModal, setClearModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [importedFile, setImportedFile] = useState<string>("");

  if (!user) return null;

  // ────────────────────────────────────────────────────────────────────────
  // ADMIN GUARD
  // ────────────────────────────────────────────────────────────────────────

  if (user.role !== "admin") {
    return (
      <div data-testid={TEST_IDS.settings.page}>
        <EmptyState
          variant="permission-denied"
          title="Admin Access Required"
          message="Only administrators can access settings."
        />
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // DATA MANAGEMENT HANDLERS
  // ────────────────────────────────────────────────────────────────────────

  const handleResetToSeed = () => {
    // Clear all localStorage tqh_* keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("tqh_")) {
        localStorage.removeItem(key);
      }
    });
    // Trigger seed re-initialization and reload
    addToast("success", "Data reset to seed state. Reloading...");
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleClearAllData = () => {
    // Clear all localStorage tqh_* keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("tqh_")) {
        localStorage.removeItem(key);
      }
    });
    addToast("success", "All data cleared. Reloading...");
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleExportData = () => {
    const exportData: Record<string, unknown> = {};
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("tqh_")) {
        const raw = localStorage.getItem(key);
        if (raw) {
          exportData[key] = JSON.parse(raw);
        }
      }
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `tqh-export-${timestamp}.json`;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    addToast("success", `Data exported as ${filename}`);
  };

  const handleImportData = () => {
    if (!importedFile) {
      addToast("error", "Please select a file to import");
      return;
    }

    try {
      const data = JSON.parse(importedFile);

      // Validate expected keys
      const expectedKeys = [
        "tqh_users",
        "tqh_projects",
        "tqh_defects",
        "tqh_test_plans",
        "tqh_test_runs",
      ];
      const hasAllKeys = expectedKeys.every((key) => key in data);
      if (!hasAllKeys) {
        addToast("error", "Invalid data format: missing required keys");
        return;
      }

      // Write to localStorage
      Object.entries(data).forEach(([key, value]) => {
        if (key.startsWith("tqh_")) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      });

      addToast("success", "Data imported successfully. Reloading...");
      setImportModal(false);
      setImportedFile("");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid JSON";
      addToast("error", `Import failed: ${message}`);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // SYSTEM INFO
  // ────────────────────────────────────────────────────────────────────────

  // Calculate localStorage usage
  let totalBytes = 0;
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("tqh_")) {
      const value = localStorage.getItem(key);
      if (value) {
        totalBytes += value.length;
      }
    }
  });

  // Entity counts
  const userCount = JSON.parse(
    localStorage.getItem("tqh_users") || "[]",
  ).length;
  const projectCount = JSON.parse(
    localStorage.getItem("tqh_projects") || "[]",
  ).length;
  const defectCount = JSON.parse(
    localStorage.getItem("tqh_defects") || "[]",
  ).length;
  const testPlanCount = JSON.parse(
    localStorage.getItem("tqh_test_plans") || "[]",
  ).length;
  const testRunCount = JSON.parse(
    localStorage.getItem("tqh_test_runs") || "[]",
  ).length;

  return (
    <div data-testid={TEST_IDS.settings.page}>
      <PageHeader title="Settings" />

      <div className="space-y-6">
        {/* Data Management Card */}
        <div className="glass rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Data Management
          </h2>

          <div className="space-y-4">
            <button
              data-testid={TEST_IDS.settings.btnReset}
              onClick={() => setResetModal(true)}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-between transition-colors"
            >
              <span className="font-semibold">Reset to Seed Data</span>
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              data-testid={TEST_IDS.settings.btnClear}
              onClick={() => setClearModal(true)}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-between transition-colors"
            >
              <span className="font-semibold">Clear All Data</span>
              <Trash2 className="w-5 h-5" />
            </button>

            <button
              data-testid={TEST_IDS.settings.btnExport}
              onClick={handleExportData}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-between transition-colors"
            >
              <span className="font-semibold">Export Data</span>
              <Download className="w-5 h-5" />
            </button>

            <button
              data-testid={TEST_IDS.settings.btnImport}
              onClick={() => setImportModal(true)}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-between transition-colors"
            >
              <span className="font-semibold">Import Data</span>
              <Upload className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* System Info Card */}
        <div
          data-testid={TEST_IDS.settings.systemInfo}
          className="glass rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">System Info</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-gray-300">App Version</span>
              <span className="text-white font-semibold">1.0.0</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-gray-300">localStorage Usage</span>
              <span className="text-white font-semibold">
                {(totalBytes / 1024).toFixed(2)} KB
              </span>
            </div>

            <div className="border-t border-white/10 my-6" />

            <h3 className="text-lg font-semibold text-white mt-6 mb-4">
              Entity Counts
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-gray-400 text-sm">Users</p>
                <p className="text-white text-2xl font-bold">{userCount}</p>
              </div>

              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-gray-400 text-sm">Projects</p>
                <p className="text-white text-2xl font-bold">{projectCount}</p>
              </div>

              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-gray-400 text-sm">Defects</p>
                <p className="text-white text-2xl font-bold">{defectCount}</p>
              </div>

              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-gray-400 text-sm">Test Plans</p>
                <p className="text-white text-2xl font-bold">{testPlanCount}</p>
              </div>

              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-gray-400 text-sm">Test Runs</p>
                <p className="text-white text-2xl font-bold">{testRunCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={resetModal}
        data-testid="settings-reset-modal"
        title="Reset to Seed Data?"
        onClose={() => setResetModal(false)}
        footer={
          <div className="flex gap-2 justify-end">
            <button
              className="btn btn-secondary"
              onClick={() => setResetModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                handleResetToSeed();
                setResetModal(false);
              }}
            >
              Reset
            </button>
          </div>
        }
      >
        <p className="text-gray-300">
          This will reset all data to the initial seed state. This cannot be
          undone.
        </p>
      </Modal>

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={clearModal}
        data-testid="settings-clear-modal"
        title="Clear All Data?"
        onClose={() => setClearModal(false)}
        footer={
          <div className="flex gap-2 justify-end">
            <button
              className="btn btn-secondary"
              onClick={() => setClearModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                handleClearAllData();
                setClearModal(false);
              }}
            >
              Clear
            </button>
          </div>
        }
      >
        <p className="text-gray-300">
          This will delete all data from localStorage. This cannot be undone.
        </p>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={importModal}
        data-testid="settings-import-modal"
        title="Import Data"
        onClose={() => {
          setImportModal(false);
          setImportedFile("");
        }}
        footer={
          <div className="flex gap-2 justify-end">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setImportModal(false);
                setImportedFile("");
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleImportData}
              disabled={!importedFile}
            >
              Import
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Select a JSON file exported from a previous backup.
          </p>
          <FileUpload
            data-testid="settings-import-file"
            label="Import File"
            name="importFile"
            value={importedFile ? "data.json" : ""}
            onChange={(filename) => setImportedFile(filename)}
            accept=".json"
          />
          {importedFile && (
            <p className="text-green-400 text-sm">File loaded successfully</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
