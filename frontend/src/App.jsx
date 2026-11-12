import { useCallback, useEffect, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { checkHealth, deleteResume, fetchResumes, uploadResume } from "./api.js";
import AnalysisView from "./components/AnalysisView.jsx";
import SidebarHistory from "./components/SidebarHistory.jsx";
import UploadCard from "./components/UploadCard.jsx";

export default function App() {
  const [apiStatus, setApiStatus] = useState("checking");
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [showUploader, setShowUploader] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 2800);
  }, []);

  const loadWorkspace = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      await checkHealth();
      setApiStatus("online");
      const list = await fetchResumes();
      setResumes(list);
      setSelectedResume((prev) => {
        if (prev) {
          return list.find((item) => item.id === prev.id) || list[0] || null;
        }
        return list[0] || null;
      });
    } catch {
      setApiStatus("offline");
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  async function handleUpload(file) {
    setIsUploading(true);
    setUploadError("");
    try {
      const data = await uploadResume(file);
      const newEntry = {
        id: data.id,
        filename: file.name,
        extracted_text: data.extracted_text,
        analysis: data.analysis,
        created_at: new Date().toISOString(),
      };
      setResumes((prev) => [newEntry, ...prev]);
      setSelectedResume(newEntry);
      setShowUploader(false);
      setApiStatus("online");
      notify("Resume analyzed and saved to MongoDB");
      return true;
    } catch (error) {
      setUploadError(error.message || "Failed to analyze resume.");
      return false;
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await deleteResume(id);
      setResumes((prev) => {
        const next = prev.filter((item) => item.id !== id);
        if (selectedResume?.id === id) {
          setSelectedResume(next[0] || null);
          if (next.length === 0) setShowUploader(true);
        }
        return next;
      });
      notify("Resume deleted from MongoDB");
    } catch (error) {
      notify(error.message || "Failed to delete resume", true);
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-mark">
              <Sparkles size={18} />
            </div>
            <div>
              <h1>AI Career Assistant</h1>
              <p>PDF Extraction • Groq Structured Analysis • MongoDB</p>
            </div>
          </div>

          <div className="topbar-actions">
            <span className={`status-pill status-${apiStatus}`}>
              <span className="status-dot" />
              {apiStatus === "online"
                ? "API Connected"
                : apiStatus === "offline"
                ? "API Offline"
                : "Connecting..."}
            </span>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowUploader((prev) => !prev)}
            >
              <Plus size={16} />
              {showUploader && selectedResume ? "Hide Uploader" : "Upload Resume"}
            </button>
          </div>
        </div>
      </header>

      {apiStatus === "offline" && (
        <div className="offline-banner">
          Backend API is unreachable at <code>127.0.0.1:8000</code>. Make sure MongoDB and{" "}
          <code>uvicorn main:app --reload</code> are running, then click refresh.
        </div>
      )}

      <main className="workspace">
        <SidebarHistory
          resumes={resumes}
          selectedId={selectedResume?.id}
          isLoading={isLoadingHistory}
          deletingId={deletingId}
          onSelect={(item) => {
            setSelectedResume(item);
            setShowUploader(false);
          }}
          onDelete={handleDelete}
          onRefresh={loadWorkspace}
        />

        <div className="main-content">
          {(showUploader || !selectedResume) && (
            <UploadCard
              isUploading={isUploading}
              onUpload={handleUpload}
              errorMessage={uploadError}
              onClearError={() => setUploadError("")}
            />
          )}

          {selectedResume && (
            <AnalysisView key={selectedResume.id} resume={selectedResume} onNotify={notify} />
          )}
        </div>
      </main>

      {toast && (
        <div className={`toast ${toast.isError ? "toast-error" : ""}`} role="status">
          {toast.message}
        </div>
      )}
    </div>
  );
}
