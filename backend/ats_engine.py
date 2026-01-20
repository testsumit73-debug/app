from typing import List, Dict
import re

ATS_KEYWORDS = {
    "tech": [
        "python", "javascript", "react", "node", "java", "sql", "aws", "docker",
        "kubernetes", "api", "mongodb", "postgresql", "git", "agile", "scrum",
        "typescript", "vue", "angular", "django", "fastapi", "flask", "spring"
    ],
    "business": [
        "strategy", "analysis", "stakeholder", "project management", "budget",
        "leadership", "communication", "collaboration", "presentation", "excel",
        "powerpoint", "data analysis", "market research", "roi", "kpi"
    ],
    "general": [
        "problem solving", "team player", "analytical", "detail-oriented",
        "time management", "multitasking", "organized", "self-motivated",
        "proactive", "adaptable", "innovative", "results-driven"
    ]
}

def calculate_ats_score(resume_data: dict) -> Dict[str, any]:
    score = 0
    suggestions = []
    missing_keywords = []
    
    # Combine all text from resume
    resume_text = ""
    resume_text += resume_data.get("professional_summary", "") + " "
    resume_text += " ".join(resume_data.get("skills", [])) + " "
    
    for exp in resume_data.get("work_experience", []):
        resume_text += exp.get("position", "") + " "
        resume_text += " ".join(exp.get("description", [])) + " "
    
    for edu in resume_data.get("education", []):
        resume_text += edu.get("degree", "") + " "
        resume_text += edu.get("field", "") + " "
    
    for proj in resume_data.get("projects", []):
        resume_text += proj.get("name", "") + " "
        resume_text += proj.get("description", "") + " "
        resume_text += " ".join(proj.get("technologies", [])) + " "
    
    resume_text = resume_text.lower()
    
    # Check for keywords
    all_keywords = ATS_KEYWORDS["tech"] + ATS_KEYWORDS["business"] + ATS_KEYWORDS["general"]
    found_keywords = 0
    
    for keyword in all_keywords:
        if keyword.lower() in resume_text:
            found_keywords += 1
        else:
            missing_keywords.append(keyword)
    
    # Base score on keyword coverage
    keyword_score = int((found_keywords / len(all_keywords)) * 40)
    score += keyword_score
    
    # Check formatting (ATS-friendly structure)
    if resume_data.get("personal_info"):
        score += 10
    else:
        suggestions.append("Add personal information section")
    
    if resume_data.get("professional_summary"):
        score += 10
    else:
        suggestions.append("Add a professional summary")
    
    if len(resume_data.get("skills", [])) >= 5:
        score += 10
    else:
        suggestions.append("Add at least 5 relevant skills")
    
    if len(resume_data.get("work_experience", [])) > 0:
        score += 15
        # Check bullet points
        has_bullets = any(
            len(exp.get("description", [])) >= 2 
            for exp in resume_data.get("work_experience", [])
        )
        if has_bullets:
            score += 10
        else:
            suggestions.append("Add bullet points to work experience descriptions")
    else:
        suggestions.append("Add work experience")
    
    if len(resume_data.get("education", [])) > 0:
        score += 5
    else:
        suggestions.append("Add education information")
    
    # Cap score at 100
    score = min(score, 100)
    
    if score < 70:
        suggestions.insert(0, "Your ATS score is low. Add more relevant keywords and complete all sections.")
    elif score < 85:
        suggestions.insert(0, "Good progress! Add more industry-specific keywords to improve your score.")
    else:
        suggestions.insert(0, "Excellent! Your resume is well-optimized for ATS systems.")
    
    return {
        "score": score,
        "suggestions": suggestions[:5],  # Top 5 suggestions
        "missing_keywords": missing_keywords[:10]  # Top 10 missing keywords
    }
