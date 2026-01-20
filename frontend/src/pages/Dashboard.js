import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { resumeAPI } from '../lib/api';
import { FileText, Plus, Edit2, Copy, Trash2, Download, LogOut, BarChart } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchResumes();
  }, [user, navigate]);

  const fetchResumes = async () => {
    try {
      const response = await resumeAPI.getAll();
      setResumes(response.data);
    } catch (error) {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;

    try {
      await resumeAPI.delete(id);
      toast.success('Resume deleted successfully');
      fetchResumes();
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await resumeAPI.duplicate(id);
      toast.success('Resume duplicated successfully');
      fetchResumes();
    } catch (error) {
      toast.error('Failed to duplicate resume');
    }
  };

  const handleExport = async (id, title) => {
    try {
      const response = await resumeAPI.exportPDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-success bg-green-100';
    if (score >= 70) return 'text-warning bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-primary font-primary">CareerForge</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-slate-600" data-testid="user-name">Welcome, {user?.full_name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-slate-600 hover:text-primary transition-colors"
                data-testid="logout-button"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 font-primary" data-testid="dashboard-title">My Resumes</h1>
            <p className="text-slate-600">Manage and edit your resumes</p>
          </div>
          <Link
            to="/builder"
            className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-md font-medium hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            data-testid="create-resume-button"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Resume</span>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-slate-600 mt-4">Loading resumes...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center" data-testid="empty-state">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No resumes yet</h3>
            <p className="text-slate-600 mb-6">Get started by creating your first resume</p>
            <Link
              to="/builder"
              className="inline-flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-md font-medium hover:bg-slate-800 transition-all"
              data-testid="empty-create-button"
            >
              <Plus className="w-5 h-5" />
              <span>Create Resume</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="resume-grid">
            {resumes.map((resume, index) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all group"
                data-testid={`resume-card-${resume.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1 font-primary" data-testid={`resume-title-${resume.id}`}>
                      {resume.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Updated {new Date(resume.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getScoreColor(resume.ats_score)}`} data-testid={`resume-score-${resume.id}`}>
                    <BarChart className="w-4 h-4" />
                    <span>{resume.ats_score}%</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">{resume.personal_info?.full_name || 'N/A'}</span>
                  </div>
                  <div className="text-sm text-slate-500">
                    {resume.work_experience?.length || 0} Experience • {resume.education?.length || 0} Education
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/builder/${resume.id}`}
                    className="flex-1 flex items-center justify-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-all text-sm font-medium"
                    data-testid={`edit-resume-${resume.id}`}
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={() => handleExport(resume.id, resume.title)}
                    className="p-2 border border-slate-200 rounded-md hover:bg-slate-50 transition-all"
                    title="Download PDF"
                    data-testid={`export-resume-${resume.id}`}
                  >
                    <Download className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(resume.id)}
                    className="p-2 border border-slate-200 rounded-md hover:bg-slate-50 transition-all"
                    title="Duplicate"
                    data-testid={`duplicate-resume-${resume.id}`}
                  >
                    <Copy className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="p-2 border border-slate-200 rounded-md hover:bg-red-50 transition-all"
                    title="Delete"
                    data-testid={`delete-resume-${resume.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
