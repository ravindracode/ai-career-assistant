import { useEffect, useRef, useState } from "react";
import { FileText, Loader2, Sparkles, UploadCloud, X } from "lucide-react";

const PIPELINE_STEPS = [
  "Uploading PDF to FastAPI...",
  "Extracting text with PyMuPDF...",
  "Analyzing structure with Groq LLM...",
  "Saving validated profile to MongoDB...",
];

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UploadCard({ isUploading, onUpload, errorMessage, onClearError }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isUploading) {
      setStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < PIPELINE_STEPS.length - 1 ? prev + 1 : prev));
    }, 1100);

    return () => clearInterval(interval);
  }, [isUploading]);

  function validateAndSelect(file) {
    setLocalError("");
    onClearError?.();

    if (!file) return;

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setLocalError("Only PDF files are supported. Please choose a .pdf resume.");
      return;
    }
    if (file.size === 0) {
      setLocalError("The selected PDF file is empty.");
      return;
    }

    setSelectedFile(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    if (isUploading) return;
    const droppedFile = event.dataTransfer.files?.[0];
    validateAndSelect(droppedFile);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedFile || isUploading) return;
    const success = await onUpload(selectedFile);
    if (success) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function clearFile() {
    setSelectedFile(null);
    setLocalError("");
    onClearError?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const activeError = localError || errorMessage;

  return (
    <section className="card upload-card">
      <div className="upload-card-header">
        <div>
          <span className="eyebrow">Resume Pipeline</span>
          <h2>Upload &amp; Analyze a PDF Resume</h2>
          <p className="muted-text">
            Extracts text, validates structured candidate data via Groq + Pydantic, and persists to MongoDB.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          className={`dropzone ${isDragging ? "dropzone-active" : ""} ${
            isUploading ? "dropzone-disabled" : ""
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            if (!isUploading) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !isUploading) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="sr-only"
            disabled={isUploading}
            onChange={(e) => validateAndSelect(e.target.files?.[0])}
          />

          <div className="dropzone-icon">
            <UploadCloud size={26} />
          </div>
          <p className="dropzone-title">
            {isDragging ? "Drop your PDF resume here" : "Drag & drop your PDF resume, or click to browse"}
          </p>
          <span className="dropzone-subtitle">PDF format only • Stored locally in MongoDB</span>
        </div>

        {selectedFile && (
          <div className="selected-file-bar">
            <div className="selected-file-info">
              <div className="file-badge">
                <FileText size={18} />
              </div>
              <div>
                <div className="selected-file-name">{selectedFile.name}</div>
                <div className="selected-file-meta">{formatFileSize(selectedFile.size)}</div>
              </div>
            </div>

            <div className="selected-file-actions">
              {!isUploading && (
                <button
                  type="button"
                  className="icon-btn"
                  onClick={clearFile}
                  title="Remove selected file"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Analyze Resume
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="pipeline-status" role="status" aria-live="polite">
            <Loader2 size={16} className="spin" />
            <span>{PIPELINE_STEPS[stepIndex]}</span>
          </div>
        )}

        {activeError && (
          <div className="alert-error" role="alert">
            <span>{activeError}</span>
          </div>
        )}
      </form>
    </section>
  );
}

