<div align="center">

# 🚀 AI Career Assistant

**Full-Stack AI Resume Analyzer & Candidate Profile Manager**

Upload any PDF resume and automatically extract text with **PyMuPDF**, structure candidate data via **Groq LLM**, enforce strict types with **Pydantic**, persist results in **MongoDB**, and explore everything in a modern **React + Vite** dashboard.

<p>
  <img src="https://img.shields.io/badge/PIPELINE-PDF%20%E2%86%92%20GROQ%20%E2%86%92%20PYDANTIC%20%E2%86%92%20MONGODB-16a34a?style=for-the-badge" alt="Pipeline Flow" />
</p>

<p>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Pydantic-v2-E92063?style=flat-square&logo=pydantic&logoColor=white" alt="Pydantic" />
  <img src="https://img.shields.io/badge/MongoDB-Motor-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Groq-LLM%20JSON%20Mode-F55036?style=flat-square" alt="Groq LLM" />
</p>

<p>
  <a href="#-why-this-project">Why This Project</a> •
  <a href="#-real-world-use-cases">Use Cases</a> •
  <a href="#-agenda">Agenda</a> •
  <a href="#%EF%B8%8F-architecture">Architecture</a> •
  <a href="#-request-flow">Request Flow</a> •
  <a href="#-tech-stack--design-decisions">Tech Stack</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-quick-commands">Quick Commands</a>
</p>

</div>

---

## 💡 Why This Project?

### The Problem
1. **Unstructured PDFs are hard for software to read:** Every candidate formats their resume differently (columns, bullet styles, headings), making manual data entry slow and brittle regex parsers break easily.
2. **Raw LLM responses can't be trusted directly:** Asking an AI model for plain text—or even unvalidated JSON—can return markdown fences, missing fields, or wrong data types (`"one year"` instead of `1.0`), which crashes downstream UIs and databases.

### The Solution
**AI Career Assistant** solves both problems with an end-to-end, schema-enforced AI pipeline:
- **Extracts** clean text from any uploaded PDF locally using **PyMuPDF**.
- **Parses** candidate information with **Groq LLM** using strict JSON-object prompting.
- **Validates** every single response through a **Pydantic** schema (`ResumeAnalysis`) before saving or displaying it—guaranteeing predictable types (`list[str]`, `float | None`, `str | None`).
- **Stores & Organizes** every analyzed resume in **MongoDB** so users can search candidates by name, filename, or skill, inspect raw extracted text vs. structured JSON, export reports, and manage history from one clean web interface.

---

## 🎯 Real-World Use Cases

| Who | How They Use It | Value Delivered |
| --- | --- | --- |
| **Recruiters & Hiring Teams** | Upload batches of candidate PDFs and search saved profiles by skill or name | Turns messy resumes into uniform, searchable candidate cards in seconds |
| **Job Seekers** | Upload their own resume PDF and compare **Extracted PDF Text** vs. **Structured Profile** | Reveals how automated ATS/AI parsers read their resume (catching missing phone/email or garbled formatting) |
| **Developers & HR Tools** | Integrate `/upload` and `/resumes` REST endpoints into larger hiring or career workflows | Provides clean, Pydantic-validated JSON ready for ATS scoring, job matching, or analytics |

---

## 📋 Agenda

| # | Stage | Component | What Happens |
| :-: | --- | --- | --- |
| **1** | **PDF Upload** | React + FastAPI (`POST /upload`) | User drags & drops a `.pdf` resume; frontend and backend validate file type and size |
| **2** | **Text Extraction** | PyMuPDF (`pdf_service.py`) | Extracts clean text across all pages of the uploaded PDF bytes |
| **3** | **AI Structuring** | Groq SDK (`llm_service.py`) | Sends extracted text to `openai/gpt-oss-120b` with JSON object mode enabled |
| **4** | **Schema Validation** | Pydantic (`ResumeAnalysis`) | Validates `candidate_name`, `email`, `phone`, `skills`, `experience_years`, `education`, and `professional_summary` |
| **5** | **Persistence** | MongoDB (`database.py`) | Stores filename, extracted text, validated analysis, and UTC timestamp in the `resumes` collection |
| **6** | **Dashboard UI** | React + Vite (`frontend/`) | Browse saved history, search candidates/skills, inspect raw text or JSON, export `.json`, or delete records |

---

## 🏗️ Architecture

### High-Level System Flow

```mermaid
flowchart LR
    U["React + Vite UI (localhost:5173)"] -->|"POST /upload (PDF)"| API["FastAPI Backend (localhost:8000)"]
    API -->|"Extract Text"| PDF["PyMuPDF (pdf_service.py)"]
    PDF -->|"Raw Text"| LLM["Groq API (openai/gpt-oss-120b)"]
    LLM -->|"JSON String"| VAL["Pydantic Model (ResumeAnalysis)"]
    VAL -->|"Validated Dict"| DB[("MongoDB (resumes collection)")]
    DB -->|"GET /resumes & DELETE"| API
    API -->|"Structured Response"| U
```

### Component Breakdown

```text
+-----------------------------------------------------------------------------------+
|                            FRONTEND  (React 18 + Vite)                            |
|   UploadCard (Drag & Drop PDF)  |  SidebarHistory (Search)  |  AnalysisView       |
+-----------------------------------------+-----------------------------------------+
                                          |  HTTP / CORS  (http://127.0.0.1:8000)
                                          v
+-----------------------------------------------------------------------------------+
|                          BACKEND  (FastAPI + Uvicorn)                             |
|                                                                                   |
|   POST /upload  --->  PyMuPDF (Extract)  --->  Groq LLM (JSON)  --->  Pydantic    |
|   GET /resumes  <---  Motor Async Driver <----------------------------+           |
|   DELETE /resumes/{id}                                                            |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        DATABASE  (MongoDB :27017)                                 |
|   Database: ai_career_assistant   |   Collection: resumes                         |
+-----------------------------------------------------------------------------------+
```

---

## 🔄 Request Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as React Frontend
    participant API as FastAPI (/upload)
    participant PDF as PyMuPDF
    participant Groq as Groq LLM
    participant DB as MongoDB

    User->>UI: Drop or select PDF resume
    UI->>API: POST /upload (multipart/form-data)
    API->>PDF: extract_text_from_pdf(pdf_bytes)
    PDF-->>API: extracted_text
    API->>Groq: chat.completions.create(response_format=json_object)
    Groq-->>API: Raw JSON output
    API->>API: ResumeAnalysis.model_validate(parsed_data)
    API->>DB: insert_one({ filename, extracted_text, analysis, created_at })
    DB-->>API: inserted_id
    API-->>UI: 200 OK { id, message, extracted_text, analysis }
    UI-->>User: Display Profile, Skills, Extracted Text & JSON tabs
```

---

## 🧰 Tech Stack & Design Decisions

| Category | Technology | Why It Was Chosen |
| --- | --- | --- |
| **Frontend** | React 18, Vite 6, Lucide Icons, Custom CSS | Fast interactive workspace for drag-and-drop PDF upload, multi-tab inspection (Profile / Raw Text / JSON), skill filtering, and history search |
| **Backend API** | Python 3.10+, FastAPI, Uvicorn, `python-multipart` | Async-first REST API with automatic Swagger docs (`/docs`); uses `asyncio.to_thread` so synchronous LLM calls don't block the event loop |
| **PDF Parsing** | PyMuPDF (`pymupdf`) | Fast, accurate in-memory PDF text extraction without external OS dependencies |
| **LLM & Validation** | Groq SDK (`openai/gpt-oss-120b`), Pydantic v2 | Low-latency structured JSON extraction paired with strict runtime schema validation (`ResumeAnalysis.model_validate`) |
| **Database** | MongoDB, Motor (`AsyncIOMotorClient`), PyMongo | Document storage fits nested JSON profiles (`skills[]`, `education[]`) naturally with async non-blocking reads/writes |
| **Configuration** | `python-dotenv` | Keeps sensitive API keys (`GROQ_API_KEY`) and DB URIs out of source control via `.env` |

---

## ✨ Key Features & User Experience

- **Drag-and-Drop PDF Uploader:** Validates `.pdf` files client- and server-side, displaying live pipeline progress (`Uploading -> Extracting -> Analyzing -> Saving`).
- **3-Tab Candidate Inspector:**
  - **Structured Profile:** Candidate avatar, click-to-copy email & phone pills, experience & skill metrics, professional summary, searchable skill badges, and education timeline.
  - **Extracted PDF Text:** Full raw text extracted by PyMuPDF with one-click copy.
  - **Raw JSON:** Exact Pydantic-validated payload with **Copy JSON** and **Export `.json`** download.
- **MongoDB History Sidebar:** Instantly search saved resumes by candidate name, skill, or filename, refresh from MongoDB, or delete old entries.
- **Live API Health Indicator:** Top bar checks backend connectivity (`GET /`) and warns clearly if FastAPI or MongoDB is offline.

---

## 📡 API Reference

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | API health check (`{"message": "AI Career Assistant API is running"}`) |
| `POST` | `/upload` | Uploads a PDF, extracts text, runs Groq + Pydantic validation, saves to MongoDB |
| `GET` | `/resumes` | Returns all saved resume analyses sorted by newest first |
| `DELETE` | `/resumes/{resume_id}` | Deletes a saved resume analysis by MongoDB `ObjectId` |

<details>
<summary><strong>Click to view sample <code>POST /upload</code> JSON response</strong></summary>

```json
{
  "id": "6733a1b2c3d4e5f60718293a",
  "message": "Resume uploaded and analyzed successfully",
  "extracted_text": "MANGALA RAVINDRA SAI...",
  "analysis": {
    "candidate_name": "MANGALA RAVINDRA SAI",
    "email": "ravindrasai44211@gmail.com",
    "phone": "+91-7989757788",
    "skills": ["React.js", "Node.js", "Python", "FastAPI", "MongoDB"],
    "experience_years": 1.3,
    "education": [
      "B.Tech, Computer Science and Engineering — Madanapalle Institute of Technology and Science (2021 – 2024)"
    ],
    "professional_summary": "Full-Stack Developer with production experience across React, Node.js, Express.js, MongoDB, and MySQL..."
  }
}
```

</details>

---

## ⚡ Quick Commands

### 1. Start MongoDB
```bash
mongod --dbpath /c/data/db
```

### 2. Configure & Run Backend
```bash
cd backend
python -m venv venv
source venv/Scripts/activate      # Windows Git Bash
pip install -r requirements.txt
```

Create `backend/.env` using [backend/.env.example](backend/.env.example):
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=ai_career_assistant
GROQ_API_KEY=gsk_your_actual_groq_api_key
```

Start FastAPI:
```bash
uvicorn main:app --reload
```
- Swagger API Docs: **`http://127.0.0.1:8000/docs`**

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
- Web Dashboard: **`http://127.0.0.1:5173`**

---

## 📁 Project Structure

```text
ai-career-assistant/
├── .gitignore
├── README.md
├── backend/
│   ├── .env.example                 # Environment variable template
│   ├── database.py                  # Async MongoDB client & lifespan hooks
│   ├── main.py                      # FastAPI entrypoint & CORS config
│   ├── requirements.txt             # Python dependencies
│   ├── routes/
│   │   └── resume.py                # Upload, list & delete endpoints
│   ├── schemas/
│   │   └── resume_analysis.py       # Pydantic ResumeAnalysis schema
│   └── services/
│       ├── llm_service.py           # Groq LLM client & JSON validation
│       └── pdf_service.py           # PyMuPDF text extraction
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx                  # Main layout, health check & state
        ├── api.js                   # Backend API client
        ├── main.jsx
        ├── styles.css
        └── components/
            ├── AnalysisView.jsx     # Profile, Extracted Text & Raw JSON tabs
            ├── SidebarHistory.jsx   # Searchable MongoDB history sidebar
            └── UploadCard.jsx       # Drag-and-drop PDF uploader
```

---

## 🗺️ Roadmap

- [ ] Job description matching & ATS compatibility score
- [ ] Skill-gap analysis & tailored resume improvement suggestions
- [ ] Candidate comparison view & exportable PDF reports
