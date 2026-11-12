from services.llm_service import analyze_resume

sample_resume = """
Ravindra Sai
Email: example@gmail.com
Location: Hyderabad, India

Summary:
Backend developer with 1 year of experience building REST APIs with Python and FastAPI.

Skills:
Python, FastAPI, React, MongoDB, Git

Experience:
Junior Software Engineer — ABC Tech (2025 - Present)
- Built document upload endpoints using FastAPI and PyMuPDF.

Education:
B.Tech in Computer Science
"""

result = analyze_resume(sample_resume)

print("Type:", type(result))
print(result.model_dump_json(indent=2))