import asyncio
import json
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, File, HTTPException, UploadFile
from groq import GroqError
from pydantic import ValidationError
from pymongo.errors import PyMongoError

from database import get_database
from services.llm_service import analyze_resume
from services.pdf_service import extract_text_from_pdf

router = APIRouter()


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    filename = (file.filename or "").lower()
    if file.content_type != "application/pdf" and not filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    try:
        extracted_text = extract_text_from_pdf(pdf_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    try:
        analysis = await asyncio.to_thread(analyze_resume, extracted_text)
    except (GroqError, json.JSONDecodeError, ValidationError, ValueError) as exc:
        raise HTTPException(status_code=502, detail=f"Resume analysis failed: {exc}") from exc

    db = get_database()
    document = {
        "filename": file.filename,
        "extracted_text": extracted_text,
        "analysis": analysis.model_dump(),
        "created_at": datetime.now(timezone.utc),
    }

    try:
        insert_result = await db["resumes"].insert_one(document)
    except PyMongoError as exc:
        raise HTTPException(status_code=500, detail="Failed to save resume analysis") from exc

    return {
        "id": str(insert_result.inserted_id),
        "message": "Resume uploaded and analyzed successfully",
        "extracted_text": extracted_text,
        "analysis": analysis.model_dump(),
    }


@router.get("/resumes")
async def list_resumes():
    db = get_database()
    resumes = []
    async for doc in db["resumes"].find().sort("created_at", -1):
        doc["id"] = str(doc.pop("_id"))
        resumes.append(doc)
    return {"resumes": resumes}


@router.delete("/resumes/{resume_id}")
async def delete_resume(resume_id: str):
    try:
        object_id = ObjectId(resume_id)
    except InvalidId as exc:
        raise HTTPException(status_code=400, detail="Invalid resume ID") from exc

    db = get_database()
    try:
        result = await db["resumes"].delete_one({"_id": object_id})
    except PyMongoError as exc:
        raise HTTPException(status_code=500, detail="Failed to delete resume") from exc

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resume not found")

    return {"message": "Resume deleted successfully", "id": resume_id}