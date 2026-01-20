import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { resumeAPI, templateAPI } from '../lib/api';
import { ArrowLeft, Save, Download, Eye, BarChart } from 'lucide-react';
import { toast } from 'sonner';
import ResumeForm from '../components/ResumeForm';
import ResumePreview from '../components/ResumePreview';
import ATSPanel from '../components/ATSPanel';

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState({
    title: 'My Resume',
    template_id: 'ats-tech',
    personal_info: {
      full_name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      portfolio: '',
    },
    professional_summary: '',
    skills: [],
    work_experience: [],
    education: [],
    projects: [],
    certifications: [],
  });
  const [templates, setTemplates] = useState([]);
  const [atsScore, setAtsScore] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showATS, setShowATS] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTemplates();
    if (id) {
      fetchResume();
    }
  }, [user, id, navigate]);

  const fetchTemplates = async () => {
    try {
      const response = await templateAPI.getAll();
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to load templates');
    }
  };

  const fetchResume = async () => {
    try {
      const response = await resumeAPI.getOne(id);
      setResumeData(response.data);
      fetchATSScore(id);
    } catch (error) {
      toast.error('Failed to load resume');
      navigate('/dashboard');
    }
  };

  const fetchATSScore = async (resumeId) => {
    try {
      const response = await resumeAPI.getATSScore(resumeId);
      setAtsScore(response.data);
    } catch (error) {
      console.error('Failed to load ATS score');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id) {
        const response = await resumeAPI.update(id, resumeData);
        setResumeData(response.data);
        fetchATSScore(id);
        toast.success('Resume updated successfully');
      } else {
        const response = await resumeAPI.create(resumeData);
        toast.success('Resume created successfully');
        navigate(`/builder/${response.data.id}`, { replace: true });
      }
    } catch (error) {
      toast.error('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (!id) {
      toast.error('Please save the resume first');
      return;
    }
    try {
      const response = await resumeAPI.exportPDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${resumeData.title.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between" data-testid="builder-header">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 text-slate-600 hover:text-primary transition-colors"
            data-testid="back-to-dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <div className="h-6 w-px bg-slate-300"></div>
          <input
            type="text"
            value={resumeData.title}
            onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
            className="text-xl font-semibold text-slate-900 bg-transparent border-none outline-none focus:ring-0 font-primary"
            data-testid="resume-title-input"
          />
        </div>
        <div className="flex items-center space-x-3">
          {atsScore && (
            <button
              onClick={() => setShowATS(!showATS)}
              className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-md hover:bg-slate-50 transition-all"
              data-testid="toggle-ats-panel"
            >
              <BarChart className="w-4 h-4" />
              <span>ATS Score: {atsScore.score}%</span>
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-2 rounded-md hover:bg-slate-800 transition-all disabled:opacity-50"
            data-testid="save-resume-button"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 bg-accent text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-all"
            data-testid="export-pdf-button"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </header>

      {/* Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Form */}
        <div className="w-full lg:w-2/5 overflow-y-auto bg-slate-50 border-r border-slate-200" data-testid="form-panel">
          <ResumeForm
            resumeData={resumeData}
            setResumeData={setResumeData}
            templates={templates}
          />
        </div>

        {/* Right Panel - Preview */}
        <div className="hidden lg:block w-3/5 overflow-y-auto bg-slate-100 p-8" data-testid="preview-panel">
          <div className="sticky top-0">
            <div className="bg-white shadow-lg rounded-lg p-8 mx-auto" style={{ maxWidth: '21cm' }}>
              <ResumePreview resumeData={resumeData} />
            </div>
          </div>
        </div>
      </div>

      {/* ATS Panel Overlay */}
      {showATS && atsScore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowATS(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <ATSPanel atsScore={atsScore} onClose={() => setShowATS(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;
