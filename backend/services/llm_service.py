import json
import os

from dotenv import load_dotenv
from groq import Groq

from schemas.resume_analysis import ResumeAnalysis

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)

SYSTEM_PROMPT = """
You are an expert resume parser. Extract structured information from the resume text
and return ONLY a valid JSON object matching this exact schema:

{
  "candidate_name": string,
  "email": string or null,
  "phone": string or null,
  "skills": list of strings,
  "experience_years": number or null,
  "education": list of strings,
  "professional_summary": string
}

Rules:
- Return only raw JSON (no markdown, no code fences, no extra text).
- Use null for missing optional fields (email, phone, experience_years).
- Use [] for skills or education if none are found.
""".strip()


def analyze_resume(resume_text: str) -> ResumeAnalysis:
    response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Analyze this resume:\n\n{resume_text}"},
        ],
        temperature=0.1,
        response_format={"type": "json_object"},
    )

    raw_content = response.choices[0].message.content
    if not raw_content:
        raise ValueError("Empty response received from Groq")

    parsed_data = json.loads(raw_content)
    analysis = ResumeAnalysis.model_validate(parsed_data)
    return analysis