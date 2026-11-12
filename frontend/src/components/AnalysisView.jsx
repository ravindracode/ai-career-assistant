import { useMemo, useState } from "react";
import {
  Briefcase,
  Check,
  Code2,
  Copy,
  Download,
  FileText,
  GraduationCap,
  Mail,
  Phone,
  Search,
  UserCheck,
} from "lucide-react";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function AnalysisView({ resume, onNotify }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [skillFilter, setSkillFilter] = useState("");
  const [copiedField, setCopiedField] = useState("");

  const analysis = resume?.analysis || {};
  const skills = Array.isArray(analysis.skills) ? analysis.skills : [];
  const education = Array.isArray(analysis.education) ? analysis.education : [];

  const filteredSkills = useMemo(() => {
    const q = skillFilter.trim().toLowerCase();
    if (!q) return skills;
    return skills.filter((skill) => skill.toLowerCase().includes(q));
  }, [skills, skillFilter]);

  async function copyText(text, label) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(label);
      onNotify?.(`${label} copied to clipboard`);
      setTimeout(() => setCopiedField(""), 1800);
    } catch {
      onNotify?.("Could not access clipboard", true);
    }
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = (analysis.candidate_name || "resume-analysis")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    link.href = url;
    link.download = `${safeName || "resume-analysis"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="analysis-container">
      <div className="card candidate-header-card">
        <div className="candidate-top-row">
          <div className="candidate-identity">
            <div className="avatar-badge">{getInitials(analysis.candidate_name)}</div>
            <div>
              <div className="candidate-name-row">
                <h2>{analysis.candidate_name || "Unnamed Candidate"}</h2>
                {resume.filename && <span className="file-chip">{resume.filename}</span>}
              </div>

              <div className="contact-row">
                {analysis.email ? (
                  <button
                    type="button"
                    className="contact-pill"
                    onClick={() => copyText(analysis.email, "Email")}
                    title="Copy email"
                  >
                    <Mail size={14} />
                    <span>{analysis.email}</span>
                    {copiedField === "Email" ? <Check size={13} /> : <Copy size={12} />}
                  </button>
                ) : (
                  <span className="contact-pill contact-pill-muted">
                    <Mail size={14} />
                    <span>No email found</span>
                  </span>
                )}

                {analysis.phone ? (
                  <button
                    type="button"
                    className="contact-pill"
                    onClick={() => copyText(analysis.phone, "Phone")}
                    title="Copy phone"
                  >
                    <Phone size={14} />
                    <span>{analysis.phone}</span>
                    {copiedField === "Phone" ? <Check size={13} /> : <Copy size={12} />}
                  </button>
                ) : (
                  <span className="contact-pill contact-pill-muted">
                    <Phone size={14} />
                    <span>No phone found</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => copyText(JSON.stringify(analysis, null, 2), "JSON")}
            >
              {copiedField === "JSON" ? <Check size={15} /> : <Copy size={15} />}
              Copy JSON
            </button>
            <button type="button" className="btn btn-secondary" onClick={downloadJson}>
              <Download size={15} />
              Export JSON
            </button>
          </div>
        </div>

        <div className="stats-strip">
          <div className="stat-box">
            <div className="stat-label">
              <Briefcase size={14} />
              Experience
            </div>
            <div className="stat-value">
              {analysis.experience_years !== null && analysis.experience_years !== undefined
                ? `${analysis.experience_years} yrs`
                : "Not specified"}
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">
              <Code2 size={14} />
              Extracted Skills
            </div>
            <div className="stat-value">{skills.length}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">
              <GraduationCap size={14} />
              Education Entries
            </div>
            <div className="stat-value">{education.length}</div>
          </div>
        </div>
      </div>

      <div className="tabs-bar">
        <button
          type="button"
          className={`tab-btn ${activeTab === "profile" ? "tab-btn-active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <UserCheck size={15} />
          Structured Profile
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "text" ? "tab-btn-active" : ""}`}
          onClick={() => setActiveTab("text")}
        >
          <FileText size={15} />
          Extracted PDF Text
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "json" ? "tab-btn-active" : ""}`}
          onClick={() => setActiveTab("json")}
        >
          <Code2 size={15} />
          Raw JSON
        </button>
      </div>

      {activeTab === "profile" && (
        <div className="profile-grid">
          <div className="card detail-card detail-card-full">
            <h3>Professional Summary</h3>
            <p className="summary-text">
              {analysis.professional_summary || "No professional summary extracted."}
            </p>
          </div>

          <div className="card detail-card">
            <div className="detail-card-header">
              <h3>Skills ({skills.length})</h3>
              {skills.length > 6 && (
                <div className="inline-search">
                  <Search size={13} />
                  <input
                    type="text"
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    placeholder="Filter skills..."
                    aria-label="Filter skills"
                  />
                </div>
              )}
            </div>
            {filteredSkills.length === 0 ? (
              <p className="muted-text">
                {skills.length === 0 ? "No skills detected." : "No matching skills."}
              </p>
            ) : (
              <div className="skills-grid">
                {filteredSkills.map((skill, idx) => (
                  <span key={`${skill}-${idx}`} className="skill-pill">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="card detail-card">
            <h3>Education ({education.length})</h3>
            {education.length === 0 ? (
              <p className="muted-text">No education entries detected.</p>
            ) : (
              <ul className="education-list">
                {education.map((entry, idx) => (
                  <li key={`${entry}-${idx}`} className="education-item">
                    <span className="education-dot" />
                    <span>{entry}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {activeTab === "text" && (
        <div className="card detail-card">
          <div className="detail-card-header">
            <h3>Extracted PDF Text</h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => copyText(resume.extracted_text || "", "Extracted text")}
            >
              {copiedField === "Extracted text" ? <Check size={14} /> : <Copy size={14} />}
              Copy Text
            </button>
          </div>
          <pre className="code-block">
            {resume.extracted_text || "No extracted text stored for this resume."}
          </pre>
        </div>
      )}

      {activeTab === "json" && (
        <div className="card detail-card">
          <div className="detail-card-header">
            <h3>Validated ResumeAnalysis Schema</h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => copyText(JSON.stringify(analysis, null, 2), "JSON")}
            >
              {copiedField === "JSON" ? <Check size={14} /> : <Copy size={14} />}
              Copy JSON
            </button>
          </div>
          <pre className="code-block">{JSON.stringify(analysis, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}

