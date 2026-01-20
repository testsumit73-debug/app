import React from 'react';
import { X, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

const ATSPanel = ({ atsScore, onClose }) => {
  const getScoreColor = (score) => {
    if (score >= 85) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-red-600';
  };

  const getScoreIcon = (score) => {
    if (score >= 85) return <CheckCircle className="w-12 h-12 text-success" />;
    if (score >= 70) return <TrendingUp className="w-12 h-12 text-warning" />;
    return <AlertCircle className="w-12 h-12 text-red-600" />;
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="p-8" data-testid="ats-panel">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 font-primary">ATS Score Analysis</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-md transition-all"
          data-testid="close-ats-panel"
        >
          <X className="w-6 h-6 text-slate-600" />
        </button>
      </div>

      {/* Score Display */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8 mb-6 text-center">
        <div className="flex justify-center mb-4">{getScoreIcon(atsScore.score)}</div>
        <div className={`text-6xl font-bold mb-2 ${getScoreColor(atsScore.score)}`} data-testid="ats-score-value">
          {atsScore.score}%
        </div>
        <p className="text-lg text-slate-600 font-medium">{getScoreLabel(atsScore.score)}</p>
      </div>

      {/* Suggestions */}
      {atsScore.suggestions && atsScore.suggestions.length > 0 && (
        <div className="mb-6" data-testid="ats-suggestions">
          <h3 className="text-lg font-semibold text-slate-900 mb-3 font-primary">Suggestions</h3>
          <ul className="space-y-3">
            {atsScore.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-3" data-testid={`suggestion-${index}`}>
                <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                  <CheckCircle className="w-4 h-4 text-accent" />
                </div>
                <span className="text-slate-700 flex-1">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Keywords */}
      {atsScore.missing_keywords && atsScore.missing_keywords.length > 0 && (
        <div data-testid="missing-keywords">
          <h3 className="text-lg font-semibold text-slate-900 mb-3 font-primary">Consider Adding</h3>
          <div className="flex flex-wrap gap-2">
            {atsScore.missing_keywords.map((keyword, index) => (
              <span
                key={index}
                className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm"
                data-testid={`keyword-${index}`}
              >
                {keyword}
              </span>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-3">
            These keywords are commonly found in similar resumes and job postings.
          </p>
        </div>
      )}
    </div>
  );
};

export default ATSPanel;
