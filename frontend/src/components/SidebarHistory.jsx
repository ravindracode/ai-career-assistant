import { useMemo, useState } from "react";
import { FileText, RefreshCw, Search, Trash2 } from "lucide-react";

function formatTimestamp(isoString) {
  if (!isoString) return "Recently saved";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "Recently saved";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SidebarHistory({
  resumes,
  selectedId,
  isLoading,
  deletingId,
  onSelect,
  onDelete,
  onRefresh,
}) {
  const [query, setQuery] = useState("");

  const filteredResumes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resumes;
    return resumes.filter((item) => {
      const name = item.analysis?.candidate_name?.toLowerCase() || "";
      const filename = item.filename?.toLowerCase() || "";
      const skills = (item.analysis?.skills || []).join(" ").toLowerCase();
      return name.includes(q) || filename.includes(q) || skills.includes(q);
    });
  }, [resumes, query]);

  return (
    <aside className="sidebar card">
      <div className="sidebar-header">
        <div>
          <h3>Saved Resumes</h3>
          <span className="muted-text">{resumes.length} stored in MongoDB</span>
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh saved resumes"
        >
          <RefreshCw size={15} className={isLoading ? "spin" : ""} />
        </button>
      </div>

      <div className="search-box">
        <Search size={15} className="search-icon" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, skill, or file..."
          aria-label="Search saved resumes"
        />
      </div>

      <div className="history-list">
        {isLoading && resumes.length === 0 ? (
          <div className="empty-sidebar">Loading saved analyses...</div>
        ) : filteredResumes.length === 0 ? (
          <div className="empty-sidebar">
            {resumes.length === 0
              ? "No resumes analyzed yet. Upload a PDF to get started."
              : "No saved resumes match your search."}
          </div>
        ) : (
          filteredResumes.map((item) => {
            const isSelected = item.id === selectedId;
            const candidateName = item.analysis?.candidate_name || "Unnamed Candidate";
            const skillCount = item.analysis?.skills?.length ?? 0;
            const expYears = item.analysis?.experience_years;

            return (
              <div
                key={item.id}
                className={`history-item ${isSelected ? "history-item-active" : ""}`}
                onClick={() => onSelect(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(item);
                  }
                }}
              >
                <div className="history-item-top">
                  <div className="history-item-title">{candidateName}</div>
                  <button
                    type="button"
                    className="delete-btn"
                    title="Delete saved resume"
                    disabled={deletingId === item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="history-item-file">
                  <FileText size={13} />
                  <span>{item.filename || "resume.pdf"}</span>
                </div>

                <div className="history-item-meta">
                  <span className="mini-pill">{skillCount} skills</span>
                  {expYears !== null && expYears !== undefined && (
                    <span className="mini-pill">{expYears} yrs</span>
                  )}
                  <span className="history-date">{formatTimestamp(item.created_at)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

