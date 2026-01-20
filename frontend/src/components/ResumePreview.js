import React from 'react';

const ResumePreview = ({ resumeData }) => {
  const { personal_info, professional_summary, skills, work_experience, education, projects, certifications } =
    resumeData;

  return (
    <div className="font-secondary text-slate-800" data-testid="resume-preview">
      {/* Header */}
      <div className="text-center mb-6 pb-4 border-b-2 border-slate-300">
        <h1 className="text-3xl font-bold text-primary mb-2" data-testid="preview-name">
          {personal_info?.full_name || 'Your Name'}
        </h1>
        <div className="text-sm text-slate-600 space-x-3">
          {personal_info?.email && <span>{personal_info.email}</span>}
          {personal_info?.phone && <span>• {personal_info.phone}</span>}
          {personal_info?.location && <span>• {personal_info.location}</span>}
        </div>
        {(personal_info?.linkedin || personal_info?.portfolio) && (
          <div className="text-sm text-slate-600 mt-1 space-x-3">
            {personal_info?.linkedin && <span>{personal_info.linkedin}</span>}
            {personal_info?.portfolio && <span>• {personal_info.portfolio}</span>}
          </div>
        )}
      </div>

      {/* Professional Summary */}
      {professional_summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-primary mb-2 uppercase tracking-wide border-b border-slate-300 pb-1">
            Professional Summary
          </h2>
          <p className="text-sm leading-relaxed" data-testid="preview-summary">{professional_summary}</p>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-primary mb-2 uppercase tracking-wide border-b border-slate-300 pb-1">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="text-sm bg-slate-100 px-3 py-1 rounded"
                data-testid={`preview-skill-${index}`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {work_experience && work_experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-primary mb-2 uppercase tracking-wide border-b border-slate-300 pb-1">
            Work Experience
          </h2>
          {work_experience.map((exp, index) => (
            <div key={exp.id} className="mb-4" data-testid={`preview-experience-${index}`}>
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="font-bold text-slate-900">{exp.position || 'Position'}</h3>
                  <p className="text-sm text-slate-700">
                    {exp.company || 'Company'}
                    {exp.location && ` • ${exp.location}`}
                  </p>
                </div>
                <p className="text-sm text-slate-600">
                  {exp.start_date || 'Start'} - {exp.current ? 'Present' : exp.end_date || 'End'}
                </p>
              </div>
              {exp.description && exp.description.length > 0 && (
                <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                  {exp.description.map((desc, i) => (
                    <li key={i} className="text-slate-700">
                      {desc}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-primary mb-2 uppercase tracking-wide border-b border-slate-300 pb-1">
            Education
          </h2>
          {education.map((edu, index) => (
            <div key={edu.id} className="mb-3" data-testid={`preview-education-${index}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900">
                    {edu.degree || 'Degree'}
                    {edu.field && ` in ${edu.field}`}
                  </h3>
                  <p className="text-sm text-slate-700">
                    {edu.institution || 'Institution'}
                    {edu.location && ` • ${edu.location}`}
                  </p>
                </div>
                <p className="text-sm text-slate-600">
                  {edu.start_date || 'Start'} - {edu.end_date || 'End'}
                  {edu.gpa && ` • GPA: ${edu.gpa}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-primary mb-2 uppercase tracking-wide border-b border-slate-300 pb-1">
            Projects
          </h2>
          {projects.map((proj, index) => (
            <div key={proj.id} className="mb-3" data-testid={`preview-project-${index}`}>
              <h3 className="font-bold text-slate-900">
                {proj.name || 'Project Name'}
                {proj.link && (
                  <span className="text-sm font-normal text-slate-600"> • {proj.link}</span>
                )}
              </h3>
              <p className="text-sm text-slate-700 mb-1">{proj.description}</p>
              {proj.technologies && proj.technologies.length > 0 && (
                <p className="text-xs text-slate-600">
                  <span className="font-semibold">Technologies:</span> {proj.technologies.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-primary mb-2 uppercase tracking-wide border-b border-slate-300 pb-1">
            Certifications
          </h2>
          {certifications.map((cert, index) => (
            <div key={cert.id} className="mb-2 text-sm" data-testid={`preview-certification-${index}`}>
              <span className="font-bold text-slate-900">{cert.name || 'Certification'}</span>
              <span className="text-slate-700">
                {' • '}
                {cert.issuer || 'Issuer'}
                {cert.date && ` • ${cert.date}`}
                {cert.credential_id && ` • ID: ${cert.credential_id}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumePreview;
