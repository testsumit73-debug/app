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
@api_router.post(\"/auth/signup\", response_model=LoginResponse)
async def signup(user_data: UserCreate):\n    # Check if user exists\n    existing_user = await db.users.find_one({\"email\": user_data.email}, {\"_id\": 0})\n    if existing_user:\n        raise HTTPException(status_code=400, detail=\"Email already registered\")\n    \n    # Create user\n    user_id = str(uuid.uuid4())\n    user_doc = {\n        \"id\": user_id,\n        \"email\": user_data.email,\n        \"password_hash\": hash_password(user_data.password),\n        \"full_name\": user_data.full_name,\n        \"created_at\": datetime.now(timezone.utc).isoformat()\n    }\n    \n    await db.users.insert_one(user_doc)\n    \n    # Generate token\n    token = create_access_token({\"sub\": user_id})\n    \n    user_response = UserResponse(\n        id=user_id,\n        email=user_data.email,\n        full_name=user_data.full_name,\n        created_at=datetime.now(timezone.utc)\n    )\n    \n    return LoginResponse(token=token, user=user_response)

@api_router.post(\"/auth/login\", response_model=LoginResponse)
async def login(login_data: LoginRequest):\n    # Find user\n    user = await db.users.find_one({\"email\": login_data.email}, {\"_id\": 0})\n    if not user:\n        raise HTTPException(status_code=401, detail=\"Invalid email or password\")\n    \n    # Verify password\n    if not verify_password(login_data.password, user['password_hash']):\n        raise HTTPException(status_code=401, detail=\"Invalid email or password\")\n    \n    # Generate token\n    token = create_access_token({\"sub\": user['id']})\n    \n    user_response = UserResponse(\n        id=user['id'],\n        email=user['email'],\n        full_name=user['full_name'],\n        created_at=datetime.fromisoformat(user['created_at'])\n    )\n    \n    return LoginResponse(token=token, user=user_response)

@api_router.get(\"/auth/me\", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):\n    return UserResponse(\n        id=current_user['id'],\n        email=current_user['email'],\n        full_name=current_user['full_name'],\n        created_at=datetime.fromisoformat(current_user['created_at'])\n    )

# Resume Routes
@api_router.post(\"/resumes\", response_model=ResumeResponse)
async def create_resume(resume_data: ResumeCreate, current_user: dict = Depends(get_current_user)):\n    resume_id = str(uuid.uuid4())\n    \n    # Calculate ATS score\n    resume_dict = resume_data.model_dump()\n    ats_result = calculate_ats_score(resume_dict)\n    \n    resume_doc = {\n        \"id\": resume_id,\n        \"user_id\": current_user['id'],\n        **resume_dict,\n        \"ats_score\": ats_result['score'],\n        \"created_at\": datetime.now(timezone.utc).isoformat(),\n        \"updated_at\": datetime.now(timezone.utc).isoformat()\n    }\n    \n    await db.resumes.insert_one(resume_doc)\n    \n    return ResumeResponse(\n        id=resume_id,\n        user_id=current_user['id'],\n        **resume_dict,\n        ats_score=ats_result['score'],\n        created_at=datetime.now(timezone.utc),\n        updated_at=datetime.now(timezone.utc)\n    )

@api_router.get(\"/resumes\", response_model=List[ResumeResponse])
async def get_resumes(current_user: dict = Depends(get_current_user)):\n    resumes = await db.resumes.find({\"user_id\": current_user['id']}, {\"_id\": 0}).to_list(1000)\n    \n    # Convert ISO strings to datetime\n    for resume in resumes:\n        resume['created_at'] = datetime.fromisoformat(resume['created_at'])\n        resume['updated_at'] = datetime.fromisoformat(resume['updated_at'])\n    \n    return resumes

@api_router.get(\"/resumes/{resume_id}\", response_model=ResumeResponse)
async def get_resume(resume_id: str, current_user: dict = Depends(get_current_user)):\n    resume = await db.resumes.find_one({\"id\": resume_id, \"user_id\": current_user['id']}, {\"_id\": 0})\n    \n    if not resume:\n        raise HTTPException(status_code=404, detail=\"Resume not found\")\n    \n    resume['created_at'] = datetime.fromisoformat(resume['created_at'])\n    resume['updated_at'] = datetime.fromisoformat(resume['updated_at'])\n    \n    return resume

@api_router.put(\"/resumes/{resume_id}\", response_model=ResumeResponse)
async def update_resume(resume_id: str, resume_data: ResumeUpdate, current_user: dict = Depends(get_current_user)):\n    # Check if resume exists\n    existing_resume = await db.resumes.find_one({\"id\": resume_id, \"user_id\": current_user['id']}, {\"_id\": 0})\n    if not existing_resume:\n        raise HTTPException(status_code=404, detail=\"Resume not found\")\n    \n    # Update only provided fields\n    update_data = resume_data.model_dump(exclude_unset=True)\n    \n    if update_data:\n        # Recalculate ATS score\n        merged_data = {**existing_resume, **update_data}\n        ats_result = calculate_ats_score(merged_data)\n        \n        update_data['ats_score'] = ats_result['score']\n        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()\n        \n        await db.resumes.update_one(\n            {\"id\": resume_id, \"user_id\": current_user['id']},\n            {\"$set\": update_data}\n        )\n    \n    # Fetch updated resume\n    updated_resume = await db.resumes.find_one({\"id\": resume_id, \"user_id\": current_user['id']}, {\"_id\": 0})\n    updated_resume['created_at'] = datetime.fromisoformat(updated_resume['created_at'])\n    updated_resume['updated_at'] = datetime.fromisoformat(updated_resume['updated_at'])\n    \n    return updated_resume

@api_router.delete(\"/resumes/{resume_id}\")
async def delete_resume(resume_id: str, current_user: dict = Depends(get_current_user)):\n    result = await db.resumes.delete_one({\"id\": resume_id, \"user_id\": current_user['id']})\n    \n    if result.deleted_count == 0:\n        raise HTTPException(status_code=404, detail=\"Resume not found\")\n    \n    return {\"message\": \"Resume deleted successfully\"}

@api_router.post(\"/resumes/{resume_id}/duplicate\", response_model=ResumeResponse)
async def duplicate_resume(resume_id: str, current_user: dict = Depends(get_current_user)):\n    # Find original resume\n    original = await db.resumes.find_one({\"id\": resume_id, \"user_id\": current_user['id']}, {\"_id\": 0})\n    \n    if not original:\n        raise HTTPException(status_code=404, detail=\"Resume not found\")\n    \n    # Create duplicate\n    new_id = str(uuid.uuid4())\n    duplicate = {**original}\n    duplicate['id'] = new_id\n    duplicate['title'] = f\"{original['title']} (Copy)\"\n    duplicate['created_at'] = datetime.now(timezone.utc).isoformat()\n    duplicate['updated_at'] = datetime.now(timezone.utc).isoformat()\n    \n    await db.resumes.insert_one(duplicate)\n    \n    duplicate['created_at'] = datetime.fromisoformat(duplicate['created_at'])\n    duplicate['updated_at'] = datetime.fromisoformat(duplicate['updated_at'])\n    \n    return duplicate

@api_router.get(\"/resumes/{resume_id}/ats-score\", response_model=ATSScoreResponse)
async def get_ats_score(resume_id: str, current_user: dict = Depends(get_current_user)):\n    resume = await db.resumes.find_one({\"id\": resume_id, \"user_id\": current_user['id']}, {\"_id\": 0})\n    \n    if not resume:\n        raise HTTPException(status_code=404, detail=\"Resume not found\")\n    \n    ats_result = calculate_ats_score(resume)\n    \n    return ATSScoreResponse(\n        score=ats_result['score'],\n        suggestions=ats_result['suggestions'],\n        missing_keywords=ats_result['missing_keywords']\n    )

@api_router.get(\"/resumes/{resume_id}/export/pdf\")
async def export_pdf(resume_id: str, current_user: dict = Depends(get_current_user)):\n    resume = await db.resumes.find_one({\"id\": resume_id, \"user_id\": current_user['id']}, {\"_id\": 0})\n    \n    if not resume:\n        raise HTTPException(status_code=404, detail=\"Resume not found\")\n    \n    # Generate PDF\n    pdf_buffer = generate_pdf(resume, resume.get('template_id', 'ats-tech'))\n    \n    return StreamingResponse(\n        pdf_buffer,\n        media_type=\"application/pdf\",\n        headers={\n            \"Content-Disposition\": f\"attachment; filename={resume['title'].replace(' ', '_')}.pdf\"\n        }\n    )

# Template Routes
@api_router.get(\"/templates\")
async def get_templates():\n    templates = [\n        {\n            \"id\": \"ats-tech\",\n            \"name\": \"ATS-Friendly Tech\",\n            \"description\": \"Clean, professional format optimized for Applicant Tracking Systems. Perfect for tech roles.\",\n            \"industry\": \"tech\",\n            \"experience_level\": \"all\",\n            \"preview_image\": \"https://images.pexels.com/photos/7793999/pexels-photo-7793999.jpeg?auto=compress&cs=tinysrgb&w=400\"\n        },\n        {\n            \"id\": \"business-pro\",\n            \"name\": \"Business Professional\",\n            \"description\": \"Traditional format with a modern touch. Ideal for business and management roles.\",\n            \"industry\": \"business\",\n            \"experience_level\": \"mid-senior\",\n            \"preview_image\": \"https://images.pexels.com/photos/8528405/pexels-photo-8528405.jpeg?auto=compress&cs=tinysrgb&w=400\"\n        },\n        {\n            \"id\": \"creative-bold\",\n            \"name\": \"Creative Bold\",\n            \"description\": \"Eye-catching design for creative professionals. Stand out while staying ATS-friendly.\",\n            \"industry\": \"creative\",\n            \"experience_level\": \"all\",\n            \"preview_image\": \"https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400\"\n        }\n    ]\n    return templates

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(\n    CORSMiddleware,\n    allow_credentials=True,\n    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),\n    allow_methods=[\"*\"],\n    allow_headers=[\"*\"],\n)

# Configure logging
logging.basicConfig(\n    level=logging.INFO,\n    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'\n)
logger = logging.getLogger(__name__)

@app.on_event(\"shutdown\")
async def shutdown_db_client():\n    client.close()
