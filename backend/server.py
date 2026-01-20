from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from models import (
    UserCreate, UserResponse, LoginRequest, LoginResponse,
    ResumeCreate, ResumeUpdate, ResumeResponse, ATSScoreResponse
)
from auth import hash_password, verify_password, create_access_token, decode_token
from ats_engine import calculate_ats_score
from pdf_generator import generate_pdf

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Auth dependency
async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.replace('Bearer ', '')
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get('sub')
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

# Auth Routes
@api_router.post("/auth/signup", response_model=LoginResponse)
async def signup(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "full_name": user_data.full_name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Generate token
    token = create_access_token({"sub": user_id})
    
    user_response = UserResponse(
        id=user_id,
        email=user_data.email,
        full_name=user_data.full_name,
        created_at=datetime.now(timezone.utc)
    )
    
    return LoginResponse(token=token, user=user_response)

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    # Find user
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(login_data.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Generate token
    token = create_access_token({"sub": user['id']})
    
    user_response = UserResponse(
        id=user['id'],
        email=user['email'],
        full_name=user['full_name'],
        created_at=datetime.fromisoformat(user['created_at'])
    )
    
    return LoginResponse(token=token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user['id'],
        email=current_user['email'],
        full_name=current_user['full_name'],
        created_at=datetime.fromisoformat(current_user['created_at'])
    )

# Resume Routes
@api_router.post("/resumes", response_model=ResumeResponse)
async def create_resume(resume_data: ResumeCreate, current_user: dict = Depends(get_current_user)):
    resume_id = str(uuid.uuid4())
    
    # Calculate ATS score
    resume_dict = resume_data.model_dump()
    ats_result = calculate_ats_score(resume_dict)
    
    resume_doc = {
        "id": resume_id,
        "user_id": current_user['id'],
        **resume_dict,
        "ats_score": ats_result['score'],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.resumes.insert_one(resume_doc)
    
    return ResumeResponse(
        id=resume_id,
        user_id=current_user['id'],
        **resume_dict,
        ats_score=ats_result['score'],
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )

@api_router.get("/resumes", response_model=List[ResumeResponse])
async def get_resumes(current_user: dict = Depends(get_current_user)):
    resumes = await db.resumes.find({"user_id": current_user['id']}, {"_id": 0}).to_list(1000)
    
    # Convert ISO strings to datetime
    for resume in resumes:
        resume['created_at'] = datetime.fromisoformat(resume['created_at'])
        resume['updated_at'] = datetime.fromisoformat(resume['updated_at'])
    
    return resumes

@api_router.get("/resumes/{resume_id}", response_model=ResumeResponse)
async def get_resume(resume_id: str, current_user: dict = Depends(get_current_user)):
    resume = await db.resumes.find_one({"id": resume_id, "user_id": current_user['id']}, {"_id": 0})
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    resume['created_at'] = datetime.fromisoformat(resume['created_at'])
    resume['updated_at'] = datetime.fromisoformat(resume['updated_at'])
    
    return resume

@api_router.put("/resumes/{resume_id}", response_model=ResumeResponse)
async def update_resume(resume_id: str, resume_data: ResumeUpdate, current_user: dict = Depends(get_current_user)):
    # Check if resume exists
    existing_resume = await db.resumes.find_one({"id": resume_id, "user_id": current_user['id']}, {"_id": 0})
    if not existing_resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Update only provided fields
    update_data = resume_data.model_dump(exclude_unset=True)
    
    if update_data:
        # Recalculate ATS score
        merged_data = {**existing_resume, **update_data}
        ats_result = calculate_ats_score(merged_data)
        
        update_data['ats_score'] = ats_result['score']
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        await db.resumes.update_one(
            {"id": resume_id, "user_id": current_user['id']},
            {"$set": update_data}
        )
    
    # Fetch updated resume
    updated_resume = await db.resumes.find_one({"id": resume_id, "user_id": current_user['id']}, {"_id": 0})
    updated_resume['created_at'] = datetime.fromisoformat(updated_resume['created_at'])
    updated_resume['updated_at'] = datetime.fromisoformat(updated_resume['updated_at'])
    
    return updated_resume

@api_router.delete("/resumes/{resume_id}")
async def delete_resume(resume_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.resumes.delete_one({"id": resume_id, "user_id": current_user['id']})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return {"message": "Resume deleted successfully"}

@api_router.post("/resumes/{resume_id}/duplicate", response_model=ResumeResponse)
async def duplicate_resume(resume_id: str, current_user: dict = Depends(get_current_user)):
    # Find original resume
    original = await db.resumes.find_one({"id": resume_id, "user_id": current_user['id']}, {"_id": 0})
    
    if not original:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Create duplicate
    new_id = str(uuid.uuid4())
    duplicate = {**original}
    duplicate['id'] = new_id
    duplicate['title'] = f"{original['title']} (Copy)"
    duplicate['created_at'] = datetime.now(timezone.utc).isoformat()
    duplicate['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.resumes.insert_one(duplicate)
    
    duplicate['created_at'] = datetime.fromisoformat(duplicate['created_at'])
    duplicate['updated_at'] = datetime.fromisoformat(duplicate['updated_at'])
    
    return duplicate

@api_router.get("/resumes/{resume_id}/ats-score", response_model=ATSScoreResponse)
async def get_ats_score(resume_id: str, current_user: dict = Depends(get_current_user)):
    resume = await db.resumes.find_one({"id": resume_id, "user_id": current_user['id']}, {"_id": 0})
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    ats_result = calculate_ats_score(resume)
    
    return ATSScoreResponse(
        score=ats_result['score'],
        suggestions=ats_result['suggestions'],
        missing_keywords=ats_result['missing_keywords']
    )

@api_router.get("/resumes/{resume_id}/export/pdf")
async def export_pdf(resume_id: str, current_user: dict = Depends(get_current_user)):
    resume = await db.resumes.find_one({"id": resume_id, "user_id": current_user['id']}, {"_id": 0})
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Generate PDF
    pdf_buffer = generate_pdf(resume, resume.get('template_id', 'ats-tech'))
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={resume['title'].replace(' ', '_')}.pdf"
        }
    )

# Template Routes
@api_router.get("/templates")
async def get_templates():
    templates = [
        {
            "id": "ats-tech",
            "name": "ATS-Friendly Tech",
            "description": "Clean, professional format optimized for Applicant Tracking Systems. Perfect for tech roles.",
            "industry": "tech",
            "experience_level": "all",
            "preview_image": "https://images.pexels.com/photos/7793999/pexels-photo-7793999.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
            "id": "business-pro",
            "name": "Business Professional",
            "description": "Traditional format with a modern touch. Ideal for business and management roles.",
            "industry": "business",
            "experience_level": "mid-senior",
            "preview_image": "https://images.pexels.com/photos/8528405/pexels-photo-8528405.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
            "id": "creative-bold",
            "name": "Creative Bold",
            "description": "Eye-catching design for creative professionals. Stand out while staying ATS-friendly.",
            "industry": "creative",
            "experience_level": "all",
            "preview_image": "https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400"
        }
    ]
    return templates

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(\n    CORSMiddleware,\n    allow_credentials=True,\n    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),\n    allow_methods=[\"*\"],\n    allow_headers=[\"*\"],\n)

# Configure logging
logging.basicConfig(\n    level=logging.INFO,\n    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'\n)
logger = logging.getLogger(__name__)

@app.on_event(\"shutdown\")
async def shutdown_db_client():\n    client.close()
