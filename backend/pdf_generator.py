from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from io import BytesIO
from typing import Dict

def generate_pdf(resume_data: Dict, template_id: str = "ats-tech") -> BytesIO:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    styles = getSampleStyleSheet()
    story = []
    
    # Custom styles
    name_style = ParagraphStyle(
        'NameStyle',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=6,
        alignment=TA_CENTER
    )
    
    contact_style = ParagraphStyle(
        'ContactStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#64748B'),
        alignment=TA_CENTER,
        spaceAfter=12
    )
    
    heading_style = ParagraphStyle(
        'HeadingStyle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=8,
        spaceBefore=12,
        borderWidth=0,
        borderPadding=0,
        borderColor=colors.HexColor('#CBD5E1'),
        borderRadius=0
    )
    
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#334155'),
        spaceAfter=6,
        leading=14
    )
    
    # Personal Info
    personal_info = resume_data.get('personal_info', {})
    story.append(Paragraph(personal_info.get('full_name', ''), name_style))
    
    contact_parts = []
    if personal_info.get('email'):
        contact_parts.append(personal_info['email'])
    if personal_info.get('phone'):
        contact_parts.append(personal_info['phone'])
    if personal_info.get('location'):
        contact_parts.append(personal_info['location'])
    
    if contact_parts:
        story.append(Paragraph(' | '.join(contact_parts), contact_style))
    
    link_parts = []
    if personal_info.get('linkedin'):
        link_parts.append(f"LinkedIn: {personal_info['linkedin']}")
    if personal_info.get('portfolio'):
        link_parts.append(f"Portfolio: {personal_info['portfolio']}")
    
    if link_parts:
        story.append(Paragraph(' | '.join(link_parts), contact_style))
    
    story.append(Spacer(1, 0.2*inch))
    
    # Professional Summary
    if resume_data.get('professional_summary'):
        story.append(Paragraph('PROFESSIONAL SUMMARY', heading_style))
        story.append(Paragraph(resume_data['professional_summary'], body_style))
        story.append(Spacer(1, 0.1*inch))
    
    # Skills
    if resume_data.get('skills'):
        story.append(Paragraph('SKILLS', heading_style))
        skills_text = ' • '.join(resume_data['skills'])
        story.append(Paragraph(skills_text, body_style))
        story.append(Spacer(1, 0.1*inch))
    
    # Work Experience
    if resume_data.get('work_experience'):
        story.append(Paragraph('WORK EXPERIENCE', heading_style))
        for exp in resume_data['work_experience']:
            # Company and Position
            exp_header = f"<b>{exp.get('position', '')}</b> | {exp.get('company', '')}"
            if exp.get('location'):
                exp_header += f" | {exp['location']}"
            story.append(Paragraph(exp_header, body_style))
            
            # Dates
            date_range = f"{exp.get('start_date', '')} - {exp.get('end_date', 'Present') if not exp.get('current') else 'Present'}"
            date_style = ParagraphStyle('DateStyle', parent=body_style, fontSize=9, textColor=colors.HexColor('#64748B'))
            story.append(Paragraph(date_range, date_style))
            
            # Description bullets
            for desc in exp.get('description', []):
                bullet = f"• {desc}"
                story.append(Paragraph(bullet, body_style))
            
            story.append(Spacer(1, 0.1*inch))
    
    # Education
    if resume_data.get('education'):
        story.append(Paragraph('EDUCATION', heading_style))
        for edu in resume_data['education']:
            edu_header = f"<b>{edu.get('degree', '')}</b>"
            if edu.get('field'):
                edu_header += f" in {edu['field']}"
            story.append(Paragraph(edu_header, body_style))
            
            edu_details = edu.get('institution', '')
            if edu.get('location'):
                edu_details += f" | {edu['location']}"
            story.append(Paragraph(edu_details, body_style))
            
            date_range = f"{edu.get('start_date', '')} - {edu.get('end_date', '')}"
            if edu.get('gpa'):
                date_range += f" | GPA: {edu['gpa']}"
            date_style = ParagraphStyle('DateStyle', parent=body_style, fontSize=9, textColor=colors.HexColor('#64748B'))
            story.append(Paragraph(date_range, date_style))
            story.append(Spacer(1, 0.1*inch))
    
    # Projects
    if resume_data.get('projects'):
        story.append(Paragraph('PROJECTS', heading_style))
        for proj in resume_data['projects']:
            proj_header = f"<b>{proj.get('name', '')}</b>"
            if proj.get('link'):
                proj_header += f" | {proj['link']}"
            story.append(Paragraph(proj_header, body_style))
            
            story.append(Paragraph(proj.get('description', ''), body_style))
            
            if proj.get('technologies'):
                tech_text = 'Technologies: ' + ', '.join(proj['technologies'])
                tech_style = ParagraphStyle('TechStyle', parent=body_style, fontSize=9, textColor=colors.HexColor('#64748B'))
                story.append(Paragraph(tech_text, tech_style))
            
            story.append(Spacer(1, 0.1*inch))
    
    # Certifications
    if resume_data.get('certifications'):
        story.append(Paragraph('CERTIFICATIONS', heading_style))
        for cert in resume_data['certifications']:
            cert_text = f"<b>{cert.get('name', '')}</b> | {cert.get('issuer', '')} | {cert.get('date', '')}"
            if cert.get('credential_id'):
                cert_text += f" | ID: {cert['credential_id']}"
            story.append(Paragraph(cert_text, body_style))
            story.append(Spacer(1, 0.05*inch))
    
    doc.build(story)
    buffer.seek(0)
    return buffer
