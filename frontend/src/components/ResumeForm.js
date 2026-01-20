import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const ResumeForm = ({ resumeData, setResumeData, templates }) => {
  const [activeSection, setActiveSection] = useState('personal');

  const updateField = (section, field, value) => {
    setResumeData({
      ...resumeData,
      [section]: {
        ...resumeData[section],
        [field]: value,
      },
    });
  };

  const addArrayItem = (field, defaultItem) => {
    setResumeData({
      ...resumeData,
      [field]: [...resumeData[field], defaultItem],
    });
  };

  const removeArrayItem = (field, index) => {
    const newArray = [...resumeData[field]];
    newArray.splice(index, 1);
    setResumeData({
      ...resumeData,
      [field]: newArray,
    });
  };

  const updateArrayItem = (field, index, key, value) => {
    const newArray = [...resumeData[field]];
    newArray[index] = { ...newArray[index], [key]: value };
    setResumeData({
      ...resumeData,
      [field]: newArray,
    });
  };

  const sections = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'summary', label: 'Summary' },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'projects', label: 'Projects' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'template', label: 'Template' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Section Navigation */}
      <div className="bg-white rounded-lg border border-slate-200 p-2 space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`w-full text-left px-4 py-2 rounded-md transition-all ${
              activeSection === section.id
                ? 'bg-primary text-white font-medium'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            data-testid={`section-${section.id}`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Personal Info */}
      {activeSection === 'personal' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4" data-testid="personal-info-section">
          <h3 className="text-lg font-semibold text-slate-900 font-primary">Personal Information</h3>
          <input
            type="text"
            placeholder="Full Name"
            value={resumeData.personal_info.full_name}
            onChange={(e) => updateField('personal_info', 'full_name', e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            data-testid="input-fullname"
          />
          <input
            type="email"
            placeholder="Email"
            value={resumeData.personal_info.email}
            onChange={(e) => updateField('personal_info', 'email', e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            data-testid="input-email"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={resumeData.personal_info.phone}
            onChange={(e) => updateField('personal_info', 'phone', e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            data-testid="input-phone"
          />
          <input
            type="text"
            placeholder="Location (e.g., San Francisco, CA)"
            value={resumeData.personal_info.location}
            onChange={(e) => updateField('personal_info', 'location', e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            data-testid="input-location"
          />
          <input
            type="url"
            placeholder="LinkedIn URL"
            value={resumeData.personal_info.linkedin}
            onChange={(e) => updateField('personal_info', 'linkedin', e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            data-testid="input-linkedin"
          />
          <input
            type="url"
            placeholder="Portfolio URL"
            value={resumeData.personal_info.portfolio}
            onChange={(e) => updateField('personal_info', 'portfolio', e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            data-testid="input-portfolio"
          />
        </div>
      )}

      {/* Professional Summary */}
      {activeSection === 'summary' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4" data-testid="summary-section">
          <h3 className="text-lg font-semibold text-slate-900 font-primary">Professional Summary</h3>
          <textarea
            placeholder="Write a brief professional summary (2-3 sentences)..."
            value={resumeData.professional_summary}
            onChange={(e) => setResumeData({ ...resumeData, professional_summary: e.target.value })}
            rows={6}
            className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            data-testid="input-summary"
          />
        </div>
      )}

      {/* Skills */}
      {activeSection === 'skills' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4" data-testid="skills-section">
          <h3 className="text-lg font-semibold text-slate-900 font-primary">Skills</h3>
          <p className="text-sm text-slate-600">Add skills separated by commas</p>
          <textarea
            placeholder="e.g., JavaScript, React, Node.js, Python, SQL"
            value={resumeData.skills.join(', ')}
            onChange={(e) =>
              setResumeData({
                ...resumeData,
                skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              })
            }
            rows={4}
            className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            data-testid="input-skills"
          />
        </div>
      )}

      {/* Work Experience */}
      {activeSection === 'experience' && (
        <div className="space-y-4" data-testid="experience-section">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 font-primary">Work Experience</h3>
            <button
              onClick={() =>
                addArrayItem('work_experience', {
                  id: Date.now().toString(),
                  company: '',
                  position: '',
                  location: '',
                  start_date: '',
                  end_date: '',
                  current: false,
                  description: [],
                })
              }
              className="flex items-center space-x-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
              data-testid="add-experience-button"
            >
              <Plus className="w-4 h-4" />
              <span>Add Experience</span>
            </button>
          </div>

          {resumeData.work_experience.map((exp, index) => (
            <div key={exp.id} className="bg-white rounded-lg border border-slate-200 p-6 space-y-4" data-testid={`experience-item-${index}`}>
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-900">Experience #{index + 1}</h4>
                <button
                  onClick={() => removeArrayItem('work_experience', index)}
                  className="text-red-600 hover:text-red-700"
                  data-testid={`remove-experience-${index}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Position"
                value={exp.position}
                onChange={(e) => updateArrayItem('work_experience', index, 'position', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="Company"
                value={exp.company}
                onChange={(e) => updateArrayItem('work_experience', index, 'company', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="Location"
                value={exp.location}
                onChange={(e) => updateArrayItem('work_experience', index, 'location', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Start Date (e.g., Jan 2020)"
                  value={exp.start_date}
                  onChange={(e) => updateArrayItem('work_experience', index, 'start_date', e.target.value)}
                  className="px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="End Date (e.g., Dec 2022)"
                  value={exp.end_date}
                  onChange={(e) => updateArrayItem('work_experience', index, 'end_date', e.target.value)}
                  disabled={exp.current}
                  className="px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100"
                />
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => updateArrayItem('work_experience', index, 'current', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-slate-600">Currently working here</span>
              </label>
              <textarea
                placeholder="Description (separate achievements with new lines)"
                value={exp.description.join('\n')}
                onChange={(e) =>
                  updateArrayItem(
                    'work_experience',
                    index,
                    'description',
                    e.target.value.split('\n').filter(Boolean)
                  )
                }
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {activeSection === 'education' && (
        <div className="space-y-4" data-testid="education-section">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 font-primary">Education</h3>
            <button
              onClick={() =>
                addArrayItem('education', {
                  id: Date.now().toString(),
                  institution: '',
                  degree: '',
                  field: '',
                  location: '',
                  start_date: '',
                  end_date: '',
                  gpa: '',
                })
              }
              className="flex items-center space-x-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
              data-testid="add-education-button"
            >
              <Plus className="w-4 h-4" />
              <span>Add Education</span>
            </button>
          </div>

          {resumeData.education.map((edu, index) => (
            <div key={edu.id} className="bg-white rounded-lg border border-slate-200 p-6 space-y-4" data-testid={`education-item-${index}`}>
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-900">Education #{index + 1}</h4>
                <button
                  onClick={() => removeArrayItem('education', index)}
                  className="text-red-600 hover:text-red-700"
                  data-testid={`remove-education-${index}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Degree (e.g., Bachelor of Science)"
                value={edu.degree}
                onChange={(e) => updateArrayItem('education', index, 'degree', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="Field of Study (e.g., Computer Science)"
                value={edu.field}
                onChange={(e) => updateArrayItem('education', index, 'field', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="Institution"
                value={edu.institution}
                onChange={(e) => updateArrayItem('education', index, 'institution', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="Location"
                value={edu.location}
                onChange={(e) => updateArrayItem('education', index, 'location', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Start (2018)"
                  value={edu.start_date}
                  onChange={(e) => updateArrayItem('education', index, 'start_date', e.target.value)}
                  className="px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="End (2022)"
                  value={edu.end_date}
                  onChange={(e) => updateArrayItem('education', index, 'end_date', e.target.value)}
                  className="px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="GPA (3.8)"
                  value={edu.gpa}
                  onChange={(e) => updateArrayItem('education', index, 'gpa', e.target.value)}
                  className="px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {activeSection === 'projects' && (
        <div className="space-y-4" data-testid="projects-section">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 font-primary">Projects</h3>
            <button
              onClick={() =>
                addArrayItem('projects', {
                  id: Date.now().toString(),
                  name: '',
                  description: '',
                  technologies: [],
                  link: '',
                })
              }
              className="flex items-center space-x-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
              data-testid="add-project-button"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
          </div>

          {resumeData.projects.map((proj, index) => (
            <div key={proj.id} className="bg-white rounded-lg border border-slate-200 p-6 space-y-4" data-testid={`project-item-${index}`}>
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-900">Project #{index + 1}</h4>
                <button
                  onClick={() => removeArrayItem('projects', index)}
                  className="text-red-600 hover:text-red-700"
                  data-testid={`remove-project-${index}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Project Name"
                value={proj.name}
                onChange={(e) => updateArrayItem('projects', index, 'name', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <textarea
                placeholder="Description"
                value={proj.description}
                onChange={(e) => updateArrayItem('projects', index, 'description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
              <input
                type="text"
                placeholder="Technologies (comma-separated)"
                value={proj.technologies.join(', ')}
                onChange={(e) =>
                  updateArrayItem(
                    'projects',
                    index,
                    'technologies',
                    e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                  )
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="url"
                placeholder="Project Link (optional)"
                value={proj.link}
                onChange={(e) => updateArrayItem('projects', index, 'link', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {activeSection === 'certifications' && (
        <div className="space-y-4" data-testid="certifications-section">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 font-primary">Certifications</h3>
            <button
              onClick={() =>
                addArrayItem('certifications', {
                  id: Date.now().toString(),
                  name: '',
                  issuer: '',
                  date: '',
                  credential_id: '',
                })
              }
              className="flex items-center space-x-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
              data-testid="add-certification-button"
            >
              <Plus className="w-4 h-4" />
              <span>Add Certification</span>
            </button>
          </div>

          {resumeData.certifications.map((cert, index) => (
            <div key={cert.id} className="bg-white rounded-lg border border-slate-200 p-6 space-y-4" data-testid={`certification-item-${index}`}>
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-900">Certification #{index + 1}</h4>
                <button
                  onClick={() => removeArrayItem('certifications', index)}
                  className="text-red-600 hover:text-red-700"
                  data-testid={`remove-certification-${index}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Certification Name"
                value={cert.name}
                onChange={(e) => updateArrayItem('certifications', index, 'name', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="Issuing Organization"
                value={cert.issuer}
                onChange={(e) => updateArrayItem('certifications', index, 'issuer', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Date (e.g., Jan 2023)"
                  value={cert.date}
                  onChange={(e) => updateArrayItem('certifications', index, 'date', e.target.value)}
                  className="px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Credential ID (optional)"
                  value={cert.credential_id}
                  onChange={(e) => updateArrayItem('certifications', index, 'credential_id', e.target.value)}
                  className="px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Selection */}
      {activeSection === 'template' && (
        <div className="space-y-4" data-testid="template-section">
          <h3 className="text-lg font-semibold text-slate-900 font-primary">Choose Template</h3>
          <div className="grid grid-cols-1 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => setResumeData({ ...resumeData, template_id: template.id })}
                className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  resumeData.template_id === template.id
                    ? 'border-accent bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                data-testid={`template-${template.id}`}
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={template.preview_image}
                    alt={template.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">{template.name}</h4>
                    <p className="text-sm text-slate-600 mb-2">{template.description}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded">{template.industry}</span>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded">{template.experience_level}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeForm;
