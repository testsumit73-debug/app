import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Zap, Download, BarChart, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <FileText className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary font-primary">CareerForge</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-slate-600 hover:text-primary font-medium transition-colors" data-testid="nav-login-link">
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-primary text-white px-6 py-2.5 rounded-md font-medium hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              data-testid="nav-signup-link"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-slate-900 mb-6 font-primary" data-testid="hero-title">
                Build Your
                <span className="block text-accent">Perfect Resume</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
                Create ATS-optimized resumes that get you noticed. Professional templates, real-time preview, and instant PDF export.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="bg-slate-900 text-white px-8 py-4 rounded-md font-medium hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                  data-testid="hero-cta-button"
                >
                  <span>Start Building Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/templates"
                  className="bg-white text-slate-900 border-2 border-slate-200 px-8 py-4 rounded-md font-medium hover:bg-slate-50 transition-all flex items-center justify-center"
                  data-testid="hero-templates-link"
                >
                  View Templates
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <img
                src="https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Resume Builder"
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">ATS Score: 95%</p>
                    <p className="text-sm text-slate-600">Excellent!</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 font-primary">Why CareerForge?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to create a professional, ATS-optimized resume in minutes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-white border border-slate-100 rounded-2xl p-8 hover:border-slate-200 transition-all duration-300 group"
              data-testid="feature-ats"
            >
              <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
                <BarChart className="w-7 h-7 text-accent group-hover:text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3 font-primary">ATS-Optimized</h3>
              <p className="text-slate-600 leading-relaxed">
                Get real-time ATS scores and suggestions to ensure your resume passes Applicant Tracking Systems.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="bg-white border border-slate-100 rounded-2xl p-8 hover:border-slate-200 transition-all duration-300 group"
              data-testid="feature-templates"
            >
              <div className="bg-purple-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
                <FileText className="w-7 h-7 text-purple-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3 font-primary">Professional Templates</h3>
              <p className="text-slate-600 leading-relaxed">
                Choose from multiple industry-specific templates designed by recruitment experts.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="bg-white border border-slate-100 rounded-2xl p-8 hover:border-slate-200 transition-all duration-300 group"
              data-testid="feature-export"
            >
              <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
                <Download className="w-7 h-7 text-success group-hover:text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3 font-primary">Instant Export</h3>
              <p className="text-slate-600 leading-relaxed">
                Download your resume as a professional PDF with one click. Print-ready and recruiter-friendly.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="bg-white border border-slate-100 rounded-2xl p-8 hover:border-slate-200 transition-all duration-300 group"
              data-testid="feature-realtime"
            >
              <div className="bg-yellow-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
                <Zap className="w-7 h-7 text-warning group-hover:text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3 font-primary">Real-time Preview</h3>
              <p className="text-slate-600 leading-relaxed">
                See your changes instantly with live preview. What you see is what you get.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="bg-white border border-slate-100 rounded-2xl p-8 hover:border-slate-200 transition-all duration-300 group"
              data-testid="feature-save"
            >
              <div className="bg-indigo-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
                <FileText className="w-7 h-7 text-indigo-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3 font-primary">Save & Manage</h3>
              <p className="text-slate-600 leading-relaxed">
                Create multiple resumes for different roles. Edit, duplicate, and manage them easily.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="bg-white border border-slate-100 rounded-2xl p-8 hover:border-slate-200 transition-all duration-300 group"
              data-testid="feature-keywords"
            >
              <div className="bg-red-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
                <CheckCircle className="w-7 h-7 text-red-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3 font-primary">Keyword Analysis</h3>
              <p className="text-slate-600 leading-relaxed">
                Identify missing keywords and get suggestions to improve your resume for specific roles.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-primary" data-testid="cta-title">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl text-slate-600 mb-10">
            Join thousands of job seekers who've created winning resumes with CareerForge.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center space-x-2 bg-slate-900 text-white px-10 py-4 rounded-md font-medium hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            data-testid="cta-button"
          >
            <span>Create Your Resume Now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FileText className="w-6 h-6" />
            <span className="text-xl font-bold font-primary">CareerForge</span>
          </div>
          <p className="text-slate-400">
            © 2025 CareerForge. Build your future, one resume at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
